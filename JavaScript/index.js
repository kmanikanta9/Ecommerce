// File: Js/index.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signin");
  const signupBtn = document.getElementById("signup");
  const fashionBtn = document.getElementById("fashion-btn");
  const electronicsBtn = document.getElementById("electronics-btn");
  const homeBtn = document.getElementById("home-btn");
  const dashboardBtn = document.getElementById("dashboard-btn");

  if (signinBtn) signinBtn.addEventListener("click", () => window.location.href = "./signinE.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "./signupE.html");
  if (dashboardBtn) dashboardBtn.addEventListener("click", () => window.location.href = "./index.html");

  onAuthStateChanged(auth, (user) => {
    const handleAccess = (btn, page) => {
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

    handleAccess(fashionBtn, "./fashion.html");
    handleAccess(electronicsBtn, "./electronics.html");
    handleAccess(homeBtn, "./home.html");
  });
});
