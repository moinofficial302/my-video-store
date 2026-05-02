// =======================================
// ADMIN PRODUCTS MANAGEMENT
// Firebase + Modal UI (No prompt())
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
const addBtn        = document.getElementById("addProductBtn");
const modal         = document.getElementById("productModalBackdrop");
const closeBtn      = document.getElementById("closeProductModal");
const cancelBtn     = document.getElementById("cancelProductModal");
const saveBtn       = document.getElementById("saveProductBtn");

// =======================================
// OPEN / CLOSE MODAL
// =======================================
function openModal(data = {}) {
  document.getElementById("pName").value  = data.name  || "";
  document.getElementById("pPrice").value = data.price || "";
  document.getElementById("pType").value  = data.type  || "";
  document.getElementById("pStock").value = data.stock || "";
  document.getElementById("pDesc").value  = data.desc  || "";
  document.getElementById("pImage").value = data.image || "";

  // Store editing ID if editing existing product
  saveBtn.dataset.editId       = data.id || "";
  saveBtn.dataset.deliveryLink = data.deliveryLink || "";

  // Change button label
  saveBtn.textContent = data.id ? "✔ Update Product" : "+ Add Product";

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  saveBtn.dataset.editId = "";
}

addBtn.addEventListener("click", () => openModal());
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// =======================================
// SAVE (ADD or UPDATE)
// =======================================
saveBtn.addEventListener("click", async () => {
  const name          = document.getElementById("pName").value.trim();
  const price         = Number(document.getElementById("pPrice").value.trim());
  const type          = document.getElementById("pType").value.trim();
  const image         = document.getElementById("pImage").value.trim();
  const deliveryLink  = saveBtn.dataset.deliveryLink || "";
  const editId        = saveBtn.dataset.editId;

  if (!name || !price || !type) {
    alert("Please fill in Name, Price, and Type.");
    return;
  }

  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  try {
    if (editId) {
      // UPDATE existing product
      await updateDoc(doc(db, "products", editId), {
        name, price, type, image
      });
      alert("Product updated!");
    } else {
      // ADD new product
      await addDoc(collection(db, "products"), {
        name,
        price,
        type,
        image,
        deliveryLink,
        active: true,
        createdAt: serverTimestamp()
      });
      alert("Product added!");
    }

    closeModal();
    loadProducts();

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "+ Add Product";
  }
});

// =======================================
// LOAD PRODUCTS
// =======================================
async function loadProducts() {
  productsTable.innerHTML = `<tr><td colspan="5" class="empty-row">Loading...</td></tr>`;

  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (snapshot.empty) {
      productsTable.innerHTML = `<tr><td colspan="5" class="empty-row">No products found</td></tr>`;
      return;
    }

    productsTable.innerHTML = "";

    snapshot.forEach(docSnap => {
      const p  = docSnap.data();
      const id = docSnap.id;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.price} coins</td>
        <td><span class="badge pending">${p.type}</span></td>
        <td>
          <span class="badge ${p.active ? 'success' : 'cancel'}">
            ${p.active ? "Active" : "Disabled"}
          </span>
        </td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-primary" style="font-size:12px;padding:5px 10px;"
            onclick="editProduct('${id}')">✏️ Edit</button>
          <button class="btn" style="font-size:12px;padding:5px 10px;background:${p.active ? '#f59e0b' : '#10b981'};color:#fff;"
            onclick="toggleProduct('${id}', ${p.active})">
            ${p.active ? "Disable" : "Enable"}
          </button>
          <button class="btn btn-danger" style="font-size:12px;padding:5px 10px;"
            onclick="deleteProduct('${id}')">🗑 Delete</button>
        </td>
      `;

      productsTable.appendChild(tr);
    });

  } catch (err) {
    productsTable.innerHTML = `<tr><td colspan="5" class="empty-row">Error loading products: ${err.message}</td></tr>`;
  }
}

// =======================================
// EDIT — Opens modal with existing data
// =======================================
window.editProduct = async (id) => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(docSnap => {
      if (docSnap.id === id) {
        const p = docSnap.data();
        openModal({
          id,
          name:         p.name,
          price:        p.price,
          type:         p.type,
          image:        p.image || "",
          deliveryLink: p.deliveryLink || "",
          desc:         p.desc || ""
        });
      }
    });
  } catch (err) {
    alert("Error loading product: " + err.message);
  }
};

// =======================================
// ENABLE / DISABLE
// =======================================
window.toggleProduct = async (id, active) => {
  try {
    await updateDoc(doc(db, "products", id), { active: !active });
    loadProducts();
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// =======================================
// DELETE
// =======================================
window.deleteProduct = async (id) => {
  if (!confirm("Delete this product permanently?")) return;
  try {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// =======================================
// INIT
// =======================================
loadProducts();
