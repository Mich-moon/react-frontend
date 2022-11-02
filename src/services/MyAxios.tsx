// Service that provides an Axios instance with interceptors request and response.

import axios from 'axios'

import TokenService from './TokenService';

const axiosInstance = axios.create();


// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {

        // get JWT token from local storage
        const token = TokenService.getLocalAccessToken();

        // Add Authorization header to axios calls
        if (token) {
            if (config.headers) {
                config.headers["Authorization"] = 'Bearer ' + token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response interceptor
axiosInstance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => { // request failed

        const originalConfig = err.config; // the request data

        /*
            In case the request is failed again, and the server continue to return 401 status code,
            it may go to Infinite loop. To handle this, we use the flag '_retry' on original Request (config).
            _retry is set to true right after the first time we meet 401 status.
        */

        // if there's an error when url is not for login or register pages
        if ( originalConfig.url !== "http://localhost:8080/api/v1/auth/login" && originalConfig.url !== "http://localhost:8080/api/v1/auth/register" && err.response) {

            // Access Token has expired and this is first time we meet 401 status
            if (err.response.status === 401 && !originalConfig._retry) {

                originalConfig._retry = true;

                try {
                    // request new accessToken, sending the current refreshToken with the request
                    const rs = await axiosInstance.post("http://localhost:8080/api/v1/auth/refreshtoken", {
                        refreshToken: TokenService.getLocalRefreshToken(),
                    });

                    const { accessToken } = rs.data;
                    TokenService.updateLocalAccessToken(accessToken);
                    return axiosInstance(originalConfig);

                } catch (_error) {
                    return Promise.reject(_error);
               }
            }
        }
        return Promise.reject(err);
    }
);
export default axiosInstance;