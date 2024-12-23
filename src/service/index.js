// import {
//   signInWithPopup,
//   GoogleAuthProvider,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   updatePassword,
//   reauthenticateWithCredential,
//   EmailAuthProvider,
//   signOut as firebaseSignOut,
// } from "firebase/auth";
// import { auth, messaging } from "./firebase";
// import { getToken } from "firebase/messaging";


// Function to sign in with Google
export const SignUpWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential) {
      console.error("Error in user Credential");
      return;
    }

    const user = result.user;
    // Get the ID token
    const token = await user.getIdToken();
    console.log("user token", token);
    return { user, token };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error; // Propagate the error to be handled by the calling function
  }
};

// Function to sign up with email and password
export const SignupWithEmail = async (email, password) => {
  if (!email || !password) {
    console.error("Provide Email and Password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Get the ID token
    const token = await user.getIdToken();
    console.log(user, token);
    return { user, token };
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error; // Propagate the error to be handled by the calling function
  }
};

// Function to sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error; // Propagate the error to be handled by the calling function
  }
};


// Replace with your test email and password

export const resetPassword = async (email) => {
  console.log(email, "before email");
  const actionCodeSettings = {
    url: 'https://tablenow.dk/login',  // Your login page URL
    handleCodeInApp: false // Set to true if handling reset in the app
};

  if (email) {
    console.log(email, "after email");
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log(
        "Password reset email sent to the given email address successfully"
      );
      return {
        success: true,
        message: "Password reset email sent successfully.",
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        message: "Failed to send password reset email.",
      };
    }
  } else {
    return {
      success: false,
      message: "Please type your email address in the email field.",
    };
  }
};

// Function to update password firebse
export const updateFirebasePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently logged in.");
    }

    // Check if newPassword is provided
    if (!newPassword) {
      throw new Error("New password is required.");
    }

    // Update the password
    await updatePassword(user, newPassword);
    
    console.log("Password updated successfully");
    return true;
  } catch (error) {
    // Handle errors
    console.error("Error updating password:", error);
    return false;
  }
};

// Function to retrieve FCM token
export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_APIKEY_FB });
    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.error("No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving FCM token.", error);
    return null;
  }
};



export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      return true;
    } else {
      console.log("Notification permission denied.");
      return false;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};
