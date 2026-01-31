import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.applyCoupon = async function () {

  const code = document.getElementById("couponInput").value.trim().toUpperCase();
  const msg = document.getElementById("couponMsg");

  if (!code) {
    msg.innerText = "❌ Please enter a coupon code";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    const couponRef = doc(db, "coupons", code);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      msg.innerText = "❌ Invalid coupon code";
      return;
    }

    const coupon = couponSnap.data();

    if (!coupon.active) {
      msg.innerText = "❌ Coupon expired";
      return;
    }

    if (coupon.used >= coupon.limit) {
      msg.innerText = "❌ Coupon limit reached";
      return;
    }

    // ADD COINS
    await updateDoc(doc(db, "users", user.uid), {
      coins: increment(coupon.coins)
    });

    // UPDATE COUPON USED
    await updateDoc(couponRef, {
      used: increment(1)
    });

    msg.innerText = `✅ Coupon applied! ${coupon.coins} coins added 🎉`;
    msg.style.color = "green";

  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Something went wrong";
  }
};
