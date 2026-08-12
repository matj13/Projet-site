/**
 * Animations premium — GSAP + ScrollTrigger
 * ------------------------------------------------------------------
 * Architecture déclarative et réutilisable : on n'écrit pas d'animation
 * "à la main" par élément, on pose des attributs `data-*` dans le HTML
 * et ce module les câble. Ajouter une animation à une nouvelle page =
 * poser le bon attribut, rien à toucher ici.
 *
 * Attributs disponibles :
 *  - [data-hero]              conteneur d'entrée du hero (timeline au load)
 *      [data-hero-item]       enfants animés en cascade
 *  - [data-anim="title"]      titre : fade + légère translation verticale
 *  - [data-anim="text"]       texte : reveal doux
 *  - [data-anim="image"]      image : apparition progressive (clip + scale)
 *  - [data-stagger]           conteneur : ses enfants directs apparaissent
 *                             en stagger (cards)
 *  - [data-parallax]          grande image : parallaxe légère au scroll
 *      [data-parallax-speed]  intensité (défaut 8, en %)
 *  - [data-pin]               section épinglée (sticky) avec contenu animé
 *
 * Choix techniques :
 *  - `gsap.matchMedia()` gère À LA FOIS le responsive (mobile/desktop) ET
 *    `prefers-reduced-motion`, et RÉVERTE automatiquement toutes les
 *    animations/ScrollTriggers créés dedans → cleanup propre garanti.
 *  - On anime uniquement `transform` et `opacity` (composited) → 60 fps.
 *  - Les états initiaux masqués sont posés en CSS (.has-gsap) pour éviter
 *    tout flash / layout shift avant l'exécution du JS.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Position de départ commune des reveals au scroll : l'élément entre
// dans le viewport à 85% de la hauteur → déclenchement naturel.
const START = 'top 85%';

/**
 * Point d'entrée. À appeler une fois, après l'init du smooth scroll.
 * @returns {gsap.MatchMedia} objet matchMedia (appeler .revert() pour tout nettoyer)
 */
export function initAnimations() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      isMobile: '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
    },
    (context) => {
      const { reduce, isMobile } = context.conditions;

      // --- Accessibilité : reduced-motion --------------------------
      // On n'anime rien. On s'assure que TOUT est visible immédiatement
      // (on annule les états masqués posés par le CSS .has-gsap).
      if (reduce) {
        gsap.set(
          '[data-hero-item], [data-anim], [data-stagger] > *',
          { clearProps: 'all', opacity: 1, visibility: 'visible' }
        );
        return; // rien à nettoyer
      }

      // Tout ce qui suit est automatiquement "scopé" par matchMedia :
      // les tweens et ScrollTriggers créés ici seront revertés au
      // changement de media-query ou à mm.revert().

      buildHero(isMobile);
      buildTitles();
      buildTexts();
      buildImages();
      buildStaggers(isMobile);
      buildParallax(isMobile);
      buildPinned(isMobile);
    }
  );

  return mm;
}

/* ------------------------------------------------------------------ */
/* Blocs d'animation                                                   */
/* ------------------------------------------------------------------ */

/** Hero : entrée en cascade au chargement (pas au scroll). */
function buildHero(isMobile) {
  gsap.utils.toArray('[data-hero]').forEach((hero) => {
    const items = hero.querySelectorAll('[data-hero-item]');
    if (!items.length) return;

    gsap.timeline({ defaults: { ease: 'power3.out' } }).from(items, {
      y: isMobile ? 24 : 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      // Léger délai pour laisser respirer le premier rendu.
      delay: 0.1,
    });
  });
}

/** Titres : fade + translation verticale légère. */
function buildTitles() {
  gsap.utils.toArray('[data-anim="title"]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: START },
    });
  });
}

/** Textes / paragraphes : reveal doux. */
function buildTexts() {
  gsap.utils.toArray('[data-anim="text"]').forEach((el) => {
    gsap.from(el, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: START },
    });
  });
}

/** Images : apparition progressive (masque clip + léger scale). */
function buildImages() {
  gsap.utils.toArray('[data-anim="image"]').forEach((el) => {
    gsap.from(el, {
      // clip-path animé = pas de layout shift (l'espace est réservé).
      clipPath: 'inset(0% 0% 100% 0%)',
      scale: 1.06,
      opacity: 0.4,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: START },
    });
  });
}

/** Cards : stagger sur les enfants directs d'un conteneur. */
function buildStaggers(isMobile) {
  gsap.utils.toArray('[data-stagger]').forEach((container) => {
    const items = container.children;
    if (!items.length) return;

    gsap.from(items, {
      y: isMobile ? 24 : 36,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: container, start: START },
    });
  });
}

/** Parallaxe légère sur grandes images (scrub lié au scroll). */
function buildParallax(isMobile) {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    // Sur mobile on réduit fortement l'amplitude (confort + perf).
    const base = parseFloat(el.dataset.parallaxSpeed || '8');
    const amount = isMobile ? base * 0.4 : base;

    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true, // suit le scroll → fluide, piloté par Lenis
        },
      }
    );
  });
}

/** Sections épinglées : contenu qui évolue pendant un court pin. */
function buildPinned(isMobile) {
  // On désactive le pin sur mobile : moins pertinent et coûteux.
  if (isMobile) return;

  gsap.utils.toArray('[data-pin]').forEach((section) => {
    const content = section.querySelector('[data-pin-content]') || section;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=60%',
        pin: true,
        pinSpacing: true, // réserve l'espace → pas de saut de layout
        scrub: 0.6,
      },
    });

    tl.from(content, { scale: 0.94, opacity: 0.6, ease: 'none' });
  });
}
