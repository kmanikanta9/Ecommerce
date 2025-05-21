import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signupBtn = document.getElementById("signup");
  const fashionBtn = document.getElementById("fashion-btn");
  const electronicsBtn = document.getElementById("electronics-btn");
  const homeBtn = document.getElementById("home-btn");
  const dashboardBtn = document.getElementById("dashboard-btn");

  // Simple nav buttons
  if (signinBtn) {
    signinBtn.addEventListener("click", () => {
      window.location.href = "./signinE.html";
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      window.location.href = "./signupE.html";
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }

  // Wait for Firebase Auth to initialize before checking currentUser
  onAuthStateChanged(auth, (user) => {
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
  });
});
