
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-analytics.js";
  import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged 

} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore,doc,setDoc,getDoc} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
  const firebaseConfig = {
    apiKey: "AIzaSyCOISrZN7psqwVum4Po9YKHVQk-ZkeFq-8",
    authDomain: "authentication-5d77d.firebaseapp.com",
    databaseURL: "https://authentication-5d77d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "authentication-5d77d",
    storageBucket: "authentication-5d77d.firebasestorage.app",
    messagingSenderId: "284907019884",
    appId: "1:284907019884:web:1f6d5bf3da76692be70249",
    measurementId: "G-B6L957TP6Q"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  export const auth=getAuth(app);
export const db=getFirestore(app);
