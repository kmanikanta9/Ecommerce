// File: Js/auth.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // ✅ Sign In
  if (signinBtn) {
    signinBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const email = document.getElementById("signin-email").value;
      const password = document.getElementById("signin-password").value;

      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (role === "vendor") {
            window.location.href = "vendor.html";
          } else {
            window.location.href = "index.html";
          }
        } else {
          alert("Role not found. Contact support.");
          await signOut(auth);
        }
      } catch (error) {
        alert("Login failed: " + error.message);
      }
    });
  }

  // ✅ Sign Up
  if (signupBtn) {
    signupBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const role = document.getElementById("role-select").value;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), { email, role });
        alert("Signup successful. Please sign in.");
        window.location.href = "signinE.html";
      } catch (error) {
        alert("Signup failed: " + error.message);
      }
    });
  }

  // ✅ Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await signOut(auth);
        alert("Logged out successfully");
        window.location.href = "signinE.html";
      } catch (error) {
        alert("Logout error: " + error.message);
      }
    });
  }

  // ✅ Role-based Redirect
onAuthStateChanged(auth, async (user) => {
  const currentPage = location.pathname;

  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;

      // Prevent redirect loop if user is already on correct page
      if (role === "vendor" && !currentPage.includes("vendor.html")) {
        location.replace("/vendor.html");
      } else if (role === "customer" && !currentPage.includes("index.html") &&
                 !currentPage.includes("fashion.html") &&
                 !currentPage.includes("electronics.html") &&
                 !currentPage.includes("home.html")) {
        location.replace("/index.html");
      }
    }
  } else {
    // Only redirect if user tries to access a protected page
    const protectedPages = [
      "/index.html", "/fashion.html", "/electronics.html", "/home.html", "/vendor.html"
    ];

    if (protectedPages.some(page => currentPage.includes(page))) {
      location.replace("/signine.html"); // redirect to login
    }
  }
});

});
