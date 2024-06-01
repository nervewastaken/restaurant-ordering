// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgKACQbfqlnxlZ4Aia5EdMfteIIwVUywI",
  authDomain: "foodordering-4c9f4.firebaseapp.com",
  projectId: "foodordering-4c9f4",
  storageBucket: "foodordering-4c9f4.appspot.com",
  messagingSenderId: "609091932981",
  appId: "1:609091932981:web:eb53da6376f9059e96b27c",
  measurementId: "G-0MW6XLJ6YE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);


