// ================================
// MY ORDERS – FIREBASE LOGIC
// ================================

function loadOrders() {

  firebase.auth().onAuthStateChanged(user => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = ""; // reset

    firebase.firestore()
      .collection("orders")
      .doc(user.uid)
      .collection("items")
      .orderBy("time", "desc")
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

          const card = document.createElement("div");
          card.className = "order-card";

          card.innerHTML = `
            <h3>${data.name}</h3>
            <p>Paid: ${data.price} Coins</p>
            <button 
              class="open-btn"
              data-link="${data.link}">
              Open Product
            </button>
          `;

          const btn = card.querySelector(".open-btn");
          btn.addEventListener("click", () => {
            openProduct(data.link);
          });

          ordersList.appendChild(card);
        });

      })
      .catch(error => {
        console.error("Orders load error:", error);
        ordersList.innerHTML = `
          <div class="order-card">
            <h3>Error</h3>
            <p>Unable to load orders. Please try again.</p>
          </div>
        `;
      });

  });
}


// ================================
// OPEN PRODUCT
// ================================
function openProduct(link) {
  if (!link) {
    alert("Product link not available");
    return;
  }
  window.open(link, "_blank");
}
