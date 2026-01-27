// /src/engine/randomPool.js

/**
 * Mélange uniforme (Fisher–Yates).
 * @param {any[]} arr
 * @param {() => number} rng  Fonction renvoyant un float [0,1)
 * @returns {any[]} le même tableau (muté)
 */
export function shuffleInPlace(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pool de tirage sans répétition (shuffle une fois, puis pop()).
 */
export class RandomPool {
  /**
   * @param {any[]} items
   * @param {{ rng?: () => number }} [opts]
   */
  constructor(items, opts = {}) {
    if (!Array.isArray(items)) throw new Error("RandomPool: items must be an array");
    this._rng = typeof opts.rng === "function" ? opts.rng : Math.random;
    this._all = [...items];
    this.reset();
  }

  reset() {
    this._pool = shuffleInPlace([...this._all], this._rng);
  }

  remaining() {
    return this._pool.length;
  }

  total() {
    return this._all.length;
  }

  next() {
    if (this._pool.length === 0) {
      throw new Error("RandomPool: pool empty");
    }
    return this._pool.pop();
  }

  toJSON() {
    // pour persister l’état
    return {
      all: this._all,
      pool: this._pool,
    };
  }

  static fromJSON(json, opts = {}) {
    if (!json || !Array.isArray(json.all) || !Array.isArray(json.pool)) {
      throw new Error("RandomPool.fromJSON: invalid payload");
    }
    const rp = new RandomPool(json.all, opts);
    rp._pool = [...json.pool];
    return rp;
  }
}
