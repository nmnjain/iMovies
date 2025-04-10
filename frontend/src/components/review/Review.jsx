import React, { useEffect, useState } from "react"; // Import React
import moment from "moment";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";

// Import Icons
import { FaRegEdit } from "react-icons/fa";
import { MdDelete, MdSave } from "react-icons/md"; // Added MdSave
import { RxDotsVertical, RxPerson } from "react-icons/rx";

import { render } from "../../host"; // Your API host

// Import the newly created styles
import "./style.scss"; // Make sure path is correct

// Keep component name
const Review = ({ r, mutate }) => {
  // === STATE ===
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // === DATA & USER INFO ===
  // Destructure review data with defaults
  const {
    username = "Anonymous",
    review = "",
    reviewId,
    datetime,
    email = null // User email associated with the review
  } = r || {};

  // Get current user info from JWT
  const jwtToken = Cookies.get("jwtToken");
  let currentUserEmail = null;
  let isOwner = false;
  if (jwtToken) {
    try {
      const payload = jwtDecode(jwtToken);
      currentUserEmail = payload?.userDetails?.email;
      // Check if the logged-in user is the owner of the review
      isOwner = currentUserEmail && email && currentUserEmail === email;
    } catch (e) {
      console.error("Error decoding JWT:", e);
      // Handle invalid token case if necessary
    }
  }

  // Initialize edit text when component mounts or review prop changes
  useEffect(() => {
    setEditedReviewText(review);
  }, [review]);

  // === EVENT HANDLERS ===
  const toggleOptions = (e) => {
     e.stopPropagation(); // Prevent click from propagating to parent elements
    setOptionsVisible(prev => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditMode(prev => !prev); // Toggle edit mode
    setOptionsVisible(false); // Close options menu when edit is toggled
    if (!editMode) {
      setEditedReviewText(review); // Reset text if entering edit mode
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (isDeleting) return; // Prevent multiple clicks

    // Optional: Add a confirmation dialog here
    // if (!window.confirm("Are you sure you want to delete this review?")) {
    //   setOptionsVisible(false);
    //   return;
    // }

    setIsDeleting(true);
    setOptionsVisible(false); // Close menu

    try {
      const host = `${render}/api/review/deletereview/${reviewId}`;
      const { data } = await axios.delete(host, { headers: { "auth-token": jwtToken } }); // Pass token if required by backend
      if (data?.status) {
        mutate(); // Re-fetch reviews after successful deletion
        // Optionally show success toast
      } else {
         console.error("Delete failed:", data?.msg);
         // Optionally show error toast
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      // Optionally show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (isSaving || editedReviewText.trim() === review) return; // Prevent saving if no change or already saving

    setIsSaving(true);

    try {
      const host = `${render}/api/review/editreview`;
      const { data } = await axios.put(host, {
        reviewId,
        review: editedReviewText.trim(),
      }, { headers: { "auth-token": jwtToken } }); // Pass token if required

      if (data?.status) {
        mutate(); // Re-fetch reviews
        setEditMode(false); // Exit edit mode on success
         // Optionally show success toast
      } else {
          console.error("Edit failed:", data?.msg);
         // Optionally show error toast
      }
    } catch (error) {
      console.error("Error editing review:", error);
       // Optionally show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setEditedReviewText(e.target.value);
  };

  // Close options menu if clicking outside (basic implementation)
  useEffect(() => {
     const handleClickOutside = (event) => {
        // Crude check, ideally use refs to check if click is inside menu/toggle
        if (optionsVisible && !event.target.closest('.review-item__options-menu') && !event.target.closest('.review-item__options-toggle')) {
            setOptionsVisible(false);
        }
     };
     if (optionsVisible) {
        document.addEventListener('mousedown', handleClickOutside);
     }
     return () => {
        document.removeEventListener('mousedown', handleClickOutside);
     };
  }, [optionsVisible]);


  // === RENDER ===
  return (
    <li className="review-item">
      {/* Avatar */}
      <div className="review-item__avatar">
        {/* Placeholder Icon - Replace with user image if available */}
        <RxPerson />
      </div>

      {/* Main Content */}
      <div className="review-item__main">
        {/* Header */}
        <div className="review-item__header">
           <div className="review-item__user-info">
            <span className="review-item__name">{username}</span>
            {/* Dot separator removed for cleaner look, rely on spacing */}
            <span className="review-item__date">{moment(datetime).fromNow()}</span>
          </div>

          {/* Options Toggle Button - only shown for owner */}
          {isOwner && (
            <button
              className={`review-item__options-toggle ${optionsVisible ? 'active' : ''}`}
              onClick={toggleOptions}
              aria-label="Review options"
              aria-expanded={optionsVisible}
              disabled={isDeleting || isSaving} // Disable while action in progress
            >
              <RxDotsVertical />
            </button>
          )}
        </div>

         {/* Options Menu - shown for owner when toggled */}
         {isOwner && optionsVisible && (
           <ul className="review-item__options-menu">
             <li className="review-item__options-menu__item">
               <button
                  className={`review-item__options-menu__button review-item__options-menu__button--edit ${editMode ? 'active' : ''}`}
                  onClick={handleEditClick}
                  disabled={isDeleting || isSaving}
                >
                 <FaRegEdit /> Edit
               </button>
             </li>
             <li className="review-item__options-menu__item">
               <button
                  className="review-item__options-menu__button review-item__options-menu__button--delete"
                  onClick={handleDeleteClick}
                  disabled={isDeleting || isSaving}
               >
                 <MdDelete /> Delete
               </button>
             </li>
           </ul>
         )}


        {/* Review Body or Edit Form */}
        <div className="review-item__body">
          {!editMode ? (
            // Display review text
            <p>{review}</p>
          ) : (
            // Display edit form
            <form className="review-item__edit-form" onSubmit={handleEditSubmit}>
              <textarea
                className="review-item__edit-form__input"
                value={editedReviewText}
                onChange={handleInputChange}
                rows={3}
                aria-label="Edit review text"
                disabled={isSaving}
                maxLength={500} // Match input form max length if desired
              />
              <button
                className="review-item__edit-form__save-button"
                type="submit"
                disabled={editedReviewText.trim() === review || isSaving || editedReviewText.trim().length < 1} // Disable if no change, saving, or empty
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
};

export default Review;