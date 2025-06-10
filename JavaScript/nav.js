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
  // DOM Elements
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

  const profileToggle = document.getElementById("profile-btn");
  const userEmailEl = document.getElementById("user-email");
  const userRoleEl = document.getElementById("user-role");
  const profileInfoBox = document.getElementById("profile-info");
  const closeProfileBtn = document.getElementById("close-profile");

  // Initial hiding
  [cartSection, profileToggle, userEmailEl, userRoleEl, profileInfoBox].forEach(el => {
    if (el) el.style.display = "none";
  });

  // Button Navigation
  if (signinBtn) signinBtn.addEventListener("click", () => window.location.href = "./signinE.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "./signupE.html");
  if (dashboardBtn) dashboardBtn.addEventListener("click", () => window.location.href = "./index.html");

  // Current user holder
  let currentUser = null;

  // Handle auth state change
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      // Hide sign-in/up, show profile
      [signinBtn, signupBtn].forEach(btn => { if (btn) btn.style.display = "none"; });
      if (profileToggle) profileToggle.style.display = "block";

      // Load user info
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : "Not available";
      if (userEmailEl) userEmailEl.innerText = `Email: ${user.email}`;
      if (userRoleEl) userRoleEl.innerText = `Role: ${role}`;
      [userEmailEl, userRoleEl].forEach(el => { if (el) el.style.display = "none"; });

      // Load cart
      loadCustomerCart(user.uid);
    } else {
      // Reset UI
      [signinBtn, signupBtn].forEach(btn => { if (btn) btn.style.display = "inline-block"; });
      [profileToggle, userEmailEl, userRoleEl, profileInfoBox].forEach(el => { if (el) el.style.display = "none"; });
      if (cartItemsContainer) cartItemsContainer.innerHTML = "";
      if (cartSection) cartSection.style.display = "none";
    }

    // Navigation access protection
    const handlePageAccess = (btn, page) => {
      if (btn) {
        btn.addEventListener("click", () => {
          if (user) window.location.href = page;
          else {
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

  // Load Cart Items
  async function loadCustomerCart(userId) {
    const cartRef = collection(db, "users", userId, "cart");
    const cartSnap = await getDocs(cartRef);
    if (cartItemsContainer) cartItemsContainer.innerHTML = "";

    if (cartSnap.empty) {
      if (cartItemsContainer) cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
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

  // View Cart Button
  if (viewCartBtn) {
    viewCartBtn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Login to see the cart.");
        return;
      }
      loadCustomerCart(currentUser.uid);
      if (cartSection) cartSection.style.display = "block";
    });
  }

  // Checkout Button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      if (!currentUser) {
        alert("Login to checkout.");
        return;
      }

      const cartRef = collection(db, "users", currentUser.uid, "cart");
      const cartSnap = await getDocs(cartRef);

      await Promise.all(cartSnap.docs.map(docSnap =>
        deleteDoc(doc(db, "users", currentUser.uid, "cart", docSnap.id))
      ));

      alert("Checkout successful! Cart cleared.");
      loadCustomerCart(currentUser.uid);
    });
  }

  // Close Cart
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      if (cartSection) cartSection.style.display = "none";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut(auth);
      alert("Logged out");
      window.location.href = "./signinE.html";
    });
  }

  // Profile Toggle
  if (profileToggle) {
    profileToggle.addEventListener("click", () => {
      if (currentUser) {
        if (profileInfoBox) profileInfoBox.style.display = "block";
        if (userEmailEl) userEmailEl.style.display = "block";
        if (userRoleEl) userRoleEl.style.display = "block";
      } else {
        alert("Please log in to view your profile.");
      }
    });
  }

  if (closeProfileBtn) {
    closeProfileBtn.addEventListener("click", () => {
      if (profileInfoBox) profileInfoBox.style.display = "none";
    });
  }
});
