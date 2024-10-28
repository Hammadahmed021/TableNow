import React, { useState } from "react";
import { Carousel, Login as LoginComponent } from "../component";
import { signup, login, Logo } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { SignUpWithGoogle } from "../service";
import { signupUser, login as loginFunc } from "../store/authSlice";
import { auth } from "../service/firebase";
import { getUserFromGmailLogin } from "../utils/Api";
import { Capacitor } from "@capacitor/core";
import useMediaQuery from "../hooks/useQuery";

// const images = [login, signup];

const Login = () => {
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const isDesktop = useMediaQuery("(max-width: 1550px)");


  const isApp = Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios";

  const handleLogin = async () => {
    try {
      const { user } = await SignUpWithGoogle();
      console.log("User logged in:", user);

      // Check if the user is already logged in
      // const currentUser = auth.currentUser;
      // if (currentUser && currentUser.uid === user.uid) {
      //   setError("User is already logged in.");

      //   setTimeout(() => navigate("/"), 2000);
      //   console.log(authStatus, userData, "data");
      //   return; // Stop further execution
      // }

      // Proceed with login if it's a different user or not logged in
      const userEmail = user?.email;

      if (userEmail) {
        const response = await getUserFromGmailLogin(userEmail);
        const token = response.data.token;
        console.log(token, "token jhan");

        // Store token in localStorage
        localStorage.setItem("webToken", token);
      }

      if (user) {
        dispatch(
          loginFunc({
            userData: {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photo: user.photoURL,
              loginType: user.providerData?.[0]?.providerId,
            },
          })
        );
        // navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="container mx-auto flex sm:items-center justify-center min-h-screen p-0 sm:p-2 relative flex-col sm:flex-col items-stretch">
      <Link to={"/"}>
        <img src={Logo} className="w-fit relative sm:absolute top-4 left-4 mb-8 sm:mb-0" />
      </Link>
      <div className={`${isDesktop && 'mt-12'} grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}>
        {/* Left Column: Login Form */}
        <div className="px-4 sm:px-4">
          <h2 className="text-3xl w-full text-black sm:text-4xl md:text-5xl font-extrabold">
            Login
          </h2>
          <p className="text-tn_text_grey mt-2 mb-8">
            Login to access your travelwise account
          </p>
          <LoginComponent />
          <p className="text-tn_dark_field text-sm font-bold text-center py-3">
            Don’t have an account?{" "}
            <Link className="text-tn_pink" to={"/signup"}>
              Sign up
            </Link>
          </p>
          {!isApp && (
            <>
              <div className="relative py-4 mt-5 mb-8">
                <hr className="bg-tn_light_grey" />
                <p className="absolute top-1 left-0 right-0 mx-auto text-center sm:w-[20%] w-[40%] bg-white text-tn_text_grey text-sm">
                  Or login with
                </p>
              </div>
              <div className="flex justify-between items-center space-x-3">
                <span
                  className="p-3 flex justify-center border w-full border-tn_light_grey rounded-lg"
                  onClick={() => {}}
                >
                  <FaFacebook size={24} />
                </span>
                <span
                  className="p-3 flex justify-center text-center border w-full border-tn_light_grey rounded-lg"
                  onClick={handleLogin}
                >
                  <FaGoogle size={24} />
                </span>
                <span
                  className="p-3 flex justify-center text-center border w-full border-tn_light_grey rounded-lg"
                  onClick={() => {}}
                >
                  <FaApple size={24} />
                </span>
              </div>
            </>
          )}
          {error && <p className="mt-3 text-center text-base">{error}</p>}
        </div>

        {/* Right Column: Image Slider */}
        <div className="relative hidden md:block">
          <img src={login} alt={`login`} className="w-full" />
          {/* <Carousel slidesToShow={1}>
            {images.map((image, index) => (
            <img src={image} alt={`slide-${index}`} key={index} className="w-full" />
            ))}
          </Carousel> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
