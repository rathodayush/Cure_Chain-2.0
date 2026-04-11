
// toggle ke liye

document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.querySelector(".navbar-toggler");
  const icon = toggler.querySelector(".toggle-icon");

  toggler.addEventListener("click", function () {
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark"); // Cross icon
  });
});


//login page ke liye 

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

loginBtn.addEventListener('click', () => {
  loginBtn.classList.add('active-tab');
  registerBtn.classList.remove('active-tab');
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});

registerBtn.addEventListener('click', () => {
  registerBtn.classList.add('active-tab');
  loginBtn.classList.remove('active-tab');
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});

//document verifation ke liye

function checkDocument() {
  let file = document.getElementById("docFile").files[0];
  let msg = document.getElementById("msg");

  if (!file) {
    msg.innerText = "Please upload a document.";
    return;
  }

  // Example: Only allow PDF
  if (file.type !== "application/pdf") {
    msg.innerText = "Only PDF allowed!";
    return;
  }

  // If correct
  msg.innerText = "";
  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.add("active");
}

// add login page

//acsess login button

// let loginbotton = document.getElementById("carousel-buttons");

// loginbotton.addEventListener("click", function () {
//     window.location.href = "ngo.html";
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const loginBtn = document.getElementById("carousel-buttons");
//     if (loginBtn) {
//         loginBtn.addEventListener("click", function () {
//             window.location.href = "login.html";
//         });
//     }
// });

// document.getElementById("carousel-buttons").onclick = function () {
//     window.location.href = "login.html";
// };

// add admin system 

function loginAdmin() {
  let email = document.getElementById("email").value.trim();
  let pass = document.getElementById("password").value.trim();

  if (email === "rathodayush361@gmail.com" && pass === "ayush361@") {
    window.location.href = "admin-panel.html";
  } else {
    document.getElementById("error").style.display = "block";


  }
};


