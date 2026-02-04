/* =====================================================
   🚀 SUPER REFER SYSTEM – FINAL PROFESSIONAL LOGIC
   Chapter 2
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const normalInput = document.getElementById("normalLink");
  const superInput = document.getElementById("superLink");

  const copyNormal = document.getElementById("copyNormal");
  const copySuper = document.getElementById("copySuper");

  const unlockBtn = document.getElementById("unlockBtn");
  const superCard = document.getElementById("superCard");



  /* =====================================================
     AUTH CHECK + LOAD USER
  ===================================================== */

  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const data = snap.data();

    const normalCode = data.normalCode;
    const superCode = data.superCode;
    const unlocked = data.superUnlocked;
    const coins = data.coins || 0;


    /* ===============================
       SET NORMAL LINK
    =============================== */

    normalInput.value =
      location.origin + "/login.html?ref=" + normalCode + "&type=normal";


    /* ===============================
       SET SUPER LINK
    =============================== */

    superInput.value =
      location.origin + "/login.html?ref=" + superCode + "&type=super";


    /* ===============================
       LOCK / UNLOCK UI
    =============================== */

    if (!unlocked) {
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
     UNLOCK SUPER LINK
  ===================================================== */

  unlockBtn.addEventListener("click", async () => {

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    const data = snap.data();

    const coins = data.coins || 0;

    if (coins < 99) {
      alert("Need minimum 99 coins to unlock Super Refer");
      return;
    }

    const confirmUnlock = confirm("Spend 99 coins to unlock Super Refer?");

    if (!confirmUnlock) return;

    /* 🔥 DEDUCT COINS + UNLOCK */

    await updateDoc(ref, {
      coins: increment(-99),
      superUnlocked: true
    });

    alert("Super Refer unlocked 🚀");

    location.reload();
  });

});
