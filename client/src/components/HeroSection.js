// HeroSection.js

import React from "react";
import "../App.css";
import Button from "./Button"; // Correct import for default export
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <div className="hero-container">
      <video src="/videos/FlyWayHomePageStockFootage.mp4" autoPlay loop muted />
      <h1 style={{fontSize: '50px'}}>TICKET BOOKING MADE EASY</h1>
      <p>Try our latest voice command feature</p>

      <div className="hero-btns">
        <Link to="/form" style={{ textDecoration: "none" }}>
          <Button
            className="btns"
            buttonStyle="btn--outline"
            buttonSize="btn--large"
          >
            BOOK TICKET
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;
