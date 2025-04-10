import React, { useContext, useMemo } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Show from "../../components/show/Show"; // Your movie card component
import MovieCardSkeleton from "../../components/loader/MovieCardSkeleton"; // Import skeleton
import useFetch from "../../hooks/useFetch";
import { searchContext } from "../../context/searchContext";
import { Link } from "react-router-dom"; // Needed for Hero button
import dayjs from 'dayjs';
// Import icons for Hero section
import { MdPlayCircleOutline, MdInfoOutline } from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as Home
const Home = () => {
  // === CORE LOGIC (Mostly the Same) ===
  const { query } = useContext(searchContext);
  const { resData, error, loading } = useFetch(`/api/movie/getmovies`, {
    query,
  });

  // Extract movies data once loaded, memoize for stability
  const movies = useMemo(() => resData?.data?.movies || [], [resData]);

  // Extract the first movie for the Hero section
  const heroMovie = movies.length > 0 ? movies[0] : null;

  // All other movies for the grid (exclude the hero movie)
  const gridMovies = movies.slice(1);

  // Original error handling
  if (error) {
    alert("Something went wrong fetching movies!");
    // Consider rendering an error component here instead
  }
  // === END CORE LOGIC ===


  // --- NEW MODERN UI Rendering ---
  return (
    <>
      <Header />

      {/* Use main tag */}
      <main className="home-page">

        {/* --- Hero Section --- */}
        {/* Render Hero only when not loading AND heroMovie exists */}
        {!loading && heroMovie && (
          <section className="hero-section">
            {/* Background Image */}
            <div className="hero-section__backdrop">
              {/* Use movie 'media' (poster) or a dedicated 'backdropUrl' if available */}
              <img src={heroMovie.media || '/default-backdrop.jpg'} alt={`${heroMovie.movieName} backdrop`} />
              <div className="hero-section__overlay"></div> {/* Gradient overlay */}
            </div>

            {/* Content */}
            <div className="hero-section__content">
              <div className="hero-section__poster">
                 <img src={heroMovie.media || '/default-poster.jpg'} alt={`${heroMovie.movieName} poster`} />
              </div>
              <div className="hero-section__info">
                <h1 className="hero-section__title">{heroMovie.movieName.charAt(0).toUpperCase() + heroMovie.movieName.slice(1)}</h1>
                {/* Add a short description/tagline if available in data */}
                {/* <p className="hero-section__tagline">{heroMovie.tagline || 'Exciting new release!'}</p> */}
                <p className="hero-section__release">
                  Released: {heroMovie.releaseDate ? dayjs(heroMovie.releaseDate).format("MMM D, YYYY") : "N/A"}
                </p>
                <div className="hero-section__actions">
                  <Link to={`/showdetails/${heroMovie.movieId || heroMovie._id}`} className="hero-section__button hero-section__button--primary">
                    <MdInfoOutline /> View Details
                  </Link>
                  {/* Optional: Add Trailer Button if you have trailer links */}
                  {/* <button className="hero-section__button">
                    <MdPlayCircleOutline /> Watch Trailer
                  </button> */}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- Main Content Container (Movies Grid) --- */}
        <div className="home-page__container">

          {/* Title for the movies grid (optional, can be removed if Hero is enough) */}
          <h2 className="home-page__grid-title">
            {query && query.trim() ? `Search Results for "${query}"` : "Discover Movies"}
          </h2>

          {/* Conditional Rendering for Grid */}
          {loading ? (
            // Skeleton Loading State
            <div className="home-page__movie-grid home-page__movie-grid--loading">
              {/* Render multiple skeletons */}
              {Array.from({ length: 8 }).map((_, index) => ( // Render 8 placeholders
                <MovieCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            // Movies Loaded State
            <>
              {movies.length > 0 ? (
                 // Determine which movies to show in the grid
                 // If there was a hero movie, show `gridMovies`, otherwise show all `movies`
                 <div className="home-page__movie-grid">
                   {(heroMovie ? gridMovies : movies).map((movie) => (
                     <Show key={movie._id || movie.movieId} data={movie} />
                   ))}
                 </div>
               ) : (
                // No Movies Found Message
                <div className="home-page__no-results">
                  <h2>No movies found {query && query.trim() ? `matching "${query}"` : ''}.</h2>
                  <p>Try adjusting your search or check back later!</p>
                </div>
              )}
            </>
          )}
        </div> {/* End .home-page__container */}
      </main> {/* End .home-page */}

      <Footer />
    </>
  );
};

export default Home;