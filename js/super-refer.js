
// =======================================
// SUPER REFER & EARN PAGE LOGIC
// FILE: js/super-refer.js
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
    // Login nahi hai to login page par bhejo
    window.location.href = "login.html";
    return;
  }

  // Login hai → Super referral data load karo
  loadSuperReferralData(user.uid);
});

// =======================================
// LOAD SUPER REFERRAL DATA
// =======================================
async function loadSuperReferralData(uid) {
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

    // Super referral link generate
    const superReferralLink =
      window.location.origin +
      "/login.html?ref=" +
      referralCode;

    // Set values
    codeInput.value = referralCode;
    linkInput.value = superReferralLink;

  } catch (error) {
    console.error("Super referral load error:", error);
    alert("Error loading super referral data");
  }
}
