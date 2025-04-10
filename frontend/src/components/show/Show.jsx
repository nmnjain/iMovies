import React from "react"; // Removed useState as it's not used
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// Import necessary icons from react-icons (matching the SCSS)
import { MdStar, MdOutlineTimer, MdOutlineCalendarToday, MdImageNotSupported } from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as Show
const Show = ({ data }) => {
  // === CORE LOGIC (Adapted for new structure) ===
  const navigate = useNavigate();

  // Destructure data, providing default values for safety
  const {
    _id, // Use _id for key if available, otherwise movieId
    movieId,
    movieName = "Untitled Movie", // Default title
    releaseDate,
    media, // This seems to be the poster URL
    // Add other potential fields from your data if available and used in the design
    rating = 0, // Example: assuming rating exists
    genres = [], // Example: assuming genres array exists
    language = "N/A", // Example: assuming language exists
    duration = 0 // Example: assuming duration in minutes exists
  } = data || {}; // Add default empty object to prevent errors if data is null/undefined

  // Use movieId for navigation if available, otherwise fall back to _id
  const navigateToId = movieId || _id;

  // Format movie name (Capitalize first letter - kept from original)
  const formattedMovieName = movieName.charAt(0).toUpperCase() + movieName.slice(1);

  // Format release date using dayjs (kept from original)
  const formattedReleaseDate = releaseDate ? dayjs(releaseDate).format("MMM D, YYYY") : "N/A";

  // Format duration (Example: convert minutes to Hh Mm format)
  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let formatted = "";
    if (hours > 0) formatted += `${hours}h `;
    if (remainingMinutes > 0) formatted += `${remainingMinutes}m`;
    return formatted.trim();
  };
  const formattedDuration = formatDuration(duration);


  const handleCardClick = () => {
    if (navigateToId) {
      navigate(`/showdetails/${navigateToId}`); // Use the derived ID
    } else {
      console.warn("No ID found for navigation", data);
    }
  };
  // === END CORE LOGIC ===


  // --- NEW MODERN UI Rendering ---
  // Using the class names from the provided SCSS (.movie-card, .movie-poster, etc.)
  return (
    // Render as a div, apply onClick handler here
    // Note: Changed from `li` to `div` as it's usually better practice for grid items unless it's semantically a list
    <div className="movie-card" onClick={handleCardClick} role="button" tabIndex={0} aria-label={`View details for ${formattedMovieName}`}>

      {/* Poster Section */}
      <div className="movie-poster">
        {media ? (
          <img src={media} alt={`${formattedMovieName} Poster`} loading="lazy" />
        ) : (
          // Placeholder if no image URL is provided
          <div className="poster-placeholder">
            <MdImageNotSupported />
            <span>No Poster</span>
          </div>
        )}

        {/* Rating Badge (Example - uncomment if you have rating data) */}
        {rating > 0 && (
          <div className="movie-rating">
            <MdStar /> {rating.toFixed(1)}
          </div>
        )}

        {/* Overlay with View Details Button */}
        <div className="movie-overlay">
          {/* The button itself doesn't need to navigate if the whole card does, but kept structure */}
          <span className="view-details-btn">View Details</span>
          {/* Or use a Link if you DON'T want the whole card clickable:
           <Link to={`/showdetails/${navigateToId}`} className="view-details-btn">View Details</Link>
          */}
        </div>
      </div>

      {/* Information Section */}
      <div className="movie-info">
        <h3 className="movie-title" title={formattedMovieName}>{formattedMovieName}</h3>

        {/* Meta Info (Genre, Language - Examples) */}
        { (genres.length > 0 || language !== "N/A") && (
           <div className="movie-meta">
            {/* Display first genre tag */}
            {genres.length > 0 && <span className="movie-genre">{genres[0]}</span>}
            {/* Display language tag */}
            {language !== "N/A" && <span className="movie-language">{language}</span>}
           </div>
        )}


        {/* Bottom Details (Release Date, Duration - Examples) */}
        <div className="movie-details">
          {formattedDuration && (
             <span className="movie-duration">
               <MdOutlineTimer /> {formattedDuration}
             </span>
          )}
          <span className="movie-release">
            <MdOutlineCalendarToday /> {formattedReleaseDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Show; // Keep existing export name 