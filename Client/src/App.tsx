import './App.css'
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import Saved from './pages/Saved';
import UserProfile from './pages/UserProfile';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';

function App() {
  const { darkMode } = useTheme();

  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        containerStyle={{
          top: 50,
        }}
        toastOptions={{
          duration: 2000,
          style: darkMode
            ? { background: '#fff', color: '#1e293b' }
            : { background: '#1e293b', color: '#fff' }
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
