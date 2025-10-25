// ===============================
// Firebase Initialization
// ===============================
import { app, db, ref, set, remove, onValue } from "./firebase.js";

// ===============================
// Elements
// ===============================
const form = document.getElementById("adminAnnouncementForm");
const announcementList = document.createElement("ul");
announcementList.classList.add("list");
form.insertAdjacentElement("afterend", announcementList);

const suggestionsList = document.getElementById("adminSuggestionsList");

// ===============================
// State
// ===============================
let announcements = [];
let suggestions = [];

// ✅ Reaction emoji set (same as students)
const reactionEmojis = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  clap: "👏",
  sad: "😢"
};

// ===============================
// Utils
// ===============================
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // ✅ Data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===============================
// Render Announcements
// ===============================
function renderAnnouncements() {
  announcementList.innerHTML = "";
  announcements.forEach((a) => {
    const li = document.createElement("li");
    li.classList.add("card");

    li.innerHTML = `
      <div class="announcement-header">
        <img src="${a.avatar}" alt="avatar" class="post__avatar">
        <div>
          <strong>${a.author}</strong>  <em>${a.level}</em><br>
          <small>${timeAgo(a.time)}</small>
        </div>
      </div>
      <p>${a.content}</p>
      ${a.image ? `<img src="${a.image}" alt="attachment" class="announcement-img">` : ""}
      <div class="announcement-footer">
        ${Object.keys(reactionEmojis)
          .map(r => `<span>${reactionEmojis[r]} ${a.reactions[r] || 0}</span>`)
          .join(" ")}
      </div>
      <button class="btn danger small" data-id="${a.id}">Delete</button>
    `;

    announcementList.appendChild(li);

    // Delete
    li.querySelector("button").addEventListener("click", () => {
      remove(ref(db, `announcements/${a.id}`));
    });
  });
}

// ===============================
// Render Suggestions (from students)
// ===============================
function renderSuggestions() {
  suggestionsList.innerHTML = "";
  suggestions
    .sort((a, b) => b.timestamp - a.timestamp) // newest first
    .forEach((s) => {
      const li = document.createElement("li");
      li.classList.add("card");

      li.innerHTML = `
        <p>${s.text}</p>
        ${s.image ? `<img src="${s.image}" alt="suggestion" class="suggestion-img">` : ""}
        <small>${new Date(s.timestamp).toLocaleString()}</small><br>
        <button class="btn small danger" data-id="${s.id}">Remove</button>
      `;

      suggestionsList.appendChild(li);

      // Delete
      li.querySelector("button").addEventListener("click", () => {
        remove(ref(db, `suggestions/${s.id}`));
      });
    });
}

// ===============================
// Realtime Sync (Announcements & Suggestions)
// ===============================
onValue(ref(db, "announcements"), (snapshot) => {
  announcements = snapshot.val() ? Object.values(snapshot.val()) : [];
  renderAnnouncements();
});

onValue(ref(db, "suggestions"), (snapshot) => {
  suggestions = snapshot.val() ? Object.values(snapshot.val()) : [];
  renderSuggestions();
});

// ===============================
// Handle New Announcement (Admin Only)
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const content = document.getElementById("aBody").value.trim();
  const author = document.getElementById("aAuthor").value.trim() || "Admin";
  const level = document.getElementById("aLevel").value;
  const fileInput = document.getElementById("aImage");

  let imageUrl = "";
  if (fileInput.files && fileInput.files[0]) {
    imageUrl = await toBase64(fileInput.files[0]); // ✅ Data URL
  }

  const newAnnouncement = {
    id: Date.now(),
    level,
    author,
    avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
    time: Date.now(),
    content,
    image: imageUrl,
    reactions: { like: 0, love: 0, wow: 0, clap: 0, sad: 0 }
  };

  await set(ref(db, `announcements/${newAnnouncement.id}`), newAnnouncement);

  form.reset();
});









