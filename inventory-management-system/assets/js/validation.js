// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";





// ========================
// Store all Users fetched from Firebase
// ========================
let Users = [];

// ========================
// Fetch Users from Firebase in real time
// This keeps Users[] updated with the latest data
// ========================
onValue(ref(db, "IVMS/Users"), (snapshot) => {
  Users = [];
  snapshot.forEach((e) => {
    Users.push(e.val());
  });
});

// ========================
// Run after page loads
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  

  // ========================
  // Login form submission handler
  // ========================
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    const email = emailInput.value.trim(); // Remove extra spaces
    const password = passwordInput.value; // Keep as string

    // ========================
    // Find a user in Users[] with matching email and password
    // ========================
    const user = Users.find(u => u.email === email && u.password === password);

    if (user) {
      // ========================
      // Store logged-in user data locally (for later use)
      // ========================
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      // ========================
      // Redirect to dashboard page
      // ========================
      window.location.href = "dashboard.html";
    } else {
      // ========================
      // Show error message if login fails
      // ========================
      errorMsg.textContent = "Invalid email or password.";
      errorMsg.style.color = "red";
    }
  });
});
