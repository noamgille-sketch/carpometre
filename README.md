# Carpomètre

La météo traduite en touches : une note carpe sur 100 heure par heure, les meilleurs créneaux, une carte satellite des étangs et un carnet de prises.

## Ce que fait la version 1
- Météo en direct pour n'importe quel lieu en France (recherche ou « Autour de moi »), sur 3 jours.
- Note carpe calculée à partir de la pression, de sa tendance sur 6 h, du vent, de la pluie, du lever et du coucher du soleil.
- Carte satellite IGN avec les étangs détaillés (`ponds.js`) et les plans d'eau OpenStreetMap à 15 km.
- Carnet de prises enregistré sur l'appareil, avec la météo du moment de chaque prise.

## Hébergement
Site 100 % statique, sans serveur ni compilation : il suffit de publier les fichiers (GitHub Pages, Cloudflare Pages…).

## Services utilisés (gratuits)
- Météo et géocodage : [Open-Meteo](https://open-meteo.com/) — gratuit **pour un usage non commercial**. Avant de vendre un abonnement, passer à une offre payante Open-Meteo ou aux données publiques de Météo-France.
- Fonds de carte : IGN Géoplateforme (photos aériennes, Plan IGN) et OpenStreetMap.
- Plans d'eau : OpenStreetMap via l'API Overpass.

## Ajouter un étang détaillé
Copier un bloc dans `ponds.js` et remplir le nom, les coordonnées, la profondeur (`depth`, en mètres) et les infos affichées (`specs`).

## Prochaines étapes
1. Comptes utilisateurs et carnet synchronisé (Supabase, offre gratuite).
2. Premium : prévisions 7 jours, alertes, infos communautaires (Stripe).
3. Météo commerciale (Météo-France open data) avant d'ouvrir le paiement.
