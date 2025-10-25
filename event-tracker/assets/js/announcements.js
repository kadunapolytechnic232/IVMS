/*
// ===============================
// Firebase Initialization
// ===============================
import { db, ref, onValue, update, set } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const announcementList = document.getElementById("announcementList");
  const suggestionList = document.getElementById("suggestionList");
  const suggestionForm = document.getElementById("suggestionForm");
  const searchInput = document.getElementById("searchAnn");
  const filterSelect = document.getElementById("filterLevel");

  // ===============================
  // Current User (from login)
  // ===============================
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "index.html";
    return;
  }

  // Empty arrays
  let announcements = [];
  let suggestions = [];

  // Emoji Map
  const reactionEmojis = {
    like: "👍",
    love: "❤️",
    wow: "😮",
    clap: "👏",
    sad: "😢",
  };

  // Format time
  function formatTime(ms) {
    const diff = Date.now() - ms;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hr ago";
    return `${hours} hrs ago`;
  }

  // ===============================
  // Announcements
  // ===============================
  function renderPost(a, container, withReactions = true) {
    const totalReactions = a.reactions
      ? Object.values(a.reactions).reduce((x, y) => x + y, 0)
      : 0;

    const li = document.createElement("li");
    li.className = "post";
    li.dataset.id = a.id;

    li.innerHTML = `
      <div class="post__header">
        <img src="${a.avatar}" class="post__avatar" alt="${a.author}">
        <div class="post__info">
          <h3>${a.author}</h3>
          <small>${formatTime(a.time)}</small>
        </div>
        <div class="bubble">${
          totalReactions > 0
            ? `
          ${Object.keys(a.reactions)
            .map((r) => reactionEmojis[r])
            .join(" ")}
          <span class="reaction-count">${totalReactions}</span>`
            : ""
        }
        </div>
      </div>
      <div class="post__content">${a.content}</div>
      ${
        a.image
          ? `<div class="post__image"><img src="${a.image}" alt=""></div>`
          : ""
      }
      ${
        withReactions
          ? `
      <div class="post__actions">
        <button class="reaction-btn" data-id="${a.id}">😊 React</button>
      </div>`
          : ""
      }
    `;

    container.appendChild(li);

    // Reaction events
    if (withReactions) {
      li.querySelector(".reaction-btn").addEventListener("click", (e) =>
        openPicker(a.id, e.target)
      );
    }
  }

  function openPicker(postId, btn) {
    document.querySelectorAll(".emoji-picker").forEach((p) => p.remove());
    const picker = document.createElement("div");
    picker.className = "emoji-picker";

    Object.keys(reactionEmojis).forEach((key) => {
      const b = document.createElement("button");
      b.textContent = reactionEmojis[key];
      b.onclick = () => {
        setReaction(postId, key);
        picker.remove();
      };
      picker.appendChild(b);
    });

    btn.parentNode.appendChild(picker);
  }

  function setReaction(postId, type) {
    const post = announcements.find((p) => p.id === postId);
    if (!post) return;

    const current =
      post.reactions && post.reactions[type] ? post.reactions[type] : 0;

    const postRef = ref(db, `announcements/${postId}/reactions`);
    update(postRef, { [type]: current + 1 });
  }

  function renderFeed(withReactions = true, limit = null) {
    if (!announcementList) return;
    announcementList.innerHTML = "";

    let filtered = [...announcements];

    // 🔹 Filter by department (only show user's department or general ones)
    if (currentUser.role !== "admin") {
      filtered = filtered.filter(
        (a) =>
          a.department === "all" ||
          a.department === currentUser.department ||
          a.level === currentUser.role
      );
    }

    // Apply search + filter
    if (filterSelect && filterSelect.value !== "all") {
      filtered = filtered.filter((a) => a.level === filterSelect.value);
    }
    if (searchInput && searchInput.value.trim() !== "") {
      const term = searchInput.value.toLowerCase();
      filtered = filtered.filter((a) =>
        a.content.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => b.time - a.time);

    if (limit) filtered = filtered.slice(0, limit);

    filtered.forEach((a) => renderPost(a, announcementList, withReactions));
  }

  // Listen to announcements
  const annRef = ref(db, "announcements");
  onValue(annRef, (snapshot) => {
    const data = snapshot.val();
    announcements = data ? Object.values(data) : [];
    renderFeed(true);
  });

  if (searchInput) searchInput.addEventListener("input", () => renderFeed(true));
  if (filterSelect)
    filterSelect.addEventListener("change", () => renderFeed(true));

  // ===============================
  // Suggestions
  // ===============================
  function renderSuggestions() {
    if (!suggestionList) return;
    suggestionList.innerHTML = "";

    let mine = suggestions.filter((s) => s.userId === currentUser.id);

    mine.sort((a, b) => b.timestamp - a.timestamp);

    mine.forEach((s) => {
      const li = document.createElement("li");
      li.className = "suggestion";
      li.innerHTML = `
        <p>${s.text}</p>
        ${
          s.image
            ? `<div class="suggestion__image"><img src="${s.image}" alt=""></div>`
            : ""
        }
        <small>${new Date(s.timestamp).toLocaleString()}</small>
      `;
      suggestionList.appendChild(li);
    });
  }

  // Suggestions realtime
  const sugRef = ref(db, "suggestions");
  onValue(sugRef, (snapshot) => {
    const data = snapshot.val();
    suggestions = data ? Object.values(data) : [];
    renderSuggestions();
  });

  // Add new suggestion
  if (suggestionForm) {
    suggestionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("sugText").value.trim();
      if (!text) return;

      const newSug = {
        id: Date.now(),
        userId: currentUser.id,
        text,
        image: "", // you can add image upload later
        timestamp: Date.now(),
      };

      await set(ref(db, "suggestions/" + newSug.id), newSug);
      suggestionForm.reset();
    });
  }
});

*/



























