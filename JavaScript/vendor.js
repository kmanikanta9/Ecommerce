import {auth,db} from "./firebase-config.js"
import {signOut,onAuthStateChanged 

} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore,
    doc,
    setDoc,
    getDocs,
    getDoc,
    collection,
    addDoc,
    deleteDoc,

} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded",async()=>{

    let fashionproducs=document.getElementById("fashion-container")
    
    let currentUser=null
    onAuthStateChanged(auth,async(user)=>{
        if (user){
            currentUser=user
            // document.getElementById("user-email").innerText=currentUser.email
            let userDoc=await getDoc(doc(db,"users",user.uid))
            if(userDoc.exists()){
                let role=userDoc.data().role
                // document.getElementById("user-role").innerText=role
                if(role=="vendor"){
                    loadfashion(user,role)
                }
            }
        }
        else{
            window.location.href="singinE.html"
        }
    })

    async function loadfashion(user,role){
        fashionproducs.innerHTML=""
        const fashionRef=collection(db,"fashion");
        const query =await getDocs(fashionRef)
        query.forEach((doc)=>{
            const fashionData=doc.data()
            displayfashion(doc.id,fashionData,user.uid,role)
        })
    }
    function displayfashion(id,data,userId,role){
            let fashionChildDiv=document.createElement("div")
            fashionChildDiv.classList.add("fashion-child")
            fashionChildDiv.innerHTML=`
                                <img id="fashion-Image" src="${data.fashionImage}" alt="">
                                <h4>${data.fashionTitle}</h4>
                                <p> ₹${data.fashionPrice}</p>
                                <img id="fashion-logo" src="${data.fashionLogo}" alt="">`
                                fashionproducs.append(fashionChildDiv)
      
        // let fashiontitle=document.createElement("p")
        // let fashionimage=document.createElement("img")
        // let fashionprice=document.createElement("p")
        // fashionprice.innerHTML=data.fashionPrice
        // fashionimage.innerHTML=data.fashionImage
        // fashiontitle.innerHTML=data.fashionTitle
        // fashionChildDiv.append(fashiontitle,fashionimage,fashionprice)
        // console.log(fashiontitle)
        // fashionproducs.append(fashionChildDiv)
    }
    let addfashion=document.getElementById("add-fashion")
    addfashion.addEventListener("click",async()=>{
        let fashionTitle=document.getElementById("fashion-title").value
        let fashionPrice=document.getElementById("fashion-price").value
        let fashionImage=document.getElementById("fashion-image").value
        let fashionLogo=document.getElementById("fashion-logo").value
        let fashionCategory=document.getElementById("fashion-category").value
        if(fashionImage=="" ||  fashionPrice=="" ||fashionTitle=="") {
            alert("Enter all Fields") 
            return 
        }
        await addDoc(collection(db,"fashion"),{
            fashionImage,
            fashionTitle,
            fashionPrice,
            fashionLogo,
            userId:currentUser.uid,
            userEmail:currentUser.email,
            fashionCategory,
            createdAt:new Date()
        })
        document.getElementById("fashion-title").value=""
        document.getElementById("fashion-price").value=""
        document.getElementById("fashion-image").value=""
        document.getElementById("fashion-logo").value=""
        document.getElementById("fashion-category").value=""
        loadfashion(currentUser,document.getElementById("user-role"))
    })


    let electronicsproducs=document.getElementById("electronics-container")
    onAuthStateChanged(auth,async(user)=>{
        if (user){
            currentUser=user
            // document.getElementById("user-email").innerText=currentUser.email
            let userDoc=await getDoc(doc(db,"users",user.uid))
            if(userDoc.exists()){
                let role=userDoc.data().role
                // document.getElementById("user-role").innerText=role
                if(role=="vendor"){
                    loadelectronics(user,role)
                }
            }
        }
        else{
            window.location.href="singinE.html"
        }
    })

    async function loadelectronics(user,role){
        electronicsproducs.innerHTML=""
        const electronicsRef=collection(db,"electronics");
        const query =await getDocs(electronicsRef)
        query.forEach((doc)=>{
            const electronicsData=doc.data()
            displayelectronics(doc.id,electronicsData,user.uid,role)
        })
    }
    function displayelectronics(id,data,userId,role){
            let electronicsChildDiv=document.createElement("div")
            electronicsChildDiv.classList.add("fashion-child")
            electronicsChildDiv.innerHTML=`
                                <img id="electronics-Image" src="${data.electronicsImage}" alt="">
                                <h4>${data.electronicsTitle}</h4>
                                <p> ₹${data.electronicsPrice}</p>
                                <img id="electronics-logo" src="${data.electronicsLogo}" alt="">`
                                electronicsproducs.append(electronicsChildDiv)
      
    }
    let addelectronics=document.getElementById("add-electronics")
    addelectronics.addEventListener("click",async()=>{
        let electronicsTitle=document.getElementById("electronics-title").value
        let electronicsPrice=document.getElementById("electronics-price").value
        let electronicsImage=document.getElementById("electronics-image").value
        let electronicsLogo=document.getElementById("electronics-logo").value
        let electronicsCategory=document.getElementById("electronics-category").value
        if(electronicsImage==""  || electronicsPrice=="" ||electronicsTitle=="") {
            alert("Fill all the Fileds")
            return}
        await addDoc(collection(db,"electronics"),{
            electronicsImage,
            electronicsTitle,
            electronicsPrice,
            electronicsLogo,
            userId:currentUser.uid,
            userEmail:currentUser.email,
            electronicsCategory,
            createdAt:new Date()
        })
        document.getElementById("electronics-title").value=""
        document.getElementById("electronics-price").value=""
        document.getElementById("electronics-image").value=""
        document.getElementById("electronics-logo").value=""
        document.getElementById("electronics-category").value=""
        loadelectronics(currentUser,document.getElementById("user-role"))
    })

    let homeproducs=document.getElementById("home-container")
    onAuthStateChanged(auth,async(user)=>{
        if (user){
            currentUser=user
            // document.getElementById("user-email").innerText=currentUser.email
            let userDoc=await getDoc(doc(db,"users",user.uid))
            if(userDoc.exists()){
                let role=userDoc.data().role
                // document.getElementById("user-role").innerText=role
                if(role=="vendor"){
                    loadhome(user,role)
                }
            }
        }
        else{
            window.location.href="singinE.html"
        }
    })

    async function loadhome(user,role){
        homeproducs.innerHTML=""
        const homeRef=collection(db,"home");
        const query =await getDocs(homeRef)
        query.forEach((doc)=>{
            const homeData=doc.data()
            displayhome(doc.id,homeData,user.uid,role)
        })
    }
    function displayhome(id,data,userId,role){
            let homeChildDiv=document.createElement("div")
            homeChildDiv.classList.add("home-child")
            homeChildDiv.innerHTML=`
                                <img id="home-Image" src="${data.homeImage}" alt="">
                                <h4>${data.homeTitle}</h4>
                                <p> ₹${data.homePrice}</p>`
                                homeproducs.append(homeChildDiv)
      
    }
    let addhome=document.getElementById("add-home")
    addhome.addEventListener("click",async()=>{
        let homeTitle=document.getElementById("home-title").value
        let homePrice=document.getElementById("home-price").value
        let homeImage=document.getElementById("home-image").value
        let homeCategory=document.getElementById("home-category").value
        if(homeImage==""  || homePrice=="" ||homeTitle=="") {
            alert("Fill all Fields")
            return
         }
        await addDoc(collection(db,"home"),{
            homeImage,
            homeTitle,
            homePrice,
            homeCategory,
            userId:currentUser.uid,
            userEmail:currentUser.email,
            createdAt:new Date()
        })
        document.getElementById("home-title").value=""
        document.getElementById("home-price").value=""
        document.getElementById("home-image").value=""
        document.getElementById("home-category").value=""
        loadhome(currentUser,document.getElementById("user-role"))
    })

})