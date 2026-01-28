// /src/engine/comboEngine.js

import { RandomPool } from "./randomPool.js";
import { flattenKirby, flattenISTQB } from "./flatteners.js";
import { loadJson, saveJson, remove } from "./storage.js";

const STORAGE_KEY_POOL = "pool:v1";
const STORAGE_KEY_CONFIG_FINGERPRINT = "config:fingerprint:v1";

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`fetchJson: impossible de charger ${path} (${res.status})`);
  }
  return res.json();
}

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
 * Petit "fingerprint" stable pour détecter un changement de config.
 * Ici on se base sur les chemins + flatteners.
 */
function computeConfigFingerprint(config) {
  const env = config?.datasets?.env || {};
  const topic = config?.datasets?.topic || {};
  return JSON.stringify({
    version: config?.version ?? null,
    env: { path: env.path ?? null, flattener: env.flattener ?? null, id: env.id ?? null },
    topic: { path: topic.path ?? null, flattener: topic.flattener ?? null, id: topic.id ?? null },
    output: config?.output ?? null
  });
}

function selectFlattener(name) {
  switch (name) {
    case "kirby":
      return flattenKirby;
    case "istqb":
      return flattenISTQB;
    default:
      throw new Error(`selectFlattener: flattener inconnu "${name}"`);
  }
}

export class ComboEngine {
  constructor() {
    this._pool = null;
    this._config = null;
    this._meta = {
      version: "1.0.0"
    };
  }

  async init() {
    // 1) Charger la config
    this._config = await fetchJson("./config.json");

    // 2) Si la config a changé depuis la dernière fois, on force un rebuild
    const fingerprint = computeConfigFingerprint(this._config);
    const savedFingerprint = loadJson(STORAGE_KEY_CONFIG_FINGERPRINT);

    if (!savedFingerprint || savedFingerprint !== fingerprint) {
      // config changée -> reset complet
      remove(STORAGE_KEY_POOL);
      saveJson(STORAGE_KEY_CONFIG_FINGERPRINT, fingerprint);
      await this.rebuild();
      return;
    }

    // 3) Sinon on tente de restaurer la pool
    const savedPool = loadJson(STORAGE_KEY_POOL);
    if (savedPool) {
      this._pool = RandomPool.fromJSON(savedPool);
      return;
    }

    // 4) Fallback: rebuild si rien en storage
    await this.rebuild();
  }

  async rebuild() {
    if (!this._config) {
      this._config = await fetchJson("./config.json");
    }

    const envCfg = this._config.datasets?.env;
    const topicCfg = this._config.datasets?.topic;

    if (!envCfg?.path || !envCfg?.flattener) {
      throw new Error("ComboEngine: config.datasets.env invalide (path/flattener requis)");
    }
    if (!topicCfg?.path || !topicCfg?.flattener) {
      throw new Error("ComboEngine: config.datasets.topic invalide (path/flattener requis)");
    }

    const envFlattener = selectFlattener(envCfg.flattener);
    const topicFlattener = selectFlattener(topicCfg.flattener);

    const [envJson, topicJson] = await Promise.all([fetchJson(envCfg.path), fetchJson(topicCfg.path)]);

    const kirbyItems = envFlattener(envJson);
    const topicItems = topicFlattener(topicJson);

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

  async reset() {
    // Reset manuel : efface la pool, puis rebuild depuis la config courante
    remove(STORAGE_KEY_POOL);
    await this.rebuild();
  }

  _persist() {
    if (!this._pool) return;
    saveJson(STORAGE_KEY_POOL, this._pool.toJSON());
  }
}
