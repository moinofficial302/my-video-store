import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdgT-GBSctb1xZwjVsVaH6ggBh1LYTAJQ",
  authDomain: "akans-d2bdc.firebaseapp.com",
  projectId: "akans-d2bdc",
  storageBucket: "akans-d2bdc.appspot.com",
  messagingSenderId: "588727557262",
  appId: "1:588727557262:web:bdbe85977c97284837ddf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
