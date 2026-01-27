// /src/engine/storage.js

const PREFIX = "combo-generator:";

export function makeKey(name) {
  return `${PREFIX}${name}`;
}

export function loadJson(key) {
  try {
    const raw = localStorage.getItem(makeKey(key));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("storage.loadJson error:", err);
    return null;
  }
}

export function saveJson(key, value) {
  try {
    localStorage.setItem(makeKey(key), JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn("storage.saveJson error:", err);
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(makeKey(key));
    return true;
  } catch (err) {
    console.warn("storage.remove error:", err);
    return false;
  }
}
