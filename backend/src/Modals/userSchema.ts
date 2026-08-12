import { Schema, model, Document } from "mongoose";
import { UserRole } from "../common/constants/roles.js";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser> (
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minLength: [3, 'Username must be atleast 3 characters'],
            maxLength: [30, 'Username cannot exceed 30 characters']
        },
        email:{
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address',
            ],
        },      
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false, // Prevents returning the hashed password in queries by default
            },
        role: {
            type: String,
            enum: {
                values: Object.values(UserRole),
                message: `{VALUE} is not a valid userRole`
            },
            default: UserRole.BUYER,
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
)

export const User = model<IUser>('User', userSchema);