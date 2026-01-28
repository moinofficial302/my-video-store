

/* Firebase imports */
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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   TAB SWITCH (LOGIN / SIGNUP)
=============================== */
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

/* ===============================
   SIGN UP
=============================== */
window.signupUser = async function () {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();
  const password = document.getElementById("signup-password").value;
const confirmPassword =
  document.getElementById("signupConfirmPassword").value;

if (password !== confirmPassword) {
  alert("Password and Confirm Password do not match");
  return;
}

  
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
      whatsapp,
      coins: 0,
      createdAt: serverTimestamp()
    });

    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
};

/* ===============================
   LOGIN
=============================== */

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.loginUser = async function () {
  const identifier =
    document.getElementById("loginIdentifier").value.trim();
  const password =
    document.getElementById("loginPassword").value;

  if (!identifier || !password) {
    alert("Please enter Username/Email and Password");
    return;
  }

  let email = identifier;

  // 🔍 Agar email nahi hai → username samjho
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

  // 🔐 Firebase login with email
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(() => {
      alert("Invalid username/email or password");
    });
};

/* ===============================
   GOOGLE LOGIN
=============================== */
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
        createdAt: serverTimestamp()
      });
    }

    window.location.href = "index.html";
  } catch (err) {
    alert("Google login failed");
  }
};

/* ===============================
   FORGOT PASSWORD
=============================== */

window.resetPassword = async function () {
  const email = document.getElementById("login-identifier").value.trim();

  if (!email) {
    alert("Enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your email");
  } catch (err) {
    alert(err.message);
  }
};

/* ===============================
   AUTH STATE (GLOBAL)
=============================== */
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("loggedIn", "true");
  } else {
    localStorage.removeItem("loggedIn");
  }
});

/* ===============================
   BUY PRODUCT (GLOBAL)
=============================== */
window.buyProduct = function (productId, price) {
  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  alert("Buying product: " + productId + " | Price: ₹" + price);
};

/* ===============================
   PROTECTED PAGE GUARD
=============================== */
window.requireLogin = function () {
  const loggedIn = localStorage.getItem("loggedIn");
  if (!loggedIn) {
    window.location.href = "login.html";
  }
};

/* ===============================
   LOGOUT
=============================== */
window.logoutUser = async function () {
  try {
    await signOut(auth);
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  } catch (err) {
    alert("Logout failed");
  }
};



window.togglePassword = function(id, el){
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    el.textContent = "🙈";
  } else {
    input.type = "password";
    el.textContent = "👁️";
  }
};
