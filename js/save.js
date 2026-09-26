/* Progreso persistente: monedas, XP, niveles, logros, tienda, ajustes */
window.SAVE = (function () {
  'use strict';

  const KEY = 'piovuelo_v1';
  const DEFAULT_PERKS = { coins: 80 };

  function defaults() {
    return {
      v: 1,
      coins: DEFAULT_PERKS.coins,
      coinsEarned: 0,
      level: 1,
      xp: 0,
      stats: { best: 0, flights: 0, pipes: 0, timePlayed: 0, coinsGot: 0, dist: 0, powersGot: 0, spent: 0, megaGot: 0, dailyClaimed: 0, enemiesGot: 0, xcGot: 0, toolsUsed: 0, toolsBought: 0, shared: 0, batsGot: 0, ghostsGot: 0, chainGot: 0, gemsGot: 0, challengePlayed: 0, manualUses: 0, upgs: 0, missionsDone: 0, toolTypes: [], shieldAbsorbed: 0, ghostPassed: 0, weekendRuns: 0, fenixUsed: 0, maxDistNoHit: 0, zeroCoinRuns: 0, duelWins: 0, windZones: 0, giantPassed: 0, replaysWatched: 0, levelStars: 0, seedDays: 0 },
      best3: [],
      items: { start: 0, magnet: 0, slow: 0, coins: 0, boost: 0, luck: 0, score: 0, sprint: 0, treasure: 0, clock: 0, turbo: 0, combo: 0, shield: 0, ghost: 0, frenzy: 0, eco: 0, hype: 0, bomb: 0, aura: 0, twin: 0, oasis: 0, doble: 0, runa: 0, titan: 0, fenix: 0, bateria: 0, cris: 0 },
      toolUp: {},           // nivel de mejora por herramienta (0..5)
      toolMode: {},         // 'auto' | 'manual' por herramienta (default auto)
      dailyC: { date: '', best: 0, played: false },
      dailyH: {},
      levels: { cur: 0, stars: [] },
      replay: null,
      maxCombo: 0,
      achieved: [],
      skin: 'classic', skinsOwned: [{ id: 'classic' }],
      hat: null, hatsOwned: [],
      fx: 'fx-none', fxOwned: [{ id: 'fx-none' }],
      map: 'day', mapsOwned: [{ id: 'day' }],
      set: { sfx: true, music: true, vib: true, diff: 'normal', gfx: 'high', mode: 'free', hc: false, moon: false, volS: 1, volM: 1, reduced: false, shake: true, lift: false },
      dailyM: { date: '', claimed: [] },
      dailyBase: {},        // progreso de 0 para las misiones diarias de hoy
      weeklyM: { week: '', claimed: [] },
      weeklyBase: {},       // progreso de 0 para las misiones semanales de esta semana
      passClaimed: [],
      passSeason: '',
      seasonClaimed: [],
      lastDaily: '',
      dailyStreak: 0,
      firstRun: true
    };
  }

  let data = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          // save corrupto: se respalda y se parte de cero (no se pierde silenciosamente)
          try { localStorage.setItem(KEY + '_bak', raw); } catch (e2) { }
          data = defaults(); ensurePassSeason(); return true;
        }
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          try { localStorage.setItem(KEY + '_bak', raw); } catch (e2) { }
          data = defaults(); ensurePassSeason(); return true;
        }
        data = Object.assign(defaults(), parsed);
        // los stats se fusionan en profundidad: si el save viejo no traía los
        // contadores más antiguos (best/flights/pipes/timePlayed/coinsGot) no se quedan indefinidos
        data.stats = Object.assign({}, defaults().stats, (parsed.stats && typeof parsed.stats === 'object') ? parsed.stats : {});
        // bases de progreso de misiones (migración)
        if (!data.dailyBase || typeof data.dailyBase !== 'object') data.dailyBase = {};
        if (!data.weeklyBase || typeof data.weeklyBase !== 'object') data.weeklyBase = {};
        // asegurar listas mínimas
        if (!data.skinsOwned) data.skinsOwned = [{ id: 'classic' }];
        if (!data.fxOwned) data.fxOwned = [{ id: 'fx-none' }];
        if (!data.mapsOwned) data.mapsOwned = [{ id: 'day' }];
        if (!data.hatsOwned) data.hatsOwned = [];
        if (!data.stats) data.stats = defaults().stats;
        // números globales siempre válidos (nunca NaN/negativos)
        if (typeof data.level !== 'number' || data.level < 1) data.level = 1;
        if (typeof data.xp !== 'number' || data.xp < 0) data.xp = 0;
        if (typeof data.coins !== 'number' || data.coins < 0) data.coins = 0;
        if (typeof data.coinsEarned !== 'number' || data.coinsEarned < 0) data.coinsEarned = 0;
        if (typeof data.maxCombo !== 'number' || data.maxCombo < 0) data.maxCombo = 0;
        if (typeof data.stats.best !== 'number' || data.stats.best < 0) data.stats.best = 0;
        if (typeof data.stats.flights !== 'number' || data.stats.flights < 0) data.stats.flights = 0;
        if (typeof data.stats.pipes !== 'number' || data.stats.pipes < 0) data.stats.pipes = 0;
        if (typeof data.stats.timePlayed !== 'number' || data.stats.timePlayed < 0) data.stats.timePlayed = 0;
        if (typeof data.stats.coinsGot !== 'number' || data.stats.coinsGot < 0) data.stats.coinsGot = 0;
        if (typeof data.stats.dist !== 'number') data.stats.dist = 0;
        if (typeof data.stats.powersGot !== 'number') data.stats.powersGot = 0;
        if (typeof data.stats.spent !== 'number') data.stats.spent = 0;
        if (typeof data.stats.megaGot !== 'number') data.stats.megaGot = 0;
        if (typeof data.stats.dailyClaimed !== 'number') data.stats.dailyClaimed = 0;
        if (typeof data.stats.enemiesGot !== 'number') data.stats.enemiesGot = 0;
        if (typeof data.stats.xcGot !== 'number') data.stats.xcGot = 0;
        if (typeof data.stats.toolsUsed !== 'number') data.stats.toolsUsed = 0;
        if (typeof data.stats.toolsBought !== 'number') data.stats.toolsBought = 0;
        if (typeof data.stats.shared !== 'number') data.stats.shared = 0;
        if (typeof data.stats.batsGot !== 'number') data.stats.batsGot = 0;
        if (typeof data.stats.ghostsGot !== 'number') data.stats.ghostsGot = 0;
        if (typeof data.stats.chainGot !== 'number') data.stats.chainGot = 0;
        if (typeof data.stats.gemsGot !== 'number') data.stats.gemsGot = 0;
        if (typeof data.stats.challengePlayed !== 'number') data.stats.challengePlayed = 0;
        if (typeof data.stats.manualUses !== 'number') data.stats.manualUses = 0;
        if (typeof data.stats.upgs !== 'number') data.stats.upgs = 0;
        if (typeof data.stats.missionsDone !== 'number') data.stats.missionsDone = 0;
        if (typeof data.stats.shieldAbsorbed !== 'number') data.stats.shieldAbsorbed = 0;
        if (typeof data.stats.ghostPassed !== 'number') data.stats.ghostPassed = 0;
        if (typeof data.stats.weekendRuns !== 'number') data.stats.weekendRuns = 0;
        if (typeof data.stats.fenixUsed !== 'number') data.stats.fenixUsed = 0;
        if (typeof data.stats.maxDistNoHit !== 'number') data.stats.maxDistNoHit = 0;
        if (typeof data.stats.zeroCoinRuns !== 'number') data.stats.zeroCoinRuns = 0;
        if (typeof data.stats.duelWins !== 'number') data.stats.duelWins = 0;
        if (typeof data.stats.windZones !== 'number') data.stats.windZones = 0;
        if (typeof data.stats.giantPassed !== 'number') data.stats.giantPassed = 0;
        if (typeof data.stats.replaysWatched !== 'number') data.stats.replaysWatched = 0;
        if (typeof data.stats.levelStars !== 'number') data.stats.levelStars = 0;
        if (typeof data.stats.seedDays !== 'number') data.stats.seedDays = 0;
        if (!Array.isArray(data.stats.toolTypes)) data.stats.toolTypes = [];
        if (typeof data.toolUp !== 'object' || !data.toolUp) data.toolUp = {};
        if (typeof data.toolMode !== 'object' || !data.toolMode) data.toolMode = {};
        if (!data.dailyC || typeof data.dailyC !== 'object') data.dailyC = { date: '', best: 0, played: false };
        if (!data.dailyH || typeof data.dailyH !== 'object') data.dailyH = {};
        if (!data.levels || typeof data.levels !== 'object') data.levels = { cur: 0, stars: [] };
        if (typeof data.levels.cur !== 'number') data.levels.cur = 0;
        if (!Array.isArray(data.levels.stars)) data.levels.stars = [];
        if (data.replay === undefined) data.replay = null;
        if (typeof data.dailyC.best !== 'number') data.dailyC.best = 0;
        if (typeof data.dailyC.date !== 'string') data.dailyC.date = '';
        if (data.dailyC.played === undefined) data.dailyC.played = false;
        if (!data.items || typeof data.items !== 'object') data.items = {};
        Object.keys(defaults().items).forEach(k => {
          if (typeof data.items[k] !== 'number' || data.items[k] < 0) data.items[k] = 0;
        });
        if (!Array.isArray(data.best3)) data.best3 = [];
        data.best3 = data.best3.filter(e => e && typeof e.s === 'number').slice(0, 3);
        if (typeof data.lastDaily !== 'string') data.lastDaily = '';
        if (typeof data.dailyStreak !== 'number') data.dailyStreak = 0;
        if (!data.set) data.set = defaults().set;
        ['sfx', 'music', 'vib', 'diff', 'gfx', 'mode', 'hc', 'moon', 'volS', 'volM', 'reduced', 'shake', 'lift'].forEach(k => {
          if (data.set[k] === undefined) data.set[k] = defaults().set[k];
        });
        if (data.set.mode !== 'free' && data.set.mode !== 'time') data.set.mode = 'free'; // migración: solo free/time se guardan
        if (!data.dailyM || typeof data.dailyM !== 'object') data.dailyM = { date: '', claimed: [] };
        if (typeof data.dailyM.date !== 'string') data.dailyM.date = '';
        if (!Array.isArray(data.dailyM.claimed)) data.dailyM.claimed = [];
        if (!data.weeklyM || typeof data.weeklyM !== 'object') data.weeklyM = { week: '', claimed: [] };
        if (typeof data.weeklyM.week !== 'string') data.weeklyM.week = '';
        if (!Array.isArray(data.weeklyM.claimed)) data.weeklyM.claimed = [];
        if (!Array.isArray(data.passClaimed)) data.passClaimed = [];
        if (typeof data.passSeason !== 'string') data.passSeason = '';
        if (!Array.isArray(data.seasonClaimed)) data.seasonClaimed = [];
        if (!data.achieved) data.achieved = [];
        // limites de Modo Niveles y estrellas siempre coherentes con la lista real
        data.levels.cur = Math.min(Math.max(0, data.levels.cur || 0), DAT.STAGES.length - 1);
        data.stats.levelStars = (data.levels.stars || []).filter(x => x > 0).reduce((a, b) => a + b, 0);
        ensurePassSeason(); // rota el Pase si cambió la temporada real
        return false;
      }
    } catch (e) { }
    data = defaults();
    ensurePassSeason();
    return true; // primera vez
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { }
  }

  function owns(list, id) { return list.some(i => i.id === id); }

  /* --- Monedas --- */
  function addCoins(n) {
    data.coins += n; data.coinsEarned += n;
    save();
    return n;
  }
  function spendCoins(n) {
    if (data.coins < n) return false;
    data.coins -= n; save();
    return true;
  }

  /* --- XP / nivel --- */
  function xpFor(level) { return Math.floor(55 * Math.pow(level, 1.35) + 30); }

  function isWeekend() {
    const d = new Date().getDay();
    return d === 0 || d === 6;
  }

  function addXp(n) {
    if (!(n > 0)) return 0; // nunca XP negativa
    if (isWeekend()) {
      n = Math.round(n * 1.5); // XP ×1,5 los fines de semana (Temporada 2026)
    }
    data.xp += n; let ups = 0;
    while (data.xp >= xpFor(data.level)) {
      data.xp -= xpFor(data.level);
      data.level += 1; ups++;
      addCoins(75 + data.level * 10); // recompensa de subir de nivel
    }
    save();
    return ups; // niveles subidos
  }

  /* --- Evolución del ave (XP por volar con esa skin) --- */
  function skinEntry(id) {
    let e = data.skinsOwned.find(i => i.id === id);
    if (!e) { e = { id: id }; data.skinsOwned.push(e); }
    return e;
  }
  function skinXp(id) {
    const e = data.skinsOwned.find(i => i.id === id);
    return e ? (e.xp || 0) : 0;
  }
  function addSkinXp(id, n) {
    if (!(n > 0)) return 0;
    const before = DAT.evolveStage(skinXp(id));
    skinEntry(id).xp = (skinXp(id)) + Math.floor(n);
    save();
    const after = DAT.evolveStage(skinXp(id));
    return after - before; // cuántas etapas subió
  }
  function skinStage(id) { return DAT.evolveStage(skinXp(id)); }

  /* --- Stats --- */
  function endRun(score, pipesPassed, coinsGot, timeSec, distMeters) {
    data.stats.flights += 1;
    data.stats.pipes += pipesPassed;
    data.stats.timePlayed += Math.floor(timeSec);
    data.stats.coinsGot += coinsGot;
    data.stats.dist += Math.floor(distMeters || 0);
    if (isWeekend()) data.stats.weekendRuns = (data.stats.weekendRuns || 0) + 1; // un vuelo por fin de semana
    addBest(score);
    if (score > data.stats.best) { data.stats.best = score; save(); return true; }
    save();
    return false;
  }
  function addBest(score) {
    if (!Array.isArray(data.best3)) data.best3 = [];
    data.best3.push({ s: score, d: Date.now() });
    data.best3.sort((a, b) => b.s - a.s || a.d - b.d);
    if (data.best3.length > 3) data.best3.length = 3;
  }
  function setCombo(maxPipesPassedAgainstDifficulty) {
    if (maxPipesPassedAgainstDifficulty > data.maxCombo) { data.maxCombo = maxPipesPassedAgainstDifficulty; save(); }
  }

  /* --- Tienda --- */
  function buy(type, id) {
    const cat = type === 'skin' ? { list: 'skinsOwned', DAT: DAT.SKINS }
      : type === 'hat' ? { list: 'hatsOwned', DAT: DAT.HATS }
      : type === 'fx' ? { list: 'fxOwned', DAT: DAT.EFFECTS }
      : type === 'map' ? { list: 'mapsOwned', DAT: DAT.MAPS } : null;
    if (!cat) return { ok: false, msg: 'Error' };
    if (owns(data[cat.list], id)) return { ok: false, msg: 'Ya lo tienes' };
    const item = cat.DAT.find(i => i.id === id);
    if (!item) return { ok: false, msg: 'No existe' };
    if (item.week && !DAT.isUnlocked(item)) return { ok: false, msg: 'Se habilitará en la ' + DAT.weekLabel(item) };
    if (data.coins < item.price) return { ok: false, msg: 'no_money' };
    data.coins -= item.price;
    data.stats.spent = (data.stats.spent || 0) + item.price;
    data[cat.list].push({ id });
    save();
    return { ok: true, item };
  }

  function equip(type, id) {
    const map = { skin: 'skin', hat: 'hat', fx: 'fx', map: 'map' };
    const key = map[type];
    if (!key) return false;
    const owned = type === 'skin' ? data.skinsOwned : type === 'hat' ? data.hatsOwned : type === 'fx' ? data.fxOwned : data.mapsOwned;
    if (!owned || !owns(owned, id)) return false;
    data[key] = id;
    save();
    return true;
  }

  /* --- Caja Sorpresa 🥚 (huevo): 5% de variante dorada --- */
  function openBox() {
    const def = DAT.boxDef();
    if (data.coins < def.price) return { ok: false, msg: 'no_money' };
    data.coins -= def.price;
    data.stats.spent = (data.stats.spent || 0) + def.price;
    data.stats.boxesBought = (data.stats.boxesBought || 0) + 1;
    // 5% → variante dorada de una skin cualquiera (el patrón rng de spawnMega)
    if (Math.random() < 0.05) {
      const base = DAT.SKINS[Math.floor(Math.random() * DAT.SKINS.length)];
      const gold = DAT.getSkin(base.id + '-gold');
      if (!owns(data.skinsOwned, gold.id)) data.skinsOwned.push({ id: gold.id });
      save();
      return { ok: true, kind: 'gold', item: gold };
    }
    const pool = [];
    DAT.SKINS.forEach(s => { if (!owns(data.skinsOwned, s.id)) pool.push({ kind: 'skin', item: s }); });
    DAT.HATS.forEach(h => { if (!owns(data.hatsOwned, h.id)) pool.push({ kind: 'hat', item: h }); });
    DAT.EFFECTS.forEach(f => { if (!owns(data.fxOwned, f.id)) pool.push({ kind: 'fx', item: f }); });
    if (pool.length === 0) {
      data.coins += 100; // consolación: ya lo tienes todo
      save();
      return { ok: true, kind: 'coins', amount: 100 };
    }
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (r.kind === 'skin') data.skinsOwned.push({ id: r.item.id });
    else if (r.kind === 'hat') data.hatsOwned.push({ id: r.item.id });
    else data.fxOwned.push({ id: r.item.id });
    save();
    return { ok: true, kind: r.kind, item: r.item };
  }

  /* --- Herramientas de la bolsa (consumibles) --- */
  function buyTool(id) {
    const tool = DAT.getTool(id);
    if (!tool) return { ok: false, msg: 'No existe' };
    if (tool.week && !DAT.isUnlocked(tool)) return { ok: false, msg: 'Se habilitará en la ' + DAT.weekLabel(tool) };
    if (data.coins < tool.price) return { ok: false, msg: 'no_money' };
    spendCoins(tool.price);
    data.stats.spent = (data.stats.spent || 0) + tool.price;
    data.stats.toolsBought = (data.stats.toolsBought || 0) + 1;
    data.items[tool.key] = (data.items[tool.key] || 0) + 1;
    save();
    return { ok: true, tool: tool, owned: data.items[tool.key] };
  }
  function itemCount(key) { return (data.items && data.items[key]) || 0; }

  /* --- Mejoras y modo de activación de herramientas --- */
  function toolLevel(key) { return Math.min(5, data.toolUp[key] || 0); }
  function toolUpPrice(key) { return 80 + toolLevel(key) * 70; }
  function upToolLevel(key) {
    const lv = toolLevel(key);
    if (lv >= 5) return { ok: false, msg: 'max' };
    const price = toolUpPrice(key);
    if (data.coins < price) return { ok: false, msg: 'no_money' };
    spendCoins(price);
    data.toolUp[key] = lv + 1;
    data.stats.spent = (data.stats.spent || 0) + price; // las mejoras también cuentan como gasto de tienda
    data.stats.upgs = (data.stats.upgs || 0) + 1;
    save();
    return { ok: true, level: lv + 1, price: price };
  }
  function toolModeVal(key) { return data.toolMode[key] === 'manual' ? 'manual' : 'auto'; }
  function setToolMode(key, mode) {
    data.toolMode[key] = mode === 'manual' ? 'manual' : 'auto';
    save();
    return data.toolMode[key];
  }
  function noteToolUse(key) {
    data.stats.toolsUsed = (data.stats.toolsUsed || 0) + 1;
    if (data.stats.toolTypes.indexOf(key) === -1) data.stats.toolTypes.push(key);
  }

  /* --- Ventajas del panel de administración --- */
  function unlockAll() {
    DAT.SKINS.forEach(sk => { if (!owns(data.skinsOwned, sk.id)) data.skinsOwned.push({ id: sk.id }); });
    DAT.HATS.forEach(h => { if (!owns(data.hatsOwned, h.id)) data.hatsOwned.push({ id: h.id }); });
    DAT.EFFECTS.forEach(f => { if (!owns(data.fxOwned, f.id)) data.fxOwned.push({ id: f.id }); });
    DAT.MAPS.forEach(m => { if (!owns(data.mapsOwned, m.id)) data.mapsOwned.push({ id: m.id }); });
    save();
    return true;
  }
  function giveTools(n) {
    Object.keys(data.items).forEach(k => { data.items[k] += n; });
    save();
    return true;
  }
  function giveAllUpg() {
    DAT.TOOLS.forEach(t => { data.toolUp[t.key] = 5; });
    save();
    return true;
  }
  function achAll() {
    let reward = 0;
    DAT.ACH.forEach(a => {
      if (data.achieved.indexOf(a.id) === -1) {
        data.achieved.push(a.id);
        reward += (a.reward || 0);
      }
    });
    addCoins(reward);
    save();
    return reward;
  }
  function chalReset() {
    const today = todayStr(new Date());
    if (data.dailyC.date === today) {
      data.dailyC.best = 0;
      data.dailyC.played = false;
      save();
    }
    return true;
  }

  /* --- Contrarreloj (pasa 10 tubos en el menor tiempo) --- */
  function endTimeRun(timeSec) {
    data.stats.timeRuns = (data.stats.timeRuns || 0) + 1;
    data.stats.timeCleared = (data.stats.timeCleared || 0) + 1;
    const prev = data.stats.timeBest || 0;
    const isRecord = !prev || timeSec < prev;
    if (isRecord) data.stats.timeBest = timeSec;
    save();
    return { best: isRecord ? timeSec : prev, isRecord: isRecord };
  }

  /* --- Logros --- */
  function checkAch() {
    const news = [];
    DAT.ACH.forEach(a => {
      if (data.achieved.indexOf(a.id) !== -1) return;
      if (a.check(SAVE)) {
        data.achieved.push(a.id);
        addCoins(a.reward);
        news.push(a);
      }
    });
    save();
    return news;
  }

  /* --- Ajustes --- */
  function setSetting(k, v) { data.set[k] = v; save(); }

  /* --- Recompensa diaria + racha --- */
  function padN(n) { return n < 10 ? '0' + n : '' + n; }
  function todayStr(d) {
    return d.getFullYear() + '-' + padN(d.getMonth() + 1) + '-' + padN(d.getDate());
  }
  function dailyInfo() {
    const now = new Date();
    const today = todayStr(now);
    if (data.lastDaily === today) return { ready: false, streak: data.dailyStreak || 1 };
    const y = new Date(now); y.setDate(now.getDate() - 1);
    const yesterday = todayStr(y);
    const streak = data.lastDaily === yesterday ? (data.dailyStreak || 0) + 1 : 1;
    return { ready: true, streak: streak };
  }
  function claimDaily() {
    const info = dailyInfo();
    if (!info.ready) return null;
    const bonus = info.streak % 7 === 0 ? 50 : 0;
    const reward = 20 + info.streak * 10 + bonus;
    data.lastDaily = todayStr(new Date());
    data.dailyStreak = info.streak;
    data.stats.dailyClaimed = (data.stats.dailyClaimed || 0) + 1;
    addCoins(reward);
    save();
    return { streak: info.streak, reward: reward, bonus: bonus };
  }
  function adminSetStreak() {
    const now = new Date();
    const y = new Date(now); y.setDate(now.getDate() - 1);
    data.lastDaily = todayStr(y);
    data.dailyStreak = 6;
    save();
    return true;
  }

  /* --- Desafío diario 🌙 --- */
  function chalToday() {
    const today = todayStr(new Date());
    if (data.dailyC.date !== today) {
      data.dailyC.date = today;
      data.dailyC.best = 0;
      data.dailyC.played = false;
      save();
    }
    return data.dailyC;
  }
  function challengePlayedToday() { return chalToday().played === true; }
  function recordChallenge(score) {
    const dc = chalToday();
    const isBest = score > dc.best;
    const firstRunToday = !dc.played; // solo cuenta 1 semilla por día (logros de constancia)
    if (isBest) dc.best = score;
    dc.played = true;
    if (firstRunToday) {
      data.stats.challengePlayed = (data.stats.challengePlayed || 0) + 1;
      data.stats.seedDays = (data.stats.seedDays || 0) + 1;
    }
    const today = todayStr(new Date());
    if (!data.dailyH[today] || score > data.dailyH[today]) data.dailyH[today] = score;
    const bonus = score >= 35 ? 150 : score >= 15 ? 75 : score >= 5 ? 30 : 5;
    addCoins(bonus);
    save();
    return { bonus: bonus, best: dc.best, isBest: isBest, score: score };
  }
  function dailyHistory() {
    const o = data.dailyH || {};
    return Object.keys(o).sort().slice(-7).map(k => ({ key: k, best: o[k] }));
  }
  function seedToday() {
    const now = new Date();
    const p = n => (n < 10 ? '0' : '') + n;
    return now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate());
  }

  /* --- Modo Niveles 🌟 --- */
  function levelInfo() { return { cur: (data.levels && data.levels.cur) || 0, stars: (data.levels && data.levels.stars) || [] }; }
  function setLevelStage(i) {
    const max = DAT.STAGES.length - 1;
    data.levels.cur = Math.min(Math.max(0, i || 0), max);
    save();
    return data.levels.cur;
  }
  function recordLevel(idx, pipesDone, score) {
    const st = DAT.getStage(idx);
    const stars = pipesDone >= st.pipes ? (score >= st.s3 ? 3 : score >= st.s2 ? 2 : score >= st.s1 ? 1 : 0) : 0;
    const arr = data.levels.stars;
    const prev = arr[idx] || 0;
    const improve = stars > prev;
    if (improve) arr[idx] = stars;
    data.stats.levelStars = arr.filter(x => x > 0).reduce((a, b) => a + b, 0);
    // solo se avanza desde la etapa vigente (no se pueden saltar etapas)
    if (pipesDone >= st.pipes && idx === data.levels.cur && idx < DAT.STAGES.length - 1) {
      data.levels.cur = idx + 1;
    }
    save();
    return { stars: stars, improve: improve, prev: prev, done: pipesDone >= st.pipes, stage: st };
  }

  /* --- Replay 🎬 --- */
  function storeReplay(score, seed, taps, mapId) {
    const payload = { score: score, seed: seed, taps: (taps || []).slice(0, 5000), date: Date.now(), map: mapId };
    if (!data.replay) { data.replay = payload; save(); return true; }
    if (score > data.replay.score) { data.replay = payload; save(); return true; }
    // a igual puntuación gana el vuelo más largo (más aleteos grabados), el otro descarta
    if (score === data.replay.score && payload.taps.length > (data.replay.taps || []).length) { data.replay = payload; save(); return true; }
    return false;
  }
  function getReplay() { return data.replay; }
  function markReplayWatched() {
    data.stats.replaysWatched = (data.stats.replaysWatched || 0) + 1;
    save();
  }

  /* --- Misiones diarias/semanales 📋 --- */
  function dzi() {
    const today = todayStr(new Date());
    if (data.dailyM.date !== today) {
      data.dailyM.date = today;
      data.dailyM.claimed = [];
      // base de hoy: las misiones cuentan el progreso DESDE hoy (sin reciclable infinito)
      const nb = {};
      DAT.MISSIONS.forEach(m => { if (!m.weekly) nb[m.id] = m.metric(SAVE) || 0; });
      data.dailyBase = nb;
      save();
    }
    return data.dailyM;
  }
  function weekStr(d) {
    const c = new Date(d);
    const wd = (c.getDay() + 6) % 7; // lunes = 0
    c.setDate(c.getDate() - wd);
    return todayStr(c);
  }
  function wz() {
    const w = weekStr(new Date());
    if (data.weeklyM.week !== w) {
      data.weeklyM.week = w;
      data.weeklyM.claimed = [];
      // base de la semana: el progreso semanal arranca en 0 al rotar
      const nb = {};
      DAT.MISSIONS.forEach(m => { if (m.weekly) nb[m.id] = m.metric(SAVE) || 0; });
      data.weeklyBase = nb;
      save();
    }
    return data.weeklyM;
  }
  function missionProgress(m) { return Math.max(0, (m.metric(SAVE) || 0) - (((m.weekly ? data.weeklyBase : data.dailyBase) || {})[m.id] || 0)); }
  function missionDoneToday(m) {
    const z = m.weekly ? wz() : dzi();
    return z.claimed.indexOf(m.id) !== -1;
  }
  function claimMission(m) {
    if (missionDoneToday(m) || missionProgress(m) < m.target) return null;
    (m.weekly ? wz() : dzi()).claimed.push(m.id);
    grantReward(m.reward);
    data.stats.missionsDone = (data.stats.missionsDone || 0) + 1;
    save();
    return m;
  }
  function grantReward(r) {
    if (typeof r === 'number') { addCoins(r); return; }
    if (r && r.coins) addCoins(r.coins);
    if (r && r.item) data.items[r.item] = (data.items[r.item] || 0) + r.n;
    if (r && r.hat && !owns(data.hatsOwned, r.hat)) {
      data.hatsOwned.push({ id: r.hat });
      if (!data.hat) data.hat = r.hat;
    }
    if (r && r.fx && !owns(data.fxOwned, r.fx)) {
      data.fxOwned.push({ id: r.fx });
      if (!data.fx || data.fx === 'fx-none') data.fx = r.fx;
    }
    if (r && r.map && !owns(data.mapsOwned, r.map)) {
      data.mapsOwned.push({ id: r.map });
      if (!data.map || data.map === 'day') data.map = r.map;
    }
    if (r && r.skin && !owns(data.skinsOwned, r.skin)) {
      data.skinsOwned.push({ id: r.skin });
    }
  }

  /* --- Pase de Vuelo 🎫 (rota automáticamente por temporada real) --- */
  function ensurePassSeason() {
    const k = DAT.seasonKey();
    if (data.passSeason !== k) {
      data.passSeason = k;
      data.passClaimed = [];
      save();
    }
  }
  function totalXp() {
    let sum = 0;
    for (let l = 1; l < data.level; l++) sum += xpFor(l);
    return sum + data.xp;
  }
  function passReached() {
    ensurePassSeason();
    const tiers = DAT.passTiers();
    const tx = totalXp();
    let i = -1;
    tiers.forEach((t, idx) => { if (tx >= t.xp) i = idx; });
    return i + 1;
  }
  function passClaimedCount() { return (data.passClaimed || []).length; }
  function claimPassTier(idx) {
    ensurePassSeason();
    const tiers = DAT.passTiers();
    if (idx < 0 || idx >= tiers.length) return null;
    if (data.passClaimed.indexOf(idx) !== -1) return null;
    if (totalXp() < tiers[idx].xp) return null;
    data.passClaimed.push(idx);
    grantReward(tiers[idx].reward);
    save();
    return tiers[idx];
  }
  function passSeasonName() {
    const si = DAT.seasonIndex();
    const s = DAT.SEASONS[si];
    return (s.icon + ' ' + s.pass.name + ' · ' + DAT.seasonKey());
  }

  /* --- Temporada 2026 🗓 (misma XP del jugador) --- */
  function seasonReached() {
    const tx = totalXp();
    let i = -1;
    DAT.SEASON_TIERS.forEach((t, idx) => { if (tx >= t.xp) i = idx; });
    return i + 1;
  }
  function seasonClaimCount() { return (data.seasonClaimed || []).length; }
  function claimSeasonTier(idx) {
    if (idx < 0 || idx >= DAT.SEASON_TIERS.length) return null;
    if (data.seasonClaimed.indexOf(idx) !== -1) return null;
    if (totalXp() < DAT.SEASON_TIERS[idx].xp) return null;
    data.seasonClaimed.push(idx);
    grantReward(DAT.SEASON_TIERS[idx].reward);
    save();
    return DAT.SEASON_TIERS[idx];
  }

  /* --- Helpers admin --- */
  function setLevel(n) {
    const v = Math.floor(Number(n));
    data.level = Math.min(999, Math.max(1, isNaN(v) ? 1 : v));
    data.xp = 0;
    save();
    return data.level;
  }
  function claimPassAll() {
    ensurePassSeason();
    const tiers = DAT.passTiers();
    let n = 0;
    tiers.forEach((t, idx) => {
      if (data.passClaimed.indexOf(idx) === -1 && totalXp() >= t.xp) {
        data.passClaimed.push(idx);
        grantReward(t.reward);
        n++;
      }
    });
    if (n) save();
    return n;
  }
  function claimSeasonAll() {
    let n = 0;
    DAT.SEASON_TIERS.forEach((t, idx) => {
      if (data.seasonClaimed.indexOf(idx) === -1 && totalXp() >= t.xp) {
        data.seasonClaimed.push(idx);
        grantReward(t.reward);
        n++;
      }
    });
    if (n) save();
    return n;
  }

  /* --- Reset --- */
  function reset() { data = defaults(); ensurePassSeason(); save(); return data; }

  function get() { return data; }

  const SAVE = {
    load, save, get, defaults,
    addCoins, spendCoins, addXp, xpFor,
    skinXp, addSkinXp, skinStage, openBox,
    endRun, setCombo, buy, equip, checkAch, setSetting, reset, owns, endTimeRun,
    buyTool, itemCount, toolLevel, toolUpPrice, upToolLevel, toolModeVal, setToolMode, noteToolUse,
    unlockAll, giveTools, giveAllUpg, achAll, chalReset, adminSetStreak,
    dailyInfo, claimDaily, addBest,
    challengePlayedToday, recordChallenge, dailyHistory, seedToday,
    levelInfo, setLevelStage, recordLevel,
    storeReplay, getReplay, markReplayWatched,
    missionProgress, missionDoneToday, claimMission,
    totalXp, passReached, passClaimedCount, claimPassTier, passSeasonName,
    seasonReached, seasonClaimCount, claimSeasonTier,
    setLevel, claimPassAll, claimSeasonAll
  };
  return SAVE;
})();