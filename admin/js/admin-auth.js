// =======================================
// ADMIN AUTH GUARD (EMAIL BASED)
// Allowed Admin: moinofficial302@gmail.com
// + lastLogin timestamp Firestore mein save karta hai
// =======================================

console.log("ADMIN AUTH JS LOADED");

import { auth, db } from "../../js/firebase-init.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ADMIN_EMAIL  = "moinofficial302@gmail.com";
const adminEmailEl = document.getElementById("adminEmail");
const logoutBtn    = document.getElementById("adminLogoutBtn");

// =======================================
// AUTH STATE CHECK
// =======================================
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    redirectToLogin();
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    alert("Access Denied! Admin only.");
    forceLogout();
    return;
  }

  // ✅ Admin verified
  console.log("Admin verified:", user.email);

  if (adminEmailEl) {
    adminEmailEl.textContent = user.email;
  }

  // ✅ Save lastLogin to Firestore
  try {
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp()
    });
  } catch (e) {
    // Admin might not have a users doc — silent fail is fine
    console.warn("lastLogin update skipped:", e.message);
  }
});

// =======================================
// LOGOUT
// =======================================
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      redirectToLogin();
    } catch (err) {
      alert(err.message);
    }
  });
}

function redirectToLogin() {
  window.location.replace("../login.html");
}

async function forceLogout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
  } finally {
    redirectToLogin();
  }
}
