import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { signupUser } from "../store/authSlice";
import { Input, Button } from "../component";
import { Link, useNavigate } from "react-router-dom";
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
    setValue,
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
    // Allow numeric input only
    if (!/^[0-9]+$/.test(charStr)) {
      e.preventDefault();
    }
  };

  const formatPhoneNumberWithCountryCode = (value) => {
    // Remove all non-numeric characters except for the leading '+45'
    let cleanedValue = value.replace(/[^0-9]/g, "");

    // Ensure '+45' is always at the beginning
    if (cleanedValue.startsWith("45")) {
      cleanedValue = cleanedValue.slice(2);
    }

    // Format according to the Denmark number format +45 XX XX XX XX
    const match = cleanedValue.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const formatted = `+45 ${match[1] ? `${match[1]}` : ""}${
        match[2] ? ` ${match[2]}` : ""
      }${match[3] ? ` ${match[3]}` : ""}${match[4] ? ` ${match[4]}` : ""}`;
      return formatted.trim();
    }
    return "+45";
  };

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return (
    <form onSubmit={handleSubmit(handleSignup)} className="mt-8">
      <div className="mt-2">
        <span className="mb-6 flex space-x-2">
          <span className="w-full">
            <Input
              mainInput={"sm:w-full w-full"}
              label="First Name"
              type="text"
              placeholder="John"
              onKeyPress={handleNameKeyPress} // Prevent numbers
              {...register("fname", {
                required: "First name is required",
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "First name should contain only alphabets",
                },
              })}
            />
            {errors.fname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fname.message}
              </p>
            )}
          </span>
          <span className="w-full">
            <Input
              mainInput={"sm:w-full w-full"}
              label="Last Name"
              type="text"
              placeholder="Doe"
              onKeyPress={handleNameKeyPress} // Prevent numbers
              {...register("lname", {
                required: "Last name is required",
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Last name should contain only alphabets",
                },
              })}
            />
            {errors.lname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lname.message}
              </p>
            )}
          </span>
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
              mainInput="sm:w-full w-full"
              label="Phone Number"
              placeholder="+45 XX XX XX" // Danish phone format with country code
              type="tel"
              maxLength={15} // Allow space for '+45' and 8 digits formatted as XX XX XX XX
              onKeyPress={handlePhoneKeyPress}
              {...register("phone", {
                required: "Phone number is required",
                onChange: (e) => {
                  const formattedValue = formatPhoneNumberWithCountryCode(
                    e.target.value
                  );
                  setValue("phone", formattedValue); // Update form state with formatted value
                },
                validate: {
                  lengthCheck: (value) =>
                    value.replace(/\D/g, "").length === 10 || // '+45' + 8 digits
                    "Phone number must be 8 digits (including +45)",
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
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: strongPasswordRegex,
                message:
                  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
              },
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
              I agree to all the{" "}
              <Link
                target="_blank"
                className="underline"
                to={"/terms-of-service"}
              >
                terms
              </Link>{" "}
              and{" "}
              <Link
                className="underline"
                target="_blank"
                to={"/privacy-policy"}
              >
                privacy
              </Link>{" "}
              policies.
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
            <p className="text-sm">Send me newsletter</p>
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
          className={`w-full ${
            isSigning ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSigning}
        >
          {isSigning ? "Registering user..." : "Sign up"}
        </Button>
      </div>
    </form>
  );
}
