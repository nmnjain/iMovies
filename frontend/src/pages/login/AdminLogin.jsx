import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { render } from "../../host";
import { 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff,
  MdAdminPanelSettings
} from "react-icons/md";

// Import the same styles file used for user login
import "../../styles/Auth.scss";

const AdminLogin = () => {
  const [userData, setUserData] = useState({
    password: "",
    email: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  
  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Changed to light theme for modern feel
    closeOnClick: true,
  };
  
  const handleValidation = () => {
    const { email, password } = userData;
    if (!email) {
      toast.error("Email is required.", toastOptions);
      return false;
    } else if (!password) {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.", toastOptions);
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = userData;
    
    if (handleValidation()) {
      setIsLoading(true);
      const host = `${render}/api/auth/admin/login`;
      
      try {
        const response = await axios.post(host, {
          email,
          password,
          admin: true,
        });
        const { data } = response;
        
        if (data.status) {
          localStorage.setItem("user", JSON.stringify(data.userData));
          Cookie.set("adminJwtToken", data.jwtToken, { expires: 9 });
          setUserData({
            password: "",
            email: "",
          });
          toast.success("Admin login successful!", { 
            ...toastOptions,
            theme: "colored", 
            autoClose: 2000 
          });
          setTimeout(() => navigate("/admin"), 1500);
        } else {
          toast.error(data.msg, toastOptions);
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.response?.data?.msg || "An error occurred. Please try again later.", toastOptions);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const onShowPass = () => {
    setShowPass((prev) => !prev);
  };
  
  return (
    <div className="auth-container admin-auth">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="brand">
            <MdAdminPanelSettings className="brand-icon" />
            <h1 className="brand-name">i<span>Movies</span> <span className="admin-badge">Admin</span></h1>
          </div>
          
          <h2 className="auth-title">Admin Portal</h2>
          <p className="auth-subtitle">Sign in to access administrative controls</p>
          
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="admin@imovies.com"
                  value={userData.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="label-group">
                <label htmlFor="pass">Password</label>
                <Link to="/admin/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <MdLock className="input-icon" />
                <input
                  name="password"
                  id="pass"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={onChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={onShowPass}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Need an admin account?</p>
            <Link to="/admin/register" className="register-link">
              Request Access
            </Link>
          </div>
        </div>
      </div>
      <div className="auth-backdrop admin-backdrop">
        <div className="backdrop-content">
          <h2>iMovies Administration</h2>
          <p>Manage theaters, showtimes, and user experiences in one place.</p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;