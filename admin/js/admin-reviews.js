import { db, auth } from "../../js/firebase-init.js";

import {
collection,
getDocs,
deleteDoc,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("reviewsTable");

// 🔐 Admin check
auth.onAuthStateChanged(user => {
if(!user || user.email !== "moinofficial302@gmail.com"){
alert("Access Denied ❌");
return;
}
});

// 🔥 Load Reviews
export async function loadAdminReviews(){

table.innerHTML = "Loading...";

const snapshot = await getDocs(collection(db, "reviews"));

table.innerHTML = "";

snapshot.forEach(docSnap => {

const data = docSnap.data();
const id = docSnap.id;

const tr = document.createElement("tr");

tr.innerHTML = `
  <td>${data.username}</td>
  <td>⭐ ${data.rating}</td>
  <td>${data.feedback}</td>
  <td>
    <button onclick="editReview('${id}', \`${data.feedback}\`, ${data.rating})">✏️</button>
    <button onclick="deleteReview('${id}')">❌</button>
  </td>
`;

table.appendChild(tr);

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

if(!newFeedback || !newRating || newRating < 1 || newRating > 5){
alert("Invalid input ❌");
return;
}

await updateDoc(doc(db, "reviews", id), {
feedback: newFeedback,
rating: Number(newRating)
});

loadAdminReviews();
};

// 🚀 Section open hone par load
document.querySelector('[data-section="reviews"]')
?.addEventListener("click", loadAdminReviews);
