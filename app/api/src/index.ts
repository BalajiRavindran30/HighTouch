import https from "https";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import express, { NextFunction, Request, Response } from "express";

import axios from "axios";
import jwt from "jsonwebtoken";

// Middleware
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import csurf from "csurf";
import ejs from "ejs";
import morgan from "morgan";

import { AccessTokenResponse } from "sfmc";

import { getAppConfig, getAppPort, isDev } from "./config";
import {
    getCookieOptions,
    ONE_HOUR_IN_SECONDS,
    TWENTY_MINS_IN_SECONDS
} from "./cookies";
import { clientErrorHandler, errorHandler } from "./errors";

// These are commented out because the code that uses
// these imports are also commented out below and only
// exist to demonstrate how to structure the app.
//
// import vimeoApiRouter from "./vimeoApi";
// import { VimeoAccessTokenResponse } from "vimeo";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Make sure we initialize the app config from the env vars
// as early as possible.
const appConfig = getAppConfig();
const sfmcOAuthCallbackPath = "/oauth2/sfmc/callback";

// The API path where the customer's OAuth service should
// redirect the user to with the authorization code.
// const vimeoOAuthCallbackPath = "/oauth2/vimeo/callback";

const defaultAxiosClient = axios.create();

const app = express();
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
// Set the EJS `renderFile` function as the view render
// function for HTML files. This allows us to use EJS
// inside files with the .html extension instead of .ejs.
app.engine("html", ejs.renderFile);

// Add the request logging middleware.
// Use the `dev` predefined format for local development purposes
// so that we get colored log output, but for all other times
// use the `common` format which following the Apache log
// format.
app.use(morgan(isDev() ? "dev" : "common"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    bodyParser.json({
        type: [
            "application/json",
            "application/vnd.vimeo.video",
            "application/vnd.vimeo.video+json",
        ],
    })
);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                frameAncestors: [
                    "https://*.exacttarget.com",
                    "https://*.marketingcloudapps.com",
                ],
                connectSrc: [
                    "'self'",
                    "https://*.marketingcloudapis.com/",
                    "https://api.vimeo.com/",
                ],
            },
        },
    })
);

app.use(cookieParser(appConfig.cookieSecret));

app.use(
    csurf({
        cookie: {
            httpOnly: true,
            sameSite: "none",
            secure: !isDev(),
            signed: true,
        },
        value: (req) => req.signedCookies["XSRF-Token"],
    })
);

app.use("/assets", express.static(join(__dirname, "dist/ui")));

// Setup the error handling middlewares last.
app.use(clientErrorHandler);
app.use(errorHandler);

app.get(
    "/oauth2/sfmc/authorize",
    async (_req: Request, res: Response, next: NextFunction) => {
        const authUrl = new URL(
            `https://${appConfig.sfmcDefaultTenantSubdomain}.auth.marketingcloudapis.com/v2/authorize`
        );
        authUrl.searchParams.append("client_id", appConfig.sfmcClientId);
        authUrl.searchParams.append(
            "redirect_uri",
            `${appConfig.selfDomain}${sfmcOAuthCallbackPath}`
        );
        authUrl.searchParams.append("response_type", "code");

        try {
            // Generate a signed string that can be validated in the callback.
            const state = jwt.sign({}, appConfig.jwtSecret, {
                expiresIn: "10m",
            });
            authUrl.searchParams.append("state", state);

            res.redirect(authUrl.toString());
            return;
        } catch (err) {
            console.error("Failed to create a signed JWT. ", err);
        }

        next(
            new Error(
                "An error occurred while generating the authorization URL."
            )
        );
    }
);

async function verifyOAuth2Callback(
    req: Request,
    next: NextFunction
): Promise<string | undefined> {
    const code = req.query.code as string;
    console.log("Code:::",code);
    if (!code) {
        console.error("SFMC OAuth callback didn't have the code query-param");
        next(new Error("invalid_request: Missing code param"));
        return;
    }

    const state = req.query.state as string;
    if (!state) {
        console.error("SFMC OAuth callback didn't have the state query-param");
        next(new Error("invalid_request: Missing state param"));
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            jwt.verify(
                state as string,
                appConfig.jwtSecret,
                {
                    algorithms: ["HS256"],
                },
                (err, decoded) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(decoded);
                }
            );
        });
    } catch (err) {
        console.error("Unable to verify the state param.", err);
        next(new Error("invalid_request: Invalid state param"));
        return;
    }

    return code;
}

app.get(
    sfmcOAuthCallbackPath,
    async (req: Request, res: Response, next: NextFunction) => {
        const code = await verifyOAuth2Callback(req, next);
        const tssd = req.query.tssd || appConfig.sfmcDefaultTenantSubdomain;
        const resp = await defaultAxiosClient.post<AccessTokenResponse>(
            `https://${tssd}.auth.marketingcloudapis.com/v2/token`,
            {
                grant_type: "authorization_code",
                code,
                client_id: appConfig.sfmcClientId,
                client_secret: appConfig.sfmcClientSecret,
                redirect_uri: `${appConfig.selfDomain}${sfmcOAuthCallbackPath}`,
            }
        );
        console.log("Response:",resp.data)
        const accessTokenResp = resp.data;
        res.cookie(
            "sfmc_access_token",
            accessTokenResp.access_token,
            getCookieOptions(TWENTY_MINS_IN_SECONDS)
        );
        res.cookie(
            "sfmc_refresh_token",
            accessTokenResp.refresh_token,
            getCookieOptions(ONE_HOUR_IN_SECONDS)
        );

        res.cookie("sfmc_tssd", tssd, getCookieOptions(TWENTY_MINS_IN_SECONDS));

        res.redirect("/");
    }
);

