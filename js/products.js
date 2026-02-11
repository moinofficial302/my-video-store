// ================================
// FIREBASE IMPORTS (V9)
// ================================
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
// PRODUCTS
// ================================
const PRODUCTS = {
  "editing-pack": {
    id: "editing-pack",
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://drive.google.com/drive/folders/1GnAZnX64ObyQMW2eWHpyjxwNJANcAQcD"
  }
};


// ===================================================
// ✅ BUY PRODUCT
// ===================================================
window.buyProduct = async function (productId, price) {

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const product = PRODUCTS[productId];
  if (!product) {
    alert("Invalid product");
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const coins = userSnap.data().coins || 0;

    if (coins < price) {
      alert("Not enough coins ❌");
      return;
    }

    // 🔥 deduct coins
    await updateDoc(userRef, {
      coins: increment(-price)
    });

    // ✅ FIXED ORDER SAVE
    await addDoc(
      collection(db, "orders"),
      {
        uid: user.uid,
        userEmail: user.email,
        productId: product.id,
        name: product.name,
        price: product.price,
        link: product.link,
        createdAt: serverTimestamp()
      }
    );

    alert("Purchase Successful 🎉");

    switchButtonToOpen(productId, product.link);

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Try again.");
  }
};


// ===================================================
// OWNERSHIP CHECK
// ===================================================
window.checkOwnership = async function (productId, buttonEl) {

  const user = auth.currentUser;
  if (!user || !buttonEl) return;

  const q = query(
    collection(db, "orders"),
    where("uid", "==", user.uid),
    where("productId", "==", productId),
    limit(1)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const data = snap.docs[0].data();

    buttonEl.innerText = "Open Product";
    buttonEl.onclick = () => window.open(data.link, "_blank");
  }
};


// ===================================================
function switchButtonToOpen(productId, link) {
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.innerText = "Open Product";
    btn.onclick = () => window.open(link, "_blank");
  });
}


// ===================================================
onAuthStateChanged(auth, () => {});
