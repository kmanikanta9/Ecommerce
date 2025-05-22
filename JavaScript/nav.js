// File: Js/nav.js
import { auth, db } from "./firebase-config.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signupBtn = document.getElementById("signup");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const fashionBtn = document.getElementById("fashion-btn");
  const electronicsBtn = document.getElementById("electronics-btn");
  const homeBtn = document.getElementById("home-btn");
  const viewCartBtn = document.getElementById("view-cart-btn");
  const checkoutBtn = document.getElementById("checkout-btn");
  const closeCart = document.getElementById("close-cart");
  const logoutBtn = document.getElementById("logout-btn");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSection = document.getElementById("cart-section");

  if (cartSection) cartSection.style.display = "none";

  if (signinBtn) signinBtn.addEventListener("click", () => window.location.href = "./signinE.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "./signupE.html");
  if (dashboardBtn) dashboardBtn.addEventListener("click", () => window.location.href = "./index.html");

  let currentUser = null;

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        loadCustomerCart(user.uid);
      }
    }

    const handlePageAccess = (btn, page) => {
      if (btn) {
        btn.addEventListener("click", () => {
          if (user) {
            window.location.href = page;
          } else {
            alert("Please log in");
            window.location.href = "./signinE.html";
          }
        });
      }
    };

    handlePageAccess(fashionBtn, "./fashion.html");
    handlePageAccess(electronicsBtn, "./electronics.html");
    handlePageAccess(homeBtn, "./home.html");
  });

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

      div.querySelector(".delete-cart-item-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "users", userId, "cart", itemId));
        loadCustomerCart(userId);
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

      const cartRef = collection(db, "users", currentUser.uid, "cart");
      const cartSnap = await getDocs(cartRef);
      const deletePromises = cartSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "users", currentUser.uid, "cart", docSnap.id))
      );
      await Promise.all(deletePromises);
      alert("Checkout successful! Cart cleared.");
      loadCustomerCart(currentUser.uid);
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSection.style.display = "none";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut(auth);
      alert("Logged out");
      window.location.href = "./signinE.html";
    });
  }
});
