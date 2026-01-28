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
  btnReset: $("btnReset"),
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

function setGenerateEnabled(enabled) {
  ui.btnGenerate.disabled = !enabled;
}

function setResetEnabled(enabled) {
  ui.btnReset.disabled = !enabled;
}

function setBusy(isBusy) {
  // Quand c'est busy, on évite les clicks concurrents
  setGenerateEnabled(!isBusy);
  setResetEnabled(!isBusy);
  // Copier dépend du fait qu'on ait déjà un résultat, donc on ne l'active pas ici
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

function refreshCounters() {
  setRemaining(String(engine.remaining()));
  if (engine.remaining() === 0) {
    setGenerateEnabled(false);
    setStatus("Pool épuisée. Fais Reset pour reconstruire une nouvelle pool.");
  }
}

async function initEngine() {
  engine = new ComboEngine();

  setStatus("Initialisation du moteur…");
  setBusy(true);
  setCopyEnabled(false);

  await engine.init();

  setBusy(false);
  setStatus("Prêt. Pool chargée (sans répétition).");
  refreshCounters();
}

function wireEvents() {
  ui.btnGenerate.addEventListener("click", () => {
    try {
      const result = engine.next();
      setOutput(result);
      setCopyEnabled(true);

      refreshCounters();
      if (engine.remaining() > 0) {
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

  ui.btnReset.addEventListener("click", async () => {
    try {
      setStatus("Reset en cours…");
      setBusy(true);
      setCopyEnabled(false);
      setOutput({});

      await engine.reset();

      setBusy(false);
      setStatus("Reset terminé. Nouvelle pool prête.");
      refreshCounters();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setStatus("Reset impossible. Vérifie la console.");
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
    setBusy(false);
    setStatus(
      "Impossible d'initialiser le moteur. Lance la page via un serveur (Live Server / GitHub Pages), pas en file://."
    );
  }
}

init();
