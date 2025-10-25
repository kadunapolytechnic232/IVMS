// ===============================
// Firebase Initialization
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ✅ Make sure your config values are correct and private in production
const firebaseConfig = {
  apiKey: "AIzaSyAoHhfGMF3uHD8fqKBSB3hAGGdg0lp2yaM",
  authDomain: "ivms-86f09.firebaseapp.com",
  databaseURL: "https://ivms-86f09-default-rtdb.firebaseio.com",
  projectId: "ivms-86f09",
  storageBucket: "ivms-86f09.firebasestorage.app",
  messagingSenderId: "1081606251604",
  appId: "1:1081606251604:web:39e3ec9881baf478f279c1",
  measurementId: "G-X0D8JELQEV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // ✅ analytics variable not used, so no need to store
const db = getDatabase();

// Export for use in other files
export { app, analytics, db, ref, set, get, update, remove, onValue};
