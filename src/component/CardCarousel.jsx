import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { Link, useLocation } from "react-router-dom";
import { Ratings, WishlistButton } from "../component";
import { fallback } from "../assets";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../store/favoriteSlice";
import { addFavorite } from "../utils/Api";
import { showSuccessToast } from "../utils/Toast";

const SkeletonLoader = () => {
  return (
    <div className="max-w-sm rounded overflow-hidden relative mx-2 mb-6 sm:mb-8 animate-pulse">
      <div className="w-full h-[329px] bg-gray-300 rounded-2xl"></div>
      <div className="px-2 py-2">
        <div className="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
        <div className="bg-gray-300 h-6 w-1/2 mb-2 rounded"></div>
        <div className="bg-gray-300 h-4 w-1/3 rounded"></div>
      </div>
    </div>
  );
};

const CardCarousel = ({
  id,
  title,
  restaurant_name,
  address,
  images,
  rating,
  type,
  cuisine,
  timeline,
  is_favorite, // Key passed to control heart icon
  is_featured,
  longitude,
  latitude,
  onWishlistChange, // Callback prop for parent to handle refetch
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [inWishlist, setInWishlist] = useState(is_favorite); // Initial value comes from is_favorite

  const dispatch = useDispatch();
  const location = useLocation();
  const favorites = useSelector((state) => state.favorites.items);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        setData({
          id,
          title,
          restaurant_name,
          address,
          images,
          rating,
          type,
          cuisine,
          timeline,
          is_favorite,
          is_featured,
          longitude,
          latitude
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [
    id,
    title,
    restaurant_name,
    address,
    images,
    rating,
    type,
    cuisine,
    timeline,
    is_favorite,
    is_featured,
    longitude,
    latitude
  ]);
  
  const isLogIn = useSelector((state) => state.auth.userData); 
  const token = localStorage.getItem("signToken")
  const isLoggedIn = token || isLogIn
  

  useEffect(() => {
    setInWishlist(is_favorite);
  }, [is_favorite]); // Re-run whenever is_favorite changes

  const handleWishlistClick = async () => {
    if (data) {
      try {
        await addFavorite(data.id); // Toggle favorite status in the backend
        dispatch(toggleFavorite(data.id)); // Update the Redux state
        setInWishlist((prev) => !prev); // Toggle the local state
        onWishlistChange(); // Notify parent to trigger refetch
        // Use toast instead of alert
        showSuccessToast(
          inWishlist ? "Removed from favorites!" : "Added to favorites!"
        );
      } catch (error) {
        console.error("Error toggling favorites:", error.message);
      }
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ul> {dots.slice(0, 5)} </ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#fff",
        }}
      ></div>
    ),
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  const isSingleImage = Array.isArray(data?.images) && data.images.length === 1;

  const isListingPage = location.pathname === "/listing";
  
  return (
    <div className="max-w-sm rounded overflow-hidden relative mx-2 mb-6 sm:mb-8">
      {isSingleImage ? (
        <>
          <Link to={`/restaurant/${data.id}`} className="hover:opacity-80">
            <img
              className="w-full h-[329px] object-cover focus-visible:outline-none focus:outline-none rounded-2xl"
              src={data.images[0] || fallback}
              alt={`Slide 1`}
            />
          </Link>
        </>
      ) : (
        <>
          <Link to={`/restaurant/${data.id}`} className="hover:opacity-80">
            <Slider {...settings}>
              {data?.images?.map((image, index) => (
                <div key={index}>
                  <img
                    className="w-full h-[329px] object-cover focus-visible:outline-none focus:outline-none rounded-2xl"
                    src={image || fallback}
                    alt={`Slide ${index + 1}`}
                  />
                </div>
              ))}
            </Slider>
          </Link>
        </>
      )}
      {((isLoggedIn && !isListingPage) || (isLoggedIn && data.is_featured)) && (
        <div
          className={`absolute top-2 ${
            data.type === "featured" ? "right-5" : "right-2"
          } bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm`}
        >
          <WishlistButton
            defaultInWishlist={inWishlist}
            onToggleWishlist={handleWishlistClick}
          />
        </div>
      )}
      {data.is_featured === true ? (
        <div className="px-2 py-2 absolute bottom-0 left-0 w-full z-10">
          <p className="text-white text-base">{data.address}</p>
          <div className="font-bold text-2xl mb-2 text-white ellipsis-2-lines">
            <Link to={`/restaurant/${data.id}`} className="hover:opacity-80">
              {data.title}
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-2 py-2">
          <div className="flex justify-between items-center">
            <p className="text-black text-sm font-medium ellipsis mr-1">
              {data.address}
            </p>
            <Ratings rating={data.rating} />
          </div>
          <div
            className="font-bold text-md text-tn_dark ellipsis"
            style={{ maxWidth: "100%" }}
          >
            <Link to={`/restaurant/${data.id}`} className="hover:opacity-80">
              {data.restaurant_name}
            </Link>
          </div>
          {/* <p className="text-black text-sm font-light">{data.type} </p> */}
        </div>
      )}
    </div>
  );
};

export default CardCarousel;
