
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

    fetch('http://localhost:3001/selectedflight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flight)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Booking confirmed:', data);
      setLoading(false);
      history.push('/payment');
    })
    .catch(error => {
      console.error('Error:', error);
      setLoading(false);
    });
  };

  return (
    <div className="flights-container">
      {loading ? (
        <div className="loading-animation">
          <img src={loadingPlaneGif} alt="Loading animation of a plane" style={{ width: "2000px", height: "800px" }} />
        </div>
      ) : (
        flights.map((flight) => (
          <div key={flight.id} className="flight-card">
            <div className="flight-info">
              <div><strong>From:</strong> {flight.from}</div>
              <div><strong>To:</strong> {flight.to}</div>
              <div><strong>Airline:</strong> {flight.airline}</div>
              <div><strong>Flight Number:</strong> {flight.flightNumber}</div>
              <div><strong>Price:</strong> {flight.price}</div>
            </div>
            <button className="book-button" onClick={() => handleBookNow(flight)}>
              Book Now
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Details;
