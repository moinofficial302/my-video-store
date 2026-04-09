let selectedRating = 0;

const stars = document.querySelectorAll("#starSelect span");

stars.forEach((star, index) => {
star.addEventListener("click", () => {

selectedRating = index + 1;

// Reset sab stars
stars.forEach(s => s.classList.remove("active"));

// Active stars fill karo
for(let i = 0; i <= index; i++){
  stars[i].classList.add("active");
}

console.log("Selected Rating:", selectedRating);

});
});
