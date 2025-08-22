import { createContext } from "react";
import type { User } from "@/types";


// Describes the shape of the context value
interface AuthContextType {
    user: User | null;
    login: (params: LoginParams) => Promise<void>;
    logout: () => void;
    // You might also want to expose loading and error states
    loading: boolean;
    error: string | null;
}

// Describes the props for the login function
interface LoginParams {
    username: string;
    password: string;
}

// We provide a default value that matches the context type.
// The functions are just empty placeholders in the default value.
export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => {},
    logout: () => {},
    loading: true,
    error: null,
});