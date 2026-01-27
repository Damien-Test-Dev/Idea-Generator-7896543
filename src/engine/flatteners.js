// /src/engine/flatteners.js

/**
 * @typedef {Object} KirbyItem
 * @property {string} source  ex: "kirby"
 * @property {string} categorie
 * @property {string} label
 */

/**
 * @typedef {Object} TopicItem
 * @property {string} source  ex: "istqb"
 * @property {Object} chapitre
 * @property {string} chapitre.id
 * @property {string} chapitre.titre
 * @property {Object} theme
 * @property {string} theme.id
 * @property {string} theme.titre
 * @property {string} notion
 */

/**
 * Transforme le JSON Kirby (univers_possibles) en liste plate.
 * @param {any} kirbyJson
 * @returns {KirbyItem[]}
 */
export function flattenKirby(kirbyJson) {
  if (!kirbyJson || typeof kirbyJson !== "object") {
    throw new Error("flattenKirby: kirbyJson invalide");
  }
  const univers = kirbyJson.univers_possibles;
  if (!univers || typeof univers !== "object") {
    throw new Error("flattenKirby: univers_possibles manquant");
  }

  /** @type {KirbyItem[]} */
  const out = [];

  for (const [categorie, labels] of Object.entries(univers)) {
    if (!Array.isArray(labels)) continue;
    for (const label of labels) {
      if (typeof label !== "string" || !label.trim()) continue;
      out.push({
        source: "kirby",
        categorie,
        label: label.trim(),
      });
    }
  }

  if (out.length === 0) {
    throw new Error("flattenKirby: aucun item généré");
  }
  return out;
}

/**
 * Transforme le JSON ISTQB (chapitres -> themes -> notions_cles) en liste plate.
 * @param {any} istqbJson
 * @returns {TopicItem[]}
 */
export function flattenISTQB(istqbJson) {
  if (!istqbJson || typeof istqbJson !== "object") {
    throw new Error("flattenISTQB: istqbJson invalide");
  }
  const chapitres = istqbJson.chapitres;
  if (!Array.isArray(chapitres)) {
    throw new Error("flattenISTQB: chapitres manquant");
  }

  /** @type {TopicItem[]} */
  const out = [];

  for (const ch of chapitres) {
    if (!ch || typeof ch !== "object") continue;
    const chapitreId = String(ch.id ?? "").trim();
    const chapitreTitre = String(ch.titre ?? "").trim();
    const themes = Array.isArray(ch.themes) ? ch.themes : [];

    for (const th of themes) {
      if (!th || typeof th !== "object") continue;
      const themeId = String(th.id ?? "").trim();
      const themeTitre = String(th.titre ?? "").trim();
      const notions = Array.isArray(th.notions_cles) ? th.notions_cles : [];

      for (const notion of notions) {
        if (typeof notion !== "string" || !notion.trim()) continue;
        out.push({
          source: "istqb",
          chapitre: { id: chapitreId, titre: chapitreTitre },
          theme: { id: themeId, titre: themeTitre },
          notion: notion.trim(),
        });
      }
    }
  }

  if (out.length === 0) {
    throw new Error("flattenISTQB: aucun item généré");
  }
  return out;
}
