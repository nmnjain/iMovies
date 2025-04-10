// src/components/loader/BookingCardSkeleton.jsx
import React from 'react';
import './BookingCardSkeleton.scss'; // Create this SCSS file next

const BookingCardSkeleton = () => {
  return (
    <div className="booking-card-skeleton">
      <div className="booking-card-skeleton__poster"></div>
      <div className="booking-card-skeleton__details">
        <div className="booking-card-skeleton__line booking-card-skeleton__line--title"></div>
        <div className="booking-card-skeleton__line booking-card-skeleton__line--short"></div>
        <div className="booking-card-skeleton__line booking-card-skeleton__line--medium"></div>
        <div className="booking-card-skeleton__line booking-card-skeleton__line--tickets"></div>
        <div className="booking-card-skeleton__line booking-card-skeleton__line--price"></div>
        <div className="booking-card-skeleton__button"></div>
      </div>
    </div>
  );
};

export default BookingCardSkeleton;