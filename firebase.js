// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWpqFsGN5f1IpTBxm5e27BhxBqoWWyHMw",
  authDomain: "droneageddon-381bc.firebaseapp.com",
  projectId: "droneageddon-381bc",
  storageBucket: "droneageddon-381bc.appspot.com",
  messagingSenderId: "461362146067",
  appId: "1:461362146067:web:96886f2111fb0619e3c8e6",
  measurementId: "G-GMQWZL9HKL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
