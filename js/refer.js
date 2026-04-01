/* =====================================================
   🚀 REFER SYSTEM – FINAL PRO VERSION
   ✔ Unique Code (no duplicate)
   ✔ Clipboard fallback
   ✔ v9 Firebase correct
   ✔ Conversion optimized link
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
   RANDOM CODE GENERATOR
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}


/* =====================================================
   UNIQUE CODE CHECK (NO DUPLICATE)
===================================================== */

async function generateUniqueCode() {
  let code;
  let exists = true;

  while (exists) {
    code = generateCode();

    const q = query(
      collection(db, "users"),
      where("referralCode", "==", code)
    );

    const snap = await getDocs(q);

    exists = !snap.empty;
  }

  return code;
}


/* =====================================================
   MAIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const linkInput = document.getElementById("refLink");
  const copyBtn   = document.getElementById("copyBtn");

  copyBtn.disabled = true;


  /* ================= AUTH ================= */

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


    /* 🔥 CREATE CODE IF NOT EXISTS */
    if (!referralCode) {
      referralCode = await generateUniqueCode();
      await updateDoc(userRef, { referralCode });
    }


    /* 🔥 HIGH CONVERSION LINK */
    const link =
      location.origin + "/index.html?ref=" + referralCode;


    /* SET VALUE */
    linkInput.value = link;

    /* ENABLE COPY */
    copyBtn.disabled = false;
  });



  /* ================= COPY ================= */

  copyBtn.addEventListener("click", async () => {

    const value = linkInput.value;

    if (!value || value === "Loading...") {
      alert("Link still loading... wait 1 sec");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      linkInput.select();
      document.execCommand("copy");
    }

    alert("Referral link copied ✅");
  });

});
