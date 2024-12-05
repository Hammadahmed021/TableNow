import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CardCarousel from "../component/CardCarousel";
import LoadMore from "../component/Loadmore";
import Checkbox from "../component/Checkbox";
import SelectOption from "../component/SelectOption";
import {
  dataForFilter,
  fetchFilteredData,
  fetchUserNearByRestaurants,
} from "../utils/Api";
import { transformSingleImageData, transformData } from "../utils/HelperFun";
import { Button, Loader, MapComponent } from "../component";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const Listing = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    kitchen_ids: Array.isArray(location.state?.filters?.kitchens)
      ? location.state?.filters?.kitchens
      : [location.state?.filters?.kitchens],
    facility_ids: Array.isArray(location.state?.filters?.facilities)
      ? location.state?.filters?.facilities
      : [location.state?.filters?.facilities],
    areas_ids: Array.isArray(location.state?.filters?.areas)
      ? location.state?.filters?.areas
      : [location.state?.filters?.areas],
    endTime: location.state?.filters?.endTime,
    startTime: location.state?.filters?.startTime,
    person: location.state?.filters?.person,
  });

  const [filteredData, setFilteredData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [visibleCards, setVisibleCards] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapView, setIsMapView] = useState(false);
  const param = location?.state?.heading;
  // const [nearByData, setNearByData] = useState([]);
  console.log(param, "param");

  const payload = {
    // id: user_id,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
  };

  // Function to get nearby restaurants if location is allowed
  const getNearbyRestaurant = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetchUserNearByRestaurants({ payload });
      console.log(response, "response");

      const data = await response;

      const approveNearbyData = data.filter(
        (item) => item.is_approved && item.status === "active"
      );
      setFilteredData(approveNearbyData);
      console.log(approveNearbyData, "response of nearby home");
      return response;
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(false); // end loading
    }
  };
  console.log(filteredData, "filteredData >>>>>>");

  // Trigger fetching nearby restaurants when userLocation is available and param is 'nearby'
  useEffect(() => {
    if (userLocation && param === "nearby") {
      getNearbyRestaurant();
    }
  }, [userLocation, param]);

  // Function to get user's location
 // Function to get user's location
const getLocation = async () => {
  setLoading(true); // Start loading
  let locationTimeout;

  // Define timeout to hide loader and prompt for permissions
  const handleLocationTimeout = () => {
    setLoading(false); // Hide loader
    alert("Unable to get location. Please enable location services in your app or browser settings.");
  };

  locationTimeout = setTimeout(handleLocationTimeout, 10000); // 10-second timeout

  if (
    Capacitor.getPlatform() === "android" ||
    Capacitor.getPlatform() === "ios"
  ) {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      if (permissionStatus.location === "granted") {
        const coordinates = await Geolocation.getCurrentPosition();
        clearTimeout(locationTimeout); // Clear timeout if location is retrieved
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
    } finally {
      clearTimeout(locationTimeout);
      setLoading(false); // Ensure loader is hidden
    }
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(locationTimeout); // Clear timeout if location is retrieved
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false); // Hide loader
      },
      (error) => {
        console.error("Error getting location:", error);
        clearTimeout(locationTimeout);
        setLoading(false); // Hide loader
        alert("Unable to get location. Please enable location services in your browser settings.");
      }
    );
  } else {
    clearTimeout(locationTimeout);
    console.log("Geolocation is not supported by this browser.");
    setLoading(false); // Hide loader
  }
};

