/* =====================================================
   🚀 AKANS AUTH SYSTEM (FINAL PRODUCTION VERSION)
   Clean • Fast • No old referral garbage • Stable
===================================================== */


/* ===============================
   🔥 FIREBASE IMPORTS
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
   🔥 RANDOM REFERRAL CODE GENERATOR
   Example → A_4839
===================================================== */

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}



/* =====================================================
   🔥 GET REF FROM URL
   login.html?ref=A_1234&type=normal
===================================================== */

function getReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    code: params.get("ref"),
    type: params.get("type")
  };
}



/* =====================================================
   🔵 TAB SWITCH (LOGIN / SIGNUP)
===================================================== */

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginTab && signupTab) {

  loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  };

  signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  };
}



/* =====================================================
   🟢 SIGNUP
===================================================== */

window.signupUser = async function () {

  const username =
    document.getElementById("signup-username").value.trim();

  const email =
    document.getElementById("signup-email").value.trim();

  const whatsapp =
    document.getElementById("signup-whatsapp").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  const confirm =
    document.getElementById("signupConfirmPassword").value;

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

    const refData = getReferralFromUrl();

    /* 🔥 CREATE USER DOC */
    await setDoc(doc(db, "users", user.uid), {

      username,
      email,
      whatsapp,

      coins: 0,
      referralBalance: 0,

      /* 🔥 NEW REFERRAL SYSTEM */
      normalCode: generateCode(),
      superCode: generateCode(),
      superUnlocked: false,

      referredBy: refData.code || null,
      referredType: refData.type || null,

      refCount: 0,

      createdAt: serverTimestamp()
    });

    window.location.href = "index.html";

  } catch (err) {
    alert(err.message);
  }
};



/* =====================================================
   🔵 LOGIN (USERNAME OR EMAIL)
===================================================== */

window.loginUser = async function () {

  let identifier =
    document.getElementById("loginIdentifier").value.trim();

  const password =
    document.getElementById("loginPassword").value;

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

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {

    const refData = getReferralFromUrl();

    await setDoc(ref, {

      username: user.displayName || "User",
      email: user.email,
      whatsapp: "",

      coins: 0,
      referralBalance: 0,

      normalCode: generateCode(),
      superCode: generateCode(),
      superUnlocked: false,

      referredBy: refData.code || null,
      referredType: refData.type || null,

      refCount: 0,

      createdAt: serverTimestamp()
    });
  }

  window.location.href = "index.html";
};



/* =====================================================
   🔵 AUTH STATE (COINS LOAD)
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
   🔐 PAGE GUARD
===================================================== */

window.requireLogin = function () {

  onAuthStateChanged(auth, (user) => {
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
