// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";

// ========================
// Store fetched data
// ========================
let customers = [];
let orders = [];



/*
// ========================
// Fetch customers
// ========================
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = [];

  snapshot.forEach((e) => {
    customers.push(e.val());
  });

  // Sort alphabetically by name
  customers.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Loaded ${customers.length} customers from Firebase`);
  populateCustomerSelect();
});




// ========================
// Fetch orders
// ========================
onValue(ref(db, "IVMS/orders"), (snapshot) => {
  orders = [];
  snapshot.forEach((e) => orders.push(e.val()));
});
*/





// ========================
// Fetch customers
// ========================
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = [];

  snapshot.forEach((child) => {
    customers.push({
      id: child.key,   // keep Firebase key as ID
      ...child.val()
    });
  });

  // Sort alphabetically by name
  customers.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Loaded ${customers.length} customers from Firebase`);
  populateCustomerSelect();
});

// ========================
// Fetch orders
// ========================
onValue(ref(db, "IVMS/orders"), (snapshot) => {
  orders = [];

  snapshot.forEach((child) => {
    orders.push({
      id: child.key,   // keep Firebase key as ID
      ...child.val()
    });
  });

  console.log(`Loaded ${orders.length} orders from Firebase`);
});





// ========================
// Populate customer dropdown
// ========================
function populateCustomerSelect() {
  const select = document.getElementById("customerSelect");
  select.innerHTML = '<option value="">-- Select Customer --</option>';

  customers.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = `${c.name} (${c.email})`; // Optional: show email
    select.appendChild(option);
  });
}


// ========================
// Render orders for a customer
// ========================
function renderOrders(customerId) {
  const tbody = document.getElementById("orderTableBody");
  tbody.innerHTML = "";

  if (!customerId) return;

  const customerOrders = orders.filter(o => o.customerId === customerId);
  console.log(orders)
  if (customerOrders.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No orders found.</td></tr>";
    return;
  }

  customerOrders.forEach(order => {
    const row = `
      <tr>
        <td>${order.id}</td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td>₦${order.total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
        <td>
          <a href="receipt.html?orderId=${order.id}" target="_blank">🧾 View Receipt</a>
        </td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

// ========================
// Event listener for dropdown
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("customerSelect");
  select.addEventListener("change", () => {
    renderOrders(select.value);
  });
});






























