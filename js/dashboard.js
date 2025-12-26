import { getHistory } from "./utils.js";

const table = document.getElementById("historyTable");
const history = getHistory();

if (history.length === 0) {
  table.innerHTML = "<tr><td colspan='4'>No uploads yet</td></tr>";
}

history.forEach((item, index) => {
  const row = document.createElement("tr");

  row.innerHTML = `
  <td>${item.date}</td>
  <td>${item.language}</td>
  <td>${item.before}%</td>
  <td>${item.after}%</td>
  <td>
    <button onclick="view(${index})">View</button>
  </td>
`;

  table.appendChild(row);
});

window.view = function (index) {
  const history = getHistory();
  alert(history[index].cleanedCode);
};
