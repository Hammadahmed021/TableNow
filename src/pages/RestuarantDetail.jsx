import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useForm } from "react-hook-form";
import {
  Button,
  CardCarousel,
  Gallery,
  Loader,
  MapComponent,
  SelectOption,
  RelatedCard,
} from "../component";
import { fallback } from "../assets";
import {
  FaFacebook,
  FaGoogle,
  FaInstagram,
  FaTripadvisor,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { getHotelByID, verifyUser } from "../utils/Api";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [relatedRestaurants, setRelatedRestaurants] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const { register, handleSubmit, watch, resetField, setValue } = useForm();
  const [currentUser, setCurrentUser] = useState({});
  const userData = useSelector((state) => state.auth.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedSeats = watch("seats");

  const user_id = currentUser?.id || userData?.user?.id;
  const { data } = useFetch("hotels", user_id);
  const today = new Date().toLocaleDateString("en-CA"); // 'en-CA' ensures it uses the 'YYYY-MM-DD' format

  // Fetch and update card and related restaurants
  useEffect(() => {
    const fetchHotelById = async (id) => {
      try {
        const response = await getHotelByID(id); // Fetch hotel data from API
        const foundCard = response?.hotel ?? [];
        console.log(response, "foundCard >>>>>>>>");
        const filteredRestaurants = response?.related_hotels ?? [];

        setRelatedRestaurants(filteredRestaurants.slice(0, 4));

        // Find the card with the matching id
        // const foundCard = data.find((card) => card.id === parseInt(id, 10));

        if (foundCard) {
          setCard(foundCard); // Set the card state with the found card data
        } else {
          setError("Hotel not found");
        }
      } catch (err) {
        setError("Error fetching hotel data");
      } finally {
        setLoading(false);
      }
    };

    // const foundCard = data.find((card) => card.id === parseInt(id, 10));

    if (card) {
      // Extract kitchen names from the nested structure
      const foundKitchens = [];

      card.calendars?.forEach((calendar) => {
        calendar.menus?.forEach((menu) => {
          menu.kitchens?.forEach((kitchen) => {
            if (kitchen.name) {
              foundKitchens.push(kitchen.name);
            }
          });
        });
      });

      // Filter restaurants that have matching kitchens and exclude the current one
      // const filteredRestaurants = data?.filter(
      //   (restaurant) =>
      //     restaurant.id !== parseInt(id, 10) &&
      //     restaurant.calendars?.some((calendar) =>
      //       calendar.menus?.some((menu) =>
      //         menu.kitchens?.some((kitchen) =>
      //           foundKitchens.includes(kitchen.restaurant_name)
      //         )
      //       )
      //     )
      // );
    } else {
      setCard(null);
    }

    // Fetch user data
    const fetchUserData = async () => {
      const token = localStorage.getItem("signToken");
      try {
        const response = await verifyUser(token);
        const data = await response.data;
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
    fetchHotelById(id);
  }, [id]);

  console.log(relatedRestaurants, "relatedRestaurants");

  // Get current time in 24-hour format
  const getCurrentTimeIn24HourFormat = () => {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const currentTime = getCurrentTimeIn24HourFormat();

  const isTimePastDayEnd = (time) => {
    return time >= "23:59";
  };

  // Effect to update available times when the date or card changes
  useEffect(() => {
    if (card?.calendars) {
      const dateCalendar = card.calendars.find(
        (calendar) => calendar.date === today
      );

      if (dateCalendar) {
        const times = dateCalendar.calendar_details
          .map((detail) => ({
            name: detail.time,
            id: detail.time,
          }))
          .filter(
            (time) => time.id >= currentTime && !isTimePastDayEnd(time.id)
          ); // Filter out times past 11:59 PM

        setAvailableTimes(times || []);
        resetField("time");
        resetField("seats");
        setAvailableSeats([]);

        if (times.length > 0) {
          setValue("time", times[0].id); // Automatically select the first available time
        }
      } else {
        setAvailableTimes([]);
      }
    }
  }, [card, resetField, setValue, today, currentTime]);

  // Update available seats based on selected time and booked seats
  useEffect(() => {
    if (selectedTime && card?.calendars) {
      const dateCalendar = card.calendars.find(
        (calendar) => calendar.date === today
      );

      if (dateCalendar) {
        const timeDetail = dateCalendar.calendar_details.find(
          (detail) => detail.time === selectedTime
        );

        if (timeDetail) {
          const bookedSeats = timeDetail.bookedSeats || [];

          const seats = Array.from(
            { length: timeDetail.seats },
            (_, index) => index + 1
          )
            .filter((seat) => !bookedSeats.includes(seat))
            .map((seat) => ({
              name: seat,
              label: seat,
              id: seat,
            }));

          setAvailableSeats(seats);

          if (seats.length > 0) {
            setValue("seats", seats[0].id); // Automatically select the first available seat
          }
        } else {
          setAvailableSeats([]);
        }
      }
    }
  }, [selectedTime, card, setValue, today]);

  const onSubmit = (formData) => {
    const { date, time, seats } = formData;
    navigate(`/reservation/${id}`, {
      state: { hotel_id: card.id, restaurant: card, date, time, seats },
    });
  };

  if (loading)
    return (
      <div className="container mx-auto p-4 text-center">
        <Loader />
      </div>
    );
  if (error)
    return <div className="container mx-auto p-4 text-center">{error}</div>;
  if (!card)
    return (
      <div className="container mx-auto p-4 text-center">
        Restaurant not found.
      </div>
    );

  // const futureDates = card.calendars.filter(
  //   (calendar) => new Date(calendar.date) >= new Date(today)
  // );

  function extractFacilitiesNames(card) {
    const facilityNames = new Set();

    card.calendars?.forEach((calendar) => {
      calendar.menus?.forEach((menu) => {
        menu.facilities?.forEach((facility) => {
          if (facility.name) facilityNames.add(facility.name);
        });
      });
    });
    return Array.from(facilityNames);
  }

  function extractCuisineNames(card) {
    const facilityNames = new Set();

    card.calendars?.forEach((calendar) => {
      calendar.menus?.forEach((menu) => {
        menu.kitchens?.forEach((facility) => {
          if (facility.name) facilityNames.add(facility.name);
        });
      });
    });
    return Array.from(facilityNames);
  }

  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 -> 12 for 12 AM
    return `${hours}:${minutes} ${ampm}`;
  };

  console.log(card, "card");

  return (
    <>
      <div className="container mx-auto p-4">
        <Gallery
          images={card.galleries?.map((gallery) => gallery.image) || [fallback]}
          address={card.address}
          restaurant_name={card.restaurant_name}
        />
      </div>
      <div className="container mx-auto p-4 mb-14">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-9">
            <h3 className="text-black text-[26px] font-bold mb-6">Details</h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <h4 className="text-[17px] font-bold mb-1">About</h4>
                <p className="text-sm pr-5 mb-6 overflow-y-scroll h-20 block">
                  <span className="">
                    {card.description || "No description available."}
                  </span>
                </p>
                <h4 className="text-[17px] font-bold mb-1">Social links</h4>
                <ul className="flex flex-col text-sm">
                  {/* {card.facebook && (
                    <li>
                      <p className="mb-2 text-sm flex items-start">
                        <span className="w-4">
                          <FaFacebook size={14} />
                        </span>{" "}
                        <span className="ml-1">
                          {(
                            <a href={card.facebook} target="_blank">
                              {card.facebook}
                            </a>
                          ) || "No contact information available"}
                        </span>
                      </p>
                    </li>
                  )} */}
                  {card.facebook && (
                    <li>
                      <p className="mb-2 text-sm flex items-start">
                        <span className="w-4">
                          <FaFacebook size={14} />
                        </span>
                        <span className="ml-1">
                          <a
                            href={
                              card.facebook.startsWith("http")
                                ? card.facebook
                                : `https://${card.facebook}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {card.facebook}
                          </a>
                        </span>
                      </p>
                    </li>
                  )}
                  {card.instagram && (
                    <li>
                      <p className="mb-2 text-sm flex items-start">
                        <span className="w-4">
                          <FaInstagram size={14} />
                        </span>
                        <span className="ml-1">
                          <a
                            href={
                              card.instagram.startsWith("http")
                                ? card.instagram
                                : `https://${card.instagram}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {card.instagram}
                          </a>
                        </span>
                      </p>
                    </li>
                  )}
                  {card.google && (
                    <li>
                      <p className="mb-2 text-sm flex items-start">
                        <span className="w-4">
                          <FaGoogle size={14} />
                        </span>
                        <span className="ml-1">
                          <a
                            href={
                              card.google.startsWith("http")
                                ? card.google
                                : `https://${card.google}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {card.google}
                          </a>
                        </span>
                      </p>
                    </li>
                  )}
                  {card.tripAdvisor && (
                    <li>
                      <p className="mb-2 text-sm flex items-start">
                        <span className="w-4">
                          <FaTripadvisor size={14} />
                        </span>
                        <span className="ml-1">
                          <a
                            href={
                              card.tripAdvisor.startsWith("http")
                                ? card.tripAdvisor
                                : `https://${card.tripAdvisor}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {card.tripAdvisor}
                          </a>
                        </span>
                      </p>
                    </li>
                  )}

                  {!(
                    card.facebook ||
                    card.tripAdvisor ||
                    card.google ||
                    card.instagram
                  ) && <p>No social links available</p>}
                </ul>
              </div>
              <div className="col-span-12 md:col-span-3">
                <h4 className="text-[17px] font-bold mb-1">Cuisine</h4>
                <p className="mb-6 text-sm">
                  {extractCuisineNames(card).join(", ") ||
                    "No cuisine available"}
                </p>
                {/* <h4 className="text-[17px] font-bold mb-1">Meals</h4>
                <p className="mb-6 text-sm">
                  {card.meals || "No meal information available."}
                </p> */}
                <h4 className="text-[17px] font-bold mb-1">Contact 1</h4>
                <p className="mb-6 text-sm">
                  {card.phone || "No contact information available"}
                </p>
                {card.phone2 && (
                  <>
                    <h4 className="text-[17px] font-bold mb-1">Contact 2</h4>
                    <p className="mb-6 text-sm">
                      {card.phone2 || "No contact information available"}
                    </p>
                  </>
                )}

                {card.phone3 && (
                  <>
                    <h4 className="text-[17px] font-bold mb-1">Contact 3</h4>
                    <p className="mb-6 text-sm">
                      {card.phone3 || "No contact information available"}
                    </p>
                  </>
                )}
              </div>
              <div className="col-span-12 md:col-span-3">
                <h4 className="text-[17px] font-bold mb-1">Opening Hours</h4>

                {card.timings && card.timings.length > 0 ? (
                  <ul className="mb-6 text-sm">
                    {card.timings.map((timing) => (
                      <li key={timing.id} className="mb-2">
                        <span className="font-semibold capitalize">
                          {timing.day}:{" "}
                        </span>
                        <span>
                          {timing.open} - {timing.close}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-6 text-sm">No opening hours available.</p>
                )}

                <h4 className="text-[17px] font-bold mb-1">Features</h4>
                <p className="mb-6 text-sm">
                  {extractFacilitiesNames(card).join(", ") ||
                    "No facilities available"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mt-4 overflow-hidden">
              <div className="">
                <h4 className="text-[17px] font-bold mb-1">Location</h4>
                <div className="w-[800px] h-[250px]">
                  <MapComponent data={[card]} requestUserLocation={false} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 p-1">
            <div className="px-4 pt-6 pb-8 rounded-lg shadow-lg border border-tn_light_grey">
              <h3 className="text-black text-[26px] font-bold mb-3">
                For Reservation
              </h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                {availableTimes.length > 0 ? (
                  <>
                    {/* Date Dropdown */}
                    <div className="mb-6">
                      <SelectOption
                        label="Date"
                        options={[{ name: today, id: today }]} // Only show today
                        {...register("date")}
                        onChange={(e) => {
                          const date = e.target.value;
                          setValue("date", date);
                          resetField("time");
                          resetField("seats");
                        }}
                        style={{
                          border: "1px solid #DDDDDD",
                          padding: "5px",
                          fontSize: "14px",
                          borderRadius: "5px",
                        }}
                      />
                    </div>

                    {/* Time Dropdown */}
                    <div className="mb-6">
                      <SelectOption
                        label="Time"
                        options={availableTimes.map((time) => ({
                          ...time,
                          name: time.name, // Convert 24-hour format to 12-hour format for display
                        }))}
                        {...register("time")}
                        onChange={(e) => {
                          const time = e.target.value;
                          setValue("time", time); // Store 24-hour format in the form state
                          resetField("seats");
                        }}
                        style={{
                          border: "1px solid #DDDDDD",
                          padding: "5px",
                          fontSize: "14px",
                          borderRadius: "5px",
                        }}
                      />
                    </div>

                    {/* Seats Dropdown or Message */}
                    <div className="mb-6">
                      {availableSeats.length > 0 ? (
                        <SelectOption
                          label="Seats"
                          options={availableSeats}
                          {...register("seats")}
                          style={{
                            border: "1px solid #DDDDDD",
                            padding: "5px",
                            fontSize: "14px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        <p className="text-sm text-red-600">
                          No seats available for the selected time.
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className={`w-full ${
                        !selectedSeats && "opacity-75 cursor-not-allowed"
                      }`}
                      disabled={!selectedSeats || availableSeats.length === 0}
                    >
                      Make a Reservation
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-red-600">
                    No time available for the selected date.
                  </p>
                )}
              </form>

              {/* <p className="text-center text-tn_text_grey text-xs mt-2 mb-4">
                You won’t be charged yet
              </p>
              <Button
                children={"See Restaurant’s Menu"}
                className="w-full border border-black"
                bgColor="transparnet"
                textColor="text-black"
              /> */}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-tn_light_grey" />
      <div className="container mx-auto ">
        <div className="mt-14 mb-8">
          <div className="flex justify-between mb-10 sm:mb-14 flex-col sm:flex-row items-end">
            <div className="text-center sm:text-start">
              <h2 className="text-3xl w-full text-black sm:text-4xl md:text-5xl font-extrabold ">
                Related Restaurants
              </h2>
              <p className="text-lg font-normal text-black py-2 sm:py-0">
                Explore more restaurants with similar cuisine
              </p>
            </div>
            {/* <Button
              children={"View All"}
              bgColor="transparent"
              className="border border-black h-min mt-1 hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:inline-block block sm:w-auto w-[90%] m-auto sm:m-0"
              textColor="text-black"
              onClick={() => alert("test")}
            /> */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedRestaurants.length > 0 ? (
              relatedRestaurants.map((restaurant, index) => (
                <RelatedCard
                  key={index}
                  id={restaurant.id}
                  restaurant_name={restaurant.restaurant_name}
                  title={restaurant?.name}
                  location={restaurant.address}
                  images={restaurant.galleries.map((gallery) => gallery.image)}
                  // is_favorite={restaurant.is_favorite}
                  // onWishlistChange={handleWishlistChange}
                />
              ))
            ) : (
              <p>No related restaurants found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
