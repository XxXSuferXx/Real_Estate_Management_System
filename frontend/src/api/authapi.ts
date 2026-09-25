import axios from "axios";
import type { LoginRequest, LoginResponse } from "../types/auth";

const apiUrl = import.meta.env.VITE_API_URL;

export const Login = async (email: string, password: string): Promise<LoginResponse| null> => {
    try {
        const response = await axios.post<LoginResponse>(`${apiUrl}/api/v1/auth/login`, {
            email,
            password
        } satisfies LoginRequest);
        console.log(response.data); {/* TEST */}
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
}