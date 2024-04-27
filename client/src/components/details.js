import React from "react";
import "./details.css";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function Details() {
  const location = useLocation();
  const history = useHistory();
  const flights = location.state ? location.state.flights : []; 
  

  const handleBookNow = (flight) => {
    // Sending the flight details to the server
    fetch('http://localhost:3001/selectedflight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flight) // Sending the entire flight object
    })
    .then(response => response.json())
    .then(data => {
      console.log('Booking confirmed:', data);
      history.push('/passengerdetails', { flightDetails: data }); // Navigate to payment with data
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="flights-container">
      {flights.map((flight, index) => (
        <div key={index} className="flight-card">
          <div className="flight-info">
            <div><strong>From:</strong> {flight.from}</div>
            <div><strong>To:</strong> {flight.to}</div>
            <div><strong>Airline:</strong> {flight.airline}</div>
            <div><strong>Flight Number:</strong> {flight.flightNumber}</div>
          </div>
          <button className="book-button" onClick={() => handleBookNow(flight)}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}

export default Details;
