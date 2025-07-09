// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoOd7E5DebBkQuzP9Ia5SeuMYTrTK2peQ",
  authDomain: "algocraft-8feca.firebaseapp.com",
  projectId: "algocraft-8feca",
  storageBucket: "algocraft-8feca.firebasestorage.app",
  messagingSenderId: "113574473502",
  appId: "1:113574473502:web:63baaf85424b75bf31230f",
  measurementId: "G-D1BJZRXRPC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
