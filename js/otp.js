import { auth } from "./firebase.js";
import { signInWithCredential, PhoneAuthProvider } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  const otp = document.getElementById("otp").value;

  if (!otp) {
    alert("OTP daalo");
    return;
  }

  try {
    const credential = PhoneAuthProvider.credential(
      window.confirmationResult.verificationId,
      otp
    );

    await signInWithCredential(auth, credential);

    window.location.href = "account.html";
  } catch (error) {
    alert("Invalid OTP");
  }
});
