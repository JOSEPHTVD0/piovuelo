/* Núcleo del juego: bucle, física, obstáculos, monedas, enemigos y dificultad progresiva */
window.G = (function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let groundH = 0;

  let state = 'load';           // load | menu | play | over
  let paused = false;
  let t = 0;
  let lastTime = 0;
  let rafId = 0;
  let halted = false;       // suspendido (pantalla apagada / app en segundo plano)
  let autoPaused = false;   // el juego se pausó SOLO al apagar la pantalla
  let loopActive = false;

  let bird = null;
  let pipes = [];
  let coins = [];
  let enemies = [];
  let score = 0;
  let pipesDone = 0;
  let coinCount = 0;
  let runSeconds = 0;
  let spawnDist = 0;
  let spawnEDist = 0;
  let spawnPwDist = 0;
  let spawnMegaDist = 0;
  let spawnChDist = 0;
  let nextMile = 1; // próximo hito de distancia (cada 100 m)
  let oasisLast = 0;   // metros contados por la herramienta Oasis (cada 10 m)
  let totalDist = 0;
  let powers = [];
  let eff = { magnet: 0, slow: 0, x2: 0, xc: 0, shield: 0, ghost: 0, frenzy: 0, bomb: 0, aura: 0, twin: 0 }; // hasta qué instante (t) dura cada efecto
  let invulnT = 0;      // fin de invulnerabilidad breve tras romper el escudo
  let clockFreeze = -1;    // dificultad congelada por el Reloj Estelar (puntuación congelada)
  let rt = { slow: false, magnet: false, coins: false, boost: false, luck: false, hype: false, oasis: false, doble: false }; // herramientas de la bolsa activas esta partida
  let worldSpeed = 0;
  let challengeMap = null;   // escenario fijo del desafío diario
  let lastCy = null;         // último hueco generado (para acotar el salto entre tuberías)
  let lastPipeX = -1;        // posición x del último tubo generado
  let combo = 0;
  let readyTap = false;
  let airborne = false;

  let diff = null;
  let lvl = 1;
  let mode = 'free';       // free | time | challenge | duel | levels | replay
  let clearedFlag = false; // evita disparar la superación del contrarreloj 2 veces

  // RNG determinado por semilla (partida idéntica para todos: Semilla diaria + Replay fiel)
  let rng = Math.random;
  let curSeed = 0;
  let replayTaps = [];       // tiempos (ms) de cada aleteo de la partida actual (modo free)
  let replayMode = false;    // reproduciendo un Replay
  let replayIdx = 0;
  let replayRec = null;      // MediaRecorder del export de video
  let hitHappened = false;   // ¿hubo contacto en esta partida? (logro "sin tocar")
  let rival = null;          // IA del Duelo de Aves
  let wind = { on: false, t0: 0, dur: 0, dir: 0 };
  let windZoneLast = 0;
  let giantsMade = 0;        // tuberías generadas (cada 6 -> gigante)
  let nextWindPts = 150;

  const PHYS = { gravity: 1500, flapVel: -460, maxFall: 820 };
  const SKIN_DEF_STATS = { spd: 1, flap: 1, grav: 1, gap: 1 };
  let skinStats = SKIN_DEF_STATS; // multiplicadores de vuelo del ave equipada (data.js SKIN_STATS)
  const ip = { width: 78 };
  const LEVEL_STEP = 8;
  const TIME_PIPES = 10;         // Tubos que hay que pasar en el modo Contrarreloj
  const DUEL_PIPES = 12;         // Tubos que hay que pasar en el Duelo de Aves
  const TUBO_MAX_LEVEL = 50; // Las tuberías fijan su dificultad al alcanzar el nivel 50

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashSeed(str) {
    let h = 1779033703;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return h >>> 0;
  }
  function dayKey() {
    const n = new Date();
    const p = v => (v < 10 ? '0' : '') + v;
    return n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate());
  }
  function daySeed() { return hashSeed(dayKey()); }
  const POWERS = [
    { type: 'x2',    color: '#ffe066', icon: '✨' },
    { type: 'xc',    color: '#b2ff59', icon: '💰' },
    { type: 'magnet', color: '#ff7043', icon: '🧲' },
    { type: 'slow',   color: '#ffd54f', icon: '⏳' },
    { type: 'gem',    color: '#e1bee7', icon: '💎' },
    { type: 'shield', color: '#29b6f6', icon: '🛡️' },
    { type: 'ghost',  color: '#b388ff', icon: '👻' }
  ];

  // Puntuación "equivalente" que marca la dificultad (congelada por el Reloj Estelar).
  function effScore() {
    if (eff.clock > t && clockFreeze >= 0) return clockFreeze;
    return score;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundH = Math.max(64, H * 0.11);
    ip.width = clamp(Math.round(W * 0.085), 62, 84);
    BG.resize(W, H);
  }

