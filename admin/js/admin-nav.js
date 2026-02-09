document.addEventListener("DOMContentLoaded", () => {

  const navItems = document.querySelectorAll(".admin-sidebar button[data-section]");
  const sections = document.querySelectorAll(".admin-section");
  const sectionTitle = document.getElementById("sectionTitle");

  navItems.forEach(btn => {

    btn.addEventListener("click", () => {

      const target = btn.dataset.section;

      // remove old active
      navItems.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // hide all sections
      sections.forEach(sec => sec.classList.remove("active"));

      // show clicked section
      const activeSection = document.getElementById(target);
      if (activeSection) activeSection.classList.add("active");

      // change header title
      if (sectionTitle) {
        sectionTitle.textContent =
          btn.innerText.replace(/^[^a-zA-Z]+/, "").trim();
      }

    });

  });

});
