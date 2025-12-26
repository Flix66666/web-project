import { getAllUploads, banUser, unbanUser } from "./utils.js";

const table = document.getElementById("adminTable");
const uploads = getAllUploads();

if (uploads.length === 0) {
  table.innerHTML = "<tr><td colspan='7'>No submissions found</td></tr>";
}

uploads.forEach((item, index) => {
  const row = document.createElement("tr");

  let status = "OK";
  if (item.before >= 70) status = "HIGH";
  else if (item.before >= 40) status = "MEDIUM";

  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.email}</td>
    <td>${item.date}</td>
    <td>${item.before}%</td>
    <td>${item.after}%</td>
    <td>${status}</td>
    <td>${item.language}</td>

    <td>
      <button onclick="view(${index})">View</button>
      <button onclick="ban('${item.email}')">Ban</button>
      <button onclick="unban('${item.email}')">Unban</button>
    </td>
  `;

  table.appendChild(row);
});

window.view = index => {
  const uploads = getAllUploads();
  alert(uploads[index].cleanedCode);
};

window.ban = email => {
  banUser(email);
  alert(email + " banned");
};

window.unban = email => {
  unbanUser(email);
  alert(email + " unbanned");
};
