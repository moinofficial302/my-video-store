import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadReferralData(user.uid);
});

async function loadReferralData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    alert("User data not found");
    return;
  }

  const data = snap.data();
  document.getElementById("myReferralCode").value =
    data.myReferralCode || "";

  document.getElementById("myReferralLink").value =
    location.origin + "/login.html?ref=" + data.myReferralCode;
}

// 🔥 SAVE CUSTOM REFERRAL CODE
window.saveReferralCode = async function () {
  const user = auth.currentUser;
  if (!user) return;

  let code = document.getElementById("myReferralCode").value
    .trim()
    .toUpperCase();

  if (!code.startsWith("M7") || code.length < 4) {
    alert("Referral code must start with M7");
    return;
  }

  // check uniqueness
  const q = query(
    collection(db, "users"),
    where("myReferralCode", "==", code)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    alert("Referral code already taken");
    return;
  }

  await updateDoc(doc(db, "users", user.uid), {
    myReferralCode: code
  });

  document.getElementById("myReferralLink").value =
    location.origin + "/login.html?ref=" + code;

  alert("Referral code updated successfully");
};
