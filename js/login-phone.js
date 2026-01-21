import { auth } from "./firebase.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔐 Setup reCAPTCHA
window.recaptchaVerifier = new RecaptchaVerifier(
  "recaptcha-container",
  {
    size: "invisible",
    callback: () => {
      console.log("reCAPTCHA verified");
    }
  },
  auth
);

// 📲 Send OTP
document.getElementById("sendOtpBtn").addEventListener("click", async () => {
  const mobile = document.getElementById("mobile").value;

  if (!mobile || mobile.length !== 10) {
    alert("Valid mobile number daalo");
    return;
  }

  const phoneNumber = "+91" + mobile;

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmationResult;
    localStorage.setItem("mobile", mobile);

    window.location.href = "otp.html";
  } catch (error) {
    alert(error.message);
  }
});
