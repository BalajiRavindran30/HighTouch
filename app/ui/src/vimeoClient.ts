import * as axios from "axios";

export const settings = {
    accessTokenCookieName: "vimeo_access_token",
    maxTokenLifetime: 14 * 24 * 60 * 60 * 1000,
};

export const client = axios.default.create({
    timeout: 20 * 1000,
});

client.interceptors.response.use(undefined, (err) => {
    if (err.response.status === 401) {
        window.location.href = "/oauth2/vimeo/authorize";
        return;
    }

    return Promise.reject(err);
});
