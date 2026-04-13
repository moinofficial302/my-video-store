// Sounds load
const soundDetails = document.getElementById("sound-details");
const soundBuy = document.getElementById("sound-buy");
const soundNav = document.getElementById("sound-nav");

// Smooth play
function playSound(sound) {
  const clone = sound.cloneNode();
  clone.play();
}

// Details button (FIXED)
document.querySelectorAll(".details-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundDetails);
  });
});

// Buy button (FIXED)
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundBuy);
  });
});

// Nav button (already correct)
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundNav);
  });
});
