// File: Js/authecom.js
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
        window.location.href = "signine.html";
      } catch (error) {
        alert("Signup failed: " + error.message);
      }
    });
  }

  // ✅ Optional Logout Button Handler
  // if (logoutBtn) {
  //   logoutBtn.addEventListener("click", async (event) => {
  //     event.preventDefault();
  //     try {
  //       await signOut(auth);
  //       alert("Logged out successfully");
  //       window.location.href = "signine.html";
  //     } catch (error) {
  //       alert("Logout error: " + error.message);
  //     }
  //   });
  // }

  // ✅ Role-based Redirect on Page Load
  onAuthStateChanged(auth, async (user) => {
    const currentPage = location.pathname;
    const page = currentPage.split("/").pop();

    // 🔐 Pages only for logged-in users
    const protectedPages = [
      "fashion.html",
      "electronics.html",
      "home.html",
      "vendor.html"
    ];

    // 🚪 Auth pages (signin/signup) - should be avoided by logged-in users
    const authPages = [
      "signine.html",
      "signupE.html"
    ];

    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // 🔁 Redirect logged-in users away from signin/signup
        if (authPages.includes(page)) {
          if (role === "vendor") {
            location.replace("vendor.html");
          } else {
            location.replace("index.html");
          }
          return;
        }

        // ✅ Vendor trying to access customer pages
        if (role === "vendor" && protectedPages.includes(page) && page !== "vendor.html") {
          location.replace("vendor.html");
        }

        // ✅ Customer trying to access vendor-only page
        if (role === "customer" && page === "vendor.html") {
          location.replace("index.html");
        }

      }
    } else {
      // 🚫 Not logged in but trying to access protected page
      if (protectedPages.includes(page)) {
        location.replace("signine.html");
      }
    }
  });

});
