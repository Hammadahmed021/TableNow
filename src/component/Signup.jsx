import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { signupUser } from "../store/authSlice";
import { Input, Button } from "../component";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Capacitor } from "@capacitor/core";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const isApp = Capacitor.isNativePlatform();

export default function Signup() {
  const [isSigning, setIsSigning] = useState(false);
  const [showError, setShowError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handleSignup = async (userData) => {
    console.log(userData, "signup form");
    setIsSigning(true);
    setShowError(""); // Clear any previous error message

    // Skip recaptcha validation if running in native app (isApp)
    if (!isApp && !recaptchaToken) {
      setShowError("Please complete the reCAPTCHA.");
      setIsSigning(false);
      return;
    }

    try {
      const response = await dispatch(signupUser({ ...userData })).unwrap();
      console.log("Signup response:", response);
      // Navigate to home or another page
      navigate("/"); // Adjust the navigation as needed
    } catch (error) {
      console.error("API Signup failed:", error);
      if (error == "Firebase: Error (auth/email-already-in-use).") {
        setShowError("User already exists with this email.");
      } else {
        setShowError(error || "Signup failed. Please try again.");
      }
    } finally {
      setIsSigning(false);
    }
  };

  const password = watch("password");

  const handleRecaptchaChange = (value) => {
    setRecaptchaToken(value);
  };

  // Prevent numbers in text fields
  const handleNameKeyPress = (e) => {
    const charCode = e.keyCode || e.which;
    const charStr = String.fromCharCode(charCode);
    if (!/^[a-zA-Z]+$/.test(charStr)) {
      e.preventDefault();
    }
  };

  // Prevent non-numeric input in phone number and limit length
  const handlePhoneKeyPress = (e) => {
    const charCode = e.keyCode || e.which;
    const charStr = String.fromCharCode(charCode);
    if (!/^[0-9]+$/.test(charStr)) {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSignup)} className="mt-8">
      <div className="mt-2">
        <span className="mb-6 flex space-x-2">
          <Input
            mainInput={"sm:w-full w-full"}
            label="First Name"
            type="text"
            placeholder="John"
            onKeyPress={handleNameKeyPress} // Prevent numbers
            {...register("fname", {
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "First name should contain only alphabets",
              },
            })}
          />
          {errors.fname && (
            <p className="text-red-500 text-xs mt-1">{errors.fname.message}</p>
          )}
          <Input
            mainInput={"sm:w-full w-full"}
            label="Last Name"
            type="text"
            placeholder="Doe"
            onKeyPress={handleNameKeyPress} // Prevent numbers
            {...register("lname", {
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "Last name should contain only alphabets",
              },
            })}
          />
          {errors.lname && (
            <p className="text-red-500 text-xs mt-1">{errors.lname.message}</p>
          )}
        </span>
        <span className="mb-6 flex space-x-2">
          <span className="w-full">
            <Input
              mainInput={"sm:w-full w-full"}
              label="Email"
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </span>
          <span className="w-full">
            <Input
              mainInput={"sm:w-full w-full"}
              label="Phone Number"
              placeholder="8191 18181 17337"
              type="tel"
              maxLength={15} // Restrict length to 15 digits
              onKeyPress={handlePhoneKeyPress} // Prevent alphabets
              {...register("phone", {
                required: "Phone number is required",
                validate: {
                  lengthCheck: (value) =>
                    (value.length >= 11 && value.length <= 15) ||
                    "Phone number must be between 11 and 15 digits",
                },
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </span>
        </span>

        <span className="mb-6 block">
          <Input
            mainInput={"sm:w-full w-full"}
            label="Password"
            type="password"
            maxLength={10}
            minLength={6}
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </span>

        <span className="mb-6 block">
          <Input
            mainInput={"sm:w-full w-full"}
            label="Confirm Password"
            type="password"
            maxLength={10}
            minLength={6}
            placeholder="Re-enter your password"
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </span>

        <div className="form-control mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="mr-2"
              {...register("terms", {
                required: "You must agree to the terms and privacy policies",
              })}
            />
            <p className="text-sm">
              I agree to all the Terms and Privacy Policies
            </p>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
          )}
        </div>

        <div className="form-control mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletter"
              className="mr-2"
              {...register("newsletter")}
            />
            <p className="text-sm">
              Send me newsletter
            </p>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs mt-1">{errors.newsletter}</p>
          )}
        </div>

        {/* Conditionally render ReCAPTCHA based on isApp */}
        {!isApp && (
          <div className="mb-6">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
            {showError && (
              <p className="text-red-500 text-xs mt-1">{showError}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className={`w-full ${isSigning ? "opacity-70 cursor-not-allowed" : ""}`}
          disabled={isSigning}
        >
          {isSigning ? "Registering user..." : "Sign up"}
        </Button>
      </div>
    </form>
  );
}
