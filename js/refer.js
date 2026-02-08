/* =====================================================
   🚀 REFER PAGE LOGIC (Single Smart Referral)
   Professional • Clean • Future Safe
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
   🔥 RANDOM CODE GENERATOR (A_1234 style)
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + num;
}



/* =====================================================
   MAIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const linkInput = document.getElementById("refLink");
  const copyBtn   = document.getElementById("copyBtn");



  /* =====================================================
     AUTH STATE
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



    /* =====================================================
       🔥 ENSURE REFERRAL CODE (OLD USER FIX)
    ===================================================== */

    let referralCode = data.referralCode;

    if (!referralCode) {
      referralCode = generateCode();

      await updateDoc(userRef, {
        referralCode: referralCode
      });
    }



    /* =====================================================
       🔥 BUILD LINK
    ===================================================== */

    linkInput.value =
      location.origin +
      "/login.html?ref=" +
      referralCode;
  });



  /* =====================================================
     COPY BUTTON
  ===================================================== */

  copyBtn.addEventListener("click", () => {

    linkInput.select();
    document.execCommand("copy");

    alert("Referral link copied ✅");
  });

});
