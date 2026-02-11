// ================================
// FIREBASE IMPORTS
// ================================
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ================================
// PRODUCTS DATA
// ================================
const PRODUCTS = {
  "editing-pack": {
    id: "editing-pack",
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://drive.google.com/drive/folders/1GnAZnX64ObyQMW2eWHpyjxwNJANcAQcD"
  }
};


// ================================
// 🔥 BUY PRODUCT (SUPER STABLE)
// ================================
async function buyProduct(productId, price) {

  if (!auth.currentUser) {
    alert("Login first");
    location.href = "login.html";
    return;
  }

  const user = auth.currentUser;
  const product = PRODUCTS[productId];

  try {

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    const coins = snap.data().coins || 0;

    if (coins < price) {
      alert("Not enough coins ❌");
      return;
    }

    // deduct coins
    await updateDoc(userRef, {
      coins: increment(-price)
    });

    // save order
    await addDoc(collection(db, "orders"), {
      uid: user.uid,
      userEmail: user.email,
      productId,
      name: product.name,
      price,
      link: product.link,
      createdAt: serverTimestamp()
    });

    alert("Purchase Successful 🎉");

    switchButtonToOpen(productId, product.link);

  } catch (err) {
    console.error("Buy error:", err);
    alert("Something went wrong. Try again.");
  }
}


// ================================
// 🔥 OWNERSHIP CHECK
// ================================
async function checkOwnership(productId, buttonEl) {

  if (!auth.currentUser) return;

  const q = query(
    collection(db, "orders"),
    where("uid", "==", auth.currentUser.uid),
    where("productId", "==", productId),
    limit(1)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const data = snap.docs[0].data();

    buttonEl.innerText = "Open Product";
    buttonEl.onclick = () => window.open(data.link, "_blank");
    buttonEl.classList.add("owned");
  }
}


// ================================
// 🔥 BUTTON SWITCH (SAFE)
// ================================
function switchButtonToOpen(productId, link) {

  const btn = document.querySelector(
    `[onclick*="${productId}"]`
  );

  if (!btn) return;

  btn.innerText = "Open Product";
  btn.onclick = () => window.open(link, "_blank");
  btn.classList.add("owned");
}


// ================================
// ⭐ MAKE GLOBAL (MOST IMPORTANT)
// ================================
window.buyProduct = buyProduct;
window.checkOwnership = checkOwnership;


// ================================
// AUTH READY
// ================================
onAuthStateChanged(auth, () => {});
