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
  // Button and section references
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

  // Profile section elements (show email and role)
  const profileToggle = document.getElementById("profile-btn");
  const userEmailEl = document.getElementById("user-email");
  const userRoleEl = document.getElementById("user-role");

  // Initially hide cart section and profile info and profile toggle button
  if (cartSection) cartSection.style.display = "none";
  if (profileToggle) profileToggle.style.display = "none";
  if (userEmailEl) userEmailEl.style.display = "none";
  if (userRoleEl) userRoleEl.style.display = "none";

  // Navigation buttons: redirects
  if (signinBtn) signinBtn.addEventListener("click", () => window.location.href = "./signinE.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "./signupE.html");
  if (dashboardBtn) dashboardBtn.addEventListener("click", () => window.location.href = "./index.html");

  let currentUser = null;

  // Listen for auth state changes (user login/logout)
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      // User logged in: hide signin/signup buttons, show profile button
      if (signinBtn) signinBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";
      if (profileToggle) profileToggle.style.display = "block";

      // Fetch user info from Firestore (email and role)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userEmailEl) {
          userEmailEl.innerText = `Email: ${user.email}`;
          userEmailEl.style.display = "none"; // Hide initially, toggle later
        }
        if (userRoleEl) {
          userRoleEl.innerText = `Role: ${userData.role}`;
          userRoleEl.style.display = "none"; // Hide initially
        }
      } else {
        // No user data found
        if (userEmailEl) {
          userEmailEl.innerText = `Email: ${user.email}`;
          userEmailEl.style.display = "none";
        }
        if (userRoleEl) {
          userRoleEl.innerText = "Role: Not available";
          userRoleEl.style.display = "none";
        }
      }

      // Load user cart items
      loadCustomerCart(user.uid);

    } else {
      // User logged out: show signin/signup, hide profile and cart info
      if (signinBtn) signinBtn.style.display = "inline-block";
      if (signupBtn) signupBtn.style.display = "inline-block";
      if (profileToggle) profileToggle.style.display = "none";
      if (cartItemsContainer) cartItemsContainer.innerHTML = "";
      if (userEmailEl) {
        userEmailEl.innerText = "";
        userEmailEl.style.display = "none";
      }
      if (userRoleEl) {
        userRoleEl.innerText = "";
        userRoleEl.style.display = "none";
      }
      if (cartSection) cartSection.style.display = "none";
    }

    // Control access to pages — only logged-in users can visit
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

  // Load user cart items from Firestore and display
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

  // View Cart button: only logged-in users
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

  // Checkout button clears the cart for logged-in users
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

  // Close Cart section
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      if (cartSection) cartSection.style.display = "none";
    });
  }

  // Logout button logs user out and redirects to signin page
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut(auth);
      alert("Logged out");
      window.location.href = "./signinE.html";
    });
  }

  // Profile button toggles showing email and role divs
  // if (profileToggle) {
  //   profileToggle.addEventListener("click", () => {
  //     if (!currentUser) return; // No toggle if not logged in

  //     const isEmailVisible = userEmailEl.style.display === "block";
  //     userEmailEl.style.display = isEmailVisible ? "none" : "block";
  //     userRoleEl.style.display = isEmailVisible ? "none" : "block";
  //   });
  // }

  // const profileToggle = document.getElementById("profile-btn");
const profileInfoBox = document.getElementById("profile-info");
const closeProfileBtn = document.getElementById("close-profile");

if (profileToggle) {
  profileToggle.addEventListener("click", () => {
    if (currentUser) {
      profileInfoBox.style.display = "block";

      // Ensure email and role text are shown
      userEmailEl.style.display = "block";
      userRoleEl.style.display = "block";
    } else {
      alert("Please log in to view your profile.");
    }
  });
}

if (closeProfileBtn) {
  closeProfileBtn.addEventListener("click", () => {
    profileInfoBox.style.display = "none";
  });
}


});
