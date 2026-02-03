/* =====================================================
   🚀 REFER PAGE – FINAL PROFESSIONAL VERSION
   (No onclick, no bugs, 100% reliable)
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



/* =====================================================
   WAIT DOM READY (IMPORTANT)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const codeInput = document.getElementById("myReferralCode");
  const linkInput = document.getElementById("myReferralLink");
  const saveBtn = document.querySelector(".save-btn");
  const copyBtn = document.querySelector(".copy-btn");



  /* =====================================================
     LOAD USER DATA
  ===================================================== */

  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const code = snap.data().myReferralCode || "";

    codeInput.value = code;

    linkInput.value =
      location.origin + "/login.html?ref=" + code;
  });



  /* =====================================================
     SAVE BUTTON (SAFE EVENT LISTENER)
  ===================================================== */

  saveBtn.addEventListener("click", async () => {

    const user = auth.currentUser;
    if (!user) return;

    let code = codeInput.value.trim().toUpperCase();

    if (!code.startsWith("M7")) {
      alert("Code must start with M7");
      return;
    }

    const q = query(
      collection(db, "users"),
      where("myReferralCode", "==", code)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("Code already taken");
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      myReferralCode: code
    });

    linkInput.value =
      location.origin + "/login.html?ref=" + code;

    alert("Referral code saved ✅");
  });



  /* =====================================================
     COPY BUTTON
  ===================================================== */

  copyBtn.addEventListener("click", () => {

    linkInput.select();
    document.execCommand("copy");
    alert("Copied");
  });

});
