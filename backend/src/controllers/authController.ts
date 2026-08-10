import { type Request, type Response } from "express";
import crypto from "crypto";
import { User, UserRole } from "../Modals/userSchema.js";
import { RefreshToken } from "../Modals/refreshTokenSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../common/errors/appError.js";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User Already Exists", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role && Object.values(UserRole).includes(role) ? role : UserRole.USER,
  });

  const payload = { id: newUser._id, role: newUser.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

  await RefreshToken.create({
    user: newUser._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

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

export const login = async (req: Request, res: Response) => {
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
  } catch {
    throw new AppError("Invalid or expired refresh token", 403);
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
