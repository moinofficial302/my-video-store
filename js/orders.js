// ================================
// MY ORDERS LOGIC
// ================================

function loadOrders() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const ordersList = document.getElementById("ordersList");

    firebase.firestore()
      .collection("orders")
      .doc(user.uid)
      .collection("items")
      .get()
      .then(snapshot => {

        if (snapshot.empty) {
          ordersList.innerHTML = `
            <div class="order-card">
              <h3>No Orders Found</h3>
              <p>You have not purchased any product yet.</p>
            </div>
          `;
          return;
        }

        snapshot.forEach(doc => {
          const data = doc.data();

          const div = document.createElement("div");
          div.className = "order-card";

          div.innerHTML = `
            <h3>${data.name}</h3>
            <p>Purchased with ${data.price} Coins</p>
            <button class="open-btn" onclick="openProduct('${data.link}')">
              Open Product
            </button>
          `;

          ordersList.appendChild(div);
        });

      })
      .catch(err => {
        console.error(err);
        ordersList.innerHTML = "<p>Error loading orders</p>";
      });
  });
}

function openProduct(link) {
  window.open(link, "_blank");
}
