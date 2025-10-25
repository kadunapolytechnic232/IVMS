// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";


// ===============================
// Category Management Script
// ===============================

// This array will hold all category objects fetched from Firebase
let categories = [];

// ===============================
// FETCH CATEGORIES IN REAL-TIME
// ===============================
// onValue() listens for any changes in the "IVMS/categories" node of Firebase
// Whenever data changes, the snapshot contains the latest data
onValue(ref(db, "IVMS/categories"), (snapshot) => {
  categories = []; // Reset the array to avoid duplicates
  snapshot.forEach((e) => {
    categories.push(e.val()); // Push each category object into the array
  });
  renderCategories(); // Refresh the table display
});






// ===============================
// RENDER CATEGORY TABLE
// ===============================
function renderCategories() {
  const tbody = document.getElementById("categoryTable");
  tbody.innerHTML = ""; // Clear table before adding new rows

  // Loop through all categories and create table rows
  categories.forEach((cat, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td> <!-- Serial Number -->
        <td>${cat.name}</td> <!-- Category Name -->
        <td>
          <!-- Buttons for editing and deleting -->
          <button class="editCategory"; data-id="${cat.id}";>✏️ Edit</button>
          <button class="deleteCategory"; data-id="${cat.id}";>🗑️ Delete</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row; // Add row to table

    // ===============================
    // LOAD CATEGORY INTO FORM FOR EDITING
    // ===============================
    document.querySelectorAll(".editCategory").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;

        // Find the category object by its ID
        const cat = categories.find(c => c.id === id);
        if (cat) {
          // Fill the form fields with the category's existing data
          document.getElementById("categoryName").value = cat.name;
          document.getElementById("categoryId").value = cat.id;
        }
      })
    })
    
    // ===============================
    // DELETE CATEGORY
    // ===============================
    document.querySelectorAll(".deleteCategory").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;

        // Confirm deletion to prevent accidental removal
        if (confirm("Delete this category?")) {
          // Remove from Firebase
          remove(ref(db, `IVMS/categories/${id}`)).then(() => {
            // Also remove from local array for instant UI update
            categories = categories.filter(c => c.id !== id);
            renderCategories(); // Refresh the table
          });
        }
      })
    })
  });
}


// ===============================
// HANDLE FORM SUBMISSION
// ===============================
document.getElementById("categoryForm").addEventListener("submit", function(e) {
  e.preventDefault(); // Stop page reload

  const name = document.getElementById("categoryName").value.trim(); // Get category name
  const id = document.getElementById("categoryId").value; // Get category ID (empty if new)

  // If the name field is empty, show alert and stop
  if (!name) return alert("Please enter a category name.");

  if (id) {
    // ===============================
    // UPDATE EXISTING CATEGORY
    // ===============================
    update(ref(db, `IVMS/categories/${id}`), { id, name })
  } else {
    // ===============================
    // CREATE NEW CATEGORY
    // ===============================
    const newId = Date.now().toString(); // Unique ID using timestamp
    set(ref(db, `IVMS/categories/${newId}`), { id: newId, name })
  }

  // Reset the form after submission
  this.reset();
});


