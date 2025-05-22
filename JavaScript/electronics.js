

import { auth, db } from "./firebase-config.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";



document.addEventListener("DOMContentLoaded", async () => {
  let electronicsproducs = document.getElementById("electronics-products");
  let currentUser = null;
  let currentRole = null;
  let sortSelect = document.getElementById("sort-select");
  let filterSelect = document.getElementById("filter-select");
  const viewCartBtn = document.getElementById("view-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartSection = document.getElementById("cart-section");
  const closeCart = document.getElementById("close-cart");

  cartSection.style.display = "none";

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      let userDocRef = doc(db, "users", user.uid);
      const userDocsnap = await getDoc(userDocRef);
      if (userDocsnap.exists()) {
        currentRole = userDocsnap.data().role;
        loadelectronics(currentUser.uid, currentRole);
      }
    }
  });

  sortSelect.addEventListener("change", () => {
    if (currentUser) loadelectronics(currentUser.uid, currentRole);
  });
  filterSelect.addEventListener("change", () => {
    if (currentUser) loadelectronics(currentUser.uid, currentRole);
  });

  async function loadelectronics(userId, role) {
    electronicsproducs.innerHTML = "";
    const electronicsRef = collection(db, "electronics");
    const query = await getDocs(electronicsRef);
    let electronicsArray = [];
    query.forEach((doc) => {
      const data = doc.data();
      electronicsArray.push({ id: doc.id, ...data });
    });

    let selectedFilter = filterSelect.value;
    if (selectedFilter) {
      electronicsArray = electronicsArray.filter(
        (item) => item.electronicsCategory === selectedFilter
      );
    }

    let selectedSort = sortSelect.value;
    if (selectedSort == "asc") {
      electronicsArray.sort((a, b) => a.electronicsPrice - b.electronicsPrice);
    } else if (selectedSort == "desc") {
      electronicsArray.sort((a, b) => b.electronicsPrice - a.electronicsPrice);
    }

    electronicsArray.forEach((item) => {
      displayelectronics(item.id, item, userId, role);
    });
  }

  function displayelectronics(id, item, userId, role) {
    let div = document.createElement("div");
    div.classList.add("electronics-child");
    div.innerHTML = `
      <img id="electronics-Image" src="${item.electronicsImage}" alt="">
      <h4>${item.electronicsTitle}</h4>
      <p> ₹${item.electronicsPrice}</p>
      <img id="electronics-logo" src="${item.electronicsLogo}" alt="">
      <button class="electronics-cart-btn">Add to Cart</button>`;

    const btn = div.querySelector(".electronics-cart-btn");

    btn.addEventListener("click", async () => {
      if (!userId) {
        alert("Please log in to add items to cart.");
        return;
      }

      if (role === "Customer") {
        try {
          await setDoc(doc(db, "users", userId, "cart", id), {
            ...item,
            addedAt: new Date().toISOString(),
            cartType: "electronics"
          });
          alert("Product added to cart!");
        } catch (error) {
          console.error("Error adding product to cart:", error);
          alert("Failed to add product to cart.");
        }
      } else {
        alert("Only customers can add items to cart.");
      }
    });

    electronicsproducs.appendChild(div);
  }

  async function loadCustomerCart(userId) {
    const cartRef = collection(db, "users", userId, "cart");
    const cartSnap = await getDocs(cartRef);
    cartItemsContainer.innerHTML = "";

    if (cartSnap.empty) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cartSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const itemId = docSnap.id;

      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <img src="${data.electronicsImage || data.fashionImage || data.homeImage}" style="width: 100px;">
        <h4>${data.electronicsTitle || data.fashionTitle || data.homeTitle}</h4>
        <p>₹${data.electronicsPrice || data.fashionPrice || data.homePrice}</p>
        <p style="font-size: 12px; color: gray">Category: ${data.cartType}</p>
        <button class="delete-cart-item-btn">Remove</button>
      `;

      const deleteBtn = div.querySelector(".delete-cart-item-btn");
      deleteBtn.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "users", userId, "cart", itemId));
          loadCustomerCart(userId);
        } catch (error) {
          console.error("Error removing item:", error);
        }
      });

      cartItemsContainer.appendChild(div);
    });
  }

  if (viewCartBtn) {
    viewCartBtn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Login to see the cart.");
        return;
      }
      cartItemsContainer.innerHTML = "";
      loadCustomerCart(currentUser.uid);
      cartSection.style.display = "block";
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      if (!currentUser) {
        alert("Login to checkout.");
        return;
      }

      try {
        const cartRef = collection(db, "users", currentUser.uid, "cart");
        const cartSnap = await getDocs(cartRef);

        const deletePromises = cartSnap.docs.map((docSnap) =>
          deleteDoc(doc(db, "users", currentUser.uid, "cart", docSnap.id))
        );

        await Promise.all(deletePromises);
        alert("Checkout successful! Your cart has been cleared.");
        loadCustomerCart(currentUser.uid);
      } catch (error) {
        console.error("Checkout error:", error);
      }
    });
  }

  closeCart.addEventListener("click", () => {
    cartSection.style.display = "none";
  });
});