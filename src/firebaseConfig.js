// src/firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAT9olCgtdft9LYggudnZ6vALcZfgy3WpY",
  authDomain: "ironingboy-dd5d6.firebaseapp.com",
  projectId: "ironingboy-dd5d6",
  storageBucket: "ironingboy-dd5d6.firebasestorage.app",
  messagingSenderId: "964413021829",
  appId: "1:964413021829:web:d3eab5feab853735f993ec",
  measurementId: "G-1H46611HX7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
