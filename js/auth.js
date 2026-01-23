// Firebase auth & db
const auth = firebase.auth();
const db = firebase.firestore();


function signupUser() {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const whatsapp = document.getElementById("signup-whatsapp").value.trim();

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill all required fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({
        username: username,
        email: email,
        whatsapp: whatsapp || "",
        coins: 0,
        referralBalance: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}


function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}


function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      const userRef = db.collection("users").doc(user.uid);
      return userRef.get().then((doc) => {
        if (!doc.exists) {
          return userRef.set({
            username: user.displayName,
            email: user.email,
            whatsapp: "",
            coins: 0,
            referralBalance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    })
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}


function resetPassword() {
  const email = document.getElementById("reset-email").value.trim();

  if (!email) {
    alert("Enter your email");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset link sent to your email");
    })
    .catch((error) => {
      alert(error.message);
    });
}


auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.email);
  } else {
    console.log("User not logged in");
  }
});
