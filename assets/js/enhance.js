/* ==================================================================
   JS Wood — Couche premium (Lenis smooth scroll + GSAP ScrollTrigger)
   ------------------------------------------------------------------
   Progressive enhancement : ajoutée PAR-DESSUS le site existant, sans
   toucher au design ni au contenu. Si les libs ne chargent pas, ou si
   l'utilisateur préfère réduire les animations, le site retombe sur son
   comportement natif (scroll classique, ancres via scroll-behavior CSS).

   Ce fichier :
     - active le smooth scroll Lenis (roue/clavier lissés, tactile natif)
     - synchronise Lenis avec GSAP ScrollTrigger (une seule boucle rAF)
     - gère les ancres internes via Lenis avec offset du header fixe
     - ajoute une parallaxe premium au contenu du hero
   Aucune animation existante n'est remplacée : reveals, compteurs,
   slider avant/après, navbar et parallaxe [data-par] restent intacts.
   ================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasLibs = !!(window.Lenis && window.gsap && window.ScrollTrigger);

  // Accessibilité / robustesse : on ne force rien. Le site garde son
  // scroll natif et son scroll-behavior:smooth CSS pour les ancres.
  if (reduce || !hasLibs) return;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis ne doit pas cohabiter avec scroll-behavior:smooth (conflit de
  // double lissage). On repasse en 'auto' — Lenis gère le lissage.
  document.documentElement.style.scrollBehavior = 'auto';

  // Hauteur du header fixe, pour caler les ancres juste dessous.
  function headerOffset() {
    var bar = document.getElementById('bar');
    return (bar ? bar.getBoundingClientRect().height : 0) + 8;
  }

  // --- Smooth scroll -------------------------------------------------
  var lenis = new Lenis({
    duration: 1.05,
    // easing doux qui s'arrête franchement (naturel, pas flottant).
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    smoothTouch: false,   // tactile natif conservé sur mobile
    touchMultiplier: 1.5
  });
  // Exposé pour que les handlers inline existants sachent se désactiver.
  window.__lenis = lenis;

  // Une seule boucle rAF : le ticker GSAP pilote Lenis.
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  // ScrollTrigger recalculé à chaque frame de scroll Lenis.
  lenis.on('scroll', ScrollTrigger.update);

  // --- Ancres internes gérées par Lenis (offset header) --------------
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') { e.preventDefault(); lenis.scrollTo(0); return; }
    var target = document.querySelector(href);
    if (!target) return; // ancre d'une autre page : comportement natif
    e.preventDefault();
    lenis.scrollTo(target, { offset: -headerOffset(), duration: 1.1 });
    if (history.replaceState) history.replaceState(null, '', href);
  });

  // --- Hero : parallaxe premium du contenu au scroll -----------------
  // On anime le contenu (.hero-inner) — surtout PAS le fond, dont
  // l'animation Ken Burns utilise déjà transform (aucun conflit ainsi).
  var hero = document.querySelector('.hero');
  var heroInner = document.querySelector('.hero-inner');
  if (hero && heroInner) {
    gsap.to(heroInner, {
      yPercent: -14,
      opacity: 0.55,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Recalcul des positions après chargement complet (images/polices) :
  // évite tout décalage de déclenchement des triggers.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
