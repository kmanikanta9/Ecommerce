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

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signupBtn = document.getElementById("signup");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const viewCartBtn = document.getElementById("view-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartSection = document.getElementById("cart-section");
  const closeCart = document.getElementById("close-cart");
  const logoutBtn = document.getElementById("ogout-btn");

  if (signinBtn) signinBtn.addEventListener("click", () => window.location.href = "./signinE.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "./signupE.html");
  if (dashboardBtn) dashboardBtn.addEventListener("click", () => window.location.href = "./index.html");
  if (cartSection) cartSection.style.display = "none";

  let currentUser = null;
  let currentRole = null;

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    const fashionBtn = document.getElementById("fashion-btn");
    const electronicsBtn = document.getElementById("electronics-btn");
    const homeBtn = document.getElementById("home-btn");

    if (fashionBtn) {
      fashionBtn.addEventListener("click", () => {
        if (user) {
          window.location.href = "./fashion.html";
        } else {
          alert("Please Log In");
          window.location.href = "./signinE.html";
        }
      });
    }

    if (electronicsBtn) {
      electronicsBtn.addEventListener("click", () => {
        if (user) {
          window.location.href = "./electronics.html";
        } else {
          alert("Please Log In");
          window.location.href = "./signinE.html";
        }
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        if (user) {
          window.location.href = "./home.html";
        } else {
          alert("Please Log In");
          window.location.href = "./signinE.html";
        }
      });
    }

    if (user) {
      let userDocRef = doc(db, "users", user.uid);
      const userDocsnap = await getDoc(userDocRef);
      if (userDocsnap.exists()) {
        currentRole = userDocsnap.data().role;
        loadCustomerCart(user.uid);
      }
    }
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

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSection.style.display = "none";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await signOut(auth);
        alert("Logged out successfully");
        window.location.href = "./signinE.html";
      } catch (error) {
        alert("Error logging out: " + error.message);
      }
    });
  }
});
