// ================================
// APPLY COUPON (FINAL FIXED)
// ================================

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.applyCoupon = async function () {

  const code = document
    .getElementById("couponInput")
    .value
    .trim()
    .toUpperCase();

  const msg = document.getElementById("couponMsg");

  if (!code) {
    msg.innerText = "❌ Enter coupon code";
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  try {

    // 🔍 GET COUPON
    const couponRef = doc(db, "coupons", code);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      msg.innerText = "❌ Invalid coupon";
      return;
    }

    const coupon = couponSnap.data();

    // ✅ FIXED FIELD SUPPORT
    const used = coupon.used || 0;
    const limit = coupon.limit || 1;

    // 🔥 IMPORTANT FIX
    const coins =
      coupon.coins ||
      coupon.value ||
      0;

    // ✅ ACTIVE CHECK (SAFE)
    if (coupon.active === false) {
      msg.innerText = "❌ Coupon disabled";
      return;
    }

    // ✅ LIMIT CHECK
    if (used >= limit) {
      msg.innerText = "❌ Coupon expired";
      return;
    }

    // 🚫 CHECK ALREADY USED
    const usageRef = doc(db, "coupon_usage", user.uid + "_" + code);
    const usageSnap = await getDoc(usageRef);

    if (usageSnap.exists()) {
      msg.innerText = "❌ Already used";
      return;
    }

    // 💰 ADD COINS
    await updateDoc(doc(db, "users", user.uid), {
      coins: increment(coins)
    });

    // 📊 UPDATE COUPON COUNT
    await updateDoc(couponRef, {
      used: increment(1)
    });

    // 🔐 SAVE USAGE
    await setDoc(usageRef, {
      uid: user.uid,
      code: code,
      time: new Date()
    });

    msg.innerText = `✅ ${coins} coins added 🎉`;
    msg.style.color = "green";

    document.getElementById("couponInput").value = "";

  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Error occurred";
  }
};
