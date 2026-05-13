import { useState, useCallback } from 'react';
import axios from 'axios';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Get the token from localStorage
            const rawToken = localStorage.getItem('token');
            
            // 2. Clean the token (remove quotes if present, as seen in your image_3b90ab.png)
            const token = rawToken ? rawToken.replace(/"/g, '') : null;

            const config = {
                url: `http://localhost:5000/api${endpoint}`,
                method,
                headers: { 
                    ...customHeaders,
                    // 3. Automatically add the Authorization header if token exists
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            };

            if (body) {
                config.data = body;
                // Axios defaults to JSON, but keeping this for safety
                config.headers['Content-Type'] = 'application/json';
            }

            const response = await axios(config);
            
            setLoading(false);
            return { data: response.data, error: null };
        } catch (e) {
            const errMessage = e.response?.data?.message || "An unexpected error occurred";
            setError(errMessage);
            setLoading(false);
            return { data: null, error: errMessage };
        }
    }, []);

    return { loading, error, execute };
}

export default useApi;