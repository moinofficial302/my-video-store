// =======================================
// ADMIN ORDERS / SALES
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ordersTable = document.getElementById("ordersTable");

async function loadOrders() {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    ordersTable.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.userEmail}</td>
        <td>${data.productName}</td>
        <td>${data.coins}</td>
        <td>${formatDate(data.createdAt)}</td>
        <td>
          <a href="${data.deliveryLink}" target="_blank">
            Open Link
          </a>
        </td>
      `;

      ordersTable.appendChild(tr);
    });

  } catch (err) {
    console.error("Orders load error:", err);
  }
}

function formatDate(ts) {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("en-IN");
}

loadOrders();
