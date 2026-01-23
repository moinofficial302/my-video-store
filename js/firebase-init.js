import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdgT-GBSctb1xZyW1sVaH6ggB1hlYTAJQ",
  authDomain: "akans-d2bdc.firebaseapp.com",
  projectId: "akans-d2bdc",
  storageBucket: "akans-d2bdc.firebasestorage.app",
  messagingSenderId: "588727557262",
  appId: "1:588727557262:web:bdbe859770c97284837ddf",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

