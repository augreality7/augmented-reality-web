// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZJXKBS4XS4JFXAN5tf4W7NC3bFXnegAw",
  authDomain: "augmentedreality-20623.firebaseapp.com",
  databaseURL: "https://augmentedreality-20623-default-rtdb.firebaseio.com",
  projectId: "augmentedreality-20623",
  storageBucket: "augmentedreality-20623.appspot.com",
  messagingSenderId: "830364342866",
  appId: "1:830364342866:web:c4dd8dbf4d35df6ff65d8b",
  measurementId: "G-EREVG0VSCL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
