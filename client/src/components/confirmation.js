
import React, { useState, useEffect } from 'react';
import axios from 'axios'
// import { jsPDF } from 'jspdf'; // Import jsPDF
import './confirmation.css';

function Confirmation() {
 
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);


  useEffect(() => {
    // Simulate PDF generation (replace with your actual logic)
    const generatePdf = async () => {
      setIsGeneratingPdf(true);
      // Simulate some delay for PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      setIsGeneratingPdf(false);
      setDownloadUrl('http://localhost:3001/getPdfGenerated'); // Replace with actual URL
    };

    generatePdf();

  }, []);
 
  const handleDownload = async () => {
    if (downloadUrl) {
     const response=await axios.get(downloadUrl,{
      responseType:'blob',
     });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated_ticket.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="confirmation-container">
     
      {isGeneratingPdf ? (
        <p>Generating PDF...</p>
      ) : (
        <>
          <button onClick={handleDownload} disabled={!downloadUrl}>
            Download PDF
            </button>
          <div className="tick-icon">✓</div>
          <div className="confirmation-message">Booking Confirmed</div>
        </>
      )}
         
       
    </div>
  );
}

export default Confirmation;

