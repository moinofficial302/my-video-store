import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("withdrawTable");

async function loadWithdrawals() {

  // ⭐ FIXED NAME HERE
  const ref = collection(db, "withdraw_requests");

  const q = query(ref, where("status", "==", "pending"));
  const snap = await getDocs(q);

  tableBody.innerHTML = "";

  snap.forEach(d => {

    const data = d.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.uid}</td>
      <td>₹${data.amount}</td>
      <td>${data.upi}</td>
      <td style="color:orange">Pending</td>
      <td>
        <button onclick="approve('${d.id}')">Approve</button>
        <button onclick="reject('${d.id}','${data.uid}',${data.amount})">Reject</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

window.approve = async function(id) {

  await updateDoc(doc(db, "withdraw_requests", id), {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  alert("Approved ✅");
  loadWithdrawals();
}

window.reject = async function(id, uid, amount) {

  await updateDoc(doc(db, "users", uid), {
    referralBalance: increment(amount)
  });

  await updateDoc(doc(db, "withdraw_requests", id), {
    status: "rejected",
    rejectedAt: serverTimestamp()
  });

  alert("Rejected + refunded ✅");
  loadWithdrawals();
}

loadWithdrawals();
