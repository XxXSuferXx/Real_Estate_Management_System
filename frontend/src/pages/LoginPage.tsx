import { useState, type ChangeEvent, type FormEvent } from "react";
import type { LoginRequest, LoginResponse } from "../types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import api from "../api/axios";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "At least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
   const [serverError, setServerError] = useState<string>("");

   const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");
    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", data);
      const { accessToken, user } = res.data;

      login(accessToken, user);
     navigate({ to: user.role === "admin" ? "/AdminPanel" : user.role === "agent" ? "/Dashboard" : "/" });
     
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setServerError(err.response?.data?.message ?? "Login Failed. Try again.");
      } else {
        setServerError("Something went wrong. Try Again.");
      }
    }
  };

  return (
    <div className = " bg-slate-800 min-h-dvh text-white flex flex-col">
      <div className = " bg-black flex justify-center p-3">
          NavBar
      </div>
      <main className=" flex-1 flex items-center justify-center p-4">
        {/* The green box */}
        <form onSubmit = {handleSubmit(onSubmit)} className=" bg-green-600 w-full max-w-sm rounded-lg p-6 flex flex-col gap-4 shadow-lg">
          <h1 className = " text-2xl font-semibold text-center">Login</h1>
          <div className = " flex flex-col gap-1">
            <label htmlFor = "email" className = "text-sm font-medium">
              Email
            </label>
            <input
            id = "email"
            type = "email"
            placeholder = "you@gmail.com"
            required
            autoComplete = "email"
            {...register("email")}
            className = " w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800 text-black"
             />
             {errors.email && (
              <p className="text-xs text-red-200">{errors.email.message}</p>
            )}
          </div>

          <div className=" flex flex-col gap-1">
            <label htmlFor="password" className=" text-sm font-medium">
              Password
            </label>
            <input
              id= "password"
              type = "password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              {...register("password")}
              className=" text-black w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800"
            />
            {errors.password && (
              <p className="text-xs text-red-200">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-red-200 bg-red-900/40 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

        <button 
          type= "submit" disabled = {isSubmitting}
          className = " w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 transition-colors"
          >
          {isSubmitting? "Signing in..." : "Sign In"}
        </button>

        </form>
      </main>
    </div>
  )
}