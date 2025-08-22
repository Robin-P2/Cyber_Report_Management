import React, { useState, useEffect } from "react";
import axios from 'axios';
import { AuthContext } from "./AuthContext";
import { api } from "@/utils/api";
import type { User } from "@/types";

// Describes the data you expect from your login endpoint
interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

// Describes the props for the login function
interface LoginParams {
    username: string;
    password: string;
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // To check auth status on initial load
    const [error, setError] = useState<string | null>(null);

    //logout function
    const logout = () => {
        // 1. Clear user state
        setUser(null);

        // 2. Remove tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // 3. Remove default auth header
        delete axios.defaults.headers.common['Authorization'];
    };

    // This effect runs once when the component mounts
    useEffect(() => {
        // --- Setup Event Listener for Logout ---
        // The API interceptor will dispatch this event if the refresh token fails.
        window.addEventListener('logout', logout);

        // --- Initialize Auth State ---
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                try {
                    const userProfileResponse = await api.get('/user/profile/');
                    setUser(userProfileResponse.data);
                } catch (e) {
                    // The interceptor will handle 401s and trigger the 'logout' event if needed.
                    console.error("Failed to initialize auth:", e);
                }
            }
            setLoading(false);
        };

        initializeAuth();

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('logout', logout);
        };
    }, []);

    // --- Login Function ---
    const login = async ({ username, password }: LoginParams) => {
        console.log("IN LOGIN")
        setError(null); // Reset errors
        try {
            const response = await api.post<AuthResponse>('/user/token/', { username, password });
            
            const { access, refresh, user: userData } = response.data;
            // 1. Store tokens in localStorage (or HttpOnly cookies for more security)
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            console.log(`USER: ${userData}`)
            // 2. Set the user state
            setUser(userData);
            
            // Optional: Set the default auth header for all subsequent axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

        } catch (err) {
            console.error("Login failed:", err);
            // Handle login errors (e.g., show a message to the user)
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail || "Invalid username or password.");
            } else {
                setError("An unexpected error occurred.");
            }
            throw err;
        }
    };

    // The value provided to consuming components
    const value = {
        user,
        login,
        logout,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
