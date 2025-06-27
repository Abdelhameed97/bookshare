import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./StarRating.css";

const StarRating = ({
  rating,
  editable = false,
  onRatingChange,
  size = 24,
}) => {
  const handleClick = (newRating) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        let starIcon;
        if (rating >= star) {
          starIcon = <FaStar size={size} />;
        } else if (rating >= star - 0.5) {
          starIcon = <FaStarHalfAlt size={size} />;
        } else {
          starIcon = <FaRegStar size={size} />;
        }

        return (
          <span
            key={star}
            onClick={() => editable && handleClick(star)}
            style={{
              cursor: editable ? "pointer" : "default",
              marginRight: "2px",
            }}
          >
            {starIcon}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
