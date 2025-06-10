import { auth, db } from "./firebase-config.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const fashionProducts = document.getElementById("fashion-products");
  const sortSelect = document.getElementById("sort-select");
  const filterSelect = document.getElementById("filter-select");
  const viewCartBtn = document.getElementById("view-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartSection = document.getElementById("cart-section");
  const closeCartBtn = document.getElementById("close-cart");

  let currentUser = null;
  let currentRole = null;

  if (cartSection) cartSection.style.display = "none";

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          currentRole = userDocSnap.data().role;
          loadFashionProducts(currentUser.uid, currentRole);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      console.warn("No user is logged in.");
    }
  });

  async function loadFashionProducts(userId, role) {
    if (!fashionProducts) return;
    fashionProducts.innerHTML = "";

    try {
      const fashionRef = collection(db, "fashion");
      const snapshot = await getDocs(fashionRef);

      let fashionArray = [];
      snapshot.forEach((docSnap) => {
        fashionArray.push({ id: docSnap.id, ...docSnap.data() });
      });

      const selectedFilter = filterSelect?.value;
      if (selectedFilter) {
        fashionArray = fashionArray.filter(item => item.fashionCategory === selectedFilter);
      }

      const selectedSort = sortSelect?.value;
      if (selectedSort === "asc") {
        fashionArray.sort((a, b) => a.fashionPrice - b.fashionPrice);
      } else if (selectedSort === "desc") {
        fashionArray.sort((a, b) => b.fashionPrice - a.fashionPrice);
      }

      fashionArray.forEach((item) => displayFashionItem(item, userId, role));
    } catch (error) {
      console.error("Error loading fashion products:", error);
    }
  }

  function displayFashionItem(item, userId, role) {
    const div = document.createElement("div");
    div.classList.add("fashion-child");

    div.innerHTML = `
      <img src="${item.fashionImage}" alt="">
      <h4>${item.fashionTitle}</h4>
      <p>₹${item.fashionPrice}</p>
      <img id="fashion-logo" src="${item.fashionLogo}" alt="">
      <button class="fashion-cart-btn">Add to Cart</button>
    `;

    div.querySelector(".fashion-cart-btn").addEventListener("click", async () => {
      if (!userId) {
        alert("Please log in to add items to cart.");
        return;
      }
      if (role === "Customer") {
        try {
          await setDoc(doc(db, "users", userId, "cart", item.id), {
            ...item,
            cartType: "fashion",
            addedAt: new Date().toISOString(),
          });
          alert("Product added to cart!");
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      } else {
        alert("Only customers can add items to cart.");
      }
    });

    fashionProducts.appendChild(div);
  }

  async function loadCustomerCart(userId) {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    try {
      const cartRef = collection(db, "users", userId, "cart");
      const cartSnap = await getDocs(cartRef);

      if (cartSnap.empty) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }

      cartSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const itemId = docSnap.id;
        const title = data.fashionTitle || data.electronicsTitle || data.homeTitle || "Unknown Product";
        const price = data.fashionPrice || data.electronicsPrice || data.homePrice || 0;
        const image = data.fashionImage || data.electronicsImage || data.homeImage || "";

        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
          <img src="${image}" alt="" style="width: 100px;">
          <h4>${title}</h4>
          <p>₹${price}</p>
          <button class="delete-cart-item-btn">Remove</button>
        `;

        div.querySelector(".delete-cart-item-btn").addEventListener("click", async () => {
          try {
            await deleteDoc(doc(db, "users", userId, "cart", itemId));
            alert("Item removed from cart");
            loadCustomerCart(userId);
          } catch (error) {
            console.error("Error removing item:", error);
          }
        });

        cartItemsContainer.appendChild(div);
      });

      if (cartSection) cartSection.style.display = "block";
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }

  if (viewCartBtn) {
    viewCartBtn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Login to see the cart.");
        return;
      }
      loadCustomerCart(currentUser.uid);
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

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      if (cartSection) cartSection.style.display = "none";
      if (cartItemsContainer) cartItemsContainer.innerHTML = "";
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      if (currentUser) loadFashionProducts(currentUser.uid, currentRole);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      if (currentUser) loadFashionProducts(currentUser.uid, currentRole);
    });
  }
});
