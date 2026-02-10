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
// PRODUCTS MASTER DATA
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
// BUY PRODUCT (GLOBAL – HTML onclick compatible)
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

    if (!userSnap.exists()) {
      alert("Wallet not found");
      return;
    }

    const coins = userSnap.data().coins || 0;

    if (coins < price) {
      alert(
        `Insufficient Coins ❌\n\nRequired: ${price}\nAvailable: ${coins}`
      );
      return;
    }

    // 🔥 CUT COINS
    await updateDoc(userRef, {
      coins: increment(-price)
    });


    
    // 🧾 SAVE ORDER
    await addDoc(
  collection(db, "orders"),
        
        productId: product.id,
        name: product.name,
        price: product.price,
        link: product.link,
        createdAt: serverTimestamp()
      }
    );


  
    alert("Purchase Successful 🎉");

    // 🔁 BUTTON → OPEN PRODUCT
    switchButtonToOpen(productId, product.link);

  } catch (err) {
    console.error("Buy error:", err);
    alert("Something went wrong. Try again.");
  }
};


// ===================================================
// OWNERSHIP CHECK (AUTO BUTTON SWITCH)
// ===================================================
window.checkOwnership = async function (productId, buttonEl) {

  const user = auth.currentUser;
  if (!user || !buttonEl) return;

  try {
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
      buttonEl.classList.add("owned");
    }

  } catch (err) {
    console.error("Ownership check error:", err);
  }
};


// ===================================================
// BUTTON SWITCH HELPER
// ===================================================
function switchButtonToOpen(productId, link) {
  document.querySelectorAll(".buy-btn").forEach(btn => {
    const attr = btn.getAttribute("onclick") || "";
    if (attr.includes(productId)) {
      btn.innerText = "Open Product";
      btn.onclick = () => window.open(link, "_blank");
      btn.classList.add("owned");
    }
  });
}


// ===================================================
// AUTO AUTH READY (ENSURE currentUser AVAILABLE)
// ===================================================
onAuthStateChanged(auth, () => {
  // Just ensures auth is ready
});
