// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAT9olCgtdft9LYggudnZ6vALcZfgy3WpY",
  authDomain: "ironingboy-dd5d6.firebaseapp.com",
  projectId: "ironingboy-dd5d6",
  storageBucket: "ironingboy-dd5d6.firebasestorage.app",
  messagingSenderId: "964413021829",
  appId: "1:964413021829:web:f45e903406a15cf5f993ec",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
