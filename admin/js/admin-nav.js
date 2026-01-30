document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".admin-section");
  const sectionTitle = document.getElementById("sectionTitle");

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.section;
      console.log("Clicked:", target);

      navItems.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach(sec => sec.classList.remove("active"));

      const activeSection = document.getElementById(target);
      if (activeSection) activeSection.classList.add("active");

      if (sectionTitle) {
        sectionTitle.textContent =
          btn.innerText.replace(/^[^a-zA-Z]+/, "").trim();
      }
    });
  });
});
