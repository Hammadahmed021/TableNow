import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { clearAllBookings } from "../store/bookingSlice";
import { logout, updateUserData } from "../store/authSlice";
import { avatar, fallback, relatedFallback } from "../assets";
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

const Profile = () => {
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
  const [imagePreview, setImagePreview] = useState(avatar);
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
        // Clear localStorage
        localStorage.clear();
  
        // Dispatch logout and clear state
        dispatch(logout()); 
  
        // Show success toast
        showSuccessToast("Your account has been deleted.");
  
        // Redirect to the homepage
        navigate("/"); 
      }
    } catch (error) {
      showErrorToast(error.message || "Unable to delete account");
      throw new Error(error || "Unable to delete account");
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
      setImagePreview(data?.profile_image || avatar);
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
      const formatted = `+45 ${match[1] ? `${match[1]}` : ""}${match[2] ? ` ${match[2]}` : ""
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
        <div className="flex flex-col md:flex-row items-start justify-between mb-4">
          <div className="w-full md:w-1/2">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-tn_dark mt-4 mb-2">
                Profile picture</h2>
              <div className="flex items-center overflow-hidden mb-4">
                <img
                  src={imagePreview}
                  alt="user profile"
                  className="w-16 h-16 rounded-full border shadow-sm"
                />
                <div className="ml-4">
                  {isApp ? (
                    <button
                      onClick={handlePickImage}
                      className="bg-tn_pink p-2 rounded-md text-xs text-white"
                    >
                      Pick an Image
                    </button>
                  ) : (
                    <input
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      onChange={handleFileChange}
                    />
                  )}
                  {fileError && <p className="text-red-500">{fileError}</p>}
                </div>
              </div>

              <div className="my-6">
                <h2 className="text-3xl font-black text-tn_dark">
                  Welcome {currentUser?.name || "N/A"}
                </h2>
                <p>You can change your profile information here.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSave)} className="mt-4 w-full">
              <span className="flex-wrap flex space-x-0 sm:space-x-2 sm:flex-nowrap">
                <Input
                  label="Name"
                  onKeyPress={handleNameKeyPress} // Prevent numbers
                  {...register("name")}
                  placeholder="Enter your name"
                  className="mb-6"
                />
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
                    <p className="text-red-500 text-xs mt-1 mb-3">
                      {errors.phone.message}
                    </p>
                  )}
                </span>
              </span>

              {!isGmailUser && (
                <>
                  <span className="w-full block mb-6 mt-4">
                    <p className="text-tn_text_grey text-sm">
                      Want to change password?{" "}
                      <span className="underline cursor-pointer" onClick={toggleText}>
                        {togglePassword ? 'hide' : 'click here'}
                      </span>
                    </p>
                  </span>
                  {togglePassword && (
                    <span className="mb-6 block">
                      <span className="flex-wrap flex space-x-0 sm:space-x-2 sm:flex-nowrap">
                        <Input
                          label="New Password"
                          type="password"
                          {...register("newPassword")}
                          placeholder="Enter new password"
                          // disabled={isGmailUser}
                          className="mb-6 sm:mb-0"
                        />
                        <Input
                          label="Confirm Password"
                          type="password"
                          {...register("confirmPassword")}
                          placeholder="Confirm new password"
                        // disabled={isGmailUser}
                        />
                      </span>
                      {showError && (
                        <p className="text-red-500 text-sm">{showError}</p>
                      )}
                    </span>
                  )}
                </>
              )}

              <Button
                type="submit"
                className={`w-full  ${isSigning ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                disabled={isSigning}
              >
                {isSigning ? "Saving..." : "Save changes"}
              </Button>
              {successMessage && (
                <p className="text-green-500 mt-3">{successMessage}</p>
              )}
            </form>
          </div>
          <div className="w-full md:w-1/2 hidden md:flex md:ml-8  justify-end">
            <img src={relatedFallback} alt="" className="w-full md:w-[400px]" />
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <div className="flex items-start justify-between mb-4 flex-wrap sm:flex-nowrap">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">Delete Account</h2>
            <p>All your data will be deleted.</p>
            <button
              className={"bg-red-600 px-6 py-2 text-white rounded-lg mt-4"}
              onClick={() => setIsModalOpen(true)}
            >
              Delete Account
            </button>

            {isModalOpen && (
              <Modal
                title="Are you sure you want to delete account?"
                onYes={handleYes}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default Profile;
