/* =====================================================
   🚀 SUPER REFER SYSTEM – FINAL PRODUCTION VERSION
   Jarvis Clean + Stable + Bug Free
   DELETE OLD FILE → PASTE THIS COMPLETE FILE
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   🔥 CODE GENERATOR  (A_1234 style)
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + num;
}


/* =====================================================
   🔥 ENSURE USER HAS CODES (OLD USER FIX)
===================================================== */

async function ensureCodes(userRef, data) {

  let updateData = {};

  // 🟢 normalCode missing → create
  if (!data.normalCode) {
    updateData.normalCode = generateCode();
  }

  // 🟢 superCode missing → create
  if (!data.superCode) {
    updateData.superCode = generateCode();
  }

  // 🟢 superUnlocked missing → default false
  if (data.superUnlocked === undefined) {
    updateData.superUnlocked = false;
  }

  if (Object.keys(updateData).length > 0) {
    await updateDoc(userRef, updateData);
    return { ...data, ...updateData };
  }

  return data;
}


/* =====================================================
   🔥 MAIN LOGIC
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const normalInput = document.getElementById("normalLink");
  const superInput = document.getElementById("superLink");

  const copyNormal = document.getElementById("copyNormal");
  const copySuper = document.getElementById("copySuper");

  const unlockBtn = document.getElementById("unlockBtn");
  const superCard = document.getElementById("superCard");



  /* =====================================================
     AUTH STATE
  ===================================================== */

  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    let data = snap.data();

    /* 🔥 FIX OLD USERS */
    data = await ensureCodes(userRef, data);

    const coins = data.coins || 0;


    /* =================================================
       NORMAL LINK
    ================================================= */

    normalInput.value =
      location.origin +
      "/login.html?ref=" +
      data.normalCode +
      "&type=normal";


    /* =================================================
       SUPER LINK
    ================================================= */

    superInput.value =
      location.origin +
      "/login.html?ref=" +
      data.superCode +
      "&type=super";


    /* =================================================
       LOCK / UNLOCK
    ================================================= */

    if (!data.superUnlocked) {

      superCard.classList.add("locked");

      superInput.disabled = true;
      copySuper.disabled = true;

    } else {

      unlockBtn.style.display = "none";
    }

  });



  /* =====================================================
     COPY NORMAL
  ===================================================== */

  copyNormal.addEventListener("click", () => {

    normalInput.select();
    document.execCommand("copy");

    alert("Normal link copied ✅");
  });



  /* =====================================================
     COPY SUPER
  ===================================================== */

  copySuper.addEventListener("click", () => {

    superInput.select();
    document.execCommand("copy");

    alert("Super link copied ✅");
  });



  /* =====================================================
     UNLOCK SUPER (99 coins)
  ===================================================== */

  unlockBtn.addEventListener("click", async () => {

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();
    const coins = data.coins || 0;

    if (coins < 99) {
      alert("Need minimum 99 coins to unlock Super Refer");
      return;
    }

    const confirmUnlock = confirm("Spend 99 coins to unlock Super Refer?");
    if (!confirmUnlock) return;

    await updateDoc(userRef, {
      coins: increment(-99),
      superUnlocked: true
    });

    alert("Super Refer unlocked 🚀");

    location.reload();
  });

});
