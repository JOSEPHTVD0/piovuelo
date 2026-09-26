/* Catálogo: aves, sombreros, efectos, mapas, logros, dificultades */
window.DAT = (function () {
  'use strict';

  const SKINS = [
    { id: 'classic',       name: 'Pío Clásico',  desc: 'El legendario pajarito amarillo.', price: 0, body: '#ffd63f', wing: '#f4ad00', belly: '#fff3c0', beak: '#ff7b2e', cheek: '#ff8a5c' },
    { id: 'berry',         name: 'Fruti Roja',   desc: 'Roja como una fresa.',           price: 150, body: '#ff5c5c', wing: '#d63131', belly: '#ffd6d6', beak: '#ffa02e', cheek: '#ffb3a8' },
    { id: 'azulito',       name: 'Azulito',      desc: 'Fresco como el cielo.',          price: 150, body: '#4fc3f7', wing: '#1e88e5', belly: '#e3f7ff', beak: '#ff9d2e', cheek: '#a5d8ff' },
    { id: 'verdecito',     name: 'Palta',        desc: 'Aguacate con alas.',             price: 200, body: '#7cb342', wing: '#4c8a1f', belly: '#eaffd6', beak: '#ff9d2e', cheek: '#b7e07a' },
    { id: 'pink',          name: 'Chicle',       desc: 'Dulce y esponjoso.',             price: 200, body: '#ff8fd4', wing: '#f062b8', belly: '#ffe9f7', beak: '#ff7b2e', cheek: '#ffc4ea' },
    { id: 'night',         name: 'Ninja',        desc: 'Sigilosa bajo la luna.',         price: 350, body: '#5d4e8c', wing: '#3d3370', belly: '#cfc4f4', beak: '#2e9eff', cheek: '#9a86d8' },
    { id: 'robot',         name: 'Robo-Pío',     desc: 'Unidad #17 lista para volar.',   price: 500, body: '#90a4ae', wing: '#546e7a', belly: '#d5e1e6', beak: '#37474f', cheek: '#29b6f6' },
    { id: 'oro',           name: 'Dorada',       desc: 'Solo para campeones.',           price: 1200, body: '#ffd54f', wing: '#ffab00', belly: '#fff7cc', beak: '#ff8f00', cheek: '#ffca28', shine: true },
    { id: 'fantasma',      name: 'Fantasma',     desc: 'Flota entre mundos.',            price: 700, body: '#e7ecf2', wing: '#b9c4d1', belly: '#ffffff', beak: '#9aa7b5', cheek: '#d3dce6', ghost: true },
    { id: 'arcoiris',      name: 'Arcoíris',     desc: 'Todos los colores en uno.',      price: 1500, body: '#fff', wing: '#fff', belly: '#fff', beak: '#ff8f00', cheek: '#fff', rainbow: true },
    { id: 'hada',          name: 'Hada',         desc: 'Alas brillantes de luz.',        price: 800, body: '#b388ff', wing: '#d1c4e9', belly: '#f0e7ff', beak: '#ffd54f', cheek: '#ffe0f0', sparkle: true },
    { id: 'skate',         name: 'Skater',       desc: 'Vuela con actitud.',             price: 600, body: '#6d4c41', wing: '#4e342e', belly: '#efe4d8', beak: '#8d6e63', cheek: '#ffb74d', skate: true },
    { id: 'lindo',         name: 'Lindo',        desc: 'El más tierno de todos.',        price: 250, body: '#ffe082', wing: '#ffca28', belly: '#fff8e1', beak: '#ff7043', cheek: '#f48fb1', blush: true },
    { id: 'ice',           name: 'Glaciar',      desc: 'Fría como el hielo.',            price: 900, body: '#b3e5fc', wing: '#4fc3f7', belly: '#e1f5fe', beak: '#29b6f6', cheek: '#81d4fa', ice: true },
    { id: 'nebula',        name: 'Nébula',       desc: 'Nacida en el espacio profundo.', price: 2000, body: '#7e57c2', wing: '#4527a0', belly: '#ede7f6', beak: '#ffb300', cheek: '#7e57c2', nebula: true },
    { id: 'tigre',         name: 'Tigre',        desc: 'Rugidos y rayas.',                price: 1100, body: '#ff9d2e', wing: '#e07b00', belly: '#ffe9c4', beak: '#c0392b', cheek: '#ffd54f', tiger: true },
    { id: 'gato',          name: 'Michi',        desc: 'Orejas de gato incluidas.',       price: 900,  body: '#9aa7b5', wing: '#6d7d8a', belly: '#eef2f5', beak: '#4a5560', cheek: '#ff9db0', kitty: true },
    { id: 'cacto',         name: 'Cacto',        desc: 'Pica, pero vuela.',               price: 800,  body: '#66bb6a', wing: '#388e3c', belly: '#d6f5d8', beak: '#ff7043', cheek: '#a5d6a7', cactus: true },
    { id: 'alien',         name: 'Marciano',     desc: 'Procede de otro planeta.',        price: 1300, body: '#81c784', wing: '#4c8c5d', belly: '#c8e6c9', beak: '#37474f', cheek: '#c5e1a5', alien: true },
    { id: 'cafe',          name: 'Café',         desc: 'Espresso y alas.',                price: 450,  body: '#8d6e63', wing: '#6d4c41', belly: '#efe4d8', beak: '#ff7043', cheek: '#d7ccc8', blush: true },
    { id: 'marina',        name: 'Marina',       desc: 'Limpia como el océano.',          price: 500,  body: '#26a69a', wing: '#00897b', belly: '#e0f2f1', beak: '#ffb300', cheek: '#80cbc4', shine: true },
    { id: 'sol',           name: 'Solar',        desc: 'Brilla como el mediodía.',        price: 1600, body: '#ffee58', wing: '#fbc02d', belly: '#fff9c4', beak: '#fb8c00', cheek: '#fff176', shine: true },
    { id: 'pantera',       name: 'Pantera',      desc: 'Rayas de silencio nocturno.',     price: 1300, body: '#37474f', wing: '#263238', belly: '#cfd8dc', beak: '#ff5252', cheek: '#607d8b', tiger: true },
    { id: 'lava',          name: 'Lava',         desc: 'Creada en el corazón del volcán.', price: 950,  body: '#e64a19', wing: '#bf360c', belly: '#ffe0b2', beak: '#ffd54f', cheek: '#ff8a65', shine: true },
    { id: 'nevado',        name: 'Copo',         desc: 'Suave como la nieve fresca.',     price: 600,  body: '#e3f2fd', wing: '#90caf9', belly: '#ffffff', beak: '#42a5f5', cheek: '#bbdefb', ice: true },
    /* ---- DESBLOQUES SEMANALES (2 por semana): AVES ---- */
    { id: 'choco',         name: 'Chocolate',     desc: 'Corazón de cacao puro.',         price: 400,  body: '#6d4c41', wing: '#4e342e', belly: '#efe4d8', beak: '#ff8f00', cheek: '#a1887f', blush: true, week: 1 },
    { id: 'menta',         name: 'Menta',         desc: 'Fresca y refrescante.',          price: 400,  body: '#81c784', wing: '#4caf50', belly: '#e8f5e9', beak: '#388e3c', cheek: '#c8e6c9', ice: true,  week: 1 },
    { id: 'zen',           name: 'Zen',           desc: 'Paz interior y alas.',           price: 500,  body: '#90a4ae', wing: '#78909c', belly: '#eceff1', beak: '#546e7a', cheek: '#b0bec5', shine: true, week: 6 },
    { id: 'fruta',         name: 'Fruta Exótica', desc: 'Sabor tropical directo.',        price: 500,  body: '#ffb74d', wing: '#fb8c00', belly: '#fff3e0', beak: '#e53935', cheek: '#ffcc80', sparkle: true, week: 6 },
    { id: 'dragon',        name: 'Dragón',        desc: 'Escamas de campeón.',            price: 700,  body: '#e57373', wing: '#d32f2f', belly: '#ffcdd2', beak: '#c62828', cheek: '#ef9a9a', tiger: true, week: 11 },
    { id: 'pingu',         name: 'Pingüino',      desc: 'Elegante en el hielo.',          price: 700,  body: '#37474f', wing: '#263238', belly: '#ffffff', beak: '#ffb300', cheek: '#eceff1', ice: true, week: 11 },
    { id: 'unic',          name: 'Unicornio',     desc: 'Brillo de arcoíris.',            price: 800,  body: '#f8bbd0', wing: '#f48fb1', belly: '#fce4ec', beak: '#ffd54f', cheek: '#f8bbd0', sparkle: true, week: 15 },
    { id: 'abeja',         name: 'Abejita',       desc: 'Zumba como una flor.',           price: 650,  body: '#ffe082', wing: '#ffb300', belly: '#fff8e1', beak: '#4e342e', cheek: '#ffca28', tiger: true, week: 15 },
    { id: 'luxo',          name: 'Lujo',          desc: 'Solo oro y más oro.',            price: 1300, body: '#ffca28', wing: '#ff8f00', belly: '#fff9c4', beak: '#8d6e63', cheek: '#ffe082', shine: true, week: 19 },
    { id: 'fenix',         name: 'Fénix',         desc: 'Renace entre las llamas.',       price: 1200, body: '#ff7043', wing: '#e64a19', belly: '#ffe0b2', beak: '#ffd54f', cheek: '#ffab91', shine: true, week: 19 },
    { id: 'elfo',          name: 'Elfo',          desc: 'Ayudante de los regalos.',       price: 600,  body: '#66bb6a', wing: '#43a047', belly: '#e8f5e9', beak: '#6d4c41', cheek: '#a5d6a7', blush: true, week: 23 },
    { id: 'robotx',        name: 'Robo-X',        desc: 'La unidad definitiva.',          price: 1000, body: '#263238', wing: '#37474f', belly: '#cfd8dc', beak: '#00e5ff', cheek: '#78909c', nebula: true, week: 23 },
    /* ---- OLEADA 2027: más aves (semanas 27-29) ---- */
    { id: 'jaguar',       name: 'Jaguar',        desc: 'Realeza de la selva.',           price: 1000, body: '#ffb300', wing: '#e65100', belly: '#fff3e0', beak: '#37474f', cheek: '#ffe082', tiger: true, week: 27 },
    { id: 'nube',         name: 'Nubecita',      desc: 'Flota suave en el cielo.',       price: 700,  body: '#e3f2fd', wing: '#bbdefb', belly: '#ffffff', beak: '#90a4ae', cheek: '#e1f5fe', ice: true, week: 27 },
    { id: 'rana',         name: 'Ranita',        desc: 'Brinca de hoja en hoja.',        price: 550,  body: '#8bc34a', wing: '#689f38', belly: '#f1f8e9', beak: '#33691e', cheek: '#ffcc80', blush: true, week: 28 },
    { id: 'faro',         name: 'Faro',          desc: 'Guía entre la niebla.',          price: 850,  body: '#ffcc80', wing: '#ffa726', belly: '#fff8e1', beak: '#5d4037', cheek: '#ffb74d', shine: true, week: 28 },
    { id: 'marip',        name: 'Mariposín',     desc: 'Alas de mil colores.',           price: 900,  body: '#ce93d8', wing: '#ba68c8', belly: '#f3e5f5', beak: '#6a1b9a', cheek: '#e1bee7', rainbow: true, week: 29 },
    { id: 'sirena',       name: 'Sirena',        desc: 'Canta bajo el mar.',             price: 1100, body: '#4db6ac', wing: '#009688', belly: '#e0f2f1', beak: '#ffb300', cheek: '#80cbc4', sparkle: true, week: 29 },
    /* ---- OLEADA 2027: más aves (semanas 30-33) ---- */
    { id: 'koi',          name: 'Koi',           desc: 'Pececito dorado con alas.',      price: 900,  body: '#ffb74d', wing: '#ef6c00', belly: '#fff3e0', beak: '#37474f', cheek: '#ffcc80', sparkle: true, week: 30 },
    { id: 'sakura',       name: 'Sakura',        desc: 'Pétalos de cerezo al vuelo.',    price: 850,  body: '#f8bbd0', wing: '#f06292', belly: '#fce4ec', beak: '#ad1457', cheek: '#f8bbd0', blush: true,  week: 30 },
    { id: 'quetzal',      name: 'Quetzal',       desc: 'Plumas de jade real.',           price: 1100, body: '#26a69a', wing: '#00897b', belly: '#e0f2f1', beak: '#ffb300', cheek: '#4db6ac', sparkle: true, week: 31 },
    { id: 'zombie',       name: 'Pío Zombi',     desc: 'Regresa de la tumba a volar.',   price: 950,  body: '#7cb342', wing: '#558b2f', belly: '#dcedc8', beak: '#33691e', cheek: '#aed581', ghost: true, week: 31 },
    { id: 'astro',        name: 'Astronauta',    desc: 'Listo para el espacio.',         price: 1200, body: '#eceff1', wing: '#90a4ae', belly: '#ffffff', beak: '#546e7a', cheek: '#b0bec5', shine: true, week: 32 },
    { id: 'arandano',     name: 'Arándano',      desc: 'Pequeño y dulce.',               price: 650,  body: '#5c6bc0', wing: '#3949ab', belly: '#e8eaf6', beak: '#ff8f00', cheek: '#7986cb', sparkle: true, week: 32 },
    { id: 'pastel',       name: 'Pastelito',     desc: 'Relleno de crema y velitas.',    price: 800,  body: '#ffcc80', wing: '#ffb74d', belly: '#fff3e0', beak: '#8d6e63', cheek: '#f48fb1', blush: true, week: 33 },
    { id: 'rayo',         name: 'Rayo',          desc: 'Velocidad pura.',                price: 1000, body: '#fff176', wing: '#ffd600', belly: '#fffde7', beak: '#37474f', cheek: '#ffff00', tiger: true, week: 33 }
  ];

  /* Atributos por ave: multiplicadores de vuelo (spd=velocidad del mundo, flap=aleteo, grav=caída, gap=hueco).
   Valores por defecto 1. Solo se listan las que difieren. */
  const SKIN_STATS = {
    night:   { spd: 0.98, grav: 0.92 },   // Ninja: cae más lento, más sigilosa
    robot:   { spd: 1.06 },               // Robo-Pío: unidad veloz
    oro:     { flap: 1.08 },              // Dorada: aleteo de campeón
    fantasma:{ grav: 0.9 },               // Fantasma: flota
    hada:    { grav: 0.96 },
    ice:     { gap: 1.06, grav: 0.98 },   // Glaciar: huecos más amplios
    nebula:  { gap: 1.05 },
    pantera: { spd: 1.04, grav: 0.95 },
    sol:     { spd: 1.05 },
    dragon:  { flap: 1.1 },
    abeja:   { grav: 0.97, flap: 1.05 },
    zen:     { gap: 1.05, grav: 0.97 },
    unic:    { flap: 1.05 },
    fenix:   { flap: 1.12 },              // Fénix: aletea más fuerte
    quetzal: { spd: 0.96 },
    astro:   { grav: 0.9 },
    koi:     { gap: 1.04 },
    rayo:    { spd: 1.1 },
    sakura:  { grav: 0.98 },
    lava:    { flap: 1.08 },
    nube:    { grav: 0.95, gap: 1.04 }
  };
  const SKIN_STATS_DEF = { spd: 1, flap: 1, grav: 1, gap: 1 };
  function skinStats(id) { return Object.assign({}, SKIN_STATS_DEF, SKIN_STATS[id] || {}); }

  /* Variantes doradas: se consiguen (5%) al abrir una Caja Sorpresa (huevo) */
  function makeGold(base) {
    return {
      id: base.id + '-gold', name: 'Dorada ' + base.name,
      desc: 'Variante dorada de ' + base.name + ' · brilla con luz propia.',
      price: 0, body: '#ffd54f', wing: '#ffab00', belly: '#fff7cc', beak: '#ff8f00', cheek: '#ffca28',
      shine: true, golden: true, baseOf: base.id
    };
  }
  function boxDef() {
    return { name: 'Caja Sorpresa', price: 500, desc: 'Abre un huevo sorpresa: te lleva un ave, sombrero o estela que aún no tengas (5% de que salga una variante dorada con brillo ✨).' };
  }

  /* Evolución del ave: la XP acumulada al volar sube su etapa (1 → 2 → 3) */
  const SKIN_EVOLVE_XP = [0, 600, 1800];
  function evolveStage(xp) { return xp >= SKIN_EVOLVE_XP[2] ? 3 : xp >= SKIN_EVOLVE_XP[1] ? 2 : 1; }

  const HATS = [
    { id: 'hat-crown',    name: 'Corona',        price: 400,  type: 'crown' },
    { id: 'hat-xmas',     name: 'Gorro Navideño', price: 300, type: 'xmas' },
    { id: 'hat-cowboy',   name: 'Sombrero Vaquero', price: 300, type: 'cowboy' },
    { id: 'hat-head',     name: 'Audífonos',     price: 350,  type: 'headphones' },
    { id: 'hat-halo',     name: 'Halo',          price: 450,  type: 'halo' },
    { id: 'hat-party',    name: 'Sombrerito Fiesta', price: 250, type: 'party' },
    { id: 'hat-prop',     name: 'Hélice',        price: 500,  type: 'propeller' },
    { id: 'hat-pirate',   name: 'Sombrero Pirata', price: 550, type: 'piracy' },
    { id: 'hat-flower',   name: 'Florcita',      price: 200,  type: 'flower' },
    { id: 'hat-cool',     name: 'Gorro de Noche', price: 320, type: 'bonnet' },
    { id: 'hat-ears',     name: 'Orejitas de Gato', price: 220, type: 'ears' },
    { id: 'hat-mushroom', name: 'Champiñón',        price: 280, type: 'mushroom' },
    { id: 'hat-wizard',   name: 'Gorro de Mago',    price: 420, type: 'wizard' },
    { id: 'hat-star',     name: 'Estrella',         price: 350, type: 'star' },
    { id: 'hat-band',     name: 'Cinta Deportiva',  price: 150, type: 'band' },
    { id: 'hat-house',    name: 'Casita',           price: 500, type: 'house' },
    { id: 'hat-antenna',  name: 'Antena',           price: 180, type: 'antenna' },
    { id: 'hat-bow',      name: 'Lazo',             price: 160, type: 'bow' },
    { id: 'hat-vr',       name: 'Gafas Neón 2026',  price: 550, type: 'vr' },
    /* ---- DESBLOQUES SEMANALES (2 por semana): SOMBREROS ---- */
    { id: 'hat-tigrito',   name: 'Orejitas Tigre',   price: 260, type: 'ears',    week: 2 },
    { id: 'hat-duende',    name: 'Gorrito Duende',   price: 300, type: 'xmas',    week: 2 },
    { id: 'hat-fuego',     name: 'Diadema de Fuego', price: 480, type: 'crown',   week: 7 },
    { id: 'hat-almohada',  name: 'Almohadita',       price: 340, type: 'bonnet',  week: 7 },
    { id: 'hat-punk',      name: 'Cresta Punk',      price: 320, type: 'antenna', week: 12 },
    { id: 'hat-avion',     name: 'Avioncito',        price: 420, type: 'propeller', week: 12 },
    { id: 'hat-girasol',   name: 'Girasol',          price: 280, type: 'flower',  week: 16 },
    { id: 'hat-estrellita', name: 'Estrellita',      price: 300, type: 'star',    week: 16 },
    { id: 'hat-banda2',    name: 'Cinta Campeón',    price: 200, type: 'band',    week: 20 },
    { id: 'hat-capitan',   name: 'Gorra Capitán',    price: 440, type: 'piracy',  week: 20 },
    { id: 'hat-luces',     name: 'Luces de Feria',   price: 360, type: 'party',   week: 24 },
    { id: 'hat-vaquerox',  name: 'Rancho Élite',     price: 380, type: 'cowboy',  week: 24 },
    /* ---- OLEADA 2027: más sombreros (semanas 27-28) ---- */
    { id: 'hat-cuernos',   name: 'Cuernos de Dragón', price: 500, type: 'crown',   week: 27 },
    { id: 'hat-bandana',   name: 'Bandana Pirata',    price: 320, type: 'piracy',  week: 27 },
    { id: 'hat-huevo',     name: 'Caja Sorpresa',     price: 300, type: 'party',   week: 28 },
    { id: 'hat-pin',       name: 'Pasador de Luz',    price: 280, type: 'star',    week: 28 },
    /* ---- OLEADA 2027: más sombreros (semanas 34-35) ---- */
    { id: 'hat-brujo',     name: 'Sombrero de Brujo', price: 450, type: 'wizard',  week: 34 },
    { id: 'hat-setas',     name: 'Honguito',          price: 420, type: 'mushroom', week: 35 },
    /* ---- OLEADA 2027: más sombreros (semanas 29-33) ---- */
    { id: 'hat-cinta',    name: 'Cinta de Vuelo',     price: 180, type: 'band',     week: 29 },
    { id: 'hat-cometa',   name: 'Gorro Cometa',       price: 340, type: 'bonnet',   week: 29 },
    { id: 'hat-lentes',   name: 'Anteojos Redondos',  price: 300, type: 'vr',       week: 30 },
    { id: 'hat-tiara',    name: 'Tiara Lunar',        price: 450, type: 'crown',    week: 30 },
    { id: 'hat-bufanda',  name: 'Bufanda Roja',       price: 260, type: 'bonnet',   week: 31 },
    { id: 'hat-real',     name: 'Corona Real',        price: 550, type: 'crown',    week: 31 },
    { id: 'hat-arco',     name: 'Arco Floral',        price: 280, type: 'flower',   week: 32 },
    { id: 'hat-vela',     name: 'Velita de Cumple',   price: 300, type: 'party',    week: 32 },
    { id: 'hat-farol',    name: 'Farol Mágico',       price: 360, type: 'star',     week: 33 },
    { id: 'hat-yelmo',    name: 'Yelmo Dorado',       price: 500, type: 'crown',    week: 33 }
  ];

  const EFFECTS = [
    { id: 'fx-none',   name: 'Sin estela',      price: 0,    color: null },
    { id: 'fx-marip',  name: 'Estela Dorada',   price: 250,  color: '#ffd54f' },
    { id: 'fx-flame',  name: 'Estela de Fuego', price: 450,  color: '#ff7043' },
    { id: 'fx-cyan',   name: 'Estela Cósmica',  price: 400,  color: '#29b6f6' },
    { id: 'fx-rosado', name: 'Estela Rosa',     price: 300,  color: '#ff8fd4' },
    { id: 'fx-verde',  name: 'Estela Mágica',   price: 350,  color: '#69f0ae' },
    { id: 'fx-star',   name: 'Polvo de Estrellas', price: 800, color: '#fff9c4', stars: true },
    { id: 'fx-vaper',  name: 'Estela Oscura',   price: 500,  color: '#b39ddb' },
    { id: 'fx-galaxy', name: 'Estela Galaxia',   price: 950,  color: '#7e57c2', stars: true },
    { id: 'fx-neon',   name: 'Estela Neón',      price: 650,  color: '#22e4ff' },
    { id: 'fx-perla',  name: 'Estela Perla',     price: 1000, color: '#b2dfdb', stars: true },
    { id: 'fx-burbuja', name: 'Burbujas',        price: 750,  color: '#7ff3ff' },
    { id: 'fx-laser',  name: 'Láser',            price: 550,  color: '#eeff41' },
    { id: 'fx-oro',    name: 'Estela 24k',       price: 1200, color: '#c8910f', stars: true },
    { id: 'fx-llama',  name: 'Llama Viva',       price: 350,  color: '#ff7043' },
    { id: 'fx-mistico', name: 'Brillo Místico',   price: 550,  color: '#ce93d8', stars: true },
    { id: 'fx-arcoiris', name: 'Arcoíris',        price: 750,  color: '#ffca28', rainbow: true },
    /* ---- DESBLOQUES SEMANALES (2 por semana): ESTELAS ---- */
    { id: 'fx-miel',   name: 'Melaza',          price: 300,  color: '#ffab00', week: 3 },
    { id: 'fx-lava',   name: 'Lava Viva',       price: 450,  color: '#ff3d00', stars: true, week: 3 },
    { id: 'fx-cielo',  name: 'Cielo Abierto',   price: 350,  color: '#4fc3f7', stars: true, week: 8 },
    { id: 'fx-nevada', name: 'Nieve',           price: 400,  color: '#e0f7fa', week: 8 },
    { id: 'fx-limo',   name: 'Limonada',        price: 350,  color: '#aed581', week: 13 },
    { id: 'fx-manga',  name: 'Anime',           price: 500,  color: '#ff80ab', rainbow: true, week: 13 },
    { id: 'fx-cristal', name: 'Cristal',        price: 700,  color: '#b2dfdb', stars: true, week: 17 },
    { id: 'fx-uv',     name: 'Ultravioleta',    price: 600,  color: '#651fff', week: 17 },
    { id: 'fx-pixel',  name: 'Píxel',           price: 550,  color: '#64ffda', stars: true, week: 21 },
    { id: 'fx-canela', name: 'Canela',          price: 400,  color: '#a1887f', week: 21 },
    { id: 'fx-galactico', name: 'Galáctico',    price: 900,  color: '#00e5ff', stars: true, week: 25 },
    { id: 'fx-coral',  name: 'Coral',           price: 500,  color: '#ff7043', stars: true, week: 25 },
    /* ---- OLEADA 2027: más estelas (semanas 29-30) ---- */
    { id: 'fx-dragon', name: 'Fuego de Dragón', price: 850,  color: '#ff5722', stars: true, week: 29 },
    { id: 'fx-sirena', name: 'Espuma de Mar',   price: 650,  color: '#4dd0e1', week: 29 },
    { id: 'fx-neonx',  name: 'Neón Ciber',      price: 750,  color: '#00e676', stars: true, week: 30 },
    { id: 'fx-nubes',  name: 'Algodón',         price: 400,  color: '#ffffff', week: 30 },
    /* ---- OLEADA 2027: más estelas (semanas 34-36) ---- */
    { id: 'fx-magma', name: 'Lava',              price: 800,  color: '#ff6d00', stars: true, week: 34 },
    { id: 'fx-cometa', name: 'Cola de Cometa',   price: 700,  color: '#69f0ae', stars: true, week: 36 },
    /* ---- OLEADA 2027: más estelas (semanas 31-33 y 37-38) ---- */
    { id: 'fx-koi',   name: 'Escamas Koi',       price: 650,  color: '#ffb74d', stars: true, week: 31 },
    { id: 'fx-petalo', name: 'Pétalos',          price: 500,  color: '#f48fb1', week: 31 },
    { id: 'fx-sol',   name: 'Destellos Solares', price: 700,  color: '#fff176', stars: true, week: 32 },
    { id: 'fx-chispa', name: 'Chispas',          price: 550,  color: '#ffd600', week: 32 },
    { id: 'fx-lunar', name: 'Polvo Lunar',       price: 600,  color: '#e1bee7', stars: true, week: 33 },
    { id: 'fx-brisa', name: 'Brisa',             price: 450,  color: '#81d4fa', week: 33 },
    { id: 'fx-hielo', name: 'Estela Helada',     price: 750,  color: '#b3e5fc', stars: true, week: 37 },
    { id: 'fx-real',  name: 'Estela Real',       price: 900,  color: '#ffca28', stars: true, week: 38 }
  ];

  const MAPS = [
    { id: 'day',        name: 'Día Soleado',   icon: '🌞', price: 0,    minScore: 0,   unlock: null,  sky: ['#6ec6ff', '#d4f2ff'], ground: '#7cba55', hill1: '#8fce63', hill2: '#a9dc87', cloud: '#ffffff', stars: false, bubbles: false, grid: false, pipe: '#5fae43', pipeRim: '#3e8e2f', accent: '#ffd54f' },
    { id: 'sunset',     name: 'Atardecer',     icon: '🌇', price: 350,  minScore: 10,  unlock: 'coins', sky: ['#ff9a8b', '#ff6a88'], ground: '#a4686f', hill1: '#b57a80', hill2: '#c98f94', cloud: '#ffe3d6', stars: false, bubbles: false, grid: false, pipe: '#9c5f6a', pipeRim: '#80434e', accent: '#ffd166' },
    { id: 'night',      name: 'Noche Estrellada', icon: '🌙', price: 500, minScore: 25, unlock: 'coins', sky: ['#1a2254', '#35407a'], ground: '#2c4a63', hill1: '#365b6e', hill2: '#43727f', cloud: '#5b6a94', stars: true,  bubbles: false, grid: false, pipe: '#3d7ea8', pipeRim: '#2c5f85', accent: '#ffe066' },
    { id: 'space',      name: 'Espacio Profundo', icon: '🚀', price: 900, minScore: 45, unlock: 'coins', sky: ['#050816', '#141242'], ground: '#2a2c5a', hill1: '#34376b', hill2: '#40427d', cloud: '#20224a', stars: true,  bubbles: false, grid: false, pipe: '#5e3f9e', pipeRim: '#472f80', accent: '#7ee0ff' },
    { id: 'neon',       name: 'Sintetizador',  icon: '🎧', price: 700,  minScore: 30,  unlock: 'coins', sky: ['#16003d', '#3a0ca3'], ground: '#12065c', hill1: '#1d0f6e', hill2: '#281482', cloud: '#2a0f77', stars: true,  bubbles: false, grid: true,  pipe: '#ff5f9e', pipeRim: '#c22e8a', accent: '#22e4ff' },
    { id: 'water',      name: 'Fondo del Mar', icon: '🐠', price: 600,  minScore: 20,  unlock: 'coins', sky: ['#7fd8df', '#0f8f9c'], ground: '#2f9e78', hill1: '#3dab8a', hill2: '#4bb79a', cloud: '#bff4ee', stars: false, bubbles: true,  grid: false, pipe: '#2e8f7a', pipeRim: '#1d6f5f', accent: '#ffe066' },
    { id: 'forest',     name: 'Bosque Encantado', icon: '🌲', price: 400, minScore: 15, unlock: 'coins', sky: ['#a5d662', '#e6f5c8'], ground: '#5f8b3a', hill1: '#6f9d49', hill2: '#80ae5b', cloud: '#f2fae0', stars: false, bubbles: true,  grid: false, pipe: '#4d7c33', pipeRim: '#3a611f', accent: '#ffd54f' },
    { id: 'tundra',     name: 'Tundra Blanca', icon: '❄️', price: 500,  minScore: 22,  unlock: 'coins', sky: ['#cfe3f2', '#eef7fd'], ground: '#dbe7ee', hill1: '#cfdfe9', hill2: '#e3ebf1', cloud: '#ffffff', stars: false, bubbles: false, grid: false, pipe: '#a8c4dc', pipeRim: '#7fa4c4', accent: '#7bd8f6' },
    { id: 'candy',      name: 'Tierra de Dulces', icon: '🍭', price: 450, minScore: 18,  unlock: 'coins', sky: ['#ffd6e8', '#ffe9f5'], ground: '#f4a7c8', hill1: '#ffb9d5', hill2: '#ffcfe3', cloud: '#ffffff', stars: false, bubbles: true,  grid: false, pipe: '#ff9ec3', pipeRim: '#e0679c', accent: '#ffffff' },
    { id: 'volcano',    name: 'Volcán',          icon: '🌋', price: 750, minScore: 35,  unlock: 'coins', sky: ['#2d1b1b', '#6b2d28'], ground: '#5d4037', hill1: '#6d4c41', hill2: '#795548', cloud: 'rgba(255,255,255,0.6)', stars: true,  bubbles: false, grid: false, pipe: '#8d5a45', pipeRim: '#6b3f2e', accent: '#ffab40' },
    { id: 'primavera', name: 'Cerezos',         icon: '🌸', price: 550, minScore: 26,  unlock: 'coins', sky: ['#ffd6ef', '#fff0f7'], ground: '#f2a7c4', hill1: '#f7bcd4', hill2: '#fbcfdf', cloud: '#ffffff', stars: false, bubbles: true,  grid: false, pipe: '#e88fb3', pipeRim: '#c05a8f', accent: '#ff80ab' },
    { id: 'desierto',  name: 'Desierto',        icon: '🏜️', price: 600, minScore: 28,  unlock: 'coins', sky: ['#ffd180', '#ffe8c0'], ground: '#e0b57c', hill1: '#eac189', hill2: '#f0cf9d', cloud: '#fff3e0', stars: false, bubbles: false, grid: false, pipe: '#c88e4f', pipeRim: '#a86f34', accent: '#ffcd70' },
    { id: 'cyber',     name: 'Cyberpunk',       icon: '🌃', price: 1100, minScore: 60, unlock: 'coins', sky: ['#0b0531', '#2a1a6e'], ground: '#140a45', hill1: '#1d1058', hill2: '#281a70', cloud: '#2a0f77', stars: true,  bubbles: false, grid: true,  pipe: '#00e5ff', pipeRim: '#0091b3', accent: '#ff2ec4' },
    { id: 'arcade',     name: 'Retro Arcade',     icon: '🕹️', price: 900, minScore: 50, unlock: 'coins', sky: ['#12002b', '#3d0a91'], ground: '#1d0f6e', hill1: '#28127f', hill2: '#331896', cloud: '#2a0f77', stars: true,  bubbles: false, grid: true, pipe: '#ff2e88', pipeRim: '#b3145e', accent: '#00e5ff' },
    { id: 'volt',      name: 'Alta Tensión',      icon: '⚡', price: 800, minScore: 42, unlock: 'coins', sky: ['#0b1d3a', '#1e3a8a'], ground: '#143a66', hill1: '#1d4a78', hill2: '#255a8a', cloud: '#3b6ea8', stars: false, bubbles: false, grid: true, pipe: '#39ff14', pipeRim: '#00b8a9', accent: '#ffe600' },
    /* ---- DESBLOQUES SEMANALES (2 por semana): MAPAS ---- */
    { id: 'nevadoM',   name: 'Noche Polar',     icon: '❄️', price: 700, minScore: 38, unlock: 'coins', sky: ['#0e2a47', '#1b3f6e'], ground: '#2e5d86', hill1: '#3a6f9c', hill2: '#4880ad', cloud: '#3b6ea8', stars: true,  bubbles: false, grid: false, pipe: '#3d7ea8', pipeRim: '#2c5f85', accent: '#7bd8f6', week: 5 },
    { id: 'selva',    name: 'Selva Tropical',  icon: '🌴', price: 650, minScore: 34, unlock: 'coins', sky: ['#0e7a4b', '#2ecc71'], ground: '#2f6e4e', hill1: '#3d7e5f', hill2: '#4b8f6f', cloud: '#e0f7e9', stars: false, bubbles: true,  grid: false, pipe: '#2e8f5e', pipeRim: '#1d6f45', accent: '#ffd54f', week: 5 },
    { id: 'playa',    name: 'Playa',           icon: '🏖️', price: 600, minScore: 30, unlock: 'coins', sky: ['#7ed7ff', '#d9f6ff'], ground: '#f6d18a', hill1: '#ffdf9e', hill2: '#ffe9bc', cloud: '#ffffff', stars: false, bubbles: true,  grid: false, pipe: '#e6a756', pipeRim: '#c07e2e', accent: '#ffffff', week: 10 },
    { id: 'ciudad',   name: 'Ciudad',          icon: '🏙️', price: 800, minScore: 44, unlock: 'coins', sky: ['#20263f', '#39406b'], ground: '#2c2f42', hill1: '#383b52', hill2: '#454863', cloud: '#4c5478', stars: false, bubbles: false, grid: true,  pipe: '#8ea3ff', pipeRim: '#5a72cf', accent: '#8ea3ff', week: 10 },
    { id: 'magia',    name: 'Bosque Mágico',   icon: '🪄', price: 900, minScore: 48, unlock: 'coins', sky: ['#2a1a5e', '#4c2a8a'], ground: '#443a7a', hill1: '#52448f', hill2: '#6150a3', cloud: '#6a5fb8', stars: true,  bubbles: true,  grid: false, pipe: '#8a6fe8', pipeRim: '#5f42c8', accent: '#ffd54f', week: 14 },
    { id: 'glitch',   name: 'Glitch',          icon: '👾', price: 950, minScore: 52, unlock: 'coins', sky: ['#0d0221', '#301934'], ground: '#1d0f3a', hill1: '#2a1248', hill2: '#37165a', cloud: '#3d1b66', stars: true,  bubbles: false, grid: true,  pipe: '#39ff14', pipeRim: '#00e5ff', accent: '#ff00c8', week: 14 },
    { id: 'aurora',   name: 'Aurora',          icon: '🌠', price: 1000, minScore: 55, unlock: 'coins', sky: ['#0b1420', '#1b4a3a'], ground: '#1e3a2f', hill1: '#2a4a3c', hill2: '#365b4a', cloud: '#2f4f43', stars: true,  bubbles: false, grid: false, pipe: '#5bdc7e', pipeRim: '#2ea85a', accent: '#69f0ae', week: 18 },
    { id: 'tormenta', name: 'Tormenta',        icon: '⛈️', price: 850, minScore: 46, unlock: 'coins', sky: ['#3a3f47', '#5d6570'], ground: '#4a5058', hill1: '#585f68', hill2: '#676f78', cloud: '#5d6570', stars: false, bubbles: false, grid: true,  pipe: '#ffd54f', pipeRim: '#b8860b', accent: '#ffe082', week: 18 },
    { id: 'rubi',     name: 'Rubí',            icon: '💎', price: 1100, minScore: 60, unlock: 'coins', sky: ['#2b0f14', '#5a1f2b'], ground: '#3a1520', hill1: '#4b1c2a', hill2: '#5c2335', cloud: '#6b2a3d', stars: true,  bubbles: false, grid: false, pipe: '#ff5f8f', pipeRim: '#c22e5e', accent: '#ff80ab', week: 22 },
    { id: 'esmeralda', name: 'Esmeralda',      icon: '🔮', price: 1100, minScore: 62, unlock: 'coins', sky: ['#0f2b1f', '#1d4d38'], ground: '#1e4030', hill1: '#2a5040', hill2: '#366050', cloud: '#2a5040', stars: false, bubbles: true,  grid: false, pipe: '#34e07c', pipeRim: '#1aa05c', accent: '#69f0ae', week: 22 },
    /* ---- OLEADA 2027: más mapas (semanas 31-33) ---- */
    { id: 'luna',    name: 'Luna',            icon: '🌖', price: 1000, minScore: 58, unlock: 'coins', sky: ['#0a0e2a', '#232b56'], ground: '#2e3560', hill1: '#3a4170', hill2: '#464d80', cloud: '#4a5188', stars: true,  bubbles: false, grid: false, pipe: '#6c7bd8', pipeRim: '#44509f', accent: '#ffe066', week: 31 },
    { id: 'cafe',    name: 'Café',            icon: '☕', price: 850,  minScore: 50, unlock: 'coins', sky: ['#4e342e', '#795548'], ground: '#4a3728', hill1: '#5a4432', hill2: '#6a533c', cloud: '#8d6e63', stars: false, bubbles: false, grid: false, pipe: '#8d5a45', pipeRim: '#6b3f2e', accent: '#ffcc80', week: 32 },
    { id: 'oceano',  name: 'Océano',          icon: '🌊', price: 950,  minScore: 54, unlock: 'coins', sky: ['#013a63', '#046a9b'], ground: '#1b4d6b', hill1: '#276084', hill2: '#337396', cloud: '#4d96b8', stars: false, bubbles: true,  grid: false, pipe: '#29a2cf', pipeRim: '#14708f', accent: '#a5e6ff', week: 33 },
    /* ---- OLEADA 2027: más mapas (semanas 34-36) ---- */
    { id: 'ruinas',  name: 'Ruinas Perdidas', icon: '🏺', price: 900,  minScore: 52, unlock: 'coins', sky: ['#3d2816', '#6b4423'], ground: '#4a2f16', hill1: '#584027', hill2: '#684f31', cloud: '#7a5c39', stars: false, bubbles: false, grid: false, pipe: '#9c7a5a', pipeRim: '#6f4f33', accent: '#ffe082', week: 34 },
    { id: 'pantano', name: 'Pantano',         icon: '🐊', price: 880,  minScore: 51, unlock: 'coins', sky: ['#1a2e1a', '#2c522e'], ground: '#274a26', hill1: '#335c31', hill2: '#3f6e3c', cloud: '#4c7a4f', stars: false, bubbles: true,  grid: false, pipe: '#4c7a4f', pipeRim: '#315030', accent: '#9ccc65', week: 35 },
    { id: 'cometa',  name: 'Cometa',          icon: '☄️', price: 1050, minScore: 60, unlock: 'coins', sky: ['#070a1a', '#1c2450'], ground: '#161d3a', hill1: '#212a52', hill2: '#2c386a', cloud: '#2c386a', stars: true,  bubbles: false, grid: false, pipe: '#5f6fd0', pipeRim: '#3b4297', accent: '#69f0ae', week: 36 },
    { id: 'cristal', name: 'Cristal Helado',  icon: '💎', price: 1150, minScore: 64, unlock: 'coins', sky: ['#0e1b3a', '#2b4a7a'], ground: '#3f5f8f', hill1: '#4c6f9f', hill2: '#5a80b0', cloud: '#aac4e0', stars: true,  bubbles: false, grid: true,  pipe: '#7fd0ff', pipeRim: '#3f8fd0', accent: '#a5e6ff', week: 37 },
    { id: 'fiesta', name: 'Fiesta de Luces',  icon: '🎉', price: 1200, minScore: 66, unlock: 'coins', sky: ['#1a0b2e', '#3d1666'], ground: '#2a1142', hill1: '#391956', hill2: '#482166', cloud: '#5b2f85', stars: true,  bubbles: false, grid: true,  pipe: '#ff5fd8', pipeRim: '#c22e9f', accent: '#ffe066', week: 38 }
  ];

  const TOOLS = [
    { id: 'tool-start',  key: 'start',     name: 'Arranque Estelar', icon: '✨', desc: 'Empieza con +5 pts (modo libre).',          price: 80 },
    { id: 'tool-magnet', key: 'magnet',    name: 'Imán Total',       icon: '🧲', desc: 'Atrapa monedas 7 s · más con mejoras.',        price: 100 },
    { id: 'tool-slow',   key: 'slow',      name: 'Crucero Lento',    icon: '⏳', desc: 'Cámara lenta 5 s · más con mejoras.',           price: 90 },
    { id: 'tool-coins',  key: 'coins',     name: 'Monedas Plus',     icon: '💰', desc: 'Monedas dobles 8 s · más con mejoras.',         price: 120 },
    { id: 'tool-boost',  key: 'boost',     name: 'Empuje Turbo',     icon: '🚀', desc: 'Empiezas con +3 pts (cualquier modo).',         price: 85 },
    { id: 'tool-luck',   key: 'luck',      name: 'Suerte',           icon: '🍀', desc: 'Todas las monedas valen +1 toda la partida.',  price: 110 },
    { id: 'tool-score',  key: 'score',     name: 'Puntos Plus',      icon: '🎯', desc: 'Cada tubo pasado da +1 punto extra.',           price: 95 },
    { id: 'tool-sprint', key: 'sprint',    name: 'Alas Ligeras',     icon: '🪽', desc: 'Caes un 15% más despacio toda la partida.',     price: 105 },
    { id: 'tool-treasure', key: 'treasure', name: 'Tesoro Cercano',  icon: '💎', desc: 'Robas +6 🪙 y +1 pt al instante.',             price: 90 },
    { id: 'tool-clock',  key: 'clock',     name: 'Reloj Estelar',    icon: '⏱', desc: 'Congela la dificultad 5 s · más con mejoras.', price: 95 },
    { id: 'tool-turbo',  key: 'turbo',     name: 'Aliento de Cohete', icon: '⚡', desc: 'Velocidad extra 4 s · más con mejoras.',        price: 100 },
    { id: 'tool-combo',  key: 'combo',     name: 'Racha Extra',     icon: '🔥', desc: '+2 pts por tubo extra 10 s · más con mejoras.', price: 110 },
    { id: 'tool-shield', key: 'shield',    name: 'Escudo Celeste',   icon: '🛡️', desc: 'Absorbe 1 choque al inicio de la partida.',      price: 120 },
    { id: 'tool-ghost',  key: 'ghost',     name: 'Pase Fantasma',    icon: '👻', desc: 'Atraviesas obstáculos 4 s al inicio.',           price: 120 },
    { id: 'tool-frenzy', key: 'frenzy',    name: 'Frenesí',         icon: '🎇', desc: '+1 pt por cada power-up durante 12 s.',          price: 140 },
    /* ---- DESBLOQUES SEMANALES (2 por semana): HERRAMIENTAS ---- */
    { id: 'tool-eco',   key: 'eco',      name: 'Eco Bolsa',       icon: '🛍️', desc: 'Robas +10 🪙 al instante.',                       price: 90,  week: 4 },
    { id: 'tool-hype',  key: 'hype',     name: 'Hype',            icon: '🔥', desc: '+2 pts por cada power-up, toda la partida.',      price: 150, week: 4 },
    { id: 'tool-bomb',  key: 'bomb',     name: 'Cosecha',         icon: '🧨', desc: '+1 pt por cada moneda durante 10 s.',             price: 100, week: 9 },
    { id: 'tool-aura',  key: 'aura',     name: 'Aura Ascendente', icon: '🕉️', desc: '+1 pt extra por tubo durante 20 s.',             price: 110, week: 9 },
    { id: 'tool-twin',  key: 'twin',     name: 'Géminis',         icon: '🧿', desc: 'Empiezas con +8 pts (cualquier modo).',            price: 120, week: 26 },
    { id: 'tool-oasis', key: 'oasis',    name: 'Oasis',           icon: '💧', desc: '+1 pt por cada 10 m volados, toda la partida.',   price: 130, week: 26 },
    /* ---- OLEADA 2027: más herramientas (semanas 30-31) ---- */
    { id: 'tool-doble', key: 'doble',    name: 'Doble Punto',     icon: '♦️', desc: '+1 pt extra por tubo, toda la partida.',         price: 150, week: 30 },
    { id: 'tool-runa',  key: 'runa',     name: 'Runa Ancestral',  icon: '🗿', desc: '+15 XP de jugador al instante.',                price: 140, week: 31 },
    /* ---- HERRAMIENTAS NUEVAS (semanas 33-36) ---- */
    { id: 'tool-titan',  key: 'titan',   name: 'Modo Titán',     icon: '🥊', desc: '+2 pts por cada tubo, toda la partida.',         price: 160, week: 33 },
    { id: 'tool-fenix',  key: 'fenix',   name: 'Fénix',          icon: '🦅', desc: 'Revive una vez por vuelo.',                     price: 200, week: 34 },
    { id: 'tool-bateria', key: 'bateria', name: 'Batería Cósmica', icon: '🔋', desc: 'Avanza tu barra del modo (Contrarreloj: +2 tubos).', price: 150, week: 35 },
    { id: 'tool-cris',   key: 'cris',    name: 'Cristal Mágico', icon: '🪄', desc: '+20 monedas de oro al instante.',               price: 140, week: 36 }
  ];

  const ACH = [
    { id: 'a-first',      name: 'Primer Vuelo',      desc: 'Completa tu primera partida.',      check: s => s.get().stats.flights >= 1,                              reward: 50 },
    { id: 'a-10',         name: 'Tomando Vuelo',     desc: 'Cruza 10 obstáculos en total.',     check: s => s.get().stats.pipes >= 10,                              reward: 50 },
    { id: 'a-50',         name: 'Racha Imparable',   desc: 'Cruza 50 obstáculos en total.',     check: s => s.get().stats.pipes >= 50,                              reward: 100 },
    { id: 'a-500',        name: 'Leyenda Voladora',  desc: 'Cruza 500 obstáculos en total.',    check: s => s.get().stats.pipes >= 500,                             reward: 300 },
    { id: 'a-point30',    name: 'Puntaje Épico',     desc: 'Alcanza 30 puntos en una partida.', check: s => s.get().stats.best >= 30,                               reward: 100 },
    { id: 'a-point60',    name: 'Invencible',        desc: 'Alcanza 60 puntos en una partida.', check: s => s.get().stats.best >= 60,                               reward: 250 },
    { id: 'a-lv3',        name: 'Nivel 3',           desc: 'Alcanza el nivel de jugador 3.',    check: s => s.get().level >= 3,                                reward: 100 },
    { id: 'a-lv7',        name: 'Nivel 7',           desc: 'Alcanza el nivel de jugador 7.',    check: s => s.get().level >= 7,                                reward: 250 },
    { id: 'a-coins300',   name: 'Coleccionista',     desc: 'Consigue 300 monedas en total.',    check: s => s.get().coinsEarned >= 300,                        reward: 150 },
    { id: 'a-coins1000',  name: 'Rico Pío',          desc: 'Consigue 1.000 monedas en total.',  check: s => s.get().coinsEarned >= 1000,                       reward: 500 },
    { id: 'a-skin3',      name: 'Estilista',         desc: 'Compra 3 aves diferentes.',        check: s => s.get().skinsOwned.length >= 4,                    reward: 100 },
    { id: 'a-shop',       name: 'Moda Divina',       desc: 'Compra algo en las 3 tiendas.',     check: s => s.get().skinsOwned.length > 1 && s.get().hatsOwned.length > 0 && s.get().fxOwned.length > 1, reward: 150 },
    { id: 'a-map',        name: 'Explorador',        desc: 'Desbloquea un mapa nuevo.',        check: s => s.get().mapsOwned.length >= 2,                     reward: 100 },
    { id: 'a-map3',       name: 'Aventurero',        desc: 'Desbloquea 3 mapas nuevos.',       check: s => s.get().mapsOwned.length >= 4,                     reward: 200 },
    { id: 'a-perfect',    name: 'Vuelo Perfecto',    desc: 'Cruza 3 obstáculos seguidos.',      check: s => s.get().maxCombo >= 3,                             reward: 50 },
    { id: 'a-dist200',   name: 'Explorador de Largas Distancias', desc: 'Vuela 200 metros en total.',     check: s => s.get().stats.dist >= 200,                          reward: 100 },
    { id: 'a-dist1000',  name: 'Maratonista',                      desc: 'Vuela 1.000 metros en total.',    check: s => s.get().stats.dist >= 1000,                         reward: 300 },
    { id: 'a-lv15',      name: 'As del Cielo',                    desc: 'Alcanza el nivel de jugador 15.', check: s => s.get().level >= 15,                                reward: 400 },
    { id: 'a-power5',    name: 'Cazador de Poder',                desc: 'Recoge 5 power-ups.',             check: s => s.get().stats.powersGot >= 5,                       reward: 120 },
    { id: 'a-flights5',  name: 'Piloto Frecuente',                desc: 'Completa 5 partidas.',            check: s => s.get().stats.flights >= 5,                         reward: 75 },
    { id: 'a-flights25', name: 'Aviador Constante',               desc: 'Completa 25 partidas.',           check: s => s.get().stats.flights >= 25,                        reward: 150 },
    { id: 'a-flights100', name: 'Capitán del Cielo',              desc: 'Completa 100 partidas.',          check: s => s.get().stats.flights >= 100,                       reward: 400 },
    { id: 'a-combo5',    name: 'En Racha',                        desc: 'Cruza 5 obstáculos seguidos.',    check: s => s.get().maxCombo >= 5,                              reward: 80 },
    { id: 'a-combo10',   name: 'Racha Legendaria',                desc: 'Cruza 10 obstáculos seguidos.',   check: s => s.get().maxCombo >= 10,                             reward: 200 },
    { id: 'a-coins500',  name: 'Ahorrador',                       desc: 'Consigue 500 monedas en total.',  check: s => s.get().coinsEarned >= 500,                         reward: 200 },
    { id: 'a-coins2000', name: 'Banquero',                        desc: 'Consigue 2.000 monedas en total.', check: s => s.get().coinsEarned >= 2000,                        reward: 600 },
    { id: 'a-spend1000', name: 'Gastón',                          desc: 'Gasta 1.000 monedas en la tienda.', check: s => (s.get().stats.spent || 0) >= 1000,                  reward: 250 },
    { id: 'a-spend3000', name: 'Mejor Cliente',                   desc: 'Gasta 3.000 monedas en la tienda.', check: s => (s.get().stats.spent || 0) >= 3000,                  reward: 800 },
    { id: 'a-map5',      name: 'Grandioso Viajero',               desc: 'Desbloquea 5 mapas.',             check: s => s.get().mapsOwned.length >= 6,                      reward: 300 },
    { id: 'a-camp2',     name: 'Contrarreloj Iniciado',           desc: 'Completa el contrarreloj (10 tubos).',   check: s => (s.get().stats.timeCleared || 0) >= 1,     reward: 100 },
    { id: 'a-camp5',     name: 'Maestro del Reloj',               desc: 'Completa 10 contrarrelojes.',            check: s => (s.get().stats.timeCleared || 0) >= 10,    reward: 300 },
    { id: 'a-power10',   name: 'Maestro del Poder',               desc: 'Recoge 10 power-ups.',            check: s => s.get().stats.powersGot >= 10,                      reward: 150 },
    { id: 'a-power25',   name: 'Amo del Poder',                   desc: 'Recoge 25 power-ups.',            check: s => s.get().stats.powersGot >= 25,                      reward: 350 },
    { id: 'a-time3600',  name: 'Increíble Resistencia',           desc: 'Vuela 1 hora en total.',          check: s => s.get().stats.timePlayed >= 3600,                   reward: 300 },
    { id: 'a-mega5',    name: 'Cazador de Tesoros',               desc: 'Recoge 5 monedas de oro 🪙.',     check: s => (s.get().stats.megaGot || 0) >= 5,                  reward: 200 },
    { id: 'a-mega15',   name: 'Rey del Tesoro',                   desc: 'Recoge 15 monedas de oro 🪙.',    check: s => (s.get().stats.megaGot || 0) >= 15,                 reward: 500 },
    { id: 'a-daily3',   name: 'Constancia',                       desc: 'Reclama la recompensa diaria 3 días.', check: s => (s.get().stats.dailyClaimed || 0) >= 3,           reward: 150 },
    { id: 'a-daily10',  name: 'Maestro de Rutina',                desc: 'Reclama la recompensa diaria 10 días.', check: s => (s.get().stats.dailyClaimed || 0) >= 10,         reward: 400 },
    { id: 'a-skin6',    name: 'Galería de Aves',                  desc: 'Compra 6 aves diferentes.',       check: s => s.get().skinsOwned.length >= 7,                     reward: 350 },
    { id: 'a-hat4',     name: 'Sombrerero',                       desc: 'Compra 4 sombreros.',             check: s => s.get().hatsOwned.length >= 4,                      reward: 200 },
    { id: 'a-fx4',      name: 'Estelista',                        desc: 'Compra 4 estelas.',               check: s => s.get().fxOwned.length >= 5,                        reward: 200 },
    { id: 'a-coins5k',  name: 'Multimillonario',                  desc: 'Consigue 5.000 monedas en total.', check: s => s.get().coinsEarned >= 5000,                        reward: 1000 },
    { id: 'a-xc5',      name: 'Codicia',                          desc: 'Recoge 5 poderes de doble monedas.', check: s => (s.get().stats.xcGot || 0) >= 5,                  reward: 150 },
    { id: 'a-xc15',     name: 'Magnate',                          desc: 'Recoge 15 poderes de doble monedas.', check: s => (s.get().stats.xcGot || 0) >= 15,                reward: 400 },
    { id: 'a-enemies25', name: 'Cazador Implacable',              desc: 'Esquiva 25 enemigos en total.',   check: s => (s.get().stats.enemiesGot || 0) >= 25,             reward: 150 },
    { id: 'a-enemies100', name: 'Ángel de la Muerte',             desc: 'Esquiva 100 enemigos en total.',  check: s => (s.get().stats.enemiesGot || 0) >= 100,            reward: 500 },
    { id: 'a-map4',     name: 'Cartógrafo',                       desc: 'Desbloquea 4 mapas nuevos.',      check: s => s.get().mapsOwned.length >= 5,                      reward: 250 },
    { id: 'a-skin8',    name: 'Mega Coleccionista',               desc: 'Compra 10 aves diferentes.',      check: s => s.get().skinsOwned.length >= 10,                    reward: 600 },
    { id: 'a-tool3',    name: 'Preparado',                        desc: 'Usa 3 herramientas de la bolsa.',  check: s => (s.get().stats.toolsUsed || 0) >= 3,                reward: 150 },
    { id: 'a-tool15',   name: 'Ingeniero',                        desc: 'Usa 15 herramientas de la bolsa.', check: s => (s.get().stats.toolsUsed || 0) >= 15,               reward: 500 },
    { id: 'a-toolbuy',  name: 'Ferretería',                       desc: 'Compra 5 herramientas.',           check: s => (s.get().stats.toolsBought || 0) >= 5,              reward: 200 },
    { id: 'a-share',    name: 'Compartir es Vivir',               desc: 'Comparte tu marcador.',            check: s => (s.get().stats.shared || 0) >= 1,                   reward: 100 },
    { id: 'a-gem5',     name: 'Buscafuentes',                     desc: 'Recoge 5 diamantes 💎.',          check: s => (s.get().stats.gemsGot || 0) >= 5,                  reward: 150 },
    { id: 'a-gem20',    name: 'Magnate de Gemas',                 desc: 'Recoge 20 diamantes 💎.',         check: s => (s.get().stats.gemsGot || 0) >= 20,                 reward: 500 },
    { id: 'a-chain15',  name: 'Racimo Dorado',                    desc: 'Recoge 15 monedas de cadenas 🍒.', check: s => (s.get().stats.chainGot || 0) >= 15,               reward: 150 },
    { id: 'a-bat10',    name: 'Esquiva Murciélagos',              desc: 'Esquiva 10 murciélagos 🦇.',      check: s => (s.get().stats.batsGot || 0) >= 10,                reward: 150 },
    { id: 'a-ghost10',  name: 'Cazafantasmas',                    desc: 'Esquiva 10 fantasmas 👻.',        check: s => (s.get().stats.ghostsGot || 0) >= 10,              reward: 150 },
    { id: 'a-chal1',    name: 'Manos a la Obra',                  desc: 'Juega tu primer desafío diario 🌙.', check: s => (s.get().stats.challengePlayed || 0) >= 1,         reward: 100 },
    { id: 'a-chal5',    name: 'Veterano del Desafío',             desc: 'Juega 5 desafíos diarios 🌙.',    check: s => (s.get().stats.challengePlayed || 0) >= 5,         reward: 300 },
    { id: 'a-fx6',      name: 'Arcoíris Completo',                desc: 'Compra 6 estelas.',               check: s => s.get().fxOwned.length >= 7,                        reward: 250 },
    { id: 'a-upg10',    name: 'Mejorador Experto',               desc: 'Mejora herramientas 10 veces.',   check: s => (s.get().stats.upgs || 0) >= 10,                     reward: 300 },
    { id: 'a-manual3',  name: 'Táctico',                         desc: 'Activa 3 herramientas a mano.',  check: s => (s.get().stats.manualUses || 0) >= 3,                reward: 150 },
    { id: 'a-mix5',     name: 'Manitas',                         desc: 'Usa 5 herramientas distintas.',   check: s => (s.get().stats.toolTypes || []).length >= 5,          reward: 250 },
    { id: 'a-mix12',    name: 'Juego de Herramientas',           desc: 'Usa 12 herramientas distintas.',  check: s => (s.get().stats.toolTypes || []).length >= 12,         reward: 500 },
    { id: 'a-miss1',    name: 'Héroe Local',                     desc: 'Completa una misión diaria.',     check: s => (s.get().stats.missionsDone || 0) >= 1,               reward: 100 },
    { id: 'a-miss15',   name: 'Devoto de las Misiones',          desc: 'Completa 15 misiones diarias.',   check: s => (s.get().stats.missionsDone || 0) >= 15,              reward: 400 },
    { id: 'a-pass1',    name: 'Viajero del Pase',               desc: 'Reclama una recompensa del Pase de Vuelo.', check: s => (s.get().passClaimed || []).length >= 1,        reward: 150 },
    { id: 'a-pass9',    name: 'Coleccionista del Pase',         desc: 'Reclama 9 recompensas del Pase de Vuelo.',   check: s => (s.get().passClaimed || []).length >= 9,        reward: 500 },
    { id: 'a-power40',  name: 'Supremacía de Poder',            desc: 'Recoge 40 power-ups.',                       check: s => s.get().stats.powersGot >= 40,                  reward: 500 },
    { id: 'a-shield5',  name: 'Blindaje',                       desc: 'Absorbe 5 choques con el escudo 🛡️.',       check: s => (s.get().stats.shieldAbsorbed || 0) >= 5,       reward: 150 },
    { id: 'a-shield15', name: 'Inquebrantable',                 desc: 'Absorbe 15 choques con el escudo 🛡️.',      check: s => (s.get().stats.shieldAbsorbed || 0) >= 15,      reward: 500 },
    { id: 'a-fenix',    name: 'Reinicio Llameante',            desc: 'Revive 5 veces con el Fénix 🦅.',           check: s => (s.get().stats.fenixUsed || 0) >= 5,         reward: 300 },
    { id: 'a-ghostp10', name: 'Mística',                        desc: 'Atraviesa 10 obstáculos en modo fantasma 👻.', check: s => (s.get().stats.ghostPassed || 0) >= 10,        reward: 200 },
    { id: 'a-arcade',   name: 'Arcade',                         desc: 'Desbloquea el mapa Retro Arcade 🕹️.',       check: s => s.get().mapsOwned.some(m => m.id === 'arcade'),  reward: 150 },
    { id: 'a-season1',  name: 'Temporada 2026',                 desc: 'Reclama 1 recompensa de Temporada.',         check: s => (s.get().seasonClaimed || []).length >= 1,      reward: 100 },
    { id: 'a-season10', name: 'Veterano 2026',                  desc: 'Reclama 10 recompensas de Temporada.',       check: s => (s.get().seasonClaimed || []).length >= 10,     reward: 500 },
    { id: 'a-wknd',     name: 'Semana Pro',                     desc: 'Juega un vuelo un fin de semana (XP ×1,5).',  check: s => (s.get().stats.weekendRuns || 0) >= 1,          reward: 100 },
    /* ---- MEDALLAS OCULTAS (condiciones raras) ---- */
    { id: 'a-clean',    name: 'Aguilucho',                      desc: 'Vuela 500 m sin tocar nada en una partida 🌪️.', check: s => (s.get().stats.maxDistNoHit || 0) >= 500,   reward: 300 },
    { id: 'a-zero',     name: 'El Ahorrativo',                  desc: 'Termina una partida sin recoger ni una moneda 🤲.', check: s => (s.get().stats.zeroCoinRuns || 0) >= 1,      reward: 200 },
    { id: 'a-duel1',    name: 'Pelea de Gallos',                desc: 'Gana tu primer Duelo de Aves 🆚.',           check: s => (s.get().stats.duelWins || 0) >= 1,            reward: 150 },
    { id: 'a-duel10',   name: 'Campeón del Cielo',              desc: 'Gana 10 Duelos de Aves 🆚.',                 check: s => (s.get().stats.duelWins || 0) >= 10,           reward: 500 },
    { id: 'a-wind5',    name: 'Surfista del Viento',            desc: 'Cruza 5 tramos de viento lateral 💨.',       check: s => (s.get().stats.windZones || 0) >= 5,           reward: 200 },
    { id: 'a-giant20',  name: 'Cazagigantes',                   desc: 'Pasa 20 tuberías gigantes 🌋.',              check: s => (s.get().stats.giantPassed || 0) >= 20,        reward: 300 },
    { id: 'a-level9',   name: 'Racha de Niveles',               desc: 'Consigue 9 estrellas en Modo Niveles ⭐.',   check: s => (s.get().stats.levelStars || 0) >= 9,          reward: 250 },
    { id: 'a-level27',  name: 'Coleccionista de Estrellas',     desc: 'Consigue 27 estrellas en Modo Niveles ⭐.',  check: s => (s.get().stats.levelStars || 0) >= 27,         reward: 700 },
    { id: 'a-replay',   name: 'Hacer de Director',              desc: 'Reproduce tu mejor vuelo con el Replay 🎬.', check: s => (s.get().stats.replaysWatched || 0) >= 1,      reward: 150 },
    { id: 'a-seed7',    name: 'Fiel Seguidor',                  desc: 'Juega 7 Semillas diarias 🌱.',               check: s => (s.get().stats.seedDays || 0) >= 7,            reward: 250 },
    { id: 'a-seed30',   name: 'Guardia del Jardín',             desc: 'Juega 30 Semillas diarias 🌱.',              check: s => (s.get().stats.seedDays || 0) >= 30,           reward: 600 }
  ];

  const DIFFS = [
    { id: 'easy',   name: 'Fácil',   gapMul: 1.15, speedMul: 0.85, gravityMul: 0.9,  spawnMul: 1.1,  coinMul: 1 },
    { id: 'normal', name: 'Normal',  gapMul: 1.0,  speedMul: 1.0,  gravityMul: 1.0,  spawnMul: 1.0,  coinMul: 1 },
    { id: 'hard',   name: 'Difícil', gapMul: 0.85, speedMul: 1.2,  gravityMul: 1.12, spawnMul: 0.9,  coinMul: 1.5 },
    { id: 'insane', name: 'Loco',    gapMul: 0.7,  speedMul: 1.35, gravityMul: 1.25, spawnMul: 0.8,  coinMul: 2 }
  ];

  /* Modo Niveles (v2.4): etapas fijas con 3 estrellas por puntuación */
  const STAGES = [
    { id: 'sg1',  name: 'Primer Vuelo',     pipes: 4,  s1: 8,  s2: 14, s3: 20,  gapMul: 1.1,  speedMul: 0.9,  coins: 30 },
    { id: 'sg2',  name: 'Mariposa',         pipes: 6,  s1: 12, s2: 20, s3: 30,  gapMul: 1.08, speedMul: 0.95, coins: 35 },
    { id: 'sg3',  name: 'Gaviota Veloz',    pipes: 8,  s1: 16, s2: 26, s3: 40,  gapMul: 1.05, speedMul: 1.0,  coins: 40 },
    { id: 'sg4',  name: 'Torre del Viento', pipes: 10, s1: 20, s2: 34, s3: 52,  gapMul: 1.0,  speedMul: 1.05, coins: 45 },
    { id: 'sg5',  name: 'Cumbre Nevada',    pipes: 12, s1: 24, s2: 42, s3: 64,  gapMul: 1.0,  speedMul: 1.1,  coins: 50 },
    { id: 'sg6',  name: 'Relámpago',        pipes: 14, s1: 28, s2: 50, s3: 76,  gapMul: 0.97, speedMul: 1.15, coins: 55 },
    { id: 'sg7',  name: 'Mar de Nubes',     pipes: 16, s1: 32, s2: 58, s3: 88,  gapMul: 0.95, speedMul: 1.2,  coins: 60 },
    { id: 'sg8',  name: 'Corredor Cósmico', pipes: 18, s1: 36, s2: 66, s3: 100, gapMul: 0.93, speedMul: 1.25, coins: 70 },
    { id: 'sg9',  name: 'Río de Estrellas', pipes: 20, s1: 40, s2: 74, s3: 112, gapMul: 0.9,  speedMul: 1.3,  coins: 80 },
    { id: 'sg10', name: 'Fauces del Dragón',pipes: 22, s1: 44, s2: 82, s3: 126, gapMul: 0.88, speedMul: 1.35, coins: 90 },
    { id: 'sg11', name: 'Última Frontera',  pipes: 25, s1: 50, s2: 94, s3: 142, gapMul: 0.86, speedMul: 1.4,  coins: 100 },
    { id: 'sg12', name: 'Ascensión Divina', pipes: 28, s1: 56, s2: 106,s3: 160, gapMul: 0.84, speedMul: 1.45, coins: 120 }
  ];

  function getSkin(id) {
    if (id && id.length > 5 && id.slice(-5) === '-gold') {
      const base = SKINS.find(s => s.id === id.slice(0, -5));
      if (base) return makeGold(base);
    }
    return SKINS.find(s => s.id === id) || SKINS[0];
  }
  function getHat(id) { return HATS.find(h => h.id === id) || null; }
  function getFx(id) { return EFFECTS.find(e => e.id === id) || EFFECTS[0]; }
  function getMap(id) { return MAPS.find(m => m.id === id) || MAPS[0]; }
  function getDiff(id) { return DIFFS.find(d => d.id === id) || DIFFS[1]; }
  function getAch(id) { return ACH.find(a => a.id === id) || null; }
  function getTool(id) { return TOOLS.find(t => t.id === id) || null; }
  function getStage(i) { return STAGES[Math.min(Math.max(0, i || 0), STAGES.length - 1)]; }

  /* Misiones diarias/semanales: metric recibe el estado SAVE y devuelve progreso */
  const MISSIONS = [
    { id: 'm-fly',   name: 'Zumo del Aire',        desc: 'Vuela 300 metros',  target: 300, metric: s => s.get().stats.dist,      reward: 60,  weekly: false },
    { id: 'm-coins', name: 'Cazarrecompensas',     desc: 'Recoge 40 monedas', target: 40,  metric: s => s.get().stats.coinsGot,  reward: 50,  weekly: false },
    { id: 'm-pipes', name: 'Slalom entre Tubos',   desc: 'Cruza 35 tubos',    target: 35,  metric: s => s.get().stats.pipes,      reward: 65,  weekly: false },
    { id: 'm-enemy', name: 'Fantasmas en el Radar', desc: 'Esquiva 20 enemigos', target: 20, metric: s => s.get().stats.enemiesGot, reward: 55, weekly: false },
    { id: 'm-w-week', name: 'Semana Épica',        desc: 'Vuela 2.500 metros esta semana', target: 2500, metric: s => s.get().stats.dist, reward: 300, weekly: true },
    { id: 'm-w-2026', name: 'Retro Récord',       desc: 'Cruza 500 tubos esta semana',     target: 500,  metric: s => s.get().stats.pipes, reward: 250, weekly: true }
  ];

  /* Temporada 2026 🗓: recompensas por XP acumulada (misma XP del jugador) */
  const SEASON_TIERS = [
    { xp: 0,    reward: { coins: 50 } },
    { xp: 250,  reward: { item: 'magnet', n: 1 } },
    { xp: 500,  reward: { coins: 80 } },
    { xp: 750,  reward: { item: 'luck', n: 1 } },
    { xp: 1000, reward: { item: 'shield', n: 1 } },
    { xp: 1200, reward: { coins: 120 } },
    { xp: 1500, reward: { item: 'ghost', n: 1 } },
    { xp: 1800, reward: { item: 'treasure', n: 1 } },
    { xp: 2200, reward: { coins: 180 } },
    { xp: 2700, reward: { item: 'boost', n: 1 } },
    { xp: 3200, reward: { item: 'turbo', n: 1 } },
    { xp: 4000, reward: { coins: 300 } },
    { xp: 5000, reward: { item: 'combo', n: 2 } },
    { xp: 6500, reward: { coins: 500 } }
  ];

  /* Contenido semanal: cada semana se habilitan 2 ítems nuevos en su sección.
   El reloj arranca el lunes 21 sep 2026 (v2.0) y avanza 1 semana cada 7 días. */
  const CONTENT_EPOCH = new Date(2026, 8, 21);
  function curWeek(d) {
    const now = d || new Date();
    const ms = now.getTime() - CONTENT_EPOCH.getTime();
    if (ms < 0) return 1;
    return Math.floor(ms / (7 * 864e5)) + 1;
  }
  function isUnlocked(o, d) { return !o.week || o.week <= curWeek(d); }
  function weekLabel(o) { return o.week ? 'Semana ' + o.week : null; }

  /* Temporadas del año (el Pase rota automáticamente según la fecha real) */
  const SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn'];
  const SEASONS = [
    { id: 'winter', name: 'Invierno',  icon: '❄️', accent: '#7bd8f6', months: 'dic – feb', pass: { icon: '🎿', name: 'Pase Cuaternario' } },
    { id: 'spring', name: 'Primavera', icon: '🌸', accent: '#ff9ce6', months: 'mar – may', pass: { icon: '🌷', name: 'Pase Florecer' } },
    { id: 'summer', name: 'Verano',    icon: '☀️', accent: '#ffd54f', months: 'jun – ago', pass: { icon: '🏖️', name: 'Pase Solsticio' } },
    { id: 'autumn', name: 'Otoño',     icon: '🍂', accent: '#ffab40', months: 'sep – nov', pass: { icon: '🎃', name: 'Pase Cosecha' } }
  ];

  function seasonIndex(d) {
    const m = (d || new Date()).getMonth();
    if (m >= 11 || m <= 1) return 0; /* dic – feb */
    if (m <= 4) return 1;            /* mar – may */
    if (m <= 7) return 2;            /* jun – ago */
    return 3;                        /* sep – nov */
  }
  function seasonKey(d) {
    const now = d || new Date();
    return now.getFullYear() + '-' + SEASON_ORDER[seasonIndex(now)];
  }
  function seasonInfo(d) { return SEASONS[seasonIndex(d)]; }

  /* Pase rotativo: mismos niveles de XP, pero las recompensas dependen de la temporada */
  const PASS_XP   = [0, 150, 350, 600, 900, 1250, 1650, 2100, 2600, 3150, 3750, 4400, 5200, 6100];
  const PASS_COINS = [60, 80, 120, 150, 200, 260, 500, 800, 1200]; // 9 recompensas de monedas (la tier 6100 XP es la última)
  /* Pool de herramientas que puede regalar el Pase (incluye las nuevas de las semanas) */
  const PASS_ITEMS = ['magnet', 'luck', 'slow', 'boost', 'treasure', 'turbo', 'combo', 'shield', 'ghost', 'frenzy', 'eco', 'hype', 'bomb', 'aura', 'twin', 'oasis', 'titan', 'fenix', 'bateria', 'cris'];
  /* Recompensa cosmética especial de cada temporada (sombrero / estela) */
  const SEASON_BONUS = [
    { hat: 'hat-duende',    fx: 'fx-nevada' },   // invierno
    { hat: 'hat-girasol',   fx: 'fx-limo' },     // primavera
    { hat: 'hat-estrellita', fx: 'fx-galactico' }, // verano
    { hat: 'hat-banda2',    fx: 'fx-coral' }     // otoño
  ];
  function passTiers(d) {
    const si = seasonIndex(d);
    const tiers = [];
    let coinI = 0, itemI = 0;
    PASS_XP.forEach((xp, idx) => {
      if (idx === 2 || idx === 4 || idx === 6 || idx === 8 || idx === 10) {
        // stride 4 para repartir las 20 herramientas entre las 4 temporadas (5 por temporada)
        const it = PASS_ITEMS[(itemI * 4 + si) % PASS_ITEMS.length];
        tiers.push({ xp, reward: { item: it, n: idx >= 8 ? 2 : 1 } });
        itemI++;
      } else {
        tiers.push({ xp, reward: { coins: PASS_COINS[coinI++] } });
      }
    });
    /* la tier de 150 XP regala el cosmético de la temporada */
    tiers[1] = { xp: 150, reward: si % 2 === 0 ? { hat: SEASON_BONUS[si].hat } : { fx: SEASON_BONUS[si].fx } };
    return tiers;
  }

  /* Pase de Vuelo base (referencia: primavera), se usa passTiers() en runtime */
  const PASS_TIERS = passTiers(new Date(2026, 2, 15));

  return {
    SKINS, HATS, EFFECTS, MAPS, ACH, DIFFS, TOOLS, MISSIONS, STAGES, PASS_TIERS, SEASON_TIERS,
    SEASONS, SEASON_ORDER, seasonIndex, seasonKey, seasonInfo, passTiers,
    CONTENT_EPOCH, curWeek, isUnlocked, weekLabel,
    getSkin, getHat, getFx, getMap, getDiff, getAch, getTool, getStage,
    skinStats, boxDef, evolveStage
  };
})();