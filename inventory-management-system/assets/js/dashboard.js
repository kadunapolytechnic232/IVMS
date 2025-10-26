// ===============================
// Firebase Initialization
// ===============================
import { app, analytics, db, ref, set, get, update, remove, onValue } from "./firebase.js";




// Function to update a counter from a DB path
function updateCounter(path, elementId) {
  const dbRef = ref(db, path);
  onValue(dbRef, (snapshot) => {
    let count = 0;
    if (snapshot.exists()) {
      count = snapshot.numChildren ? snapshot.numChildren() : Object.keys(snapshot.val()).length;
    }
    document.getElementById(elementId).textContent = count;
    //console.log(`[${path}] Count:`, count);
  }, (error) => {
    console.error(`Error reading ${path}:`, error);
    document.getElementById(elementId).textContent = "ERR";
  });
}

// Run when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  updateCounter("IVMS/products", "totalProducts");
  updateCounter("IVMS/customers", "totalCustomers");
  updateCounter("IVMS/orders", "totalOrders");
  updateCounter("IVMS/Users", "totalUsers");
});
