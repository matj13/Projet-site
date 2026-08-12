/**
 * Point d'entrée de l'application.
 * Ordre important : on initialise le smooth scroll AVANT de créer les
 * ScrollTrigger, pour que le branchement Lenis <-> ScrollTrigger soit
 * déjà en place quand les triggers sont calculés.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, bindAnchorLinks } from './smooth-scroll.js';
import { initAnimations } from './animations.js';
import { mountReactIslands } from '../react/islands.jsx';
import '../css/main.css';

gsap.registerPlugin(ScrollTrigger);

/** Référence au matchMedia des animations, pour le cleanup (HMR/SPA). */
let animations = null;
/** Cleanup des îlots React (démontage). */
let unmountIslands = null;

function boot() {
  // 1. Smooth scroll (branche Lenis <-> ScrollTrigger).
  initSmoothScroll();
  // 2. Ancres et liens internes.
  bindAnchorLinks();
  // 3. Îlots React (composants react-bits) montés dans le DOM vanilla.
  unmountIslands = mountReactIslands();
  // 4. Animations premium (déclaratives, gérées par matchMedia).
  animations = initAnimations();

  // 4. Anti layout shift : quand images/polices sont chargées, les
  //    hauteurs peuvent changer → on recalcule les positions des triggers.
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// --- Hot Module Replacement (Vite) --------------------------------
// En dev, on nettoie proprement les ScrollTriggers/animations avant le
// rechargement du module pour éviter les doublons.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    animations?.revert();
    unmountIslands?.();
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });
}
