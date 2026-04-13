// Sounds load
const soundDetails = document.getElementById("sound-details");
const soundBuy = document.getElementById("sound-buy");
const soundNav = document.getElementById("sound-nav");

// Function (clean play)
function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
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

// Nav buttons
document.querySelectorAll(".btn-nav").forEach(btn => {
  btn.addEventListener("click", () => {
    playSound(soundNav);
  });
});