// Call getLocation on component mount
useEffect(() => {
  const getLoca = async () => {
    await getLocation();
  };
  getLoca();
}, []);

  useEffect(() => {
    const showFilter = async () => {
      try {
        const response = await dataForFilter("data-for-filter");
        setFilterData(response);
      } catch (error) {
        return error;
      }
    };
    showFilter();
  }, []);

  const { data } = useFetch("hotels");

  // Fetch restaurants based on filters or handle 'featured' restaurants
  useEffect(() => {
    const fetchFilteredDataAndUpdateState = async () => {
      if (!filterData) return;

      const requestBody = {
        kitchen_ids: filters.kitchen_ids.map((res) => Number(res)) || [],
        facility_ids: filters.facility_ids.map((res) => Number(res)) || [],
        areas_ids: filters.areas_ids.map((res) => Number(res)) || [],
        startTime: filters.startTime,
        endTime: filters.endTime,
        person: filters.person,
      };

      try {
        setLoading(true);

        if (param === "featured") {
          // Fetch featured restaurants by filtering on `is_featured` flag
          const result = await data;
          const featuredData = result.filter((item) => item.is_featured);
          console.log(featuredData, "featuredData ");
          console.log(result, "featuredData result");

          setFilteredData(featuredData);
        } else if (param === "all restaurant") {
          const allData = await data;
          setFilteredData(allData);
        } else {
          const result = await fetchFilteredData(requestBody);
          setFilteredData(Array.isArray(result) ? result : [result]);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (param !== "nearby") {
      fetchFilteredDataAndUpdateState();
    }
  }, [filters, filterData, param]);

  const handleLoadMore = () => setVisibleCards((prev) => prev + 4);
  const hasMore = visibleCards < filteredData.length;

  const updateFilter = (category, id) => {
    setFilters((prev) => {
      const newCategoryIds = prev[category] || [];
      return {
        ...prev,
        [category]: newCategoryIds.includes(id)
          ? newCategoryIds.filter((item) => item !== id)
          : [...newCategoryIds, id],
      };
    });
  };

  const transformedData = transformSingleImageData(filteredData);
  console.log(transformedData, "transformedData");

  // const generateTimeOptionsWithAMPM = () => {
  //   const options = [];
  //   for (let hour = 0; hour < 24; hour++) {
  //     for (let minute = 0; minute < 60; minute += 15) {
  //       const period = hour >= 12 ? "PM" : "AM";
  //       const adjustedHours = hour % 12 || 12;
  //       const displayTime = `${adjustedHours}:${minute
  //         .toString()
  //         .padStart(2, "0")} ${period}`;
  //       const valueTime = `${hour.toString().padStart(2, "0")}:${minute
  //         .toString()
  //         .padStart(2, "0")}:00`;
  //       options.push({ id: valueTime, name: displayTime });
  //     }
  //   }
  //   return options;
  // };

  const generateTimeOptions24Hour = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const valueTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:00`;
        options.push({ id: valueTime, name: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions24Hour();

  return (
    <>
      <div className="bg-hero sm:h-[439px] h-[250px] mb-6 bg-no-repeat bg-cover">
        <div className="container h-full flex items-center sm:items-end">
          <div className="lg:w-4/5 w-full">
            <p className="text-white text-2xl hidden sm:block">
              Top-Rated Food and Restaurants Nearby
            </p>
            <h2 className="mb-0 text-3xl w-full text-white sm:text-4xl md:text-5xl font-extrabold sm:mb-14 sm:w-[70%] sm:text-start text-center">
              Filter out Our Best Restaurants & Make Reservation.
            </h2>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {!param ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 p-2">
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">Kitchens</h3>
                <Checkbox
                  options={filterData?.kitchens || []}
                  selectedOptions={filters.kitchen_ids || []}
                  onChange={(id) => updateFilter("kitchen_ids", id)}
                />
              </div>
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">Facilities</h3>
                <Checkbox
                  options={filterData?.facilities || []}
                  selectedOptions={filters.facility_ids || []}
                  onChange={(id) => updateFilter("facility_ids", id)}
                />
              </div>
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">Areas</h3>
                <Checkbox
                  options={filterData?.areas || []}
                  selectedOptions={filters.areas_ids || []}
                  onChange={(id) => updateFilter("areas_ids", id)}
                />
              </div>
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">Persons</h3>
                <SelectOption
                  options={Array.from({ length: 8 }, (_, i) => ({
                    id: i + 1,
                    name: `Any ${i + 1}`.toString(),
                  }))}
                  value={filters.person || 1}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, person: e.target.value }))
                  }
                />
              </div>
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">Start Time</h3>
                <SelectOption
                  options={timeOptions}
                  value={filters.startTime || "05:00:00"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="block mb-6">
                <h3 className="text-2xl font-bold text-tn_dark">End Time</h3>
                <SelectOption
                  options={timeOptions}
                  value={filters.endTime || "10:00:00"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-9 p-2">
              {/* Toggle Switch for Cards/Map View */}
              <div className="flex justify-start mb-4 space-x-2">
                <button
                  onClick={() => setIsMapView(false)}
                  className={`px-4 py-1 rounded-md ${
                    !isMapView
                      ? "bg-tn_pink text-white hover:opacity-80"
                      : "bg-gray-200 text-black hover:opacity-80"
                  }`}
                >
                  View List
                </button>
                <button
                  onClick={() => {
                    setIsMapView(true);
                  }}
                  className={`px-4 py-1 rounded-md ${
                    isMapView
                      ? "bg-tn_pink text-white hover:opacity-80"
                      : "bg-gray-200 text-black hover:opacity-80"
                  }`}
                >
                  View Map
                </button>
              </div>

              {loading ? (
                <Loader />
              ) : isMapView ? (
                <>
                  <MapComponent
                    data={transformedData}
                    requestUserLocation={true} // Ask for location on the listing page
                  />
                </>
              ) : (
                <>
                  {transformedData.length === 0 ? (
                    <div className="text-start text-gray-500 mt-5">
                      No restaurants available for the selected filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-0">
                      {transformedData.slice(0, visibleCards).map((data) => (
                        <CardCarousel
                          key={data.id}
                          id={data.id}
                          restaurant_name={data.restaurant_name}
                          address={data.location}
                          images={data.images}
                          rating={data.rating}
                          type={data.type}
                          timeline={data.timeline}
                        />
                      ))}
                    </div>
                  )}
                  <LoadMore
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    className={"mt-5"}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-12 p-2">
              {/* Toggle Switch for Cards/Map View */}
              <div className="flex justify-start mb-4 space-x-2">
                <button
                  onClick={() => setIsMapView(false)}
                  className={`px-4 py-1 rounded-md ${
                    !isMapView
                      ? "bg-tn_pink text-white hover:opacity-80"
                      : "bg-gray-200 text-black hover:opacity-80"
                  }`}
                >
                  View List
                </button>
                <button
                  onClick={() => {
                    setIsMapView(true);
                  }}
                  className={`px-4 py-1 rounded-md ${
                    isMapView
                      ? "bg-tn_pink text-white hover:opacity-80"
                      : "bg-gray-200 text-black hover:opacity-80"
                  }`}
                >
                  View Map
                </button>
              </div>

              {loading ? (
                <Loader />
              ) : isMapView ? (
                <>
                  <MapComponent
                    data={transformedData}
                    requestUserLocation={true} // Ask for location on the listing page
                  />
                </>
              ) : (
                <>
                  {transformedData.length === 0 ? (
                    <div className="text-start text-gray-500 mt-5">
                      No restaurants available for the selected filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                      {transformedData.slice(0, visibleCards).map((data) => (
                        <CardCarousel
                          key={data.id}
                          id={data.id}
                          restaurant_name={data.restaurant_name}
                          address={data.location}
                          images={data.images}
                          rating={data.rating}
                          type={data.type}
                          timeline={data.timeline}
                        />
                      ))}
                    </div>
                  )}
                  <LoadMore
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    className={"mt-5"}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Listing;
