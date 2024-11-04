import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getPayment } from "../utils/Api";
import Button from "./Button";

// Make sure to replace with your own publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = ({ amount, handlePayment, buttonDis }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setProcessing(true);

    const conv =  amount.totalPrice;

    const amountInCents = Math.round(conv * 100);

    console.log(amount, 'amount >>>>>>>>>>>');
    

    const paymentData = {
      amount: amountInCents,
      hotel_id: amount.hotel_id,
    };

    try {
      const response = await getPayment(paymentData);

      const { clientSecret, paymentIntentId } = response;
      console.log("Payment Intent Response:", response);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Cardholder Name",
            },
          },
        }
      );

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment successful!");
        await handlePayment(paymentIntentId); // Pass paymentIntentId to handlePayment
      }
    } catch (error) {
      setError("An error occurred while processing the payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="shadow-md p-2 rounded-md" />
      <Button
        children={processing ? "Processing..." : "Confirm Payment"}
        className={`w-full mt-6 ${
          buttonDis === 0 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${processing ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
        disabled={!stripe || processing}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </form>
  );
};

export { stripePromise };
export default CheckoutForm;
