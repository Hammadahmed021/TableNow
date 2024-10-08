// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import Loader from './Loader'

// const AuthLayout = ({ children, authentication = true }) => {
//   const navigate = useNavigate();
//   const [loader, setLoader] = useState(true);
//   const authStatus = useSelector((state) => state.auth.status);

//   useEffect(() => {
//     const redirectState = JSON.parse(localStorage.getItem("redirectState"));

//     if (authentication && !authStatus) {
//       // If authentication is required and user is not logged in, redirect to login
//       navigate("/login");
//     } else if (!authentication && authStatus) {
//       // If authentication is not required and user is logged in, redirect to home
//       navigate("/profile");
//     } else if (redirectState && redirectState.fromReservation && authStatus) {
//       // If redirected from reservation and user is logged in, navigate back to reservation
//       localStorage.removeItem("redirectState");
//       navigate(redirectState.location.pathname, { state: redirectState.location.state });
//     }
    
//     setLoader(false);
//   }, [authentication, authStatus, navigate]);

//   return loader ? <h2><Loader /></h2> : <>{children}</>;
// };

// export default AuthLayout;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from './Loader'

const AuthLayout = ({ children, authentication = true }) => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  
  // Get the auth status from Redux
  const authStatus = useSelector((state) => state.auth.status);
  
  // Get the token from localStorage
  const BawaToken = localStorage.getItem("signToken");

  useEffect(() => {
    const redirectState = JSON.parse(localStorage.getItem("redirectState"));
    
    // If authentication is required and the user is neither logged in via token nor authenticated via authStatus
    if (authentication && !BawaToken && !authStatus) {
      navigate("/login"); // Redirect to login
    } 
    
    // If authentication is not required and the user is logged in (has token or is authenticated via Redux)
    else if (!authentication && (BawaToken || authStatus)) {
      navigate("/profile"); // Redirect to profile
    } 
    
    // Handle redirection after a reservation
    else if (redirectState && redirectState.fromReservation && (BawaToken || authStatus)) {
      localStorage.removeItem("redirectState");
      navigate(redirectState.location.pathname, { state: redirectState.location.state });
    }

    setLoader(false); // Stop showing the loader once the checks are complete
  }, [authentication, BawaToken, authStatus, navigate]);

  return loader ? <h2><Loader /></h2> : <>{children}</>;
};

export default AuthLayout;



 
