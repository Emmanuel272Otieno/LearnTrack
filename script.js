
/* =================================
   LEARNTRACK - SHARED JAVASCRIPT
================================= */

/* 1. MOBILE-FRIENDLY PAGE FEATURES */

document.addEventListener("DOMContentLoaded", () => {
    // Highlight the current navigation page.
    const currentPage = window.location.pathname
        .split("/")
        .pop() || "index.html";

    document.querySelectorAll(".navigation a").forEach((link) => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    // Add a menu button for small screens.
    const header = document.querySelector(".site-header");
    const navigation = document.querySelector(".navigation");

    if (header && navigation) {
        const menuButton = document.createElement("button");

        menuButton.type = "button";
        menuButton.className = "menu-toggle";
        menuButton.textContent = "☰ Menu";
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Toggle navigation");

        header.insertBefore(menuButton, navigation);

        function updateMenuLayout() {
            if (window.innerWidth <= 700) {
                navigation.classList.add("mobile-navigation");
                menuButton.style.display = "inline-block";
            } else {
                navigation.classList.remove("mobile-navigation");
                navigation.classList.remove("menu-open");
                menuButton.style.display = "none";
                menuButton.setAttribute("aria-expanded", "false");
            }
        }

        menuButton.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("menu-open");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.textContent = isOpen ? "✕ Close" : "☰ Menu";
        });

        window.addEventListener("resize", updateMenuLayout);
        updateMenuLayout();

        navigation.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navigation.classList.remove("menu-open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.textContent = "☰ Menu";
            });
        });
    }

    // Add a small animation when content cards appear.
    const cards = document.querySelectorAll(
        ".content-card, .home-card"
    );

    cards.forEach((card, index) => {
        card.style.animation = `fadeIn 0.5s ease ${index * 0.05}s both`;
    });

    // Home page account buttons.
    const loginButton = document.querySelector("#homeLoginButton");
    const signupButton = document.querySelector("#homeSignupButton");

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    if (signupButton) {
        signupButton.addEventListener("click", () => {
            window.location.href = "login.html?form=signup";
        });
    }
});


/* 2. LEARNING INTERESTS PAGE */

const interestsForm = document.querySelector("#interestsForm");
const interestResults = document.querySelector("#interestResults");

if (interestsForm && interestResults) {
    const interestCheckboxes = interestsForm.querySelectorAll(
        'input[name="interest"]'
    );

    // Load interests previously saved in this browser.
    try {
        const savedInterests = JSON.parse(
            localStorage.getItem("learnTrackInterests") || "[]"
        );

        if (Array.isArray(savedInterests)) {
            interestCheckboxes.forEach((checkbox) => {
                checkbox.checked = savedInterests.includes(
                    checkbox.value
                );
            });
        }
    } catch (error) {
        console.error("Unable to load saved interests.", error);
    }

    interestsForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const selectedInterests = Array.from(
            interestsForm.querySelectorAll(
                'input[name="interest"]:checked'
            )
        ).map((checkbox) => checkbox.value);

        if (selectedInterests.length === 0) {
            interestResults.textContent =
                "Please select at least one learning interest.";
            return;
        }

        try {
            localStorage.setItem(
                "learnTrackInterests",
                JSON.stringify(selectedInterests)
            );

            interestResults.textContent =
                "Your interests have been saved: " +
                selectedInterests.join(", ") + ".";

        } catch (error) {
            interestResults.textContent =
                "Your browser could not save your interests.";
        }
    });
}


/* 3. CONTACT PAGE */

const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");

if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.querySelector("#contactName")
            .value.trim();

        const email = document.querySelector("#contactEmail")
            .value.trim();

        const subject = document.querySelector("#contactSubject")
            .value.trim();

        const message = document.querySelector("#contactMessage")
            .value.trim();

        if (!name || !email || !subject || !message) {
            contactStatus.textContent =
                "Please complete all fields before continuing.";
            return;
        }

        const emailBody =
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            message;

        const mailtoLink =
            "mailto:?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(emailBody);

        // Create the email link safely.
        contactStatus.replaceChildren();

        const statusText = document.createElement("p");
        statusText.textContent =
            "Your message is ready. Select the link below to open " +
            "your email app and choose the recipient.";

        const emailLink = document.createElement("a");
        emailLink.href = mailtoLink;
        emailLink.textContent = "Open email app";
        emailLink.className = "email-action";

        contactStatus.append(statusText, emailLink);
    });
}


/* 4. FIREBASE LOGIN, SIGN-UP AND PASSWORD RESET */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    appId: "YOUR_APP_ID"
};

function showAuthMessage(message, success = false) {
    const messageElement = document.querySelector("#authMessage");

    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.toggle("success", success);
}

