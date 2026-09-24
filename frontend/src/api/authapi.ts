import axios from "axios";
import type { LoginRequest, User } from "../types/auth";

const apiUrl = import.meta.env.VITE_API_URL;

export const Login = async (email: string, password: string): Promise<User| null> => {
    try {
        const response = await axios.post<User>(`${apiUrl}/v1/auth/login`, {
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