import { db, auth } from "./firebase-init.js";

import {
collection,
addDoc,
serverTimestamp,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
⭐ STAR SELECTION
========================= */
let selectedRating = 0;

const stars = document.querySelectorAll("#starSelect span");

stars.forEach((star, index) => {
star.addEventListener("click", () => {

selectedRating = index + 1;

stars.forEach(s => s.classList.remove("active"));

for(let i = 0; i <= index; i++){
  stars[i].classList.add("active");
}

});
});

/* =========================
🚀 SUBMIT REVIEW
========================= */
const submitBtn = document.getElementById("submitReview");

submitBtn.addEventListener("click", async () => {

const user = auth.currentUser;

if(!user){
alert("Login required ❌");
return;
}

const username = user.displayName || user.email || "User";

const feedbackInput = document.getElementById("feedback");
const feedback = feedbackInput.value.trim();

if(selectedRating === 0){
alert("Please select rating ⭐");
return;
}

if(feedback === ""){
alert("Please write feedback 📝");
return;
}

try{

// 🚫 Duplicate review check
const qCheck = query(collection(db, "reviews"));
const snap = await getDocs(qCheck);

let alreadyReviewed = false;

snap.forEach(doc => {
  if(doc.data().username === username){
    alreadyReviewed = true;
  }
});

if(alreadyReviewed){
  alert("You already submitted review ⚠️");
  return;
}

// ✅ Save review
await addDoc(collection(db, "reviews"), {
  username: username,
  rating: selectedRating,
  feedback: feedback,
  createdAt: serverTimestamp(),
  verified: true
});

alert("Review Submitted ✅");

feedbackInput.value = "";
selectedRating = 0;
stars.forEach(s => s.classList.remove("active"));

loadReviews();

}catch(err){
console.error(err);
alert("Error submitting review ❌");
}

});

/* =========================
📥 LOAD REVIEWS + 📊 CALCULATION
========================= */
const reviewsContainer = document.getElementById("reviewsContainer");

async function loadReviews(){

reviewsContainer.innerHTML = "Loading...";

try{

const q = query(
  collection(db, "reviews"),
  orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);

reviewsContainer.innerHTML = "";

if(snapshot.empty){
  document.getElementById("avgRating").innerText = "0";
  document.getElementById("totalReviews").innerText = "0 reviews";
  reviewsContainer.innerHTML = "<p>No reviews yet 😶</p>";
  return;
}

let total = 0;
let count = 0;

let starCount = {
  1:0, 2:0, 3:0, 4:0, 5:0
};

snapshot.forEach(doc => {
  const data = doc.data();

  total += data.rating;
  count++;
  starCount[data.rating]++;

  // 🕒 Time ago logic
  const time = data.createdAt?.toDate();

  let timeText = "Just now";

  if(time){
    const diff = Math.floor((Date.now() - time) / 60000);

    if(diff < 1) timeText = "Just now";
    else if(diff < 60) timeText = diff + " min ago";
    else if(diff < 1440) timeText = Math.floor(diff/60) + " hr ago";
    else timeText = Math.floor(diff/1440) + " days ago";
  }

  const div = document.createElement("div");
  div.classList.add("review-card");

  div.innerHTML = `
    <h4>${data.username} ${data.verified ? "✅" : ""}</h4>
    <div>${"⭐".repeat(data.rating)}</div>
    <p>${data.feedback}</p>
    <small>${timeText}</small>
  `;

  reviewsContainer.appendChild(div);
});

const avg = (total / count).toFixed(1);

document.getElementById("avgRating").innerText = avg;
document.getElementById("totalReviews").innerText = count + " reviews";

for(let i=1; i<=5; i++){
  const percent = (starCount[i] / count) * 100;
  const bar = document.getElementById("bar"+i);
  if(bar){
    bar.style.width = percent + "%";
  }
}

}catch(err){
console.error(err);
reviewsContainer.innerHTML = "Error loading reviews ❌";
}

}

/* =========================
🚀 INIT
========================= */
loadReviews();