function getFriendlyError(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email already has an account. Try logging in.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Choose a stronger password with at least 6 characters.";

        case "auth/invalid-credential":
            return "Email or password is incorrect. You can also reset your password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please wait and try again later.";

        case "auth/network-request-failed":
            return "Check your internet connection and try again.";

        default:
            return "Something went wrong. Check your Firebase configuration and try again.";
    }
}

// Load Firebase only when the account forms are present.
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const resetForm = document.querySelector("#resetForm");

if (loginForm && signupForm && resetForm) {
    startFirebaseAuthentication();
}

async function startFirebaseAuthentication() {
    try {
        const {
            initializeApp
        } = await import(
            "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
        );

        const {
            getAuth,
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            sendPasswordResetEmail,
            signOut,
            onAuthStateChanged,
            updateProfile,
            setPersistence,
            browserLocalPersistence,
            browserSessionPersistence
        } = await import(
            "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"
        );

        // Stop account requests if the example config is unchanged.
        if (
            firebaseConfig.apiKey === "YOUR_API_KEY" ||
            firebaseConfig.projectId === "YOUR_PROJECT_ID" ||
            firebaseConfig.appId === "YOUR_APP_ID"
        ) {
            showAuthMessage(
                "Connect your Firebase web app configuration to enable accounts."
            );
            return;
        }

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        const authForms = document.querySelector("#authForms");
        const dashboard = document.querySelector("#dashboard");
        const userGreeting = document.querySelector("#userGreeting");

        function showForm(formToShow) {
            [loginForm, signupForm, resetForm].forEach((form) => {
                form.classList.add("hidden");
            });

            formToShow.classList.remove("hidden");
            showAuthMessage("");
        }

        document.querySelector("#showSignup")
            .addEventListener("click", () => {
                showForm(signupForm);
            });

        document.querySelector("#showLogin")
            .addEventListener("click", () => {
                showForm(loginForm);
            });

        document.querySelector("#showReset")
            .addEventListener("click", () => {
                document.querySelector("#resetEmail").value =
                    document.querySelector("#loginEmail").value.trim();

                showForm(resetForm);
            });

        document.querySelector("#backToLogin")
            .addEventListener("click", () => {
                showForm(loginForm);
            });

        // Open the sign-up form when arriving from the home page.
        const requestedForm = new URLSearchParams(
            window.location.search
        ).get("form");

        if (requestedForm === "signup") {
            showForm(signupForm);
        }

        // Create an account.
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            showAuthMessage("Creating your account...");

            const name = document.querySelector("#signupName")
                .value.trim();

            const email = document.querySelector("#signupEmail")
                .value.trim();

            const password = document.querySelector("#signupPassword")
                .value;

            try {
                const result = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                await updateProfile(result.user, {
                    displayName: name
                });

                signupForm.reset();

                showAuthMessage(
                    "Your account has been created successfully!",
                    true
                );

            } catch (error) {
                showAuthMessage(getFriendlyError(error));
            }
        });

        // Log in.
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            showAuthMessage("Logging you in...");

            const email = document.querySelector("#loginEmail")
                .value.trim();

            const password = document.querySelector("#loginPassword")
                .value;

            const remember = document.querySelector("#rememberMe")
                .checked;

            try {
                await setPersistence(
                    auth,
                    remember
                        ? browserLocalPersistence
                        : browserSessionPersistence
                );

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                loginForm.reset();
                showAuthMessage("");

            } catch (error) {
                showAuthMessage(getFriendlyError(error));
            }
        });

        // Request a password reset email.
        resetForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            showAuthMessage("Sending reset instructions...");

            const email = document.querySelector("#resetEmail")
                .value.trim();

            try {
                await sendPasswordResetEmail(auth, email);

                showAuthMessage(
                    "If an account exists for that email, check your inbox for a reset link.",
                    true
                );

            } catch (error) {
                showAuthMessage(
                    "We couldn't send the reset email. Check your email and Firebase setup, then try again."
                );
            }
        });

        // Update the account panel when authentication changes.
        onAuthStateChanged(auth, (user) => {
            if (user) {
                authForms.classList.add("hidden");
                dashboard.classList.remove("hidden");

                userGreeting.textContent =
                    `Welcome, ${user.displayName || user.email}!`;
            } else {
                authForms.classList.remove("hidden");
                dashboard.classList.add("hidden");
            }
        });

        // Log out.
        const logoutButton = document.querySelector("#logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                try {
                    await signOut(auth);
                    showForm(loginForm);

                    showAuthMessage(
                        "You have logged out successfully.",
                        true
                    );
                } catch (error) {
                    showAuthMessage("Unable to log out. Please try again.");
                }
            });
        }

    } catch (error) {
        console.error("Firebase initialization error:", error);

        showAuthMessage(
            "Unable to load Firebase. Check your internet connection and Firebase configuration."
        );
    }
}
