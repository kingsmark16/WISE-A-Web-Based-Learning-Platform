import { useAuth } from "@clerk/clerk-react"
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Loader } from 'lucide-react';

const AuthProvider = ({ children }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Add interceptor
        const interceptor = axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                } else {
                    delete config.headers['Authorization'];
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        setLoading(false);

        // Cleanup
        return () => {
            axiosInstance.interceptors.request.eject(interceptor);
        };
    }, [getToken]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader className="size-8 text-emerald-500 animate-spin" />
        </div>
    )

    return <>{children}</>;
}

export default AuthProvider