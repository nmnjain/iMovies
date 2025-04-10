// src/components/loader/MovieCardSkeleton.jsx
import React from 'react';
import './MovieCardSkeleton.scss'; // We'll create this SCSS file next

const MovieCardSkeleton = () => {
  return (
    <div className="movie-card-skeleton">
      <div className="movie-card-skeleton__poster"></div>
      <div className="movie-card-skeleton__info">
        <div className="movie-card-skeleton__title"></div>
        <div className="movie-card-skeleton__line"></div>
        <div className="movie-card-skeleton__line movie-card-skeleton__line--short"></div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;