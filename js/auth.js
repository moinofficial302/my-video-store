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

/* =========================
   SIGN UP
========================= */
window.signupUser = async function () {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();

  if (!username || !email || !password) {
    alert("Please fill required fields");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      whatsapp: whatsapp || "",
      coins: 0,
      referralBalance: 0,
      createdAt: serverTimestamp()
    });

    alert("Account created successfully");
    window.location.href = "/index.html";
  } catch (error) {
    alert(error.message);
  }
};

/* =========================
   LOGIN (Email / Username)
========================= */
window.loginUser = async function () {
  const emailOrUsername = document.getElementById("login-identifier").value.trim();
  const password = document.getElementById("login-password").value;

  if (!emailOrUsername || !password) {
    alert("Enter login details");
    return;
  }

  try {
    // Username login future-ready, abhi email only
    await signInWithEmailAndPassword(auth, emailOrUsername, password);
    window.location.href = "/index.html";
  } catch (error) {
    alert("Login failed");
  }
};

/* =========================
   GOOGLE LOGIN
========================= */
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

    window.location.href = "/index.html";
  } catch (error) {
    alert("Google login failed");
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
window.resetPassword = async function () {
  const email = document.getElementById("forgot-email").value.trim();
  if (!email) {
    alert("Enter email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent");
  } catch (error) {
    alert(error.message);
  }
};

/* =========================
   AUTH CHECK (GLOBAL)
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("loggedIn", "true");
  } else {
    localStorage.removeItem("loggedIn");
  }
});

import { sendPasswordResetEmail } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset link sent to your Gmail");
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}
