// =======================================
// ADMIN USERS MANAGEMENT
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const usersTable = document.getElementById("usersTable");
const totalUsersEl = document.getElementById("totalUsers");
const totalCoinsEl = document.getElementById("totalCoins");

// =======================================
// LOAD USERS
// =======================================
async function loadUsers() {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    let usersCount = 0;
    let coinsSum = 0;

    usersTable.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      usersCount++;

      const name = data.name || "User";
      const email = data.email || "-";
      const coins = data.coins || 0;
      const joined = formatDate(data.createdAt);

      coinsSum += coins;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>${email}</td>
        <td>${coins}</td>
        <td>${joined}</td>
      `;

      usersTable.appendChild(tr);
    });

    // Dashboard update
    if (totalUsersEl) totalUsersEl.textContent = usersCount;
    if (totalCoinsEl) totalCoinsEl.textContent = coinsSum;

  } catch (error) {
    console.error("Users load error:", error);
  }
}

// =======================================
// DATE FORMATTER
// =======================================
function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// =======================================
// INIT
// =======================================
loadUsers();
