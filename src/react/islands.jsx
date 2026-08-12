/**
 * React islands — monte des composants react-bits dans le site vanilla
 * ------------------------------------------------------------------
 * Le site reste en JS vanilla ; React n'est utilisé que localement.
 * On déclare un point de montage dans le HTML :
 *
 *   <span data-react-island="ShinyText" data-props='{"text":"Premium"}'></span>
 *   <h1 data-react-island="GradientText">Titre dégradé</h1>
 *
 *  - data-react-island : nom du composant (clé du REGISTRY ci-dessous)
 *  - data-props        : props JSON (optionnel)
 *  - le texte interne du noeud sert de `children` (ex. GradientText)
 *
 * Accessibilité : sous prefers-reduced-motion on NE monte pas les
 * composants animés — le texte reste affiché statiquement.
 *
 * Ajouter un composant react-bits = le copier dans ./bits/ puis
 * l'ajouter au REGISTRY. Rien d'autre à toucher.
 */

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import GradientText from './bits/GradientText/GradientText.jsx';
import ShinyText from './bits/ShinyText/ShinyText.jsx';

const REGISTRY = {
  GradientText,
  ShinyText,
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Monte tous les îlots présents dans le DOM.
 * @returns {() => void} fonction de cleanup (démonte tout).
 */
export function mountReactIslands() {
  const nodes = document.querySelectorAll('[data-react-island]');
  // Accessibilité : pas d'animation → on laisse le texte tel quel.
  if (prefersReducedMotion()) return () => {};

  const roots = [];

  nodes.forEach((node) => {
    const name = node.dataset.reactIsland;
    const Component = REGISTRY[name];
    if (!Component) {
      console.warn(`[islands] composant react-bits inconnu : "${name}"`);
      return;
    }

    // Props JSON optionnelles.
    let props = {};
    if (node.dataset.props) {
      try {
        props = JSON.parse(node.dataset.props);
      } catch (err) {
        console.warn(`[islands] data-props invalide sur "${name}"`, err);
      }
    }

    // Le texte du noeud sert de children (composants type GradientText).
    const children = node.textContent?.trim() || undefined;
    node.textContent = '';

    const root = createRoot(node);
    root.render(createElement(Component, props, children));
    roots.push(root);
  });

  return () => roots.forEach((root) => root.unmount());
}
