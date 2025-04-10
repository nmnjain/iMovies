import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
// Consider adding a Brand icon if desired
import { MdMovie } from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as Footer
const Footer = () => {
  // You can make the links functional later by adding 'to' prop if using Link or 'href' for <a>
  const menuItems = [
    { label: "Terms Of Use", link: "#" },
    { label: "Privacy Policy", link: "#" },
    { label: "About", link: "#" },
    { label: "Blog", link: "#" },
    { label: "FAQ", link: "#" },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, link: "#", label: "Facebook" },
    { icon: <FaInstagram />, link: "#", label: "Instagram" },
    { icon: <FaTwitter />, link: "#", label: "Twitter" },
    { icon: <FaLinkedin />, link: "#", label: "LinkedIn" },
  ];

  return (
    // Use semantic footer tag
    <footer className="footer">
      {/* Wrapper for max-width and padding */}
      <div className="footer__container">

        {/* Optional: Footer Brand */}
        {/* <div className="footer__brand">
          <MdMovie className="footer__brand-icon" />
          <span className="footer__brand-name">i<span>Movies</span></span>
        </div> */}

        {/* Navigation Links */}
        <nav className="footer__nav">
          <ul className="footer__menu-items">
            {menuItems.map((item) => (
              <li key={item.label}>
                {/* Use <a> for now, replace with <Link> if using React Router links */}
                <a href={item.link} className="footer__menu-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Info Text */}
        <div className="footer__info-text">
          Explore a world of cinematic wonders. Book tickets, discover genres,
          and stay updated with the latest releases. Your ultimate movie destination awaits.
          {/* Updated text to be more concise and relevant */}
        </div>

        {/* Social Media Icons */}
        <div className="footer__social-icons">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.link}
              className="footer__social-link"
              target="_blank" // Open social links in new tab
              rel="noopener noreferrer" // Security best practice
              aria-label={social.label} // Accessibility
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="footer__copyright">
           © {new Date().getFullYear()} iMovies. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer; // Keep existing export name