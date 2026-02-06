import { auth } from "./firebase-init.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.recaptchaVerifier = new RecaptchaVerifier(
  "recaptcha-container",
  { size: "invisible" },
  auth
);

document.getElementById("sendOtpBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const mobile = document.getElementById("mobile").value;

  if (!username || !mobile) {
    alert("All fields required");
    return;
  }

  const phoneNumber = "+91" + mobile;

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;

      localStorage.setItem("signup_username", username);
      localStorage.setItem("signup_mobile", mobile);

      window.location.href = "otp.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
