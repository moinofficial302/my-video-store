import { db, auth } from "./firebase-init.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   🔔 TOAST — alert() replace
========================= */
function showToast(msg, type = "info", duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");

  // Force reflow for animation restart
  void toast.offsetWidth;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 400);
  }, duration);
}

/* =========================
   ⭐ STAR SELECTION
========================= */
let selectedRating = 0;
const stars = document.querySelectorAll("#starSelect span");

const ratingLabels = ["", "Terrible 😞", "Poor 😕", "Okay 😐", "Good 😊", "Excellent 🤩"];

stars.forEach((star, index) => {

  // Hover effect
  star.addEventListener("mouseenter", () => {
    stars.forEach((s, i) => {
      s.classList.toggle("hover", i <= index);
    });
    document.getElementById("ratingLabel").textContent = ratingLabels[index + 1];
  });

  star.addEventListener("mouseleave", () => {
    stars.forEach(s => s.classList.remove("hover"));
    document.getElementById("ratingLabel").textContent =
      selectedRating ? ratingLabels[selectedRating] : "Tap a star to rate";
  });

  // Click to select
  star.addEventListener("click", () => {
    selectedRating = index + 1;
    stars.forEach((s, i) => {
      s.classList.toggle("active", i <= index);
    });
    document.getElementById("ratingLabel").textContent = ratingLabels[selectedRating];
  });
});

/* =========================
   📝 CHARACTER COUNTER
========================= */
const feedbackInput = document.getElementById("feedback");
const charCount = document.getElementById("charCount");

feedbackInput.addEventListener("input", () => {
  const len = feedbackInput.value.length;
  charCount.textContent = `${len}/300`;
  charCount.style.color = len > 270 ? "#ff4b2b" : "#bbb";
});

/* =========================
   🚀 SUBMIT REVIEW
========================= */
const submitBtn  = document.getElementById("submitReview");
const btnText    = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? "Submitting..." : "Submit Review";
  btnSpinner.classList.toggle("hidden", !loading);
}

submitBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    showToast("Login required ❌", "error");
    return;
  }

  const feedback = feedbackInput.value.trim();

  if (selectedRating === 0) {
    showToast("Please select a star rating ⭐", "warn");
    return;
  }

  if (feedback === "") {
    showToast("Please write your feedback 📝", "warn");
    return;
  }

  setLoading(true);

  try {

    // 🔒 BUG FIX: Duplicate check by UID (not username — more reliable)
    const dupQuery = query(
      collection(db, "reviews"),
      where("uid", "==", user.uid)
    );
    const dupSnap = await getDocs(dupQuery);

    if (!dupSnap.empty) {
      showToast("You already submitted a review ⚠️", "warn");
      setLoading(false);
      return;
    }

    const username = user.displayName || user.email?.split("@")[0] || "Anonymous";

    // ✅ Save review with uid field
    await addDoc(collection(db, "reviews"), {
      uid:       user.uid,
      username:  username,
      rating:    selectedRating,
      feedback:  feedback,
      createdAt: serverTimestamp(),
      verified:  true,
      likes:     0
    });

    showToast("Review Submitted! Thank you 🎉", "success");

    // Reset form
    feedbackInput.value = "";
    charCount.textContent = "0/300";
    selectedRating = 0;
    stars.forEach(s => s.classList.remove("active", "hover"));
    document.getElementById("ratingLabel").textContent = "Tap a star to rate";

    loadReviews();

  } catch (err) {
    console.error(err);
    showToast("Error submitting review ❌", "error");
  } finally {
    setLoading(false);
  }
});

/* =========================
   📥 LOAD REVIEWS + 📊 CALCULATION
========================= */
const reviewsContainer = document.getElementById("reviewsContainer");

// BUG FIX: Sort filter now connected + search filter added
let allReviews = [];

document.getElementById("sort").addEventListener("change", renderReviews);
document.getElementById("searchInput").addEventListener("input", renderReviews);

