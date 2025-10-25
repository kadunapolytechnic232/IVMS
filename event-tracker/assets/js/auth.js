// ===============================
// Firebase Initialization
// ===============================
import { app, db, ref, set, get, onValue } from "./firebase.js";

// ===============================
// Local storage arrays
// ===============================
let users = [];

// Sync users from Firebase in realtime
onValue(ref(db, "users"), (snapshot) => {
  const data = snapshot.val();
  users = data ? Object.values(data) : [];
});

// ===============================
// DOM Elements
// ===============================
const authForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const registerCard = document.getElementById("registerCard");
const authCard = document.getElementById("card-auth");
const regRole = document.getElementById("regRole");
const regSpecial = document.getElementById("regSpecial");

// ===============================
// Toggle forms
// ===============================
if (showRegister) {
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    registerCard.classList.remove("hidden");
    authCard.classList.add("hidden");
  });
}
if (showLogin) {
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerCard.classList.add("hidden");
    authCard.classList.remove("hidden");
  });
}

// ===============================
// Dynamic placeholder for regSpecial
// ===============================
if (regRole && regSpecial) {
  regRole.addEventListener("change", () => {
    if (regRole.value === "student") {
      regSpecial.placeholder = "Registration Number";
    } else if (regRole.value === "staff") {
      regSpecial.placeholder = "Staff ID";
    } else {
      regSpecial.placeholder = "Admin Code";
    }
  });
}





// ===============================
  // Faculty → Departments Mapping
  // ===============================
  const departments = {
    science: [
      { value: "computer-science", text: "Computer Science" },
      { value: "mathematics", text: "Mathematics" },
      { value: "statistics", text: "Statistics" },
      { value: "biology", text: "Biology" }
    ],
    arts: [
      { value: "english", text: "English" },
      { value: "history", text: "History" },
      { value: "philosophy", text: "Philosophy" },
      { value: "linguistics", text: "Linguistics" }
    ]
  };

  const facultySelect = document.getElementById("regFaculty");
  const departmentSelect = document.getElementById("regDepartment");

  // ===============================
  // When faculty changes → update departments
  // ===============================
  facultySelect.addEventListener("change", () => {
    const faculty = facultySelect.value;
    departmentSelect.innerHTML = '<option value="">-- Select Department --</option>';

    if (departments[faculty]) {
      departments[faculty].forEach(dep => {
        const option = document.createElement("option");
        option.value = dep.value;
        option.textContent = dep.text;
        departmentSelect.appendChild(option);
      });
    }
  });







// ===============================
// Login
// ===============================
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Find user from synced array
    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      alert("Invalid email or password!");
      return;
    }

    // ✅ Save logged-in user to localStorage
    localStorage.setItem("currentUser", JSON.stringify(found));

    // Redirect based on role
    if (found.role === "student") {
      window.location.href = "dashboard.html";
    } else if (found.role === "staff") {
      window.location.href = "dashboard.html";
    } else if (found.role === "admin") {
      window.location.href = "./admin/manage-users.html";
    }
  });
}

// ===============================
// Register
// ===============================
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const role = document.getElementById("regRole").value;
    const faculty = document.getElementById("regFaculty").value;
    const department = document.getElementById("regDepartment").value;
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const specialId = document.getElementById("regSpecial").value.trim();

    if (!name || !email || !password || !specialId) {
      alert("Please fill all required fields.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      role,
      faculty,
      department,
      email,
      password,
      specialId, // Registration Number / Staff ID / Admin Code
      createdAt: Date.now(),
    };

    try {
      // Save to Firebase
      await set(ref(db, "users/" + newUser.id), newUser);

      // Save to local array
      users.push(newUser);

      alert("Registration successful! Please login.");
      registerCard.classList.add("hidden");
      authCard.classList.remove("hidden");
      registerForm.reset();
    } catch (err) {
      alert("Error registering: " + err.message);
    }
  });
}
