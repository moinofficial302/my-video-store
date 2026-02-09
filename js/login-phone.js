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

    const mobile = document.getElementById("mobile").value;

    if (!mobile || mobile.length !== 10) {
      alert("Valid mobile number daalo");
      return;
    }

    const phoneNumber = "+91" + mobile;

    try {

      const confirmationResult =
        await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);

      window.confirmationResult = confirmationResult;

      localStorage.setItem("mobile", mobile);

      window.location.href = "otp.html";

    } catch (error) {
      alert(error.message);
    }

  });

});
