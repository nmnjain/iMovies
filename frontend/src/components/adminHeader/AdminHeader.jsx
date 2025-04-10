// src/components/header/Header.jsx (or its actual path)
// NOTE: This component now represents the ADMIN HEADER

import React, { useState, useContext, useEffect } from "react"; // Added useEffect
import { useNavigate, Link } from "react-router-dom"; // Added Link
import Cookies from "js-cookie";
import { ThemeContext } from "../../context/themeContext"; // Check path

// Modern Icons
import {
    MdMenu,
    MdClose,
    MdOutlineWbSunny,
    MdOutlineDarkMode,
    MdDashboard,
    MdOutlineMovie, // Brand Icon
    MdEditNote,
    MdOutlinePlaylistAdd,
    MdOutlineTheaters,
    MdLogout // Logout Icon
} from "react-icons/md";

// Import the SHARED Auth styles - This contains variables and base styles
// Adjust path if Auth.scss is elsewhere (e.g., ../../styles/Auth.scss)
import "../../styles/Auth.scss"; // <<<<!! MAKE SURE THIS PATH IS CORRECT !!

// Import the specific SCSS for this component (renamed classes inside)
import "./style.scss"; // <<<< This file will be modified below

// Keep component name 'Header' as requested, but it functions as AdminNavbar now
const Header = () => {
  // === STATE & CORE LOGIC (Keep Admin functionality) ===
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggle: toggleTheme, theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Admin Token Check (Keep this)
  useEffect(() => {
    const adminToken = Cookies.get("adminJwtToken");
    if (!adminToken) {
      // Redirect to admin login if not authenticated
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // Logout Handler (Keep this)
  const handleLogout = () => {
    Cookies.remove("adminJwtToken");
    navigate("/admin/login");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
     setMobileMenuOpen(prev => !prev);
  }
  // === END CORE LOGIC ===


  // --- UI Rendering (Using modern structure with admin-navbar__* classes) ---
  return (
    <>
      {/* Use BEM classes matching the updated style.scss */}
      <header className={`admin-navbar ${mobileMenuOpen ? 'admin-navbar--mobile-menu-open' : ''}`}>
        <div className="admin-navbar__container">
          {/* Brand */}
          <div className="admin-navbar__brand" onClick={() => handleNavClick('/admin')} role="button" tabIndex={0}>
             <MdOutlineMovie className="admin-navbar__brand-icon" />
             <span className="admin-navbar__brand-name">
                i<span>Movies</span>
                {/* Check Auth.scss if .admin-badge exists, or use this class */}
                <span className="admin-navbar__admin-badge">Admin</span>
             </span>
          </div>

          {/* Desktop Menu Items */}
          <nav className="admin-navbar__desktop-menu">
             <button onClick={() => handleNavClick('/admin')} className="admin-navbar__item" title="Dashboard">
                 <MdDashboard /> <span className="admin-navbar__item-label">Dashboard</span>
             </button>
             <button onClick={() => handleNavClick('/admin/addmovie')} className="admin-navbar__item" title="Add/Edit Movie">
                 <MdEditNote /> <span className="admin-navbar__item-label">Movies</span>
             </button>
              <button onClick={() => handleNavClick('/admin/addshow')} className="admin-navbar__item" title="Add Show">
                  <MdOutlinePlaylistAdd /> <span className="admin-navbar__item-label">Shows</span>
              </button>
              <button onClick={() => handleNavClick('/admin/addtheatre')} className="admin-navbar__item" title="Add Theatre">
                  <MdOutlineTheaters /> <span className="admin-navbar__item-label">Theatres</span>
              </button>
              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="admin-navbar__item" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                  {theme === "dark" ? <MdOutlineWbSunny /> : <MdOutlineDarkMode />}
              </button>
              {/* Logout Button */}
              <button onClick={handleLogout} className="admin-navbar__item admin-navbar__item--logout" title="Logout">
                  <MdLogout />
              </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="admin-navbar__mobile-controls">
              <button
                  className="admin-navbar__icon-button admin-navbar__menu-toggle"
                  onClick={handleMobileMenuToggle}
                  aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
                  aria-expanded={mobileMenuOpen}
              >
                 {mobileMenuOpen ? <MdClose/> : <MdMenu />}
              </button>
          </div>
        </div> {/* End container */}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <nav className="admin-navbar__mobile-menu">
                 <button onClick={() => handleNavClick('/admin')} className="admin-navbar__mobile-menu-item"> <MdDashboard /> Dashboard </button>
                 <button onClick={() => handleNavClick('/admin/addmovie')} className="admin-navbar__mobile-menu-item"> <MdEditNote /> Add/Edit Movie </button>
                 <button onClick={() => handleNavClick('/admin/addshow')} className="admin-navbar__mobile-menu-item"> <MdOutlinePlaylistAdd /> Add Show </button>
                 <button onClick={() => handleNavClick('/admin/addtheatre')} className="admin-navbar__mobile-menu-item"> <MdOutlineTheaters /> Add Theatre </button>
                 <button onClick={toggleTheme} className="admin-navbar__mobile-menu-item"> {theme === "dark" ? <MdOutlineWbSunny /> : <MdOutlineDarkMode />} Switch Theme </button>
                 <button onClick={handleLogout} className="admin-navbar__mobile-menu-item admin-navbar__mobile-menu-item--logout"> <MdLogout /> Logout </button>
            </nav>
        )}
      </header>
      {/* Spacer needed below fixed header */}
      <div className="admin-navbar-spacer"></div>
    </>
  );
};

export default Header; // Keep original export name