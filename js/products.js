// ================================
// PRODUCTS MASTER DATA (SINGLE SOURCE)
// ================================

const PRODUCTS = {
  "editing-pack": {
    id: "editing-pack",
    name: "15 GB Editing Pack",
    price: 99,
    link: "https://drive.google.com/drive/folders/1GnAZnX64ObyQMW2eWHpyjxwNJANcAQcD"
  }
};


// ==================================
// BUY PRODUCT (FIREBASE REAL LOGIC)
// ==================================

function buyProduct(productId, price) {

  const product = PRODUCTS[productId];
  if (!product) {
    alert("Invalid product");
    return;
  }

  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const userRef = firebase.firestore().collection("users").doc(user.uid);

    userRef.get().then(doc => {
      if (!doc.exists) {
        alert("User wallet not found");
        return;
      }

      const coins = doc.data().coins || 0;

      // 💰 COINS CHECK
      if (coins < price) {
        alert(
          "Insufficient Coins!\n\n" +
          "Required: " + price + "\n" +
          "Available: " + coins
        );
        return;
      }

      // 🔥 CUT COINS
      userRef.update({
        coins: firebase.firestore.FieldValue.increment(-price)
      });

      // 🧾 SAVE ORDER (NO DUPLICATE)
      const orderRef = firebase.firestore()
        .collection("orders")
        .doc(user.uid)
        .collection("items")
        .doc(productId);

      orderRef.set({
        productId: product.id,
        name: product.name,
        price: product.price,
        link: product.link,
        time: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        alert("Purchase Successful 🎉");
        switchToOpenButton(productId, product.link);
      });

    });

  });
}


// ==================================
// SWITCH BUY → OPEN PRODUCT
// ==================================

function switchToOpenButton(productId, link) {
  document.querySelectorAll(".buy-btn").forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(productId)) {
      btn.innerText = "Open Product";
      btn.onclick = () => window.open(link, "_blank");
      btn.classList.add("owned");
    }
  });
}


// ==================================
// OWNERSHIP CHECK (AUTO ON LOAD)
// ==================================
function checkOwnership(productId, buttonEl) {
  const product = PRODUCTS[productId];
  if (!product) return;

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;

    firebase.firestore()
      .collection("orders")
      .doc(user.uid)
      .collection("items")
      .doc(productId)
      .get()
      .then(doc => {
        if (doc.exists) {
          buttonEl.innerText = "Open Product";
          buttonEl.onclick = () => window.open(doc.data().link, "_blank");
          buttonEl.classList.add("owned");
        }
      });
  });
}
