/**
 * This file shows an example of adding the individual API
 * calls for a customer's API that the UI would need to call
 * via this Node.js app. The Node.js app acts as a proxy between
 * our UI and the customer's API service.
 *
 * Note that in this example the access token required to call the
 * customer's API comes from signed cookies, some customers might
 * prefer that we store the corresponding access token in some sort
 * of a DB (Redis, PostgreSQL etc.) Regardless, the idea of this
 * example is that where we end up storing the corresponding user's
 * access token, we should read it from that location and add it to
 * the `Authorization` header of the request being made to the customer's
 * API.
 */

// import https from "https";
// import express, { NextFunction, Request, Response } from "express";

// const baseUrl = "https://api.vimeo.com";
// const vimeoApiRouter = express.Router();

// function getVimeoRequestOptions(
//     req: Request,
//     method = "GET"
// ): https.RequestOptions {
//     const accessToken = req.signedCookies["vimeo_access_token"];
//     return {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": req.headers["content-type"] || "application/json",
//         },
//         method,
//     };
// }

// vimeoApiRouter.use((req: Request, res: Response, next: NextFunction) => {
//     if (!req.signedCookies["vimeo_access_token"]) {
//         res.status(401).send();
//         return;
//     }

//     next();
// });

// function doGet(urlPath: string, req: Request, res: Response) {
//     https.get(
//         `${baseUrl}${urlPath}`,
//         getVimeoRequestOptions(req),
//         (httpsResp) => {
//             res.setHeader(
//                 "Content-Type",
//                 httpsResp.headers["content-type"] || "application/json"
//             );
//             res.status(httpsResp.statusCode || 200);
//             httpsResp.pipe(res);
//         }
//     );
// }

// function doPatch(urlPath: string, req: Request, res: Response) {
//     const request = https.request(
//         `${baseUrl}${urlPath}`,
//         { ...getVimeoRequestOptions(req, "PATCH") },
//         (httpsResp) => {
//             res.setHeader(
//                 "Content-Type",
//                 httpsResp.headers["content-type"] || "application/json"
//             );
//             res.status(httpsResp.statusCode || 200);
//             httpsResp.pipe(res);
//         }
//     );

//     // Write the original request body to the API.
//     console.log("writing body", JSON.stringify(req.body));
//     request.write(JSON.stringify(req.body), "utf-8");
//     request.end();
// }

// function getSerializedQueryString(req: Request): string {
//     const query = new URLSearchParams(req.query as Record<string, string>);
//     return query.toString();
// }

// vimeoApiRouter.get("/user/me", (req: Request, res: Response) => {
//     const query = getSerializedQueryString(req);
//     doGet(`/me?${query}`, req, res);
// });

// vimeoApiRouter.patch("/videos/:videoId", (req: Request, res: Response) => {
//     const videoId = req.params.videoId;
//     const query = getSerializedQueryString(req);
//     doPatch(`/videos/${videoId}?${query}`, req, res);
// });

// export default vimeoApiRouter;
