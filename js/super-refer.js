/* =====================================================
   🔥 SUPER REFER – DEFINITIVE FINAL FIX
   Never undefined again
===================================================== */

import { auth, db } from "./firebase-init.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   GENERATE RANDOM CODE
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
  const superCard  = document.getElementById("superCard");


  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    /* ===============================
       IF USER DOC MISSING (safety)
    =============================== */
    if (!snap.exists()) {
      await setDoc(userRef, {
        coins: 0,
        referralBalance: 0,
        normalCode: generateCode(),
        superCode: generateCode(),
        superUnlocked: false
      });
    }

    let data = (await getDoc(userRef)).data();


    /* ===============================
       FORCE CREATE CODES (IMPORTANT)
    =============================== */
    let normalCode = data.normalCode || generateCode();
    let superCode  = data.superCode  || generateCode();
    let unlocked   = data.superUnlocked ?? false;

    await updateDoc(userRef, {
      normalCode,
      superCode,
      superUnlocked: unlocked
    });


    /* ===============================
       SET LINKS
    =============================== */
    normalInput.value =
      location.origin + "/login.html?ref=" + normalCode + "&type=normal";

    superInput.value =
      location.origin + "/login.html?ref=" + superCode + "&type=super";


    /* ===============================
       LOCK UI
    =============================== */
    if (!unlocked) {
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
