// /src/app.js

import { ComboEngine } from "./engine/comboEngine.js";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element introuvable: #${id}`);
  return el;
}

const ui = {
  btnGenerate: $("btnGenerate"),
  btnCopy: $("btnCopy"),
  output: $("output"),
  remaining: $("remaining"),
  status: $("status"),
};

let lastJsonText = "{}";
let engine;

/** UI helpers */
function setStatus(message) {
  ui.status.textContent = message;
}

function setRemaining(value) {
  ui.remaining.textContent = value;
}

function setOutput(obj) {
  lastJsonText = JSON.stringify(obj, null, 2);
  ui.output.textContent = lastJsonText;
}

function setCopyEnabled(enabled) {
  ui.btnCopy.disabled = !enabled;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

async function initEngine() {
  engine = new ComboEngine();

  setStatus("Initialisation du moteur…");
  ui.btnGenerate.disabled = true;
  setCopyEnabled(false);

  await engine.init();

  setRemaining(String(engine.remaining()));
  setStatus("Prêt. Pool chargée (sans répétition).");
  ui.btnGenerate.disabled = false;
}

function wireEvents() {
  ui.btnGenerate.addEventListener("click", () => {
    try {
      const result = engine.next();
      setOutput(result);
      setCopyEnabled(true);
      setRemaining(String(engine.remaining()));

      if (engine.remaining() === 0) {
        setStatus("Pool épuisée. Ajoute un bouton reset (étape suivante) ou recharge via reset moteur.");
      } else {
        setStatus("Combo généré. Unique garanti.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors du tirage. Vérifie la console.");
    }
  });

  ui.btnCopy.addEventListener("click", async () => {
    try {
      await copyToClipboard(lastJsonText);
      setStatus("Copié dans le presse-papiers.");
    } catch (err) {
      console.error(err);
      setStatus("Échec de copie (permission navigateur).");
    }
  });
}

async function init() {
  // UI initial state
  setStatus("Chargement…");
  setRemaining("—");
  setOutput({});
  setCopyEnabled(false);

  wireEvents();

  try {
    await initEngine();
  } catch (err) {
    console.error(err);
    setStatus(
      "Impossible d'initialiser le moteur. Lance la page via un serveur (Live Server / GitHub Pages), pas en file://."
    );
  }
}

init();
