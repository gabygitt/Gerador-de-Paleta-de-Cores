let colors = [];
let locked = [];

const paletteDiv = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const themeToggle = document.getElementById("themeToggle");


// UTILIDADES
// Gera um valor aleatório de matiz (Hue)
function randomHue() {
  return Math.floor(Math.random() * 360);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Converte uma cor do formato HSL para HEX
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  // Calcula os valores RGB internamente e monta o código hexadecimal
  return "#" + [r, g, b]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}


// GERAR CORES
function generateByStyle(count, style) {
  const result = [];

  // Cores Aleatórias
  if (style === "random") {
    for (let i = 0; i < count; i++) {
      result.push(
        hslToHex(
          randomHue(),
          randomBetween(65, 90),
          randomBetween(40, 60)
        )
      );
    }
  }

  // Cores Análogas
  if (style === "analogous") {
    const baseHue = randomHue();
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + i * 25) % 360;
      result.push(
        hslToHex(
          hue,
          randomBetween(65, 90),
          randomBetween(40, 60)
        )
      );
    }
  }

  return result;
}

// RENDER
// Cria e mostra(renderiza) visualmente a paleta na tela
function renderPalette() {
  paletteDiv.innerHTML = "";

  colors.forEach((color, i) => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.background = color;

    box.innerHTML = `
      <span class="color-code" onclick="copyColor('${color}')">
        ${color.toUpperCase()}
      </span>
      <button class="lock-btn" onclick="toggleLock(${i})">
        <i class="fa-solid ${locked[i] ? "fa-lock" : "fa-lock-open"}"></i>
      </button>
    `;

    paletteDiv.appendChild(box);
  });
}


// GERAR PALETA
function generatePalette() {
  const count = parseInt(document.getElementById("colorCount").value);
  const style = document.getElementById("colorStyle").value;

  const generated = generateByStyle(count, style);

  // Aumenta o número de blocos de cor caso o usuário queira aumentar o "número de cores"
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      colors.push(null);
      locked.push(false);
    }
  }

  // Diminui o número de blocos de cor caso o usuário queira diminuir o "número de cores"
  if (count < colors.length) {
    colors.splice(count);
    locked.splice(count);
  }

  // Atualiza cores não travadas
  for (let i = 0; i < count; i++) {
    if (!locked[i]) {
      colors[i] = generated[i];
    }
  }

  // Mostra paleta atualizada
  renderPalette();
}

// Alterna o estado de trava de uma cor específica
function toggleLock(index) {
  locked[index] = !locked[index];
  renderPalette();
}


// COPIAR DETERMINADA COR 
function copyColor(color) {
  navigator.clipboard.writeText(color);
  alert("Código de cor copiado: " + color.toUpperCase());
}


// SALVAR PALETA
function savePalette() {
  const name = document.getElementById("paletteName").value.trim();
  if (!name) return;

  const saved = JSON.parse(localStorage.getItem("palettes")) || [];

  saved.push({
    name,
    colors: [...colors]
  });

  localStorage.setItem("palettes", JSON.stringify(saved));
  document.getElementById("paletteName").value = "";
  loadSaved();
}

// LISTAR PALETAS SALVAS
function loadSaved() {
  const savedList = document.getElementById("savedList");
  savedList.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("palettes")) || [];

  saved.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "saved-item";

    div.innerHTML = `
      <span class="saved-name" onclick="loadPalette(${index})">
        ${item.name}
      </span>
      <button onclick="deletePalette(${index})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    savedList.appendChild(div);
  });
}


// CARREGAR PALETA SALVA
function loadPalette(index) {
  const saved = JSON.parse(localStorage.getItem("palettes"));

  colors = [...saved[index].colors];
  locked = new Array(colors.length).fill(false);

  document.getElementById("colorCount").value = colors.length;

  renderPalette();
}


// EXCLUIR PALETA SALVA
function deletePalette(index) {
  const saved = JSON.parse(localStorage.getItem("palettes"));
  saved.splice(index, 1);
  localStorage.setItem("palettes", JSON.stringify(saved));
  loadSaved();
}

// DARK MODE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const icon = themeToggle.querySelector("i");

  if (document.body.classList.contains("dark")) {
    icon.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("theme", "dark");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    localStorage.setItem("theme", "light");
  }
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
}

// EVENTOS
generateBtn.addEventListener("click", generatePalette);
saveBtn.addEventListener("click", savePalette);

generatePalette();
loadSaved();