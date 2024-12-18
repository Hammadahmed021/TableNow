import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import {
  Home,
  About,
  Login,
  RestaurantDetail,
  Partner,
  PrivacyPolicy,
  TradingCondition,
  Press,
  FAQs,
  Contact,
  Listing,
  RestaurantReservation,
  Signup,
  Profile,
  Thankyou,
  NotFound,
  ForgotPassword,
  Bookings,
} from "../pages";
import { AuthLayout } from "../component";

// Determine base path based on environment
const baseURL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_BASE_URL_PRODUCTION
  : import.meta.env.VITE_BASE_URL_LOCAL;

function BaseRouter() {
  return (
    <BrowserRouter basename={baseURL}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="login" element={<AuthLayout authentication={false}><Login /></AuthLayout>} />
          <Route path="forgot" element={<AuthLayout authentication={false}><ForgotPassword /></AuthLayout>} />
          <Route path="signup" element={<AuthLayout authentication={false}><Signup /></AuthLayout>} />
          <Route path="about" element={<About />} />
          <Route path="restaurant/:id" element={<RestaurantDetail />} />
          <Route path="partner" element={<Partner />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TradingCondition />} />
          <Route path="press" element={<Press />} />
          <Route path="faq" element={<FAQs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="listing" element={<Listing />} />
          <Route path="thankyou" element={<Thankyou />} />
          <Route path="reservation/:id" element={<RestaurantReservation />} />
          <Route path="profile" element={<AuthLayout authentication={true}><Profile /></AuthLayout>} />
          <Route path="bookings" element={<AuthLayout authentication={true}><Bookings /></AuthLayout>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default BaseRouter;
