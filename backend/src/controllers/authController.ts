import { type Request, type Response } from "express";
import crypto from "crypto";
import { User } from "../Modals/userSchema.js";
import { RefreshToken } from "../Modals/refreshTokenSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../common/errors/appError.js";
import { UserRole } from "../common/constants/roles.js";
import type { ChangePasswordInput, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "../validations/authValidation.js";
import { redisClient } from "../config/redis.js";
import { Resend } from "resend";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_PASSWORD_TTL_SECONDS = 15 * 60

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  
  const { username, email, password, role } = req.body;
  const t0 = performance.now();
  const existingUser = await User.findOne({ email });
  const t1 = performance.now();
  if (existingUser) {
    throw new AppError("User Already Exists", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
   const t2 = performance.now();
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role && Object.values(UserRole).includes(role) ? role : UserRole.BUYER,
  });

  const t3 = performance.now();

  const payload = { id: newUser._id, role: newUser.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

  const t4 = performance.now();
  
  await RefreshToken.create({
    user: newUser._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  const t5 = performance.now();

  console.log(`findOne: ${(t1-t0).toFixed(1)}ms | bcrypt: ${(t2-t1).toFixed(1)}ms | create user: ${(t3-t2).toFixed(1)}ms | jwt: ${(t4-t3).toFixed(1)}ms | create token: ${(t5-t4).toFixed(1)}ms | total: ${(t5-t0).toFixed(1)}ms`);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
 
  res.status(201).json({
    success: true,
    message: "User registered successfully!",
    data: {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      accessToken,
    },
  });
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload = { id: user._id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  res.status(200).json({
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
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh Token missing. Please log in again", 401);
  }

  let decoded: { id: string; role: string };
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as typeof decoded;
  } catch (error){
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }

  const storedToken = await RefreshToken.findOne({
    user: decoded.id,
    tokenHash: hashToken(refreshToken),
    revoked: false,
  });

  if (!storedToken) {
    throw new AppError("Refresh token has been revoked. Please log in again", 403);
  }

  const newAccessToken = jwt.sign(
    { id: decoded.id, role: decoded.role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revoked: true });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async(req: Request<{},{},ForgotPasswordInput>, res: Response) => {
  const {email} = req.body;

  if(!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({email});

  if(!user) {
    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent."
    })
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(resetToken);
  const redisKey = `password_reset:${hashedToken}`;

  await redisClient.setEx(redisKey, RESET_PASSWORD_TTL_SECONDS, user._id.toString());

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const {error} = await resend.emails.send({
    from,
    to: [email],  
    subject: "Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to set a new password. This link will expire in 15 minutes.</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send Password reset email.", error);
  }

  res.status(200).json({
    success: "true",
    message: "Password reset link has been sent."
  });
}

export const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
  const {token, newPassword} = req.body;

  if(!token || !newPassword) {
    throw new AppError("Token and Password are required",400);
  }

  const hashedToken = hashToken(token);
  const redisKey = `password_reset:${hashedToken}`;

  const userId = await redisClient.getDel(redisKey);

  if (!userId) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  const user = await User.findById(userId);
  if(!user) {
    throw new AppError("User no longer exists", 404);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();


  await RefreshToken.deleteMany({ user: userId });

  return res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
}

export const changePassword = async (req:Request<{}, {}, ChangePasswordInput>, res: Response) => {
  const {currentPassword, newPassword} = req.body;

  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized. Please log in", 401);
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if(!isPasswordValid) {
    throw new AppError("Incorrect password",400);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  await RefreshToken.deleteMany({user: userId});

  return res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again."
  })
}