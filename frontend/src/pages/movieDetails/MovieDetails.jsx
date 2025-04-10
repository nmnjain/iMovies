//done

import React, { useEffect, useState, useContext } from "react"; // Added useContext
import axios from "axios";
import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure toast styles are imported

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader"; // Replaced with Skeleton below
import MovieDetailsSkeleton from "../../components/loader/MovieDetailsSkeleton"; // Import new skeleton
import Reviews from "../../components/reviews/Reviews";
import useFetch from "../../hooks/useFetch";
import { render } from "../../host"; // Your API host

// Import necessary icons
import {
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
  MdOutlineCalendarToday,
  MdOutlineTimer,
  MdMovie // Placeholder for poster
} from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as MovieDetails
const MovieDetails = () => {
  // === CORE LOGIC (Kept the Same - with minor adjustments for clarity) ===
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { movieId } = useParams(); // Get movieId from URL parameters

  // Fetch movie details
  const { resData, loading, error } = useFetch(
    `/api/movie/getmoviedetails/${movieId}`
  );
  const movieDetails = resData?.data?.movie; // Simplified access

  // Toast options (Consider making these globally configurable if used often)
  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000, // Adjusted timing
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Match theme consistency from Auth page
    closeOnClick: true,
  };
  const movieTitleForLink = movieDetails?.movieName;
  const movieIdForLink = movieDetails?.movieId;

  // ... assume movieDetails object has movieId and movieName ...
  const movieIdForNav = movieDetails?.movieId;
  const movieTitleForNav = movieDetails?.movieName;

  const handleBookTicketsClick = () => {
    if (movieIdForNav) {
      // Pass state as the second argument to navigate
      navigate(`/movieshows/${movieIdForNav}`, { state: { movieTitle: movieTitleForNav } });
    } else {
      console.error("Cannot navigate: Movie ID missing");
      // Add user feedback if needed
    }
  };


  // Function to check if movie is saved
  const getSavedMovies = async () => {
    const host = `${render}/api/favorite/getsavedmovies`;
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) return; // Don't check if not logged in

    try {
      const { data } = await axios.get(host, {
        headers: { "auth-token": jwtToken },
      });
      if (data?.status && data?.favoriteMoviesData) {
        const isLiked = data.favoriteMoviesData.some(m => m.movieId === movieId);
        setLiked(isLiked);
      } else if (!data?.status && data?.msg) {
        // Only show error if not loading initial state
        // toast.error(data.msg, toastOptions);
        console.error("Error fetching saved movies:", data?.msg);
      }
    } catch (err) {
      console.error("Error in getSavedMovies request:", err);
      // toast.error("Could not check favorites.", toastOptions);
    }
  };

  // Fetch saved status when component mounts or movieId changes
  useEffect(() => {
    if (movieId) {
      getSavedMovies();
    }
    // Reset liked state when movieId changes
    return () => setLiked(false);
  }, [movieId]);

  // Function to handle liking a movie
  const handleLike = async (id) => {
    if (!id) return;
    setLiked(true); // Optimistic update
    const host = `${render}/api/favorite/savemovie`;
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) {
      toast.error("Please login to save movies.", toastOptions);
      setLiked(false); // Revert optimistic update
      return;
    }
    try {
      const { data } = await axios.post(host, { movieId: id }, { headers: { "auth-token": jwtToken } });
      if (data?.status) {
        toast.success(data.msg || "Added to favorites!", { ...toastOptions, theme: 'colored', autoClose: 1500 });
      } else {
        toast.error(data.msg || "Failed to save.", toastOptions);
        setLiked(false); // Revert optimistic update
      }
    } catch (err) {
      console.error("Error saving movie:", err);
      toast.error("An error occurred while saving.", toastOptions);
      setLiked(false); // Revert optimistic update
    }
  };

  // Function to handle disliking a movie
  const handleDislike = async (id) => {
    if (!id) return;
    setLiked(false); // Optimistic update
    const host = `${render}/api/favorite/unsavemovie/${id}`;
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) {
      // This case shouldn't happen if dislike button only shows when logged in and liked
      console.error("Cannot dislike if not logged in");
      return;
    }
    try {
      const { data } = await axios.delete(host, { headers: { "auth-token": jwtToken } });
      if (data?.status) {
        toast.info(data.msg || "Removed from favorites.", { ...toastOptions, autoClose: 1500 }); // Use info for removal
      } else {
        toast.error(data.msg || "Failed to remove.", toastOptions);
        setLiked(true); // Revert optimistic update
      }
    } catch (err) {
      console.error("Error removing movie:", err);
      toast.error("An error occurred while removing.", toastOptions);
      setLiked(true); // Revert optimistic update
    }
  };

  // Handle API fetch error
  if (error) {
    // Render an error message instead of just alerting
    return (
      <>
        <Header />
        <div className="movie-details-page movie-details-page--error">
          <h2>Oops! Something went wrong.</h2>
          <p>We couldn't load the movie details. Please try again later.</p>
          {/* Optional: Add a button to go back or retry */}
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <Footer />
      </>
    );
  }

  // Prepare display data safely
  const title = movieDetails?.movieName ? movieDetails.movieName.charAt(0).toUpperCase() + movieDetails.movieName.slice(1) : "Loading title...";
  const releaseYear = movieDetails?.releaseDate ? dayjs(movieDetails.releaseDate).format("YYYY") : "";
  const formattedReleaseDate = movieDetails?.releaseDate ? dayjs(movieDetails.releaseDate).format("MMM D, YYYY") : "N/A";
  const runtime = movieDetails?.runtime ? `${movieDetails.runtime} min` : "N/A";
  const description = movieDetails?.description || "No description available.";
  const genres = movieDetails?.genres ? movieDetails.genres.split(",") : [];
  const posterUrl = movieDetails?.media; // Assuming 'media' is the poster URL

  // === END CORE LOGIC ===


  // --- NEW MODERN UI Rendering ---
  return (
    <>
      <Header />
      {/* Main container for the page */}
      <main className="movie-details-page">
        {loading ? (
          // Use Skeleton Loader while loading
          <MovieDetailsSkeleton />
        ) : movieDetails ? (
          // Render content when data is available
          <>
            {/* Optional Backdrop Section */}
            {/* <section className="details-backdrop">
              <img src={posterUrl || '/default-backdrop.jpg'} alt="" />
              <div className="details-backdrop__overlay"></div>
            </section> */}

            {/* Main Details Section */}
            <section className="details-content">
              <div className="details-content__container">
                {/* Left Side - Poster */}
                <div className="details-content__poster">
                  {posterUrl ? (
                    <img src={posterUrl} alt={`${title} Poster`} />
                  ) : (
                    <div className="details-content__poster-placeholder">
                      <MdMovie />
                      <span>No Poster</span>
                    </div>
                  )}
                </div>

                {/* Right Side - Information */}
                <div className="details-content__info">
                  {/* Favorite Button (Positioned absolutely relative to info) */}
                  <button
                    className={`details-content__like-button ${liked ? 'liked' : ''}`}
                    onClick={() => liked ? handleDislike(movieDetails.movieId) : handleLike(movieDetails.movieId)}
                    aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                  >
                    {liked ? <MdOutlineFavorite /> : <MdOutlineFavoriteBorder />}
                  </button>

                  {/* Title and Year */}
                  <h1 className="details-content__title">
                    {title} {releaseYear && `(${releaseYear})`}
                  </h1>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="details-content__genres">
                      {genres.map((genre) => (
                        <span key={genre} className="genre-tag">{genre.trim()}</span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="details-content__section">
                    <h2 className="details-content__section-title">Overview</h2>
                    <p className="details-content__description">{description}</p>
                  </div>

                  {/* Release Date & Runtime */}
                  <div className="details-content__meta">
                    <div className="meta-item">
                      <MdOutlineCalendarToday />
                      <span className="meta-item__label">Release Date:</span>
                      <span>{formattedReleaseDate}</span>
                    </div>
                    <div className="meta-item">
                      <MdOutlineTimer />
                      <span className="meta-item__label">Runtime:</span>
                      <span>{runtime}</span>
                    </div>
                  </div>

                  {/* Book Tickets Button (Moved here for better flow) */}
                  <div className="details-content__actions">
                    <button onClick={handleBookTicketsClick} className="book-tickets-button">
                      Book Tickets
                    </button>
                  </div>

                </div> {/* End Info */}
              </div> {/* End Container */}
            </section>

            {/* Reviews Section */}
            <section className="details-reviews">
              <div className="details-reviews__container">
                <h2 className="details-reviews__title">Reviews</h2>
                <Reviews movieId={movieId} /> {/* Keep existing Reviews component */}
              </div>
            </section>
          </>
        ) : (
          // Handle case where loading is finished but no movieDetails found
          <div className="movie-details-page--error">
            <h2>Movie Not Found</h2>
            <p>We couldn't find details for this movie.</p>
            <button onClick={() => navigate('/')}>Go Home</button>
          </div>
        )}
      </main> {/* End movie-details-page */}

      <Footer />
      <ToastContainer />
    </>
  );
};

export default MovieDetails;