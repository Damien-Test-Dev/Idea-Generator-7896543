# Idea-Generator-7896543
Generate Idea on Demand


## Step 11 — Ajouter le README (setup + remplacement ISTQB)

**Chemin GitHub** : `/README.md`
**Message de commit** : `docs: add README (setup, usage, swapping datasets)`

```md
# Combo Generator — Kirby × Topics

Petit projet web statique (GitHub Pages compatible) qui génère des combinaisons **uniques** (sans répétition) entre :
- un **univers Kirby** (environnement)
- une **notion** (ISTQB CTFL par défaut)

Chaque clic sur **Générer** produit un **JSON** prêt à copier/coller dans un autre pipeline (ex: génération d’images/prompt).

---

## Fonctionnalités

- ✅ Génération **sans répétition** (shuffle + pop)
- ✅ **Persistance** via `localStorage` (pas de répétition après refresh)
- ✅ Boutons : **Générer**, **Copier**, **Reset**
- ✅ Compteur : **combos restants**
- ✅ Configuration simple via `config.json` (swap du dataset “topic” sans toucher au code)

---

## Structure du repo

```

/
index.html
config.json
datasets/
kirby.json
istqb.json
src/
app.js
engine/
comboEngine.js
flatteners.js
randomPool.js
storage.js

````

---

## Lancer en local

> Important : l’app charge des JSON via `fetch()`.  
> Ouvrir `index.html` en `file://` peut bloquer le chargement (selon navigateur).

### Option A — VS Code (recommandé)
1. Ouvrir le dossier dans VS Code
2. Installer l’extension **Live Server**
3. Clic droit sur `index.html` → **Open with Live Server**

### Option B — Python (si tu as Python installé)
Dans le dossier du projet :
```bash
python -m http.server 5500
````

Puis ouvrir :
`http://localhost:5500/`

---

## Déploiement GitHub Pages

1. Pusher le repo sur GitHub
2. Settings → Pages
3. Source : `Deploy from a branch`
4. Branch : `main` (root)
5. Sauver

---

## Utilisation

* **Générer** : tire une combinaison unique Kirby × topic
* **Copier** : copie le JSON du résultat
* **Reset** : reconstruit une nouvelle pool (et repart à zéro)

---

## Format du JSON généré

Exemple :

```json
{
  "meta": {
    "generator": "combo-generator",
    "version": "1.0.0",
    "createdAt": "2026-01-28T00:17:56.485Z",
    "remaining": 8057,
    "total": 8058
  },
  "kirby": {
    "categorie": "nature_et_exploration",
    "label": "Prairies / collines verdoyantes"
  },
  "topic": {
    "source": "istqb",
    "chapitre": { "id": "4", "titre": "Analyse et conception des tests" },
    "theme": { "id": "4.3", "titre": "Techniques de test boîte blanche" },
    "notion": "Mesurer couverture (instructions, branches)"
  }
}
```

---

## Changer ISTQB par un autre sujet (ex: finance)

Le projet est piloté par `config.json`.

### 1) Ajouter ton nouveau dataset

Exemple : `datasets/finance.json`

Tu peux viser un format simple (recommandé) :

```json
{
  "source": "finance",
  "items": [
    { "theme": "Marchés", "notion": "Offre et demande" },
    { "theme": "Investissement", "notion": "Diversification" }
  ]
}
```

### 2) Ajouter un flattener (si besoin)

Actuellement, le moteur supporte :

* `kirby`
* `istqb`

Si ton dataset finance a un format différent, il faut :

* ajouter un flattener dans `src/engine/flatteners.js`
* déclarer son nom dans `selectFlattener()` dans `src/engine/comboEngine.js`

> Si tu veux un “format universel”, on peut standardiser tous les nouveaux datasets en `items[]`
> et ajouter un flattener `generic`.

### 3) Modifier `config.json`

Remplacer la section `datasets.topic` :

```json
"topic": {
  "id": "finance",
  "path": "./datasets/finance.json",
  "flattener": "finance"
}
```

### 4) Recharger la page

Le moteur détecte un changement de config et reconstruit automatiquement la pool.

---

## Notes techniques

* Unicité garantie par une “pool” mélangée (Fisher–Yates) + `pop()`
* L’état de la pool est stocké en `localStorage`
* `Reset` efface la pool et la reconstruit depuis la config

---

## Roadmap possible (si besoin)

* Ajouter un flattener `generic` pour supporter n’importe quel dataset `items[]`
* Ajouter une dropdown dans l’UI pour choisir le dataset “topic”
* Ajouter un export “historique des tirages”

```

✅ Ajoute ce fichier + commit.

**Confirmation attendue :** “oui ok” quand c’est commité.  
Ensuite, si tu veux, on fait une mini étape bonus ultra utile : un flattener `generic` pour que tes prochains datasets (finance, etc.) se branchent **sans toucher au moteur** (seulement `config.json`).
::contentReference[oaicite:0]{index=0}
```

c'est tellement bien fait !!
