import React, { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Can potentially remove if not used directly after login check
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component Imports (CHECK PATHS)
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import BookingCardSkeleton from "../../components/loader/BookingCardSkeleton"; // Import new skeleton
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // Check path
import { render } from "../../host"; // Check path

// Icons
import { LuHistory } from "react-icons/lu";
import { MdOutlineLocalMovies, MdOutlineTheaters, MdOutlineCalendarToday, MdOutlineTimer, MdOutlineEventSeat, MdOutlineAttachMoney, MdCancel, MdErrorOutline } from "react-icons/md";

// Style Import
import "./style.scss"; // Check path


// --- Main Bookings Component ---
const Bookings = () => {
  const navigate = useNavigate();

  // === LOGIN CHECK ===
  useEffect(() => {
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) {
      toast.info("Login required to view bookings.", { autoClose: 2000 });
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // === TOAST OPTIONS ===
  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000, // Slightly longer for feedback
    pauseOnHover: true,
    draggable: true,
    theme: "light", // Match theme
    closeOnClick: true,
  };

  // === DATA FETCHING with SWR ===
  const fetcher = useCallback(async (url) => {
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) throw new Error("User not authenticated"); // Throw error if no token for auth routes

    const headers = { 'auth-token': jwtToken };
    try {
      const { data: apiResponse } = await axios.get(url, { headers });
      if (!apiResponse?.status) {
        throw new Error(apiResponse?.msg || 'API returned unsuccessful status');
      }
      // Assuming response is { status: true, bookings: [...] }
      return apiResponse.bookings || []; // Return bookings array or empty array
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      const errorMessage = error.response?.data?.msg || error.message || `Failed to load bookings`;
      const fetchError = new Error(errorMessage);
      fetchError.status = error.response?.status || error.status || 500;
      throw fetchError;
    }
  }, []); // Include relevant dependencies if any, [] is ok if token is read inside

  const {
    data: bookings, // Renamed from resData for clarity
    error: fetchError,
    isLoading, // Use SWR's loading state
    mutate, // To re-fetch after cancellation
  } = useSWR(`${render}/api/bookings/getbookings`, fetcher, {
      shouldRetryOnError: false,
      revalidateOnFocus: false, // Don't refetch just on window focus
  });

  // === EVENT HANDLERS ===
  const handleCancel = async (booking) => {
    if (!booking || !booking.bookingId) return;

    // --- More robust check for cancellability ---
    const now = dayjs();
    const showDateTime = dayjs(`${booking.showdate}T${booking.showtime}`);
    // Allow cancellation if the show time is in the future (add a buffer maybe, e.g., 1 hour)
    const isCancellable = showDateTime.isAfter(now); //.add(1, 'hour')); // Example: Cancel up to 1 hr before

    if (!isCancellable) {
        toast.error("This booking can no longer be cancelled.", toastOptions);
        return;
    }

    // Optional: Confirmation Dialog
    if (!window.confirm("Are you sure you want to cancel this booking? This cannot be undone.")) {
      return;
    }

    // Prepare tickets data for the backend (assuming it needs the original structure)
    const tickets = booking.ticketsData || { balcony: {}, middle: {}, lower: {} };

    try {
      const host = `${render}/api/bookings/cancelbooking/${booking.bookingId}`;
      const jwtToken = Cookies.get("jwtToken"); // Get token again for cancellation
      if (!jwtToken) throw new Error("Authentication token missing.");

      const { data } = await axios.put(host, { tickets, bookingId: booking.bookingId }, { // Pass tickets in body if needed by backend
          headers: { 'auth-token': jwtToken }
      });

      if (data.status) {
        toast.success(data.msg || "Booking cancelled successfully!", { ...toastOptions, theme: 'colored' });
        mutate(); // Re-fetch bookings list
      } else {
        toast.error(data.msg || "Cancellation failed.", toastOptions);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error?.message || "Something went wrong during cancellation.", toastOptions);
    }
  };


  // --- UTILITY to get seat numbers ---
  const getSeatNumbers = (seatObject) => {
    if (!seatObject) return [];
    // Filter out the 'total' key and return only numeric keys (seat numbers)
    return Object.keys(seatObject).filter(key => /^\d+$/.test(key)).map(Number).sort((a,b)=> a-b);
  };

  // === RENDER LOGIC ===

  const RenderBookingCard = ({ booking }) => {
    const {
      bookingId, media, movieName = "N/A", showdate, showtime, theatreName = "N/A", ticketsData = {}
    } = booking;

    const { balcony = {}, middle = {}, lower = {} } = ticketsData;
    const price = (balcony.total || 0) + (middle.total || 0) + (lower.total || 0);

    const balconySeats = getSeatNumbers(balcony);
    const middleSeats = getSeatNumbers(middle);
    const lowerSeats = getSeatNumbers(lower);

    // Check cancellability again for button display
    const now = dayjs();
    const showDateTime = dayjs(`${showdate}T${showtime}`);
    const canCancel = showDateTime.isAfter(now);

    return (
      <article className="booking-card" key={bookingId}>
        <div className="booking-card__poster">
          <img src={media || '/default-poster.jpg'} alt={`${movieName} Poster`} loading="lazy"/>
        </div>
        <div className="booking-card__details">
          <h2 className="booking-card__title">{movieName}</h2>
          <div className="booking-card__info-item">
            <MdOutlineTheaters /> <span>{theatreName}</span>
          </div>
          <div className="booking-card__info-item">
             <MdOutlineCalendarToday /> <span>{dayjs(showdate).format("ddd, MMM D, YYYY")}</span>
          </div>
          <div className="booking-card__info-item">
             <MdOutlineTimer /> <span>{dayjs(`${showdate}T${showtime}`).format("h:mm A")}</span>
          </div>

          {(balconySeats.length > 0 || middleSeats.length > 0 || lowerSeats.length > 0) && (
            <div className="booking-card__seats-info">
                <h4 className="seats-info__title"><MdOutlineEventSeat/> Seats:</h4>
                {balconySeats.length > 0 && <p className="seats-info__row">Balcony: {balconySeats.join(', ')}</p>}
                {middleSeats.length > 0 && <p className="seats-info__row">Middle: {middleSeats.join(', ')}</p>}
                {lowerSeats.length > 0 && <p className="seats-info__row">Lower: {lowerSeats.join(', ')}</p>}
            </div>
           )}

           <div className="booking-card__price">
              <MdOutlineAttachMoney /> Total Price: <span>{price} ₹</span>
           </div>

           {canCancel && (
              <button
                onClick={() => handleCancel(booking)}
                className="booking-card__cancel-button"
                type="button"
              >
                 <MdCancel /> Cancel Booking
              </button>
           )}
        </div>
      </article>
    );
  }

  const RenderEmptyBookings = () => ( /* ... Same as before ... */
    <div className="bookings-page__message bookings-page__message--empty">
      <LuHistory />
      <h3>No Booking History</h3>
      <p>You haven't booked any tickets yet.</p>
      <button onClick={() => navigate('/')} className="empty-bookings__button">
          Browse Movies
      </button>
    </div>
  );

   const RenderError = () => (
      <div className="bookings-page__message bookings-page__message--error">
        <MdErrorOutline />
        <h3>Oops! Something went wrong.</h3>
        <p>{fetchError?.message || "Could not load your bookings."}</p>
         <button onClick={() => mutate()} className="empty-bookings__button">
          Retry
        </button>
      </div>
   );

  const RenderSkeleton = () => (
      <div className="bookings-grid bookings-grid--loading">
         {Array.from({ length: 3 }).map((_, index) => (
             <BookingCardSkeleton key={index} />
         ))}
      </div>
  );

  // --- MAIN RETURN ---
  return (
    <>
      <Header />
      <main className="bookings-page">
        <ContentWrapper>
           <h1 className="bookings-page__title">
              Your <span>Bookings</span>
           </h1>

           {isLoading ? (
              <RenderSkeleton />
           ) : fetchError ? (
              <RenderError />
           ) : bookings && bookings.length > 0 ? (
             <div className="bookings-grid">
               {bookings.map((b) => (
                 <RenderBookingCard key={b.bookingId} booking={b} />
               ))}
             </div>
           ) : (
             <RenderEmptyBookings />
           )}

        </ContentWrapper>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default Bookings;