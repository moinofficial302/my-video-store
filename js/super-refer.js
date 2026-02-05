/* =====================================================
   🚀 SUPER REFER SYSTEM – FINAL WORKING VERSION
   Jarvis Stable Build ❤️
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
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
   MAIN LOGIC
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const normalInput = document.getElementById("normalLink");
  const superInput = document.getElementById("superLink");

  const copyNormal = document.getElementById("copyNormal");
  const copySuper = document.getElementById("copySuper");

  const unlockBtn = document.getElementById("unlockBtn");
  const superCard = document.getElementById("superCard");


  /* ===============================
     AUTH LISTENER (MAIN FIX)
  =============================== */

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    let data = snap.data();

    let updates = {};

    if (!data.normalCode) updates.normalCode = generateCode();
    if (!data.superCode) updates.superCode = generateCode();
    if (data.superUnlocked === undefined) updates.superUnlocked = false;

    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
      data = { ...data, ...updates };
    }


    /* ===============================
       SET LINKS (FINAL)
    =============================== */

    normalInput.value =
      location.origin + "/login.html?ref=" + data.normalCode + "&type=normal";

    superInput.value =
      location.origin + "/login.html?ref=" + data.superCode + "&type=super";


    /* ===============================
       LOCK UI
    =============================== */

    if (!data.superUnlocked) {
      superInput.disabled = true;
      copySuper.disabled = true;
      superCard.classList.add("locked");
    } else {
      unlockBtn.style.display = "none";
    }
  });


  /* ===============================
     COPY
  =============================== */

  copyNormal.onclick = () => {
    normalInput.select();
    document.execCommand("copy");
    alert("Normal link copied ✅");
  };

  copySuper.onclick = () => {
    superInput.select();
    document.execCommand("copy");
    alert("Super link copied ✅");
  };


  /* ===============================
     UNLOCK
  =============================== */

  unlockBtn.onclick = async () => {

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    const coins = snap.data().coins || 0;

    if (coins < 99) {
      alert("Need 99 coins");
      return;
    }

    await updateDoc(userRef, {
      coins: increment(-99),
      superUnlocked: true
    });

    alert("Unlocked 🚀");
    location.reload();
  };

});
