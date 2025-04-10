import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { v4 } from "uuid";
import useSWR from "swr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BiChair } from "react-icons/bi"; // Make sure to install react-icons

// Component Imports
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import Checkout from "../checkoutPage/Checkout";
import { render } from "../../host";

// Style Import
import "./style.scss";

const SeatsPage = () => {
  const { showId, theatreName } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState({
    balcony: [],
    middle: [],
    lower: [],
  });
  const [debugInfo, setDebugInfo] = useState(null);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    closeOnClick: true,
  };

  // ===== DATA FETCHING =====
  const getTheatreData = async (url) => {
    try {
      console.log("Fetching theatre data from:", url);
      const response = await axios.get(url);
      console.log("Theatre API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching theatre data:", error);
      setDebugInfo(prev => ({
        ...prev,
        theatreError: error.message,
        theatreUrl: url
      }));
      return { status: false, msg: error.message };
    }
  };

  const getSeatsData = async (url) => {
    try {
      console.log("Fetching seats data from:", url);
      const response = await axios.get(url);
      console.log("Seats API response:", response.data);
      if (response.data?.status) {
        return response.data?.show?.tickets || {};
      }
      return {};
    } catch (error) {
      console.error("Error fetching seats data:", error);
      setDebugInfo(prev => ({
        ...prev,
        seatsError: error.message,
        seatsUrl: url
      }));
      return {};
    }
  };

  // Use SWR with these fetchers
  const { 
    data: theatreResponse, 
    error: theatreError, 
    isLoading: theatreLoading 
  } = useSWR(
    theatreName ? `${render}/api/theatre/gettheatre/${encodeURIComponent(theatreName)}` : null,
    getTheatreData,
    { 
      revalidateOnFocus: false,
      onError: (error) => {
        console.error("SWR theatre error:", error);
        setDebugInfo(prev => ({
          ...prev,
          swrTheatreError: error.message
        }));
      }
    }
  );

  const {
    data: seatsData,
    error: seatsError,
    isLoading: seatsLoading,
    mutate,
  } = useSWR(
    showId ? `${render}/api/shows/getshow/${showId}` : null,
    getSeatsData,
    { 
      revalidateOnFocus: false,
      onError: (error) => {
        console.error("SWR seats error:", error);
        setDebugInfo(prev => ({
          ...prev,
          swrSeatsError: error.message
        }));
      }
    }
  );

  // Log the responses for debugging
  useEffect(() => {
    console.log("Theatre Response:", theatreResponse);
    console.log("Theatre Error:", theatreError);
    console.log("Theatre Loading:", theatreLoading);
    
    setDebugInfo(prev => ({
      ...prev,
      theatreResponse,
      theatreError,
      theatreLoading
    }));
  }, [theatreResponse, theatreError, theatreLoading]);

  useEffect(() => {
    console.log("Seats Data:", seatsData);
    console.log("Seats Error:", seatsError);
    console.log("Seats Loading:", seatsLoading);
    
    setDebugInfo(prev => ({
      ...prev,
      seatsData,
      seatsError,
      seatsLoading
    }));
  }, [seatsData, seatsError, seatsLoading]);

  // ===== EXTRACT DATA FROM RESPONSES =====
  // Defensive approach to extract theatre details
  const theatreDetails = React.useMemo(() => {
    if (theatreResponse?.status && theatreResponse?.data?.theatre) {
      return theatreResponse.data.theatre;
    } else if (theatreResponse?.data?.theatre) {
      return theatreResponse.data.theatre;
    } else if (theatreResponse?.theatre) {
      return theatreResponse.theatre;
    }
    return null;
  }, [theatreResponse]);
  
  // Log the theatre details
  useEffect(() => {
    console.log("Extracted Theatre Details:", theatreDetails);
    setDebugInfo(prev => ({
      ...prev,
      theatreDetails
    }));
  }, [theatreDetails]);
  
  // Process booked seats
  const bookedSeats = React.useMemo(() => ({
    balcony: seatsData?.balcony ? Object.keys(seatsData.balcony) : [],
    middle: seatsData?.middle ? Object.keys(seatsData.middle) : [],
    lower: seatsData?.lower ? Object.keys(seatsData.lower) : [],
  }), [seatsData]);

  // ===== LOGIN CHECK =====
  useEffect(() => {
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) {
      navigate("/login");
    }
  }, [navigate]);

  // Show toast for theatre data errors
  useEffect(() => {
    if (theatreResponse?.status === false) {
      toast.error(theatreResponse?.msg || "Error loading theatre data", toastOptions);
    }
  }, [theatreResponse, toastOptions]);

  // ===== SEAT SELECTION HANDLERS =====
  const handleSeatSelect = (seatType, seatNumber) => {
    const currentSeats = [...selectedSeats[seatType]];
    const isSeatSelected = currentSeats.includes(seatNumber);
    
    if (isSeatSelected) {
      // Remove seat if already selected
      setSelectedSeats({
        ...selectedSeats,
        [seatType]: currentSeats.filter(seat => seat !== seatNumber)
      });
    } else {
      // Add seat if not already 5 seats selected in this section
      if (currentSeats.length < 5) {
        setSelectedSeats({
          ...selectedSeats,
          [seatType]: [...currentSeats, seatNumber]
        });
      } else {
        toast.warning("You can select maximum 5 seats per section", toastOptions);
      }
    }
  };

  // Calculate total price
  const calculateSectionTotal = (seatType) => {
    const priceKey = `${seatType}SeatPrice`;
    return selectedSeats[seatType].length * (theatreDetails?.[priceKey] || 0);
  };

  const totalPrice = 
    calculateSectionTotal('balcony') +
    calculateSectionTotal('middle') +
    calculateSectionTotal('lower');

  // ===== CHECKOUT HANDLER =====
  const handleCheckout = async () => {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const { userDetails } = jwtDecode(jwtToken);

      const bookedSeatDetails = {
        balcony: {},
        middle: {},
        lower: {},
      };

      // Add user info to each selected seat
      ['balcony', 'middle', 'lower'].forEach(section => {
        selectedSeats[section].forEach(seatNum => {
          if (seatNum !== "0") {
            bookedSeatDetails[section][seatNum] = { userEmail: userDetails?.email };
          }
        });
        
        // Add total price for each section
        const priceKey = `${section}SeatPrice`;
        bookedSeatDetails[section]["total"] = 
          selectedSeats[section].length * (theatreDetails?.[priceKey] || 0);
      });

      // Add booking
      const bookingApi = `${render}/api/bookings/addbooking`;
      await axios.post(
        bookingApi,
        {
          showId,
          bookingId: v4(),
          ticketsData: bookedSeatDetails,
        },
        {
          headers: {
            "auth-token": jwtToken,
          },
        }
      );

      // Update show tickets
      const updateEndpoint = `${render}/api/shows/updateshowtickets/${showId}`;
      
      // Create update payload (without totals)
      const updatePayload = {
        balcony: {},
        middle: {},
        lower: {},
      };
      
      ['balcony', 'middle', 'lower'].forEach(section => {
        selectedSeats[section].forEach(seatNum => {
          if (seatNum !== "0") {
            updatePayload[section][seatNum] = { userEmail: userDetails?.email };
          }
        });
      });

      const res = await axios.put(updateEndpoint, updatePayload);
      if (res?.data.status) {
        // Mutate SWR cache and navigate to payment
        mutate();
        setPayment(true);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.", toastOptions);
    }
  };

  // Generate seat buttons for each section
  const renderSeats = (seatType, totalSeats) => {
    const seats = [];
    
    for (let i = 1; i <= (totalSeats || 0); i++) {
      const isBooked = bookedSeats[seatType].includes(String(i));
      const isSelected = selectedSeats[seatType].includes(i);
      
      let seatClass = "seat seat--available";
      if (isBooked) seatClass = "seat seat--booked";
      if (isSelected) seatClass = "seat seat--selected";
      
      seats.push(
        <button 
          key={`${seatType}-${i}`}
          className={seatClass}
          disabled={isBooked}
          onClick={() => handleSeatSelect(seatType, i)}
          aria-label={`${seatType} seat ${i}`}
        >
          <BiChair />
          <span className="seat__number">{i}</span>
        </button>
      );
    }
    return seats;
  };

  // ===== PAYMENT RENDER =====
  if (payment) {
    return (
      <Checkout
        selectedSeats={selectedSeats}
        showId={showId}
        theatreName={theatreName}
      />
    );
  }

  // ===== LOADING STATE =====
  if (theatreLoading || seatsLoading) {
    return (
      <>
        <Header />
        <div className="seats-page seats-page--loading">
          <div className="contentWrapper">
            <Loader />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ===== FALLBACK TO ORIGINAL IMPLEMENTATION =====
  // If the new approach isn't working, fall back to the original implementation
  if (!theatreDetails) {
    console.log("Falling back to original implementation structure");
    
    // Create the original lists for seats (like in the original code)
    const balconyLiTags = [];
    for (let i = 1; i < (theatreResponse?.data?.theatre?.balconySeats || 0) + 1; i++) {
      const isBooked = bookedSeats.balcony.includes(String(i));
      balconyLiTags.push(
        <li
          className={isBooked ? "disable" : ""}
          style={{
            backgroundColor: selectedSeats?.balcony.includes(i) && "crimson",
          }}
          onClick={() => !isBooked && handleSeatSelect('balcony', i)}
          key={i}
        ></li>
      );
    }

    const middleLiTags = [];
    for (let i = 1; i < (theatreResponse?.data?.theatre?.middleSeats || 0) + 1; i++) {
      const isBooked = bookedSeats.middle.includes(String(i));
      middleLiTags.push(
        <li
          className={isBooked ? "disable" : ""}
          style={{
            backgroundColor: selectedSeats?.middle.includes(i) && "crimson",
          }}
          onClick={() => !isBooked && handleSeatSelect('middle', i)}
          key={i}
        ></li>
      );
    }

    const lowerLiTags = [];
    for (let i = 1; i < (theatreResponse?.data?.theatre?.lowerSeats || 0) + 1; i++) {
      const isBooked = bookedSeats.lower.includes(String(i));
      lowerLiTags.push(
        <li
          className={isBooked ? "disable" : ""}
          style={{
            backgroundColor: selectedSeats?.lower.includes(i) && "crimson",
          }}
          onClick={() => !isBooked && handleSeatSelect('lower', i)}
          key={i}
        ></li>
      );
    }

    const theatre = theatreResponse?.data?.theatre;

    return (
      <>
        <Header />
        <div className="seatsPageContainer">
          <div className="wrapper">
            <p className="seatType">Balcony Seats</p>
            <ul className="seats">{balconyLiTags}</ul>
            <p className="seatType">Middle Class Seats</p>
            <ul className="seats">{middleLiTags}</ul>

            <p className="seatType">Lower Class Seats</p>
            <ul className="seats">{lowerLiTags}</ul>
            <div className="row">
              <div className="col">
                <p>Balcony Seats Price:</p>
                <span>
                  {selectedSeats.balcony.length *
                    (theatre?.balconySeatPrice || 0)}{" "}
                  ₹/-
                </span>
              </div>
              <div className="col">
                <p>Middle Seats Price:</p>
                <span>
                  {selectedSeats.middle.length *
                    (theatre?.middleSeatPrice || 0)}{" "}
                  ₹/-
                </span>
              </div>
              <div className="col">
                <p>Lower Seats Price:</p>
                <span>
                  {selectedSeats.lower.length * 
                    (theatre?.lowerSeatPrice || 0)}{" "}
                  ₹/-
                </span>
              </div>
            </div>

            <button
              className={
                selectedSeats.balcony.length === 0 &&
                selectedSeats.middle.length === 0 &&
                selectedSeats.lower.length === 0
                  ? "disable"
                  : ""
              }
              onClick={handleCheckout}
            >
              Pay{" "}
              {(selectedSeats.lower.length * (theatre?.lowerSeatPrice || 0)) +
                (selectedSeats.middle.length * (theatre?.middleSeatPrice || 0)) +
                (selectedSeats.balcony.length * (theatre?.balconySeatPrice || 0))}{" "}
              ₹/-
            </button>
          </div>
        </div>
        <ToastContainer />
        <Footer />
      </>
    );
  }

  // ===== DEBUG RENDER =====
  // Show debug info if there's an error
  if (theatreError || seatsError || !theatreDetails) {
    return (
      <>
        <Header />
        <div className="seats-page seats-page--error">
          <div className="contentWrapper">
            <h3>Unable to load seating information</h3>
            <p>There was a problem loading the theatre or seat data. Please try again.</p>
            <button 
              className="error-back-button" 
              onClick={() => navigate(-1)}
              style={{ marginBottom: '20px' }}
            >
              Go Back
            </button>
            
            <div style={{ textAlign: 'left', background: '#f3f4f6', padding: '15px', borderRadius: '8px', maxWidth: '100%', overflowX: 'auto' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Debug Information:</h4>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <>
      <Header />
      <div className="seats-page">
        <div className="contentWrapper">
          {/* Show information */}
          <div className="show-info-header">
            <h2>{theatreName || "Select Your Seats"}</h2>
            <p>Select up to 5 seats per section</p>
          </div>
          
          {/* Screen indicator */}
          <div className="screen-indicator">SCREEN THIS WAY</div>
          
          {/* Seat map */}
          <div className="seat-map">
            {/* Seat legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <span className="seat-indicator seat-indicator--available"><BiChair /></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="seat-indicator seat-indicator--selected"><BiChair /></span>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <span className="seat-indicator seat-indicator--booked"><BiChair /></span>
                <span>Booked</span>
              </div>
            </div>
            
            {/* Balcony seats */}
            <div className="seat-section">
              <h3 className="seat-section__title">
                Balcony Seats 
                <span className="seat-section__price"> - ₹{theatreDetails?.balconySeatPrice}/seat</span>
              </h3>
              <div className="seat-section__seats-container">
                {renderSeats('balcony', theatreDetails?.balconySeats)}
              </div>
            </div>
            
            {/* Middle class seats */}
            <div className="seat-section">
              <h3 className="seat-section__title">
                Middle Class Seats
                <span className="seat-section__price"> - ₹{theatreDetails?.middleSeatPrice}/seat</span>
              </h3>
              <div className="seat-section__seats-container">
                {renderSeats('middle', theatreDetails?.middleSeats)}
              </div>
            </div>
            
            {/* Lower class seats */}
            <div className="seat-section">
              <h3 className="seat-section__title">
                Lower Class Seats
                <span className="seat-section__price"> - ₹{theatreDetails?.lowerSeatPrice}/seat</span>
              </h3>
              <div className="seat-section__seats-container">
                {renderSeats('lower', theatreDetails?.lowerSeats)}
              </div>
            </div>
          </div>
          
          {/* Checkout summary */}
          <div className="checkout-summary">
            <div className="summary-details">
              <span className="summary-label">Selected:</span>
              {selectedSeats.balcony.length > 0 && (
                <span className="summary-tag">
                  Balcony: {selectedSeats.balcony.length} (₹{calculateSectionTotal('balcony')})
                </span>
              )}
              {selectedSeats.middle.length > 0 && (
                <span className="summary-tag">
                  Middle: {selectedSeats.middle.length} (₹{calculateSectionTotal('middle')})
                </span>
              )}
              {selectedSeats.lower.length > 0 && (
                <span className="summary-tag">
                  Lower: {selectedSeats.lower.length} (₹{calculateSectionTotal('lower')})
                </span>
              )}
            </div>
            
            <button 
              className="checkout-button" 
              disabled={totalPrice === 0}
              onClick={handleCheckout}
            >
              Pay {totalPrice} ₹/-
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default SeatsPage;