/* =====================================================
   🔥 AUTH + REFERRAL SYSTEM (FULL FIXED VERSION)
   Jarvis Professional Clean Build
===================================================== */


/* ===============================
   🔗 READ REFERRAL FROM URL
=============================== */

const params = new URLSearchParams(window.location.search);
const referralFromUrl = params.get("ref");

window.referralCodeFromUrl = null;

if (referralFromUrl) {
  const refInput = document.getElementById("referralCode");

  if (refInput) {
    refInput.value = referralFromUrl;
    refInput.readOnly = true;
  }

  window.referralCodeFromUrl = referralFromUrl;
}



/* ===============================
   🔥 FIREBASE IMPORTS
=============================== */

import { auth, db } from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
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
   🟢 EMAIL SIGNUP (FULL REFERRAL SUPPORT)
===================================================== */

window.signupUser = async function () {

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Password and Confirm Password do not match");
    return;
  }

  try {

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    /* 🔥 AUTO REFERRAL CODE */
    const myReferralCode =
      "M7" + user.uid.substring(0, 4).toUpperCase();


    /* 🔥 COMPLETE USER DOC (NO BUG VERSION) */
    await setDoc(doc(db, "users", user.uid), {

      username,
      email,
      whatsapp,

      coins: 0,
      referralBalance: 0,

      myReferralCode: myReferralCode,
      referredBy: window.referralCodeFromUrl || null,

      referralMode: window.referralCodeFromUrl ? "super" : null,
      normalReferralCount: 0,
      superRewardGiven: false,

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

  const identifier =
    document.getElementById("loginIdentifier").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  if (!identifier || !password) {
    alert("Enter Username/Email and Password");
    return;
  }

  let email = identifier;

  /* username -> email lookup */
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

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  }
  catch {
    alert("Invalid username/email or password");
  }
};



/* =====================================================
   🔴 GOOGLE LOGIN (FULL REFERRAL SUPPORT FIXED)
   🔥 MOST IMPORTANT SECTION
===================================================== */

window.googleLogin = async function () {

  const provider = new GoogleAuthProvider();

  try {

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    /* =================================================
       🔥 IF FIRST TIME USER → CREATE FULL DOC
       (OLD BUG: only coins saved ❌)
       (NOW: FULL referral system saved ✅)
    ================================================= */

    if (!snap.exists()) {

      const myReferralCode =
        "M7" + user.uid.substring(0, 4).toUpperCase();

      await setDoc(ref, {

        username: user.displayName || "User",
        email: user.email,
        whatsapp: "",

        coins: 0,
        referralBalance: 0,

        myReferralCode: myReferralCode,
        referredBy: window.referralCodeFromUrl || null,

        referralMode: window.referralCodeFromUrl ? "super" : null,
        normalReferralCount: 0,
        superRewardGiven: false,

        createdAt: serverTimestamp()
      });
    }

    window.location.href = "index.html";

  }
  catch {
    alert("Google login failed");
  }
};




/* =====================================================
   👁 PASSWORD TOGGLE
===================================================== */

window.togglePassword = function (id, el) {

  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    el.textContent = "🙈";
  } else {
    input.type = "password";
    el.textContent = "👁️";
  }
};




/* =====================================================
   🔵 FORGOT PASSWORD (USERNAME OR EMAIL)
===================================================== */

window.resetPassword = async function () {

  const identifier =
    document.getElementById("loginIdentifier").value.trim();

  if (!identifier) {
    alert("Enter Username or Email first");
    return;
  }

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

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your email");
  }
  catch (err) {
    alert(err.message);
  }
};




/* =====================================================
   🟢 AUTH STATE LISTENER
   🔥 AUTO LOAD COINS + REFERRAL BALANCE
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (user) {

    localStorage.setItem("loggedIn", "true");

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {

      const data = snap.data();

      const coinsEl = document.getElementById("coinBalance");
      const refEl = document.getElementById("referralBalance");

      if (coinsEl) coinsEl.innerText = data.coins || 0;
      if (refEl) refEl.innerText = data.referralBalance || 0;
    }

  }
  else {
    localStorage.removeItem("loggedIn");
  }

});




/* =====================================================
   🔐 PROTECTED PAGE GUARD
===================================================== */

window.requireLogin = function () {

  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    window.location.href = "login.html";
  }
};




/* =====================================================
   🚪 LOGOUT
===================================================== */

window.logoutUser = async function () {

  try {

    await signOut(auth);

    localStorage.removeItem("loggedIn");

    window.location.href = "login.html";

  }
  catch {
    alert("Logout failed");
  }
};




/* =====================================================
   ✅ END OF FILE
===================================================== */
