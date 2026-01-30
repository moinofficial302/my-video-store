import { auth, db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   SUBMIT REQUEST
================================ */
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  const utr = document.getElementById("utr").value;
  const paymentApp = document.getElementById("paymentApp").value;

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    return;
  }

  if (!amount || amount < 20) {
    alert("Minimum amount ₹20");
    return;
  }

  if (!utr || utr.length < 6) {
    alert("Enter valid Transaction / UTR ID");
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


/* ===============================
   PAYMENT APP BOTTOM SHEET
================================ */
const openPayment = document.getElementById("openPaymentSheet");
const sheet = document.getElementById("paymentSheet");
const selectedText = document.getElementById("selectedApp");
const hiddenInput = document.getElementById("paymentApp");
const items = document.querySelectorAll(".sheet-item");

openPayment.addEventListener("click", () => {
  sheet.classList.add("active");
  document.body.classList.add("sheet-open");
});

items.forEach(item => {
  item.addEventListener("click", () => {
    const app = item.dataset.app;

    selectedText.innerText = app;
    hiddenInput.value = app;

    items.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    sheet.classList.remove("active");
    document.body.classList.remove("sheet-open");
  });
});

// close on background click
sheet.addEventListener("click", (e) => {
  if (e.target === sheet) {
    sheet.classList.remove("active");
    document.body.classList.remove("sheet-open");
  }
});
