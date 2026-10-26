const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "emmy" && password === "emmy") {
        window.location.href = "page2.html";
        return;
    }

    loginError.hidden = false;
});
