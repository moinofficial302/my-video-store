/* =====================================================
   🚀 AKANS AUTH SYSTEM — UPGRADED
   ✔ All alert() → Toast
   ✔ Loading spinners on buttons
   ✔ Better error messages
   ✔ Same logic preserved
===================================================== */

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

/* =========================
   🔔 TOAST — replaces all alert()
========================= */
function showToast(msg, type = "info", duration = 3500) {
  let toast = document.getElementById("toast");

  // Create toast if not exists (account page etc.)
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast hidden";
    document.body.prepend(toast);

    // Inject minimal toast CSS if login.css not loaded
    if (!document.querySelector('link[href*="login.css"]')) {
      const style = document.createElement("style");
      style.textContent = `
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);background:#1e1e2e;color:#fff;padding:12px 22px;border-radius:30px;font-size:14px;font-weight:600;z-index:9999;opacity:0;transition:all .35s ease;white-space:nowrap;box-shadow:0 8px 25px rgba(0,0,0,.3);pointer-events:none;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .toast.hidden{display:none;}
        .toast.success{background:linear-gradient(to right,#11998e,#38ef7d);}
        .toast.error{background:linear-gradient(to right,#ff416c,#ff4b2b);}
        .toast.info{background:linear-gradient(to right,#2563eb,#38bdf8);}
        .toast.warn{background:linear-gradient(to right,#f7971e,#ffd200);color:#1e1e2e;}
      `;
      document.head.appendChild(style);
    }
  }

  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 400);
  }, duration);
}

/* =========================
   ⚙️ BUTTON LOADING STATE
========================= */
function setLoading(btnId, spinnerId, textId, loading, defaultText) {
  const btn     = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  const text    = document.getElementById(textId);
  if (!btn) return;
  btn.disabled = loading;
  if (spinner) spinner.classList.toggle("hidden", !loading);
  if (text)    text.textContent = loading ? "Please wait..." : defaultText;
}

/* =========================
   🎲 REFERRAL CODE GENERATOR
========================= */
function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter  = letters[Math.floor(Math.random() * letters.length)];
  const number  = Math.floor(1000 + Math.random() * 9000);
  return letter + "_" + number;
}

/* =========================
   🔗 GET REFERRAL FROM URL
========================= */
function getReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

/* =========================
   🔥 FRIENDLY ERROR MESSAGES
========================= */
function getFriendlyError(code) {
  const map = {
    "auth/user-not-found":       "Account not found. Please sign up! 👤",
    "auth/wrong-password":       "Wrong password. Please try again 🔑",
    "auth/invalid-credential":   "Invalid email or password ❌",
    "auth/email-already-in-use": "Email already registered. Please login 📧",
    "auth/weak-password":        "Password too weak. Use 6+ characters 🔒",
    "auth/invalid-email":        "Invalid email format 📧",
    "auth/too-many-requests":    "Too many attempts. Try again later ⏳",
    "auth/network-request-failed":"Network error. Check connection 🌐",
    "auth/popup-closed-by-user": "Google login cancelled",
    "auth/cancelled-popup-request": "Google login cancelled",
  };
  return map[code] || "Something went wrong. Please try again ❌";
}

/* =========================
   🟢 SIGNUP
========================= */
window.signupUser = async function () {
  const username = document.getElementById("signup-username")?.value.trim();
  const email    = document.getElementById("signup-email")?.value.trim();
  const whatsapp = document.getElementById("signup-whatsapp")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;
  const confirm  = document.getElementById("signupConfirmPassword")?.value;

  // Validations
  if (!username) { showToast("Please enter a username 👤", "warn"); return; }
  if (!email)    { showToast("Please enter your email 📧", "warn"); return; }
  if (!password) { showToast("Please enter a password 🔒", "warn"); return; }
  if (password.length < 6) { showToast("Password must be 6+ characters 🔒", "warn"); return; }
  if (password !== confirm) { showToast("Passwords don't match ❌", "warn"); return; }

  setLoading("signupBtn", "signupBtnSpinner", "signupBtnText", true, "Create Account ✨");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const referredBy = getReferralFromUrl() ||
                       document.getElementById("referralCode")?.value.trim() || null;

    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      whatsapp:         whatsapp || "",
      coins:            0,
      referralBalance:  0,
      signupBonusGiven: false,
      referralCode:     generateCode(),
      addMoneyTotal:    0,
      refCount:         0,
      referredBy:       referredBy || null,
      createdAt:        serverTimestamp()
    });

    if (referredBy) {
      await giveReferralSignupBonus(cred.user, referredBy);
    }

    showToast("Account created! Welcome 🎉", "success");
    setTimeout(() => window.location.replace("index.html"), 1200);

  } catch (e) {
    showToast(getFriendlyError(e.code), "error");
  } finally {
    setLoading("signupBtn", "signupBtnSpinner", "signupBtnText", false, "Create Account ✨");
  }
};

