import { type Request, type Response } from "express"
import { User } from "../Modals/userSchema.js";

export const register = async (req: Request, res: Response) => {
    try{
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const role = req.body.role;

        if(!email || !username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            res.status(409).json({
                success: false,
                message: "User Already Exists"
            })
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully!"
        })
    } catch(error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export const logout = () => {
    
}