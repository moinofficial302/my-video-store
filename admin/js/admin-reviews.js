import { db } from "../../js/firebase-init.js";

import {
collection,
getDocs,
deleteDoc,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById("reviewsList");

// 🔥 Load Reviews
async function loadAdminReviews(){

list.innerHTML = "Loading...";

const snapshot = await getDocs(collection(db, "reviews"));

list.innerHTML = "";

snapshot.forEach(docSnap => {

const data = docSnap.data();
const id = docSnap.id;

const div = document.createElement("div");

div.innerHTML = `
  <hr>
  <h4>${data.username}</h4>
  <p>⭐ ${data.rating}</p>
  <p>${data.feedback}</p>

  <button onclick="deleteReview('${id}')">Delete ❌</button>
  <button onclick="editReview('${id}', '${data.feedback}', ${data.rating})">Edit ✏️</button>
`;

list.appendChild(div);

});
}

// ❌ Delete
window.deleteReview = async (id) => {
if(confirm("Delete this review?")){
await deleteDoc(doc(db, "reviews", id));
loadAdminReviews();
}
};

// ✏️ Edit
window.editReview = async (id, oldFeedback, oldRating) => {

const newFeedback = prompt("Edit Feedback:", oldFeedback);
const newRating = prompt("Edit Rating (1-5):", oldRating);

if(!newFeedback || !newRating) return;

await updateDoc(doc(db, "reviews", id), {
feedback: newFeedback,
rating: Number(newRating)
});

loadAdminReviews();
};

// INIT
loadAdminReviews();
