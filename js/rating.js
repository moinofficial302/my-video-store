import { db } from "./firebase-init.js";

import {
collection,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
⭐ STAR SELECTION
========================= */
let selectedRating = 0;

const stars = document.querySelectorAll("#starSelect span");

stars.forEach((star, index) => {
star.addEventListener("click", () => {

selectedRating = index + 1;

// Reset sab stars
stars.forEach(s => s.classList.remove("active"));

// Active stars fill karo
for(let i = 0; i <= index; i++){
  stars[i].classList.add("active");
}

console.log("Selected Rating:", selectedRating);

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
  username: "User", // next chapter me dynamic karenge
  rating: selectedRating,
  feedback: feedback,
  createdAt: serverTimestamp(),
  verified: false
});

alert("Review Submitted ✅");

// Reset form
feedbackInput.value = "";
selectedRating = 0;

stars.forEach(s => s.classList.remove("active"));

}catch(err){
console.error(err);
alert("Error submitting review ❌");
}

});
