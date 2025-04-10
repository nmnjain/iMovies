import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import Cookies from "js-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSWR from "swr";

// Component Imports (CHECK PATHS)
import Header from "../../components/adminHeader/AdminHeader";
// import AdminNavbar from "../components\adminHeader\AdminHeader"; // Use the new Admin Navbar
import Footer from "../../components/footer/Footer"; // Include Footer if desired on admin pages
import Loader from "../../components/loader/Loader";
import AdminMovies from "../adminMovies/AdminMovies"; // Assuming path is correct
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // For layout
import { app } from "../../utils/firebase"; // Check path
import { render } from "../../host"; // Check path

// Icons
import { MdOutlineFileUpload, MdImage, MdClose, MdMovie, MdTextFields, MdNotes, MdOutlineLabel, MdOutlineCalendarToday, MdOutlineTimer, MdOutlinePolicy } from "react-icons/md"; // Changed icons

// Style Import
import "./style.scss"; // Keep this path

const toastOptions = {
  position: "bottom-right",
  autoClose: 3000,
  pauseOnHover: true,
  draggable: true,
  theme: "light", // Match theme
  closeOnClick: true,
};

const AddMovie = () => {
  // === STATE ===
  const initialFormState = { name: "", description: "", genres: "", releaseDate: "", runtime: "", certification: "" };
  const [movieDetails, setMovieDetails] = useState(initialFormState);
  const [file, setFile] = useState(null); // Use null initially
  const [media, setMedia] = useState(""); // Stores the download URL
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editMovieId, setEditMovieId] = useState(""); // Use a clear name
  const [isSubmitting, setIsSubmitting] = useState(false); // For Add/Edit submit
  const [isLoadingEditData, setIsLoadingEditData] = useState(false); // Loading state for fetching edit data

  const navigate = useNavigate();

  // === DATA FETCHING (Movies List for Editing) ===
  const fetcher = useCallback(async (url) => { // Use useCallback
    try {
      // No token needed for getmovies generally, add if required
      const { data } = await axios.get(url);
      if (data.status) return data.movies || [];
      else toast.error(data.msg || "Failed to load movies", toastOptions);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Error loading movie list.", toastOptions);
    }
    return []; // Return empty array on failure
  }, []); // Empty dependency

  const { data: movies = [], error: moviesError, isLoading: moviesLoading, mutate } = useSWR(
    `${render}/api/movie/getmovies`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // === AUTH CHECK ===
  useEffect(() => {
    const jwtToken = Cookies.get("adminJwtToken");
    if (!jwtToken) navigate("/admin/login");
  }, [navigate]);


  // === EDIT MODE LOGIC ===
  const fetchMovieForEdit = useCallback(async (id) => {
      if (!id) return;
      setIsLoadingEditData(true);
      setMedia(""); // Clear previous media while loading
      setFile(null);
      try {
        const url = `${render}/api/movie/getmoviedetails/${id}`;
        const { data } = await axios.get(url);
        if (data.status && data.movie) {
          const { movieName, description, genres, releaseDate, runtime, certification, media: existingMedia } = data.movie;
          // Format date for input type="date" (YYYY-MM-DD)
          const formattedDate = releaseDate ? dayjs(releaseDate).format('YYYY-MM-DD') : "";
          setMovieDetails({ name: movieName, description, genres, releaseDate: formattedDate, runtime, certification });
          setMedia(existingMedia || ""); // Set existing media URL
        } else {
           toast.error(data.msg || "Could not fetch movie details.", toastOptions);
           setEditMovieId(""); // Clear edit mode if fetch failed
        }
      } catch (error) {
        console.error("Error fetching movie for edit:", error);
        toast.error("Failed to load movie details for editing.", toastOptions);
        setEditMovieId(""); // Clear edit mode on error
      } finally {
        setIsLoadingEditData(false);
      }
  }, []); // Empty dependency array

  // Fetch data when editMovieId changes
  useEffect(() => {
      if (editMovieId) {
         fetchMovieForEdit(editMovieId);
      } else {
          // Reset form when exiting edit mode
          setMovieDetails(initialFormState);
          setMedia("");
          setFile(null);
          setUploadProgress(0);
      }
  }, [editMovieId, fetchMovieForEdit]); // Add fetchMovieForEdit dependency


  // === FILE HANDLING & UPLOAD ===
  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const selectedFile = e.target.files[0];
          // Optional: Validate file type/size
          if (selectedFile.size > 5 * 1024 * 1024) { // Example: 5MB limit
              toast.error("File is too large (max 5MB).", toastOptions);
              return;
          }
          setFile(selectedFile); // Trigger upload effect
      }
  };

  // Upload to Firebase when 'file' state changes
  useEffect(() => {
    const uploadFileToFirebase = () => {
      if (!file) return; // Don't run if no file

      setIsUploading(true);
      setUploadProgress(0);
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}-${file.name}`; // Unique filename
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Firebase Upload Error:", error);
          toast.error("Image upload failed. Please try again.", toastOptions);
          setIsUploading(false);
          setFile(null); // Reset file state on error
          setUploadProgress(0);
        },
        () => { // On success
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            setMedia(downloadURL); // Set the media URL state
            setIsUploading(false);
            // No need to setMovieDetails here, media is separate state now
          });
        }
      );
    };

    uploadFileToFirebase();
  }, [file]); // Run effect only when 'file' changes


  // === FORM HANDLING ===
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
     setMovieDetails(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value // Handle number input
     }));
  };

  const handleValidation = () => { // Keep core validation
    const { name, description, genres, releaseDate, runtime, certification } = movieDetails;
    if (!name) { toast.error("Enter movie name!", toastOptions); return false; }
    if (!description) { toast.error("Enter description!", toastOptions); return false; }
    if (!genres) { toast.error("Enter genres!", toastOptions); return false; }
    if (!releaseDate) { toast.error("Enter release date!", toastOptions); return false; }
    if (runtime === "" || runtime <= 0) { toast.error("Enter valid runtime!", toastOptions); return false; }
    if (!certification) { toast.error("Enter certification!", toastOptions); return false; }
    if (!media) { toast.error("Upload a movie poster!", toastOptions); return false; } // Check if media URL is set
    return true;
  };

  const resetForm = () => {
     setMovieDetails(initialFormState);
     setMedia("");
     setFile(null);
     setEditMovieId(""); // Exit edit mode
     setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation() || isSubmitting || isUploading) return;

    setIsSubmitting(true);
    const jwtToken = Cookies.get("adminJwtToken"); // Needed for Add/Edit

    // Prepare data payload
    const payload = {
       // Map state names to potential API expected names if different
       name: movieDetails.name,
       description: movieDetails.description,
       genres: movieDetails.genres, // Assuming comma-separated string is OK for API
       releaseDate: movieDetails.releaseDate,
       runtime: movieDetails.runtime,
       certification: movieDetails.certification,
       media: media, // Send the media URL
    };

    try {
        let response;
        if (editMovieId) {
            // EDIT MOVIE
            const url = `${render}/api/movie/editmovie/${editMovieId}`;
            response = await axios.put(url, payload, { headers: { 'auth-token': jwtToken }});
        } else {
            // ADD MOVIE
            const host = `${render}/api/movie/addmovie`;
            // Add movieId only for *new* movies
            payload.movieId = v4();
            response = await axios.post(host, payload, { headers: { 'auth-token': jwtToken }});
        }

        const { data } = response;
        if (data.status === true) {
            toast.success(data.msg || `Movie ${editMovieId ? 'updated' : 'added'} successfully!`, { ...toastOptions, theme: 'colored' });
            resetForm(); // Reset form fields
            mutate(); // Re-fetch movie list
        } else {
            toast.error(data.msg || `Failed to ${editMovieId ? 'update' : 'add'} movie.`, toastOptions);
        }
    } catch (error) {
        console.error(`Error ${editMovieId ? 'editing' : 'adding'} movie:`, error);
        toast.error(error.response?.data?.msg || `An error occurred.`, toastOptions);
    } finally {
        setIsSubmitting(false);
    }
  };


  // --- RENDER ---
  return (
    <>
      {/* Use AdminNavbar */}
      <Header />
      <main className="add-movie-page">
        <ContentWrapper>
          <div className="add-movie-content">
            {/* Form Section */}
            <section className={`add-movie-form-section ${isLoadingEditData ? 'loading-edit' : ''}`}>
               {isLoadingEditData && <div className="edit-loader"><Loader size="small" /> Loading movie data...</div>}
               <form onSubmit={handleSubmit} className="movie-form">
                  {/* Form Title */}
                  <h2 className="movie-form__title">
                    {editMovieId ? "Edit" : "Add New"} <span>Movie</span>
                  </h2>

                  {/* Image Upload Section */}
                  <div className="movie-form__image-upload">
                     <label htmlFor="movie-poster-upload" className="image-upload__label">
                       <input
                         id="movie-poster-upload"
                         type="file"
                         accept="image/png, image/jpeg, image/webp" // Specify acceptable types
                         onChange={handleFileChange}
                         style={{ display: "none" }} // Hide default input
                         disabled={isUploading}
                       />
                       {media ? (
                          <div className="image-upload__preview">
                              <img src={media} alt="Movie Poster Preview"/>
                              {/* Remove Image Button */}
                               <button
                                   type="button"
                                   className="image-upload__remove-btn"
                                   onClick={(e) => { e.preventDefault(); setMedia(''); setFile(null); }}
                                   aria-label="Remove poster"
                                   title="Remove poster"
                                   disabled={isUploading}
                               >
                                  <MdClose/>
                               </button>
                          </div>
                       ) : isUploading ? (
                           <div className="image-upload__placeholder uploading">
                               <Loader size="small"/>
                               <span>Uploading ({Math.round(uploadProgress)}%)...</span>
                           </div>
                       ) : (
                           <div className="image-upload__placeholder">
                               <MdImage/>
                               <span>Upload Poster</span>
                           </div>
                       )}
                     </label>
                     {/* Progress Bar (optional) */}
                     {isUploading && <progress className="image-upload__progress" value={uploadProgress} max="100" />}
                  </div>

                  {/* Detail Fields */}
                  <div className="movie-form__details">
                       {/* Name */}
                       <div className="form-group">
                          <label htmlFor="name"><MdTextFields/> Movie Title</label>
                          <input id="name" name="name" type="text" placeholder="e.g., The Matrix" value={movieDetails.name} onChange={handleInputChange} required disabled={isLoadingEditData}/>
                       </div>
                       {/* Description */}
                       <div className="form-group">
                          <label htmlFor="description"><MdNotes/> Description</label>
                           <textarea id="description" name="description" placeholder="Movie synopsis..." value={movieDetails.description} onChange={handleInputChange} rows="4" required disabled={isLoadingEditData}></textarea>
                       </div>
                       {/* Genres */}
                       <div className="form-group">
                          <label htmlFor="genres"><MdOutlineLabel/> Genres</label>
                          <input id="genres" name="genres" type="text" placeholder="Comma-separated (e.g., Action, Sci-Fi)" value={movieDetails.genres} onChange={handleInputChange} required disabled={isLoadingEditData}/>
                       </div>
                       {/* Release Date */}
                       <div className="form-group form-group--half">
                          <label htmlFor="releaseDate"><MdOutlineCalendarToday/> Release Date</label>
                          <input id="releaseDate" name="releaseDate" type="date" value={movieDetails.releaseDate} onChange={handleInputChange} required disabled={isLoadingEditData}/>
                       </div>
                        {/* Runtime */}
                       <div className="form-group form-group--half">
                          <label htmlFor="runtime"><MdOutlineTimer/> Runtime (min)</label>
                          <input id="runtime" name="runtime" type="number" placeholder="e.g., 120" value={movieDetails.runtime} onChange={handleInputChange} required disabled={isLoadingEditData}/>
                       </div>
                       {/* Certification */}
                       <div className="form-group form-group--half">
                          <label htmlFor="certification"><MdOutlinePolicy/> Certification</label>
                           <input id="certification" name="certification" type="text" placeholder="e.g., PG-13, R" value={movieDetails.certification} onChange={handleInputChange} required disabled={isLoadingEditData}/>
                       </div>

                      {/* Spacer for button alignment */}
                      <div className="form-group form-group--spacer"></div>


                      {/* Action Buttons */}
                      <div className="movie-form__actions">
                          {editMovieId && (
                              <button type="button" className="form-button form-button--cancel" onClick={resetForm} disabled={isSubmitting}>Cancel Edit</button>
                          )}
                          <button type="submit" className={`form-button form-button--submit ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting || isUploading || isLoadingEditData}>
                              {isSubmitting ? 'Saving...' : (editMovieId ? 'Update Movie' : 'Add Movie')}
                          </button>
                      </div>
                   </div>
               </form>
            </section>

             {/* Movies List Section */}
            <section className="admin-movies-list-section">
               <h2 className="admin-movies-list__title">Manage Existing Movies</h2>
               {moviesLoading && !moviesError && <Loader/>}
               {moviesError && <p style={{color: 'red'}}>Error loading movies.</p>}
               {!moviesLoading && movies?.length > 0 && (
                  <AdminMovies
                     movies={movies}
                     // Pass loading state for individual movie operations if needed
                     setEditMovie={setEditMovieId} // Pass the setter function
                     currentEditId={editMovieId} // Pass the current ID being edited
                     onDeleteSuccess={mutate} // Pass mutate to re-fetch after delete
                  />
               )}
                {!moviesLoading && movies?.length === 0 && !moviesError && <p>No movies found.</p>}
            </section>

          </div>
        </ContentWrapper>
      </main>
      <ToastContainer />
      {/* Optional Footer for Admin */}
      {/* <Footer /> */}
    </>
  );
};

export default AddMovie;