function difficultyFor(sc, diffc) {
    const d = diffc || diff || DAT.getDiff(SAVE.get().set.diff);
    // Suavizado: crece más lento, tope más bajo
    // Las tuberías alcanzan su nivel de dificultad máximo en el nivel 50 y ahí se quedan
    const scTubo = Math.min(sc, (TUBO_MAX_LEVEL - 1) * LEVEL_STEP);
    const speed = (150 + scTubo * 6.2) * d.speedMul;
    const gapMin = Math.max(108 * d.gapMul, 118 - scTubo * 0.75);
    const gapVar = H * 0.45 * d.gapMul - scTubo * 2.2;
    const gap = Math.max(gapMin, gapVar);
    return {
      speed: Math.min(speed, 370 * d.speedMul),
      gap: gap,
      spawnEvery: Math.max(180, ip.width * 4.1) * d.spawnMul - Math.min(scTubo * 1.0, 100),
      enemyEvery: Math.max(1050, 1900 - sc * 32) * d.spawnMul,
      powerEvery: Math.max(1400, 3000 - sc * 15),
      megaEvery: Math.max(300, 430 - sc * 3),
      chainEvery: Math.max(900, 2200 - sc * 9),
      level: Math.min(Math.floor(sc / LEVEL_STEP) + 1, TUBO_MAX_LEVEL)
    };
  }

  // Dificultad vigente; el Modo Niveles aplica sus multiplicadores de etapa
  function curD(sc) {
    const d0 = difficultyFor(sc);
    if (mode !== 'levels') return d0;
    const stg = DAT.getStage(SAVE.get().levels.cur);
    return {
      speed: d0.speed * stg.speedMul,
      gap: Math.max(100, d0.gap * stg.gapMul),
      spawnEvery: d0.spawnEvery,
      enemyEvery: d0.enemyEvery,
      powerEvery: d0.powerEvery,
      megaEvery: d0.megaEvery,
      chainEvery: d0.chainEvery,
      level: d0.level
    };
  }

  function newRun() {
    if (!SAVE.get()) SAVE.load();
    bird = {
      x: W * 0.28, y: H * 0.42,
      vy: 0, y0: H * 0.42,
      r: clamp(Math.min(W, H) * 0.05, 18, 25),
      rot: 0, squish: 1, wingPhase: 0, dead: false
    };
    pipes = []; coins = []; enemies = []; powers = [];
    score = 0; pipesDone = 0; coinCount = 0;
    runSeconds = 0; spawnDist = 0; spawnEDist = 0; spawnPwDist = 0;
    spawnMegaDist = 0; spawnChDist = 0; nextMile = 1;
    totalDist = 0; combo = 0; lvl = 1; oasisLast = 0;
    eff.magnet = 0; eff.slow = 0; eff.x2 = 0; eff.xc = 0; eff.gem = 0; eff.clock = 0; eff.turbo = 0; eff.combo = 0;
    eff.shield = 0; eff.ghost = 0; eff.frenzy = 0; eff.bomb = 0; eff.aura = 0; eff.twin = 0; invulnT = 0;
    clockFreeze = -1;
    rt.slow = false; rt.magnet = false; rt.coins = false; rt.boost = false; rt.luck = false; rt.score = false; rt.sprint = false; rt.hype = false; rt.oasis = false; rt.doble = false; rt.titan = false; rt.fenix = false;
    oasisLast = 0;
    clearedFlag = false;
    readyTap = true; airborne = false;
    replayTaps = []; replayIdx = 0; hitHappened = false;
    lastCy = null; lastPipeX = -1;
    wind.on = false; windZoneLast = 0; giantsMade = 0; nextWindPts = 150;
    if (mode === 'challenge') { curSeed = daySeed(); rng = mulberry32(curSeed); }
    else if (mode === 'replay') {
      const rp = SAVE.getReplay();
      replayMode = !!rp;
      if (rp) { curSeed = rp.seed || 0; rng = mulberry32(curSeed); replayTaps = Array.isArray(rp.taps) ? rp.taps : []; replayIdx = 0; }
      else { curSeed = 0; rng = Math.random; }
    } else {
      curSeed = ((Date.now() ^ SAVE.get().stats.flights) % 0x7fffffff) ^ 0x9e3779b9;
      rng = mulberry32(curSeed);
    }
    const rp = SAVE.getReplay();
    rival = mode === 'duel'
      ? { prog: 0, strength: clamp(0.6 + SAVE.get().level * 0.02, 0.55, 1.3) }
      : null;
    diff = DAT.getDiff(mode === 'challenge' ? 'normal' : SAVE.get().set.diff);
    ENTS.setHC(!!SAVE.get().set.hc);
    skinStats = DAT.skinStats(SAVE.get().skin);
    worldSpeed = 0;
    FX.clear(); FX.shake(0);
    BG.init(mode === 'challenge' ? challengeMap : (mode === 'replay' && replayMode && rp ? rp.map : SAVE.get().map)); BG.reset();
    preSpawnPipes();
  }

  // Obstáculos ya visibles en pantalla durante la fase "listo"
  function preSpawnPipes() {
    const D = curD(0);
    mkPipe(W * 0.82, D);
    mkPipe(W * 0.82 + D.spawnEvery + ip.width, D);
  }

  function mkPipe(x, D) {
    const margin = 80;
    const big = giantsMade > 0 && giantsMade % 6 === 0; // tubería gigante cada 6
    const w = big ? ip.width * 1.7 : ip.width;
    // El hueco mínimo siempre deja espacio real para el pajarito
    const minGap = bird.r * 2 + 36;
    const gap = Math.max(minGap, D.gap * (big ? 0.8 : 1) * skinStats.gap);
    const gapHalf = gap / 2;
    const minCy = margin + gapHalf;
    const maxCy = H - groundH - gapHalf - margin;
    // Salto vertical acotado por la distancia horizontal real hasta el tubo anterior:
    // nunca más de ~55% de esa distancia para que siempre haya sitio para cruzar
    const dxPrev = (lastPipeX >= 0) ? x - lastPipeX : D.spawnEvery;
    const maxStep = clamp(dxPrev * 0.55, 56, H * 0.30);
    const low = (lastCy === null) ? minCy : Math.max(minCy, lastCy - maxStep);
    const high = (lastCy === null) ? maxCy : Math.min(maxCy, lastCy + maxStep);
    const cy = (low < high) ? low + rng() * (high - low) : clamp(H / 2, Math.min(minCy, maxCy), Math.max(minCy, maxCy));
    const mv = !big && rng() < 0.2 ? { ph: rng() * Math.PI * 2, amp: Math.min(gap * 0.42, 64), spd: 0.9 + rng() * 1.2, base: cy } : null;
    pipes.push({ x: x, w: w, gap: cy, gapHalf, passed: false, big, mv });
    giantsMade++;
    lastCy = cy;
    lastPipeX = x;
    // Tubería doble: dos huecos APARTE (sin solapar cuerpos) y con hueco amplio
    if (!big && rng() < 0.14 && minCy < maxCy) {
      const sep = Math.max(90, ip.width * 1.05);
      const offMax = clamp(sep * 0.6, 40, 95);
      const off = (rng() < 0.5 ? 1 : -1) * (18 + rng() * (offMax - 18));
      const cy2 = clamp(cy + off, margin + gapHalf, H - groundH - gapHalf - margin);
      pipes.push({ x: x + w + sep, w: ip.width, gap: cy2, gapHalf, passed: false, big: false, mv: null });
      lastCy = cy2; // el siguiente hueco parte del segundo
      lastPipeX = x + w + sep;
    }
    // Las monedas son escasas: solo ~1 de cada 3 tubos trae un par
    if (rng() < 0.35) {
      for (let i = 0; i < 2; i++) {
        coins.push({ x: x + w + 46 + i * 27, y: cy + (i % 2 === 0 ? -20 : 20), r: 10, ph: i * 1.7 });
      }
    }
  }

  function spawnPipe(D) {
    // Garantiza separación horizontal mínima: el siguiente tubo nunca toca al anterior
    const mouth = W + 30;
    const last = pipes[pipes.length - 1];
    const minX = last ? last.x + last.w + 64 : 0;
    mkPipe(Math.max(mouth, minX), D);
  }

  // Elige una Y dentro del hueco de la tubería que está cruzando el pájaro,
  // para que enemigos, cadenas y power-ups no aparezcan atravesando las paredes.
  function spawnCorridorY(r) {
    const topY = H * 0.16, botY = H - groundH - r - 20;
    const near = pipes.find(p => p.x > bird.x - 40 && p.x < W + 130);
    if (near) {
      const lo = Math.max(topY, near.gap - near.gapHalf + 8);
      const hi = Math.min(botY, near.gap + near.gapHalf - 8);
      if (hi - lo > r + 4) return lo + rng() * (hi - lo);
    }
    return topY + rng() * Math.max(10, botY - topY);
  }

  // Enemigos: más fuertes y más frecuentes cuanto más lejos vueles (nivel actual).
  // Pueden ser diablillos (imp), murciélagos 🦇 (más rápidos) o fantasmas 👻 (te persiguen en vertical).
  function spawnEnemy() {
    const lv = lvl;
    const tier = lv <= 4 ? 1 : lv <= 9 ? 2 : 3;
    const roll = rng();
    const type = roll < 0.35 ? 'ghost' : roll < 0.7 ? 'bat' : 'imp';
    const r = type === 'bat' ? 15 : type === 'ghost' ? 17 : (tier === 3 ? 18 : tier === 2 ? 16 : 14);
    const baseY = spawnCorridorY(r);
    const sp = (40 + score * 1.5) * (0.65 + tier * 0.3);
    enemies.push({
      x: W + 60, baseY: baseY, y: baseY, r: r, tier: tier, type: type,
      speed: Math.min(sp * (type === 'bat' ? 1.55 : type === 'ghost' ? 0.8 : 1), 115 + tier * 22),
      wf: tier === 3 ? 2.4 : tier === 2 ? 1.9 : 1.5,
      ph: rng() * Math.PI * 2,
      amp: Math.min(42 + lv * 3.5, 120),
      passed: false
    });
  }

  // Cadena de monedas 🍒: un arco de 5 monedas
  function spawnChain() {
    const mid = spawnCorridorY(12);
    const dir = rng() < 0.5 ? 1 : -1;
    const span = 90;
    for (let i = 0; i < 5; i++) {
      coins.push({
        x: W + 40 + i * 26,
        y: mid + dir * Math.sin((i / 4) * Math.PI) * span * 0.5,
        r: 10, ph: i * 1.1, chain: true
      });
    }
  }

  // Power-ups: doble puntos, imán, cámara lenta
  function spawnPower() {
    const pf = POWERS[Math.floor(rng() * POWERS.length)];
    const r = 16;
    const y = spawnCorridorY(r);
    powers.push({ x: W + 40, y: y, r: r, ph: rng() * Math.PI * 2, type: pf.type, color: pf.color, icon: pf.icon });
  }

  // Moneda de oro rara: vale 10
  function spawnMega() {
    const r = 15;
    const y = spawnCorridorY(r);
    coins.push({ x: W + 40, y: y, r: r, ph: rng() * Math.PI * 2, big: true });
  }

  function activatePower(type) {
    if (eff.frenzy > t || rt.hype) {
      score += eff.frenzy > t ? 1 : 2; // Frenesí 🎇 (+1) o Hype 🔥 (+2) por power-up
      FX.text(bird.x, bird.y - bird.r - 44, eff.frenzy > t ? '🎇 +1' : '🔥 +2', 12, '#ff8a65');
      updateHUD();
    }
    const labels = { x2: '✨ ¡Doble puntos!', xc: '💰 ¡Monedas al doble!', magnet: '🧲 ¡Imán!', slow: '⏳ ¡Cámara lenta!', gem: '💎 +3 🪙 ¡Diamante!', shield: '🛡️ ¡Escudo!', ghost: '👻 ¡Modo fantasma!' };
    const colors = { x2: '#ffe066', xc: '#b2ff59', magnet: '#ff7043', slow: '#ffd54f', gem: '#e1bee7', shield: '#29b6f6', ghost: '#b388ff' };
    const dur = type === 'xc' ? 10 : type === 'magnet' ? 7 : type === 'slow' ? 5 : 8;
    if (type === 'shield') eff.shield = 1e9;          // dura hasta consumirse
    else if (type === 'ghost') eff.ghost = t + 3;
    else eff[type] = t + dur;
    if (SAVE.get().stats) {
      SAVE.get().stats.powersGot = (SAVE.get().stats.powersGot || 0) + 1;
      if (type === 'xc') SAVE.get().stats.xcGot = (SAVE.get().stats.xcGot || 0) + 1;
      if (type === 'shield') SAVE.get().stats.shieldGot = (SAVE.get().stats.shieldGot || 0) + 1;
      if (type === 'ghost') SAVE.get().stats.ghostGot = (SAVE.get().stats.ghostGot || 0) + 1;
      if (type === 'gem') {
        SAVE.get().stats.gemsGot = (SAVE.get().stats.gemsGot || 0) + 1;
        SAVE.addCoins(3);
        score += 1;
        updateHUD();
      }
      SAVE.save();
    }
    SND.sfx.power();
    FX.burst(bird.x, bird.y, colors[type], 16, 220);
    FX.text(bird.x, bird.y - bird.r - 24, labels[type], 15, colors[type]);
  }

  function drawAura(ctx, x, y, r, col) {
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.3 * Math.sin(t * 8);
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function loop(ms) {
    loopActive = true;
    if (halted || document.hidden) { halted = true; loopActive = false; lastTime = ms; return; } // no sigue tras apagar pantalla
    const dt = Math.max(0, Math.min((ms - lastTime) / 1000, 0.033));
    lastTime = ms;
    if (paused || state === 'load') { rafId = requestAnimationFrame(loop); return; }
    t += dt; // el reloj global no avanza mientras se esté en pausa

    if (state === 'menu' || state === 'cleared' || state === 'over') {
      BG.update(dt, 70);
      if (bird) {
        bird.wingPhase = (bird.wingPhase + dt * 1.4) % 1;
        if (state === 'menu' || state === 'cleared') { bird.y = bird.y0 + Math.sin(t * 2.2) * 9; }
        else { bird.y += bird.vy * dt; bird.vy += PHYS.gravity * dt; bird.rot = Math.min(1.4, bird.rot + dt * 5); }
        if (state !== 'cleared') {
          pipes.forEach(p => { p.x -= 60 * dt; });
          pipes = pipes.filter(p => p.x > -ip.width - 30);
          enemies.forEach(e => e.x -= 60 * dt);
          enemies = enemies.filter(e => e.x > -120);
        }
      }
      FX.update(dt);
      render();
      rafId = requestAnimationFrame(loop);
      return;
    }

    // PLAY
    if (readyTap) {
      if (replayMode) {
        // En el Replay la fase de "listo" se salta: los aleteos grabados (incluido el primero) se reproducen al instante
        readyTap = false; airborne = true;
        UI.showStartHint(false);
      } else {
        // Antes del primer toque el mundo está congelado (solo aleteo + obstáculos visibles parados)
        BG.update(dt, 18);
        bird.wingPhase += dt * 6;
        bird.y = bird.y0 + Math.sin(t * 2.4) * 6;
      }
    } else {
      runSeconds += dt;
      const D = curD(effScore());
      lvl = D.level;
      worldSpeed += (D.speed * skinStats.spd - worldSpeed) * Math.min(1, dt * 1.6);
      const spd = worldSpeed * (eff.slow > t ? 0.5 : 1) * (rt.slow ? 0.75 : 1) * (eff.turbo > t ? 1.85 : 1);
      totalDist += spd * dt;
      // Replay: los aleteos grabados se reproducen en su momento exacto
      if (replayMode) {
        while (replayIdx < replayTaps.length && runSeconds >= replayTaps[replayIdx] / 1000) {
          replayIdx++;
          flapNow();
        }
      }
      // Tramo de viento lateral cada 420 m
      // (totalDist está en píxeles y 30 px = 1 m; antes se medía en píxeles y disparaba 30 veces de más)
      const wz = Math.floor(totalDist / (30 * 420));
      if (wz > windZoneLast) {
        windZoneLast = wz;
        SAVE.get().stats.windZones = (SAVE.get().stats.windZones || 0) + 1;
        SAVE.save();
        wind.on = true; wind.t0 = t; wind.dur = 4.5; wind.dir = rng() < 0.5 ? -1 : 1;
        FX.text(bird.x, bird.y - bird.r - 70, '💨 ¡Viento lateral!', 15, '#81d4fa');
        UI.toast('💨 ¡Tramo de viento lateral!', 'warning');
      }
      if (wind.on && t > wind.t0 + wind.dur) wind.on = false;
      if (wind.on && !bird.dead) {
        bird.x += wind.dir * spd * 0.32 * dt;
        bird.x = clamp(bird.x, bird.r + 6, W * 0.74);
      }
      const dm = Math.floor(totalDist / 30);
      if (rt.oasis) {
        const om = Math.floor(dm / 10);
        if (om > oasisLast) { score += om - oasisLast; oasisLast = om; updateHUD(); }
      }
      if (dm >= nextMile * 100) {
        nextMile++;
        SAVE.addCoins(5);
        SND.sfx.level();
        FX.burst(bird.x, bird.y, '#69f0ae', 18, 240);
        FX.text(bird.x, bird.y - bird.r - 30, '+' + (nextMile - 1) * 100 + ' m · +5 🪙', 15, '#69f0ae');
        UI.toast('🎉 ¡' + (nextMile - 1) * 100 + ' m! +5 🪙', 'good');
        updateHUD();
      }
      BG.update(dt, spd);

      // física del pajarito
      bird.vy = Math.min(bird.vy + PHYS.gravity * skinStats.grav * diff.gravityMul * (SAVE.get().set.moon ? 0.72 : 1) * (rt.sprint ? 0.85 : 1) * dt, PHYS.maxFall);
      bird.y += bird.vy * dt;
      bird.squish = 1;
      bird.rot = Math.max(-0.5, Math.min(1.1, bird.vy / 900));
      bird.wingPhase = (bird.wingPhase + dt * (8 + bird.vy / -320)) % 1;

      // generar obstáculos, enemigos y power-ups
      spawnDist += spd * dt;
      if (spawnDist >= D.spawnEvery) { spawnDist = 0; spawnPipe(D); }
      spawnEDist += spd * dt;
      if (spawnEDist >= D.enemyEvery) { spawnEDist = 0; spawnEnemy(); }
      spawnPwDist += spd * dt;
      if (spawnPwDist >= D.powerEvery) { spawnPwDist = 0; spawnPower(); }
      spawnMegaDist += spd * dt;
      if (spawnMegaDist >= D.megaEvery) { spawnMegaDist = 0; spawnMega(); }
      spawnChDist += spd * dt;
      if (spawnChDist >= D.chainEvery) { spawnChDist = 0; spawnChain(); }

      // mover tubos
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= spd * dt;
        // tubo móvil: el hueco sube y baja
        if (p.mv) {
          p.gap = clamp(p.mv.base + Math.sin(t * p.mv.spd + p.mv.ph) * p.mv.amp, 80 + p.gapHalf, H - groundH - p.gapHalf - 4);
        }
        if (!p.passed && p.x + p.w < bird.x - bird.r) {
          p.passed = true; pipesDone++; score += (eff.x2 > t ? 2 : 1) + (rt.score ? 1 : 0) + (eff.combo > t ? 2 : 0) + (eff.aura > t ? 1 : 0) + (rt.doble ? 1 : 0) + (rt.titan ? 2 : 0); combo++;
          if (mode === 'time' && !clearedFlag && !bird.dead && pipesDone >= TIME_PIPES) {
            clearedFlag = true;
            clearTimeRun();
          }
          if (mode === 'duel' && !clearedFlag && !bird.dead && pipesDone >= DUEL_PIPES) {
            clearedFlag = true;
            duelClear(true);
            break; // no cortar el bucle principal: sigue el requestAnimationFrame para la celebración
          }
          if (mode === 'levels' && !clearedFlag && !bird.dead) {
            const stg = DAT.getStage(SAVE.get().levels.cur);
            if (pipesDone >= stg.pipes) {
              clearedFlag = true;
              levelClear();
              break;
            }
          }
          if (mode === 'duel' && rival) {
            if (rng() < rival.strength) rival.prog++;
            else if (rng() < 0.35) rival.prog++;
          }
          if (p.big) {
            SAVE.get().stats.giantPassed = (SAVE.get().stats.giantPassed || 0) + 1;
            SAVE.save();
          }
          if (eff.ghost > t) {
            SAVE.get().stats.ghostPassed = (SAVE.get().stats.ghostPassed || 0) + 1;
            SAVE.save();
          }
          if (combo > 3) SAVE.setCombo(combo);
          SND.sfx.score();
          const lvlAfter = difficultyFor(score).level;
          if (lvlAfter > lvl) onLevelUp(lvlAfter);
          updateHUD();
        }
        if (p.x < -p.w - 40) pipes.splice(i, 1);
      }

      // mover monedas
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        if (eff.magnet > t || rt.magnet) {
          c.x += (bird.x - c.x) * Math.min(1, dt * (7 + toolLv('magnet') * 0.4));
          c.y += (bird.y - c.y) * Math.min(1, dt * (5 + toolLv('magnet') * 0.3));
        }
        c.x -= spd * dt;
        if (c.x < -30) { coins.splice(i, 1); continue; }
        const dx = c.x - bird.x, dy = c.y - bird.y;
        const rr = c.r + bird.r * 0.8;
        if (dx * dx + dy * dy < rr * rr) {
          coins.splice(i, 1);
          coinCount++;
          if (c.big) {
            SAVE.get().stats.megaGot = (SAVE.get().stats.megaGot || 0) + 1;
            SAVE.save();
          } else if (c.chain) {
            SAVE.get().stats.chainGot = (SAVE.get().stats.chainGot || 0) + 1;
            SAVE.save();
          }
          let val = c.big ? 10 : Math.max(1, Math.round((1 + Math.floor(lvl / 5)) * (diff && diff.coinMul ? diff.coinMul : 1))) + (rt.luck ? (1 + toolLv('luck')) : 0);
          if (!c.big && (eff.xc > t || rt.coins)) val = val * 2 + toolLv('coins');
          SAVE.addCoins(val);
          if (eff.bomb > t) { score += 1; FX.text(c.x, c.y - 34, '🧨 +1', 11, '#ffab91'); }
          if (c.big) {
            SND.sfx.power();
            FX.burst(c.x, c.y, '#ffca28', 18, 260);
            FX.text(c.x, c.y - 18, '+10 🪙', 18, '#ffca28');
          } else {
            SND.sfx.coin();
            FX.burst(c.x, c.y, '#ffd54f', 12, 170);
            FX.text(c.x, c.y - 16, '+' + val, 16, '#ffe066');
          }
          updateHUD();
        }
      }

      // mover enemigos
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x -= (spd + e.speed) * dt;
        if (e.type === 'ghost') {
          // el fantasma se acerca en vertical solo si está cerca del pájaro; lejos se mantea (evitable)
          const dy = bird.y - e.y;
          if (Math.abs(dy) > 20 && Math.abs(dy) < 150) e.y += clamp(dy, -170 * dt, 170 * dt);
          else e.y = e.baseY + Math.sin(t * e.wf + e.ph) * e.amp * 0.4;
        } else {
          e.y = e.baseY + Math.sin(t * e.wf + e.ph) * (e.type === 'bat' ? e.amp * 1.25 : e.amp);
        }
        if (!e.passed && e.x + e.r < bird.x - bird.r) {
          e.passed = true;
          score += eff.x2 > t ? 4 : 2; combo++;
          SAVE.get().stats.enemiesGot = (SAVE.get().stats.enemiesGot || 0) + 1;
          if (e.type === 'bat') SAVE.get().stats.batsGot = (SAVE.get().stats.batsGot || 0) + 1;
          if (e.type === 'ghost') SAVE.get().stats.ghostsGot = (SAVE.get().stats.ghostsGot || 0) + 1;
          SAVE.save();
          const lvlAfter = difficultyFor(score).level;
          if (lvlAfter > lvl) onLevelUp(lvlAfter);
          SND.sfx.enemy();
          FX.text(e.x, e.y - 18, '+2', 15, '#ff9ce6');
          FX.burst(e.x, e.y, '#b39ddb', 8, 140);
          updateHUD();
        }
        if (e.x < -120) enemies.splice(i, 1);
      }

      // mover y recoger power-ups
      for (let i = powers.length - 1; i >= 0; i--) {
        const pw = powers[i];
        pw.x -= spd * dt;
        if (pw.x < -40) { powers.splice(i, 1); continue; }
        const dx = pw.x - bird.x, dy = pw.y - bird.y;
        const rr = pw.r + bird.r * 0.9;
        if (dx * dx + dy * dy < rr * rr) {
          powers.splice(i, 1);
          activatePower(pw.type);
          updateHUD();
        }
      }

      // colisiones: CUALQUIER choque con tubo, enemigo o suelo acaba la partida
      if (state === 'play' && !bird.dead) {
        const ghostOn = eff.ghost > t;
        if (bird.y + bird.r >= H - groundH) {
          if (invulnT > t) { bird.y = H - groundH - bird.r - 1; bird.vy = Math.max(bird.vy, -1); }
          else { bird.y = H - groundH - bird.r; hitObstacle(); } // el escudo también protege del suelo
        }
        if (bird.y - bird.r < 2) { bird.y = 2 + bird.r; bird.vy = Math.max(bird.vy, 0); }
        if (!ghostOn) { // el fantasma atraviesa tubos y enemigos sin morir
          for (let i = 0; i < pipes.length && !bird.dead; i++) {
            const p = pipes[i];
            if (circleRect(bird.x, bird.y, bird.r * 0.85, p.x, 0, p.w, p.gap - p.gapHalf)) {
              hitObstacle(); break;
            } else if (circleRect(bird.x, bird.y, bird.r * 0.85, p.x, p.gap + p.gapHalf, p.w, H - groundH - p.gap - p.gapHalf)) {
              hitObstacle(); break;
            }
          }
          for (let i = 0; i < enemies.length && !bird.dead; i++) {
            const e = enemies[i];
            const dx = e.x - bird.x, dy = e.y - bird.y;
            const rr = e.r + bird.r * 0.76;
            if (dx * dx + dy * dy < rr * rr) { hitObstacle(); break; }
          }
        }
      }

      // ¿Se completó el contrarreloj? (modo time)
    }

    // estela (cantidad segun los efectos visuales)
    const fx = DAT.getFx(SAVE.get().fx);
    const gq = SAVE.get().set.gfx;
    const trailChance = gq === 'high' ? 0.5 : gq === 'medium' ? 0.3 : 0.12;
    if (airborne && fx.color && !bird.dead && Math.random() < trailChance) {
      const col = fx.rainbow ? 'hsl(' + ((t * 260) % 360) + ',95%,62%)' : fx.color;
      const tn = gq === 'high' ? 3 : gq === 'medium' ? 2 : 1;
      FX.trail(bird.x - bird.r * 0.7, bird.y + bird.r * 0.2, col, tn, fx.stars);
    }

    FX.update(dt);
    updateHUD();
    render();
    rafId = requestAnimationFrame(loop);
  }

  /* --- Suspensión: pantalla apagada o app en segundo plano --- */
  function suspend() {
    if (halted && !loopActive) return;
    halted = true;
    loopActive = false;
    if (cancelAnimationFrame) cancelAnimationFrame(rafId);
    if (state === 'play' && !paused) {
      paused = true;
      autoPaused = true;
      UI.setPaused(true);
      UI.setHudVisible(false);
    }
    SND.stopMusic();
  }

  function resumeLoop() {
    if (loopActive) return;
    halted = false;
    loopActive = true;
    lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    if (state === 'menu') SND.startMusic();
    requestAnimationFrame(loop);
  }

  function circleRect(cx, cy, r, rx, ry, rw, rh) {
    const nx = Math.max(rx, Math.min(cx, rx + rw));
    const ny = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < r * r;
  }

  function onLevelUp(newLevel) {
    lvl = newLevel;
    SND.sfx.level();
    FX.confetti(bird.x, bird.y - 20);
    FX.text(bird.x, bird.y - 46, '¡NIVEL ' + lvl + '!', 22, '#ffe066');
    UI.toast('⚡ ¡Nivel ' + lvl + '! El vuelo se pone intenso', 'info');
    updateHUD();
  }

  function flap() {
    if (paused || state !== 'play' || replayMode) return; // en el Replay los aleteos los pone la grabación
    SND.unlock();
    SND.sfx.flap();
    if (readyTap) { readyTap = false; airborne = true; UI.showStartHint(false); }
    flapNow();
    if (!replayMode && replayTaps.length < 5000) replayTaps.push(Math.round(runSeconds * 1000));
    if (SAVE.get().set.vib && navigator.vibrate) { try { navigator.vibrate(16); } catch (e) { } }
  }

  // Aleteo de física (sin sonido): compartido por el jugador y el Replay
  function flapNow() {
    bird.vy = PHYS.flapVel * skinStats.flap * 0.98;
    bird.squish = 1.18;
    bird.wingPhase = 0;
  }

  function collide() {
    if (bird.dead) return;
    hitHappened = true;
    if (rt.fenix) {
      rt.fenix = false;
      bird.dead = false;
      bird.y = Math.max(H * 0.42, H - groundH - bird.r - 60);
      bird.vy = -260;
      invulnT = t + 2.5;
      SAVE.get().stats.fenixUsed = (SAVE.get().stats.fenixUsed || 0) + 1;
      SAVE.save();
      SND.sfx.power();
      FX.burst(bird.x, bird.y, '#ff8a65', 30, 380, { big: true, grav: 300 });
      FX.text(bird.x, bird.y - bird.r - 40, '🦅 ¡FÉNIX! +1 vida', 18, '#ff8a65');
      UI.toast('🦅 ¡El Fénix volvió a la vida!', 'good');
      updateHUD();
      return;
    }
    bird.dead = true;
    bird.vy = -300;
    readyTap = false; airborne = false;
    SND.sfx.hit();
    SND.stopMusic();
    if (SAVE.get().set.shake !== false) FX.shake(18);
    FX.burst(bird.x, bird.y, '#ffd54f', 26, 320, { big: true, grav: 700 });
    FX.burst(bird.x, bird.y, '#fff', 14, 200);
    FX.puff(bird.x, bird.y, '#fff', 10);
    if (SAVE.get().set.vib && navigator.vibrate) { try { navigator.vibrate([60, 40, 80]); } catch (e) { } }
    UI.setHudVisible(false);
    endRun(); // muerte instantánea: muestra la pantalla de reintentar al momento
  }

  // Choque con un obstáculo: si hay escudo lo consume (sin morir); con i-frames breves
  function hitObstacle() {
    if (bird.dead) return;
    if (eff.shield > t && invulnT <= t) {
      eff.shield = 0;
      invulnT = t + 1.0;
      SAVE.get().stats.shieldAbsorbed = (SAVE.get().stats.shieldAbsorbed || 0) + 1;
      SAVE.save();
      SND.sfx.block();
      FX.burst(bird.x, bird.y, '#29b6f6', 26, 300, { big: true, grav: 300 });
      FX.text(bird.x, bird.y - bird.r - 26, '🛡️ ¡Escudo roto!', 16, '#29b6f6');
      if (SAVE.get().set.shake !== false) FX.shake(8);
      if (SAVE.get().set.vib && navigator.vibrate) { try { navigator.vibrate(50); } catch (e) { } }
      updateHUD();
    } else if (invulnT > t) {
      // i-frame tras romper el escudo: se ignora el golpe
      return;
    } else {
      collide();
    }
  }

