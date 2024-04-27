import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useHistory } from 'react-router-dom';
import Button from './Button'; // Import Button component

function Navbar() {
  const [click, setClick] = useState(false);
  const [buttonText, setButtonText] = useState('Log in');
  const [buttonLink, setButtonLink] = useState('/login');
  const [buttonStyle, setButtonStyle] = useState('btn--outline');
  const [buttonVisible, setButtonVisible] = useState(true);
  const history = useHistory();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleButtonClick = () => {
    if (buttonLink === '/logout') {
      // Handle logout functionality
      // For example, clear user session, etc.
      // Then redirect to login page
      history.push('/login');
      setButtonText('Log in');
      setButtonLink('/login');
      setButtonStyle('btn--outline');
    } else {
      history.push(buttonLink);
    }
  };

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButtonVisible(false);
    } else {
      setButtonVisible(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', showButton);
    return () => {
      window.removeEventListener('resize', showButton);
    };
  }, []);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            <i className="fas fa-plane" /> 
            FLYWAY 
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/services' className='nav-links' onClick={closeMobileMenu}>
                Services
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/register' className='nav-links' onClick={closeMobileMenu}>
                Sign up
              </Link>
            </li>
            <li>
              <Link
                to='/Auth/sign-up'
                className='nav-links-mobile'
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </li>
          </ul>
          {buttonVisible && (
            <Button
              buttonStyle={buttonStyle}
              onClick={handleButtonClick}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
