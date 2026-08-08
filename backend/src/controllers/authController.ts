import { type Request, type Response } from "express"
import { User, UserRole } from "../Modals/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    try{
       const { username, email, password, role } = req.body;

        //Validation
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
        // Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //User Creation
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role && Object.values(UserRole).includes(role) ? role : UserRole.USER
        });

        //Token Payload
        const payload = {
            id: newUser._id,
            role: newUser.role
        };

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: {
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                },
                accessToken
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

export const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if(!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token missing. Please log in again"
            });
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Invalid or expired refresh token"
                    });
                }
                
                const newAccessToken = jwt.sign(
                    { id: decoded.id, role: decoded.role },
                    process.env.ACCESS_TOKEN_SECRET as string,
                    { expiresIn: "15m" }
                );

                return res.status(200).json({
                    success: true,
                    accessToken: newAccessToken
                });
            }
        );

    } catch (error : any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email or password is missing"
            });
        };

        const user = await User.findOne({ email }).select("+password");

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const payload = { 
            id: user._id,
            role: user.role 
        };

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }

}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    })    

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}