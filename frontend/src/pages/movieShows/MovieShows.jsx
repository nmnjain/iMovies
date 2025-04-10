import React from "react";
import dayjs from "dayjs";
// Import useLocation
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
// Corrected path assuming ContentWrapper is in components
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";

// Icons
import { MdTheaters, MdCalendarToday, MdOutlineTimer, MdOutlineConfirmationNumber, MdErrorOutline } from "react-icons/md";
import { TbMovieOff } from "react-icons/tb";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as MovieShows
const MovieShows = () => {
  // === CORE LOGIC ===
  const navigate = useNavigate();
  const { movieName: movieId } = useParams(); // Get ID from URL param
  const location = useLocation(); // Initialize useLocation hook

  // Get the movie title from the state passed during navigation (if available)
  const movieTitleFromState = location.state?.movieTitle;

  // Fetch shows data using the ID from the URL parameter
  const { resData, loading, error } = useFetch(
    `/api/shows/getmovieshows/${encodeURIComponent(movieId)}`
  );

  const showsData = resData?.data?.showData;

  // Sort shows by date and time (No change)
  showsData?.sort(function (a, b) {
    try {
        const datetimeA = new Date(`${a.showdate}T${a.showtime}`);
        const datetimeB = new Date(`${b.showdate}T${b.showtime}`);
        if (isNaN(datetimeA) || isNaN(datetimeB)) return 0;
        return datetimeA - datetimeB;
    } catch (e) {
        console.error("Error parsing date/time for sorting:", a, b, e);
        return 0;
    }
  });

  // Time formatting function (No change)
  function convertTo12HourFormat(time24) {
    if (!time24 || !time24.includes(':')) return "N/A";
    try {
        const [hours, minutes] = time24.split(":");
        let hoursInt = parseInt(hours);
        const meridiem = hoursInt >= 12 ? "PM" : "AM";
        hoursInt = hoursInt % 12 || 12;
        return `${hoursInt}:${minutes} ${meridiem}`;
    } catch (e) {
        console.error("Error formatting time:", time24, e);
        return "N/A";
    }
  }
  // === END CORE LOGIC ===

  // --- RENDER FUNCTIONS ---

  // Render a single show card (No change needed inside this function)
  const ShowCard = ({ show }) => {
     // ... ShowCard JSX remains the same as the previous version ...
    if (!show) return null;
    const lowerCaseTheatre = show.theatre?.toLowerCase() || "";
    const formattedDate = show.showdate ? dayjs(show.showdate).format("MMM D, YYYY") : "N/A";
    const formattedTime = convertTo12HourFormat(show.showtime);
    const handleBuyTickets = () => {
        if (lowerCaseTheatre && show.showId) {
            navigate(`/seats/${lowerCaseTheatre}/${show.showId}`);
        } else {
            console.error("Missing theatre name or showId for navigation:", show);
        }
    }
    return (
      <div className="show-card">
         <div className="show-card__icon-area"><MdTheaters /></div>
         <div className="show-card__info-area">
             <h3 className="show-card__theatre">{show.theatre || "Unknown Theatre"}</h3>
             <div className="show-card__meta">
                <span className="meta-item"><MdCalendarToday /> {formattedDate}</span>
                <span className="meta-item"><MdOutlineTimer /> {formattedTime}</span>
             </div>
         </div>
         <div className="show-card__actions-area">
            <button className="show-card__button" onClick={handleBuyTickets}>
                <MdOutlineConfirmationNumber /> <span>Buy Tickets</span>
            </button>
         </div>
      </div>
    );
  };


 // Loading State (No change)
  const LoadingState = () => (
    <div className="movie-shows-page__loading">
      <Loader />
    </div>
  );

   // Error State (No change)
  const ErrorState = () => (
    <div className="movie-shows-page__message movie-shows-page__message--error">
       <MdErrorOutline />
       <h3>Oops! Something went wrong.</h3>
       <p>We couldn't load the showtimes. Please try again later.</p>
       <Link to="/" className="movie-shows-page__back-button">Go Home</Link>
    </div>
  );

  // No Shows State (No change)
  const NoShowsState = () => (
    <div className="movie-shows-page__message movie-shows-page__message--empty">
      <TbMovieOff />
      <h3>No Shows Available</h3>
      <p>There are currently no scheduled shows for this movie.</p>
      <Link to="/" className="movie-shows-page__back-button">Browse Other Movies</Link>
    </div>
  );

  // --- MAIN RETURN ---
  return (
    <>
      <Header />
      <main className="movie-shows-page">
        <ContentWrapper>
          {/* *** MODIFIED TITLE DISPLAY *** */}
          <h1 className="movie-shows-page__title">
             Available Shows 
          </h1>

          {loading ? (
            <LoadingState />
          ) : error ? (
             <ErrorState />
          ) : showsData && showsData.length > 0 ? (
            <div className="shows-grid">
              {showsData.map((s) => (
                <ShowCard key={s.showId || `${s.theatre}-${s.showdate}-${s.showtime}`} show={s} />
              ))}
            </div>
          ) : (
            <NoShowsState />
          )}
        </ContentWrapper>
      </main>
      <Footer />
    </>
  );
};

export default MovieShows;