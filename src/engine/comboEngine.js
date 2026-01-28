// /src/engine/comboEngine.js

import { RandomPool } from "./randomPool.js";
import { flattenKirby, flattenISTQB } from "./flatteners.js";
import { loadJson, saveJson, remove } from "./storage.js";

const STORAGE_KEY_POOL = "pool:v1";

/**
 * Charge un JSON depuis un fichier local du repo (GitHub Pages ok).
 * @param {string} path ex: "./datasets/kirby.json"
 */
async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`fetchJson: impossible de charger ${path} (${res.status})`);
  }
  return res.json();
}

/**
 * Construit toutes les combinaisons possibles (A×B).
 * @param {Array<any>} a
 * @param {Array<any>} b
 */
function buildCartesianPool(a, b) {
  const out = [];
  for (const ai of a) {
    for (const bi of b) {
      out.push({ kirby: ai, topic: bi });
    }
  }
  return out;
}

/**
 * Générateur de combos persisté.
 * - Charge Kirby + ISTQB
 * - Flatten
 * - Build pool A×B
 * - Mélange et tire sans répétition
 * - Persiste l'état dans localStorage
 */
export class ComboEngine {
  constructor() {
    this._pool = null;
    this._meta = {
      version: "1.0.0",
      datasets: {
        kirby: "./datasets/kirby.json",
        istqb: "./datasets/istqb.json"
      }
    };
  }

  /**
   * Initialise le moteur.
   * - Tente de restaurer la pool depuis localStorage
   * - Sinon, reconstruit la pool depuis les datasets
   */
  async init() {
    const saved = loadJson(STORAGE_KEY_POOL);
    if (saved) {
      this._pool = RandomPool.fromJSON(saved);
      return;
    }
    await this.rebuild();
  }

  /**
   * Reconstruit la pool depuis les datasets (reset complet).
   */
  async rebuild() {
    const [kirbyJson, istqbJson] = await Promise.all([
      fetchJson(this._meta.datasets.kirby),
      fetchJson(this._meta.datasets.istqb)
    ]);

    const kirbyItems = flattenKirby(kirbyJson);
    const topicItems = flattenISTQB(istqbJson);

    const combos = buildCartesianPool(kirbyItems, topicItems);
    this._pool = new RandomPool(combos);

    this._persist();
  }

  remaining() {
    return this._pool ? this._pool.remaining() : 0;
  }

  total() {
    return this._pool ? this._pool.total() : 0;
  }

  /**
   * Tire un combo unique.
   * @returns {{ meta: any, kirby: any, topic: any }}
   */
  next() {
    if (!this._pool) throw new Error("ComboEngine: not initialized");

    const combo = this._pool.next();
    this._persist();

    return {
      meta: {
        generator: "combo-generator",
        version: this._meta.version,
        createdAt: new Date().toISOString(),
        remaining: this.remaining(),
        total: this.total()
      },
      kirby: {
        categorie: combo.kirby.categorie,
        label: combo.kirby.label
      },
      topic: {
        source: combo.topic.source,
        chapitre: combo.topic.chapitre,
        theme: combo.topic.theme,
        notion: combo.topic.notion
      }
    };
  }

  /**
   * Reset manuel : efface localStorage + rebuild.
   */
  async reset() {
    remove(STORAGE_KEY_POOL);
    await this.rebuild();
  }

  _persist() {
    if (!this._pool) return;
    saveJson(STORAGE_KEY_POOL, this._pool.toJSON());
  }
}
