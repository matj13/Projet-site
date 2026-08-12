/**
 * Point d'entrée de l'application.
 * Ordre important : on initialise le smooth scroll AVANT de créer les
 * ScrollTrigger, pour que le branchement Lenis <-> ScrollTrigger soit
 * déjà en place quand les triggers sont calculés.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, bindAnchorLinks } from './smooth-scroll.js';
import '../css/main.css';

gsap.registerPlugin(ScrollTrigger);

function initRevealAnimations() {
  // Animation d'exemple : chaque section apparaît en douceur au scroll.
  // Montre que ScrollTrigger fonctionne AVEC Lenis sans réglage en plus.
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

function boot() {
  initSmoothScroll();
  bindAnchorLinks();
  initRevealAnimations();

  // Après tout mise en page, on recalcule les positions des triggers.
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
