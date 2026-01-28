// /src/app.js

import { ComboEngine } from "./engine/comboEngine.js";
import { clearAllAppStorage } from "./engine/storage.js";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element introuvable: #${id}`);
  return el;
}

const ui = {
  btnGenerate: $("btnGenerate"),
  btnCopy: $("btnCopy"),
  btnReset: $("btnReset"),
  btnClearStorage: $("btnClearStorage"),
  output: $("output"),
  remaining: $("remaining"),
  total: $("total"),
  status: $("status"),
  appVersion: $("appVersion"),
};

let lastJsonText = "{}";
let engine;

const APP_VERSION = "1.0.0";

/** UI helpers */
function setStatus(message) {
  ui.status.textContent = message;
}

function setRemaining(value) {
  ui.remaining.textContent = value;
}

function setTotal(value) {
  ui.total.textContent = value;
}

function setVersion(value) {
  ui.appVersion.textContent = value;
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

function setClearStorageEnabled(enabled) {
  ui.btnClearStorage.disabled = !enabled;
}

function setBusy(isBusy) {
  setGenerateEnabled(!isBusy);
  setResetEnabled(!isBusy);
  setClearStorageEnabled(!isBusy);
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
  setTotal(String(engine.total()));

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
      if (engine.remaining() > 0) setStatus("Combo généré. Unique garanti.");
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

  ui.btnClearStorage.addEventListener("click", async () => {
    try {
      setStatus("Nettoyage du stockage local…");
      setBusy(true);
      setCopyEnabled(false);
      setOutput({});

      clearAllAppStorage();

      // Rebuild complet
      engine = new ComboEngine();
      await engine.init();

      setBusy(false);
      setStatus("Stockage nettoyé. Pool reconstruite.");
      refreshCounters();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setStatus("Nettoyage impossible. Vérifie la console.");
    }
  });
}

async function init() {
  setVersion(`v${APP_VERSION}`);

  // UI initial state
  setStatus("Chargement…");
  setRemaining("—");
  setTotal("—");
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
