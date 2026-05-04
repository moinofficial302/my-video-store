// =======================================
// ADMIN USERS MANAGEMENT — FULL DETAILS
// Name, Gmail, Number, Login date+time,
// Coins available, Coins spent, Withdrawn
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const usersTable   = document.getElementById("usersTable");
const totalUsersEl = document.getElementById("totalUsers");
const totalCoinsEl = document.getElementById("totalCoins");

// =======================================
// LOAD USERS
// =======================================
async function loadUsers() {
  if (!usersTable) return;
  usersTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b;">Loading...</td></tr>`;

  try {
    const q        = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    let usersCount = 0;
    let coinsSum   = 0;

    usersTable.innerHTML = "";

    if (snapshot.empty) {
      usersTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b;">No users found</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      usersCount++;

      const name      = d.name   || "—";
      const email     = d.email  || "—";
      const phone     = d.phone  || d.number || d.mobile || "—";
      const coins     = d.coins  || 0;
      const spent     = d.coinsSpent   || d.totalSpent      || 0;
      const withdrawn = d.withdrawTotal || d.totalWithdrawn  || 0;

      const joinedDate = formatDate(d.createdAt);
      const joinedTime = formatTime(d.createdAt);
      const lastLogin  = d.lastLogin
        ? formatDate(d.lastLogin) + " · " + formatTime(d.lastLogin)
        : "—";

      coinsSum += coins;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700;color:#0f172a;">${name}</div>
        </td>
        <td style="color:#374151;">${email}</td>
        <td style="color:#374151;">${phone}</td>
        <td>
          <div style="font-weight:600;font-size:13px;">${joinedDate}</div>
          <div style="font-size:11px;color:#64748b;">${joinedTime}</div>
        </td>
        <td style="font-size:13px;color:#374151;">${lastLogin}</td>
        <td>
          <span style="background:#eff6ff;color:#1d4ed8;padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
            🪙 ${coins}
          </span>
        </td>
        <td>
          <span style="background:#fef9c3;color:#854d0e;padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
            💸 ${spent}
          </span>
        </td>
        <td>
          <span style="background:#fef2f2;color:#b91c1c;padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
            📤 ${withdrawn}
          </span>
        </td>
      `;
      usersTable.appendChild(tr);
    });

    if (totalUsersEl) totalUsersEl.textContent = usersCount;
    if (totalCoinsEl) totalCoinsEl.textContent  = coinsSum;

  } catch (err) {
    console.error("Users load error:", err);
    usersTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#ef4444;">Error: ${err.message}</td></tr>`;
  }
}

// =======================================
// FORMATTERS
// =======================================
function formatDate(ts) {
  if (!ts) return "—";
  try {
    const d = ts.toDate();
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function formatTime(ts) {
  if (!ts) return "—";
  try {
    const d = ts.toDate();
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return "—"; }
}

// =======================================
// INIT
// =======================================
loadUsers();
