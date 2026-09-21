import axios from "axios";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
}

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-type": "application/json" },
    withCredentials: true
});

api.interceptors.request.use((config) => {
    if(accessToken) config.headers.Authorization = `Beared ${accessToken}`;
    return config;
})

export default api;