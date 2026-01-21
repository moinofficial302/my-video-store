import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Google Provider
const provider = new GoogleAuthProvider();

// Google button click
const googleBtn = document.getElementById("googleBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    signInWithRedirect(auth, provider);
  });
}

// After redirect result
getRedirectResult(auth)
  .then(async (result) => {
    if (!result) return;

    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        username: user.displayName || "Google User",
        email: user.email,
        mobile: "Google User",
        coins: 0,
        createdAt: new Date()
      });
    }

    // Redirect to account page
    window.location.href = "account.html";
  })
  .catch((error) => {
    alert(error.message);
  });
