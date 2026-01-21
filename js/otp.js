import { db } from "./firebase.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("verifyOtpBtn").addEventListener("click", () => {
  const otp = document.getElementById("otp").value;

  confirmationResult.confirm(otp)
    .then((result) => {
      const user = result.user;

      const username = localStorage.getItem("signup_username");
      const mobile = localStorage.getItem("signup_mobile");

      return setDoc(doc(db, "users", user.uid), {
        username: username,
        mobile: mobile,
        coins: 0,
        createdAt: new Date()
      });
    })
    .then(() => {
      alert("Signup Successful 🎉");
      window.location.href = "account.html";
    })
    .catch(() => {
      alert("Wrong or Expired OTP ❌");
    });
});
