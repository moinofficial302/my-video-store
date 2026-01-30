// ================================
// FIREBASE IMPORTS (V9)
// ================================
import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ================================
// PRODUCTS MASTER DATA
// ================================
const PRODUCTS = {
  "editing-pack": {
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://drive.google.com/drive/folders/1GnAZnX64ObyQMW2eWHpyjxwNJANcAQcD"
  }
};


// ================================
// BUY PRODUCT
// ================================
window.buyProduct = async function (productId, price) {

  onAuthStateChanged(auth, async (user) => {

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

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Wallet not found");
      return;
    }

    const coins = userSnap.data().coins || 0;

    if (coins < price) {
      alert("Insufficient coins");
      return;
    }

    // 🔥 CUT COINS
    await updateDoc(userRef, {
      coins: increment(-price)
    });

    // 🧾 SAVE ORDER
    await addDoc(
      collection(db, "orders", user.uid, "items"),
      {
        productId,
        name: product.name,
        price,
        link: product.link,
        time: new Date()
      }
    );

    alert("Purchase Successful 🎉");

    // 🔁 BUTTON → OPEN PRODUCT
    document.querySelectorAll(".buy-btn").forEach(btn => {
      if (btn.getAttribute("onclick")?.includes(productId)) {
        btn.innerText = "Open Product";
        btn.onclick = () => window.open(product.link, "_blank");
      }
    });

  });
};


// ================================
// OWNERSHIP CHECK
// ================================
window.checkOwnership = async function (productId, buttonEl) {

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const q = query(
      collection(db, "orders", user.uid, "items"),
      where("productId", "==", productId),
      limit(1)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      buttonEl.innerText = "Open Product";
      buttonEl.onclick = () => window.open(data.link, "_blank");
    }
  });
};
