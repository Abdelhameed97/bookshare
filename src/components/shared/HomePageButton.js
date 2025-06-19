import React from 'react';
import '../../style/Homepagestyle.css';

const HomePageButton = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      className={`homepage-viewall-btn ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default HomePageButton; 