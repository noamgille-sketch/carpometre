/* Étangs détaillés à la main. Les autres plans d'eau viennent d'OpenStreetMap.
   approx:true = position au niveau du village, pas de l'étang exact.
   depth = profondeur typique en mètres (null si non publiée) ; open = grand plan d'eau exposé au vent.
   Sources : offices de tourisme, etang-de-peche.fr, passion-carpe.fr, sites des étangs. Infos à vérifier auprès des gérants.
   Pour en ajouter un : copier un bloc et remplir les champs. */
window.PONDS_CURATED = [
  /* ---- Vallée de la Bresle ---- */
  {id:"valdore", name:"Les Étangs du Val Doré", near:"Guimerville, Hodeng-au-Bosc (76)", lat:49.8857, lon:1.7091,
   depth:3.5, open:true, kind:"prive",
   specs:[["Surface","35 ha, 6 étangs, 30 postes"],["Profondeur","3 à 4 m en moyenne"],["Pêche de nuit","Autorisée"],["Saison","Mars à novembre"]],
   site:"https://www.valdore.com"},
  {id:"valleelake", name:"Vallée Lake", near:"Blangy-sur-Bresle (76)", lat:49.9018, lon:1.6898,
   depth:null, open:true, kind:"prive",
   specs:[["Surface","14 ha, 2 étangs (5 et 9 ha)"],["Record","Carpe de 34 kg"],["Formule","Séjours week-end ou semaine"],["Tarif","À partir de 290 € le week-end"]],
   site:"https://www.valleelake.com/"},
  {id:"senarpont", name:"Étang de Sénarpont", near:"Sénarpont", lat:49.8919, lon:1.7014,
   depth:null, open:null, kind:"public",
   specs:[["Type","Public"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Non publiés"]]},
  {id:"blangy", name:"Étangs de Blangy-sur-Bresle", near:"Blangy-sur-Bresle (76)", lat:49.9325, lon:1.6297, approx:true,
   depth:null, open:null, kind:"aappma",
   specs:[["Gestion","AAPPMA La Gaule Blangeoise"],["Espèces","Blancs, carnassiers, carpe"],["Carte","Office de tourisme ou cartedepeche.fr"],["Profondeur","Non publiée"]]},
  {id:"incheville", name:"Étang d'Incheville", near:"Incheville (76)", lat:50.0097, lon:1.5090,
   depth:null, open:null, kind:"public",
   specs:[["Type","Public (AAPPMA d'Incheville)"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Carte de pêche"]]},
  {id:"moulin", name:"Le Moulin du Petit Marais", near:"Visse, Maisnières (80)", lat:50.0161, lon:1.6172, approx:true,
   depth:null, open:null, kind:"prive",
   specs:[["Type","Privé, carpodrome no-kill"],["Journée","15 € · 2 cannes"],["24 h","35 € · 3 cannes"],["Aussi","Bassins à truite"]],
   site:"https://le-moulin-du-petit-marais.com"},

  /* ---- Pays de Bray / vallée de la Béthune / Dieppe ---- */
  {id:"arques", name:"Étang d'Arques", near:"Arques-la-Bataille (76)", lat:49.8770, lon:1.1409,
   depth:null, open:null, kind:"public",
   specs:[["Type","Public"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Carte de pêche"]]},
  {id:"varenne", name:"Plan d'eau de la Varenne", near:"Saint-Aubin-le-Cauf (76)", lat:49.8712, lon:1.1498,
   depth:null, open:true, kind:"public",
   specs:[["Type","Public"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Carte de pêche"]]},
  {id:"haricot", name:"Étang le Haricot", near:"Saint-Hellier (76)", lat:49.7427, lon:1.1866,
   depth:null, open:null, kind:"prive",
   specs:[["Surface","4 ha"],["Pêche de nuit","Oui, 30 € la nuit"],["24 h","30 €"],["Aussi","Esturgeons, black-bass (no-kill)"]]},
  {id:"muchedent", name:"Étang de Muchedent", near:"Muchedent (76)", lat:49.7609, lon:1.1783,
   depth:null, open:null, kind:"public",
   specs:[["Type","Public"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Carte de pêche"]]},

  /* ---- Pays de Caux ---- */
  {id:"caniel", name:"Lac de Caniel", near:"Cany-Barville (76)", lat:49.8002, lon:0.6350,
   depth:null, open:true, kind:"public",
   specs:[["Surface","50 ha"],["Gestion","AAPPMA de la Durdent"],["Espèce","Carpe, carnassiers sur parcours"],["Tarifs","Carte de pêche"]]},

  /* ---- Somme ---- */
  {id:"marais", name:"Étang du Marais", near:"Mareuil-Caubert (80)", lat:50.0706, lon:1.8297, approx:true,
   depth:3.5, open:false, kind:"prive",
   specs:[["Type","Gravière privée"],["Surface","1,3 ha"],["Profondeur","Jusqu'à 5 m"],["Pêche de nuit","Autorisée"]]},
  {id:"narvik", name:"Le Narvik", near:"Rue, baie de Somme (80)", lat:50.2717, lon:1.6689, approx:true,
   depth:null, open:true, kind:"prive",
   specs:[["Site","40 ha de plans d'eau"],["Carpe de nuit","2 étangs (4 et 5 ha), no-kill"],["Pêche de nuit","Autorisée, camping possible"],["Aussi","Carpodrome, mouche, leurre"]],
   site:"https://www.lenarvik.com/"},
  {id:"acrocarpe", name:"Étang Acrocarpe", near:"Vercourt (80)", lat:50.3008, lon:1.7019, approx:true,
   depth:5, open:true, kind:"prive",
   specs:[["Surface","11 ha"],["Profondeur","1,5 à 8 m, fosse à 10 m"],["Pêche de nuit","Autorisée"],["Poissons","Carpes de plus de 20 kg"]]},
  {id:"remiencourt", name:"Domaine de Remiencourt", near:"Remiencourt, près d'Amiens (80)", lat:49.7836, lon:2.3836, approx:true,
   depth:4, open:true, kind:"prive",
   specs:[["Étangs","Étang des Jars (4,5 ha), Étang des 7 lacs"],["Profondeur","Jusqu'à 8 m selon les postes"],["Pêche de nuit","Autorisée"],["Poissons","Moyenne 10 kg, jusqu'à 20 kg"]],
   site:"https://domaine-remiencourt.fr/"},
  {id:"iles", name:"Le Domaine des Îles", near:"Offoy (80)", lat:49.7619, lon:3.0119, approx:true,
   depth:4.5, open:true, kind:"prive",
   specs:[["Surface","12 ha"],["Profondeur","Jusqu'à 6 m"],["Pêche de nuit","Autorisée"],["Poissons","Jusqu'à 25 kg"]]}
];
