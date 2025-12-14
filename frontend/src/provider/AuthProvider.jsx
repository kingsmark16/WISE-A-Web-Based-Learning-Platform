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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <img 
                        src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                        alt="PSU Logo" 
                        className="relative h-24 w-24 object-contain drop-shadow-2xl"
                    />
                </div>
                
                <div className="flex flex-col items-center gap-3">
                    <div className="h-1 w-12 bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary w-full animate-[loading_1s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Initializing</p>
                </div>
            </div>
        </div>
    )

    return <>{children}</>;
}

export default AuthProvider