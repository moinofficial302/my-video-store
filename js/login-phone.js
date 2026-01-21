import { auth } from "./firebase.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btn = document.getElementById("sendOtpBtn");

window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  {
    size: "invisible",
    callback: () => {}
  }
);

btn.addEventListener("click", async () => {
  const mobile = document.getElementById("mobile").value.trim();

  if (!mobile || mobile.length !== 10) {
    alert("Enter valid 10 digit number");
    return;
  }

  const phoneNumber = "+91" + mobile;

  try {
    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmation;
    localStorage.setItem("mobile", mobile);
    window.location.href = "otp.html";
  } catch (err) {
    alert(err.message);
  }
});
