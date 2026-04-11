// SHOW REGISTER SECTION
const openRegister = document.getElementById("openRegister");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

openRegister.onclick = () => {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
};

// REGISTER TAB SWITCHING
const donorForm = document.getElementById("donorForm");
const ngoForm = document.getElementById("ngoForm");
const regDonorBtn = document.getElementById("regDonorBtn");
const regNgoBtn = document.getElementById("regNgoBtn");

regDonorBtn.onclick = () => {
    donorForm.style.display = "block";
    ngoForm.style.display = "none";
    regDonorBtn.classList.add("active-tab");
    regNgoBtn.classList.remove("active-tab");
};

regNgoBtn.onclick = () => {
    donorForm.style.display = "none";
    ngoForm.style.display = "block";
    regNgoBtn.classList.add("active-tab");
    regDonorBtn.classList.remove("active-tab");
};
// BACK TO LOGIN FROM DONOR
const backToLogin1 = document.getElementById("backToLogin1");
if(backToLogin1){ backToLogin1.onclick = () => {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}; }

// BACK TO LOGIN FROM NGO
const backToLogin2 = document.getElementById("backToLogin2");
if(backToLogin2){ backToLogin2.onclick = () => {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}; }

// TOGGLE FORGOT PASSWORD BOX
const forgotBtn = document.getElementById("forgotPassBtn");
const forgotBox = document.getElementById("forgotBox");
if(forgotBtn){
    forgotBtn.onclick = () => {
        forgotBox.style.display = (forgotBox.style.display === "none") ? "block" : "none";
    };
}
