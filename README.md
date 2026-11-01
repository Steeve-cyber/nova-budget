# Nova Budget

Un tableau de bord de finances personnelles conçu pour rendre le suivi quotidien plus clair, plus agréable et plus concret. Nova Budget réunit les revenus, les dépenses, les budgets mensuels et des repères visuels dans une interface responsive.

> Projet portfolio développé avec React, Vite et TypeScript.

## Aperçu

- Vue d’ensemble avec solde disponible, revenus, dépenses et évolution sur six mois.
- Historique des opérations avec recherche, filtres, modification et suppression annulable.
- Budgets mensuels personnalisables par catégorie, conservés localement.
- Analyses avec taux d’épargne et répartition des dépenses.
- Données conservées dans le stockage local du navigateur.
- Export de l’historique en CSV compatible avec les tableurs.
- Jeu de données de démonstration chargé à la première visite.
- Interface accessible au clavier, adaptée aux écrans mobiles et compatible avec la préférence de réduction des animations.

## Stack technique

- **React 19** pour les composants et l’interface.
- **TypeScript** pour la modélisation des transactions et la sécurité des types.
- **Vite** pour le serveur de développement et la compilation.
- **CSS natif** pour la mise en page responsive, les états d’interaction et les animations.

## Démarrage

Prérequis : Node.js récent et npm.

```bash
npm install
npm run dev
```

Vite affiche l’adresse locale à ouvrir dans le navigateur après le démarrage.

## Commandes

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarre le serveur de développement avec rechargement à chaud. |
| `npm run build` | Vérifie les types TypeScript et produit la version de production dans `dist/`. |
| `npm run preview` | Sert localement la version compilée. |
| `npm run lint` | Analyse le code avec ESLint. |

## Organisation du code

```text
src/
├── App.tsx                 # Navigation, pages et interactions principales
├── App.css                 # Système visuel et styles responsive
├── CategoryBreakdown.tsx   # Répartition des dépenses par catégorie
├── index.css               # Styles globaux, tokens et accessibilité
├── main.tsx                # Point d’entrée React
└── utils.ts                # Types, catégories, formatage et stockage local
public/
└── favicon.svg
```

## Données et confidentialité

Les opérations sont enregistrées dans `localStorage` sous la clé `transactions`. Aucune API ni aucun compte distant ne sont requis. Effacer les données du site dans le navigateur supprime aussi les opérations locales. Les transactions de départ servent à présenter le tableau de bord sur une première visite ; une liste volontairement vidée reste vide jusqu’au rechargement manuel de la démo.

Les enveloppes initiales sont des repères de démonstration que vous pouvez ajuster depuis la page **Budgets**. Elles sont conservées dans le navigateur sous la clé `nova-budget-limits` et ne sont pas synchronisées avec un service bancaire.

## Pistes d’évolution

- Import de relevés bancaires et rapprochement de transactions.
- Choix de devise et de période d’analyse.
- Tests automatisés des calculs, de la persistance et des formulaires.

## Licence

Aucune licence de réutilisation n’est définie pour le moment.
