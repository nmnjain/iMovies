import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookie from "js-cookie";
import axios from "axios";

// Component Imports (CHECK PATHS!)
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
// *** ADD THIS IMPORT - Adjust path if ContentWrapper is elsewhere ***
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import { render } from "../../host"; // Check path

// Icons
import {
  MdPersonOutline,
  MdOutlineEmail,
  MdOutlineLock,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";

// Style Import
import "./style.scss"; // Check path

// Keep component name
const EditUserDetails = () => {
  // === CORE LOGIC (State, handlers, validation, submit - Kept the Same) ===
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for submit button state
  const navigate = useNavigate();

   // Fetch current user data (Optional but Recommended)
   // You might already have user data in context or local storage
   useEffect(() => {
      const fetchUserData = async () => {
         const jwtToken = Cookies.get("jwtToken");
         if (!jwtToken) {
             navigate("/login"); // Redirect if not logged in
             return;
         }
         // --- Placeholder: Replace with your actual method to get user ---
         // Option 1: Decode JWT (less secure if details change often)
         // try {
         //     const decoded = jwtDecode(jwtToken); // Make sure jwtDecode is imported
         //     setUserData(prev => ({...prev, name: decoded?.userDetails?.username || '', email: decoded?.userDetails?.email || '' }));
         // } catch (e) { console.error("Invalid token"); navigate('/login');}

         // Option 2: Fetch from profile API (Better)
         /* try {
             const profileHost = `${render}/api/auth/getprofile`; // Replace with your profile endpoint
             const response = await axios.get(profileHost, { headers: { 'auth-token': jwtToken }});
             if (response.data.status) {
                 setUserData(prev => ({
                     ...prev, // Keep potentially typed passwords
                     name: response.data.user.username || '',
                     email: response.data.user.email || ''
                 }));
             } else {
                 // Handle error fetching profile
             }
         } catch (error) {
              console.error("Error fetching profile", error);
         } */
         // --- End Placeholder ---
      };
      fetchUserData();
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
    // Allow empty passwords if user doesn't want to change it
    if (password || confirmPassword) { // Only validate password if user is trying to change it
        if (password !== confirmPassword) {
           toast.error("Password and confirm password must match.", toastOptions); return false;
        }
        if (password.length < 4) { // Kept original length check, consider increasing
            toast.error("Password should be at least 4 characters.", toastOptions); return false;
        }
    }
    if (!name || name.length < 3) {
      toast.error("Username should be at least 3 characters.", toastOptions); return false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { // Basic email format check
      toast.error("Please enter a valid email address.", toastOptions); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions

    if (handleValidation()) {
      setIsLoading(true);
      const { email, password, name } = userData;
      const host = `${render}/api/auth/editprofile`;
      const jwtToken = Cookies.get("jwtToken");

      // Prepare data - only include password if it's being changed
      const updateData = { name, email };
      if (password) {
          updateData.password = password;
      }

      try {
          const response = await axios.put(host, updateData, {
              headers: { 'auth-token': jwtToken } // Send auth token
          });
          const { data } = response;

          if (data.status) {
              toast.success(data.msg || "Profile updated successfully!", {...toastOptions, theme: 'colored'});
              // Clear only password fields after success, keep name/email
              setUserData(prev => ({
                  ...prev,
                  password: "",
                  confirmPassword: "",
              }));
              // Optionally update user data stored elsewhere (localStorage, context)
              // Optionally navigate away, e.g., back to profile page
              // navigate("/profile");
          } else {
              toast.error(data.msg || "Profile update failed.", toastOptions);
          }
      } catch (error) {
           console.error("Update Profile Error:", error);
           const errorMsg = error.response?.data?.msg || error.message || "An error occurred.";
           toast.error(errorMsg, toastOptions);
      } finally {
          setIsLoading(false);
      }
    }
  };

  const onShowPass = () => {
    setShowPass((prev) => !prev);
  };
  // === END CORE LOGIC ===


  // --- RENDER ---
  return (
    <>
      <Header />
      {/* Main container */}
      <main className="edit-profile-page">
         <ContentWrapper> {/* Optional: Use wrapper if needed */}
            {/* Form Card - similar to Login */}
            <div className="edit-profile-card">
              <h1 className="edit-profile-card__title">Edit Your Profile</h1>
              <p className="edit-profile-card__subtitle">Update your account details below.</p>

              <form onSubmit={handleSubmit} className="edit-profile-form" noValidate>
                {/* Name Input */}
                <div className="form-group">
                  <label htmlFor="name">Username</label>
                  <div className="input-group">
                    <MdPersonOutline className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={userData.name}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-group">
                    <MdOutlineEmail className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={userData.email}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="form-group">
                  <label htmlFor="password">New Password (optional)</label>
                  <div className="input-group">
                    <MdOutlineLock className="input-icon" />
                    <input
                      type={showPass ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter new password (leave blank to keep current)"
                      value={userData.password}
                      onChange={onChange}
                      // 'required' removed - password change is optional
                    />
                    {/* Password Visibility Toggle */}
                    <button
                       type="button"
                       className="toggle-password"
                       onClick={onShowPass}
                       aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Input - Only show if password is being entered */}
                {userData.password && (
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <div className="input-group">
                        <MdOutlineLock className="input-icon" />
                        <input
                          type={showPass ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm your new password"
                          value={userData.confirmPassword}
                          onChange={onChange}
                          required // Required only if new password is set
                        />
                         {/* Optional: Add toggle here too if desired */}
                      </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`submit-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
         </ContentWrapper>
      </main>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default EditUserDetails;