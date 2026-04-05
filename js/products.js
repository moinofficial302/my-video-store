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

  const userRef = doc(db,"users",user.uid);

  // 🔒 prevent double click
  if(window.__buyLock) return;
  window.__buyLock = true;

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

    if(!ownedSnap.empty){
      window.open(product.link,"_blank");
      window.__buyLock = false;
      return;
    }

    // ====================
    // 💰 WALLET CHECK
    // ====================
    const snap = await getDoc(userRef);

    if(!snap.exists()){
      alert("User data not found");
      window.__buyLock = false;
      return;
    }

    const coins = Number(snap.data()?.coins ?? 0);

    if(coins < product.price){
      showLowBalancePopup(product.price, coins);
      window.__buyLock = false;
      return;
    }

    // ====================
    // 🔒 DOUBLE CHECK
    // ====================
    const latestSnap = await getDoc(userRef);
    const latestCoins = Number(latestSnap.data()?.coins ?? 0);

    if(latestCoins < product.price){
      showLowBalancePopup(product.price, latestCoins);
      window.__buyLock = false;
      return;
    }

    // ====================
    // 💰 DEDUCT FIRST (SAFE)
    // ====================
    await updateDoc(userRef,{
      coins: increment(-product.price)
    });

    // ====================
    // 🧾 SAVE ORDER
    // ====================
    await addDoc(collection(db,"orders"),{
      uid: user.uid,
      productId,
      name: product.name,
      price: product.price,
      link: product.link,
      createdAt: serverTimestamp()
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

  // 🔓 unlock
  window.__buyLock = false;
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

  

  // ===== BUTTON CHECKS =====
const btnCat = document.getElementById("buy-cat");
if (btnCat) checkOwnership("cat", btnCat);

const btnWoman = document.getElementById("buy-womangym");
if (btnWoman) checkOwnership("womangym", btnWoman);

const btnSanatani = document.getElementById("buy-sanatani");
if (btnSanatani) checkOwnership("sanatani", btnSanatani);

const btnStock = document.getElementById("buy-stock");
if (btnStock) checkOwnership("stock", btnStock);


// ==========================================
// 🔥 LOW BALANCE POPUP (GLOBAL FUNCTION)
// ==========================================
  
   function showLowBalancePopup(price, coins){

  const needed = Math.max(price - coins, 0);

  // 🧹 remove old popup if exists
  const old = document.getElementById("lowBalanceModal");
  if(old) old.remove();

  // 🔒 lock background scroll
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
      animation:fadeIn 0.2s ease;
    ">
      <div style="
        background:#fff;
        padding:22px;
        border-radius:18px;
        width:90%;
        max-width:320px;
        text-align:center;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);
        animation:scaleIn 0.2s ease;
      ">
        <p style="margin-bottom:10px; font-weight:600; font-size:16px;">
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
            font-weight:500;
          ">OK</button>

          <button id="addMoneyBtn" style="
            flex:1;
            padding:11px;
            border:none;
            border-radius:10px;
            background:linear-gradient(135deg,#FFD700,#facc15);
            font-weight:600;
          ">Add Money</button>

        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity:0 }
        to { opacity:1 }
      }

      @keyframes scaleIn {
        from { transform:scale(0.9); opacity:0 }
        to { transform:scale(1); opacity:1 }
      }
    </style>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    document.body.style.overflow = ""; // unlock scroll
  };

  // ✅ button close
  document.getElementById("closePopup").onclick = close;

  // ✅ redirect
  document.getElementById("addMoneyBtn").onclick = () => {
    window.location.href = "add-money.html";
  };

  // ✅ click outside close
  document.getElementById("overlay").onclick = (e) => {
    if(e.target.id === "overlay") close();
  };

  // ✅ ESC key close
  document.addEventListener("keydown", function esc(e){
    if(e.key === "Escape"){
      close();
      document.removeEventListener("keydown", esc);
    }
  });
  }
