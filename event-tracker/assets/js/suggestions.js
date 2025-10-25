// ===============================
// Firebase Initialization
// ===============================
// Make sure firebase.js exports initialized app and db
import { app, db, ref, set, onValue, remove } from "./firebase.js";

// ===============================
// DOM Elements
// ===============================
const suggestionsList = document.getElementById("suggestionsList");
const suggestionForm = document.getElementById("suggestionForm");
const suggestionBody = document.getElementById("suggestionBody");
const suggestImage = document.getElementById("suggestImage");

// ===============================
// Utility: Convert File → Base64 Data URL
// ===============================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Data URL string
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===============================
// Render Suggestions
// ===============================
function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = "";

  suggestions
    .sort((a, b) => b.timestamp - a.timestamp) // newest first
    .forEach((sug) => {
      const li = document.createElement("li");
      li.classList.add("suggestion-item");

      // Text
      const text = document.createElement("p");
      text.classList.add("suggestion-text");
      text.textContent = sug.text;
      li.appendChild(text);

      // Optional image
      if (sug.image) {
        const img = document.createElement("img");
        img.src = sug.image; // ✅ Data URL (works in any browser)
        img.alt = "Suggestion image";
        img.classList.add("suggestion-img");
        li.appendChild(img);
      }

      // Timestamp
      const small = document.createElement("small");
      small.classList.add("suggestion-time");
      small.textContent = new Date(sug.timestamp).toLocaleString();
      li.appendChild(small);

      // (Optional) Delete Button — only for admin use
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌ Delete";
      delBtn.classList.add("btn", "danger", "small");
      delBtn.onclick = () => {
        remove(ref(db, `suggestions/${sug.id}`));
      };
      li.appendChild(delBtn);

      suggestionsList.appendChild(li);
    });
}

// ===============================
// Sync Suggestions in Realtime
// ===============================
onValue(ref(db, "suggestions"), (snapshot) => {
  const data = snapshot.val();
  const allSuggestions = data ? Object.values(data) : [];
  renderSuggestions(allSuggestions);
});

// ===============================
// Handle New Suggestion
// ===============================
suggestionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = suggestionBody.value.trim();
  if (!text) {
    alert("Please write a suggestion before sending.");
    return;
  }

  let imageUrl = "";
  if (suggestImage.files.length > 0) {
    // ✅ Convert image to Data URL
    imageUrl = await toBase64(suggestImage.files[0]);
  }

  const id = Date.now(); // ✅ Use timestamp as unique ID
  const newSuggestion = {
    id,
    text,
    image: imageUrl,
    timestamp: id
  };

  // ✅ Save to Firebase under suggestions/{id}
  await set(ref(db, `suggestions/${id}`), newSuggestion);

  // Reset form
  suggestionBody.value = "";
  suggestImage.value = "";
});







document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear session/local storage if needed
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = "index.html"; // change this to your login page path
  });