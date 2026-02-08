/* =====================================================
   🚀 REFER PAGE LOGIC – FINAL FIXED
   No Loading copy bug • Production Safe
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   RANDOM CODE
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}



/* =====================================================
   MAIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const linkInput = document.getElementById("refLink");
  const copyBtn   = document.getElementById("copyBtn");

  /* 🔥 disable until loaded */
  copyBtn.disabled = true;



  /* =====================================================
     AUTH
  ===================================================== */

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    let data = snap.data();

    let referralCode = data.referralCode;

    /* 🔥 create if missing */
    if (!referralCode) {
      referralCode = generateCode();
      await updateDoc(userRef, { referralCode });
    }

    const link =
      location.origin + "/login.html?ref=" + referralCode;

    /* ✅ set value */
    linkInput.value = link;

    /* ✅ enable copy */
    copyBtn.disabled = false;
  });



  /* =====================================================
     COPY
  ===================================================== */

  copyBtn.addEventListener("click", async () => {

    const value = linkInput.value;

    if (!value || value === "Loading...") {
      alert("Link still loading... wait 1 sec");
      return;
    }

    /* modern clipboard */
    await navigator.clipboard.writeText(value);

    alert("Referral link copied ✅");
  });

});
