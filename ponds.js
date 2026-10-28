/* Étangs détaillés à la main. Les autres plans d'eau viennent d'OpenStreetMap.
   approx:true = position au niveau du village. depth/open = null si l'info n'est pas publiée.
   Pour en ajouter un : copier un bloc et remplir les champs. */
window.PONDS_CURATED = [
  {id:"valdore", name:"Les Étangs du Val Doré", near:"Guimerville, Hodeng-au-Bosc (76)", lat:49.8857, lon:1.7091, approx:false,
   depth:3.5, open:true,
   specs:[["Surface","35 ha, 6 étangs"],["Profondeur","3 à 4 m en moyenne"],["Type","Privé, dédié à la carpe"],["Saison","Mars à novembre"]],
   site:"https://www.valdore.com"},
  {id:"senarpont", name:"Étang de Sénarpont", near:"Sénarpont", lat:49.8919, lon:1.7014, approx:false,
   depth:null, open:null,
   specs:[["Type","Public"],["Espèce","Carpe"],["Profondeur","Non publiée"],["Tarifs","Non publiés"]]},
  {id:"blangy", name:"Étangs de Blangy-sur-Bresle", near:"Blangy-sur-Bresle (76)", lat:49.9325, lon:1.6297, approx:true,
   depth:null, open:null,
   specs:[["Gestion","AAPPMA La Gaule Blangeoise"],["Espèces","Blancs, carnassiers, carpe"],["Carte","Office de tourisme ou cartedepeche.fr"],["Profondeur","Non publiée"]]},
  {id:"moulin", name:"Le Moulin du Petit Marais", near:"Visse, Maisnières (80)", lat:50.0161, lon:1.6172, approx:true,
   depth:null, open:null,
   specs:[["Type","Privé, carpodrome no-kill"],["Journée","15 € · 2 cannes"],["24 h","35 € · 3 cannes"],["Aussi","Bassins à truite"]],
   site:"https://le-moulin-du-petit-marais.com"}
];
