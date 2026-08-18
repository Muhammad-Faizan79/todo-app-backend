import baseUrl from "./url.js";

function checkAuth() {
    const token = localStorage.getItem("token");

    if (token) {
        // User already logged in hai
        return window.location.replace("/dashboard.html")
    }
}

const singup = async()=>{
    try {
    let fullName = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
        console.log(fullName , email, password)
    if(!fullName || !email || !password){
        alert("required Filed or messign");
        return
    }
    

    const obj={
       fullName:  fullName,
        email: email,
        password: password
    }
    // console.log(obj)

    const promise = await fetch(`${baseUrl}/create-user`,{
        method:"POST",
        headers :{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    })
    .then(promise => promise.json())
    if(promise.status){
        alert("singup successfully")
    }else{
        alert(promise.message)
    }
    
    } catch (error) {
      alert(error.message)    
    }
    }


    const login = async()=>{
            try {
       
    let email = document.querySelector("#email");
    let password = document.querySelector("#password");

    if( !email.value || !password.value){
        alert("required Filed or messign");
        return
    }

    const obj={
     
        email: email.value,
        password: password.value
    }
    // console.log(obj)

    const promise = await fetch(`${baseUrl}/login`,{
        method:"POST",
        headers :{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    })
    .then(promise => promise.json())
    if(promise.status){
        alert("login successfully")
        console.log("promise.data" , promise.token)
        localStorage.setItem("token" ,JSON.stringify(promise.token))
        window.location.replace("./dashboard.html")
    }else{
        alert(promise.message)
    }
    
    } catch (error) {
      alert(error.message)    
    }
    }
    
export const deletTodo = async (ele) => {
    try {
        const id = ele.id;

        const res = await fetch(`${baseUrl}/todo/${id}`, {
            method: "DELETE"
        }).then(res => res.json());
        if (res.status) {
            console.log(ele.ParentElement);
            ele.closest("tr").remove();
            alert(res.message);

        } else {
            alert(res.message);
        }
    } catch (error) {
        console.log(error.message);
    }
};
window.singup =singup
window.login = login;
window.checkAuth=checkAuth

// const app = async()=>{

//      const por = await fetch("https://fakestoreapi.com/products")
//     .then(por=> por.json())
//     console.log(por )
// }
// app()
     