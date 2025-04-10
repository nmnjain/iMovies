import React, { useState } from "react";
import { v4 } from "uuid";
import axios from "axios";
import useSWR from "swr";
import Cookies from "js-cookie";

import Loader from "../loader/Loader"; // Assuming path is correct relative to Reviews
import Review from "../review/Review"; // Assuming path is correct relative to Reviews
import ContentWrapper from "../contentWrapper/ContentWrapper"; // Keep using this if it's providing layout
import { render } from "../../host"; // Your API host

// Icons
import { MdOutlineSpeakerNotesOff, MdSend } from "react-icons/md";

// Keep importing your existing style file
import "./style.scss";

// Keep the component name as Reviews
const Reviews = ({ movieId }) => {
  // === CORE LOGIC (Kept the Same) ===
  const [review, setReview] = useState("");
  const jwtToken = Cookies.get("jwtToken");

  // SWR Fetcher
  const fetcher = async (url) => {
    // Added basic error handling for fetch itself
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: res.statusText })); // Try to parse JSON error, fallback to status text
            const error = new Error(errorData.message || 'Failed to fetch reviews');
            error.status = res.status;
            throw error;
        }
        return await res.json();
    } catch (fetchError) {
        console.error("Fetcher error:", fetchError);
        // Re-throw or handle as appropriate for SWR
        throw fetchError;
    }
  };

  // SWR Hook for fetching reviews
  const {
    data: reviewsData,
    mutate, // Function to re-trigger fetch
    error: fetchError, // SWR provides error object
    isLoading, // SWR provides loading state
  } = useSWR(movieId ? `${render}/api/review/getreviews/${movieId}` : null, fetcher, { // Only fetch if movieId is present
       revalidateOnFocus: false, // Optional: prevent revalidating on window focus
       // Add error retry options if desired
  });

  // Handle review input change
  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission if wrapped in a form
    if (review.trim().length < 6) return; // Prevent submitting short reviews

    // Check for login token *before* submitting
    if (!jwtToken) {
        // Consider using toast notifications here instead of console.log
        console.error("User not logged in. Cannot submit review.");
        // You might want to redirect to login or show a message
        return;
    }

    const host = `${render}/api/review/addreview`;
    const body = {
      reviewId: v4(),
      movieId: movieId,
      review: review.trim(),
      datetime: new Date(),
    };

    try {
      // Optimistically add the review to the UI (optional but improves UX)
      // Note: This requires knowing the structure of review data and user info
      // mutate(async existingData => { ... create new review object ...; return updatedData }, false); // false = don't revalidate yet

      await axios.post(host, body, {
        headers: { "auth-token": jwtToken },
      });

      // Clear input and revalidate data from server
      setReview("");
      mutate(); // Re-fetch reviews to include the new one accurately
    } catch (error) {
      console.error("Error submitting review:", error);
      // Handle error, maybe show a toast notification
      // Revert optimistic update if implemented
      // mutate(async existingData => { ... revert optimistic update ... }, false);
    }
  };
  // === END CORE LOGIC ===


  // --- NEW MODERN UI Rendering ---

  // Review Input Area Component
  const ReviewInput = () => (
    <form onSubmit={handleReviewSubmit} className="review-input-form">
      {/* Consider using textarea for longer reviews */}
      <textarea
        className="review-input-form__input"
        placeholder="Share your thoughts on this movie..."
        value={review}
        onChange={handleReviewChange}
        rows={3} // Start with 3 rows, CSS can allow resizing
        aria-label="Review input"
        maxLength={500} // Optional: limit review length
      />
      <button
        className="review-input-form__submit"
        type="submit"
        disabled={review.trim().length < 6 || isLoading} // Disable if too short or while submitting (isLoading not directly tied here, but good practice)
        aria-label="Submit review"
      >
        <MdSend />
        <span>Send</span>
      </button>
    </form>
  );

  // Loading State Component
  const LoadingState = () => (
    <div className="reviews-section__loading">
      <Loader /> {/* Use your existing Loader */}
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="reviews-section__message reviews-section__message--error">
       <MdOutlineSpeakerNotesOff />
       <h3>Error Loading Reviews</h3>
       <p>Could not load reviews at this time. Please try again later.</p>
    </div>
  );

  // No Reviews State Component
  const NoReviewsState = () => (
     <div className="reviews-section__message reviews-section__message--empty">
      <MdOutlineSpeakerNotesOff />
      <h3>Be the First to Review!</h3>
      <p>There are no reviews for this movie yet.</p>
    </div>
  );

  // Render the list of reviews
  const ReviewList = () => (
     <ul className="review-list">
        {reviewsData?.reviews?.map((r) => (
          // Pass data and mutate function to individual Review component
          <Review mutate={mutate} key={r.reviewId || v4()} r={r} />
        ))}
      </ul>
  );


  return (
    // Main container for the whole reviews section
    <section className="reviews-section">
      {/* Using ContentWrapper if it provides necessary layout constraints */}
      <ContentWrapper>
        {/* Always show the review input form */}
        {ReviewInput()}

        {/* Conditional rendering for reviews list area */}
        <div className="reviews-section__content">
          {isLoading ? (
            <LoadingState />
          ) : fetchError ? (
             <ErrorState />
          ) : reviewsData?.reviews?.length > 0 ? (
            <ReviewList />
          ) : (
            <NoReviewsState />
          )}
        </div>
      </ContentWrapper>
    </section>
  );
};

export default Reviews;