import React, { useEffect } from "react"; // Removed useState if not needed directly
import Cookies from "js-cookie";
import axios from "axios";
import useSWR from "swr";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component Imports (CHECK PATHS!)
// import AdminHeader from "../../components/adminHeader/AdminHeader"; // Old path
import Header from "../../components/adminHeader/AdminHeader"; // Use new Navbar
import Footer from "../../components/footer/Footer"; // Optional Footer
import Loader from "../../components/loader/Loader";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // For layout
import { render } from "../../host"; // Check path

// Icons
import {
  MdOutlineMovie, // For empty state prompt
  MdMovieFilter, // Changed icon
  MdDeleteForever, // More prominent delete icon
  MdOutlineTheaters,
  MdOutlineCalendarToday,
  MdOutlineTimer,
  MdErrorOutline
} from "react-icons/md";

// Style Import
import "./style.scss"; // Check path

const toastOptions = {
  position: "bottom-right",
  autoClose: 3000,
  pauseOnHover: true,
  draggable: true,
  theme: "light", // Match theme
  closeOnClick: true,
};

const Admin = () => {
  const navigate = useNavigate();

  // === AUTH CHECK ===
  useEffect(() => {
    const adminToken = Cookies.get("adminJwtToken");
    if (!adminToken) {
      // Redirect immediately if no token
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // === DATA FETCHING ===
  const fetcher = async (url) => {
    const adminToken = Cookies.get("adminJwtToken");
    // If token check in useEffect passed, token should exist here, but double-check
    if (!adminToken) {
        // This condition might be redundant due to useEffect redirect, but good safety
        throw new Error("Admin authentication token not found.");
    }
    try {
      const { data } = await axios.get(url, {
        headers: { "auth-token": adminToken },
      });
      if (data?.status) {
        // Sort data here if desired, directly modifying the returned array
         const sortedData = data.adminShows || [];
         sortedData.sort(function (a, b) {
            try {
                const datetimeA = new Date(`${a.showdate}T${a.showtime}`);
                const datetimeB = new Date(`${b.showdate}T${b.showtime}`);
                if (isNaN(datetimeA) || isNaN(datetimeB)) return 0;
                return datetimeA - datetimeB;
            } catch(e) { return 0; }
         });
        return sortedData; // Return sorted array or empty array
      } else {
        // Throw error if API status is false
        throw new Error(data?.msg || "Failed to fetch admin shows");
      }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        const errorMessage = error.response?.data?.msg || error.message || `Failed to load admin shows`;
        const fetchError = new Error(errorMessage);
        fetchError.status = error.response?.status || error.status || 500;
        // Toasting inside fetcher can be noisy, let the component handle display
        // toast.error(errorMessage, toastOptions);
        throw fetchError; // Re-throw for SWR
    }
  };

  const {
    data: showsData = [], // Default to empty array
    error: fetchError,
    isLoading, // Use SWR loading state
    mutate, // To re-fetch after delete
  } = useSWR(`${render}/api/shows/getadminshows`, fetcher, {
      shouldRetryOnError: false, // Don't retry automatically on error
      revalidateOnFocus: true, // Revalidate when window regains focus (optional)
  });


  // === HELPERS ===
  const convertTo12HourFormat = (time24) => { // Keep helper function
    if (!time24 || !time24.includes(':')) return "N/A";
    try {
        const [hours, minutes] = time24.split(":"); let hoursInt = parseInt(hours);
        const meridiem = hoursInt >= 12 ? "PM" : "AM"; hoursInt = hoursInt % 12 || 12;
        return `${hoursInt}:${minutes} ${meridiem}`;
    } catch (e) { return "N/A"; }
  };

  // === EVENT HANDLERS ===
  const handleDelete = async (showId, movieId) => {
    if (!showId || !movieId) {
        toast.error("Cannot delete show: Missing ID.", toastOptions);
        return;
    }
    // Optional Confirmation
    if (!window.confirm(`Are you sure you want to delete show ID: ${showId}?`)) {
       return;
    }

    try {
      const host = `${render}/api/shows/deleteshow/${movieId}/${showId}`;
      const adminToken = Cookies.get("adminJwtToken"); // Get token for delete request
       if (!adminToken) throw new Error("Authentication required.");

      // Assume DELETE requires auth token
      const { data } = await axios.delete(host, { headers: { 'auth-token': adminToken }});

      if (data?.status) {
        toast.success(data.msg || "Show deleted successfully!", {...toastOptions, theme: "colored"});
        mutate(); // Trigger re-fetch of the show list
      } else {
        toast.error(data.msg || "Failed to delete show.", toastOptions);
      }
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error(error.response?.data?.msg || "An error occurred during deletion.", toastOptions);
    }
  };


  // --- RENDER LOGIC ---

  const RenderAdminShowCard = ({ show }) => {
      const { showId, movieId, movieName = "N/A", theatreName = "N/A", showdate, showtime } = show;
      const formattedDate = showdate ? dayjs(showdate).format("ddd, MMM D, YYYY") : "N/A";
      const formattedTime = convertTo12HourFormat(showtime);

      return (
          <article className="admin-show-card" key={showId}>
              <div className="admin-show-card__details">
                  <h3 className="admin-show-card__title">{movieName}</h3>
                  <div className="admin-show-card__info-item">
                      <MdOutlineTheaters /> <span>{theatreName}</span>
                  </div>
                  <div className="admin-show-card__info-item">
                      <MdOutlineCalendarToday /> <span>{formattedDate}</span>
                  </div>
                  <div className="admin-show-card__info-item">
                      <MdOutlineTimer /> <span>{formattedTime}</span>
                  </div>
              </div>
              <div className="admin-show-card__actions">
                  <button
                      className="delete-button"
                      onClick={() => handleDelete(showId, movieId)}
                      aria-label={`Delete show for ${movieName} at ${theatreName}`}
                  >
                      <MdDeleteForever />
                  </button>
              </div>
          </article>
      );
  };

  const RenderEmptyShows = () => (
     <div className="admin-page__message admin-page__message--empty">
        <MdMovieFilter />
        <h3>No Shows Scheduled</h3>
        <p>You haven't added any shows yet.</p>
        <button onClick={() => navigate("/admin/addshow")} className="empty-state__button">
             Add New Show
         </button>
     </div>
  );

   const RenderError = () => (
      <div className="admin-page__message admin-page__message--error">
        <MdErrorOutline />
        <h3>Error Loading Shows</h3>
        <p>{fetchError?.message || "Could not load the show list."}</p>
         <button onClick={() => mutate()} className="empty-state__button"> {/* Mutate to retry */}
          Retry
        </button>
      </div>
   );

    const RenderLoading = () => (
        <div className="admin-page__loader">
            {/* Optional: Could show skeleton cards here if preferred */}
            <Loader />
        </div>
    );

  // --- MAIN RETURN ---
  return (
    <>
      <Header />
      <main className="admin-page">
        <ContentWrapper>
          <h1 className="admin-page__title">
            Admin Dashboard - <span>Scheduled Shows</span>
          </h1>

          {isLoading ? (
             <RenderLoading />
          ) : fetchError ? (
             <RenderError />
          ) : showsData && showsData.length > 0 ? (
            <div className="admin-shows-grid">
              {showsData.map((show) => (
                <RenderAdminShowCard key={show.showId} show={show} />
              ))}
            </div>
          ) : (
            <RenderEmptyShows />
          )}

        </ContentWrapper>
      </main>
      {/* No Footer on Admin Pages Usually */}
      {/* <Footer /> */}
      <ToastContainer />
    </>
  );
};

export default Admin;