import { auth } from "./firebase-init.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  window.recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    { size: "invisible" },
    auth
  );

  const btn = document.getElementById("sendOtpBtn");

  btn.addEventListener("click", async () => {

    const username = document.getElementById("username").value;
    const mobile = document.getElementById("mobile").value;

    if (!username || !mobile) {
      alert("All fields required");
      return;
    }

    const phoneNumber = "+91" + mobile;

    try {
      const confirmationResult =
        await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);

      window.confirmationResult = confirmationResult;

      localStorage.setItem("signup_username", username);
      localStorage.setItem("signup_mobile", mobile);

      window.location.href = "otp.html";

    } catch (err) {
      alert(err.message);
    }

  });

});
