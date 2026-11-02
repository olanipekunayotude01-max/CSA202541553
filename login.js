const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

if (loginForm && loginError && usernameInput && passwordInput) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        loginError.hidden = true;

        if (username === "emmy" && password === "emmy") {
            window.location.href = "page2.html";
            return;
        }

        loginError.hidden = false;
    });

    [usernameInput, passwordInput].forEach((input) => {
        input.addEventListener("input", () => {
            loginError.hidden = true;
        });
    });
}
