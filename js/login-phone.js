import { auth } from "./firebase.js";
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
  const mobile = document.getElementById("mobile").value;

  if (!mobile) {
    alert("Mobile number required");
    return;
  }

  const phoneNumber = "+91" + mobile;

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      localStorage.setItem("login_mobile", mobile);
      window.location.href = "otp.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
