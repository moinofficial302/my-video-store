function switchTab(tabId, el) {
  // Hide all sections
  document.querySelectorAll(".tab-section").forEach(sec => {
    sec.classList.remove("active");
  });

  // Remove active from nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });

  // Show selected section
  document.getElementById(tabId).classList.add("active");

  // Activate nav button
  el.classList.add("active");
}
