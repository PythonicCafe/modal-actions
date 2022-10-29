function log(text, type = "message") {
  let statusLog = document.getElementById("status-log");
  statusLog.innerHTML += `<article class="${type}">${text}</article>`;
  statusLog.scrollTop = statusLog.scrollHeight;
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

const slider = document.getElementById("font-size");

if (slider) {
  slider.addEventListener("input", function () {
    const size = slider.value;
    // this sets the body's font size property
    document.body.style.fontSize = size + "em";
  });
}

async function main() {
  const statuslog = document.createElement("div");
  const transparentEffect = document.createElement("div");

  statuslog.setAttribute("id", "status-log");
  transparentEffect.setAttribute("class", "transparentEffect");
  statuslog.innerHTML = "<br><br><br><br><br><br>";
  statuslog.appendChild(transparentEffect);
  document.body.insertBefore(statuslog, document.body.firstChild);

  await window.runTest();
}

document.addEventListener("DOMContentLoaded", main, false);

// Toggle if user OS theme setted as dark mode
if (window.matchMedia("(prefers-color-scheme: dark)").matches) toggleTheme();
function toggleTheme() {
  document.querySelector("body").classList.toggle("dark");
}
