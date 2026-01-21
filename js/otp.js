import { auth } from "./firebase.js";
import {
  PhoneAuthProvider,
  signInWithCredential
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  const otp = document.getElementById("otp").value;
  const verificationId = localStorage.getItem("verificationId");

  if (!otp || !verificationId) {
    alert("OTP ya session missing hai");
    return;
  }

  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      otp
    );

    await signInWithCredential(auth, credential);

    localStorage.removeItem("verificationId");
    window.location.href = "account.html";
  } catch (error) {
    alert("Invalid OTP");
  }
});