/* =========================
   🔵 LOGIN
========================= */
window.loginUser = async function () {
  let identifier = document.getElementById("loginIdentifier")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!identifier) { showToast("Please enter username or email 👤", "warn"); return; }
  if (!password)   { showToast("Please enter your password 🔒", "warn"); return; }

  setLoading("loginBtn", "loginBtnSpinner", "loginBtnText", true, "Login");

  try {
    let email = identifier;

    // Username → Email lookup
    if (!identifier.includes("@")) {
      const q    = query(collection(db, "users"), where("username", "==", identifier));
      const snap = await getDocs(q);
      if (snap.empty) {
        showToast("Username not found 👤", "error");
        setLoading("loginBtn", "loginBtnSpinner", "loginBtnText", false, "Login");
        return;
      }
      email = snap.docs[0].data().email;
    }

    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful! 🎉", "success");
    setTimeout(() => window.location.replace("index.html"), 800);

  } catch (e) {
    showToast(getFriendlyError(e.code), "error");
  } finally {
    setLoading("loginBtn", "loginBtnSpinner", "loginBtnText", false, "Login");
  }
};

/* =========================
   🔴 GOOGLE LOGIN
========================= */
window.googleLogin = async function () {
  const btn = document.getElementById("googleBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Connecting..."; }

  try {
    const provider = new GoogleAuthProvider();
    const result   = await signInWithPopup(auth, provider);
    const user     = result.user;
    const userRef  = doc(db, "users", user.uid);
    const snap     = await getDoc(userRef);

    if (!snap.exists()) {
      const referredBy = getReferralFromUrl();
      await setDoc(userRef, {
        username:        user.displayName || "User",
        email:           user.email,
        whatsapp:        "",
        coins:           0,
        referralBalance: 0,
        referralCode:    generateCode(),
        coinsSpent:      0,
        refCount:        0,
        referredBy:      referredBy || null,
        createdAt:       serverTimestamp()
      });
    }

    showToast("Google login successful! 🎉", "success");
    setTimeout(() => window.location.replace("index.html"), 800);

  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user" &&
        e.code !== "auth/cancelled-popup-request") {
      showToast(getFriendlyError(e.code), "error");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;"/>Continue with Google`;
    }
  }
};

/* =========================
   🔵 AUTH STATE CHANGE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const data = snap.data();

    const coinsEl = document.getElementById("coinBalance");
    const refEl   = document.getElementById("referralBalance");

    if (coinsEl) coinsEl.textContent = (data.coins || 0).toLocaleString("en-IN");
    if (refEl)   refEl.textContent   = (data.referralBalance || 0).toLocaleString("en-IN");
  } catch(e) {
    console.error("Auth state error:", e);
  }
});

/* =========================
   🔐 PAGE GUARD
========================= */
window.requireLogin = function () {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.replace("login.html");
  });
};

/* =========================
   🚪 LOGOUT
========================= */
window.logoutUser = async function () {
  try {
    await signOut(auth);
    showToast("Logged out successfully 👋", "info");
    setTimeout(() => window.location.replace("login.html"), 800);
  } catch(e) {
    showToast("Logout failed. Try again ❌", "error");
  }
};

/* =========================
   🔗 AUTO FILL REFERRAL INPUT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const ref   = getReferralFromUrl();
  if (!ref) return;
  const input = document.querySelector("#referralCode");
  if (input)  { input.value = ref; input.readOnly = true; }
});

/* =========================
   🎁 REFERRAL SIGNUP BONUS
========================= */
async function giveReferralSignupBonus(user, referralCode) {
  if (!referralCode) return;
  try {
    const userRef  = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    if (data.signupBonusGiven) return;

    await updateDoc(userRef, {
      coins:            (data.coins || 0) + 5,
      referralBalance:  (data.referralBalance || 0) + 5,
      signupBonusGiven: true
    });
  } catch(e) {
    console.error("Referral bonus error:", e);
  }
}
