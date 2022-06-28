import { Config } from "app";

const defaultPort = 8080;

function getEnvVar(
    envVar: string,
    required: boolean = true,
    defaultValue?: string
): string {
    const value = process.env[envVar];
    if (!value && required) {
        throw new Error(`${envVar} is required`);
    }

    return value || defaultValue || "";
}

export function isDev(): boolean {
    return process.env.NODE_ENV === "development";
}

export function getAppPort(): number {
    const port = process.env.PORT;
    if (!port) {
        return defaultPort;
    }

    return parseInt(port, 10);
}

export function getAppConfig(): Config {
    return {
        //cookieSecret: getEnvVar("COOKIE_SECRET_KEY"), // cmd bcoz not in use
        cookieSecret:'test',
        //jwtSecret: getEnvVar("JWT_SECRET"), //cmd for using hardcore configs
        jwtSecret:'-kY0UKlSDGs4d5CTMxkVICOqHSNXMNWUz-r9781bWwxqZreu3p60FhDm9xDlXGyHnPmI0APeR_BcAeSCHsW651aD0sw12W1byd3ANeTXrDsydglHp_8eqsR-D3iBpst941wLRZSQwB-kr6LsW1ClFiryqwLylmBTLI47eby4QToPtzFtUVPpmeY-lkivbcCPjoyCVis_IwLqk9bdp0eNs5DDOestzwoSvdTNC4WkNNTvSWqJZkZ6wBVrRF1y8w2',
        redirectUiToLocalhost:
            getEnvVar("REDIRECT_UI_TO_LOCALHOST", false, "false") === "true"
                ? true
                : false,
        //selfDomain: getEnvVar("SELF_DOMAIN", false, "http://localhost:8080"),
        selfDomain:"http://localhost:8080",
        sfmcClientId:'1jtclbnl6y9vwaeknoi0nd3z',
        sfmcClientSecret:'t4Mac19wv76bXTFViON1a8Yr',
        sfmcDefaultTenantSubdomain:'mc4f63jqqhfc51yw6d1h0n1ns1-m',
        //Hari 20.05.22 cmd for using hardcore configs
        // sfmcClientId: getEnvVar("SFMC_CLIENT_ID"),
        // sfmcClientSecret: getEnvVar("SFMC_CLIENT_SECRET"),
        // sfmcDefaultTenantSubdomain: getEnvVar(
        //     "SFMC_DEFAULT_TENANT_SUBDOMAIN",
        //     false,
        //     "mcftllc2rwg-b3-r6878b77j8gv4"
        // ),
        vimeoAuthorizationUrl:'',
        vimeoClientId:'',
        vimeoClientSecret: '',
        vimeoTokenUrl:''
        // vimeoAuthorizationUrl: getEnvVar(
        //     "VIMEO_AUTHORIZATION_URL",
        //     false,
        //     "https://api.vimeo.com/oauth/authorize"
        // ),
        // vimeoClientId: getEnvVar("VIMEO_CLIENT_ID"),
        // vimeoClientSecret: getEnvVar("VIMEO_CLIENT_SECRET"),
        // vimeoTokenUrl: getEnvVar(
        //     "VIMEO_TOKEN_URL",
        //     false,
        //     "https://api.vimeo.com/oauth/access_token"
        // ),
    };
}
