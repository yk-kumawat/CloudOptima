import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../config";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { darkMode: isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // Securely store JWT token & Context state
      login(response.data);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} min-h-screen font-display transition-colors duration-500`}
    >
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Mesh Background Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-100"
          style={{
            backgroundImage: `radial-gradient(at 0% 0%, rgba(19, 91, 236, 0.08) 0px, transparent 50%), 
                                 radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)`,
          }}
        ></div>

        <div className="w-full max-w-md relative z-10">
          {/* Login Form Card */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all">
            {/* Top Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-blue-400 opacity-50"></div>

            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-3xl">
                  cloud_done
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">
                CloudOptima
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Cost Optimization Intelligence
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleLogin}
            >
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold text-center mt-2">
                  {error}
                </div>
              )}
              {/* Email Field */}
              <div>
                <label
                  className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-500 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-sm font-semibold text-slate-600 dark:text-slate-300"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-xs font-medium text-primary hover:text-blue-500 transition-colors"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-500 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary focus:ring-primary"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label
                  className="ml-2 block text-sm text-slate-500 dark:text-slate-400"
                  htmlFor="remember-me"
                >
                  Remember this device
                </label>
              </div>

              <button
                className={`w-full h-12 text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-primary hover:bg-blue-600 hover:scale-[1.01] active:scale-[0.98]"}
                `}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
            {/* Sign Up Link */}
            <p className="text-center mt-8 text-slate-500 text-sm">
              Don't have an account?
              <a
                className="text-primary font-bold hover:text-blue-500 transition-colors ml-1 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </a>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
