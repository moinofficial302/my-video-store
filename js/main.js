// Sounds load
const soundDetails = document.getElementById("sound-details");
const soundBuy = document.getElementById("sound-buy");
const soundNav = document.getElementById("sound-nav");

// Function
function playSound(sound) {
  const clone = sound.cloneNode(); // smooth play
  clone.play();
}

// Details button
document.querySelectorAll(".btn-details").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundDetails);
  });
});

// Buy button
document.querySelectorAll(".btn-buy").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundBuy);
  });
});

// Nav buttons (FIXED)
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundNav);
  });
});
