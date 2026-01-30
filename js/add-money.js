import { auth, db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", async () => {
  const paymentApp = document.getElementById("paymentApp").value;
  const amount = document.getElementById("amount").value;
  const utr = document.getElementById("utr").value;

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    return;
  }

  if (!amount || amount < 50) {
    alert("Minimum amount ₹20");
    return;
  }

  if (!utr || utr.length < 6) {
    alert("Enter valid transaction / UTR ID");
    return;
  }

  try {
    await addDoc(collection(db, "add_money_requests"), {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,

      amount: Number(amount),
      utr: utr.trim(),
      paymentApp: paymentApp,

      status: "pending",
      createdAt: serverTimestamp(),
      approvedAt: null,
      rejectedReason: null
    });

    alert("Request submitted successfully");
    window.location.href = "account.html";

  } catch (error) {
    alert(error.message);
  }
});
