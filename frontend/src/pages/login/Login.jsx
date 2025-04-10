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
  MdMovie
} from "react-icons/md";

// Import the new styles file
import "../../styles/Auth.scss";

const Login = () => {
  const [userData, setUserData] = useState({
    password: "",
    email: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Core logic remains unchanged
  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 4000,
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Changed to light theme for modern feel
    closeOnClick: true,
  };

  const handleValidation = () => {
    const { email, password } = userData;
    if (!email || !password) {
      toast.error("Email and Password are required.", toastOptions);
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
      const host = `${render}/api/auth/login`;

      try {
        const response = await axios.post(host, {
          email,
          password,
        });
        const { data } = response;

        if (data.status) {
          localStorage.setItem("user", JSON.stringify(data.userData));
          Cookie.set("jwtToken", data.jwtToken, { expires: 9 });
          setUserData({ password: "", email: "" });
          toast.success("Login successful!", { 
            ...toastOptions, 
            theme: "colored", 
            autoClose: 2000 
          });
          setTimeout(() => navigate("/"), 1500);
        } else {
          toast.error(data.msg || "Login failed. Please check your credentials.", toastOptions);
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
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="brand">
            <MdMovie className="brand-icon" />
            <h1 className="brand-name">i<span>Movies</span></h1>
          </div>
          
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your movie journey</p>
          
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={userData.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="label-group">
                <label htmlFor="pass">Password</label>
                <Link to="/forgot-password" className="forgot-password">
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/register" className="register-link">
              Create Account
            </Link>
          </div>
        </div>
      </div>
      <div className="auth-backdrop">
        <div className="backdrop-content">
          <h2>The Ultimate Movie Experience</h2>
          <p>Book tickets, explore new releases, and enjoy exclusive offers.</p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;