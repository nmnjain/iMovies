import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ThemeContext } from "../../context/themeContext"; // Keep existing path
import { searchContext } from "../../context/searchContext"; // Keep existing path

// Import consistent icons from Material Design Icons (used in your Login page)
import {
    MdSearch,
    MdMenu,
    MdFavoriteBorder, // Use MdFavorite if you want filled icon
    MdAccountCircle,
    MdOutlineWbSunny,
    MdOutlineDarkMode,
    MdHome,
    MdClose, // For closing mobile menu/search
    MdMovie // Brand Icon like Login page
} from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as Header
const Header = () => {
    // === CORE LOGIC (Kept Exactly the Same - Copied from your original file) ===
    const [menu, setMenu] = useState(false); // Mobile menu toggle
    const [search, setSearch] = useState(false); // Mobile search toggle
    const [searchInput, setSearchInput] = useState("");
    const { toggle, theme } = useContext(ThemeContext); // Keep original names
    const { setQuery } = useContext(searchContext);

    const navigate = useNavigate();
    const location = useLocation(); // Get location for potential effects

    // Original useEffect logic (slightly adapted to prevent redirect loops)
    useEffect(() => {
        const jwtToken = Cookies.get("jwtToken");
        if (!jwtToken) {
            // Redirect only if not already on login/register page
            if (location.pathname !== '/login' && location.pathname !== '/register') {
                 navigate("/login");
            }
        }
        // Close mobile menu/search on navigation
        setMenu(false);
        setSearch(false);
        // Reset search input on navigation *away* from home potentially? Or keep as is.
        // setSearchInput(""); // Optional: Clear search input on any navigation
    }, [location.pathname, navigate]); // Run on route change

    // Original handleEnter logic
    const handleEnter = (e) => {
        if (e.key === "Enter" && searchInput.trim()) {
            setQuery(searchInput.trim());
            setSearchInput("");
            setSearch(false); // Close mobile search after submit
            navigate("/");
        }
    };

    // Original handleSearch logic (for button click)
    const handleSearch = () => {
         if (searchInput.trim()) {
            setQuery(searchInput.trim());
            setSearchInput("");
            setSearch(false); // Close mobile search after submit
            navigate("/");
        }
    };

    // Handler for clicking the brand logo/name
    const handleBrandClick = () => {
        setQuery(""); // Clear search query on brand click
        navigate("/");
    };

    // Handler for clicking navigation items (closes mobile menu)
    const handleNavClick = (path) => {
        setMenu(false); // Close mobile menu on item click
        navigate(path);
    };

     // Handler specifically for toggling the mobile search view
    const handleMobileSearchToggle = () => {
        setSearch(prev => !prev); // Toggle search state
        setMenu(false); // Ensure menu is closed when search opens
    }

    // Handler specifically for toggling the mobile menu view
    const handleMobileMenuToggle = () => {
        setMenu(prev => !prev); // Toggle menu state
        setSearch(false); // Ensure search is closed when menu opens
    }
   // === END CORE LOGIC ===


    // --- NEW MODERN UI Rendering ---
    // Note the use of BEM naming convention (e.g., header__container) for easier styling
    return (
        <>
            {/* Use header tag for semantic HTML, add classes based on state */}
            <header className={`header ${menu ? 'header--mobile-menu-open' : ''} ${search ? 'header--mobile-search-open' : ''}`}>
                <div className="header__container">
                    {/* Brand */}
                    <div className="header__brand" onClick={handleBrandClick} role="button" tabIndex={0} aria-label="Go to homepage">
                       <MdMovie className="header__brand-icon" />
                       {/* Applying the same style as login page brand */}
                       <span className="header__brand-name">i<span>Movies</span></span>
                    </div>

                    {/* Desktop Search & Actions Container */}
                    <div className="header__desktop-actions">
                        {/* Desktop Search Form */}
                        <div className="header__search">
                             {/* Search Icon Button (Visually appears first) */}
                             <button
                                className="header__search-button"
                                onClick={handleSearch}
                                aria-label="Search"
                                // Disable button if input is empty? Optional.
                                // disabled={!searchInput.trim()}
                            >
                                <MdSearch />
                            </button>
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyUp={handleEnter}
                                className="header__search-input"
                            />
                        </div>

                        {/* Desktop Menu Items (using nav tag for semantics) */}
                        <nav className="header__menu-items">
                            {/* Use Link for navigation */}
                            <Link to="/" className="header__item" title="Home">
                                <MdHome />
                                {/* Optional label for desktop, can be hidden/shown via CSS */}
                                {/* <span className="header__item-label">Home</span> */}
                            </Link>
                            <Link to="/savedmovies" className="header__item" title="Favorites">
                                <MdFavoriteBorder />
                                {/* <span className="header__item-label">Favorites</span> */}
                            </Link>
                            <Link to="/profile" className="header__item" title="Profile">
                                <MdAccountCircle />
                                {/* <span className="header__item-label">Profile</span> */}
                            </Link>
                            {/* Theme Toggle Button */}
                            <button onClick={toggle} className="header__item header__item--button" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                                {theme === "dark" ? <MdOutlineWbSunny /> : <MdOutlineDarkMode />}
                                {/* <span className="header__item-label">Theme</span> */}
                            </button>
                        </nav>
                    </div>

                    {/* Mobile Controls Container (Search Icon & Hamburger) */}
                    <div className="header__mobile-controls">
                         {/* Mobile Search Toggle Button */}
                         <button
                            className="header__icon-button"
                            onClick={handleMobileSearchToggle}
                            aria-label={search ? "Close Search" : "Open Search"}
                        >
                            {/* Show Close icon when search is open, Search icon otherwise */}
                            {search ? <MdClose /> : <MdSearch />}
                        </button>
                         {/* Mobile Menu Toggle Button */}
                        <button
                            className="header__icon-button header__menu-toggle"
                            onClick={handleMobileMenuToggle}
                            aria-label={menu ? "Close Menu" : "Open Menu"}
                            aria-expanded={menu} // For accessibility
                        >
                           {/* Show Close icon when menu is open, Menu icon otherwise */}
                           {menu ? <MdClose/> : <MdMenu />}
                        </button>
                    </div>
                </div> {/* End header__container */}

                {/* --- Mobile Popups (Rendered outside container, positioned via CSS) --- */}

                {/* Mobile Search Input Area (Conditionally Rendered) */}
                {/* Use original 'search' state to control visibility */}
                {search && (
                    <div className="header__mobile-search">
                         <div className="header__mobile-search-wrapper">
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyUp={handleEnter}
                                className="header__mobile-search-input"
                                autoFocus // Focus when it appears
                            />
                            <button
                                className="header__mobile-search-button"
                                onClick={handleSearch}
                                aria-label="Submit Search"
                            >
                                <MdSearch />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Menu Dropdown (Conditionally Rendered) */}
                {/* Use original 'menu' state to control visibility */}
                {menu && (
                    <nav className="header__mobile-menu">
                        {/* Use onClick with handleNavClick to close menu */}
                        <Link to="/" className="header__mobile-menu-item" onClick={() => handleNavClick('/')}>
                            <MdHome /> Home
                        </Link>
                        <Link to="/savedmovies" className="header__mobile-menu-item" onClick={() => handleNavClick('/savedmovies')}>
                            <MdFavoriteBorder /> Favorites
                        </Link>
                        <Link to="/profile" className="header__mobile-menu-item" onClick={() => handleNavClick('/profile')}>
                            <MdAccountCircle /> Profile
                        </Link>
                        <button onClick={toggle} className="header__mobile-menu-item header__mobile-menu-item--button">
                            {theme === "dark" ? <MdOutlineWbSunny /> : <MdOutlineDarkMode />}
                             Switch Theme
                        </button>
                    </nav>
                )}
            </header> {/* End header */}

            {/* Spacer div to prevent content from being hidden under the fixed header */}
            {/* Its height will be adjusted via CSS based on whether mobile search is open */}
            <div className="header-spacer"></div>
        </>
    );
};

export default Header; // Keep existing export name