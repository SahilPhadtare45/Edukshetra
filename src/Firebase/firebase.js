// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNDlLP3sU5c8AlFwIP7u_gLfoEDfDB1FU",
  authDomain: "edukshetra-4c5bf.firebaseapp.com",
  databaseURL: "https://edukshetra-4c5bf-default-rtdb.firebaseio.com",
  projectId: "edukshetra-4c5bf",
  storageBucket: "edukshetra-4c5bf.firebasestorage.app",
  messagingSenderId: "105997735273",
  appId: "1:105997735273:web:cdd61d24148ec12eb019f8",
  measurementId: "G-ZF5N2EP8Q9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);