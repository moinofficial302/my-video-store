// =======================================
// ADMIN PRODUCTS MANAGEMENT
// =======================================

import { db } from "../../js/firebase-init.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productsTable = document.getElementById("productsTable");
const addBtn = document.getElementById("addProductBtn");

// =======================================
// LOAD PRODUCTS
// =======================================
async function loadProducts() {
  productsTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td>${p.type}</td>
      <td>${p.active ? "Active" : "Disabled"}</td>
      <td>
        <button class="btn" onclick="editProduct('${docSnap.id}')">✏️</button>
        <button class="btn" onclick="toggleProduct('${docSnap.id}', ${p.active})">
          ${p.active ? "Disable" : "Enable"}
        </button>
        <button class="btn btn-danger" onclick="deleteProduct('${docSnap.id}')">🗑</button>
      </td>
    `;

    productsTable.appendChild(tr);
  });
}

// =======================================
// ADD PRODUCT
// =======================================
addBtn.addEventListener("click", async () => {
  const name = prompt("Product name");
  const price = Number(prompt("Price in coins"));
  const type = prompt("Type (bundle / ai / social)");
  const image = prompt("Image URL");
  const deliveryLink = prompt("Delivery link");

  if (!name || !price) return;

  await addDoc(collection(db, "products"), {
    name,
    price,
    type,
    image,
    deliveryLink,
    active: true,
    createdAt: serverTimestamp()
  });

  alert("Product added");
  loadProducts();
});

// =======================================
// EDIT PRODUCT
// =======================================
window.editProduct = async (id) => {
  const name = prompt("New name");
  const price = Number(prompt("New price"));
  const deliveryLink = prompt("New delivery link");

  if (!name || !price) return;

  await updateDoc(doc(db, "products", id), {
    name,
    price,
    deliveryLink
  });

  alert("Product updated");
  loadProducts();
};

// =======================================
// ENABLE / DISABLE
// =======================================
window.toggleProduct = async (id, active) => {
  await updateDoc(doc(db, "products", id), {
    active: !active
  });

  loadProducts();
};

// =======================================
// DELETE PRODUCT
// =======================================
window.deleteProduct = async (id) => {
  if (!confirm("Delete product permanently?")) return;

  await deleteDoc(doc(db, "products", id));
  loadProducts();
};

// =======================================
// INIT
// =======================================
loadProducts();
