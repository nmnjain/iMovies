import React, { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookie from "js-cookie";
import axios from "axios";
import { render } from "../../host"; // Check path

// Icons (Same as Register)
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdMovie // Brand Icon
} from "react-icons/md";

// Import the SHARED Auth styles
import "../../styles/Auth.scss"; // <<<< MAKE SURE THIS PATH IS CORRECT

const AdminRegister = () => {
  // --- Logic (Mostly same as user Register, adjusted API endpoint and cookie key) ---
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

   // Redirect if already logged in as admin
  useEffect(() => {
    const token = Cookie.get("adminJwtToken"); // Check admin token
    if (token) {
      navigate("/admin"); // Redirect to admin dashboard
    }
  }, [navigate]);

  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Match theme
    closeOnClick: true,
  };

  const handleValidation = () => {
    const { password, confirmPassword, name, email } = userData;
    if (!name || !email || !password || !confirmPassword) { toast.error("All fields are required.", toastOptions); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error("Please enter a valid email address.", toastOptions); return false; }
    if (name.length < 3) { toast.error("Username must be at least 3 characters.", toastOptions); return false; }
    if (password.length < 4) { toast.error("Password must be at least 4 characters.", toastOptions); return false; } // Keep length consistent for now
    if (password !== confirmPassword) { toast.error("Passwords do not match.", toastOptions); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (handleValidation()) {
      setIsLoading(true);
      const { email, password, name } = userData;
      // *** Use ADMIN registration endpoint ***
      const host = `${render}/api/auth/admin/register`;

      try {
        const response = await axios.post(host, { name, password, email });
        const { data } = response;

        if (data.status) {
           // Don't need to store admin user data in localStorage usually
          // localStorage.setItem("user", JSON.stringify(data.userData)); // Maybe remove for admin?
          // *** Use ADMIN cookie key ***
          Cookie.set("adminJwtToken", data.jwtToken, { expires: 2 }); // Shorter expiry for admin?
          setUserData({ name: "", password: "", email: "", confirmPassword: "" });
          toast.success("Admin registration successful! Redirecting...", { ...toastOptions, theme: "colored", autoClose: 1500 });
           // *** Navigate to ADMIN area ***
          setTimeout(() => navigate("/admin"), 1500);
        } else {
          toast.error(data.msg || "Admin registration failed.", toastOptions);
        }
      } catch (error) {
         console.error("Admin Registration error:", error);
         const errorMessage = error.response?.data?.msg || "An error occurred during admin registration.";
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
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">

          {/* Brand - with Admin Badge (check Auth.scss for .admin-badge style) */}
          <div className="brand">
            <MdMovie className="brand-icon" />
            <h1 className="brand-name">
               i<span>Movies</span>
               <span className="admin-badge">Admin</span> {/* Add badge */}
            </h1>
          </div>

          <h2 className="auth-title">Admin Registration</h2>
          <p className="auth-subtitle">Create a new administrator account.</p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Username */}
            <div className="form-group">
              <label htmlFor="name">Admin Username</label>
              <div className="input-group">
                <MdPerson className="input-icon" />
                <input type="text" id="name" name="name" placeholder="Choose an admin username" value={userData.name} onChange={onChange} required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-group">
                <MdEmail className="input-icon" />
                <input type="email" id="email" name="email" placeholder="admin@example.com" value={userData.email} onChange={onChange} required />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="pass">Password</label>
              <div className="input-group">
                <MdLock className="input-icon" />
                <input type={showPass ? "text" : "password"} id="pass" name="password" placeholder="Create a strong password" value={userData.password} onChange={onChange} required />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-group">
                <MdLock className="input-icon" />
                <input type={showPass ? "text" : "password"} id="confirm" name="confirmPassword" placeholder="Re-enter password" value={userData.confirmPassword} onChange={onChange} required />
                 <button type="button" className="toggle-password" onClick={onShowPass} aria-label={showPass ? "Hide passwords" : "Show passwords"}>
                    {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                 </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className={`submit-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Admin'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="auth-footer">
            <p>Already an Admin?</p>
            <Link to="/admin/login" className="register-link">Admin Login</Link>
          </div>
          <div className="auth-footer" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            <Link to="/register" className="register-link">User Registration</Link>
          </div>

        </div> {/* End auth-card */}
      </div> {/* End auth-card-wrapper */}

      {/* Backdrop - Use the ADMIN variation */}
      <div className="auth-backdrop admin-backdrop"> {/* Added admin-backdrop class */}
        <div className="backdrop-content">
          <h2>Admin Control Panel</h2>
          <p>Manage movies, theatres, shows, and users.</p>
        </div>
      </div>

      <ToastContainer />
    </div> // End auth-container
  );
};

export default AdminRegister;