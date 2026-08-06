import { type Request, type Response } from "express"
import { User, UserRole } from "../Modals/userSchema.js";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response) => {
    try{
        console.log("started");
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const role = req.body.role;

        //Core Credentials
        if(!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(409).json({
                success: false,
                message: "User Already Exists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role && Object.values(UserRole).includes(role) ? role : UserRole.USER
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });

    } catch(error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export const signin = (req: Request, res: Response) => {

}

export const logout = () => {
    
}