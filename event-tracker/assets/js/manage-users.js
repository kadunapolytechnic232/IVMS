// ====================================
// Firebase Initialization
// ====================================
// Make sure you have firebase.js configured like this:
// export { app, db, ref, set, get, update, remove, onValue } from "./firebase.js";
import { app, db, ref, set, get, update, remove, onValue } from "./firebase.js";

// ====================================
// DOM Elements
// ====================================
const form = document.getElementById("userForm");
const userTableBody = document.getElementById("userTableBody");
const regRole = document.getElementById("regRole");
const regFaculty = document.getElementById("regFaculty");
const regDepartment = document.getElementById("regDepartment");
const regSpecial = document.getElementById("regSpecial");
const submitBtn = document.getElementById("submitBtn");

let editMode = false;
let editUserId = null;

// ====================================
// Department Options by Faculty
// ====================================
const departments = {
  science: ["Computer Science", "Biology", "Chemistry", "Physics"],
  arts: ["History", "English", "Linguistics", "Philosophy"],
};

// ====================================
// Dynamic Department Population
// ====================================
regFaculty.addEventListener("change", () => {
  const selected = regFaculty.value;
  regDepartment.innerHTML = '<option value="">-- Select Department --</option>';
  if (departments[selected]) {
    departments[selected].forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      regDepartment.appendChild(opt);
    });
  }
});

// ====================================
// Change Special Field Label Based on Role
// ====================================
regRole.addEventListener("change", () => {
  const role = regRole.value;
  if (role === "student") regSpecial.placeholder = "Registration Number";
  else if (role === "staff") regSpecial.placeholder = "Staff ID";
  else if (role === "admin") regSpecial.placeholder = "Admin Code";
  else regSpecial.placeholder = "Special ID";
});

// ====================================
// Create / Update User
// ====================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const role = regRole.value;
  const faculty = regFaculty.value;
  const department = regDepartment.value;
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const specialId = regSpecial.value.trim();

  if (!name || !role || !faculty || !department || !email || !password) {
    alert("Please fill all required fields!");
    return;
  }

  // Use email as unique user ID (replacing '.' in Firebase path)
  const userId = email.replace(/\./g, "_");

  const userData = {
    name,
    role,
    faculty,
    department,
    email,
    password,
    specialId,
  };

  try {
    const userRef = ref(db, "users/" + userId);

    if (editMode) {
      await update(userRef, userData);
      alert("✅ User updated successfully!");
    } else {
      await set(userRef, userData);
      alert("✅ User added successfully!");
    }

    form.reset();
    editMode = false;
    submitBtn.textContent = "Add User";
  } catch (err) {
    console.error("Error saving user:", err);
    alert("Error saving user data. Check console for details.");
  }
});

// ====================================
// Display All Users in Table
// ====================================
onValue(ref(db, "users"), (snapshot) => {
  const users = snapshot.val();
  userTableBody.innerHTML = "";

  if (users) {
    Object.entries(users).forEach(([id, user]) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.role}</td>
        <td>${user.faculty}</td>
        <td>${user.department}</td>
        <td>${user.email}</td>
        <td>${user.specialId}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editUser('${id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteUser('${id}')">Delete</button>
        </td>
      `;

      userTableBody.appendChild(row);
    });
  } else {
    userTableBody.innerHTML = `<tr><td colspan="7">No users found.</td></tr>`;
  }
});

// ====================================
// Edit User Function
// ====================================
window.editUser = async (id) => {
  const snapshot = await get(ref(db, "users/" + id));
  if (snapshot.exists()) {
    const user = snapshot.val();

    document.getElementById("regName").value = user.name;
    regRole.value = user.role;
    regFaculty.value = user.faculty;

    // Refill departments
    const deptList = departments[user.faculty] || [];
    regDepartment.innerHTML = '<option value="">-- Select Department --</option>';
    deptList.forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      regDepartment.appendChild(opt);
    });
    regDepartment.value = user.department;

    document.getElementById("regEmail").value = user.email;
    document.getElementById("regPassword").value = user.password;
    regSpecial.value = user.specialId;

    editMode = true;
    editUserId = id;
    submitBtn.textContent = "Update User";
  } else {
    alert("User not found.");
  }
};

// ====================================
// Delete User Function
// ====================================
window.deleteUser = async (id) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await remove(ref(db, "users/" + id));
      alert("🗑️ User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting user.");
    }
  }
};
