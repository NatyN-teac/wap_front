
const url = "http://localhost:8181/api/v1/auth/login";

const myForm = document.querySelector("form");

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  login(username,password);
});

async function login(username,password){
    try{
        const request = {
          username,
          password,
        };
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
        console.log(response.status);
        if(response.status >= 300) {

           var snack = document.getElementById("snackbar");
           snack.className = "show";
           snack.style.backgroundColor='red';
           snack.innerHTML = "Incorrect username/password"
           setTimeout(function () {
             snack.className = snack.className.replace("show", "");
              document.getElementById("username").value = "";
              document.getElementById("password").value = "";
           }, 2000);
             
        return;
        }
        const data = await response.json();
        if(data) {
            console.log(data.token);
            sessionStorage.setItem("accessToken", data.token);
           
            var snack = document.getElementById("snackbar");
            snack.className = "show";
                snack.style.backgroundColor = "green";
                snack.innerHTML = "Login Successful.";

            // After 0.5 seconds
            setTimeout(function () {
              snack.className = snack.className.replace("show", "");
              window.location = "./shopping.html";
            }, 500);

        }
        
      
        

    }catch(error){
        //  var snack = document.getElementById("snackbar");
        //  snack.className = "show";
        //  snack.style.backgroundColor = "red";
        //  snack.innerHTML = "Something went wrong, try again!";
        //  setTimeout(function () {
        //    snack.className = snack.className.replace("show", "");
        //    document.getElementById("username").value = "";
        //    document.getElementById("password").value = "";
        //  }, 2000);
    }
}

