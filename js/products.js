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
//     Ai-Editing.HTML (FIXED)
// ================================
const PRODUCTS = {

  "editing-pack": {
    id: "editing-pack",
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://t.me/+IL4ujN1xwp83ZmVl"
  },

"editing-pack-50": {
  id: "editing-pack-50",
  name: "50 GB Editing Pack",
  price: 199,
  link: "https://t.me/+s8atnzggnmsyZDhl"
},

// ================= Indec.HTML =================

"hulk": {
  id: "hulk",
  name: "Hulk Videos Bundle",
  price: 39,
  link: "https://t.me/+dGMtUHj_-01mMWJl"
},

"Food": {
  id: "Food",
  name: "Food Cutting Bundle",
  price: 39,
  link: "https://t.me/+c3hgz5tNXW85YTdl"
},

  "Car": {
  id: "Car",
  name: "Car Videos Bundle",
  price: 45,
  link: "https://t.me/+2IyBE_5hNsM4OGZl"
},

"anime": {
  id: "anime",
  name: "3000+ Anime Videos Bundle",
  price: 59,
  link: "https://t.me/+7lmwXA75UXk0NjE9"
},

"moral": {
  id: "moral",
  name: "500+ 2D Moral Story Bundle",
  price: 49,
  link: "https://t.me/+zF3wqqFXB5g5ZDU1"
},

  "monkey": {
  id: "monkey",
  name: "1000+ Monkey Vlog Videos Bundle",
  price: 49,
  link: "https://t.me/+pzhVW_ZuE6FkYjc1"
},

  "lifehack": {
  id: "lifehack",
  name: "3000+ Daily Life Hacks Videos",
  price: 55,
  link: "https://t.me/+RRsxLF1CDAE4OGY1"
},

"nature": {
  id: "nature",
  name: "1000+ Nature Videos Bundle",
  price: 49,
  link: "https://t.me/+LDwQyWtgRmVhMjll"
},

"horror": {
  id: "horror",
  name: "800+ Horror Videos Bundle",
  price: 49,
  link: "https://t.me/+oH4QIbUwnwI1ZDg1"
  
},
"art": {
  id: "art",
  name: "ART & Satisfying Videos Bundle",
  price: 49,
  link: "https://t.me/+lEOyW0QunpMwNjQ1"
},

"gym": {
  id: "gym",
  name: "Gym Boy & Attitude Videos",
  price: 55,
  link: "https://t.me/+fiDbbBaF_o80ZTY1"
},

"romantic": {
  id: "romantic",
  name: "2D Romantic Short Videos",
  price: 69,
  link: "https://t.me/+67WGMiWvUvc1M2M9"
},  
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


// ===============================
// AUTO CHECK AFTER LOGIN (VERY IMPORTANT)
// ===============================


// ===== ai Editing Page =====
onAuthStateChanged(auth, () => {

  const btn1 = document.getElementById("buy-editing");
  if (btn1) checkOwnership("editing-pack", btn1);

  const btn2 = document.getElementById("buy-editing-50");
  if (btn2) checkOwnership("editing-pack-50", btn2);


  // ===== index.HTML BUNDLE =====

  const bh = document.getElementById("buy-hulk");
  if (bh) checkOwnership("hulk", bh);

  const bf = document.getElementById("buy-food");
  if (bf) checkOwnership("Food", bf);

  const bc = document.getElementById("buy-car");
  if (bc) checkOwnership("Car", bc);

  const btnAnime = document.getElementById("buy-anime");
  if (btnAnime) checkOwnership("anime", btnAnime);

  const btnMoral = document.getElementById("buy-moral");
  if (btnMoral) checkOwnership("moral", btnMoral);

  const btn6 = document.getElementById("buy-monkey");
  if (btn6) checkOwnership("monkey", btn6);

  const btn7 = document.getElementById("buy-lifehack");
 if (btn7) checkOwnership("lifehack", btn7);

 const btn8 = document.getElementById("buy-nature");
 if (btn8) checkOwnership("nature", btn8);

 const btn9 = document.getElementById("buy-horror");
 if (btn9) checkOwnership("horror", btn9);

  const btn10 = document.getElementById("buy-art");
if (btn10) checkOwnership("art", btn10);

const btn11 = document.getElementById("buy-gym");
if (btn11) checkOwnership("gym", btn11);

const btn12 = document.getElementById("buy-romantic");
if (btn12) checkOwnership("romantic", btn12);
  
});
