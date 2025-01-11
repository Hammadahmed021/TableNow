import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { clearAllBookings } from "../store/bookingSlice";
import { logout, updateUserData } from "../store/authSlice";
import { fallback, relatedFallback } from "../assets";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Loader,
  LoadMore,
  Input,
  RatingModal,
  Modal,
} from "../component";
import {
  deleteAccount,
  deleteAllUserBookings,
  deleteUserBooking,
  getUserBookings,
  giveRateToHotel,
  showFavorite,
  updateUserProfile,
  verifyUser,
} from "../utils/Api";
import { updateFirebasePassword } from "../service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { showSuccessToast } from "../utils/Toast";

const MAX_FILE_SIZE_MB = 10; // Maximum file size in MB
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const Bookings = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const bookings = useSelector((state) => state.bookings);
  const [userBooking, setUserBooking] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [displayedBookings, setDisplayedBookings] = useState(4);
  const [displayedFavorites, setDisplayedFavorites] = useState(4);
  const [imagePreview, setImagePreview] = useState(fallback);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showError, setShowError] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isClearBooking, setIsClearBooking] = useState({});
  const [isClearingAllBookings, setIsClearingAllBookings] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  console.log(currentUser, "currentUser");
  console.log(userData, "userData");

  // Check if the user logged in via Gmail
  const isGmailUser = userData?.loginType && currentUser.id;

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const userBookings = bookings.filter(
    (booking) => booking.user === userData?.uid
  );
  const isApp = Capacitor.isNativePlatform();

  const handleClearBooking = async (bookingId) => {
    setIsClearBooking((prev) => ({ ...prev, [bookingId]: true }));

    try {
      const response = await deleteUserBooking(bookingId);
      if (response.message === "Booking Status Changed Successfully") {
        showBookings(); // Refresh or update the bookings list
      }
    } catch (error) {
      console.error("Error clearing booking:", error);
    } finally {
      setIsClearBooking((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleClearAllBookings = async () => {
    setIsClearingAllBookings(true); // Set loading state to true
    try {
      const response = await deleteAllUserBookings();
      console.log(response, "response success");

      dispatch(clearAllBookings()); // Update Redux state
      setUserBooking([]); // Clear local state
    } catch (error) {
      console.error("Unable to delete all bookings:", error);
    } finally {
      setIsClearingAllBookings(false); // Reset loading state
    }
  };

  const deleteUserAccount = async () => {
    try {
      const response = await deleteAccount();
      console.log(response, "account deletion response");

      if (response) {
        dispatch(logout()); // Dispatch your logout action
        showSuccessToast("Your account is deleted.");
      }
    } catch (error) {
      showErrorToast(error.message);
      throw new Error(error || "unable to delete account");
    }
  };

  const handleLoadMore = () => {
    setDisplayedBookings(displayedBookings + 4);
  };
  const hasMore = displayedBookings < userBooking.length;

  const handleLoadMoreFav = () => {
    setDisplayedFavorites(displayedFavorites + 4);
  };
  const hasMoreFav = displayedFavorites < favorites.length;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setFileError(
          "Invalid file type. Only JPEG, PNG, and JPG files are allowed."
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setFileError("");
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePickImage = async () => {
    if (isApp) {
      try {
        // Request permissions for camera and photos
        const permissions = await Camera.requestPermissions({
          permissions: ["camera", "photos"],
        });

        // Check if camera or gallery access is granted
        if (
          permissions.camera !== "granted" ||
          permissions.photos !== "granted"
        ) {
          alert("Please grant camera and photo library permissions.");
          return;
        }

        // Pick an image from the gallery
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
        });

        if (image && image.webPath) {
          // Convert the image URI to Blob
          const response = await fetch(image.webPath);
          if (!response.ok) {
            throw new Error("Failed to fetch image");
          }
          const blob = await response.blob();

          // Validate image type and size
          if (!VALID_IMAGE_TYPES.includes(blob.type)) {
            setFileError(
              "Invalid file type. Only JPEG, PNG, and JPG files are allowed."
            );
            return;
          }
          if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
            return;
          }

          // Convert Blob to File, which is compatible with your API
          const file = new File([blob], `profile.${blob.type.split("/")[1]}`, {
            type: blob.type,
          });

          // Set the file for upload
          setSelectedFile(file);
          setFileError("");
          setImagePreview(URL.createObjectURL(file)); // Show image preview
        }
      } catch (error) {
        console.error("Error picking image:", error);
      }
    } else {
      // Fallback to traditional file input if running in the browser
      document.querySelector('input[type="file"]').click();
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      // Implement your image upload logic here
      // For demonstration, returning a placeholder URL
      return new Promise((resolve) => {
        setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onSave = async (data) => {
    setIsSigning(true);
    setSuccessMessage(""); // Clear previous success message
    try {
      const { newPassword, confirmPassword } = data;
      let profileImageFile = selectedFile;

      // Ensure newPassword and confirmPassword match
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          setShowError("Passwords do not match.");
          return;
        }

        if (!newPassword) {
          setShowError("New password is required.");
          return;
        }

        // Update Firebase password
        const passwordUpdated = await updateFirebasePassword(newPassword);
        if (!passwordUpdated) {
          setShowError("Failed to update password. Please try again.");
          return;
        }
      }

      // Construct the updated user data object
      const updatedUserData = {
        user_id: currentUser?.id || userData?.user?.id,
        name: data?.name,
        phone: data?.phone,
        ...(profileImageFile &&
          profileImageFile !== currentUser?.profile_image && {
            profile_image: profileImageFile,
          }),
      };
      // if (profileImageFile != "") {
      //   alert("profileImageFile========>", JSON.stringify(profileImageFile));
      // } else {
      //   alert("its empty");
      // }
      console.log(updatedUserData, "updatedUserData");

      // Update user profile on the server
      const response = await updateUserProfile(updatedUserData);
      if (response.status == 200 || response.status == 201) {
        // Update Redux state with the new user data
        dispatch(updateUserData(updatedUserData));

        // Optionally, refetch the user data after a successful update
        fetchUserData();
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setSuccessMessage(""); // Clear the success message after 5 seconds
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSigning(false);
    }
  };

  // const showBookings = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getUserBookings();
  //     console.log(response, "user bookings");

  //     setUserBooking(response);
  //   } catch (error) {
  //     console.error("Error fetching bookings:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const showBookings = async () => {
    try {
      setLoading(true);
      const response = await getUserBookings();
      console.log(response, "user bookings");

      // Check if response is an array
      if (Array.isArray(response)) {
        setUserBooking(response);
      } else {
        console.error("Expected an array, but got:", response);
        setUserBooking([]); // Set as empty array if response is not an array
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setUserBooking([]); // Set as empty array in case of an error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await verifyUser();
      const data = await response.data;
      setCurrentUser(data);
      // dispatch(updateUserData(data));
      setValue("name", data?.name || "");
      setValue("phone", data?.phone || "");
      setImagePreview(data?.profile_image || fallback);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [setValue]);

  useEffect(() => {
    // Fetch favorites when component mounts
    const fetchFavorites = async () => {
      try {
        const data = await showFavorite();
        setFavorites(data);
        setLoadingFavorites(false);
      } catch (error) {
        setError(error.message);
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    showBookings();
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Prevent numbers in text fields
  const handleNameKeyPress = (e) => {
    const charCode = e.keyCode || e.which;
    const charStr = String.fromCharCode(charCode);

    // Allow alphabets and spaces only
    if (!/^[a-zA-Z ]+$/.test(charStr)) {
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

  const handleRatingSubmit = async ({ rating, feedback }) => {
    if (!selectedBooking) return;

    const rateData = {
      table_booking_id: selectedBooking.id,
      hotel_id: selectedBooking.hotel?.id,
      user_id: currentUser?.id,
      rating,
      review: feedback,
    };

    try {
      const response = await giveRateToHotel(rateData);
      console.log("Rating submitted successfully:", response);
      // Refresh or update the bookings to show the rated state
      showBookings();
    } catch (error) {
      console.error("Error submitting rating:", error.message);
    } finally {
      setIsRatingModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const convertTo12HourFormat = (time24) => {
    const [hours, minutes, seconds] = time24.split(":"); // Split the time string into hours, minutes, and seconds
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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

  const handleYes = () => {
    console.log("Yes clicked");
    deleteUserAccount();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const toggleText = () => {
    setTogglePassword((prev) => !prev);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex items-start justify-between mb-4 flex-wrap sm:flex-nowrap mt-4">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">
              Your Booking History
            </h2>
            <p>
              Check your past and upcoming reservations easily by viewing your
              reservation history here.
            </p>
          </div>
          {userBooking?.length !== 0 && (
            <Button
              bgColor="transparent"
              className={`border border-black h-min mt-3 sm:mt-1 hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:inline-block hidden sm:w-auto w-[90%] m-auto sm:m-0 ${
                isClearingAllBookings ? "opacity-80 cursor-not-allowed" : ""
              }`}
              textColor="text-black"
              onClick={handleClearAllBookings}
              disabled={isClearingAllBookings} // Disable the button when clearing
            >
              {isClearingAllBookings ? "Clearing..." : "Clear All Bookings"}
            </Button>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : userBooking?.length === 0 ? (
          <p className="text-lg text-tn_dark">No bookings to display.</p>
        ) : (
          userBooking?.slice(0, displayedBookings).map((booking, index) => (
            <div
              key={`${booking?.id}-${index}`}
              className="border rounded-lg p-4 mb-4 shadow-lg flex items-start justify-between flex-wrap relative"
            >
              <div className="flex items-start justify-start w-full sm:w-auto mb-2 sm:mb-0">
                <img
                  src={
                    booking.hotel?.profile_image ||
                    booking.hotel?.galleries[0]?.image ||
                    fallback
                  }
                  className="w-20 h-16 rounded-md"
                  alt="hotel"
                />
                <div className="ml-2">
                  <p>{booking?.hotel?.type}</p>
                  <p className="font-bold text-xl capitalize">
                    {booking?.hotel?.restaurant_name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline mr-2">Date </span> {booking?.date}
                </p>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline mr-2">Time</span> {booking?.time}
                </p>
              </div>
              <div>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline mr-2">Number of Persons</span>
                  {booking?.seats}
                </p>
                <p className="text-sm mb-2 flex justify-between items-center text-tn_dark_field">
                  <span className="underline mr-2">Total Price</span> Dkk{" "}
                  {booking?.total_amount}
                </p>
              </div>

              <div className="flex space-x-2 w-full sm:w-auto sm:mt-0 mt-4 items-center">
                {booking.is_eligible_to_rate ? (
                  booking.ratings && booking.ratings.length > 0 ? (
                    <span className="text-green-500 text-sm sm:text-base">
                      Rated
                    </span>
                  ) : (
                    <span
                      className="text-sm sm:text-base hover:opacity-80 text-tn_pink cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsRatingModalOpen(true);
                      }}
                    >
                      Leave a review
                    </span>
                  )
                ) : (
                  <span className="text-gray-500 text-sm sm:text-base">
                    Unable to rate
                  </span>
                )}

                <Link
                  to={`/restaurant/${booking?.hotel?.id}`}
                  className="hover:bg-tn_dark_field bg-tn_pink text-white text-lg sm:text-base px-2 py-1 rounded-lg inline-block duration-200 transition-all w-full sm:w-auto text-center"
                >
                  Rebook
                </Link>

                <Button
                  onClick={() => handleClearBooking(booking?.id)}
                  padX={"px-2"}
                  padY={"py-1"}
                  className={`rounded-lg bg-tn_dark_field text-white hover:bg-tn_pink hover:opacity-80 text-xs sm:text-sm absolute sm:relative top-2 right-2 sm:top-0 sm:right-0 ${
                    isClearBooking[booking?.id]
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isClearBooking[booking?.id]}
                >
                  {isClearBooking[booking?.id] ? "..." : "X"}
                </Button>
              </div>
            </div>
          ))
        )}
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleRatingSubmit}
          booking={selectedBooking} // Pass the selected booking object
        />

        {userBooking.length >= displayedBookings && (
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} />
        )}
      </div>
        <div>
      {userBooking?.length !== 0 && (
        <Button
          bgColor="transparent"
          className={`border border-black h-min mt-0 mb-6 sm:mt-1 hover:bg-tn_pink hover:text-white hover:border-tn_pink duration-200 sm:hidden block sm:w-auto w-[90%] m-auto sm:m-0 ${
            isClearingAllBookings ? "opacity-80 cursor-not-allowed" : ""
          }`}
          textColor="text-black"
          onClick={handleClearAllBookings}
          disabled={isClearingAllBookings} // Disable the button when clearing
        >
          {isClearingAllBookings ? "Clearing..." : "Clear All Bookings"}
        </Button>
      )}
      </div>

      <div className="container mx-auto p-4">
        <div className="flex items-start justify-between mb-4 flex-wrap sm:flex-nowrap">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">Your Favorites</h2>
            <p>
              Check your past and upcoming restaurant easily by viewing them
              here.
            </p>
          </div>
        </div>

        {loadingFavorites ? (
          <Loader />
        ) : favorites?.length === 0 ? (
          <p className="text-lg text-tn_dark mb-4">No favorites to display.</p>
        ) : (
          favorites?.slice(0, displayedFavorites).map((favorite, index) => (
            <div
              key={`${favorite?.id}-${index}`}
              className="border rounded-lg p-4 mb-4 shadow-lg flex items-start justify-between flex-wrap relative"
            >
              <div className="flex items-start justify-start w-full sm:w-auto mb-2 sm:mb-0">
                <img
                  src={
                    favorite?.profile_image ||
                    favorite?.galleries[0]?.image ||
                    fallback
                  }
                  className="w-20 h-16 rounded-md"
                  alt="hotel"
                />
                <div className="ml-2">
                  <p>{favorite?.type}</p>
                  <Link
                    to={`/restaurant/${favorite?.id}`}
                    className="font-bold text-xl capitalize"
                  >
                    {favorite?.name}
                  </Link>
                </div>
              </div>

              {/* <div className="flex space-x-2 w-full sm:w-auto sm:mt-0 mt-4">
                <Link
                  to={`/restaurant/${booking?.hotel?.id}`}
                  className="hover:bg-tn_dark_field bg-tn_pink text-white text-lg sm:text-base px-4 py-2 rounded-lg inline-block duration-200 transition-all w-full sm:w-auto text-center"
                >
                  Rebook
                </Link>

                <Button
                  onClick={() => handleClearBooking(booking?.id)}
                  padX={"px-2"}
                  padY={"py-2"}
                  className={`rounded-lg bg-tn_dark_field text-white hover:bg-tn_pink text-xs sm:text-sm absolute sm:relative top-2 right-2 sm:top-0 sm:right-0 ${
                    isClearBooking[booking?.id]
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isClearBooking[booking?.id]}
                >
                  {isClearBooking[booking?.id] ? "..." : "X"}
                </Button>
              </div> */}
            </div>
          ))
        )}

        {favorites.length >= displayedFavorites && (
          <LoadMore onLoadMore={handleLoadMoreFav} hasMore={hasMoreFav} />
        )}
      </div>
    </>
  );
};

export default Bookings;
