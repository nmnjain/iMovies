// src/components/loader/SeatMapSkeleton.jsx
import React from 'react';
import './SeatMapSkeleton.scss'; // Create this SCSS file next

const SeatMapSkeleton = () => {
  const renderSeatPlaceholders = (count) => {
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className="seat-map-skeleton__seat"></div>
    ));
  };

  return (
    <div className="seat-map-skeleton">
      <div className="seat-map-skeleton__info"></div> {/* Placeholder for show info */}
      <div className="seat-map-skeleton__section">
        <div className="seat-map-skeleton__section-title"></div>
        <div className="seat-map-skeleton__seats">{renderSeatPlaceholders(20)}</div>
      </div>
      <div className="seat-map-skeleton__section">
        <div className="seat-map-skeleton__section-title"></div>
        <div className="seat-map-skeleton__seats">{renderSeatPlaceholders(40)}</div>
      </div>
      <div className="seat-map-skeleton__section">
        <div className="seat-map-skeleton__section-title"></div>
        <div className="seat-map-skeleton__seats">{renderSeatPlaceholders(30)}</div>
      </div>
       <div className="seat-map-skeleton__summary"></div>
       <div className="seat-map-skeleton__button"></div>
    </div>
  );
};

export default SeatMapSkeleton;