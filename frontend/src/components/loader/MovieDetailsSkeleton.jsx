// src/components/loader/MovieDetailsSkeleton.jsx
import React from 'react';
import './MovieDetailsSkeleton.scss'; // We'll create this SCSS file next

const MovieDetailsSkeleton = () => {
  return (
    <div className="movie-details-skeleton">
       {/* Optional Backdrop Skeleton */}
       {/* <div className="details-backdrop-skeleton"></div> */}

      <div className="details-content-skeleton">
        <div className="details-content-skeleton__container">
          {/* Poster Skeleton */}
          <div className="details-content-skeleton__poster"></div>

          {/* Info Skeleton */}
          <div className="details-content-skeleton__info">
            <div className="details-content-skeleton__line details-content-skeleton__line--title"></div>
            <div className="details-content-skeleton__line details-content-skeleton__line--genres"></div>
            <div className="details-content-skeleton__line details-content-skeleton__line--heading"></div>
            <div className="details-content-skeleton__line"></div>
            <div className="details-content-skeleton__line"></div>
            <div className="details-content-skeleton__line details-content-skeleton__line--short"></div>
            <div className="details-content-skeleton__line details-content-skeleton__line--meta"></div>
            <div className="details-content-skeleton__line details-content-skeleton__line--button"></div>
          </div>
        </div>
      </div>
       {/* Optional Reviews Skeleton */}
       {/* <div className="details-reviews-skeleton"> ... </div> */}
    </div>
  );
};

export default MovieDetailsSkeleton;