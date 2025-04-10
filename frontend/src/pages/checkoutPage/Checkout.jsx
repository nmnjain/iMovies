import React, { useEffect, useState } from "react"; // Import React
import axios from "axios";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Component Imports (CHECK PATHS!)
// import Header from "../../components/header/Header"; // Header optional here
// import Footer from "../../components/footer/Footer"; // Footer optional here
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // Check path
import Loader from "../../components/loader/Loader"; // Import Loader
import { render } from "../../host"; // Check path

// Icons
import { MdOutlineDone, MdClose, MdOutlineConfirmationNumber } from "react-icons/md";

// Style Import
import "./style.scss"; // Check path

// Keep component name as Checkout
const Checkout = ({ selectedSeats, showId, theatreName, totalPrice }) => { // Accept totalPrice prop too
  // State for this component
  const [showTicket, setShowTicket] = useState(false); // Renamed from 'modal'
  // State for internally fetched details
  const [ticketDisplayDetails, setTicketDisplayDetails] = useState(null); // Store combined details here
  const [isLoading, setIsLoading] = useState(true); // Internal loading state
  const navigate = useNavigate(); // Use navigate hook

  // --- INTERNAL DATA FETCHING (Kept from your original code) ---
  const getShowAndMovieDetails = async () => {
    if (!showId) {
        console.error("Checkout: showId is missing.");
        setIsLoading(false);
        // Handle missing showId error - maybe navigate back or show error message
        return;
    }
    setIsLoading(true); // Set loading true at start of fetch
    try {
      // 1. Fetch Show Details (date, time, movieId)
      const showHost = `${render}/api/shows/getshow/${showId}`;
      const { data: showResponse } = await axios.get(showHost);

      if (showResponse.status && showResponse.show?.movieId) {
        const fetchedShow = showResponse.show;

        // 2. Fetch Movie Details (name, media, etc.) using movieId from show
        const movieHost = `${render}/api/movie/getmoviedetails/${fetchedShow.movieId}`;
        const { data: movieResponse } = await axios.get(movieHost);

        if (movieResponse?.status && movieResponse?.movie) {
          const fetchedMovie = movieResponse.movie;

          // 3. Combine necessary details for display
          const details = {
            movieName: fetchedMovie.movieName || "N/A",
            media: fetchedMovie.media,
            showdate: fetchedShow.showdate,
            showtime: fetchedShow.showtime,
            // Add other details if needed by the ticket display
            runtime: fetchedMovie.runtime,
            genres: fetchedMovie.genres,
            certification: fetchedMovie.certification,
          };
          setTicketDisplayDetails(details); // Set the combined state
        } else {
           throw new Error(movieResponse?.msg || "Failed to fetch movie details");
        }
      } else {
        throw new Error(showResponse?.msg || "Failed to fetch show details");
      }
    } catch (error) {
      console.error("Error fetching details in Checkout:", error);
      // Optionally set an error state here to display feedback
    } finally {
      setIsLoading(false); // Set loading false when done or on error
    }
  };

  // Fetch data when the component mounts or showId changes
  useEffect(() => {
    getShowAndMovieDetails();
  }, [showId]); // Dependency array includes showId

  // === DATA FROM PROPS (for Seats & Price) ===
  const { balcony = [], middle = [], lower = [] } = selectedSeats || {};

  // === DERIVED/FORMATTED DATA ===
  // Format data using the *internally fetched* ticketDisplayDetails
  const formattedDate = ticketDisplayDetails?.showdate ? dayjs(ticketDisplayDetails.showdate).format("ddd, MMM D, YYYY") : "N/A";
  const formattedTime = ticketDisplayDetails?.showtime ? dayjs(`${ticketDisplayDetails.showdate}T${ticketDisplayDetails.showtime}`).format("h:mm A") : "N/A";

  // Utility to get seat numbers (numeric only, sorted)
  const getSeatNumbers = (seatArray) => {
     if (!Array.isArray(seatArray) || seatArray.length === 0) return [];
     return seatArray.filter(s => typeof s === 'number' || /^\d+$/.test(s)).map(Number).sort((a, b) => a - b);
  };
  const balconySeats = getSeatNumbers(balcony);
  const middleSeats = getSeatNumbers(middle);
  const lowerSeats = getSeatNumbers(lower);
  const totalSeats = balconySeats.length + middleSeats.length + lowerSeats.length;

  // === EVENT HANDLERS ===
  const openTicket = () => {
      if (!isLoading && ticketDisplayDetails) { // Only open if data is loaded
          setShowTicket(true);
      } else if (!isLoading && !ticketDisplayDetails) {
          // Handle case where data fetch failed but user tries to view
          console.error("Cannot view ticket, details failed to load.");
          // Optionally show a toast message
      }
  };

  const closeAndGoHome = () => {
      setShowTicket(false);
      navigate('/');
  };


  // === RENDER FUNCTIONS ===

  // Confirmation Message (Modernized)
  const ConfirmationMessage = () => (
      <div className="checkout-confirmation">
        <div className="confirmation-icon-wrapper">
          <div className="confirmation-icon"><MdOutlineDone /></div>
        </div>
        <h2 className="confirmation-title">Booking Successful!</h2>
        <p className="confirmation-subtitle">Your payment was processed successfully.</p>
        <button onClick={openTicket} className="confirmation-button" disabled={isLoading}>
           {isLoading ? "Loading Ticket..." : <><MdOutlineConfirmationNumber/> View Ticket</>}
        </button>
      </div>
  );

  // Ticket Details "Modal" (Modernized) - Uses internal state 'ticketDisplayDetails'
  const TicketDetails = () => (
      <article className="ticket-details">
         <div className="ticket-details__header">
            <h1 className="ticket-details__main-title">Your Ticket 🎉</h1>
             <button className="ticket-details__close-button" onClick={closeAndGoHome} aria-label="Close Ticket and Go Home"> <MdClose /> </button>
         </div>
         <div className="ticket-details__content">
            <div className="ticket-details__poster">
              <img src={ticketDisplayDetails?.media || '/default-poster.jpg'} alt={`${ticketDisplayDetails?.movieName} Poster`} loading="lazy"/>
            </div>
            <div className="ticket-details__info">
              <h2 className="ticket-details__movie-title">{ticketDisplayDetails?.movieName}</h2>
              {/* Use theatreName prop */}
              <p className="ticket-details__theatre">{theatreName || "Theatre Name"}</p>
              <div className="ticket-details__showtime">
                 <p>{formattedDate}</p>
                 <p>{formattedTime}</p>
              </div>
              <div className="ticket-details__seats">
                  <h4 className="seats__title">Seats ({totalSeats} total):</h4>
                  {balconySeats.length > 0 && <p className="seats__row"><span>Balcony:</span> {balconySeats.join(', ')}</p>}
                  {middleSeats.length > 0 && <p className="seats__row"><span>Middle:</span> {middleSeats.join(', ')}</p>}
                  {lowerSeats.length > 0 && <p className="seats__row"><span>Lower:</span> {lowerSeats.join(', ')}</p>}
              </div>
              {/* Use totalPrice prop */}
              {/* <p className="ticket-details__price">Total Price: <span>{totalPrice || 0} ₹</span></p> */}
            </div>
         </div>
      </article>
  );

  // --- MAIN RETURN ---
  return (
    <>
      {/* No Header/Footer needed for focus */}
      <main className="checkout-page">
         <ContentWrapper>
           {/* Show confirmation first, then ticket based on state */}
           {!showTicket ? <ConfirmationMessage /> :
            // Only show ticket details if NOT loading AND details exist
            (isLoading ? <Loader /> : ticketDisplayDetails ? <TicketDetails /> :
              // Show simple error message if fetch failed before ticket view
               <div className="checkout-confirmation">
                  <h2 className="confirmation-title" style={{color: 'red'}}>Error</h2>
                  <p className="confirmation-subtitle">Could not load ticket details.</p>
                  <button onClick={closeAndGoHome} className="confirmation-button">Go Home</button>
               </div>
            )
           }
         </ContentWrapper>
      </main>
    </>
  );
};

export default Checkout;