// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5Btzz4brqLXsZE1UkEP0g0ionizIZ_c8",
    authDomain: "study-space-edece.firebaseapp.com",
    projectId: "study-space-edece",
    storageBucket: "study-space-edece.appspot.com",
    messagingSenderId: "603102180813",
    appId: "1:603102180813:web:60fa628c98d2ec15d20084",
    measurementId: "G-Y36M837QVC"
  };
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);