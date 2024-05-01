import React, { useEffect, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Check correct import path
import "../styles/Register.css";
import { Link, useHistory } from "react-router-dom"; // Using useHistory
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory(); // Using useHistory for navigation
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");

  useEffect(() => {
    if (token !== "") {
      toast.success("You are already logged in");
      history.push("/form"); // Redirecting to dashboard if logged in
    }
  }, [token, history]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const lastname = e.target.lastname.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    const formData = {
      username: `${name} ${lastname}`,
      email,
      password
    };

    try {
      await axios.post("http://localhost:3005/api/v1/register", formData);
      toast.success("Registration successful");
      history.push("/login"); // Redirecting to login page after successful registration
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to register");
    }
  };

  return (
    <div className="register-main">
      <div className="register-left">
        <img src={Image} alt="Side decoration" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="register-center">
            <h2>Welcome to our website!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleRegisterSubmit}>
              <input type="text" placeholder="Name" name="name" required />
              <input type="text" placeholder="Lastname" name="lastname" required />
              <input type="email" placeholder="Email" name="email" required />
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" required />
                {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
              </div>
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" required />
                {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
              </div>
              <div className="register-center-buttons">
                <button type="submit">Sign Up</button>
                <button type="button" onClick={() => { /* Handle Google Sign-In here */ }}>
                  <img src={GoogleSvg} alt="Sign up with Google" />
                  Sign Up with Google
                </button>
              </div>
            </form>
          </div>
          <p className="login-bottom-p">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
