// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";


// ===============================
// Customers & Products Arrays
// ===============================
let customers = [];
let products = [];

// ===============================
// FETCH CUSTOMERS (REAL-TIME)
// ===============================
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = [];
  snapshot.forEach((e) => {
    customers.push(e.val());
  });
  populateCustomerSelect(); // Populate when data is ready
});

// ===============================
// FETCH PRODUCTS (REAL-TIME)
// ===============================
onValue(ref(db, "IVMS/products"), (snapshot) => {
  products = [];
  snapshot.forEach((e) => {
    products.push(e.val());
  });
  refreshProductRows(); // Update product dropdowns with new data
});

// ===============================
// Populate customer dropdown
// ===============================
function populateCustomerSelect() {
  const select = document.getElementById("customerSelect");
  select.innerHTML = `<option value="">Select Customer</option>`;
  customers.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent =  `${c.name} (${c.email})`; // Optional: show email
    select.appendChild(option);
  });
}

// ===============================
// Add product row
// ===============================
function addProductRow() {
  const row = document.createElement("div");
  row.classList.add("product-row");

  const productSelect = document.createElement("select");
  productSelect.required = true;
  productSelect.innerHTML = `<option value="">Select Product</option>`;
  products.forEach(p => {
    productSelect.innerHTML += `<option value="${p.id}" data-price="${p.price}">${p.name} (₦${p.price})</option>`;
  });

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = 1;
  qtyInput.placeholder = "Qty";
  qtyInput.required = true;
  qtyInput.value = 1;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️";
  removeBtn.classList.add("remove-btn");
  removeBtn.type = "button";
  removeBtn.onclick = () => {
    row.remove();
    calculateTotal();
  };

  row.appendChild(productSelect);
  row.appendChild(qtyInput);
  row.appendChild(removeBtn);

  document.getElementById("productList").appendChild(row);

  productSelect.addEventListener("change", calculateTotal);
  qtyInput.addEventListener("input", calculateTotal);
}

// ===============================
// Refresh all product dropdowns when data changes
// ===============================
function refreshProductRows() {
  document.querySelectorAll(".product-row select").forEach(select => {
    const selectedValue = select.value; // Keep previous selection
    select.innerHTML = `<option value="">Select Product</option>`;
    products.forEach(p => {
      select.innerHTML += `<option value="${p.id}" data-price="${p.price}">${p.name} (₦${p.price})</option>`;
    });
    select.value = selectedValue;
  });
}

// ===============================
// Calculate total price
// ===============================
function calculateTotal() {
  let total = 0;
  document.querySelectorAll(".product-row").forEach(row => {
    const select = row.querySelector("select");
    const qty = parseInt(row.querySelector("input").value) || 0;
    const price = parseFloat(select.selectedOptions[0]?.dataset.price || 0);
    total += price * qty;
  });
  document.getElementById("orderTotal").textContent = total.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

// ===============================
// Handle order form submission
// ===============================
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const customerId = document.getElementById("customerSelect").value;
  if (!customerId) return alert("Please select a customer.");

  const orderItems = [];
  document.querySelectorAll(".product-row").forEach(row => {
    const productId = row.querySelector("select").value;
    const qty = parseInt(row.querySelector("input").value);
    if (productId && qty > 0) {
      orderItems.push({ productId, qty });
    }
  });

  if (orderItems.length === 0) return alert("Please add at least one product.");

  const orderId = Date.now().toString();
  const order = {
    id: orderId,
    customerId,
    items: orderItems,
    total: parseFloat(document.getElementById("orderTotal").textContent.replace(/,/g, "")),
    createdAt: new Date().toISOString()
  };

  set(ref(db, `IVMS/orders/${orderId}`), order).then(() => {
    alert("Order submitted successfully!");
    document.getElementById("orderForm").reset();
    document.getElementById("productList").innerHTML = "";
    document.getElementById("orderTotal").textContent = "0.00";
  });
});

// ===============================
// Event listeners
// ===============================
document.querySelector(".addProductRow").addEventListener("click", addProductRow);

document.addEventListener("DOMContentLoaded", () => {
  addProductRow();
});





