import { db, auth } from "../../js/firebase-init.js";

import {
collection,
getDocs,
deleteDoc,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById("reviewsList");

/* =========================
🔐 ADMIN SECURITY
========================= */
auth.onAuthStateChanged(user => {
if(!user || user.email !== "moinofficial302@gmail.com"){
alert("Access Denied ❌");
window.location.href = "../index.html";
} else {
loadAdminReviews();
}
});

/* =========================
🔥 LOAD REVIEWS
========================= */
async function loadAdminReviews(){

list.innerHTML = "Loading...";

try{

const snapshot = await getDocs(collection(db, "reviews"));

list.innerHTML = "";

if(snapshot.empty){
  list.innerHTML = "<p>No reviews found 😶</p>";
  return;
}

snapshot.forEach(docSnap => {

  const data = docSnap.data();
  const id = docSnap.id;

  const div = document.createElement("div");
  div.style.padding = "10px";
  div.style.marginBottom = "10px";
  div.style.borderRadius = "10px";
  div.style.background = "#f5f7fb";

  div.innerHTML = `
    <h4>${data.username || "User"} ${data.verified ? "✅" : ""}</h4>
    <p>⭐ ${data.rating}</p>
    <p>${data.feedback}</p>

    <button onclick="deleteReview('${id}')" style="margin-right:10px;">Delete ❌</button>
    <button onclick="editReview('${id}', \`${data.feedback}\`, ${data.rating})">Edit ✏️</button>
  `;

  list.appendChild(div);

});

}catch(err){
console.error(err);
list.innerHTML = "Error loading reviews ❌";
}

}

/* =========================
❌ DELETE REVIEW
========================= */
window.deleteReview = async (id) => {

if(confirm("Delete this review? ❌")){

try{
  await deleteDoc(doc(db, "reviews", id));
  loadAdminReviews();
}catch(err){
  console.error(err);
  alert("Delete failed ❌");
}

}

};

/* =========================
✏️ EDIT REVIEW
========================= */
window.editReview = async (id, oldFeedback, oldRating) => {

const newFeedback = prompt("Edit Feedback:", oldFeedback);
const newRating = prompt("Edit Rating (1-5):", oldRating);

// 🔥 Validation
if(!newFeedback || !newRating){
alert("Invalid input ❌");
return;
}

if(newRating < 1 || newRating > 5){
alert("Rating must be between 1-5 ⭐");
return;
}

try{

await updateDoc(doc(db, "reviews", id), {
  feedback: newFeedback,
  rating: Number(newRating)
});

loadAdminReviews();

}catch(err){
console.error(err);
alert("Update failed ❌");
}

};
