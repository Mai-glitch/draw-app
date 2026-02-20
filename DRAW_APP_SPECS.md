
# But de l'application

Application qui s'execute dans le navigateur sur ordinateur de bureau et mobiles.

L'application doit permettre de dessiner dans un canvas et de sauvegarder en localStorage ses dessins qu'on doit retrouver à l'ouverture suivante.

Sur la page d'acceuil, on peut:
- commencer un nouveau dessin 
- reprendre un des dessins déjà créés qui sont visibles avec une petite image de preview 
- chaque dessins enregistrés peut être supprimés (modale de validation avant suppression)
- un bouton permet de supprimer tous ses dessins (modale de validation avant suppression)

Sur la page d'édition, on peut:
- faire des traits de différentes épaisseurs et couleurs avec un color picker
- ajouter du texte
- ajouter des images locales

# Style graphique de l'application

- L'application doit être dans le thème funky avec des couleurs chaudes qui se marient bien entre elles
- Il doit y avoir un thème dark et un light
- L'application doit être responsive et fonctionnelle sur mobiles
- L'application doit être dispo en français et anglais

# Détails techniques de l'application

Faire une application frontend Angular utilisant Angular-cli et en s'aidant du MCP Angular

## Framework Angular

- Application zoneless
- Application sans NgModule
- Application qui utilise du routing avec lazy loading

## Libraries à utiliser

- `@angular/material` pour composants UI
- `@ngrx/signals` pour gérer les données
- `lodash-es` pour algo de traitements de données
- `tailwindcss` pour le layout et le style
- `@jsverse/transloco` pour gérer les langues qui seront chargées a partir de fichiers JSON

## Composants angular

- Les composants doivent être standalone
- Les composants doivent être avec ChangeDetectionStrategy.OnPush 
- Les composants doivent utiliser uniquement des signaux dans les templates 
- Les composants ne doivent pas avoir de fichier de style mais utiliser des classes utilitaires Tailwind dans leurs templates 

## Guidelines et linting

- Utiliser le style guide officiel: https://angular.dev/style-guide
- Mettre en place une config ESLint avec https://github.com/angular-eslint/angular-eslint

## Tests

- Faire des tests unitaires Vitest sur tous les composants et les stores. 
- Faire des tests E2E Playright sur les fonctionnalitées principales. 

## GitHub / Deploy

- l'application doit être disponible sur GitHub Pages et refleter la branche 'main' en s'aidant du MCP GitHub
- les modifications doivent passer par des merge requests avec un CI qui execute les tests unitaires Vitest et E2E Playright
