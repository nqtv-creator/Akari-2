# Akari Puzzle Game - PRD

## Problem Statement
Modification d'un jeu Akari existant (fichier HTML unique) vers une app React/FastAPI avec :
- Design clair et moderne (pas dark)
- Compteur de lampes max par niveau qui diminue
- Tutoriel interactif avant le premier jeu
- Animations et sons pour pose de lampe et victoire
- Cadre pour publicités Google
- Garder les modes existants (Classique, Couleur, Régional)

## Architecture
- **Frontend**: React 19 + TailwindCSS + Framer Motion + Canvas HTML5
- **Backend**: FastAPI (minimal, pas de persistence de jeu requise)
- **State**: localStorage pour persistence locale (streak, hints, tutorial)

## User Personas
- Joueur casual cherchant un puzzle de logique relaxant
- Fan de jeux type Duolingo/puzzle mobile

## Core Requirements (Static)
1. Jeu Akari fonctionnel avec 3 modes (Classique, Coloré, Régional)
2. 3 niveaux de difficulté (Facile 6x6, Moyen 8x8, Difficile 10x10)
3. Défi quotidien
4. Compteur de lampes max par niveau
5. Tutoriel interactif 6 étapes
6. Sons Web Audio API (pop lamp, win arpeggio, error buzz)
7. Animations (lamp ripple, confetti victoire)
8. Cadre publicité Google AdSense
9. Design clair avec Fredoka/Nunito fonts

## What's Been Implemented (Jan 2026)
- [x] Home screen avec sélection de mode et streak
- [x] Game screen avec canvas HD (devicePixelRatio)
- [x] Compteur de lampes restantes (diminue/augmente dynamiquement)
- [x] Tutoriel interactif 6 étapes avec mini-grilles SVG
- [x] Son pop quand lampe posée + animation ripple
- [x] Son arpège + confetti quand niveau réussi
- [x] Son erreur quand vérification échoue
- [x] Tabs de difficulté (Facile/Moyen/Difficile)
- [x] Mode marquer (X), Annuler, Vérifier, Nouveau
- [x] Indice (hint) fonctionnel
- [x] Bandeau publicitaire placeholder (home + game)
- [x] Design lumineux moderne (Fredoka/Nunito, palette pastel)
- [x] Responsive mobile

## Testing Status
- All tests PASS (100% frontend)
- Manual verification of all game modes and interactions

## Backlog
### P0 - Done
### P1
- [ ] Persistence MongoDB (scores, progression)
- [ ] Win modal star rating system
- [ ] Daily reward system
### P2
- [ ] Leaderboard / classement
- [ ] Partage social
- [ ] Mode premium (hints illimités, pas de pub)
- [ ] Friends system / parrainage
- [ ] PWA / offline support