// ===============================
// Firebase Initialization
// ===============================
import { db, ref, onValue, update, set } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const announcementList = document.getElementById("announcementList");
  const suggestionList = document.getElementById("suggestionList");
  const suggestionForm = document.getElementById("suggestionForm");
  const searchInput = document.getElementById("searchAnn");
  const filterSelect = document.getElementById("filterLevel");

  // ===============================
  // Current User (from login)
  // ===============================
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "index.html";
    return;
  }

  // Empty arrays
  let announcements = [];
  let suggestions = [];

  // Emoji Map
  const reactionEmojis = {
    like: "👍",
    love: "❤️",
    wow: "😮",
    clap: "👏",
    sad: "😢",
  };

  // Format time
  function formatTime(ms) {
    const diff = Date.now() - ms;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hr ago";
    return `${hours} hrs ago`;
  }

  // ===============================
  // Announcements
  // ===============================
  function renderPost(a, container, withReactions = true) {
    const totalReactions = a.reactions
      ? Object.values(a.reactions).reduce((x, y) => x + y, 0)
      : 0;

    const li = document.createElement("li");
    li.className = "post";
    li.dataset.id = a.id;

    li.innerHTML = `
      <div class="post__header">
        <img src="${a.avatar}" class="post__avatar" alt="${a.author}">
        <div class="post__info">
          <h3>${a.author}</h3>
          <small>${formatTime(a.time)}</small>
        </div>
        <div class="bubble">
          ${
            totalReactions > 0
              ? `
            ${Object.keys(a.reactions)
              .map((r) => reactionEmojis[r])
              .join(" ")}
            <span class="reaction-count">${totalReactions}</span>`
              : ""
          }
        </div>
      </div>
      <div class="post__content">${a.content}</div>
      ${
        a.image
          ? `<div class="post__image"><img src="${a.image}" class="announcement-img"></div>`
          : ""
      }
      ${
        withReactions
          ? `
      <div class="post__actions">
        <button class="reaction-btn" data-id="${a.id}">😊 React</button>
      </div>`
          : ""
      }
    `;

    container.appendChild(li);

    // Reaction events
    if (withReactions) {
      li.querySelector(".reaction-btn").addEventListener("click", (e) =>
        openPicker(a.id, e.target)
      );
    }
  }

  function openPicker(postId, btn) {
    document.querySelectorAll(".emoji-picker").forEach((p) => p.remove());
    const picker = document.createElement("div");
    picker.className = "emoji-picker";

    Object.keys(reactionEmojis).forEach((key) => {
      const b = document.createElement("button");
      b.textContent = reactionEmojis[key];
      b.onclick = () => {
        setReaction(postId, key);
        picker.remove();
      };
      picker.appendChild(b);
    });

    btn.parentNode.appendChild(picker);
  }

  function setReaction(postId, type) {
    const post = announcements.find((p) => p.id === postId);
    if (!post) return;

    const current =
      post.reactions && post.reactions[type] ? post.reactions[type] : 0;

    const postRef = ref(db, `announcements/${postId}/reactions`);
    update(postRef, { [type]: current + 1 });
  }

  function renderFeed(withReactions = true, limit = null) {
    if (!announcementList) return;
    announcementList.innerHTML = "";

    let filtered = [...announcements];

    // ✅ Show ALL announcements to everyone (school-wide)
    // Students, staff, and admins see all posts

    // 🔹 Still allow filter by "level" (if dropdown is used)
    if (filterSelect && filterSelect.value !== "all") {
      filtered = filtered.filter((a) => a.level === filterSelect.value);
    }

    // 🔹 Still allow keyword search
    if (searchInput && searchInput.value.trim() !== "") {
      const term = searchInput.value.toLowerCase();
      filtered = filtered.filter((a) =>
        a.content.toLowerCase().includes(term)
      );
    }

    // 🔹 Sort by newest first
    filtered.sort((a, b) => b.time - a.time);

    // 🔹 Limit (e.g. dashboard shows only 1 latest post)
    if (limit) filtered = filtered.slice(0, limit);

    filtered.forEach((a) => renderPost(a, announcementList, withReactions));
  }

  // Listen to announcements
  const annRef = ref(db, "announcements");
  onValue(annRef, (snapshot) => {
    const data = snapshot.val();
    announcements = data ? Object.values(data) : [];
    renderFeed(true);
  });

  if (searchInput) searchInput.addEventListener("input", () => renderFeed(true));
  if (filterSelect)
    filterSelect.addEventListener("change", () => renderFeed(true));

 // ===============================
  // Suggestions
  // ===============================
  function renderSuggestions() {
    if (!suggestionList) return;
    suggestionList.innerHTML = "";

    let mine = suggestions.filter((s) => s.userId === currentUser.id);

    mine.sort((a, b) => b.timestamp - a.timestamp);

    mine.forEach((s) => {
      const li = document.createElement("li");
      li.className = "suggestion";
      li.innerHTML = `
        <p>${s.text}</p>
        ${
          s.image
            ? `<div class="suggestion__image"><img src="${s.image}" class="announcement-img"></div>`
            : ""
        }
        <small>${new Date(s.timestamp).toLocaleString()}</small>
      `;
      suggestionList.appendChild(li);
    });
  }

  // Suggestions realtime
  const sugRef = ref(db, "suggestions");
  onValue(sugRef, (snapshot) => {
    const data = snapshot.val();
    suggestions = data ? Object.values(data) : [];
    renderSuggestions();
  });

  // Add new suggestion
  if (suggestionForm) {
    suggestionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("sugText").value.trim();
      if (!text) return;

      const newSug = {
        id: Date.now(),
        userId: currentUser.id,
        text,
        image: "", // optional: image upload
        timestamp: Date.now(),
      };

      await set(ref(db, "suggestions/" + newSug.id), newSug);
      suggestionForm.reset();
    });
  }
});





