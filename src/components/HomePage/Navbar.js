import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2>BookShare</h2>
      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#footer">Contact</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
