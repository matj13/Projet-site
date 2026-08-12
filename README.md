# JS Wood — Site vitrine

Site vitrine statique (multi-pages, HTML/CSS/JS) pour **JS Wood** —
aménagement extérieur & terrasses bois à Lançon-de-Provence.

## Couche premium : smooth scroll & animations

Une couche d'amélioration progressive a été ajoutée **par-dessus** le site
existant, sans modifier le design ni le contenu :

- **Lenis** — smooth scroll premium (roue/clavier lissés, tactile natif
  conservé sur mobile).
- **GSAP + ScrollTrigger** — synchronisés avec Lenis (une seule boucle rAF)
  pour des animations fluides à 60 fps ; parallaxe du contenu du hero.
- **Ancres internes** gérées par Lenis avec offset du header fixe.

Tout est **auto-hébergé** (aucun CDN au runtime) :

```
assets/js/
  enhance.js          # couche premium (init + intégration)
  vendor/
    lenis.min.js
    gsap.min.js
    ScrollTrigger.min.js
```

### Robustesse & accessibilité

`enhance.js` est de l'amélioration progressive : si les librairies ne
chargent pas, ou si l'utilisateur a activé **`prefers-reduced-motion`**, le
site retombe proprement sur son comportement natif (scroll classique,
ancres via `scroll-behavior` CSS). Aucune animation existante (reveals,
compteurs, slider avant/après, navbar) n'est remplacée.

## Lancer en local

Le site est 100 % statique — il suffit d'un petit serveur :

```bash
# Python
python3 -m http.server 8000
# ou Node
npx serve .
```

Puis ouvrir http://localhost:8000.

## Pages

`index.html` · `projets-signature.html` · `projet-1…6.html` ·
`realisations.html`
