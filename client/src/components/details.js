import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import loadingPlaneGif from "./loading.gif";
import "./details.css";



function Details() {
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const flights = location.state ? location.state.flights : [];


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleBookNow = (flight) => {
    setLoading(true);

    fetch("http://localhost:3001/selectedflight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flight),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Booking confirmed:", data);
        setLoading(false);
        history.push("/passengerdetails");
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  return (
    <div className="flights-container">
      {loading ? (
        <div className="loading-animation">
          <img
            src={loadingPlaneGif}
            alt="Loading animation of a plane"
            style={{ width: "2000px", height: "800px" }}
          />
        </div>
      ) : (
        flights.map((flight, index) => (
          <div key={flight.id} className="flight-card">
            <div className="flight-header">
              <span className="flight-fav">
                <i className="fa fa-heart-o" aria-hidden="true"></i>
              </span>
            </div>
            <div className="flight-info">
              <div className="flight-time">
                <strong>{flight.scheduledDepartureTime}</strong>{" "}
                <strong>{flight.scheduledArrivalTime}</strong>
              </div>
              <div className="flight-duration">{flight.duration}</div>
              <div className="flight-route">{flight.from} <span className="custom-arrow"></span> {flight.to}</div>
            </div>
            <div className="flight-number">Flight No: {flight.flightNumber}</div>
            <div className="flight-price">Rs. {flight.price}</div>
            <div className="flight-price-action">
              <button className="select-button" onClick={() => handleBookNow(flight)}>Select</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Details;