import { db } from "./firebase-init.js";

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

await addDoc(collection(db, "reviews"), {
  username: "User",
  rating: selectedRating,
  feedback: feedback,
  createdAt: serverTimestamp(),
  verified: false
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

// 📊 Calculation variables
let total = 0;
let count = 0;

let starCount = {
  1:0, 2:0, 3:0, 4:0, 5:0
};

snapshot.forEach(doc => {
  const data = doc.data();

  // Calculation
  total += data.rating;
  count++;
  starCount[data.rating]++;

  // UI render
  const div = document.createElement("div");
  div.classList.add("review-card");

  div.innerHTML = `
    <h4>${data.username} ${data.verified ? "✅" : ""}</h4>
    <div>${"⭐".repeat(data.rating)}</div>
    <p>${data.feedback}</p>
    <small>Just now</small>
  `;

  reviewsContainer.appendChild(div);
});

// 📊 Update UI
const avg = (total / count).toFixed(1);

document.getElementById("avgRating").innerText = avg;
document.getElementById("totalReviews").innerText = count + " reviews";

// Bars update
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
