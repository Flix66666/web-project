// js/export.js

export function downloadTXT(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ✅ FIXED HTML DOWNLOAD (NO DOM INJECTION)
export function downloadHTML(filename, htmlContent) {
  const blob = new Blob(
    [
      `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Plagiarism Report</title>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
      `
    ],
    { type: "text/html" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// DOC export (already correct)
export function downloadDOC(filename, content) {
  const html = `
    <html>
    <head><meta charset="utf-8"></head>
    <body>${content}</body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/msword"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
