// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";


let editing = false; // Tracks whether we're editing or creating a new user
let Users = []; // Array to store fetched Users

// ========================
// Fetch Users from Firebase in real time
// ========================

onValue(ref(db, "IVMS/Users"), (snapshot) => {
  Users = [];
  snapshot.forEach((e) => { 
    Users.push(e.val()); 
  });
  renderUsers(); // Automatically re-render table whenever data changes
});
 
// ========================
// Render Users table
// ========================
function renderUsers() {
  const tbody = document.getElementById("userTable");
  tbody.innerHTML = "";
  console.log(Users)
  Users.forEach((User, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${User.name}</td>
        <td>${User.email}</td>
        <td>${User.role}</td>
        <td class="actions">
          <button class="editUser"; data-id="${User.id}"; >✏️</button>
          <button class="deleteUser"; data-id="${User.id}"; >🗑️</button>
        </td>
      </tr>`;
    tbody.innerHTML += row;

    // ========================
    // Edit an existing user
    // ========================
    document.querySelectorAll(".editUser").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;
        

        editing = true;
        const User = Users.find(U => U.id === id);
        if (!User) return;

        // Load data into the form
        document.getElementById("userId").value = User.id;
        document.getElementById("userName").value = User.name;
        document.getElementById("userEmail").value = User.email;
        document.getElementById("userPassword").value = User.password;
        document.getElementById("userRole").value = User.role;

        document.getElementById("modalTitle").textContent = "Edit User";
        document.getElementById("userModal").style.display = "flex";
      })
    })
    
    // ========================
    // Delete a user
    // ========================
    document.querySelectorAll(".deleteUser").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;
        if (confirm("Are you sure you want to delete this User?")) {
          remove(ref(db, `IVMS/Users/${id}`));
        }
      })
    })

  });
}


// ========================
// Form submit handler (Create or Update)
// ========================
document.getElementById("userForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("userId").value || Date.now().toString();
  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const password = document.getElementById("userPassword").value; // Keep as string
  const role = document.getElementById("userRole").value;

  const User = { id, name, email, password, role };

  if (editing) {
    // Update existing user
    update(ref(db, `IVMS/Users/${id}`), User);
  } else {
    // Create new user
    set(ref(db, `IVMS/Users/${id}`), User);
  }

   // Close modal after saving
  document.getElementById("userModal").style.display = "none";
});


// ========================
// Open "Add User" modal
// ========================
document.querySelector(".openAddModal").addEventListener('click',()=>{
  editing = false;
  document.getElementById("userForm").reset(); // Clear form fields
  document.getElementById("userId").value = "";
  document.getElementById("modalTitle").textContent = "Create New System User";
  document.getElementById("userModal").style.display = "flex";
  
});



// ========================
// Close modal
// ========================
document.querySelector(".closeModal").addEventListener('click',()=>{
  document.getElementById("userModal").style.display = "none";
});











