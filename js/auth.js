
/* =====================================================
   🚀 AKANS AUTH SYSTEM
   FINAL • CLEAN • POPUP SAFE • PRODUCTION READY
   Jarvis Ultimate Build 💛
===================================================== */


/* ===============================
   FIREBASE
=============================== */

import { auth, db } from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
   updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



/* =====================================================
   🔥 RANDOM REFERRAL CODE
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}



/* =====================================================
   🔥 REF FROM URL
===================================================== */

function getReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}



/* =====================================================
   🟢 SIGNUP
===================================================== */

window.signupUser = async function () {
  try {

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const whatsapp = document.getElementById("signup-whatsapp").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirmPassword").value;

    if (!username || !email || !password)
      return alert("Fill all fields");

    if (password !== confirm)
      return alert("Passwords not match");

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const referredBy = getReferralFromUrl();

    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      whatsapp,

      coins: 0,
      referralBalance: 0,
       
      signupBonusGiven: false,
       
      referralCode: generateCode(),
      addMoneyTotal: 0,
      refCount: 0,
      referredBy: referredBy || null,

      createdAt: serverTimestamp()
    });

// ⭐ referral signup bonus
if (referredBy) {
  await giveReferralSignupBonus(cred.user, referredBy);
}

     
    window.location.replace("index.html");

  } catch (e) {
    alert(e.message);
  }
};



/* =====================================================
   🔵 LOGIN
===================================================== */

window.loginUser = async function () {
  try {

    let identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;

    let email = identifier;

    /* username → email */
    if (!identifier.includes("@")) {

      const q = query(
        collection(db, "users"),
        where("username", "==", identifier)
      );

      const snap = await getDocs(q);

      if (snap.empty)
        return alert("Username not found");

      email = snap.docs[0].data().email;
    }

    await signInWithEmailAndPassword(auth, email, password);

    window.location.replace("index.html");

  } catch (e) {
    alert(e.message);
  }
};



/* =====================================================
   🔴 GOOGLE LOGIN (POPUP SAFE)
===================================================== */

window.googleLogin = async function () {
  try {

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {

      const referredBy = getReferralFromUrl();

      await setDoc(userRef, {
        username: user.displayName || "User",
        email: user.email,
        whatsapp: "",

        coins: 0,
        referralBalance: 0,

        referralCode: generateCode(),
        coinsSpent: 0,
        refCount: 0,
        referredBy: referredBy || null,

        createdAt: serverTimestamp()
      });
    }

    window.location.replace("index.html");

  } catch (e) {
    alert(e.message);
  }
};



/* =====================================================
   🔵 AUTH STATE (wallet load)
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const data = snap.data();

  const coinsEl = document.getElementById("coinBalance");
  const refEl = document.getElementById("referralBalance");



   
coinsEl.textContent = (data.coins || 0);
refEl.textContent = (data.referralBalance || 0);
   
/* =====================================================
   🔐 PAGE GUARD
===================================================== */

window.requireLogin = function () {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.replace("login.html");
  });
};



/* =====================================================
   🚪 LOGOUT
===================================================== */

window.logoutUser = async function () {
  await signOut(auth);
  window.location.replace("login.html");
};



/* =====================================================
   🔗 AUTO FILL REFERRAL INPUT (FIXED + SAFE)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const ref = getReferralFromUrl();

  if (!ref) return;   // ✅ FIXED (was eeturn)

  const input = document.querySelector("#refInput"); // ✅ correct id

  if (input) {
    input.value = ref;
    input.readOnly = true; // optional lock
  }

});




/* =========================
   REFERRAL SIGNUP BONUS
========================= */

async function giveReferralSignupBonus(user, referralCode) {

  if (!referralCode) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();

  if (data.signupBonusGiven) return;

  await updateDoc(userRef, {
    coins: (data.coins || 0) + 5,
    referralBalance: (data.referralBalance || 0) + 5,
    signupBonusGiven: true
  });
}
