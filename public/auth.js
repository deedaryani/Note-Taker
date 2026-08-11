const tabs = document.querySelectorAll(".auth-tab");
const form = document.getElementById("auth-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("auth-submit");
const subtitle = document.getElementById("auth-subtitle");
const errorEl = document.getElementById("auth-error");
const BASE_URL = "/note-taker";

let mode = "login";

// If already logged in, skip straight to the notes app
fetch(`${BASE_URL}/api/auth/me`)
  .then((res) => {
    if (res.ok) window.location.href = `${BASE_URL}/`;
  })
  .catch(() => {});

function setMode(newMode) {
  mode = newMode;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  submitBtn.textContent = mode === "login" ? "Log In" : "Sign Up";
  subtitle.textContent = mode === "login" ? "Sign in to your notes" : "Create an account to get started";
  passwordInput.autocomplete = mode === "login" ? "current-password" : "new-password";
  errorEl.classList.add("hidden");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.classList.add("hidden");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) return;

  submitBtn.disabled = true;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/${mode === "login" ? "login" : "signup"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const body = await res.json();

    if (!res.ok) {
      throw new Error(body.message || "Something went wrong");
    }

    window.location.href = `${BASE_URL}/`;
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
  }
});