import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function buyProduct(product) {
  const user = auth.currentUser;
  if (!user) {
    alert("Login required");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("User not found");
    return;
  }

  const userData = userSnap.data();

  // ❌ Not enough coins
  if ((userData.coins || 0) < product.price) {
    alert("Not enough coins");
    return;
  }

  // 1️⃣ Deduct coins
  await updateDoc(userRef, {
    coins: increment(-product.price)
  });

  // 2️⃣ Create order
  await addDoc(collection(db, "orders"), {
    uid: user.uid,
    userEmail: user.email,
    productId: product.id,
    productName: product.name,
    coins: product.price,
    deliveryLink: product.deliveryLink,
    status: "completed",
    createdAt: serverTimestamp()
  });

  alert("Order successful! Delivery unlocked 🎉");
}
