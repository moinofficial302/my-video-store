  /* ===============================
   IMPORTS
================================ */
import { auth, db } from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   TAB SWITCH (LOGIN / SIGNUP)
================================ */
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginTab && signupTab) {
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  });

  signupTab.addEventListener("click", () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });
}

/* ===============================
   SIGN UP
================================ */
window.signupUser = async function () {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();

  if (!username || !email || !password) {
    alert("Please fill all required fields");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      whatsapp: whatsapp || "",
      coins: 0,
      referralBalance: 0,
      createdAt: serverTimestamp()
    });

    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
};

/* ===============================
   LOGIN
================================ */
window.loginUser = async function () {
  const email = document.getElementById("login-identifier").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Enter login details");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    alert("Invalid email or password");
  }
};

/* ===============================
   GOOGLE LOGIN
================================ */
window.googleLogin = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        username: user.displayName || "User",
        email: user.email,
        whatsapp: "",
        coins: 0,
        referralBalance: 0,
        createdAt: serverTimestamp()
      });
    }

    window.location.href = "index.html";
  } catch (error) {
    alert("Google login failed");
  }
};

/* ===============================
   FORGOT PASSWORD
================================ */
window.resetPassword = async function () {
  const email = document.getElementById("forgot-email")?.value.trim();
  if (!email) {
    alert("Enter your email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your Gmail");
  } catch (error) {
    alert(error.message);
  }
};

/* ===============================
   AUTH STATE
================================ */
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("loggedIn", "true");
  } else {
    localStorage.removeItem("loggedIn");
  }
});

/* ===============================
   BUY PRODUCT (GLOBAL)
================================ */
window.buyProduct = function (productId, price) {
  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    alert("Please login first");
    window.location.href = "account.html";
    return;
  }

  alert("Buying product: " + productId + " | Price: ₹" + price);
};

/* ===============================
   LOGIN CHECK HELPER
================================ */
window.checkLoginAndProceed = function (redirectUrl) {
  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    alert("Please login first to continue");
    window.location.href = "account.html";
    return;
  }

  window.location.href = redirectUrl;
};
