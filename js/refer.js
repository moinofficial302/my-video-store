// =======================================
// REFER & EARN PAGE LOGIC
// FILE: js/refer.js
// =======================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================================
// AUTH CHECK
// =======================================
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // Login nahi hai to login page par bhej do
    window.location.href = "login.html";
    return;
  }

  // Login hai to referral data load karo
  loadReferralData(user.uid);
});

// =======================================
// LOAD REFERRAL DATA
// =======================================
async function loadReferralData(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User data not found");
      return;
    }

    const userData = userSnap.data();

    // DOM elements
    const codeInput = document.getElementById("myReferralCode");
    const linkInput = document.getElementById("myReferralLink");

    // Safety check
    if (!codeInput || !linkInput) return;

    const referralCode = userData.myReferralCode;

    // Referral link generate
    const referralLink =
      window.location.origin +
      "/login.html?ref=" +
      referralCode;

    // Set values
    codeInput.value = referralCode;
    linkInput.value = referralLink;

  } catch (error) {
    console.error("Referral load error:", error);
    alert("Error loading referral data");
  }
}
