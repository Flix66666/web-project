// js/utils.js

const HISTORY_KEY = "uploadHistory";

export function saveHistory(entry) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  history.push(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

export function getAllUploads() {
  return JSON.parse(localStorage.getItem("uploadHistory")) || [];
}


const USERS_KEY = "users";

export function banUser(email) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  users.forEach(u => {
    if (u.email === email) u.banned = true;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function unbanUser(email) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  users.forEach(u => {
    if (u.email === email) u.banned = false;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isUserBanned(email) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(u => u.email === email);
  return user?.banned === true;
}

export function detectLanguage(code) {
  if (!code) return "Unknown";

  if (code.includes("#include")) return "C++";
  if (code.includes("using namespace")) return "C++";
  if (code.includes("def ") || code.includes("print(")) return "Python";
  if (code.includes("console.log") || code.includes("let ")) return "JavaScript";
  if (code.includes("public static void main")) return "Java";

  return "Unknown";
}


/* =========================================
   🌙 DARK MODE (GLOBAL)
========================================= */

(function initTheme() {
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  document.documentElement.setAttribute("data-theme", savedTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  updateIcon();

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon();
  });

  function updateIcon() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    toggle.textContent = isDark ? "☀️" : "🌙";
  }
});

