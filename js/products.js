// ==================================
// PRODUCTS BUY LOGIC (FIREBASE REAL)
// ==================================

function buyProduct(productId, price) {

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

      // ✅ PRODUCT DETAILS (static mapping)
      const products = {
        "editing-pack": {
          name: "15 GB Editing Pack",
          link: "https://drive.google.com/YOUR_REAL_LINK"
        }
      };

      const product = products[productId];
      if (!product) {
        alert("Invalid product");
        return;
      }

      // 🔥 COINS CUT
      userRef.update({
        coins: firebase.firestore.FieldValue.increment(-price)
      });

      // 🧾 SAVE ORDER
      firebase.firestore()
        .collection("orders")
        .doc(user.uid)
        .collection("items")
        .add({
          productId: productId,
          name: product.name,
          price: price,
          link: product.link,
          time: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {

          alert("Purchase Successful 🎉");

          // 🔁 BUY → OPEN PRODUCT
          document.querySelectorAll(".buy-btn").forEach(btn => {
            if (btn.getAttribute("onclick")?.includes(productId)) {
              btn.innerText = "Open Product";
              btn.onclick = () => window.open(product.link, "_blank");
            }
          });

        });

    });

  });
}
