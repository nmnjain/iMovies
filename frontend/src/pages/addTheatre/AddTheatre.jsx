import React, { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";

// Component Imports (CHECK PATHS)
import Header from "../../components/adminHeader/AdminHeader"; // Use new Admin Navbar
import Footer from "../../components/footer/Footer"; // Optional Footer
import Loader from "../../components/loader/Loader"; // Keep standard loader
import Theatres from "../theatres/Theatres"; // Assuming path is correct
import ContentWrapper from "../../components/contentWrapper/ContentWrapper"; // Check path
// Removed import for TheatresListSkeleton
import { render } from "../../host"; // Check path

// Icons
import { MdOutlineTheaters, MdOutlineLocationOn, MdOutlineAttachMoney, MdOutlineEventSeat, MdErrorOutline } from "react-icons/md";

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

const AddTheatre = () => {
  // === STATE === (No change needed here)
  const initialFormState = { theatreName: "", location: "", balconySeatPrice: "", middleSeatPrice: "", lowerSeatPrice: "", balconySeats: "", middleSeats: "", lowerSeats: "" };
  const [theatreDetails, setTheatreDetails] = useState(initialFormState);
  const [editTheatreId, setEditTheatreId] = useState("");
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const navigate = useNavigate();

  // === DATA FETCHING (No change needed here) ===
  const fetcher = useCallback(async (url) => { /* ... Same fetcher logic ... */
     try { const jwtToken = Cookies.get("adminJwtToken"); const headers = {}; if (jwtToken) headers['auth-token'] = jwtToken; const { data } = await axios.get(url, { headers }); if (data.status) return data.theatres || []; else toast.error(data.msg || "Failed to load theatres", toastOptions); } catch (error) { console.error("Error fetching theatres:", error); toast.error("Error loading theatre list.", toastOptions); } return [];
  }, []);
  const { data: theatres = [], error: theatresError, isLoading: theatresLoading, mutate } = useSWR( `${render}/api/theatre/gettheatres`, fetcher, { revalidateOnFocus: false } );

  // === AUTH CHECK === (No change needed here)
  useEffect(() => { const jwtToken = Cookies.get("adminJwtToken"); if (!jwtToken) navigate("/admin/login"); }, [navigate]);

  // === EDIT MODE LOGIC === (No change needed here)
  const fetchTheatreForEdit = useCallback(async (id) => { /* ... Same edit fetch logic ... */
    if (!id) return; setIsLoadingEditData(true); try { const url = `${render}/api/theatre/gettheatrebyid/${id}`; const { data } = await axios.get(url); if (data.status && data.theatre) { const fetched = data.theatre; setTheatreDetails({ theatreName: fetched.theatreName || "", location: fetched.location || "", balconySeatPrice: String(fetched.balconySeatPrice || ""), middleSeatPrice: String(fetched.middleSeatPrice || ""), lowerSeatPrice: String(fetched.lowerSeatPrice || ""), balconySeats: String(fetched.balconySeats || ""), middleSeats: String(fetched.middleSeats || ""), lowerSeats: String(fetched.lowerSeats || ""), }); } else { toast.error(data.msg || "Could not fetch theatre details.", toastOptions); setEditTheatreId(""); } } catch (error) { console.error("Error fetching theatre for edit:", error); toast.error("Failed to load theatre for editing.", toastOptions); setEditTheatreId(""); } finally { setIsLoadingEditData(false); }
  }, []);
  useEffect(() => { if (editTheatreId) { fetchTheatreForEdit(editTheatreId); } else { setTheatreDetails(initialFormState); } }, [editTheatreId, fetchTheatreForEdit]);

  // === FORM HANDLING === (No change needed here)
  const handleChange = (e) => { /* ... Same ... */
     const { name, value } = e.target; const isNumberInput = ['balconySeatPrice', 'middleSeatPrice', 'lowerSeatPrice', 'balconySeats', 'middleSeats', 'lowerSeats'].includes(name); const processedValue = isNumberInput ? value.replace(/[^0-9]/g, '') : value; setTheatreDetails(prev => ({ ...prev, [name]: processedValue }));
  };
  const validation = () => { /* ... Same ... */
      const { theatreName, location, balconySeatPrice, middleSeatPrice, lowerSeatPrice, balconySeats, middleSeats, lowerSeats } = theatreDetails; if (!theatreName) { toast.error("Enter theatre name!", toastOptions); return false; } if (!location) { toast.error("Enter theatre location!", toastOptions); return false; } if (!balconySeatPrice || parseInt(balconySeatPrice) <= 0) { toast.error("Enter valid balcony seat price!", toastOptions); return false; } if (!middleSeatPrice || parseInt(middleSeatPrice) <= 0) { toast.error("Enter valid middle seat price!", toastOptions); return false; } if (!lowerSeatPrice || parseInt(lowerSeatPrice) <= 0) { toast.error("Enter valid lower seat price!", toastOptions); return false; } if (!balconySeats || parseInt(balconySeats) <= 0) { toast.error("Enter valid balcony seat count!", toastOptions); return false; } if (!middleSeats || parseInt(middleSeats) <= 0) { toast.error("Enter valid middle seat count!", toastOptions); return false; } if (!lowerSeats || parseInt(lowerSeats) <= 0) { toast.error("Enter valid lower seat count!", toastOptions); return false; } return true;
   };
  const resetForm = () => { /* ... Same ... */ setTheatreDetails(initialFormState); setEditTheatreId(""); };
  const handleSubmit = async (e) => { /* ... Same submit logic ... */
     e.preventDefault(); if (!validation() || isLoadingForm) return; setIsLoadingForm(true); const jwtToken = Cookies.get("adminJwtToken"); if (!jwtToken) { toast.error("Authentication required.", toastOptions); setIsLoadingForm(false); return; } const payload = { ...theatreDetails, balconySeatPrice: parseInt(theatreDetails.balconySeatPrice, 10), middleSeatPrice: parseInt(theatreDetails.middleSeatPrice, 10), lowerSeatPrice: parseInt(theatreDetails.lowerSeatPrice, 10), balconySeats: parseInt(theatreDetails.balconySeats, 10), middleSeats: parseInt(theatreDetails.middleSeats, 10), lowerSeats: parseInt(theatreDetails.lowerSeats, 10), }; try { let response; if (editTheatreId) { const url = `${render}/api/theatre/edittheatre/${editTheatreId}`; response = await axios.put(url, payload, { headers: { "auth-token": jwtToken } }); } else { const host = `${render}/api/theatre/addtheatre`; payload.theatreId = v4(); response = await axios.post(host, payload, { headers: { "auth-token": jwtToken } }); } const { status, msg } = response.data; if (status === true) { toast.success(msg || `Theatre ${editTheatreId ? 'updated' : 'added'}!`, { ...toastOptions, theme: 'colored' }); resetForm(); mutate(); } else { toast.error(msg || `Failed to ${editTheatreId ? 'update' : 'add'} theatre.`, toastOptions); } } catch (error) { console.error(`Error ${editTheatreId ? 'editing' : 'adding'} theatre:`, error); toast.error(error.response?.data?.msg || "An error occurred.", toastOptions); } finally { setIsLoadingForm(false); }
   };

  // --- RENDER ---
  return (
    <>
      <Header />
      <main className="add-theatre-page">
        <ContentWrapper>
          <div className="add-theatre-content">

            {/* Form Section */}
             <section className={`add-theatre-form-section ${isLoadingEditData ? 'loading-edit' : ''}`}>
               {isLoadingEditData && <div className="edit-loader"><Loader size="small" /> Loading theatre data...</div>}
                <form onSubmit={handleSubmit} className="theatre-form">
                  {/* ... Form structure remains the same ... */}
                   <h1 className="theatre-form__title"> {editTheatreId ? "Edit" : "Add New"} <span>Theatre</span> </h1>
                   <div className="form-group form-group--full"> <label htmlFor="theatreName"><MdOutlineTheaters/> Theatre Name</label> <input id="theatreName" name="theatreName" type="text" placeholder="e.g., Cineplex Central" value={theatreDetails.theatreName} onChange={handleChange} required disabled={isLoadingEditData}/> </div>
                   <div className="form-group form-group--full"> <label htmlFor="location"><MdOutlineLocationOn/> Location</label> <input id="location" name="location" type="text" placeholder="e.g., City Center Mall, 2nd Floor" value={theatreDetails.location} onChange={handleChange} required disabled={isLoadingEditData}/> </div>
                   <fieldset className="form-group form-group--full form-group--fieldset"> <legend>Seating Configuration</legend> <div className="fieldset-grid"> <div className="form-group"> <label htmlFor="balconySeatPrice"><MdOutlineAttachMoney/> Balcony Price (₹)</label> <input id="balconySeatPrice" name="balconySeatPrice" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 250" value={theatreDetails.balconySeatPrice} onChange={handleChange} required disabled={isLoadingEditData}/> </div> <div className="form-group"> <label htmlFor="balconySeats"><MdOutlineEventSeat/> Balcony Seats</label> <input id="balconySeats" name="balconySeats" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 50" value={theatreDetails.balconySeats} onChange={handleChange} required disabled={isLoadingEditData}/> </div> <div className="form-group"> <label htmlFor="middleSeatPrice"><MdOutlineAttachMoney/> Middle Price (₹)</label> <input id="middleSeatPrice" name="middleSeatPrice" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 180" value={theatreDetails.middleSeatPrice} onChange={handleChange} required disabled={isLoadingEditData}/> </div> <div className="form-group"> <label htmlFor="middleSeats"><MdOutlineEventSeat/> Middle Seats</label> <input id="middleSeats" name="middleSeats" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 100" value={theatreDetails.middleSeats} onChange={handleChange} required disabled={isLoadingEditData}/> </div> <div className="form-group"> <label htmlFor="lowerSeatPrice"><MdOutlineAttachMoney/> Lower Price (₹)</label> <input id="lowerSeatPrice" name="lowerSeatPrice" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 120" value={theatreDetails.lowerSeatPrice} onChange={handleChange} required disabled={isLoadingEditData}/> </div> <div className="form-group"> <label htmlFor="lowerSeats"><MdOutlineEventSeat/> Lower Seats</label> <input id="lowerSeats" name="lowerSeats" type="text" pattern="[0-9]*" inputMode="numeric" placeholder="e.g., 80" value={theatreDetails.lowerSeats} onChange={handleChange} required disabled={isLoadingEditData}/> </div> </div> </fieldset>
                   <div className="theatre-form__actions"> {editTheatreId && ( <button type="button" className="form-button form-button--cancel" onClick={resetForm} disabled={isLoadingForm}>Cancel Edit</button> )} <button type="submit" className={`form-button form-button--submit ${isLoadingForm ? 'loading' : ''}`} disabled={isLoadingForm || isLoadingEditData}> {isLoadingForm ? 'Saving...' : (editTheatreId ? 'Update Theatre' : 'Add Theatre')} </button> </div>
                </form>
             </section>

             {/* Theatres List Section */}
            <section className="admin-theatres-list-section">
               <h2 className="admin-theatres-list__title">Manage Existing Theatres</h2>
               {/* *** CHANGE: Render Loader instead of Skeleton *** */}
               {theatresLoading && !theatresError && <div className="theatre-list-loader"><Loader /></div>}
               {theatresError && <p className="error-message">Error loading theatres list.</p>}
               {!theatresLoading && theatres?.length > 0 && (
                  <Theatres
                     theatres={theatres}
                     setTheatreEdit={setEditTheatreId}
                     currentEditId={editTheatreId}
                     onDeleteSuccess={mutate}
                  />
               )}
                {!theatresLoading && theatres?.length === 0 && !theatresError && <p className="info-message">No theatres added yet.</p>}
            </section>

          </div>
        </ContentWrapper>
      </main>
      <ToastContainer />
      {/* <Footer /> */}
    </>
  );
};

export default AddTheatre;