/* =====================================================
   🔥 REFER PAGE FULL FIXED (PRODUCTION SAFE)
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
   LOAD USER DATA
===================================================== */

auth.onAuthStateChanged(async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) {
    alert("User data not found");
    return;
  }

  const data = snap.data();

  const codeInput = document.getElementById("myReferralCode");
  const linkInput = document.getElementById("myReferralLink");

  const code = data.myReferralCode || "";

  /* 🔥 SET VALUES */
  codeInput.value = code;

  linkInput.value =
    location.origin + "/login.html?ref=" + code;

});



/* =====================================================
   SAVE CUSTOM CODE (GLOBAL FOR BUTTON)
===================================================== */

window.saveReferralCode = async function () {

  const user = auth.currentUser;
  if (!user) return;

  const codeInput = document.getElementById("myReferralCode");
  const linkInput = document.getElementById("myReferralLink");

  let code = codeInput.value.trim().toUpperCase();

  if (!code.startsWith("M7")) {
    alert("Code must start with M7");
    return;
  }

  /* 🔥 CHECK DUPLICATE */
  const q = query(
    collection(db, "users"),
    where("myReferralCode", "==", code)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    alert("Code already taken");
    return;
  }

  /* 🔥 SAVE */
  await updateDoc(doc(db, "users", user.uid), {
    myReferralCode: code
  });

  /* 🔥 INSTANT UPDATE LINK */
  linkInput.value =
    location.origin + "/login.html?ref=" + code;

  alert("Referral code saved ✅");
};




/* =====================================================
   COPY HELPERS
===================================================== */

window.copyCode = function () {
  const el = document.getElementById("myReferralCode");
  el.select();
  document.execCommand("copy");
  alert("Copied");
};

window.copyLink = function () {
  const el = document.getElementById("myReferralLink");
  el.select();
  document.execCommand("copy");
  alert("Copied");
};
