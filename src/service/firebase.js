// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// //GetAuth Method is used to Configure our app to use Firebase Authentication
// import { getAuth } from "firebase/auth";
// import { getMessaging } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_APIKEY_FB,
//   authDomain: import.meta.env.VITE_AUTHDOMAIN_FB,
//   projectId: import.meta.env.VITE_PROJECTID_FB,
//   storageBucket: import.meta.env.VITE_STORAGEBUCKET_FB,
//   messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID_FB,
//   appId: import.meta.env.VITE_APPID_FB,
// };

// export const app = initializeApp(firebaseConfig);

// export const db = getFirestore(app);
// export const auth = getAuth(app);
// export const messaging = getMessaging(app);


// // if ('serviceWorker' in navigator) {
// //   navigator.serviceWorker
// //     .register('/firebase-messaging-sw.js')
// //     .then((registration) => {
// //       console.log('Service Worker registered with scope:', registration.scope);
// //     })
// //     .catch((err) => {
// //       console.error('Service Worker registration failed:', err);
// //     });
// // }

// // if ('serviceWorker' in navigator) {
// //   navigator.serviceWorker.register('../firebase-messaging-sw.js')
// //     .then(function(registration) {
// //       console.log('Registration successful, scope is:', registration.scope);
// //     }).catch(function(err) {
// //       console.log('Service worker registration failed, error:', err);
// //     });
// //   }