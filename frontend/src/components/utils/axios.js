import axios from "axios";
import apiHost from "./api"; // Your API base URL
import toast from "react-hot-toast"; // For displaying notifications

const requestApi = async (method, url, data = null, params = {}) => {
    try {
        const token = localStorage.getItem("D!"); // Directly get token from localStorage
        const headers = {};

        // Set content type unless it's a FormData
        if (!(data instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        // Attach token if available
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Make the request
        const config = { headers, params };

        let response;
        switch (method.toUpperCase()) {
            case "POST":
                response = await axios.post(apiHost + url, data, config);
                break;
            case "GET":
                response = await axios.get(apiHost + url, config);
                break;
            case "PUT":
                response = await axios.put(apiHost + url, data, config);
                break;
            case "DELETE":
                response = await axios.delete(apiHost + url, config);
                break;
            default:
                throw new Error(`Unsupported request method: ${method}`);
        }

        return { success: true, data: response.data };
    } catch (error) {
        toast.error("Invalid Request..");
        console.error("Error in requestApi:", error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export default requestApi;
