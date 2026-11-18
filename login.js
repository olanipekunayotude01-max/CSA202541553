const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginMessage = document.getElementById("login-message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");
const showLoginButton = document.getElementById("show-login");
const showRegisterButton = document.getElementById("show-register");
const staffPasswordFields = document.getElementById("staff-password-fields");
const admissionNumberNote = document.getElementById("admission-number-note");
const loginPasswordLabel = document.getElementById("password-label");

const ACCOUNT_STORAGE_KEY = "olanipekunPortalAccounts";
const PASSWORD_HASH_ITERATIONS = 210000;
const DEFAULT_USERNAME = "adanny@fudutsinma.edu.ng";
const DEFAULT_PASSWORD = "emmy";

function getAdmissionNumber(account) {
    return account.admissionNumber === undefined ? account.studentCode : account.admissionNumber;
}

function readAccounts() {
    let storedAccounts;
    try {
        storedAccounts = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    } catch (error) {
        throw new Error("Account storage is unavailable in this browser.");
    }

    if (storedAccounts === null) return [];

    let accounts;
    try {
        accounts = JSON.parse(storedAccounts);
    } catch (error) {
        throw new Error("Saved accounts could not be read. Clear this browser's saved portal accounts and try again.");
    }

    if (!Array.isArray(accounts) || !accounts.every((account) =>
        account &&
        typeof account.username === "string" &&
        (account.role === "student" || account.role === "staff") &&
        typeof account.salt === "string" &&
        typeof account.passwordHash === "string" &&
        (account.studentCode === undefined ||
            (account.role === "student" && typeof account.studentCode === "string" &&
                /^\d{4}$/.test(account.studentCode))) &&
        (account.admissionNumber === undefined ||
            (account.role === "student" && typeof account.admissionNumber === "string" &&
                /^\d{4}$/.test(account.admissionNumber))) &&
        (account.studentCode === undefined || account.admissionNumber === undefined ||
            account.studentCode === account.admissionNumber)
    )) {
        throw new Error("Saved accounts have an invalid format. Clear this browser's saved portal accounts and try again.");
    }

    const assignedCodes = accounts
        .map(getAdmissionNumber)
        .filter((admissionNumber) => admissionNumber !== undefined);
    if (new Set(assignedCodes).size !== assignedCodes.length) {
        throw new Error("Saved admission numbers are not unique. Clear this browser's saved portal accounts and try again.");
    }

    return accounts;
}

function toBase64(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Password hashing is unavailable. Open this portal using HTTPS or localhost.");
    }

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const hash = await window.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_HASH_ITERATIONS,
        hash: "SHA-256"
    }, keyMaterial, 256);

    return toBase64(new Uint8Array(hash));
}

function generateAdmissionNumber(accounts) {
    const assignedCodes = new Set(accounts.map(getAdmissionNumber).filter(Boolean));
    const availableCodes = Array.from({ length: 10000 }, (_, number) =>
        String(number).padStart(4, "0")
    ).filter((code) => !assignedCodes.has(code));

    if (availableCodes.length === 0) {
        throw new Error("All four-digit admission numbers are in use. Contact the school office.");
    }

    const randomValue = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / availableCodes.length) * availableCodes.length;
    do {
        window.crypto.getRandomValues(randomValue);
    } while (randomValue[0] >= limit);

    return availableCodes[randomValue[0] % availableCodes.length];
}

function setAuthMode(mode) {
    const isRegistering = mode === "register";
    loginForm.hidden = isRegistering;
    registerForm.hidden = !isRegistering;
    showLoginButton.setAttribute("aria-pressed", String(!isRegistering));
    showRegisterButton.setAttribute("aria-pressed", String(isRegistering));
    loginError.hidden = true;
    loginMessage.hidden = true;
    registerMessage.hidden = true;
}