// XP de evolución para el ave equipada (etapas 1 → 2 → 3)
  function awardSkinXp(xpGain) {
    const skid = SAVE.get().skin;
    const ups = SAVE.addSkinXp(skid, Math.max(1, Math.round(xpGain * 0.35) + 2));
    if (ups > 0) {
      const st = SAVE.skinStage(skid);
      SND.sfx.level();
      if (state === 'play') FX.text(bird.x, bird.y - bird.r - 78, '⭐ ¡Etapa ' + st + '!', 15, '#ffe066');
      UI.toast('⭐ ¡' + DAT.getSkin(skid).name + ' evolucionó a la Etapa ' + st + '!', 'good');
    }
  }

  function endRun() {
    // Replay terminado: se sale sin alterar las estadísticas reales
    if (replayMode) {
      replayMode = false;
      SAVE.markReplayWatched();
      const ach = SAVE.checkAch();
      state = 'over';
      UI.toast('🎬 Fin del Replay', 'info');
      goMenu(); // detiene y exporta el video grabado
      ach.forEach(a => UI.popAch(a));
      return;
    }
    state = 'over';
    const xp = Math.floor(score * 3 + pipesDone * 2 + coinCount * 3);
    const levelUps = SAVE.addXp(xp);
    awardSkinXp(xp);
    const dist = Math.floor(totalDist / 30);
    const isRecord = SAVE.endRun(score, pipesDone, coinCount, runSeconds, dist);
    const s = SAVE.get();
    // medallas ocultas (condiciones raras)
    if (!hitHappened && dist > 0) s.stats.maxDistNoHit = Math.max(s.stats.maxDistNoHit || 0, dist);
    if (coinCount === 0 && score > 0) s.stats.zeroCoinRuns = (s.stats.zeroCoinRuns || 0) + 1;
    if (mode === 'free') SAVE.storeReplay(score, curSeed, replayTaps, s.map);
    SAVE.save();
    const ach = SAVE.checkAch();
    const wasChallenge = mode === 'challenge';
    if (wasChallenge) {
      const cr = SAVE.recordChallenge(score);
      UI.toast('🌱 Semilla diaria: +' + cr.bonus + ' 🪙 · Mejor: ' + cr.best + ' pts', 'good');
    }
    if (mode === 'duel' && !clearedFlag) {
      const rivP = rival ? rival.prog : 0;
      clearedFlag = true;
      if (pipesDone > rivP) { duelClear(false); return; }
      UI.toast('🆚 Perdiste el duelo (IA: ' + rivP + ' · tú: ' + pipesDone + ')', '');
    }
    if (mode === 'levels') {
      const stg = DAT.getStage(SAVE.get().levels.cur);
      UI.toast('🌟 ' + stg.name + ': pasaste ' + pipesDone + '/' + stg.pipes + ' tubos', 'info');
    }
    mode = SAVE.get().set.mode;
    challengeMap = null;
    SND.sfx.over();
    UI.showGameOver(score, s.stats.best, coinCount, pipesDone, dist, isRecord, ach, levelUps);
  }

  // Se ganó el duelo (por llegar a la meta o por ventaja al morir): premio y pantalla
  function duelClear(finished) {
    const rivP = rival ? rival.prog : 0;
    const won = finished ? pipesDone >= rivP : pipesDone > rivP;
    const reward = won ? (60 + Math.max(0, pipesDone - rivP) * 10 + 40) : 0; // al perder no hay premio
    const xpGain = won ? 45 : 0;
    const lvUps = SAVE.addXp(xpGain);
    awardSkinXp(xpGain);
    SAVE.addCoins(reward);
    if (won) {
      SAVE.get().stats.duelWins = (SAVE.get().stats.duelWins || 0) + 1;
      SAVE.save();
    }
    const ach = SAVE.checkAch();
    SND.stopMusic();
    SND.sfx.medal();
    if (won) SND.sfx.achieve();
    FX.confetti(bird.x, bird.y - 30);
    state = 'cleared';
    UI.setHudVisible(false);
    UI.showModeClear({
      title: won ? '¡GANASTE EL DUELO!' : 'DUELO TERMINADO',
      lvLbl: 'Tus tubos', lv: '' + pipesDone,
      tgtLbl: 'Tubos de la IA', tgt: '' + rivP,
      reward: reward, xp: xpGain, lvUps: lvUps, ach: ach,
      stars: (pipesDone >= rivP ? '🆚 Victoria' : '🆚 Derrota'),
      btn: '🆚 OTRO DUELO'
    });
  }

  // Se superó la etapa del Modo Niveles: estrellas y premio
  function levelClear() {
    const idx = SAVE.get().levels.cur;
    const stg = DAT.getStage(idx);
    const r = SAVE.recordLevel(idx, pipesDone, score);
    const reward = stg.coins + r.stars * 25;
    const xpGain = 40 + r.stars * 10;
    const lvUps = SAVE.addXp(xpGain);
    awardSkinXp(xpGain);
    SAVE.addCoins(reward);
    const ach = SAVE.checkAch();
    const starTxt = r.stars >= 3 ? '⭐⭐⭐' : r.stars === 2 ? '⭐⭐' : r.stars === 1 ? '⭐' : 'Sin estrellas';
    SND.stopMusic();
    SND.sfx.medal();
    if (r.stars >= 2) SND.sfx.achieve();
    FX.confetti(bird.x, bird.y - 30);
    state = 'cleared';
    UI.setHudVisible(false);
    UI.showModeClear({
      title: '¡NIVEL SUPERADO!',
      lvLbl: 'Tubos', lv: '' + pipesDone,
      tgtLbl: 'Objetivo', tgt: '' + stg.pipes + ' tubos',
      reward: reward, xp: xpGain, lvUps: lvUps, ach: ach,
      stars: starTxt,
      btn: '🌟 SIGUIENTE ETAPA'
    });
  }

  // Se pasaron los 10 tubos del contrarreloj: premio y récord
  function clearTimeRun() {
    const elapsed = runSeconds;
    const cr = SAVE.endTimeRun(elapsed);
    const reward = 80 + Math.floor(Math.max(0, Math.min(20, 30 - elapsed)) / 2);
    const xpGain = 50;
    const lvUps = SAVE.addXp(xpGain);
    awardSkinXp(xpGain);
    SAVE.addCoins(reward);
    const ach = SAVE.checkAch();
    SND.sfx.achieve();
    SND.sfx.medal();
    FX.confetti(bird.x, bird.y - 30);
    state = 'cleared';
    UI.setHudVisible(false);
    SND.stopMusic();
    UI.showTimeClear(elapsed, cr.best, cr.isRecord, reward, xpGain, lvUps, ach);
  }

  function startPlay(m) {
    if (m === 'free' || m === 'time' || m === 'challenge' || m === 'duel' || m === 'levels' || m === 'replay') mode = m;
    SND.unlock();
    challengeMap = null;
    if (mode === 'challenge') challengeMap = dailyChallengeMap();
    newRun();
    state = 'play'; // antes de consumir herramientas: la Batería puede completar el contrarreloj en el acto
    if (mode !== 'replay') consumeTools();
    if (state !== 'play') { SND.startMusic(); return; } // la Batería ya cerró la partida (modo time)
    if (replayMode) startReplayExport();
    paused = false;
    autoPaused = false;
    UI.setPaused(false);
    UI.setHudVisible(true);
    UI.showStartHint(true);
    UI.hideAllScreens();
    updateHUD();
    SND.startMusic();
  }

  // Graba en video el Replay en reproducción (WebM si el navegador lo permite)
  function startReplayExport() {
    if (!replayMode) return;
    try {
      if (canvas.captureStream && typeof MediaRecorder !== 'undefined') {
        const stream = canvas.captureStream(30);
        const chunks = [];
        replayRec = new MediaRecorder(stream, { mimeType: 'video/webm' });
        replayRec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        replayRec.onstop = () => { exportReplayBlob(new Blob(chunks, { type: 'video/webm' })); };
        replayRec.start(250);
      }
    } catch (e) { }
  }
  function exportReplayBlob(blob) {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'piovuelo-replay.webm';
      document.body.appendChild(a); a.click(); a.remove();
      UI.toast('🎬 Video del replay guardado (WebM)', 'good');
    } catch (e) {
      UI.toast('🎬 Replay grabado (compártelo desde Descargas)', 'info');
    }
  }

  // Escenario rotativo del desafío diario (cambia cada día)
  function dailyChallengeMap() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const day = Math.floor((now - start) / 86400000);
    return DAT.MAPS[(day * 7 + now.getMonth() + 3) % DAT.MAPS.length].id;
  }

  // Nivel de mejora de una herramienta (0..5)
  function toolLv(k) { return SAVE && SAVE.toolLevel ? SAVE.toolLevel(k) : 0; }

  // Herramientas en modo 'auto' se consumen al empezar la partida
  function consumeTools() {
    rt.slow = false; rt.magnet = false; rt.coins = false; rt.boost = false; rt.luck = false; rt.score = false; rt.sprint = false; rt.hype = false; rt.oasis = false; rt.doble = false; rt.titan = false; rt.fenix = false;
    oasisLast = 0;
    const s = SAVE.get();
    const used = [];
    DAT.TOOLS.forEach(tool => {
      if (SAVE.toolModeVal(tool.key) !== 'auto') return;
      if ((s.items[tool.key] || 0) <= 0) return;
      s.items[tool.key]--;
      applyToolEffect(tool.key, mode);
      SAVE.noteToolUse(tool.key);
      used.push(tool.icon);
    });
    SAVE.save();
    if (used.length) {
      UI.toast('🛠 Herramientas activas: ' + used.join(' '), 'info');
      FX.burst(bird.x, bird.y, '#cdefff', 14, 200);
    }
  }

  function applyToolEffect(key, curMode) {
    const lv = toolLv(key);
    if (key === 'slow') eff.slow = t + 5 + lv * 1.2;
    else if (key === 'magnet') eff.magnet = t + 7 + lv * 1.5;
    else if (key === 'coins') eff.xc = t + 8 + lv * 1.5;
    else if (key === 'luck') rt.luck = true;
    else if (key === 'score') rt.score = true;
    else if (key === 'sprint') rt.sprint = true;
    else if (key === 'boost') { score += 3 + toolLv('boost') * 2; FX.text(bird.x, bird.y - bird.r - 60, '🚀 ¡Empuje Turbo! +' + (3 + toolLv('boost') * 2), 14, '#a5d6ff'); }
    else if (key === 'start' && curMode === 'free') { score += 5 + toolLv('start') * 3; FX.text(bird.x, bird.y - bird.r - 44, '✨ ¡Arranque Estelar! +' + (5 + toolLv('start') * 3), 14, '#ffe066'); }
    else if (key === 'treasure') {
      const mv = 6 + toolLv('treasure');
      SAVE.addCoins(mv);
      score += 1;
      FX.text(bird.x, bird.y - bird.r - 52, '💎 ¡Tesoro! +' + mv + ' 🪙', 15, '#ce93d8');
    } else if (key === 'clock') {
      eff.clock = t + 5 + toolLv('clock');
      clockFreeze = score;
      FX.text(bird.x, bird.y - bird.r - 60, '⏱ ¡Reloj Estelar!', 14, '#4dd0e1');
    } else if (key === 'turbo') {
      eff.turbo = t + 4 + toolLv('turbo') * 0.8;
      FX.text(bird.x, bird.y - bird.r - 60, '⚡ ¡Aliento de Cohete!', 14, '#ff5252');
    } else if (key === 'combo') {
      eff.combo = t + 10 + toolLv('combo') * 1.5;
      FX.text(bird.x, bird.y - bird.r - 60, '🔥 ¡Racha Extra! +2/tubo', 14, '#ff9100');
    } else if (key === 'shield') {
      eff.shield = 1e9;
      FX.text(bird.x, bird.y - bird.r - 60, '🛡️ ¡Escudo Celeste!', 14, '#29b6f6');
    } else if (key === 'ghost') {
      eff.ghost = t + 4 + toolLv('ghost');
      FX.text(bird.x, bird.y - bird.r - 60, '👻 ¡Pase Fantasma!', 14, '#b388ff');
    } else if (key === 'frenzy') {
      eff.frenzy = t + 12 + toolLv('frenzy') * 1.5;
      FX.text(bird.x, bird.y - bird.r - 60, '🎇 ¡Frenesí! +1 por power-up', 14, '#ff8a65');
    } else if (key === 'eco') {
      const mv = 10 + toolLv('eco') * 3;
      SAVE.addCoins(mv);
      FX.text(bird.x, bird.y - bird.r - 60, '🛍️ ¡Eco Bolsa! +' + mv + ' 🪙', 14, '#aed581');
    } else if (key === 'hype') {
      rt.hype = true;
      FX.text(bird.x, bird.y - bird.r - 60, '🔥 ¡Hype! +2 por power-up', 14, '#ff8a65');
    } else if (key === 'bomb') {
      eff.bomb = t + 10 + toolLv('bomb') * 1;
      FX.text(bird.x, bird.y - bird.r - 60, '🧨 ¡Cosecha! +1 por moneda', 14, '#ffab91');
    } else if (key === 'aura') {
      eff.aura = t + 20 + toolLv('aura') * 2;
      FX.text(bird.x, bird.y - bird.r - 60, '🕉️ ¡Aura! +1 por tubo', 14, '#b388ff');
    } else if (key === 'twin') {
      const mv = 8 + toolLv('twin') * 2;
      score += mv;
      FX.text(bird.x, bird.y - bird.r - 60, '🧿 ¡Géminis! +' + mv + ' pts', 14, '#4dd0e1');
      updateHUD();
    } else if (key === 'oasis') {
      rt.oasis = true;
      FX.text(bird.x, bird.y - bird.r - 60, '💧 ¡Oasis! +1 por 10 m', 14, '#69f0ae');
    } else if (key === 'doble') {
      rt.doble = true;
      FX.text(bird.x, bird.y - bird.r - 60, '♦️ ¡Doble Punto! +1 por tubo', 14, '#ffe066');
    } else if (key === 'runa') {
      const xp = 15 + toolLv('runa') * 5;
      SAVE.addXp(xp);
      FX.text(bird.x, bird.y - bird.r - 60, '🗿 ¡Runa Ancestral! +' + xp + ' XP', 14, '#ce93d8');
      updateHUD();
    } else if (key === 'titan') {
      rt.titan = true;
      FX.text(bird.x, bird.y - bird.r - 60, '🥊 ¡Modo Titán! +2/tubo', 14, '#ff8a65');
    } else if (key === 'fenix') {
      rt.fenix = true;
      FX.text(bird.x, bird.y - bird.r - 60, '🦅 ¡Fénix! Revive una vez', 14, '#ff8a65');
    } else if (key === 'bateria') {
      if (curMode === 'time') {
        pipesDone += 2 + Math.floor(toolLv('bateria') / 2);
        if (state === 'play' && !clearedFlag && !bird.dead && pipesDone >= TIME_PIPES) { clearedFlag = true; clearTimeRun(); }
        FX.text(bird.x, bird.y - bird.r - 60, '🔋 ¡Batería! Barra +2 tubos', 14, '#7ee0ff');
      } else {
        score += 5 + Math.floor(toolLv('bateria') / 2);
        FX.text(bird.x, bird.y - bird.r - 60, '🔋 ¡Batería! +5 pts', 14, '#7ee0ff');
      }
      updateHUD();
    } else if (key === 'cris') {
      const mv = 20 + toolLv('cris') * 3;
      SAVE.addCoins(mv);
      FX.text(bird.x, bird.y - bird.r - 60, '🪄 ¡Cristal Mágico! +' + mv + ' 🪙', 14, '#e1bee7');
      updateHUD();
    }
  }

  const MANUAL_ORDER = ['magnet', 'coins', 'slow', 'luck', 'boost', 'score', 'sprint', 'start', 'treasure', 'clock', 'turbo', 'combo', 'shield', 'ghost', 'frenzy', 'eco', 'hype', 'bomb', 'aura', 'twin', 'oasis', 'doble', 'runa', 'titan', 'fenix', 'bateria', 'cris'];

  // Herramientas armadas como 'manual': disponibles en la barra de vuelo
  function manualToolList() {
    const s = SAVE.get();
    const out = [];
    DAT.TOOLS.forEach(t => {
      if (SAVE.toolModeVal(t.key) === 'manual' && (s.items[t.key] || 0) > 0) out.push(t);
    });
    return out;
  }

  // Activa la herramienta indicada a mitad de vuelo (botón de la barra HUD)
  function useBagTool(key) {
    if (state !== 'play' || paused || replayMode) return;
    const tool = DAT.TOOLS.find(t => t.key === key);
    if (!tool || !SAVE.get() || (SAVE.get().items[key] || 0) < 1) return;
    SAVE.get().items[key]--;
    applyToolEffect(key, mode);
    SAVE.noteToolUse(key);
    SAVE.get().stats.manualUses = (SAVE.get().stats.manualUses || 0) + 1;
    SAVE.save();
    SND.sfx.power();
    FX.burst(bird.x, bird.y, '#cdefff', 12, 180);
    UI.toast('👆 ' + tool.icon + ' ' + tool.name + ' activada', 'info');
    updateHUD();
  }

  // Actualiza la barra de herramientas manuales del HUD
  function updateHudTools() {
    if (typeof UI !== 'undefined' && UI.refreshHudTools) UI.refreshHudTools();
  }

  function setMode(m) {
    if (m !== 'free' && m !== 'time' && m !== 'challenge' && m !== 'duel' && m !== 'levels') return;
    mode = m;
    if (m === 'free' || m === 'time') SAVE.setSetting('mode', mode);
  }
  function setLevelStage(i) {
    SAVE.setLevelStage(i);
    mode = 'levels';
    return SAVE.get().levels.cur;
  }

  function togglePause() {
    if (state !== 'play') return;
    paused = !paused;
    if (!paused) autoPaused = false;
    UI.setPaused(paused);
    UI.setHudVisible(!paused);
    if (paused) SND.stopMusic(); else SND.startMusic();
  }

  function setPaused(p) {
    if (state !== 'play') return;
    paused = p;
    if (!p) autoPaused = false;
    UI.setPaused(p);
    UI.setHudVisible(!p);
    if (p) SND.stopMusic(); else SND.startMusic();
  }

  function goMenu() {
    state = 'menu';
    paused = false;
    if (mode === 'challenge' || mode === 'duel' || mode === 'levels' || mode === 'replay') mode = SAVE.get().set.mode; // salir del modo especial libera el modo
    replayMode = false;
    if (replayRec) { try { replayRec.stop(); } catch (e) { } replayRec = null; }
    challengeMap = null;
    if (!bird) bird = { x: 0, y: 0, r: 17, vy: 0, wingPhase: 0, y0: 0, rot: 0, squish: 1, dead: false };
    bird.x = W * 0.5;
    bird.y0 = H * 0.34;
    bird.y = bird.y0;
    bird.rot = 0; bird.vy = 0; bird.dead = false;
    enemies = [];
    BG.init(SAVE.get().map);
    BG.reset();
    UI.showHome();
    SND.startMusic();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    BG.draw(ctx);
    FX.draw(ctx);

    const S = SAVE.get();
    const skin = DAT.getSkin(S.skin);
    const hat = S.hat;
    const birdStage = SAVE.skinStage(S.skin);
    const birdGolden = !!skin.golden;

    pipes.forEach(p => ENTS.drawPipe(ctx, p, BG.getMap(), groundH, W, H));
    coins.forEach(c => ENTS.drawCoin(ctx, c, t));
    enemies.forEach(e => ENTS.drawEnemy(ctx, e, t));
    powers.forEach(pw => ENTS.drawPower(ctx, pw, t));

    if (bird) {
      if (eff.magnet > t || rt.magnet) drawAura(ctx, bird.x, bird.y, bird.r, '#ff7043');
      if (eff.slow > t || rt.slow) drawAura(ctx, bird.x, bird.y, bird.r, '#ffd54f');
      if (eff.x2 > t) drawAura(ctx, bird.x, bird.y, bird.r, '#ffe066');
      if (eff.xc > t) drawAura(ctx, bird.x, bird.y, bird.r, '#b2ff59');
      if (eff.turbo > t) drawAura(ctx, bird.x, bird.y, bird.r, '#ff5252');
      if (eff.combo > t) drawAura(ctx, bird.x, bird.y, bird.r, '#ff9100');
      if (eff.clock > t) drawAura(ctx, bird.x, bird.y, bird.r, '#4dd0e1');
      if (eff.shield > t) drawAura(ctx, bird.x, bird.y, bird.r, '#29b6f6');
      if (eff.ghost > t) drawAura(ctx, bird.x, bird.y, bird.r, '#b388ff');
      if (eff.frenzy > t) drawAura(ctx, bird.x, bird.y, bird.r, '#ff8a65');
      if (eff.bomb > t) drawAura(ctx, bird.x, bird.y, bird.r, '#ffab91');
      if (eff.aura > t) drawAura(ctx, bird.x, bird.y, bird.r, '#b388ff');
      if (rt.sprint) drawAura(ctx, bird.x, bird.y, bird.r, '#90caf9');
      if (rt.hype) drawAura(ctx, bird.x, bird.y, bird.r, '#ff7043');
      if (rt.oasis) drawAura(ctx, bird.x, bird.y, bird.r, '#69f0ae');
      if (rt.titan) drawAura(ctx, bird.x, bird.y, bird.r, '#ff8a65');
      if (rt.fenix) drawAura(ctx, bird.x, bird.y, bird.r, '#ffb74d');
      ENTS.drawBird(ctx, bird.x, bird.y, {
        skin, hat, t, wingPhase: bird.wingPhase, squash: bird.squish, rot: bird.rot, r: bird.r,
        ghost: eff.ghost > t,
        stage: birdStage,
        golden: birdGolden
      });
    }

    if (wind.on && !bird.dead && state === 'play') drawWind();
    if (mode === 'duel' && rival && bird && !bird.dead) drawRival();

    if (state === 'play' && readyTap) drawReady();
  }

  // Rayas de viento lateral
  function drawWind() {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#e1f5fe';
    ctx.lineWidth = 2;
    const baseY = H * 0.36;
    for (let i = 0; i < 7; i++) {
      const x = ((t * 260 + i * 96) % (W + 200)) - 100;
      const y = baseY + Math.sin(t * 3 + i * 1.7) * 10 + i * (H * 0.06);
      ctx.beginPath();
      ctx.moveTo(x, y);
      const dx = wind.dir * 34;
      ctx.lineTo(x - dx, y + (i % 2 ? 6 : -4));
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ave rival (IA) del Duelo: posición según la ventaja de progreso
  function drawRival() {
    const lead = rival.prog - pipesDone;
    const rx = clamp(bird.x + 40 + lead * 30, 34, W - 34);
    const ry = H * 0.42 + Math.sin(t * 0.9) * 46 + lead * 8;
    const skin = DAT.getSkin('koi');
    ENTS.drawBird(ctx, rx, ry, {
      skin, hat: null, t, wingPhase: Math.sin(t * 7) * 0.5 + 0.5, squash: 1, rot: 0, r: bird.r * 0.85
    });
    ctx.globalAlpha = 0.9;
    ctx.font = '700 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = lead >= 0 ? '#ff8a80' : '#80cbc4';
    ctx.fillText('IA ' + rival.prog, rx, ry - bird.r - 14);
    ctx.globalAlpha = 1;
  }

  // Herramientas que se activarán solas (auto) esta partida
  function armedLine() {
    const s = SAVE.get();
    const mine = [];
    DAT.TOOLS.forEach(t => {
      if (SAVE.toolModeVal(t.key) === 'auto' && (s.items[t.key] || 0) > 0) mine.push(t.icon);
      else if (SAVE.toolModeVal(t.key) === 'manual' && (s.items[t.key] || 0) > 0) mine.push(t.icon + '?');
    });
    return mine.join(' ');
  }

  function drawReady() {
    ctx.globalAlpha = 0.95;
    ctx.font = '900 ' + Math.max(16, Math.min(20, W * 0.045)) + 'px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4;
    ctx.strokeText('¡TOCA PARA VOLAR!', W / 2, H * 0.74);
    ctx.fillStyle = '#fff';
    ctx.fillText('¡TOCA PARA VOLAR!', W / 2, H * 0.74);
    ctx.font = '700 12px "Segoe UI", sans-serif';
    const sub = mode === 'time'
      ? '⏱ Contrarreloj · Pasa ' + TIME_PIPES + ' tubos en el menor tiempo'
      : mode === 'challenge'
        ? '🌱 Semilla del día ' + dayKey() + ' · misma partida para todos · ¡Suma puntos!'
        : mode === 'duel'
          ? '🆚 Duelo de Aves · Pasa ' + DUEL_PIPES + ' tubos antes que la IA'
          : mode === 'levels'
            ? '🌟 ' + DAT.getStage(SAVE.get().levels.cur).name + ' · Supera esta etapa'
            : mode === 'replay'
              ? '🎬 Replay de tu mejor vuelo (se grabará un video)'
              : 'Esquiva tubos, monedas y enemigos';
    const tools = armedLine();
    const line = (tools ? '🛠 ' + tools.trim() + ' · ' : '') + sub;
    ctx.strokeText(line, W / 2, H * 0.74 + 20);
    ctx.fillText(line, W / 2, H * 0.74 + 20);
    ctx.globalAlpha = 1;
  }

  function updateHUD() {
    const el = document.getElementById('hudScore');
    if (el) el.textContent = score;
    const el2 = document.getElementById('hudLevel');
    const el3 = document.getElementById('hudCoins');
    if (el3) el3.textContent = SAVE.get().coins;
    const el4 = document.getElementById('hudDist');
    if (el4) el4.textContent = Math.floor(totalDist / 30) + ' m';
    const el5 = document.getElementById('hudCombo');
    if (el5) el5.textContent = combo >= 3 ? '🔥 x' + combo : '';
    updateHudTools();
    const pf = document.getElementById('hudProgFill');
    let prog = null, grad = '';
    if (mode === 'time') {
      if (el2) el2.textContent = '⏱ ' + fmtTime(runSeconds);
      grad = 'linear-gradient(90deg,#4dd0e1,#00838f)';
      const Dx = curD(score);
      prog = fracTo(pipesDone, TIME_PIPES, Dx);
    } else if (mode === 'challenge') {
      if (el2) el2.textContent = '🌱 Semilla ' + dayKey();
      grad = 'linear-gradient(90deg,#b39ddb,#7c4dff)';
      prog = Math.max(0, Math.min(100, score / 60 * 100));
    } else if (mode === 'duel') {
      if (el2) el2.textContent = '🆚 ' + pipesDone + '/' + DUEL_PIPES + (rival ? ' · IA ' + rival.prog : '');
      grad = 'linear-gradient(90deg,#ff7043,#d32f2f)';
      const Dx = curD(score);
      prog = fracTo(pipesDone, DUEL_PIPES, Dx);
    } else if (mode === 'levels') {
      const stg = DAT.getStage(SAVE.get().levels.cur);
      if (el2) el2.textContent = '🌟 ' + stg.name + ' (' + pipesDone + '/' + stg.pipes + ')';
      grad = 'linear-gradient(90deg,#ffe066,#ff9100)';
      const Dx = curD(score);
      prog = fracTo(pipesDone, stg.pipes, Dx);
    } else if (mode === 'replay') {
      if (el2) el2.textContent = '🎬 Replay';
      grad = 'linear-gradient(90deg,#b39ddb,#7c4dff)';
      prog = 0;
    }
    if (pf) {
      pf.style.background = grad;
      if (prog === null) {
        const p = (score % LEVEL_STEP) / LEVEL_STEP * 100;
        pf.style.width = Math.max(0, Math.min(100, p)) + '%';
        pf.classList.toggle('full', p >= 99.5);
      } else {
        const cp = Math.max(0, Math.min(100, prog));
        pf.style.width = cp + '%';
        pf.classList.toggle('full', cp >= 99.5);
      }
    } else if (el2) {
      el2.textContent = mode === 'time' ? '⏱ ' + fmtTime(runSeconds)
        : mode === 'challenge' ? '🌱 Semilla ' + dayKey()
        : mode === 'duel' ? '🆚 ' + pipesDone + '/' + DUEL_PIPES
        : mode === 'levels' ? '🌟 ' + DAT.getStage(SAVE.get().levels.cur).name
        : mode === 'replay' ? '🎬 Replay'
          : 'Nivel ' + lvl;
    }
  }

  // Progreso fraccionado de la barra del modo (sube sin saltos entre tubo y tubo)
  function fracTo(done, total, Dx) {
    const base = done / total * 100;
    if (bird.dead || clearedFlag || !pipes.length) return base;
    let ahead = null;
    for (let i = 0; i < pipes.length; i++) {
      if (pipes[i].x + pipes[i].w > bird.x - bird.r) { ahead = pipes[i]; break; }
    }
    if (!ahead) return base;
    const d = Math.max(0, (ahead.x - ahead.w) - (bird.x + bird.r));
    const frac = 1 - Math.min(1, d / (ahead.w + (Dx.spawnEvery || 200)));
    return (done + Math.max(0, frac)) / total * 100;
  }

  function fmtTime(x) {
    const m = Math.floor(x / 60);
    const s = Math.floor(x % 60);
    const d = Math.floor((x % 1) * 10);
    return m + ':' + (s < 10 ? '0' : '') + s + '.' + d;
  }

  return {
    resize, loop, flap, startPlay, togglePause, setPaused, goMenu,
    setMode, setLevelStage,
    getState: () => state,
    isPlay: () => state === 'play',
    waitingFly: () => state === 'play' && readyTap,
    isPaused: () => paused,
    getMode: () => mode,
    useBagTool, manualToolList,
    getScore: () => score,
    getDist: () => Math.floor(totalDist / 30),
    getW: () => W, getH: () => H,
    canvas, ctx,
    forceRestart: newRun,
    suspend, resumeLoop,
    updateHudTools: updateHudTools
  };
})();