

// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";



// ===============================
// State Variables
// ===============================
let editing = false;
let products = [];
let categories = [];

// ===============================
// Fetch Products (Real-Time)
// ===============================
onValue(ref(db, "IVMS/products"), (snapshot) => {
  products = [];
  snapshot.forEach((item) => {
    products.push(item.val());
  });
  renderProducts();
});

// ===============================
// Fetch Categories (Real-Time)
// ===============================
onValue(ref(db, "IVMS/categories"), (snapshot) => {
  categories = [];
  snapshot.forEach((item) => {
    categories.push(item.val());
  });
  populateCategorySelect();
});

// ===============================
// Populate Category Select
// ===============================
function populateCategorySelect() {
  const categorySelect = document.getElementById("productCategory");
  if (!categorySelect) return; // ✅ Prevents errors if element is missing

  categorySelect.innerHTML = '<option value="">-- Select Category --</option>';

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// ===============================
// Render Products Table
// ===============================
function renderProducts() {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return; // ✅ Avoids crash if table not in DOM

  tbody.innerHTML = "";

  products.forEach((product, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₦${formatNaira(product.price)}</td>
      <td>${product.stock}</td>
      <td class="actions">
        <button class="editProduct" data-id="${product.id}">✏️</button>
        <button class="deleteProduct" data-id="${product.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  attachProductEvents();
}

// ===============================
// Helper: Format Price in Naira
// ===============================
function formatNaira(amount) {
  return Number(amount).toLocaleString("en-NG");
}

// ===============================
// Get Category Name by ID
// ===============================
function getCategoryName(categoryId) {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : "Unknown";
}

// ===============================
// Attach Edit/Delete Events
// ===============================
function attachProductEvents() {
  document.querySelectorAll(".editProduct").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === btn.dataset.id);
      if (!product) return;

      editing = true;
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productCategory").value = product.category;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productStock").value = product.stock;

      document.getElementById("modalTitle").textContent = "Edit Product";
      document.getElementById("productModal").style.display = "flex";
    });
  });

  document.querySelectorAll(".deleteProduct").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this product?")) {
        remove(ref(db, `IVMS/products/${id}`));
      }
    });
  });
}

// ===============================
// Open Add Product Modal
// ===============================
document.querySelector(".openAddModal")?.addEventListener("click", () => {
  editing = false;
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("modalTitle").textContent = "Add Product";
  document.getElementById("productModal").style.display = "flex";
});

// ===============================
// Close Modal
// ===============================
document.querySelector(".closeModal")?.addEventListener("click", () => {
  document.getElementById("productModal").style.display = "none";
});

// ===============================
// Handle Form Submission
// ===============================
document.getElementById("productForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value || Date.now().toString();
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value, 10);

  console.log(category)
  if (!name || !category || isNaN(price) || isNaN(stock)) {
    alert("Please fill out all fields correctly.");
    return;
  }

  const product = { id, name, category, price, stock };

  if (editing) {
    update(ref(db, `IVMS/products/${id}`), product);
  } else {
    set(ref(db, `IVMS/products/${id}`), product);
  }

  document.getElementById("productModal").style.display = "none";
});
