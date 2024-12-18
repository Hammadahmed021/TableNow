import React, { useState, useEffect } from "react";
import useMediaQuery from "../hooks/useQuery";
import {
  Button,
  CardCarousel,
  LoadMore,
  Carousel,
  Search,
  Filter,
  Loader,
} from "../component";
import { Fav, App, storeBtn } from "../assets";
import { localDB } from "../utils/localDB";
import useFetch from "../hooks/useFetch";
import { transformData, getDistance } from "../utils/HelperFun";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchUserNearByRestaurants, verifyUser } from "../utils/Api";
import { app } from "../service/firebase";
import { Capacitor } from "@capacitor/core";

export default function Home() {
  const isDesktop = useMediaQuery("(max-width: 991px)");
  const userData = useSelector((state) => state.auth.userData);

  const [visibleCards, setVisibleCards] = useState(4);
  const [visibleAllCards, setVisibleAllCards] = useState(4);
  const [visibleFeatureCards, setVisibleFeatureCards] = useState(4);
  const [currentUser, setCurrentUser] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [nearByData, setNearByData] = useState([]);
  const token = localStorage.getItem("signToken");  // Get token from localStorage
  console.log(token, 'home tok');
  

  const [filterValues, setFilterValues] = useState({
    kitchens: "",
    atmospheres: "",
    facilities: "",
    areas: "",
    menuTypes: "",
  });

  const handleFilterChange = (selectedOptions) => {
    setFilterValues(selectedOptions);
  };
  const user_id = currentUser?.id || userData?.user?.id;
  console.log(currentUser, 'currentUser');
  

  const { data, loading, error, refetch } = useFetch("hotels", user_id);
  console.log(user_id, "data");

  useEffect(() => {
    // Refetch data when the user logs out (user_id changes) or when the location changes to "/"
    if (location.pathname === "/" || !user_id) {
      refetch();
    }
    const fetchUserData = async () => {
      const token = localStorage.getItem("signToken")
      try {
        const response = await verifyUser(token);
        const data = await response.data;

        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
    // Get user location
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     setUserLocation({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //     });
    //   },
    //   (error) => {
    //     console.error("Error fetching location:", error);
    //     // Handle location error (optional)
    //   }
    // );
  }, [location.pathname, user_id, refetch]);

  const getLocation = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location === "granted") {
          const coordinates = await Geolocation.getCurrentPosition();
          console.log("User location:", coordinates);
          setUserLocation({
            latitude: coordinates.coords.latitude,
            longitude: coordinates.coords.longitude,
          });
        } else {
          alert("Please enable location services in your app settings.");
        }
      } catch (error) {
        console.error(
          "Error requesting geolocation permissions or getting position:",
          error
        );
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      getLocation();
    };
    fetchLocation();
  }, []);

  const pathname = location.pathname;
  let page = ''; // Default page value
  
  if (pathname === '/') {
    page = 'home'; // Set 'home' when the path is '/'
  } else {
    console.log(pathname, 'name path'); // Log for other paths
  }
  
  const payload = {
    id: user_id,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    page, // Add 'home' or the page name in the payload
  };
  
  console.log(userLocation, "userLocation");

  const getNearbyRestaurant = async () => {
    try {
      const response = await fetchUserNearByRestaurants({ payload });
      const data = await response;
      console.log(data, 'data nearby');
      
      const nearbyData = data ? transformData(data) : [];
      const approveNearbyData = nearbyData.filter(
        (item) => item.is_approved && item.status === "active"
      );
      setNearByData(approveNearbyData);
      console.log(approveNearbyData, "response of nearby home");
      return response;
    } catch (error) {
      console.log(error, "error");
    }
  };

  // Trigger fetching nearby restaurants when userLocation is available
  useEffect(() => {
    if (userLocation) {
      getNearbyRestaurant();
    }
  }, [userLocation]);

  // const transformedData = data ? transformData(data) : [];
  // Transform and filter the data
  const transformedData = data ? transformData(data) : [];
  console.log(transformedData, "transformedData");

  const approvedData = transformedData.filter(
    (item) => item.is_approved && item.status === "active"
  );

  const hasMore = visibleCards < approvedData.length;
  const hasAllMore = visibleAllCards < approvedData.length;
  const hasFeatureMore =
    visibleFeatureCards <
    approvedData.filter((item) => item.is_featured).length;

  const handleAllLoadMore = () => {
    setVisibleAllCards((prevVisibleCards) => prevVisibleCards + 4);
  };
  const handleFeatureLoadMore = () => {
    setVisibleFeatureCards((prevVisibleCards) => prevVisibleCards + 4);
  };

  const handleLoadMore = () => {
    setVisibleCards((prevVisibleCards) => prevVisibleCards + 4);
  };

  // Callback function to trigger refetch
  const handleWishlistChange = () => {
    refetch();
  };

  // Choose data to display based on location permission
  const dataToDisplay = nearByData.length > 0 ? nearByData : approvedData;

  // const nearBy = transformedData
  // .filter((item) => item.is_approved && item.status === "active")
  // .filter((item) => {
  //   if (!userLocation) return true; // If location is not available, show all
  //   const { latitude: itemLat, longitude: itemLon } = item;

  //   // Validate coordinates
  //   if (isNaN(itemLat) || isNaN(itemLon)) {
  //     console.error('Invalid restaurant coordinates:', { itemLat, itemLon });
  //     return false; // Skip items with invalid coordinates
  //   }

  //   const distance = getDistance(
  //     userLocation.latitude,
  //     userLocation.longitude,
  //     itemLat,
  //     itemLon
  //   );
  //   return distance <= 10000; // Filter restaurants within 10 km radius
  // });

  return (
    <>
      <h1 className="vxs:w-[65%] sm:w-[70%] md:w-[75%] lg:w-[50%] xl:w-[40%] 2xl:w-[35%] my-8 text-3xl sc-1920:w-[40%] mx-auto sm:text-5xl font-extrabold text-center sm:my-14">
        Discover and Book the Best
        <span className="text-tn_pink"> Restaurant</span>
      </h1>

      {isDesktop ? (
        <div className="container w-[95%] mx-auto relative">
          <Search data={data} className={"ml-0"} />
        </div>
      ) : (
        <div className="container mx-auto">
          <div className="w-full inline-flex justify-center">
            <Filter onFilterChange={handleFilterChange} />
          </div>
        </div>
      )}

      <div className="bg-hero sm:h-[439px] h-[250px] sm:my-16 my-12 bg-no-repeat bg-cover">
        <div className="container h-full flex items-center sm:items-end">
          <div className="lg:w-4/5 w-full">
            <img src={Fav} alt="" className="hidden sm:block" />
            <p className="text-white text-2xl hidden sm:block">
              Popular food & restaurants near you
            </p>
            <h2 className=" mb-0   text-3xl w-full text-white sm:text-4xl md:text-5xl font-extrabold sm:mb-14 sm:w-[70%]  sm:text-start text-center">
              Your next favorite restaurant is a few taps away.
            </h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="flex justify-between mb-10 sm:mb-14 flex-col sm:flex-row items-center">
          <div className="text-center sm:text-start">
            <h2 className="text-3xl w-full text-black sm:text-4xl md:text-5xl font-extrabold ">
              Restaurants Near You
            </h2>
            <p className="text-lg font-normal text-black py-2 sm:py-0">
              Popular types of food & restaurants near you
            </p>
          </div>
          <Link
            state={{ heading: "nearby" }}
            to={{
              pathname: "/listing",
            }}
            className="border text-center p-3 rounded-lg border-black h-min mt-1 bg-transparent hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:inline-block block sm:w-auto w-[90%] m-auto sm:m-0"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="p-4 text-center container mx-auto">
            <Loader />
          </p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
              {dataToDisplay.slice(0, visibleCards).map((data) => (
                <CardCarousel
                  key={data.id}
                  id={data.id}
                  restaurant_name={data.restaurant_name}
                  address={data.location}
                  images={data.images}
                  rating={data.rating}
                  type={data.type}
                  timeline={data.timeline}
                  is_favorite={data.is_favorite}
                  // latitude={data.latitude}
                  // longitude={data.longitude}
                  onWishlistChange={handleWishlistChange} // Pass the refetch trigger
                />
              ))}
            </div>
            <LoadMore
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              className={"mt-5"}
            />
          </>
        )}

        {/* Featured Carousel */}
        <div className="mt-20">
          <div className="flex justify-between mb-10 sm:mb-14 flex-col sm:flex-row items-end">
            <div className="text-center sm:text-start">
              <h2 className="text-3xl w-full text-black sm:text-4xl md:text-5xl font-extrabold ">
                Featured Restaurants
              </h2>
              <p className="text-lg font-normal text-black py-2 sm:py-0">
                Checkout some of our Best Featured Restaurants of all the time
              </p>
            </div>
            <Link
              state={{ heading: "featured" }}
              to={{
                pathname: "/listing",
              }}
              className="border text-center p-3 rounded-lg border-black h-min mt-1 bg-transparent hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:inline-block block sm:w-auto w-[90%] m-auto sm:m-0"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="p-4 text-center container mx-auto">
              <Loader />
            </p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                {approvedData
                  ?.filter((data) => data.is_featured == true)
                  ?.slice(0, visibleFeatureCards)
                  ?.map((data, index) => (
                    <CardCarousel
                      key={index}
                      id={data.id}
                      restaurant_name={data.restaurant_name}
                      address={data.location}
                      images={data.images}
                      type={data.type}
                      is_featured={data.is_featured}
                      is_favorite={data.is_favorite}
                      onWishlistChange={handleWishlistChange} // Pass the refetch triggers
                    />
                  ))}
              </div>
              {hasFeatureMore && (
                <LoadMore
                  onLoadMore={handleFeatureLoadMore}
                  hasMore={hasFeatureMore}
                  className={"mt-5"}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-appbanner sm:h-[439px] h-[220px] my-16 bg-no-repeat bg-cover px-2 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between bg-right">
          <div className="w-2/5 h-full pt-4 hidden lg:block">
            <img
              src={App}
              alt=""
              className="h-full object-cover w-[90%] lg:w-full"
            />
          </div>
          <div className="lg:w-3/5 w-4/5">
            <p className="text-white text-2xl hidden sm:block">
              Popular food & restaurants near you
            </p>
            <h2 className=" mb-2 text-3xl w-full text-white sm:text-4xl md:text-5xl font-extrabold sm:mb-4 lg:w-[80%]  sm:text-start text-center">
              Download our all new Mobile App
            </h2>
            <img src={storeBtn} alt="" className="mx-auto sm:mx-0" />
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-10">
        <div className="flex justify-between mb-10 sm:mb-14 flex-col sm:flex-row items-end">
          <div className="text-center sm:text-start ">
            <h2 className="text-3xl w-full text-black sm:text-4xl md:text-5xl font-extrabold ">
              Browse all our Best Restaurants
            </h2>
            <p className="text-lg font-normal text-black py-2 sm:py-0">
              Explore all listed Restaurants we have | Popular types of food &
              restaurants near you
            </p>
          </div>
          <Link
            state={{ heading: "all restaurant" }}
            to={{
              pathname: "/listing",
            }}
            className="border text-center p-3 rounded-lg border-black h-min mt-1 bg-transparent hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:inline-block block sm:w-auto w-[90%] m-auto sm:m-0"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="p-4 text-center container mx-auto">
            <Loader />
          </p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
              {approvedData.slice(0, visibleAllCards).map((data) => (
                <CardCarousel
                  key={data.id}
                  id={data.id}
                  restaurant_name={data.restaurant_name}
                  address={data.location}
                  images={data.images}
                  rating={data.rating}
                  type={data.type}
                  timeline={data.timeline}
                  is_favorite={data.is_favorite}
                  onWishlistChange={handleWishlistChange} // Pass the refetch trigger
                />
              ))}
            </div>
            <LoadMore
              onLoadMore={handleAllLoadMore}
              hasMore={hasAllMore}
              className={"mt-5"}
            />
          </>
        )}
      </div>
    </>
  );
}
