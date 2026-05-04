// =======================================
// ADMIN PRODUCTS MANAGEMENT — FULL UPGRADE
// - Page selection: Bundle / AI & Editing / Social
// - Description field
// - Price + Discount Price
// - Image filename field
// - Type: Digital only
// - Firebase save + website pe dikhega
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
// OPEN MODAL
// =======================================
function openModal(data = {}) {
  document.getElementById("pPage").value          = data.page          || "";
  document.getElementById("pName").value          = data.name          || "";
  document.getElementById("pDesc").value          = data.desc          || "";
  document.getElementById("pPrice").value         = data.price         || "";
  document.getElementById("pDiscountPrice").value = data.discountPrice || "";
  document.getElementById("pImageName").value     = data.imageName     || "";
  document.getElementById("pImage").value         = data.image         || "";

  saveBtn.dataset.editId = data.id || "";
  saveBtn.textContent    = data.id ? "✔ Update Product" : "+ Add Product";

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  saveBtn.dataset.editId = "";
  // Clear all fields
  ["pPage","pName","pDesc","pPrice","pDiscountPrice","pImageName","pImage"]
    .forEach(id => { document.getElementById(id).value = ""; });
}

addBtn.addEventListener("click",   () => openModal());
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click",closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// =======================================
// SAVE (ADD or UPDATE)
// =======================================
saveBtn.addEventListener("click", async () => {
  const page          = document.getElementById("pPage").value.trim();
  const name          = document.getElementById("pName").value.trim();
  const desc          = document.getElementById("pDesc").value.trim();
  const price         = Number(document.getElementById("pPrice").value.trim());
  const discountPrice = Number(document.getElementById("pDiscountPrice").value.trim()) || 0;
  const imageName     = document.getElementById("pImageName").value.trim();
  const image         = document.getElementById("pImage").value.trim();
  const editId        = saveBtn.dataset.editId;

  if (!page || !name || !price) {
    alert("Page, Product Name aur Price zaroori hai.");
    return;
  }

  saveBtn.textContent = "Saving...";
  saveBtn.disabled    = true;

  try {
    if (editId) {
      await updateDoc(doc(db, "products", editId), {
        page, name, desc, price, discountPrice, imageName, image,
        type: "Digital"
      });
      alert("Product updated! ✅");
    } else {
      await addDoc(collection(db, "products"), {
        page,           // "bundle" | "ai-editing" | "social"
        name,
        desc,
        price,
        discountPrice,
        imageName,
        image,
        type:      "Digital",
        active:    true,
        sellCount: 0,
        createdAt: serverTimestamp()
      });
      alert("Product added! ✅ Website pe bhi dikhega.");
    }

    closeModal();
    loadProducts();

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = "+ Add Product";
  }
});

// =======================================
// LOAD PRODUCTS
// =======================================
async function loadProducts() {
  if (!productsTable) return;
  productsTable.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Loading...</td></tr>`;

  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (snapshot.empty) {
      productsTable.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No products found</td></tr>`;
      return;
    }

    productsTable.innerHTML = "";

    const pageLabels = { bundle: "📦 Bundle", "ai-editing": "🤖 AI & Editing", social: "📱 Social" };

    snapshot.forEach(docSnap => {
      const p  = docSnap.data();
      const id = docSnap.id;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700;color:#0f172a;">${p.name}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">${p.desc ? p.desc.substring(0,50)+"…" : "—"}</div>
        </td>
        <td>
          <div style="font-weight:700;color:#1d4ed8;">₹${p.price}</div>
          ${p.discountPrice ? `<div style="font-size:11px;color:#10b981;text-decoration:line-through;">₹${p.discountPrice} off</div>` : ""}
        </td>
        <td>
          <span style="background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">
            ${pageLabels[p.page] || p.page || "—"}
          </span>
        </td>
        <td style="font-size:12px;color:#64748b;">${p.imageName || "—"}</td>
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
    productsTable.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#ef4444;">Error: ${err.message}</td></tr>`;
  }
}

// =======================================
// EDIT
// =======================================
window.editProduct = async (id) => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(docSnap => {
      if (docSnap.id === id) {
        const p = docSnap.data();
        openModal({
          id,
          page:          p.page          || "",
          name:          p.name          || "",
          desc:          p.desc          || "",
          price:         p.price         || "",
          discountPrice: p.discountPrice || "",
          imageName:     p.imageName     || "",
          image:         p.image         || ""
        });
      }
    });
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// =======================================
// TOGGLE ACTIVE
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
  if (!confirm("Is product ko permanently delete karein?")) return;
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
