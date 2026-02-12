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
// 15 GB PRODUCTS
// ================================


const PRODUCTS = {
  "editing-pack": {
    id: "editing-pack",
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://t.me/+IL4ujN1xwp83ZmVl"
  }
};

// ================================
// 50 GB PRODUCTS
// ================================

  // ⭐ NEW 50GB
  "editing-pack-50": {
    id: "editing-pack-50",
    name: "50 GB Editing Pack",
    price: 199,
    link: "https://t.me/+s8atnzggnmsyZDhl"
  }

};











// ===================================================
// 🔥 BUY PRODUCT (ULTRA SAFE)
// ===================================================
async function buyProduct(productId){

  const user = auth.currentUser;

  if(!user){
    alert("Login first");
    location.href = "login.html";
    return;
  }

  const product = PRODUCTS[productId];
  if(!product) return;

  try{

    // ====================
    // ⭐ ALREADY OWNED CHECK
    // ====================
    const ownedQuery = query(
      collection(db,"orders"),
      where("uid","==",user.uid),
      where("productId","==",productId),
      limit(1)
    );

    const ownedSnap = await getDocs(ownedQuery);

    // already purchased → just open
    if(!ownedSnap.empty){
      window.open(product.link,"_blank");
      return;
    }

    // ====================
    // wallet check
    // ====================
    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);

    const coins = snap.data().coins || 0;

    if(coins < product.price){
      alert("Not enough coins ❌");
      return;
    }

    // deduct coins
    await updateDoc(userRef,{
      coins: increment(-product.price)
    });

    // ⭐ SAVE ORDER (SINGLE COLLECTION)
    await addDoc(collection(db,"orders"),{
      uid: user.uid,
      productId,
      name: product.name,
      price: product.price,
      link: product.link,
      createdAt: serverTimestamp()
    });

    alert("Purchase Successful 🎉");

    switchButton(productId, product.link);

  }catch(err){
    console.error(err);
    alert("Something went wrong. Try again.");
  }
}


// ===================================================
// 🔥 OWNERSHIP CHECK (REFRESH SAFE)
// ===================================================
async function checkOwnership(productId, buttonEl){

  const user = auth.currentUser;
  if(!user) return;

  const q = query(
    collection(db,"orders"),
    where("uid","==",user.uid),
    where("productId","==",productId),
    limit(1)
  );

  const snap = await getDocs(q);

  if(!snap.empty){
    const data = snap.docs[0].data();

    buttonEl.innerText = "Open Product";
    buttonEl.onclick = ()=> window.open(data.link,"_blank");
    buttonEl.classList.add("owned");
  }
}


// ===================================================
function switchButton(productId, link){

  const btn = document.querySelector(`[onclick*="${productId}"]`);
  if(!btn) return;

  btn.innerText = "Open Product";
  btn.onclick = ()=> window.open(link,"_blank");
  btn.classList.add("owned");
}


// ===================================================
// GLOBAL EXPORT
// ===================================================
window.buyProduct = buyProduct;
window.checkOwnership = checkOwnership;


// ===================================================
// AUTO CHECK AFTER LOGIN (VERY IMPORTANT)
// ===================================================
onAuthStateChanged(auth,()=>{

  const btn = document.getElementById("buy-editing");
  if(btn) checkOwnership("editing-pack", btn);

});
