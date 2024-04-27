import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './passengerdetail.css'; // Updated CSS file name for clarity

const PassengerForm = () => {
  const [passengers, setPassengers] = useState([{
    name: '',
    age: '',
    gender: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    state: ''
  }]);
  const [addons, setAddons] = useState('');
  const [meals, setMeals] = useState('');
  const history = useHistory();

  const handleInputChange = (index, event) => {
    const values = [...passengers];
    values[index][event.target.name] = event.target.value;
    setPassengers(values);
  };

  const handleAddPassenger = () => {
    setPassengers([...passengers, {
      name: '',
      age: '',
      gender: '',
      email: '',
      phoneNumber: '',
      countryCode: '',
      state: ''
    }]);
  };

  const handleRemovePassenger = (index) => {
    const values = [...passengers];
    values.splice(index, 1);
    setPassengers(values);
  };

  const handleAddonChange = (event) => {
    setAddons(event.target.value);
  };

  const handleMealChange = (event) => {
    setMeals(event.target.value);
  };

  const handlePayNow = () => {
    history.push('/seatselection');
  };

  return (
    <div className="passenger-details-container">
      <form className="passenger-form-container">
        {passengers.map((passenger, index) => (
          <div key={index} className="passenger-section">
            <input
              name="name"
              placeholder="Name"
              value={passenger.name}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <input
              name="age"
              type="number"
              placeholder="Age"
              value={passenger.age}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <select
              name="gender"
              value={passenger.gender}
              onChange={event => handleInputChange(index, event)}
              className="passenger-select"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={passenger.email}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <input
              name="countryCode"
              placeholder="Country Code"
              value={passenger.countryCode}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              value={passenger.phoneNumber}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <input
              name="state"
              placeholder="State"
              value={passenger.state}
              onChange={event => handleInputChange(index, event)}
              className="passenger-input"
            />
            <button type="button" onClick={() => handleRemovePassenger(index)} className="passenger-button-remove">Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddPassenger} className="passenger-button">Add Passenger</button>

        {/* Add-ons and Meals */}
        <div className="addon-meal-section">
          <select
            value={addons}
            onChange={handleAddonChange}
            className="addon-select"
          >
            <option value="">Select Add-on</option>
            <option value="extraBaggage">Extra Baggage</option>
            <option value="priorityBoarding">Priority Boarding</option>
            <option value="windowSeat">Window Seat</option>
          </select>
          <select
            value={meals}
            onChange={handleMealChange}
            className="meal-select"
          >
            <option value="">Select Meal Option</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="nonVegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>

        <button type="button" onClick={handlePayNow} className="passenger-button" style={{ marginTop: '20px' }}>Select Seats</button>
      </form>
    </div>
  );
};

export default PassengerForm;
