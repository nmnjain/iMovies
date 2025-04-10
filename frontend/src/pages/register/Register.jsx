import React, { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { render } from "../../host"; // Your host configuration

// Icons (Same as Login + MdPerson)
import {
  MdPerson, // For Username
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdMovie // Brand Icon
} from "react-icons/md";

// Import the SHARED Auth styles
import "../../styles/Auth.scss"; // <<<< MAKE SURE THIS PATH IS CORRECT

const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = Cookie.get("jwtToken");
    if (token) {
      navigate("/"); // Or to profile, dashboard etc.
    }
  }, [navigate]);

  // --- Logic (Keep core logic, adjust validation messages) ---
  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 4000,
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Match Login theme
    closeOnClick: true,
  };

  const handleValidation = () => {
    const { password, confirmPassword, name, email } = userData;
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required.", toastOptions);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error("Please enter a valid email address.", toastOptions);
        return false;
    }
    if (name.length < 3) {
      toast.error("Username must be at least 3 characters.", toastOptions);
      return false;
    }
    // Note: Original had 4 chars, Login validation example often has more
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters.", toastOptions);
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submit

    if (handleValidation()) {
      setIsLoading(true);
      const { email, password, name } = userData;
      const host = `${render}/api/auth/register`; // User registration endpoint

      try {
        const response = await axios.post(host, { name, password, email });
        const { data } = response;

        if (data.status) {
          // Handle successful registration (e.g., login, redirect)
          localStorage.setItem("user", JSON.stringify(data.userData)); // Optional: store user data
          Cookie.set("jwtToken", data.jwtToken, { expires: 9 }); // Optional: set token
          setUserData({ name: "", password: "", email: "", confirmPassword: "" });
          toast.success("Registration successful! Redirecting...", { ...toastOptions, theme: "colored", autoClose: 1500 });
          setTimeout(() => navigate("/"), 1500); // Redirect home after success
        } else {
          toast.error(data.msg || "Registration failed.", toastOptions);
        }
      } catch (error) {
         console.error("Registration error:", error);
         const errorMessage = error.response?.data?.msg || "An error occurred during registration.";
         toast.error(errorMessage, toastOptions);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onShowPass = () => {
    setShowPass((prev) => !prev);
  };
  // --- End of logic ---

  // --- RENDER using Login page structure and classes ---
  return (
    <div className="auth-container"> {/* Match Login page structure */}
      <div className="auth-card-wrapper">
        <div className="auth-card">

          {/* Brand */}
          <div className="brand">
            <MdMovie className="brand-icon" />
            <h1 className="brand-name">i<span>Movies</span></h1>
          </div>

          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start your iMovies journey today!</p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Username */}
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <div className="input-group">
                <MdPerson className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Choose a username"
                  value={userData.name}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={userData.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="pass">Password</label>
              <div className="input-group">
                <MdLock className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  id="pass"
                  name="password"
                  placeholder="Create a password (min. 4 chars)"
                  value={userData.password}
                  onChange={onChange}
                  required
                />
                 {/* Only one toggle needed, placed with Confirm for alignment */}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-group">
                <MdLock className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  id="confirm"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={userData.confirmPassword}
                  onChange={onChange}
                  required
                />
                 <button
                    type="button"
                    className="toggle-password" // Use the class from Auth.scss
                    onClick={onShowPass}
                    aria-label={showPass ? "Hide passwords" : "Show passwords"}
                 >
                    {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                 </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="auth-footer">
            <p>Already have an account?</p>
            {/* Use register-link class for consistent styling */}
            <Link to="/login" className="register-link">
              Log In
            </Link>
          </div>

            {/* Optional: Link to Admin Registration */}
           {/* <div className="auth-footer" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
               <Link to="/admin/register" className="register-link">Admin Registration</Link>
           </div> */}

        </div> {/* End auth-card */}
      </div> {/* End auth-card-wrapper */}

      {/* Backdrop */}
      <div className="auth-backdrop">
         {/* Keep content same as Login backdrop */}
        <div className="backdrop-content">
          <h2>The Ultimate Movie Experience</h2>
          <p>Book tickets, explore new releases, and enjoy exclusive offers.</p>
        </div>
      </div>

      <ToastContainer />
    </div> // End auth-container
  );
};

export default Register;