app.post(
    "/oauth2/sfmc/refresh_token",
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("Request::",JSON.stringify(req))
        if (
            !req.signedCookies["sfmc_tssd"] ||
            !req.signedCookies["sfmc_refresh_token"]
        ) {
            res.status(401).send();
            return;
        }

        const tssd = req.signedCookies["sfmc_tssd"];
        const refreshToken = req.signedCookies["sfmc_refresh_token"];

        try {
            const resp = await defaultAxiosClient.post<AccessTokenResponse>(
                `https://${tssd}.auth.marketingcloudapis.com/v2/token`,
                {
                    grant_type: "refresh_token",
                    client_id: appConfig.sfmcClientId,
                    client_secret: appConfig.sfmcClientSecret,
                    refresh_token: refreshToken,
                }
            );
            console.log('Respo::',resp)
            const accessTokenResp = resp.data;
            res.cookie(
                "sfmc_access_token",
                accessTokenResp.access_token,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_tssd",
                tssd,
                getCookieOptions(TWENTY_MINS_IN_SECONDS)
            );
            res.cookie(
                "sfmc_refresh_token",
                accessTokenResp.refresh_token,
                getCookieOptions(ONE_HOUR_IN_SECONDS)
            );

            res.status(200).send();
        } catch (err: any) {
            if (
                err.response?.data &&
                err.response.data.error === "invalid_token"
            ) {
                console.error(err.response.data);
                res.status(401).send();
                return;
            }
            console.error("Failed to refresh SFMC token", err);
            next(err);
        }
    }
);

// The following is an example of adding OAuth2 user authorization
// flow for a customer's OAuth2.0 server. The below example
// demonstrates it for Vimeo's API.
//
// const vimeoScopes = ["public", "private", "edit"].join(" ");
// app.get("/oauth2/vimeo/authorize", (_req: Request, res: Response) => {
//     // Generate a signed string that can be validated in the callback.
//     const state = jwt.sign({}, appConfig.jwtSecret, {
//         expiresIn: "10m",
//     });
//     const authUrl = `${
//         appConfig.vimeoAuthorizationUrl
//     }?response_type=code&client_id=${appConfig.vimeoClientId}&redirect_uri=${
//         appConfig.selfDomain
//     }${vimeoOAuthCallbackPath}&state=${state}&scope=${encodeURIComponent(
//         vimeoScopes
//     )}`;

//     res.redirect(authUrl);
// });
// app.get(
//     vimeoOAuthCallbackPath,
//     async (req: Request, res: Response, next: NextFunction) => {
//         const code = await verifyOAuth2Callback(req, next);

//         try {
//             const auth = `${appConfig.vimeoClientId}:${appConfig.vimeoClientSecret}`;
//             const resp =
//                 await defaultAxiosClient.post<VimeoAccessTokenResponse>(
//                     appConfig.vimeoTokenUrl,
//                     {
//                         code,
//                         grant_type: "authorization_code",
//                         redirect_uri: `${appConfig.selfDomain}${vimeoOAuthCallbackPath}`,
//                     },
//                     {
//                         headers: {
//                             Authorization: `basic ${Buffer.from(auth).toString(
//                                 "base64"
//                             )}`,
//                             "Content-Type": "application/json",
//                             Accept: "application/vnd.vimeo.*+json;version=3.4",
//                         },
//                     }
//                 );

//             res.cookie(
//                 "vimeo_access_token",
//                 resp.data.access_token,
//                 getCookieOptions(TWO_WEEKS_IN_SECONDS)
//             );
//             res.redirect("/");
//         } catch (err) {
//             console.error("Failed to fetch Vimeo access token", err);
//             next(new Error("Failed to fetch the access token from Vimeo"));
//         }
//     }
// );

/**
 * Finally, to allow this Node.js app to proxy all calls to the customers
 * APIs from the React app UI, we should add the endpoints in a separate file
 * This follows Express.js' best practices for modularing the API routes that
 * this app supports.
 *
 * To call these endpoints, the UI would simple need to make a request (using axios
 * or something) to the `/api/vimeo/<whatever endpoint is defined in `vimeoApi.ts`>.
 */
// app.use("/api/vimeo", vimeoApiRouter);

app.get("/oauth2/error", (req: Request, _res: Response, next: NextFunction) => {
    console.error(
        "Redirected to /oauth2/error while handling:",
        req.headers.referer
    );
    // Call the next() method with an error and let the error handler middleware
    // take care of writing the error response.
    next(new Error());
});

app.get("/logout", (_req: Request, res: Response) => {
    res.clearCookie("sfmc_access_token");
    res.clearCookie("sfmc_refresh_token");
    res.clearCookie("vimeo_access_token");
    res.clearCookie("sfmc_tssd");
    res.clearCookie("XSRF-Token");

    res.status(200).send("You have been successfully logged out!");
});

app.get("/*", (req: Request, res: Response) => {
    let token = req.csrfToken()
    console.log("XCRF Token ::",token)
    res.cookie("XSRF-Token", req.csrfToken(), getCookieOptions());

    if (isDev() && appConfig.redirectUiToLocalhost) {
        console.log("Redirecting to localhost...");
        res.redirect("https://app.localhost:3000");
        return;
    }
    res.sendFile(join(__dirname, "ui", "index.html"));
});

const port = getAppPort();
if (isDev()) {
    console.log("Starting HTTPS server for local development");
    const options = {
        key: readFileSync(join(__dirname, "..", "localhost.key")),
        cert: readFileSync(join(__dirname, "..", "localhost.crt")),
    };
    https.createServer(options, app).listen(443);
} else {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}
