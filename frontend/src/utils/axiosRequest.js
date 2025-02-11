// axiosInstance.js
import axios from "axios";

const api = axios.create({
    baseURL: "https://nexus-xwdr.onrender.com", // automatically prepends this URL to all requests
    //   withCredentials: true, // automatically includes credentials (like cookies) with every request
});

export default api;

// https://nexus-xwdr.onrender.com
// http://localhost:4001