function getTimeAgo(date) {
  if (!date) return "Just now";
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 1)    return "Just now";
  if (diff < 60)   return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function renderReviews() {
  const sortVal   = document.getElementById("sort").value;
  const searchVal = document.getElementById("searchInput").value.trim().toLowerCase();

  let list = [...allReviews];

  // 🔍 Search filter
  if (searchVal) {
    list = list.filter(r =>
      r.username.toLowerCase().includes(searchVal) ||
      r.feedback.toLowerCase().includes(searchVal)
    );
  }

  // 📊 Sort — BUG FIX: sort filter now works
  if (sortVal === "top")    list.sort((a, b) => b.rating - a.rating || b.ts - a.ts);
  if (sortVal === "lowest") list.sort((a, b) => a.rating - b.rating || b.ts - a.ts);
  if (sortVal === "latest") list.sort((a, b) => b.ts - a.ts);

  reviewsContainer.innerHTML = "";

  if (list.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">😶</span>
        ${searchVal ? "No matching reviews found." : "No reviews yet. Be the first!"}
      </div>`;
    return;
  }

  list.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("review-card");

    div.innerHTML = `
      <div class="review-header">
        <div class="review-avatar">${getInitials(r.username)}</div>
        <div class="review-meta">
          <h4>${r.username} ${r.verified ? "✅" : ""}</h4>
          <small>${r.timeText}</small>
        </div>
      </div>
      <div class="review-stars">${"⭐".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="review-text">${r.feedback}</p>
      <div class="review-footer">
        <button class="like-btn" data-id="${r.id}">
          👍 Helpful <span class="like-count">${r.likes || 0}</span>
        </button>
        <small style="font-size:11px;color:#ccc;">${r.rating}/5</small>
      </div>
    `;

    reviewsContainer.appendChild(div);
  });

  // 👍 Like button logic
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const likedKey = `liked_${id}`;

      if (localStorage.getItem(likedKey)) {
        showToast("Already marked as helpful 👍", "info");
        return;
      }

      try {
        await updateDoc(doc(db, "reviews", id), { likes: increment(1) });
        localStorage.setItem(likedKey, "1");
        btn.classList.add("liked");
        const cnt = btn.querySelector(".like-count");
        cnt.textContent = parseInt(cnt.textContent) + 1;
        showToast("Marked as helpful! 🙌", "success");
      } catch (e) {
        console.error(e);
      }
    });
  });
}

async function loadReviews() {

  // Show skeletons while loading
  reviewsContainer.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  try {

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    allReviews = [];

    if (snapshot.empty) {
      document.getElementById("avgRating").textContent   = "0";
      document.getElementById("totalReviews").textContent = "No reviews yet";
      document.getElementById("stars").textContent        = "☆☆☆☆☆";
      reviewsContainer.innerHTML = `<div class="empty-state"><span class="empty-icon">😶</span>No reviews yet. Be the first!</div>`;
      return;
    }

    let total = 0, count = 0;
    const starCount = { 1:0, 2:0, 3:0, 4:0, 5:0 };

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const time = data.createdAt?.toDate();
      const ts   = time ? time.getTime() : 0;

      total += data.rating;
      count++;
      starCount[data.rating] = (starCount[data.rating] || 0) + 1;

      allReviews.push({
        id:       docSnap.id,
        username: data.username || "Anonymous",
        rating:   data.rating,
        feedback: data.feedback,
        verified: data.verified,
        likes:    data.likes || 0,
        timeText: getTimeAgo(time),
        ts:       ts
      });

      // Mark already-liked reviews
      if (localStorage.getItem(`liked_${docSnap.id}`)) {
        // will be applied after render
      }
    });

    const avg = (total / count).toFixed(1);

    document.getElementById("avgRating").textContent   = avg;
    document.getElementById("totalReviews").textContent = `${count} review${count !== 1 ? "s" : ""}`;

    // Star display based on avg
    const fullStars  = Math.round(parseFloat(avg));
    document.getElementById("stars").textContent =
      "⭐".repeat(fullStars) + "☆".repeat(5 - fullStars);

    // BUG FIX: Progress bars now have correct IDs (bar1–bar5) in HTML
    for (let i = 1; i <= 5; i++) {
      const percent = count > 0 ? (starCount[i] / count) * 100 : 0;
      const bar = document.getElementById("bar" + i);
      const cnt = document.getElementById("cnt" + i);
      if (bar) bar.style.width = percent.toFixed(1) + "%";
      if (cnt) cnt.textContent = starCount[i];
    }

    renderReviews();

    // Re-apply liked state after render
    document.querySelectorAll(".like-btn").forEach(btn => {
      if (localStorage.getItem(`liked_${btn.dataset.id}`)) {
        btn.classList.add("liked");
      }
    });

  } catch (err) {
    console.error(err);
    reviewsContainer.innerHTML = `<div class="empty-state"><span class="empty-icon">❌</span>Error loading reviews. Please try again.</div>`;
  }
}

/* =========================
   🚀 INIT
========================= */
loadReviews();
