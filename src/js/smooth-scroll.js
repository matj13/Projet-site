/**
 * Smooth scroll premium — Lenis
 * ------------------------------------------------------------------
 * Ce module centralise TOUTE l'intégration du smooth scroll pour que
 * le reste de l'app n'ait jamais à connaître les détails de Lenis.
 *
 * Points clés de l'intégration :
 *  - Respect de `prefers-reduced-motion` : on n'initialise pas Lenis
 *    du tout, le scroll natif du navigateur reste en place.
 *  - Conflit GSAP/ScrollTrigger réglé proprement : c'est le ticker de
 *    GSAP qui pilote la boucle de Lenis (une seule boucle rAF) et
 *    Lenis qui déclenche `ScrollTrigger.update()` (sinon les triggers
 *    se calculent sur la mauvaise position de scroll → animations
 *    "en retard" ou cassées).
 *  - Tactile mobile : `smoothTouch` reste désactivé (défaut). Sur
 *    mobile on laisse le scroll natif du doigt, ce qui reste le plus
 *    naturel ; Lenis conserve seulement la gestion des ancres.
 *  - Ancres / boutons : `scrollToTarget()` s'appuie sur `lenis.scrollTo`
 *    avec un fallback natif si Lenis est absent (reduced-motion).
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Instance unique (null tant que non initialisée / reduced-motion). */
let lenis = null;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Initialise Lenis et le branche sur GSAP/ScrollTrigger.
 * @returns {Lenis|null} l'instance, ou null si reduced-motion.
 */
export function initSmoothScroll() {
  // Accessibilité : on n'active aucun smoothing si l'utilisateur a
  // demandé à réduire les animations. Le scroll natif reste intact.
  if (prefersReducedMotion()) {
    document.documentElement.classList.add('no-smooth-scroll');
    return null;
  }

  lenis = new Lenis({
    // Durée volontairement courte pour un rendu "naturel", pas flottant.
    duration: 1.05,
    // Courbe d'easing douce mais qui s'arrête franchement (pas de dérive).
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    // Scroll roue/clavier lissé…
    smoothWheel: true,
    // …mais scroll tactile natif conservé sur mobile (plus naturel).
    smoothTouch: false,
    // Multiplicateurs neutres : on garde la vitesse attendue par l'utilisateur.
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  // 1 seule boucle rAF : GSAP pilote Lenis (évite deux tickers concurrents).
  const raf = (time) => {
    // gsap.ticker fournit le temps en secondes → Lenis attend des ms.
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(raf);
  // On coupe le lissage du ticker GSAP pour éviter un double-lissage.
  gsap.ticker.lagSmoothing(0);

  // À chaque frame de scroll Lenis, on rafraîchit ScrollTrigger, sinon
  // les positions calculées ne correspondent plus au scroll réel.
  lenis.on('scroll', ScrollTrigger.update);

  // Expose l'instance pour du debug éventuel en console.
  window.__lenis = lenis;

  return lenis;
}

/**
 * Scrolle vers une cible (élément, sélecteur CSS ou position en px).
 * Utilise Lenis si dispo, sinon fallback natif (reduced-motion / SSR).
 * @param {string|HTMLElement|number} target
 * @param {object} [options] options transmises à lenis.scrollTo
 */
export function scrollToTarget(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: 0,
      duration: 1.1,
      ...options,
    });
    return;
  }

  // Fallback sans Lenis : scroll natif (respecte scroll-behavior CSS).
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else if (el instanceof HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Délègue le clic sur les ancres internes (`<a href="#section">`) et sur
 * tout élément portant `[data-scroll-to="#cible"]` (boutons, etc.).
 * À appeler une seule fois après initSmoothScroll().
 */
export function bindAnchorLinks() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest(
      'a[href^="#"], [data-scroll-to]'
    );
    if (!trigger) return;

    // Cible : soit data-scroll-to, soit le hash du lien.
    const selector =
      trigger.getAttribute('data-scroll-to') ||
      trigger.getAttribute('href');

    // "#" seul → haut de page.
    if (!selector || selector === '#') {
      event.preventDefault();
      scrollToTarget(0);
      return;
    }

    const destination = document.querySelector(selector);
    if (!destination) return; // ancre inconnue : on laisse le comportement natif.

    event.preventDefault();
    scrollToTarget(destination);

    // Met à jour l'URL sans déclencher de saut brutal.
    if (history.pushState) {
      history.pushState(null, '', selector);
    }
  });
}

/** Accès à l'instance courante (peut être null). */
export function getLenis() {
  return lenis;
}
