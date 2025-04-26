// Import necessary modules
import axios from "axios";
import apiHost from "./api"; // Your API base URL
import Cookies from "js-cookie"; // For handling cookies
import CryptoJS from "crypto-js"; // For decrypting tokens
import toast from "react-hot-toast"; // For displaying notifications

// Main requestApi function
const requestApi = async (method, url, data = null, params = {}) => {
    const secretKey = "your-secret-key"; // Replace with your actual secret key

    try {
        // Get encrypted token from cookies
        const encryptedToken = Cookies.get("token");
        let token = null;

        // Decrypt token if available
        if (encryptedToken) {
            token = CryptoJS.AES.decrypt(encryptedToken, secretKey).toString(CryptoJS.enc.Utf8);
        }

        // Initialize headers object
        const headers = {};

        // Only set Content-Type if data is not FormData
        if (!(data instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        // Add Authorization header if token exists
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Variable to store the response
        let response;

        // Determine the request method and make the appropriate Axios call
        switch (method) {
            case "POST":
                response = await axios.post(apiHost + url, data, { headers, params });
                break;
            case "GET":
                response = await axios.get(apiHost + url, { headers, params });
                break;
            case "PUT":
                response = await axios.put(apiHost + url, data, { headers, params });
                break;
            case "DELETE":
                response = await axios.delete(apiHost + url, { headers, params });
                break;
            default:
                throw new Error(`Unsupported request method: ${method}`);
        }

        // If no response is received, throw an error
        if (!response) {
            throw new Error("No response from the server");
        }

        // Return success and response data
        return { success: true, data: response.data };

    } catch (error) {
        // Handle errors and display a toast notification
        toast.error("Invalid Request..");
        console.error("Error in requestApi:", error);

        // Return error response for further handling
        return { success: false, error: error.response ? error.response.data : error.message };
    }
};

// Export the requestApi function
export default requestApi;