if (loginForm && loginError && usernameInput && passwordInput &&
    registerForm && registerMessage && showLoginButton && showRegisterButton && loginMessage &&
    staffPasswordFields && admissionNumberNote && loginPasswordLabel) {
    function updateRegisterRoleFields() {
        const role = registerForm.querySelector('input[name="account-role"]:checked')?.value ?? "student";
        const isStaff = role === "staff";
        staffPasswordFields.hidden = !isStaff;
        admissionNumberNote.hidden = isStaff;
        staffPasswordFields.querySelectorAll("input").forEach((input) => {
            input.disabled = !isStaff;
        });
    }

    function updateLoginRoleLabel() {
        const role = loginForm.querySelector('input[name="login-role"]:checked')?.value ?? "student";
        const isStudent = role === "student";
        loginPasswordLabel.textContent = isStudent ? "Admission number:" : "Password:";
        passwordInput.inputMode = isStudent ? "numeric" : "text";
    }

    registerForm.querySelectorAll('input[name="account-role"]').forEach((input) => {
        input.addEventListener("change", updateRegisterRoleFields);
    });
    loginForm.querySelectorAll('input[name="login-role"]').forEach((input) => {
        input.addEventListener("change", updateLoginRoleLabel);
    });
    updateRegisterRoleFields();
    updateLoginRoleLabel();

    showLoginButton.addEventListener("click", () => {
        setAuthMode("login");
        usernameInput.focus();
    });

    showRegisterButton.addEventListener("click", () => {
        setAuthMode("register");
        document.getElementById("register-username").focus();
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        const role = loginForm.querySelector('input[name="login-role"]:checked')?.value ?? "student";

        loginError.hidden = true;
        loginMessage.hidden = true;

        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            sessionStorage.setItem("portalRole", role);
            window.location.href = role === "staff" ? "staff.html" : "page2.html";
            return;
        }

        try {
            const account = readAccounts().find((savedAccount) =>
                savedAccount.username === username && savedAccount.role === role
            );
            if (account && await hashPassword(password, fromBase64(account.salt)) === account.passwordHash) {
                sessionStorage.setItem("portalRole", role);
                window.location.href = role === "staff" ? "staff.html" : "page2.html";
                return;
            }
            loginError.textContent = "Incorrect username or password.";
        } catch (error) {
            loginError.textContent = error.message || "Sign in could not be completed.";
        }

        loginError.hidden = false;
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const registerUsernameInput = document.getElementById("register-username");
        const registerPasswordInput = document.getElementById("register-password");
        const confirmPasswordInput = document.getElementById("register-password-confirm");
        const username = registerUsernameInput.value.trim().toLowerCase();
        const role = registerForm.querySelector('input[name="account-role"]:checked')?.value ?? "student";
        const submitButton = registerForm.querySelector('button[type="submit"]');

        registerMessage.hidden = true;
        if (role === "staff") {
            const password = registerPasswordInput.value;
            if (password !== password.trim()) {
                registerMessage.textContent = "Password cannot start or end with spaces.";
                registerMessage.hidden = false;
                return;
            }
            if (password !== confirmPasswordInput.value) {
                registerMessage.textContent = "The passwords do not match.";
                registerMessage.hidden = false;
                confirmPasswordInput.focus();
                return;
            }
        }

        submitButton.disabled = true;
        try {
            const accounts = readAccounts();
            if (username === DEFAULT_USERNAME ||
                accounts.some((account) => account.username === username)) {
                throw new Error("An account already uses that email or username.");
            }

            if (!window.crypto || !window.crypto.getRandomValues || !window.crypto.subtle) {
                throw new Error("Secure password hashing is unavailable in this browser.");
            }
            const admissionNumber = role === "student" ? generateAdmissionNumber(accounts) : null;
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const password = role === "student" ? admissionNumber : registerPasswordInput.value;
            const account = {
                username,
                role,
                salt: toBase64(salt),
                passwordHash: await hashPassword(password, salt)
            };
            if (admissionNumber !== null) account.admissionNumber = admissionNumber;
            accounts.push(account);
            localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));

            registerForm.reset();
            updateRegisterRoleFields();
            setAuthMode("login");
            loginForm.querySelector('input[name="login-role"][value="' + role + '"]').checked = true;
            updateLoginRoleLabel();
            usernameInput.value = username;
            if (admissionNumber === null) {
                loginMessage.textContent = "Account created. Sign in with your new account.";
            } else {
                loginMessage.textContent = "Account created. Your four-digit admission number is:";
                const admissionNumberDisplay = document.createElement("strong");
                admissionNumberDisplay.className = "admission-number-display";
                admissionNumberDisplay.textContent = admissionNumber;
                loginMessage.append(admissionNumberDisplay, document.createTextNode("Save it; you will need it to sign in and access your results."));
            }
            loginMessage.hidden = false;
            document.getElementById("password").focus();
        } catch (error) {
            registerMessage.textContent = error.message || "Account creation could not be completed.";
            registerMessage.hidden = false;
        } finally {
            submitButton.disabled = false;
        }
    });

    [usernameInput, passwordInput].forEach((input) => {
        input.addEventListener("input", () => {
            loginError.hidden = true;
            loginMessage.hidden = true;
        });
    });

    [document.getElementById("register-username"),
        document.getElementById("register-password"),
        document.getElementById("register-password-confirm")].forEach((input) => {
        input.addEventListener("input", () => {
            registerMessage.hidden = true;
        });
    });
}
