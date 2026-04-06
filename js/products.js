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
  serverTimestamp,
  runTransaction,
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
  link: "https://t.me/+2IyBE_5HnSM4OGZl"
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


// Trending 🔥 

"cat": {
  id: "cat",
  name: "Cat Story's Bundle",
  price: 49,
  link: "https://t.me/+nZFG56dvOtllYWM1"
},

"womangym": {
  id: "womangym",
  name: "Woman Gym Bundle",
  price: 49,
  link: "https://t.me/+mvcCrk4Cs4RlZGZl"
},

"sanatani": {
  id: "sanatani",
  name: "Sanatani AI Reel Bundle",
  price: 49,
  link: "https://t.me/+arh3HN21b1dkOTk9"
},


"stock": {
  id: "stock",
  name: "Stock Market Bundle",
  price: 49,
  link: "https://t.me/+mqdMzFHqoPdlYWNl"
},
};



// ===================================================
// 🔥 BUY PRODUCT (FINAL PRODUCTION SAFE)
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

  const userRef = doc(db,"users",user.uid);

  // 🔒 prevent double click
  if(window.__buyLock) return;
  window.__buyLock = true;

  try{

    // ====================
    // ⭐ ALREADY OWNED CHECK
    // ====================
    
    // 🔒 FINAL SAFE CHECK (SERVER-LIKE)
const existingOrderQuery = query(
  collection(db,"orders"),
  where("uid","==",user.uid),
  where("productId","==",productId),
  limit(1)
);

const existingSnap = await getDocs(existingOrderQuery);

if(!existingSnap.empty){
  window.open(product.link,"_blank");
  return;
}

    // ====================
    // 💰 WALLET CHECK
    // ====================

await runTransaction(db, async (transaction) => {

  const userDoc = await transaction.get(userRef);

  if(!userDoc.exists()){
    alert("User data not found");
    throw "User not found";
  }

  const coins = Number(userDoc.data()?.coins ?? 0);

  if(coins < product.price){
    showLowBalancePopup(product.price, coins);
    throw "Insufficient balance";
  }

  // 💰 deduct
  transaction.update(userRef, {
    coins: coins - product.price
  });
  
// ====================
  // 🧾 order
  // ====================
  
  const orderRef = doc(collection(db,"orders"));
  transaction.set(orderRef,{
    uid: user.uid,
    productId,
    name: product.name,
    price: product.price,
    link: product.link,
    createdAt: serverTimestamp()
  });
});
    // ====================
    // ✅ SUCCESS
    // ====================
    alert("Purchase Successful 🎉");
    switchButton(productId, product.link);

  }catch(err){
    console.error("BUY ERROR:", err);
    alert("Something went wrong. Try again.");
  }
  finally{
    // 🔓 ALWAYS UNLOCK
    window.__buyLock = false;
  }
}


// ===================================================
// 🔥 OWNERSHIP CHECK (OPTIMIZED)
// ===================================================
async function checkOwnership(productId, buttonEl){

  const user = auth.currentUser;
  if(!user || !buttonEl) return;

  try{
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
  }catch(err){
    console.error("Ownership Error:", err);
  }
}


// ===================================================
// 🔄 BUTTON SWITCH
// ===================================================
function switchButton(productId, link){

  const btn = document.getElementById("buy-" + productId);
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
// 🔥 AUTO OWNERSHIP CHECK (SMART VERSION)
// ===================================================
onAuthStateChanged(auth, async (user) => {

  if(!user) return;

  try{
    // 🔥 ek hi query me sab orders fetch (FAST)
    const ordersSnap = await getDocs(
      query(
        collection(db,"orders"),
        where("uid","==",user.uid)
      )
    );

    // 🔥 purchased products ka set
    const ownedProducts = new Set();

    ordersSnap.forEach(doc=>{
      ownedProducts.add(doc.data().productId);
    });

    // 🔥 ALL buttons auto detect
    Object.keys(PRODUCTS).forEach(productId => {

      const btn = document.getElementById("buy-" + productId);
      if(!btn) return;

      if(ownedProducts.has(productId)){
        const product = PRODUCTS[productId];

        btn.innerText = "Open Product";
        btn.onclick = ()=> window.open(product.link,"_blank");
        btn.classList.add("owned");
      }
    });

  }catch(err){
    console.error("Auto Ownership Error:", err);
  }

});


// ===================================================
// 🔥 LOW BALANCE POPUP (FINAL PRO)
// ===================================================
function showLowBalancePopup(price, coins){

  const needed = Math.max(price - coins, 0);

  // 🧹 remove old popup
  const old = document.getElementById("lowBalanceModal");
  if(old) old.remove();

  // 🔒 lock scroll
  document.body.style.overflow = "hidden";

  const modal = document.createElement("div");
  modal.id = "lowBalanceModal";

  modal.innerHTML = `
    <div id="overlay" style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.6);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:9999;
    ">
      <div style="
        background:#fff;
        padding:22px;
        border-radius:18px;
        width:90%;
        max-width:320px;
        text-align:center;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);
      ">
        <p style="margin-bottom:10px; font-weight:600;">
          Oops 😅 Insufficient Balance
        </p>

        <p style="font-size:14px; color:#666;">
          You need ₹${needed} more coins
        </p>

        <div style="display:flex; gap:8px; margin-top:20px;">
          
          <button id="closePopup" style="
            flex:1;
            padding:11px;
            border:none;
            border-radius:10px;
            background:#ddd;
          ">OK</button>

          <button id="addMoneyBtn" style="
            flex:1;
            padding:11px;
            border:none;
            border-radius:10px;
            background:#FFD700;
            font-weight:600;
          ">Add Money</button>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    document.body.style.overflow = "";
  };

  // ✅ buttons
  document.getElementById("closePopup").onclick = close;

  document.getElementById("addMoneyBtn").onclick = () => {
    window.location.href = "add-money.html";
  };

  // ✅ outside click
  document.getElementById("overlay").onclick = (e)=>{
    if(e.target.id === "overlay") close();
  };

  // ✅ ESC close
  document.addEventListener("keydown", function esc(e){
    if(e.key === "Escape"){
      close();
      document.removeEventListener("keydown", esc);
    }
  });
       }
