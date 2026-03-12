import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();
  const { user: userData } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Saved", path: "/saved" },
    { name: "About", path: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-2xl">cloud_done</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight dark:text-white">
          CloudOptima
        </h2>
      </div>

      <nav className="hidden md:flex flex-1 justify-center gap-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`text-sm font-bold transition-all relative py-1 cursor-pointer ${
                isActive
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-300 hover:text-primary"
              }`}
            >
              {item.name}
            </a>
          );
        })}
      </nav>
      <div className="flex gap-8 items-center">
        {darkMode ? (
          <button
            onClick={() => {
              setDarkMode(false);
            }}
            className="flex items-center"
          >
            <span className="material-symbols-outlined">wb_sunny</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setDarkMode(true);
            }}
            className="flex items-center"
          >
            <span className="material-symbols-outlined">bedtime</span>
          </button>
        )}

        {userData ? (
          <div className="flex items-center gap-8">
            <button className="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button onClick={() => {navigate('/profile')}} className="h-10 w-10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
