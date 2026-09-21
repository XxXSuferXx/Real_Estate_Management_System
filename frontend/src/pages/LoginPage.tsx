
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { LoginRequest, LoginResponse } from "../types/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", form);
      const { accessToken, user } = res.data;

      login(accessToken, user);
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Login failed. Try again.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 min-h-dvh text-white flex flex-col">
      <div className="bg-black flex justify-center p-3">NavBar</div>
      <main className="flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-green-600 w-full max-w-sm rounded-lg p-6 flex flex-col gap-4 shadow-lg"
        >
          <h1 className="text-2xl font-semibold text-center">Login</h1>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
              required
              autoComplete="email"
              className="w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800 text-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="text-black w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          {error && <p className="text-red-100 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </main>
    </div>
  );
};