import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB8chReq8-H8SyAeccDCHZFGILrT52ccGI",
  authDomain: "find-imposter-21f9d.firebaseapp.com",
  projectId: "find-imposter-21f9d",
  storageBucket: "find-imposter-21f9d.firebasestorage.app",
  messagingSenderId: "465063163983",
  appId: "1:465063163983:web:771953c79c99f826ba523a",
  databaseURL: "https://find-imposter-21f9d-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);
