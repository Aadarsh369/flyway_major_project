import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf'; // Import jsPDF
import './confirmation.css';

function Confirmation() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if loading is false and then generate the PDF
    if (!loading) {
      const pdf = new jsPDF();
      pdf.text("Booking Confirmed", 20, 20); // Add text at position (20, 20)
      pdf.save("booking-confirmation.pdf"); // Save the PDF with a filename
    }
  }, [loading]); // This effect depends on the loading state

  return (
    <div className="confirmation-container">
      {loading ? (
        <div className="loading-icon">.</div>
      ) : (
        <>
          <div className="tick-icon">✓</div>
          <div className="confirmation-message">Booking Confirmed</div>
        </>
      )}
    </div>
  );
}

export default Confirmation;
