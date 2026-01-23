// ================================
// PRODUCTS / BUY LOGIC (STEP 1)
// ================================

// Temporary demo wallet (abhi Firebase nahi)
let demoWalletCoins = 0; 
// testing ke liye chaaho to 100 likh sakte ho
// let demoWalletCoins = 100;

function buyProduct(productId, price) {
  console.log("Buy clicked:", productId, price);

  // 🔒 LOGIN CHECK (abhi demo)
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    alert("Please login first to continue");
    window.location.href = "login.html";
    return;
  }

  // 💰 WALLET CHECK (demo)
  if (demoWalletCoins < price) {
    alert(
      "Insufficient coins!\n\n" +
      "Required: " + price + " Coins\n" +
      "Available: " + demoWalletCoins + " Coins\n\n" +
      "Please add money first."
    );
    window.location.href = "add-money.html";
    return;
  }

  // ✅ BUY SUCCESS (demo)
  demoWalletCoins -= price;

  alert(
    "Purchase Successful 🎉\n\n" +
    "Product: " + productId + "\n" +
    "Coins deducted: " + price + "\n" +
    "Remaining coins: " + demoWalletCoins
  );

  // Button text change (basic)
  const buttons = document.querySelectorAll(".buy-btn, .scroll-buy");
  buttons.forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(productId)) {
      btn.innerText = "Open Product";
    }
  });
}
