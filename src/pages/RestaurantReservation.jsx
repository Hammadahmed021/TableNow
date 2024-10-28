import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { menus } from "../utils/localDB";
import { Button, MenuCard, Input, Loader, CheckoutForm } from "../component";
import { FaCheck } from "react-icons/fa";
import { Logo, fallback, relatedFallback } from "../assets";
import { addBooking, clearAllBookings } from "../store/bookingSlice";
import { fetchBookings, verifyUser } from "../utils/Api";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../component/StripeCheckOut";
import { showInfoToast, showSuccessToast } from "../utils/Toast";

export default function RestaurantReservation() {
  // const SERVICE_CHARGE = 150;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [phoneError, setPhoneError] = useState("");
  const [selectedMenus, setSelectedMenus] = useState({});
  const [curMenus, setCurMenus] = useState({});
  const [isGuest, setIsGuest] = useState(true);
  const [isUser, setIsUser] = useState();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [Id, setId] = useState(false);
  const [openCardIndex, setOpenCardIndex] = useState(null);

  const handleCardToggle = (index) => {
    setOpenCardIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const user = isUser;
  // const isLoggedIn = !user;
  console.log(user, "user");

  const { restaurant, date, time, seats, hotel_id } = location.state || {};

  const fetchUserData = async () => {
    try {
      const response = await verifyUser();
      const data = await response.data;
      setId(data?.id);
      setIsUser(data);
      console.log(data, "data on fetch");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const guestState = localStorage.getItem("guestState");
    if (guestState) {
      setIsGuest(JSON.parse(guestState));
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    localStorage.setItem("guestState", JSON.stringify(isGuest));
  }, [isGuest]);

  useEffect(() => {
    if (user) {
      setName(user?.displayName || user?.user?.name || "");
      setPhone(user?.phone || "");
    }
  }, [user]);

  // Fetch data from location state

  const handleCheckboxChange = (menu) => {
    setSelectedMenus((prevSelectedMenus) => {
      const isSelected = prevSelectedMenus.hasOwnProperty(menu.id);
      if (isSelected) {
        const { [menu.id]: removedItem, ...rest } = prevSelectedMenus;
        return rest;
      } else {
        return { ...prevSelectedMenus, [menu.id]: { ...menu, quantity: 1 } };
      }
    });
  };

  const handleQuantityChange = (menuId, increment) => {
    setSelectedMenus((prevState) => {
      const updatedMenu = { ...prevState[menuId] };
      updatedMenu.quantity += increment;
      if (updatedMenu.quantity < 1) {
        updatedMenu.quantity = 1;
      }
      return { ...prevState, [menuId]: updatedMenu };
    });
  };

  const removeMenu = (menuId) => {
    setSelectedMenus((prevState) => {
      const { [menuId]: removedItem, ...rest } = prevState;
      return rest;
    });
  };

  // const calculateTotalPrice = () => {
  //   return Object.values(selectedMenus).reduce(
  //     (total, menu) => total + menu.price_per_person * menu.quantity,
  //     0
  //   );
  // };

  const calculateTotalPrice = () => {
    const menuTotal = Object.values(selectedMenus).reduce(
      (total, menu) => total + menu.price_per_person * menu.quantity,
      0
    );
    return menuTotal * (seats || 1); // Multiply by number of seats, default to 1 if seats is undefined
  };

  const totalPrice = calculateTotalPrice();
  console.log(totalPrice, "totalPrice");

  const handlePayment = async (paymentIntentId) => {
    setIsSigning(true);
    if (totalPrice > 0) {
      const newBooking = {
        user: user?.uid || "guest",
        restaurant,
        date,
        time,
        seats,
        selectedMenus,
        totalPrice,
        name: user?.displayName || name,
        phone,
        paymentIntentId,
      };
      const booking = {
        user_id: user?.user?.id || Id || null,
        hotel_id,
        seats,
        time,
        date,
        paymentIntentId,
      };
      const token = localStorage.getItem("webToken") || user?.token;
      if (!user?.uid) {
        const guestBookings =
          JSON.parse(localStorage.getItem("guestBookings")) || [];
        guestBookings.push(newBooking);
        localStorage.setItem("guestBookings", JSON.stringify(guestBookings));
      }
      try {
        const result = await fetchBookings(booking, token);
        console.log(result, "booking");
        dispatch(addBooking(newBooking));
      } catch (error) {
        console.log(error, "error while sending bookings");
        throw new Error("something went wrong");
      } finally {
        setIsSigning(false);
        showSuccessToast("Booking created successfully");
      }
      // Use replace to prevent navigation back
      if (user?.uid || Id) {
        navigate("/profile", { replace: true }); // Redirect to profile page
      } else {
        navigate("/thankyou", {
          state: { restaurant }, // Make sure restaurant is defined
          replace: true, // This will replace the current entry in the history stack
        });
      }
    }
  };

  const handleLogin = () => {
    // Save current state to sessionStorage (or localStorage)
    localStorage.setItem(
      "redirectState",
      JSON.stringify({ fromReservation: true, location: location })
    );

    // Clear guest bookings stored in local storage
    localStorage.removeItem("guestBookings");

    // Clear guest bookings stored in Redux
    // dispatch(clearAllBookings());

    navigate("/login");
  };

  if (!restaurant || !date || !time || !seats) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Loader />
      </div>
    );
  }
  console.log(restaurant, "restaurant");

  useEffect(() => {
    checkMenu();
  }, [date]);

  const checkMenu = () => {
    if (restaurant?.calendars?.length > 0) {
      const matchingCalendar = restaurant.calendars.find(
        (calendar) => calendar.date === date
      );
      console.log(matchingCalendar, "matchingCalendar");
      if (matchingCalendar.date == date) {
        setCurMenus(matchingCalendar.menus);
      } else {
        setCurMenus([]); // Clear menus if none are found for the selected date
      }
    } else {
      setCurMenus([]); // Clear menus if calendars are not available
    }
  };
  // useEffect(() => {
  //   // Extract and store prices when menus change
  //   const prices = curMenus.map((menu) => menu.price_per_person || "N/A");
  //   console.log(prices, 'price');
  //   setMenuPrices(prices);
  // }, [curMenus]);
  console.log(selectedMenus, "selectedMenus");

  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 -> 12 for 12 AM
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap items-start justify-between mb-8 sm:mb-6 pt-8 sm:pt-10">
        <div>
          <p className="text-tn_dark text-base font-semibold capitalize">
            {restaurant.name}
          </p>
          <h2 className="text-3xl font-extrabold capitalize">
            Restaurant Reservation
          </h2>
        </div>
      </div>
      <div className="container mx-auto p-0 mb-8">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8">
            <h4 className="font-bold text-xl mb-4">Select Menu</h4>

            {curMenus.length > 0 ? (
              curMenus?.map((menu) => (
                <div key={menu.id} className="flex items-center my-2">
                  <MenuCard
                    image={menu.image || relatedFallback}
                    fallbackText={"Image not available"}
                    name={menu.title || "No Title"}
                    detail={menu.description || "No Description"}
                    duration={menu.meal_type || "N/A"}
                    price={menu.price_per_person || "N/A"}
                    type={
                      menu.menu_types.map((type) => type.name).join(", ") ||
                      "No Type"
                    }
                    extraDetails={menu.menu_items.map((item) => ({
                      title: item.title,
                      description: item.description,
                    }))}
                    isOpen={openCardIndex === menu.id}
                    onToggle={() => handleCardToggle(menu.id)}
                  />
                  <div className="relative ml-3 sm:ml-12 h-7 w-7">
                    <input
                      type="checkbox"
                      className="appearance-none h-7 w-7 border-4 border-tn_dark rounded-md checked:bg-tn_dark checked:border-transparent focus:ring-tn_dark"
                      checked={selectedMenus.hasOwnProperty(menu.id)}
                      onChange={() => handleCheckboxChange(menu)}
                    />
                    {selectedMenus.hasOwnProperty(menu.id) && (
                      <span className="absolute left-0 top-0 m-[1px] z-10 w-[26px] h-[26px] rounded-md text-tn_light border-2 border-white">
                        <FaCheck
                          size={16}
                          className="mx-auto absolute left-[3px] top-[3px]"
                        />
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No menus available.</p>
            )}
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="relative border border-tn_light_grey rounded-md shadow-md p-4 overflow-hidden mt-4 sm:mt-0">
              <div className="flex items-start border-b border-b-tn_light_grey pb-6">
                <div className="size-16">
                  <img
                    src={
                      restaurant?.profile_image ||
                      restaurant?.galleries[0]?.image ||
                      fallback
                    }
                    alt={restaurant?.name}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>

                <div className="ml-3">
                  <p className="text-sm text-tn_text_grey opacity-70 capitalize">
                    {restaurant?.type}
                  </p>
                  <h4 className="font-bold text-xl capitalize">
                    {restaurant?.name}
                  </h4>
                </div>
              </div>
              <div className="border-b border-b-tn_light_grey py-4">
                <p className="inline-flex sm:flex-nowrap flex-wrap items-center m-0">
                  Your booking is protected by
                  <img
                    src={Logo}
                    className="w-[100px] ml-0 mt-2 sm:mt-0 sm:ml-2"
                    alt=""
                  />
                </p>
              </div>
              <div className="border-b border-b-tn_light_grey py-4">
                <h4 className="font-bold text-xl capitalize mb-4">Details</h4>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline">Date:</span> <span>{date}</span>
                </p>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline">Time:</span> <span>{time}</span>
                </p>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline">Number of People:</span>{" "}
                  <span>{seats}</span>
                </p>
                {/* <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline">Service Charge:</span>
                  <span>Dkk{SERVICE_CHARGE}</span>
                </p> */}
              </div>
              <div className="border-b border-b-tn_light_grey py-4">
                <h4 className="font-bold text-xl capitalize mb-4">Dishes</h4>
                <ul>
                  {Object.keys(selectedMenus).length > 0 ? (
                    Object.values(selectedMenus).map((menu) => (
                      <li key={menu.id} className="mb-3">
                        <div className="relative flex justify-between items-center">
                          <div className="flex space-x-1 w-4/5 items-center">
                            <div className="size-16 w-1/4">
                              <img
                                src={menu?.image || relatedFallback}
                                alt={menu?.title}
                                className="object-cover size-16 rounded-md "
                              />
                            </div>
                            <div className="flex flex-col justify-between relative w-3/4">
                              <span className="text-xs text-tn_text_grey opacity-70">
                                {menu?.meal_type}
                              </span>
                              <span className="text-lg font-bold ">
                                {menu?.title}
                              </span>
                              <span className="text-xs text-tn_dark_field font-medium">
                                DKK {menu?.price_per_person * menu?.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 w-1/5 justify-end">
                            {/* <div className="flex items-center p-1 border border-black rounded-2xl text-sm">
                              <button
                                onClick={() =>
                                  handleQuantityChange(menu?.id, -1)
                                }
                                style={{ margin: "0 5px" }}
                              >
                                -
                              </button>
                              <span>{menu?.quantity}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(menu?.id, 1)
                                }
                                style={{ margin: "0 5px" }}
                              >
                                +
                              </button>
                            </div> */}
                            <span
                              onClick={() => removeMenu(menu?.id)}
                              className="cursor-pointer text-white px-1 shadow-sm bg-red-600 rounded-sm ml-2 text-xs"
                            >
                              X
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-tn_dark_field">Card is empty.</p>
                  )}
                </ul>
              </div>
              <p className="text-base text-tn_dark_field font-semibold flex justify-between items-center mt-4">
                <span>Total (DKK)</span>
                <span>DKK {`${calculateTotalPrice()}`}</span>
              </p>
            </div>
            <div className="mt-6 mb-4">
              {!user && (
                <div className="mb-4">
                  <h4 className="font-bold text-xl capitalize mb-4">
                    Continue as Guest or Login
                  </h4>
                  <div className="flex space-x-4">
                    {/* <Button
                      children="Continue as Guest"
                      bgColor={`${isGuest ? "bg-tn_dark" : "bg-tn_pink"}`}
                      onClick={() => setIsGuest(true)}
                      className="text-white"
                    /> */}
                    <Button
                      children="Login"
                      onClick={handleLogin}
                      className={`${
                        !isGuest ? "bg-tn_dark text-white" : "bg-tn_light_grey"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* {isGuest && (
                <div className="mb-4">
                  <h4 className="font-bold text-xl capitalize mb-4">
                    Book now as guest
                  </h4>
                </div>
              )} */}

              {(user || isGuest) && (
                <div className="mb-4">
                  <h4 className="font-medium text-base capitalize mb-4">
                    {user
                      ? `Welcome, ${
                          user?.userData?.displayName ||
                          user?.user?.name ||
                          user?.displayName ||
                          user?.name
                        }`
                      : "Guest Details"}
                  </h4>
                  {!user && (
                    <Input
                      type="text"
                      placeholder="Enter Your Name"
                      className="border-tn_light_grey mb-4"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required="true"
                    />
                  )}
                  {user ? (
                    user?.phone || phone
                  ) : (
                    <Input
                      type="tel"
                      placeholder="Enter Your Phone Number"
                      className="border-tn_light_grey mb-5"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  )}
                </div>
              )}

              <h4 className="font-bold text-xl capitalize mb-4">
                Terms & Conditions
              </h4>
              <p className="text-sm mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate.
              </p>
              <p className="text-sm mb-8">
                velit esse cillum dolore Dolor sit amet, consectetur adipiscing
                elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore utemien.
              </p>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  amount={totalPrice}
                  handlePayment={handlePayment}
                  buttonDis={totalPrice}
                />
              </Elements>

              {/* <Button
                children={isSigning ? "Payment..." : "Confirm Payment"}
                className={`w-full ${
                  totalPrice === 0 ? "opacity-50 cursor-not-allowed" : ""
                } ${isSigning ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={handlePayment}
                disabled={totalPrice === 0 || isSigning}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
