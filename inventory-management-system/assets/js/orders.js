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

function refreshProductRows() {
  document.querySelectorAll(".product-row select").forEach(select => {
    const prevValue = select.value; // save previous selection
    const qtyInput = select.parentElement.querySelector("input");

    // Remove all options
    select.innerHTML = "";

    // Add default option
    select.appendChild(new Option("Select Product", ""));

    // Add real product options safely
    products.forEach(p => {
      const stock = parseInt(p.stock) || 0;
      const text = `${p.name} (₦${p.price}) — ${stock > 0 ? stock + " in stock" : "Out of stock"}`;
      const option = new Option(text, p.id);
      option.disabled = stock <= 0;
      option.dataset.price = p.price;
      select.appendChild(option);
    });

    // Restore previous selection if still valid
    if (prevValue && products.find(p => p.id === prevValue && (parseInt(p.stock) || 0) > 0)) {
      select.value = prevValue;
    } else {
      select.value = "";
      if (qtyInput) qtyInput.value = 1;
    }
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
// Handle order form submission (uses 'stock' field)
// ===============================
document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const customerId = document.getElementById("customerSelect").value;
  if (!customerId) return alert("Please select a customer.");

  // Collect selected products and quantities
  const orderItems = [];
document.querySelectorAll(".product-row").forEach(row => {
  const select = row.querySelector("select");
  const qty = parseInt(row.querySelector("input").value) || 0;

  // Use the real product from the products array
  const product = products.find(p => p.id === select.value);

  if (product && qty > 0) {
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      qty: qty
    });
  }
});

  if (orderItems.length === 0) return alert("Please add at least one product.");

  // Step 1: Check availability
  let insufficient = [];
  for (let item of orderItems) {
    const productRef = ref(db, `IVMS/products/${item.productId}`);
    const snap = await get(productRef);

    if (!snap.exists()) {
      insufficient.push(`Product not found (ID: ${item.productId})`);
      continue;
    }

    const product = snap.val();
    const available = parseInt(product.stock || 0);

    if (available < item.qty) {
      insufficient.push(`${product.name} — Available: ${available}, Ordered: ${item.qty}`);
    }
  }

  // Step 2: Stop if any product is insufficient
  if (insufficient.length > 0) {
    alert("❌ Cannot process order.\nThe following products have insufficient stock:\n\n" + insufficient.join("\n"));
    return;
  }

  // Step 3: Deduct stocks and prepare updates
  const updates = {};
  for (let item of orderItems) {
    const productRef = ref(db, `IVMS/products/${item.productId}`);
    const snap = await get(productRef);
    const product = snap.val();
    const newStock = product.stock - item.qty;
    updates[`IVMS/products/${item.productId}/stock`] = newStock;
  }

  // Step 4: Create order
  const orderId = Date.now().toString();
  const order = {
    id: orderId,
    customerId,
    items: orderItems,
    total: parseFloat(document.getElementById("orderTotal").textContent.replace(/,/g, "")),
    createdAt: new Date().toISOString()
  };

  updates[`IVMS/orders/${orderId}`] = order;

  // Step 5: Update Firebase
  try {
    await update(ref(db), updates);
    alert("✅ Order submitted successfully! Stock updated.");

    // Reset form
    document.getElementById("orderForm").reset();
    document.getElementById("productList").innerHTML = "";
    document.getElementById("orderTotal").textContent = "0.00";
    addProductRow();

    // Step 6: Refresh product dropdowns live
    refreshProductRows();

  } catch (error) {
    console.error(error);
    alert("⚠️ Error while submitting order. Please try again.");
  }
});

// ===============================
// Event listeners
// ===============================
document.querySelector(".addProductRow").addEventListener("click", addProductRow);

document.addEventListener("DOMContentLoaded", () => {
  addProductRow();
});















