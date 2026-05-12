import { useState, useCallback } from 'react';
import axios from 'axios';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)

    const execute = useCallback(async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
        setLoading(true);
        setError(null)

        try {
            const config = {
                url: `http://localhost:5000/api${endpoint}`,
                method,
                headers: { ...customHeaders }
            };

            if (body) {
                config.data = body;
                config.headers['Content-Type'] = 'application/json';
            }

            const response = await axios(config);
            
            setLoading(false)
            return { data: response.data, error: null }
        } catch (e) {
            const errMessage = e.response?.data?.message || "An unexpected error occurred";
            setError(errMessage)
            setLoading(false)
            return { data: null, error: errMessage }
        }
    }, [])
    return { loading, error, execute };
}
export default useApi;