import React, { useState } from "react";
import { Input, Button } from "../component";
import { useForm } from "react-hook-form";
import { resetPassword } from "../service"; // Ensure this import path is correct

export default function ForgotPassForm() {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSigning(true);
    setError(null);
    setSuccessMessage(null);
    console.log(data, "data");

    const response = await resetPassword(data.email);
    console.log(response, "response");

    if (response.success) {
      setSuccessMessage(response.message);
    } else {
      setError(response.message);
    }

    setIsSigning(false); // Stop button processing
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="space-y-2">
          <span className="mb-6 block">
            <Input
              mainInput={"sm:w-full w-full"}
              label="Email"
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
            {error && (
              <p className="text-start text-red-500 text-sm py-1">{error}</p>
            )}
            {successMessage && (
              <p className="text-start text-green-500 text-sm py-1">
                {successMessage}
              </p>
            )}
          </span>

          <Button
            type="submit"
            className={`w-full ${
              isSigning ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSigning}
          >
            {isSigning ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
}
