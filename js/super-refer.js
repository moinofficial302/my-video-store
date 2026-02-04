/* =====================================================
   🔥 SUPER REFER – FINAL BULLETPROOF VERSION
   undefined bug NEVER AGAIN
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   CODE GENERATOR
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * 26)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + num;
}


/* =====================================================
   MAIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const normalInput = document.getElementById("normalLink");
  const superInput  = document.getElementById("superLink");

  const copyNormal = document.getElementById("copyNormal");
  const copySuper  = document.getElementById("copySuper");

  const unlockBtn  = document.getElementById("unlockBtn");
  const superCard = document.getElementById("superCard");


  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    let data = snap.data();


    /* 🔥 AUTO FIX OLD USERS (MOST IMPORTANT) */

    let changed = false;

    if (!data.normalCode) {
      data.normalCode = generateCode();
      changed = true;
    }

    if (!data.superCode) {
      data.superCode = generateCode();
      changed = true;
    }

    if (data.superUnlocked === undefined) {
      data.superUnlocked = false;
      changed = true;
    }

    if (changed) {
      await updateDoc(userRef, {
        normalCode: data.normalCode,
        superCode: data.superCode,
        superUnlocked: data.superUnlocked
      });
    }


    /* 🔥 SET LINKS */

    normalInput.value =
      location.origin +
      "/login.html?ref=" +
      data.normalCode +
      "&type=normal";

    superInput.value =
      location.origin +
      "/login.html?ref=" +
      data.superCode +
      "&type=super";


    /* 🔥 LOCK UI */

    if (!data.superUnlocked) {
      superCard.classList.add("locked");
      superInput.disabled = true;
      copySuper.disabled = true;
    } else {
      unlockBtn.style.display = "none";
    }
  });



  /* COPY BUTTONS */

  copyNormal.onclick = () => {
    normalInput.select();
    document.execCommand("copy");
    alert("Copied ✅");
  };

  copySuper.onclick = () => {
    superInput.select();
    document.execCommand("copy");
    alert("Copied ✅");
  };

});
