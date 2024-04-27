import React, { useEffect } from 'react';
import "../styles/Logout.css";
import { useHistory } from 'react-router-dom';

const Logout = () => {
    const history = useHistory();

    useEffect(() => {
        localStorage.removeItem("auth");
        setTimeout(() => {
            history.push("/");
        }, 3000);
    }, []);

    return (
        <div className='logout-main'>
            <h1>Logout Successful!</h1>
            <p>You will be redirected to the landing page in 3 seconds...</p>
        </div>
    );
};

export default Logout;
