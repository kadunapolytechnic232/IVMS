// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";

// ==================== FETCH DATA ====================
let customers = [];
let products = [];
let orders = [];
let orderIdFromURL = null;

// Wait counter to ensure all three datasets are loaded
let dataLoaded = { customers: false, products: false, orders: false };

function tryRenderReceipt() {
  if (dataLoaded.customers && dataLoaded.products && dataLoaded.orders && orderIdFromURL) {
    renderReceipt(orderIdFromURL);
  }
}

/*
// Fetch customers
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = [];
  snapshot.forEach((e) => customers.push(e.val()));
  dataLoaded.customers = true;
  tryRenderReceipt();
});

// Fetch products
onValue(ref(db, "IVMS/products"), (snapshot) => {
  products = [];
  snapshot.forEach((item) => {
    products.push(item.val());
  });
  console.log(products)
  dataLoaded.products = true;
  tryRenderReceipt();
});


// Fetch orders
onValue(ref(db, "IVMS/orders"), (snapshot) => {
  orders = [];
  snapshot.forEach((e) => orders.push(e.val()));
  dataLoaded.orders = true;
  tryRenderReceipt();
});

*/


// Fetch customers
onValue(ref(db, "IVMS/customers"), (snapshot) => {
  customers = [];
  snapshot.forEach((child) => {
    customers.push({
      id: child.key,   // keep Firebase key
      ...child.val()
    });
  });
  dataLoaded.customers = true;
  tryRenderReceipt();
});

// Fetch products
onValue(ref(db, "IVMS/products"), (snapshot) => {
  products = [];
  snapshot.forEach((child) => {
    products.push({
      id: child.key,   // keep Firebase key
      ...child.val()
    });
  });
  console.log(products);
  dataLoaded.products = true;
  tryRenderReceipt();
});

// Fetch orders
onValue(ref(db, "IVMS/orders"), (snapshot) => {
  orders = [];
  snapshot.forEach((child) => {
    orders.push({
      id: child.key,   // keep Firebase key
      ...child.val()
    });
  });
  dataLoaded.orders = true;
  tryRenderReceipt();
});


// ==================== HELPER ====================
function getQueryParam(key) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

/*
// ==================== RENDER RECEIPT ====================
function renderReceipt(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    alert("Order not found.");
    return;
  }

  const customer = customers.find(c => c.id === order.customerId);

  document.getElementById("receiptId").textContent = order.id;
  document.getElementById("receiptCustomer").textContent = customer?.name || "Unknown";
  document.getElementById("receiptDate").textContent = new Date(order.createdAt).toLocaleDateString();
  document.getElementById("receiptTotal").textContent = `₦${order.total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const itemsContainer = document.getElementById("receiptItems");
  itemsContainer.innerHTML = "";

  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const price = product?.price || 0;
    const row = `
      <tr>
        <td>${product?.name || "N/A"}</td>
        <td>${item.qty}</td>
        <td>₦${price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
        <td>₦${(price * item.qty).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
    itemsContainer.innerHTML += row;
  });
}

*/






function renderReceipt(orderId) {
  console.log("Rendering receipt for order ID:", orderId);

  // ===== Find Order =====
  const order = orders.find(o => String(o.id) === String(orderId));
  if (!order) {
    console.error(`Order not found for ID: ${orderId}`);
    alert("Order not found.");
    return;
  }

  // ===== Find Customer =====
  const customer = customers.find(c => String(c.id) === String(order.customerId));
  if (!customer) {
    console.warn(`Customer not found for ID: ${order.customerId}`);
  }

  // ===== Fill Receipt Header =====
  document.getElementById("receiptId").textContent = order.id || "N/A";
  document.getElementById("receiptCustomer").textContent = customer?.name || "Unknown";
  document.getElementById("receiptDate").textContent =
    order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";
  document.getElementById("receiptTotal").textContent =
    `₦${(order.total || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  // ===== Fill Receipt Items =====
  const itemsContainer = document.getElementById("receiptItems");
  itemsContainer.innerHTML = "";

  if (!Array.isArray(order.items) || order.items.length === 0) {
    console.warn(`No items found for order ID: ${order.id}`);
    itemsContainer.innerHTML = `<tr><td colspan="4">No items in this order</td></tr>`;
    return;
  }

  order.items.forEach(item => {
    // Match product by converting both IDs to strings
    const product = products.find(p => String(p.id) === String(item.productId));
    if (!product) {
      console.warn(`Product not found for ID: ${item.productId}`);
    }

    const productName = product?.name || "N/A";
    const price = Number(product?.price) || 0;
    const qty = Number(item.qty) || 0;
    const subtotal = price * qty;

    const row = `
      <tr>
        <td>${productName}</td>
        <td>${qty}</td>
        <td>₦${price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
        <td>₦${subtotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
    itemsContainer.innerHTML += row;
  });
}





// ==================== DOWNLOAD RECEIPT ====================
document.querySelector(".downloadPDF").addEventListener("click", () => {
  downloadPDF();
});

function downloadPDF() {
  const receipt = document.getElementById("receipt");
  if (!receipt) {
    console.error("Receipt element not found!");
    return;
  }

  html2pdf()
    .from(receipt)
    .save("receipt.pdf")
    .then(() => window.print());
}

// ==================== PAGE INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  orderIdFromURL = getQueryParam("orderId");
  tryRenderReceipt();
});












