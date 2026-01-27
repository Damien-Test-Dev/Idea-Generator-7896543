// /src/app.js

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
  // Voie moderne
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback (anciens navigateurs)
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

function generateStubResult() {
  // Stub temporaire : valide le pipeline UI + format JSON.
  // À l’étape suivante, on remplacera ça par le vrai moteur (pool A×B + shuffle+pop + persistence).
  return {
    meta: {
      generator: "combo-generator",
      version: "0.1.0",
      createdAt: new Date().toISOString(),
      note: "Stub temporaire. Le tirage unique Kirby×Topic arrive à l’étape suivante.",
    },
    kirby: null,
    topic: null,
    status: "engine_not_initialized",
    next: [
      "Ajouter datasets Kirby et ISTQB",
      "Aplatir (flatten) les sources",
      "Construire la pool des combinaisons (A×B), mélanger, puis tirer sans répétition",
      "Persister la pool restante dans localStorage",
    ],
  };
}

function init() {
  setStatus("Prêt.");
  setRemaining("—");
  setOutput({});
  setCopyEnabled(false);

  ui.btnGenerate.addEventListener("click", () => {
    const result = generateStubResult();
    setOutput(result);
    setCopyEnabled(true);
    setStatus("Résultat généré (stub). Prochaine étape : moteur + datasets + unicité.");
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

init();
