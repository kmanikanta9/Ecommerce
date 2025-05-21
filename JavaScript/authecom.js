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

  // ✅ Sign In Logic
  if (signinBtn) {
    signinBtn.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent form refresh
      
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
          alert("User role data not found. Please contact support.");
          await signOut(auth);
        }
      } catch (error) {
        alert("Login failed: " + error.message);
      }
    });
  }

  // ✅ Sign Up Logic
  if (signupBtn) {
    signupBtn.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent form refresh
      
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const role = document.getElementById("role-select").value;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          email,
          role,
        });

        alert("Signup successful. Please sign in.");
        window.location.href = "signinE.html";
      } catch (error) {
        alert("Signup failed: " + error.message);
      }
    });
  }

  // ✅ Logout Logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent default behavior
      
      try {
        await signOut(auth);
        alert("Logged out successfully");
        window.location.href = "signinE.html";
      } catch (error) {
        alert("Error logging out: " + error.message);
      }
    });
  }

  // ✅ Auth State Change / Role-based Redirect
  onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const vendorPages = ["vendor.html"];
    const customerPages = ["fashion.html", "electronics.html", "home.html"];
    const publicPages = ["index.html", "signinE.html", "signupE.html", ""];

    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const role = userDoc.data().role;

        if (role === "vendor" && !vendorPages.includes(currentPage)) {
          if (publicPages.includes(currentPage)) {
            window.location.href = "vendor.html";
          }
        } else if (role !== "vendor" && !customerPages.includes(currentPage)) {
          if (["signinE.html", "signupE.html"].includes(currentPage)) {
            window.location.href = "index.html";
          }
        }
      } else {
        await signOut(auth);
        if (currentPage !== "signinE.html") {
          window.location.href = "signinE.html";
        }
      }
    } else {
      const isPublic = publicPages.includes(currentPage);
      if (!isPublic && currentPage !== "signinE.html") {
        window.location.href = "signinE.html";
      }
    }
  });
});
