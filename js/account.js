import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("userName").innerText = data.username;
    document.getElementById("userMobile").innerText = data.mobile;
    document.getElementById("userCoins").innerText = data.coins;
  }
});

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
