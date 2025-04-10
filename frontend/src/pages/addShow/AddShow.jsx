import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs"; 

// Component Imports (CHECK PATHS)
// import AdminHeader from "../../components/adminHeader/AdminHeader"; // Old path likely
import Header from "../../components/adminHeader/AdminHeader";; // Use new Admin Navbar
import Footer from "../../components/footer/Footer"; // Optional Footer
import Loader from "../../components/loader/Loader";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // For layout
import { render } from "../../host"; // Check path
import useFetch from "../../hooks/useFetch"; // Keep using useFetch here

// Icons
import { IoAddCircleOutline } from "react-icons/io5"; // Keep for add prompt
import { MdOutlineTheaters, MdOutlineMovie, MdOutlineCalendarToday, MdOutlineTimer } from "react-icons/md"; // Icons for fields

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

const AddShow = () => {
  // === STATE ===
  const initialFormState = { movieId: "", theatre: "", showtime: "", showdate: "" };
  const [showDetails, setShowDetails] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button loading
  const navigate = useNavigate();

  // === DATA FETCHING (Using useFetch as per original) ===
  // Add basic error handling or logging if useFetch doesn't handle it internally
  const { resData: moviesRes, loading: moviesLoading, error: moviesError } = useFetch(`/api/movie/getmovies?query=`);
  const { resData: theatreRes, loading: theatresLoading, error: theatresError } = useFetch(`/api/theatre/gettheatres`);

  // Extract data safely
  const movies = moviesRes?.data?.movies || [];
  const theatres = theatreRes?.data?.theatres || [];
  const isLoadingData = moviesLoading || theatresLoading;

  // === AUTH CHECK ===
  useEffect(() => {
    const jwtToken = Cookies.get("adminJwtToken");
    if (!jwtToken) navigate("/admin/login");
  }, [navigate]);

  // === EVENT HANDLERS ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShowDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleValidation = () => { // Keep core validation logic
    const { theatre, showtime, showdate, movieId } = showDetails;
    if (!movieId) { toast.error("Please select a movie!", toastOptions); return false; }
    if (!theatre) { toast.error("Please select a theatre!", toastOptions); return false; }
    if (!showdate) { toast.error("Please select a show date!", toastOptions); return false; }
    if (!showtime) { toast.error("Please select a show time!", toastOptions); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const host = `${render}/api/shows/addshow`;
      const jwtToken = Cookies.get("adminJwtToken");
      const payload = {
          showId: v4(),
          // Ensure keys match what API expects, assuming they match state keys
          movieId: showDetails.movieId,
          theatre: showDetails.theatre,  // API might expect theatreName? Adjust if needed
          showdate: showDetails.showdate,
          showtime: showDetails.showtime,
      };
      const res = await axios.post(host, payload, { headers: { "auth-token": jwtToken } });
      const { status, msg } = res.data;

      if (status === true) {
        toast.success(msg || "Show added successfully!", {...toastOptions, theme: "colored"});
        setShowDetails(initialFormState); // Reset form
        // navigate("/admin"); // Optional: Redirect after success
      } else {
        toast.error(msg || "Failed to add show.", toastOptions);
      }
    } catch (error) {
      console.error("Error adding show:", error);
      toast.error(error.response?.data?.msg || "An error occurred.", toastOptions);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
  return (
    <>
      {/* Use new AdminNavbar */}
      <Header />
      <main className="add-show-page">
        <ContentWrapper>
          {isLoadingData ? (
            <div className="add-show-page__loader"> <Loader /> </div>
          ) : theatresError || moviesError ? (
             <div className="add-show-page__message add-show-page__message--error">
                 <MdErrorOutline/>
                 <h3>Error Loading Data</h3>
                 <p>Could not load necessary movie or theatre data.</p>
                 <button onClick={() => window.location.reload()}>Retry</button> {/* Simple retry */}
             </div>
          ) : (
            <div className="add-show-card">
              <h1 className="add-show-card__title">
                Add New <span>Show</span>
              </h1>
              <form onSubmit={handleSubmit} className="add-show-form">
                {/* Movie Select */}
                <div className="form-group">
                  <label htmlFor="movieId"><MdOutlineMovie/> Select Movie</label>
                  {movies.length > 0 ? (
                    <select id="movieId" name="movieId" value={showDetails.movieId} onChange={handleChange} required>
                      <option value="" disabled>-- Select a Movie --</option>
                      {movies.map((m) => (
                        <option value={m.movieId} key={m.movieId}>
                          {m.movieName ? m.movieName.charAt(0).toUpperCase() + m.movieName.slice(1) : `Movie ID: ${m.movieId}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="add-prompt" onClick={() => navigate("/admin/addmovie")}>
                      <IoAddCircleOutline /> <span>No movies found. Add Movie?</span>
                    </div>
                  )}
                </div>

                {/* Theatre Select */}
                <div className="form-group">
                  <label htmlFor="theatre"><MdOutlineTheaters/> Select Theatre</label>
                  {theatres.length > 0 ? (
                    <select id="theatre" name="theatre" value={showDetails.theatre} onChange={handleChange} required>
                       <option value="" disabled>-- Select a Theatre --</option>
                       {theatres.map((t) => (
                         <option value={t.theatreName} key={t.theatreId}>
                           {t.theatreName ? t.theatreName.charAt(0).toUpperCase() + t.theatreName.slice(1) : `Theatre ID: ${t.theatreId}`}
                         </option>
                       ))}
                    </select>
                   ) : (
                     <div className="add-prompt" onClick={() => navigate("/admin/addtheatre")}>
                       <IoAddCircleOutline /> <span>No theatres found. Add Theatre?</span>
                     </div>
                   )}
                </div>

                {/* Date Input */}
                 <div className="form-group">
                   <label htmlFor="showdate"><MdOutlineCalendarToday/> Show Date</label>
                   <input
                      id="showdate"
                      name="showdate"
                      type="date"
                      value={showDetails.showdate}
                      onChange={handleChange}
                      required
                      // Optional: Set min attribute to today's date
                      min={dayjs().format('YYYY-MM-DD')}
                   />
                 </div>

                 {/* Time Input */}
                 <div className="form-group">
                   <label htmlFor="showtime"><MdOutlineTimer/> Show Time</label>
                   <input
                      id="showtime"
                      name="showtime"
                      type="time"
                      value={showDetails.showtime}
                      onChange={handleChange}
                      required
                      step="300" // Optional: Allow 5-minute increments
                   />
                 </div>

                 {/* Submit Button */}
                  <button
                      type="submit"
                      className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting || isLoadingData} // Disable while loading data too
                   >
                      {isSubmitting ? 'Adding Show...' : 'Add Show'}
                   </button>
              </form>
            </div>
          )}
        </ContentWrapper>
      </main>
      <ToastContainer />
      {/* Optional Footer */}
      {/* <Footer /> */}
    </>
  );
};

export default AddShow;