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

      // ✅ Try all possible field names
      const name  = d.name || d.displayName || d.username || d.fullName || "—";

      // ✅ Email — Google login users ke paas email hoti hai
      const email = d.email || d.gmail || "—";

      // ✅ Phone — try all possible field names
      const phone = d.phone || d.phoneNumber || d.mobile || d.number || d.contact || "—";

      const coins     = Number(d.coins     || 0);
      const spent     = Number(d.coinsSpent || d.totalSpent || d.spent || 0);
      const withdrawn = Number(d.withdrawTotal || d.totalWithdrawn || d.withdrawn || 0);

      // ✅ Joined date — createdAt
      const joinedDate = formatDate(d.createdAt);
      const joinedTime = formatTime(d.createdAt);

      // ✅ Last login
      const hasLastLogin = d.lastLogin != null;
      const lastLoginDate = hasLastLogin ? formatDate(d.lastLogin) : "—";
      const lastLoginTime = hasLastLogin ? formatTime(d.lastLogin) : "";

      coinsSum += coins;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700;color:#0f172a;">${name}</div>
        </td>
        <td style="color:#374151;font-size:13px;">${email}</td>
        <td style="color:#374151;">${phone}</td>
        <td>
          <div style="font-weight:600;font-size:13px;">${joinedDate}</div>
          <div style="font-size:11px;color:#64748b;">${joinedTime}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13px;">${lastLoginDate}</div>
          <div style="font-size:11px;color:#64748b;">${lastLoginTime}</div>
        </td>
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
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return ""; }
}

// =======================================
// INIT
// =======================================
loadUsers();
