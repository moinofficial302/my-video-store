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
// 🔥 BUY PRODUCT (FINAL FIXED)
// ===================================================
async function buyProduct(productId, price){

  const user = auth.currentUser;

  if(!user){
    alert("Login first");
    location.href = "login.html";
    return;
  }

  const product = PRODUCTS[productId];

  try{

    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);

    const coins = snap.data().coins || 0;

    if(coins < price){
      alert("Not enough coins ❌");
      return;
    }

    // 1️⃣ deduct coins
    await updateDoc(userRef,{
      coins: increment(-price)
    });

    // 2️⃣ SAVE ORDER (FIXED PATH)
    await addDoc(
      collection(db,"orders",user.uid,"items"),
      {
        productId,
        name: product.name,
        price,
        link: product.link,
        createdAt: serverTimestamp()
      }
    );

    alert("Purchase Successful 🎉");

    switchButton(productId, product.link);

  }catch(err){
    console.error(err);
    alert("Something went wrong. Try again.");
  }
}


// ===================================================
// OWNERSHIP CHECK
// ===================================================
async function checkOwnership(productId, buttonEl){

  const user = auth.currentUser;
  if(!user) return;

  const q = query(
    collection(db,"orders",user.uid,"items"),
    where("productId","==",productId),
    limit(1)
  );

  const snap = await getDocs(q);

  if(!snap.empty){
    const data = snap.docs[0].data();

    buttonEl.innerText = "Open Product";
    buttonEl.onclick = ()=> window.open(data.link,"_blank");
  }
}


// ===================================================
function switchButton(productId, link){

  const btn = document.querySelector(`[onclick*="${productId}"]`);
  if(!btn) return;

  btn.innerText = "Open Product";
  btn.onclick = ()=> window.open(link,"_blank");
}


// GLOBAL
window.buyProduct = buyProduct;
window.checkOwnership = checkOwnership;


// AUTH READY
onAuthStateChanged(auth,()=>{});
