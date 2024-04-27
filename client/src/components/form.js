import React, { useState, useRef, useEffect } from "react";
import "./form.css";
import { Link, useHistory } from "react-router-dom";

function FormPage({ json_data }) {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    tripType: "oneWay",
    name: "",
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    classType: "economy",
    transcript: "",
  });
  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to fetch data only once when the component mounts

  const fetchData = () => {
    fetch("http://localhost:3001/extracted-data") // Fetch data from the server
      .then((response) => {
        if (!response) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received data from server:", data);
        setFormData({
          tripType: "oneWay", // Assuming default values
          name: data.names ? data.names[0] : "", // Extracting name
          from: data.from_location ? data.from_location : "", // Extracting from location
          to: data.to_location ? data.to_location : "", // Extracting to location
          departureDate: data.dates ? data.dates[0] : "", // Extracting departure date
          returnDate: "", // Assuming return date is not available
          classType: "economy", // Assuming default class type
          transcript: "", // Assuming transcript is not available
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  
  const database = () => {
    // Prevent the default form submit action
    fetch('http://localhost:3001/search-flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: formData.from, to: formData.to })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Search results:', data);
      // you might want to redirect or do something with the data here
      history.push('/details', { flights: data });
    })
    .catch(error => console.error('Error:', error));
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    fetch('http://localhost:3001/transcripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: formData.transcript }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }).catch((error) => console.log('There has been an ambiguous problem in the fetch operation:', error));
  };
  

  const toggleRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    if (!speechRecognitionRef.current) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.lang = "en-US";
      speechRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData((prevState) => ({
          ...prevState,
          transcript: prevState.transcript + " " + transcript,
        }));
      };
      speechRecognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    if (isRecording) {
      speechRecognitionRef.current.stop();
      handleSubmit();
      setTimeout(() => {
        // reload page
        window.location.reload();
       
      }, 6000);

      
      
    } else {
      speechRecognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
    

  return (
    <div className="backdiv">
    <div className="page-layout">
    <div className="headingformpage">
      <h1 style={{ textAlign: 'right' }}>Your Ticket to Explore The World</h1>
      <p style={{ fontSize: '20px', textAlign: 'right' }}>Discover the world at your fingertips. </p>

    </div>
      <div className="form-container">
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="radio-container">
            <label>
              <input
                type="radio"
                name="tripType"
                value="oneWay"
                checked={formData.tripType === "oneWay"}
                onChange={handleChange}
              />
              One Way
            </label>
            <label>
              <input
                type="radio"
                name="tripType"
                value="twoWay"
                checked={formData.tripType === "twoWay"}
                onChange={handleChange}
              />
              Return
            </label>
          </div>
          <label htmlFor="Name">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <label htmlFor="from" className="from">From</label>
          <input
            type="text"
            name="from"
            placeholder="From"
            value={formData.from}
            onChange={handleChange}
          />
          <label htmlFor="to" className="to">To</label>
          <input
            type="text"
            name="to"
            placeholder="To"
            value={formData.to}
            onChange={handleChange}
          />
          <label htmlFor="departureDate">Departure Date</label>
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
          />
          {formData.tripType === "twoWay" && (
            <>
              <label htmlFor="returnDate">Return Date</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
              />
            </>
          )}
          <label htmlFor="classType">Class</label>
          <select
            name="classType"
            value={formData.classType}
            onChange={handleChange}
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="firstClass">First Class</option>
          </select>

          
          <label className="switch" >
            <input
              type="checkbox"
              checked={isRecording}
              onChange={toggleRecording}
            />
            <span className="slider round"></span>
          </label>
          
          

          <Link to="/details" style={{ textDecoration: "none" }} onClick={database}>
               <button type="submit" className="submit-button">Submit</button>
          </Link>
        </form>
      </div>

      <div className="transcript-container">
        <textarea
          className="transcript-area"
          rows="10"
          placeholder=""
          value={formData.transcript}
          readOnly
        />
      </div>
    </div>
    </div>
  );
}

export default FormPage;