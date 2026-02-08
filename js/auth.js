/* =====================================================
   🚀 AKANS AUTH SYSTEM (Single Smart Referral)
   Final • Clean • Production Safe
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
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



/* =====================================================
   🔥 RANDOM REFERRAL CODE
   Example → A_4821
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}



/* =====================================================
   🔥 READ REF FROM URL
   login.html?ref=A_1234
===================================================== */

function getReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}



/* =====================================================
   🔵 SIGNUP
===================================================== */

window.signupUser = async function () {

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirmPassword").value;

  if (!username || !email || !password) {
    alert("Fill all fields");
    return;
  }

  if (password !== confirm) {
    alert("Passwords not match");
    return;
  }

  try {

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    const referredBy = getReferralFromUrl();

    await setDoc(doc(db, "users", user.uid), {

      username,
      email,
      whatsapp,

      coins: 0,
      referralBalance: 0,

      /* 🔥 SMART SYSTEM */
      referralCode: generateCode(),
      coinsSpent: 0,
      refCount: 0,

      referredBy: referredBy || null,

      createdAt: serverTimestamp()
    });

    window.location.href = "index.html";

  } catch (e) {
    alert(e.message);
  }
};



/* =====================================================
   🔵 LOGIN (username/email)
===================================================== */

window.loginUser = async function () {

  let identifier = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value;

  let email = identifier;

  if (!identifier.includes("@")) {

    const q = query(
      collection(db, "users"),
      where("username", "==", identifier)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Username not found");
      return;
    }

    email = snap.docs[0].data().email;
  }

  await signInWithEmailAndPassword(auth, email, password);

  window.location.href = "index.html";
};



/* =====================================================
   🔴 GOOGLE LOGIN
===================================================== */

window.googleLogin = async function () {

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

  window.location.href = "index.html";
};



/* =====================================================
   🔵 AUTH STATE (coins load)
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) return;

  const data = snap.data();

  const coinsEl = document.getElementById("coinBalance");
  const refEl = document.getElementById("referralBalance");

  if (coinsEl) coinsEl.innerText = data.coins || 0;
  if (refEl) refEl.innerText = data.referralBalance || 0;
});



/* =====================================================
   🔐 GUARD
===================================================== */

window.requireLogin = function () {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "login.html";
  });
};



/* =====================================================
   🚪 LOGOUT
===================================================== */

window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};
