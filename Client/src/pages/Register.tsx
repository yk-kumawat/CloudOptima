import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../config";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { darkMode: isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // Securely store JWT token & Context state
      login(response.data);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} min-h-screen w-full flex items-center justify-center font-display`}
    >
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-300">
        {/* Background Accents */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent-green/10 blur-[120px] rounded-full pointer-events-none"></div>

        <main className="relative z-10 w-full max-w-125 px-6">
          {/* Card Container */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl transition-colors">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-3xl">
                  cloud_done
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight dark:text-white">
                CloudOptima
              </h2>
            </div>
            <form
              className="space-y-5"
              onSubmit={handleRegister}
            >
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold text-center mt-2">
                  {error}
                </div>
              )}
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-slate-600 dark:text-slate-300"
                  htmlFor="full-name"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    person
                  </span>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-500 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-accent-green/20 transition-all"
                    id="full-name"
                    name="fullName"
                    placeholder="John Doe"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-slate-600 dark:text-slate-300"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    mail
                  </span>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-500 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-accent-green/20 transition-all"
                    id="email"
                    name="email"
                    placeholder="john@company.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-slate-600 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    lock
                  </span>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-500 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-accent-green/20 transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                className={`w-full h-12 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2
                  ${isLoading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/70 active:scale-[0.98]"}
                `}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
                    Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?
                <a
                  className="text-primary font-bold hover:text-blue-500 transition-colors ml-1 cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;
