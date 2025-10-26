// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";



// ===============================
// Customer Management Script
// ===============================

// Flag to check whether we are editing an existing customer or adding a new one
let editing = false;

// This array will hold all customer objects fetched from Firebase
let customers = [];

// ===============================
// FETCH CUSTOMERS FROM FIREBASE (REAL-TIME)
// ===============================
// onValue() listens for any changes in the "IVMS/customers" node
// Every time data changes, we reset and repopulate the customers array
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = []; // Clear the array to avoid duplicates
  snapshot.forEach((e) => {
    customers.push(e.val()); // Add each customer object to the array
  });
  renderCustomers(); // Refresh the table when data updates
});

// ===============================
// RENDER CUSTOMERS INTO TABLE
// ===============================
function renderCustomers() {
  const tbody = document.getElementById("customerTableBody");
  tbody.innerHTML = ""; // Clear table before rendering

  // Loop through each customer and create table rows
  customers.forEach((customer, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td> <!-- Serial Number -->
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone}</td>
        <td>${customer.address}</td>
        <td class="actions">
          <!-- Edit and Delete buttons -->
          <button class="editCustomer"; data-id="${customer.id}";>✏️</button>
          <button class="deleteCustomer"; data-id="${customer.id}";>🗑️</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;


    // ===============================
    // LOAD CUSTOMER DATA INTO FORM FOR EDITING
    // ===============================
    document.querySelectorAll(".editCustomer").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;

        editing = true; // We're editing, not adding
        const customer = customers.find(c => c.id === id);
        if (!customer) return; // If not found, stop

        // Fill form fields with the existing customer data
        document.getElementById("customerId").value = customer.id;
        document.getElementById("customerName").value = customer.name;
        document.getElementById("customerEmail").value = customer.email;
        document.getElementById("customerPhone").value = customer.phone;
        document.getElementById("customerAddress").value = customer.address;

        document.getElementById("modalTitle").textContent = "Edit Customer"; // Update modal title
        document.getElementById("customerModal").style.display = "flex"; // Show modal
      })
    })
    
    // ===============================
    // DELETE A CUSTOMER
    // ===============================
    document.querySelectorAll(".deleteCustomer").forEach((e)=>{
      e.addEventListener('click',()=>{
        let id = e.dataset.id;

        if (confirm("Are you sure you want to delete this customer?")) {
          remove(ref(db, `IVMS/customers/${id}`)).then(() => {
            // Remove from local array
            customers = customers.filter(c => c.id !== id);
            renderCustomers(); // Refresh table
          });
        }
      })
    })
  });
}



// ========================
// OPEN MODAL TO ADD A NEW CUSTOMER
// ========================
document.querySelector(".openAddModal").addEventListener('click',()=>{
  editing = false; // We're adding, not editing
  document.getElementById("customerForm").reset(); // Clear form fields
  document.getElementById("customerId").value = ""; // No ID yet for new customer
  document.getElementById("modalTitle").textContent = "Add Customer"; // Modal title
  document.getElementById("customerModal").style.display = "flex"; // Show modal
  
});



// ========================
// CLOSE CUSTOMER MODAL
// ========================
document.querySelector(".closeModal").addEventListener('click',()=>{
  document.getElementById("customerModal").style.display = "none";
});


// ===============================
// HANDLE CUSTOMER FORM SUBMISSION
// ===============================
document.getElementById("customerForm").addEventListener("submit", (e) => {
  e.preventDefault(); // Stop form from refreshing the page

  // Get form values
  const id = document.getElementById("customerId").value || Date.now().toString(); // Generate ID if new
  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  // Build customer object
  const customer = { id, name, email, phone, address };

  if (editing) {
    // ===============================
    // UPDATE EXISTING CUSTOMER
    // ===============================
    const index = customers.findIndex(c => c.id === id);
    update(ref(db, `IVMS/customers/${id}`), customer);
  } else {
    // ===============================
    // CREATE NEW CUSTOMER
    // ===============================
    set(ref(db, `IVMS/customers/${id}`), customer);
  }

  // Close modal after save
   document.getElementById("customerModal").style.display = "none";
});





// ===============================
// INITIAL TABLE RENDER ON PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", renderCustomers);











