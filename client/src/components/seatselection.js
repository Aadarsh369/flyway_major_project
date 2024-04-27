import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './seatselection.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const SeatSelector = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const seatPrice = 120; // Price for each seat
  const history = useHistory();

  const handleSeatSelection = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const goToPayment = () => {
    history.push('/payment');
  };

  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="seat-selector-container">
      <div className="plane">
        <div className="cockpit">
          <h1>Select a seat</h1>
        </div>
        <div className="exit exit--front fuselage"></div>
        <div className="cabin fuselage">
          {Array.from({ length: 10 }, (_, row) => (
            <div key={row} className={`row row--${row + 1}`}>
              <div className="seats" type="A">
                {Array.from({ length: 6 }, (_, seat) => {
                  const seatId = `${row + 1}${String.fromCharCode(65 + seat)}`;
                  return (
                    <div key={seatId} className="seat">
                      <input
                        type="checkbox"
                        id={seatId}
                        checked={selectedSeats.includes(seatId)}
                        onChange={() => handleSeatSelection(seatId)}
                      />
                      <label htmlFor={seatId}>{seatId}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="exit exit--back fuselage"></div>
      </div>
      <div className="sidebar">
        <div className="sidebar-content">
          <h2>Selected Seats</h2>
          <div>
            {selectedSeats.map(seat => (
              <div key={seat}>Seat {seat}</div>
            ))}
          </div>
          <p>Total Price: {totalPrice} Rupees</p>
          <button className="pay-now-button" onClick={goToPayment}>
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
