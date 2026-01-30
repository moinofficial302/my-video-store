// =======================================
// ADMIN AUTH GUARD (EMAIL BASED)
// Allowed Admin: moinofficial302@gmail.com
// =======================================

import { auth } from "../../js/firebase-init.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ✅ Allowed admin email
const ADMIN_EMAIL = "moinofficial302@gmail.com";

// DOM elements
const adminEmailEl = document.getElementById("adminEmail");
const logoutBtn = document.getElementById("adminLogoutBtn");

// =======================================
// AUTH STATE CHECK
// =======================================
onAuthStateChanged(auth, (user) => {

  // ❌ No user logged in
  if (!user) {
    redirectToLogin();
    return;
  }

  // ❌ User logged in but NOT admin
  if (user.email !== ADMIN_EMAIL) {
    alert("Access Denied! Admin only.");
    forceLogout();
    return;
  }

  // ✅ Admin verified
  console.log("Admin verified:", user.email);

  // Show admin email in header
  if (adminEmailEl) {
    adminEmailEl.textContent = user.email;
  }
});

// =======================================
// LOGOUT BUTTON
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

// =======================================
// HELPERS
// =======================================
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


admin/js/admin-auth.js




// admin auth check
// firebase auth logic
// admin email check
// logout logic

// ===============================
// ADMIN NAVIGATION (PASTE HERE)
// ===============================

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".admin-section");
const sectionTitle = document.getElementById("sectionTitle");

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;

    navItems.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(sec => sec.classList.remove("active"));

    const activeSection = document.getElementById(target);
    if (activeSection) {
      activeSection.classList.add("active");
    }

    if (sectionTitle) {
      sectionTitle.textContent =
        btn.innerText.replace(/^[^a-zA-Z]+/, "").trim();
    }
  });
});























