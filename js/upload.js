// js/upload.js
import { isUserBanned } from "./utils.js";

// 🔐 Session check
const session = JSON.parse(localStorage.getItem("session"));
if (!session) {
  alert("Please login first");
  window.location.href = "login.html";
}

// 🚫 Ban check
if (session && isUserBanned(session.email)) {
  alert("Your account is banned. Contact admin.");
  throw new Error("Banned user");
}

// ▶ Analyze button logic
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const textAreaCode = document.getElementById("codeInput").value.trim();
  const fileInput = document.getElementById("fileInput").files[0];

  // Case 1: pasted code
  if (textAreaCode) {
    localStorage.setItem("lastCode", textAreaCode);
    window.location.href = "results.html";
    return;
  }

  // Case 2: file upload
  if (fileInput) {
    const reader = new FileReader();

    reader.onload = () => {
      localStorage.setItem("lastCode", reader.result);
      window.location.href = "results.html";
    };

    reader.readAsText(fileInput);
    return;
  }

  alert("Please paste code or upload a file");
});
