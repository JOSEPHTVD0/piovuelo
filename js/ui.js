/* Interfaz: pantallas, tienda, mapas, progreso, ajustes, modales, toasts */
window.UI = (function () {
  'use strict';

  const $ = id => document.getElementById(id);

  let currentGeneric = null;

  function hideAllScreens() {
    ['screen-loading', 'screen-home', 'screen-pause', 'screen-over', 'screen-cleared', 'screen-generic'].forEach(id => {
      $(id).classList.add('hidden');
    });
  }

  // Animación del ave equipada en la pantalla de inicio
  let homeRaF = null;
  function startHomeAnim() {
    const cv = document.getElementById('homeBird');
    if (!cv || homeRaF) return;
    const c = cv.getContext('2d');
    const frame = ms => {
      const home = document.getElementById('screen-home');
      if (!home || home.classList.contains('hidden') || !document.getElementById('homeBird')) { homeRaF = null; return; }
      c.clearRect(0, 0, cv.width, cv.height);
      const s = SAVE.get();
      const skin = DAT.getSkin(s.skin);
      const hat = s.hat ? DAT.getHat(s.hat) : null;
      const fx = DAT.getFx(s.fx);
      const bob = Math.sin(ms / 240) * 5;
      const flap = 0.62 + 0.38 * Math.sin(ms / 95);
      if (fx && fx.color) {
        c.globalAlpha = 0.2;
        for (let i = 1; i <= 5; i++) {
          c.fillStyle = fx.color;
          c.beginPath();
          c.arc(84 - i * 10, 66 + bob * 0.4 + (i % 2 ? -4 : 5), 12 - i * 1.9, 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
      }
      ENTS.drawBird(c, 84, 68 + bob, {
        skin: skin, hat: hat, t: ms / 600,
        wingPhase: flap, squash: 1, rot: Math.sin(ms / 420) * 0.05, r: 22,
        stage: SAVE.skinStage(s.skin),
        golden: !!skin.golden
      });
      homeRaF = requestAnimationFrame(frame);
    };
    homeRaF = requestAnimationFrame(frame);
  }

  function showLoading() {
    hideAllScreens();
    $('screen-loading').classList.remove('hidden');
  }

  function showHome() {
    hideAllScreens();
    $('screen-home').classList.remove('hidden');
    refreshHome();
    startHomeAnim();
    $('screen-generic').classList.add('hidden');
  }

  function refreshHome() {
    const s = SAVE.get();
    $('homeCoins').textContent = s.coins;
    $('homeBest').textContent = s.stats.best;
    $('homeLevel').textContent = 'Nv. ' + s.level;
    const cur = SAVE.xpFor(s.level);
    $('homeXp').style.width = Math.min(100, Math.round(s.xp / cur * 100)) + '%';
    const stop = document.getElementById('homeSoundIco');
    stop.textContent = s.set.sfx ? '🔊' : '🔇';
    // selector de modo
    const mdFree = document.getElementById('mdFree');
    const mdTime = document.getElementById('mdTime');
    const mdDuel = document.getElementById('mdDuel');
    const mdLevels = document.getElementById('mdLevels');
    const m = G.getMode();
    if (mdFree) mdFree.classList.toggle('active', m === 'free');
    if (mdTime) mdTime.classList.toggle('active', m === 'time');
    if (mdDuel) mdDuel.classList.toggle('active', m === 'duel');
    if (mdLevels) mdLevels.classList.toggle('active', m === 'levels');
    const tag = document.getElementById('mdTimeTag');
    if (tag) {
      const bt = s.stats && s.stats.timeBest;
      tag.textContent = bt ? '· Mejor ' + fmtShort(bt) : '';
    }
    const tagDuel = document.getElementById('mdDuelTag');
    if (tagDuel) {
      const dw = s.stats.duelWins || 0;
      tagDuel.textContent = dw ? '· 🏆 ' + dw : '';
    }
    const tagLevels = document.getElementById('mdLevelsTag');
    if (tagLevels) {
      const ls = s.stats.levelStars || 0;
      tagLevels.textContent = ls ? '· ⭐ ' + ls : '';
    }
    const btnReplay = document.getElementById('btnReplay');
    if (btnReplay) {
      const rp = s.replay;
      if (rp) {
        btnReplay.classList.remove('hidden');
        btnReplay.textContent = '🎬 Replay · ' + rp.score + ' pts';
      } else {
        btnReplay.classList.add('hidden');
      }
    }
    drawDaily();
    drawDailyRun();
    drawHomeTools();
  }

  function fmtShort(x) {
    const m = Math.floor(x / 60);
    const s = Math.floor(x % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function drawDailyRun() {
    const el = document.getElementById('dailyRunPill');
    if (!el) return;
    if (SAVE.challengePlayedToday()) {
      el.textContent = '🌱 Semilla ' + SAVE.seedToday() + ' · Récord: ' + SAVE.get().dailyC.best + ' pts';
      el.classList.add('done');
    } else {
      el.textContent = '🌱 Semilla del día · +hasta 150 🪙';
      el.classList.remove('done');
    }
  }

  function drawHomeTools() {
    const el = document.getElementById('homeTools');
    if (!el) return;
    const it = SAVE.get().items || {};
    const parts = [];
    DAT.TOOLS.forEach(t => { if ((it[t.key] || 0) > 0) parts.push(t.icon + ' x' + it[t.key]); });
    if (parts.length) {
      el.textContent = '🎒 ' + parts.join(' ');
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  function drawDaily() {
    const el = $('dailyPill');
    if (!el) return;
    const info = SAVE.dailyInfo();
    if (info.ready) {
      const bonus = info.streak % 7 === 0 ? 50 : 0;
      el.classList.remove('hidden');
      el.textContent = '🎁 Recompensa diaria: +' + (20 + info.streak * 10 + bonus) + ' 🪙' + (bonus ? ' (+' + bonus + ' bono)' : '') + ' · 🔥 ' + info.streak + ' día' + (info.streak === 1 ? '' : 's');
    } else {
      el.classList.add('hidden');
    }
  }

  /* ---------- HUD ---------- */
  function setHudVisible(v) { $('hud').classList.toggle('hidden', !v); }
  function showStartHint(v) { $('start-hint').classList.toggle('hidden', !v); }

  /* Barra de herramientas manuales en vuelo (un botón por herramienta armada).
   Solo se reconstruye cuando cambia la lista o su cantidad (no en cada frame). */
  function refreshHudTools() {
    const bar = document.getElementById('hudTools');
    if (!bar) return;
    const list = G && G.manualToolList ? G.manualToolList() : [];
    if (G && G.isPlay() && list.length) {
      const sig = list.map(t => t.key + ':' + SAVE.itemCount(t.key)).join('|');
      bar.classList.remove('hidden');
      if (bar._sig === sig) return;
      bar._sig = sig;
      bar.innerHTML = '';
      list.forEach(t => {
        const b = document.createElement('button');
        b.className = 'hud-btn hud-tb';
        b.setAttribute('aria-label', t.name);
        b.innerHTML = t.icon + '<span class="t-cnt">' + SAVE.itemCount(t.key) + '</span>';
        b.onclick = () => {
          SND.sfx.click();
          G.useBagTool(t.key);
        };
        bar.appendChild(b);
      });
    } else {
      bar._sig = '';
      bar.classList.add('hidden');
    }
  }

  /* ---------- Pausa ---------- */
  function setPaused(p) {
    $('screen-pause').classList.toggle('hidden', !p);
    showStartHint(p ? false : !!(G.waitingFly && G.waitingFly()));
    if (p) {
      const ps = $('pauseStats');
      if (ps) ps.textContent = '🪙 ' + G.getScore() + ' pts · ' + G.getDist() + ' m';
    }
  }

  /* ---------- Game over ---------- */
  function showGameOver(score, best, coinsGot, pipesPassed, dist, isRecord, ach, levelUps) {
    $('overScore').textContent = score;
    $('overBest').textContent = best;
    $('overCoins').textContent = coinsGot;
    $('overDist').textContent = dist + ' m';
    const msgEl = document.getElementById('overMsg');
    const titleEl = $('screen-over').querySelector('h2');
    titleEl.textContent = 'GAME OVER';
    if (score >= 50) msgEl.textContent = '¡Leyenda del cielo! 🌟';
    else if (score >= 30) msgEl.textContent = '¡Vuelo dominado! 🏆';
    else if (score >= 15) msgEl.textContent = '¡Buen vuelo! 👏';
    else if (score >= 5) msgEl.textContent = '¡Buen comienzo! 🌱';
    else msgEl.textContent = '¡Sigue practicando! 💪';
    const medal = document.getElementById('overMedal');
    if (isRecord) { medal.textContent = '👑'; SND.sfx.medal(); }
    else if (score >= 50) medal.textContent = '🥇';
    else if (score >= 30) medal.textContent = '🥈';
    else if (score >= 15) medal.textContent = '🥉';
    else medal.textContent = '';
    const lu = document.getElementById('overLevelup');
    lu.classList.toggle('hidden', !(levelUps > 0));
    $('screen-over').classList.remove('hidden');
    ach.forEach(a => popAch(a));
  }

  /* ---------- Contrarreloj superado ---------- */
  function showTimeClear(elapsed, best, isRecord, reward, xpGain, lvUps, ach) {
    buildClear({
      title: isRecord ? '¡CONTRARRELÓJ SUPERADO! · NUEVO RÉCORD' : '¡CONTRARRELÓJ SUPERADO!',
      lvLbl: 'Tiempo', lv: fmtShort(elapsed),
      tgtLbl: 'Récord', tgt: (best ? fmtShort(best) : '—'),
      reward: reward, xp: xpGain, lvUps: lvUps, ach: ach,
      stars: isRecord ? '🏅 ¡NUEVO RÉCORD!' : '⭐⭐⭐',
      btn: '🔄 VOLVER A VOLAR'
    });
  }

  /* Pantalla de victoria genérica (Contrarreloj / Duelo / Niveles) */
  function showModeClear(o) { buildClear(o); }

  function buildClear(o) {
    $('clearTitle').textContent = o.title;
    $('clearStars').textContent = o.stars;
    const lvL = document.getElementById('clearLbl');
    const tgL = document.getElementById('clearTgtLbl');
    if (lvL) lvL.textContent = o.lvLbl;
    if (tgL) tgL.textContent = o.tgtLbl;
    $('clearLevel').textContent = o.lv;
    $('clearTarget').textContent = o.tgt;
    $('clearReward').textContent = '+' + o.reward + ' 🪙';
    $('clearXp').textContent = '+' + o.xp + ' XP';
    const lu = document.getElementById('clearLevelup');
    lu.classList.toggle('hidden', !(o.lvUps > 0));
    const next = $('btnNextLevel');
    next.textContent = o.btn || '🔄 VOLVER A VOLAR';
    SND.sfx.achieve();
    hideAllScreens();
    $('screen-cleared').classList.remove('hidden');
    (o.ach || []).forEach(a => popAch(a));
  }

  /* ---------- Popup de logros: encima de todo, uno a uno ---------- */
  const achQueue = [];
  let achBusy = false;

  function popAch(ach) {
    achQueue.push(ach);
    if (!achBusy) nextAch();
  }

  function nextAch() {
    if (!achQueue.length) { achBusy = false; return; }
    achBusy = true;
    const a = achQueue.shift();
    const el = $('achPopup');
    const nm = el.querySelector('.ach-name');
    const sb = el.querySelector('.ach-sub');
    if (nm) nm.textContent = a.name;
    if (sb) sb.textContent = '+' + a.reward + ' 🪙 por este logro';
    SND.sfx.achieve();
    el.classList.remove('hidden');
    el.classList.remove('pop-in');
    void el.offsetWidth;
    el.classList.add('pop-in');
    setTimeout(() => {
      el.classList.add('hidden');
      setTimeout(nextAch, 300);
    }, 2800);
  }

  /* ---------- Toast ---------- */
  const MAX_TOASTS = 3; // máx. visibles para no llenar la pantalla
  function toast(msg, type) {
    const wrap = $('toastWrap');
    // quitar los más antiguos sobrantes de golpe (sin acumular cosas viejas)
    while (wrap.childElementCount >= MAX_TOASTS) {
      const old = wrap.firstElementChild;
      if (old) old.remove();
    }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .4s, transform .4s';
      el.style.opacity = '0'; el.style.transform = 'translateY(-14px)';
      setTimeout(() => el.remove(), 400);
    }, 2400);
  }

  /* ---------- Modal ---------- */
  function confirm(title, text, actions) {
    $('modalTitle').textContent = title;
    $('modalText').textContent = text;
    const box = $('modalActions');
    box.innerHTML = '';
    actions.forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.style || '');
      b.textContent = a.label;
      b.onclick = () => { $('modal').classList.add('hidden'); if (a.cb) a.cb(); };
      box.appendChild(b);
    });
    $('modal').classList.remove('hidden');
  }

  /* ---------- Navegación genérica ---------- */
  function openGeneric(kind, tab) {
    currentGeneric = kind;
    $('screen-generic').classList.remove('hidden');
    $('genBody').innerHTML = '';
    const titles = { shop: 'TIENDA', maps: 'MAPAS', progress: 'PROGRESO', settings: 'AJUSTES', ach: 'LOGROS', missions: 'MISIONES 📋', pass: 'PASE DE VUELO 🎫', levels: 'NIVELES 🌟' };
    $('genTitle').textContent = titles[kind] || '';
    $('genCoins').textContent = SAVE.get().coins;
    switch (kind) {
      case 'shop': renderShop(tab); break;
      case 'maps': renderMaps(); break;
      case 'progress': renderProgress(); break;
      case 'settings': renderSettings(); break;
      case 'missions': renderMissions(); break;
      case 'pass': renderPass(); break;
      case 'levels': renderLevels(); break;
      default: break;
    }
    $('genBody').scrollTop = 0;
  }

  function closeGeneric() {
    const inGame = G.getState() === 'play';
    currentGeneric = null;
    hideAllScreens();
    if (inGame) {
      // Se entró a ajustes desde la pausa: el juego queda donde estaba, sin reiniciarse
      if (G.isPaused()) $('screen-pause').classList.remove('hidden');
    } else {
      showHome();
    }
  }

  /* ---------- TIENDA ---------- */
  function nextWeekPreview() {
    const wk = DAT.curWeek() + 1;
    const acc = [];
    DAT.SKINS.forEach(o => { if (o.week === wk) acc.push({ i: '🐤', n: o.name }); });
    DAT.HATS.forEach(o => { if (o.week === wk) acc.push({ i: '👒', n: o.name }); });
    DAT.EFFECTS.forEach(o => { if (o.week === wk) acc.push({ i: '✨', n: o.name }); });
    DAT.TOOLS.forEach(o => { if (o.week === wk) acc.push({ i: o.icon, n: o.name }); });
    DAT.MAPS.forEach(o => { if (o.week === wk) acc.push({ i: o.icon, n: o.name }); });
    if (!acc.length) return null;
    return '📅 Próxima semana (Semana ' + wk + '): ' + acc.map(x => x.i + ' ' + x.n).join(' · ');
  }

  function renderShop(initialCat) {
    const body = $('genBody');
    const tabs = document.createElement('div');
    tabs.className = 'tabs shop-tabs';
    const cats = [['skins', '🐤', 'Aves'], ['hats', '🎩', 'Sombreros'], ['fx', '💫', 'Estelas'], ['tools', '🎒', 'Herramientas'], ['box', '🥚', 'Cajas']];
    let activeCat = (initialCat && cats.some(c => c[0] === initialCat)) ? initialCat : 'skins';
    const tabEls = [];
    cats.forEach(c => {
      const b = document.createElement('button');
      b.className = 'tab' + (c[0] === activeCat ? ' active' : '');
      const ownedCount = c[0] === 'skins' ? SAVE.get().skinsOwned.length
        : c[0] === 'hats' ? SAVE.get().hatsOwned.length
        : c[0] === 'fx' ? SAVE.get().fxOwned.length
        : c[0] === 'box' ? (SAVE.get().stats.boxesBought || 0)
        : itemTotal();
      b.innerHTML = '<span class="tab-ico">' + c[1] + '</span><span class="tab-t">' + c[2] + '</span><span class="tab-cnt">' + ownedCount + '</span>';
      b.dataset.cat = c[0];
      b.onclick = () => {
        activeCat = c[0];
        tabEls.forEach(x => x.classList.toggle('active', x === b));
        drawShopPrev(activeCat, equippedFor(activeCat));
        drawShopItems(activeCat);
        $('genBody').scrollTop = 0;
        SND.sfx.click();
      };
      tabEls.push(b);
      tabs.appendChild(b);
    });
    body.appendChild(tabs);

    // Mi equipo: acceso rápido a lo equipado (avisar ya / cambiarlo)
    const s = SAVE.get();
    const load = document.createElement('div');
    load.className = 'shop-load';
    const mkChip = (cat, ico, name) => {
      const c = document.createElement('button');
      c.className = 'sl-chip';
      c.innerHTML = '<span class="sl-ico">' + ico + '</span><span class="sl-name"></span>';
      c.dataset.cat = cat;
      c.onclick = () => {
        activeCat = cat;
        tabEls.forEach(x => x.classList.toggle('active', x.dataset.cat === cat));
        drawShopPrev(activeCat, equippedFor(activeCat));
        drawShopItems(activeCat);
        $('genBody').scrollTop = 0;
        SND.sfx.click();
      };
      c.querySelector('.sl-name').textContent = name;
      load.appendChild(c);
      return c;
    };
    mkChip('skins', '🐤', DAT.getSkin(s.skin).name);
    mkChip('hats', '🎩', s.hat ? DAT.getHat(s.hat).name : 'Sin sombrero');
    mkChip('fx', '💫', DAT.getFx(s.fx).name);
    body.appendChild(load);

    const info = document.createElement('div');
    info.className = 'panel-note week-note';
    info.textContent = nextWeekPreview() || '📅 Hoy es la Semana ' + DAT.curWeek() + ' · cada semana se habilitan 2 ítems nuevos.';
    body.appendChild(info);

    const panel = document.createElement('div');
    panel.className = 'shop-prev';
    panel.innerHTML =
      '<canvas id="shopPrevCv" width="150" height="112"></canvas>' +
      '<div class="shop-prev-i"><div id="shopPrevName" class="shop-prev-name"></div>' +
      '<div id="shopPrevSub" class="shop-prev-sub"></div></div>';
    body.appendChild(panel);
    drawShopPrev(activeCat, equippedFor(activeCat));

    const grid = document.createElement('div');
    grid.className = 'items';
    grid.id = 'shopGrid';
    body.appendChild(grid);
    drawShopItems(activeCat);
  }

  // ítem equipado para previsualizar al cambiar de pestaña
  function equippedFor(cat) {
    const s = SAVE.get();
    if (cat === 'skins') return DAT.getSkin(s.skin);
    if (cat === 'hats') return s.hat ? DAT.getHat(s.hat) : null;
    if (cat === 'fx') return DAT.getFx(s.fx);
    return null;
  }

  // actualiza la barra "Mi equipo" tras equipar/comprar
  function updateShopLoad() {
    const s = SAVE.get();
    document.querySelectorAll('.sl-chip').forEach(ch => {
      const c = ch.dataset.cat;
      const nm = c === 'skins' ? DAT.getSkin(s.skin).name
        : c === 'hats' ? (s.hat ? DAT.getHat(s.hat).name : 'Sin sombrero')
        : DAT.getFx(s.fx).name;
      const e = ch.querySelector('.sl-name');
      if (e) e.textContent = nm;
    });
  }

  function drawShopPrev(cat, item) {
    const s = SAVE.get();
    const cv = $('shopPrevCv');
    const c = cv.getContext('2d');
    const w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    if (cat === 'box') {
      const def = DAT.boxDef();
      ENTS.drawBird(c, w / 2, h / 2 + 2, { skin: DAT.getSkin(s.skin), hat: 'hat-huevo', t: 1.2, wingPhase: 1.1, squash: 1, rot: 0, r: 17 });
      $('shopPrevName').textContent = '🥚 ' + def.name;
      $('shopPrevSub').textContent = def.desc;
      return;
    }
    const skin = cat === 'skins' ? (item || DAT.getSkin(s.skin)) : DAT.getSkin(s.skin);
    const hatId = cat === 'hats' ? (item ? item.id : s.hat) : s.hat;
    const hat = hatId ? DAT.getHat(hatId) : null;
    const fx = cat === 'fx' ? (item || DAT.getFx(s.fx)) : DAT.getFx(s.fx);
    if (fx && fx.color) {
      c.globalAlpha = 0.16;
      c.fillStyle = fx.color;
      for (let i = 1; i <= 5; i++) {
        c.beginPath();
        c.arc(w / 2 - 7 - i * 10, h / 2 + (i % 2 === 0 ? -3 : 5), 15 - i * 2.4, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      if (fx.stars) {
        c.globalAlpha = 0.95;
        c.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.arc(w / 2 - 56 + i * 40, 10 + (i % 2) * 12, 1.7, 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
      }
    }
    ENTS.drawBird(c, w / 2, h / 2 + 2, { skin, hat: hatId, t: 1.2, wingPhase: 1.1, squash: 1, rot: 0, r: 17, stage: SAVE.skinStage(skin.id), golden: !!skin.golden });
    const equals = cat === 'skins' ? s.skin : cat === 'hats' ? s.hat : s.fx;
    const isEquipped = item ? equals === item.id : true;
    let name;
    if (cat === 'tools') name = item ? item.name : 'Bolsa de herramientas';
    else if (item) name = item.name;
    else if (cat === 'skins') name = skin.name;
    else if (cat === 'hats') name = hat ? hat.name : 'Sin sombrero';
    else name = fx.name;
    $('shopPrevName').textContent = (item && isEquipped ? '✔ ' : '') + name;
    let sub;
    if (cat === 'tools') {
      sub = item ? item.desc + ' · 🎒 x' + SAVE.itemCount(item.key)
        : DAT.TOOLS.map(tn => tn.icon + ' x' + SAVE.itemCount(tn.key)).join('  ');
    } else if (item) {
      sub = cat === 'skins' ? (item.desc || '') : cat === 'fx' ? (fx.color ? 'Deja un rastro de color al volar.' : 'Vuela sin dejar estela.') : 'El toque perfecto para Pío.';
      if (item.week && !DAT.isUnlocked(item) &&
        !SAVE.owns(cat === 'skins' ? s.skinsOwned : cat === 'hats' ? s.hatsOwned : s.fxOwned, item.id)) {
        sub += ' · 🔒 Se habilita en la ' + DAT.weekLabel(item);
      } else if (!isEquipped) sub += ' · 👆 Toca la figura para probarla gratis';
    } else {
      sub = 'En uso: ' + skin.name + ' · ' + (hat ? hat.name : 'Sin sombrero') + ' · ' + fx.name;
    }
    if (cat === 'skins') {
      const cur = item || skin;
      const badges = statBadges(cur);
      if (badges) sub += (sub ? ' · ' : '') + badges;
      if (SAVE.owns(s.skinsOwned, cur.id)) sub += (sub ? ' · ' : '') + '⭐ Etapa ' + SAVE.skinStage(cur.id) + ' (XP ' + SAVE.skinXp(cur.id) + ')';
      if (cur.golden) sub += (sub ? ' · ' : '') + '✨ Dorada';
    }
    $('shopPrevSub').textContent = sub;
  }

  // Insignias de atributos del ave (data.js SKIN_STATS)
  function statBadges(sk) {
    if (!sk || !sk.stats) return '';
    const MET = { spd: '⚡ Vel', flap: '🪶 Aleteo', grav: '🪂 Caída', gap: '⭕ Huecos' };
    const parts = [];
    Object.keys(sk.stats || {}).forEach(k => {
      const v = sk.stats[k] || 1;
      if (v !== 1) {
        const pct = Math.round(Math.abs(v - 1) * 100);
        parts.push(MET[k] + ' ' + (v > 1 ? '+' : '-') + pct + '%');
      }
    });
    return parts.join(' · ');
  }

  function drawShopItems(cat) {
    const grid = $('shopGrid');
    grid.innerHTML = '';
    if (cat === 'tools') { drawToolsItems(); return; }
    if (cat === 'box') { drawBoxItems(); return; }
    const s = SAVE.get();
    const list = cat === 'skins' ? DAT.SKINS : cat === 'hats' ? DAT.HATS : DAT.EFFECTS;
    const ownedList = cat === 'skins' ? s.skinsOwned : cat === 'hats' ? s.hatsOwned : s.fxOwned;
    const equals = cat === 'skins' ? s.skin : cat === 'hats' ? s.hat : s.fx;

    // Organización: colección (en uso primero) · disponibles para comprar · bloqueadas por semana
    const owned = [], avail = [], lockedByWeek = {};
    list.forEach(item => {
      if (SAVE.owns(ownedList, item.id)) owned.push(item);
      else if (item.week && !DAT.isUnlocked(item)) (lockedByWeek[item.week] = lockedByWeek[item.week] || []).push(item);
      else avail.push(item);
    });
    owned.sort((a, b) => (a.id === equals ? -1 : b.id === equals ? 1 : 0));
    avail.sort((a, b) => a.price - b.price);
    const weekKeys = Object.keys(lockedByWeek).sort((a, b) => +a - +b);

    function addHeader(text, cls) {
      const h = document.createElement('div');
      h.className = 'shop-sec' + (cls ? ' ' + cls : '');
      h.textContent = text;
      grid.appendChild(h);
    }

    function addItem(item) {
      const isEquipped = equals === item.id;
      const locked = lockedByWeek[item.week];
      const div = document.createElement('div');
      div.className = 'item' + (isEquipped ? ' equipped' : '') + (locked ? ' locked-week' : '') + ((!SAVE.owns(ownedList, item.id) && s.coins < item.price) ? ' cant-afford' : '');
      const art = document.createElement('div');
      art.className = 'i-art';
      const cv = document.createElement('canvas');
      cv.width = 104; cv.height = 68;
      const c = cv.getContext('2d');
      const skin = cat === 'skins' ? item : DAT.getSkin(s.skin);
      const hat = cat === 'hats' ? item.id : (cat === 'skins' && s.hat ? s.hat : null);
      ENTS.drawBird(c, 52, 40, { skin, hat: hat, t: 1, wingPhase: 0.5, squash: 1, rot: 0, r: 19, stage: cat === 'skins' ? SAVE.skinStage(item.id) : 0, golden: !!skin.golden });
      art.appendChild(cv);
      art.onclick = (ev) => {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        drawShopPrev(cat, item);
        SND.sfx.click();
      };
      div.appendChild(art);
      const nm = document.createElement('div');
      nm.className = 'i-name'; nm.textContent = item.name + (cat === 'skins' && SAVE.owns(ownedList, item.id) && !item.golden && SAVE.skinStage(item.id) >= 2 ? ' ⭐' + SAVE.skinStage(item.id) : '');
      div.appendChild(nm);
      const pr = document.createElement('div');
      pr.className = 'i-price';
      if (locked) {
        pr.innerHTML = '🔒 Semana ' + item.week;
        pr.style.color = '#8aa0cc';
        div.appendChild(pr);
        div.onclick = (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); toast('Se habilitará en la Semana ' + item.week, 'info'); };
      } else if (!SAVE.owns(ownedList, item.id)) {
        pr.innerHTML = '<div class="coin-ico"></div> ' + item.price + ' · Comprar';
        if (s.coins < item.price) pr.style.color = '#ff8a80';
        div.appendChild(pr);
        div.onclick = () => buyItem(cat, item, ownedList);
      } else if (isEquipped) {
        pr.innerHTML = '✔ En uso';
        pr.style.color = '#69f0ae';
        div.appendChild(pr);
      } else {
        pr.innerHTML = '👆 Usar';
        pr.style.color = '#cdefff';
        div.appendChild(pr);
        div.onclick = () => {
          SAVE.equip(cat === 'hats' ? 'hat' : cat === 'fx' ? 'fx' : 'skin', item.id);
          SND.sfx.click();
          drawShopItems(cat);
          drawShopPrev(cat, item);
          updateShopLoad();
          refreshHome();
          toast('✓ ' + item.name + ' equipado', 'good');
        };
      }
      grid.appendChild(div);
    }

    function drawGroup(group, header, cls) {
      if (!group || !group.length) return;
      addHeader((header || '') + ' · ' + group.length, cls);
      group.forEach(addItem);
    }

    if (owned.length) drawGroup(owned, '⭐ Colección', 'shop-sec-own');
    drawGroup(avail, '🛒 Comprar');
    weekKeys.forEach(w => drawGroup(lockedByWeek[w], '🔒 Semana ' + w, 'shop-sec-lock'));

    // Variantes doradas conseguidas (año de oro)
    if (cat === 'skins') {
      const golds = (s.skinsOwned || []).filter(e => /-gold$/.test(e.id));
      if (golds.length) {
        addHeader('✨ Doradas · ' + golds.length, 'shop-sec-gold');
        golds.forEach(e => {
          const g = DAT.getSkin(e.id);
          if (!g) return;
          const isEq = s.skin === g.id;
          const dv = document.createElement('div');
          dv.className = 'item gold-item' + (isEq ? ' equipped' : '');
          const art2 = document.createElement('div');
          art2.className = 'i-art';
          const cv2 = document.createElement('canvas');
          cv2.width = 104; cv2.height = 68;
          const c2 = cv2.getContext('2d');
          const goldStage = SAVE.skinStage(g.id);
          ENTS.drawBird(c2, 52, 40, { skin: g, hat: s.hat || null, t: 1, wingPhase: 0.5, squash: 1, rot: 0, r: 19, stage: goldStage, golden: true });
          art2.appendChild(cv2);
          art2.onclick = (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); drawShopPrev('skins', g); SND.sfx.click(); };
          dv.appendChild(art2);
          const nm2 = document.createElement('div');
          nm2.className = 'i-name'; nm2.textContent = g.name + (goldStage >= 2 ? ' ⭐' + goldStage : '');
          dv.appendChild(nm2);
          const pr2 = document.createElement('div');
          pr2.className = 'i-price';
          if (isEq) { pr2.innerHTML = '✔ En uso'; pr2.style.color = '#69f0ae'; }
          else {
            pr2.innerHTML = '👆 Usar'; pr2.style.color = '#ffe066';
            dv.onclick = () => {
              SAVE.equip('skin', g.id);
              SND.sfx.click();
              drawShopItems(cat); drawShopPrev('skins', g); updateShopLoad(); refreshHome();
              toast('✓ ' + g.name + ' equipada', 'good');
            };
          }
          dv.appendChild(pr2);
          grid.appendChild(dv);
        });
      }
    }
  }

  function drawBoxItems() {
    const grid = $('shopGrid');
    grid.innerHTML = '';
    const def = DAT.boxDef();
    const s = SAVE.get();
    const nGold = (s.skinsOwned || []).filter(e => /-gold$/.test(e.id)).length;
    const pool = DAT.SKINS.length + DAT.HATS.length + DAT.EFFECTS.length;
    const owned = s.skinsOwned.length + s.hatsOwned.length + s.fxOwned.length;
    const falta = Math.max(0, pool - owned);
    const dv = document.createElement('div');
    dv.className = 'item item-tool gold-item shop-box';
    const art = document.createElement('div');
    art.className = 'i-art i-art-tool box-ico';
    art.textContent = '🥚';
    dv.appendChild(art);
    const nm = document.createElement('div');
    nm.className = 'i-name'; nm.textContent = def.name;
    dv.appendChild(nm);
    const ds = document.createElement('div');
    ds.className = 'i-desc'; ds.textContent = def.desc;
    dv.appendChild(ds);
    const stats = document.createElement('div');
    stats.className = 'shop-box-stats';
    stats.innerHTML =
      '<span class="bs b1">🎁 Abiertas <b>' + (s.stats.boxesBought || 0) + '</b></span>' +
      '<span class="bs b2">✨ Doradas <b>' + nGold + '</b></span>' +
      '<span class="bs b3">💤 Faltan <b>' + falta + '</b></span>';
    dv.appendChild(stats);
    const bb = document.createElement('button');
    bb.className = 'btn btn-small btn-buy box-buy';
    bb.innerHTML = '<div class="coin-ico"></div> ' + def.price + ' · 🎁 Abrir';
    bb.onclick = (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); buyBox(); };
    dv.appendChild(bb);
    grid.appendChild(dv);
  }

  function buyBox() {
    const def = DAT.boxDef();
    const s = SAVE.get();
    if (s.coins < def.price) { SND.sfx.deny(); toast('No te alcanzan las monedas para la ' + def.name + ' (' + def.price + ' 🪙)', 'info'); return; }
    const r = SAVE.openBox();
    if (!r || !r.ok) { toast('Algo salió mal abriendo la caja', ''); return; }
    SND.sfx.buy();
    FX.confetti(400, 150);
    if (r.kind === 'gold') {
      SAVE.equip('skin', r.item.id);
      toast('🏆 ¡' + r.item.name + '! Variante dorada ✨ (equipada)', 'good');
      updateShopLoad();
      refreshHome();
    } else if (r.kind === 'coins') {
      toast('🎁 Consolación: +' + r.amount + ' 🪙 (ya lo tienes todo)', 'good');
    } else {
      const pfx = r.kind === 'skin' ? '🐤 ' : r.kind === 'hat' ? '🎩 ' : '💫 ';
      toast('🥚 ¡Conseguiste ' + pfx + r.item.name + '!', 'good');
    }
    drawShopItems('box');
    drawShopPrev('box', null);
    refreshHome();
    SAVE.checkAch().forEach(a => popAch(a));
  }

  function itemTotal() {
    const it = SAVE.get().items || {};
    let n = 0;
    DAT.TOOLS.forEach(t => { n += (it[t.key] || 0); });
    return n;
  }

  function drawToolsItems() {
    const grid = $('shopGrid');
    grid.innerHTML = ''; // la grilla se rellena de cero (compra/mejora re-invocan esto)
    const s = SAVE.get();
    DAT.TOOLS.forEach(tool => {
      const div = document.createElement('div');
      div.className = 'item item-tool';
      const art = document.createElement('div');
      art.className = 'i-art i-art-tool';
      art.textContent = tool.icon;
      art.onclick = (ev) => {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        drawShopPrev('tools', tool);
        SND.sfx.click();
      };
      div.appendChild(art);
      const nm = document.createElement('div');
      nm.className = 'i-name'; nm.textContent = tool.name + levelStars(tool.key);
      div.appendChild(nm);
      const ds = document.createElement('div');
      ds.className = 'i-desc'; ds.textContent = tool.desc + upgradeHint(tool.key);
      div.appendChild(ds);

      if (tool.week && !DAT.isUnlocked(tool)) {
        const lk = document.createElement('div');
        lk.className = 'i-price';
        lk.innerHTML = '🔒 Semana ' + tool.week;
        lk.style.color = '#8aa0cc';
        div.appendChild(lk);
        grid.appendChild(div);
        return;
      }

      const buyBtn = document.createElement('button');
      buyBtn.className = 'btn btn-small btn-buy';
      const pos = SAVE.itemCount(tool.key);
      buyBtn.innerHTML = '<div class="coin-ico"></div> ' + tool.price + ' · +1 🎒x' + pos;
      buyBtn.onclick = (ev) => { if (ev.stopPropagation) ev.stopPropagation(); buyToolItem(tool); };
      div.appendChild(buyBtn);

      const modeRow = document.createElement('div');
      modeRow.className = 'tool-row';
      const autoB = document.createElement('button');
      const manB = document.createElement('button');
      autoB.className = 'chip' + (SAVE.toolModeVal(tool.key) === 'auto' ? ' on' : '');
      manB.className = 'chip' + (SAVE.toolModeVal(tool.key) === 'manual' ? ' on' : '');
      autoB.textContent = '🅰 Auto (al inicio)';
      manB.textContent = '👆 Manual (en vuelo)';
      autoB.onclick = (ev) => { if (ev.stopPropagation) ev.stopPropagation(); SAVE.setToolMode(tool.key, 'auto'); drawToolsItems(); refreshHome(); SND.sfx.click(); toast(tool.name + ': se activa sola al empezar', 'info'); };
      manB.onclick = (ev) => { if (ev.stopPropagation) ev.stopPropagation(); SAVE.setToolMode(tool.key, 'manual'); drawToolsItems(); refreshHome(); SND.sfx.click(); toast(tool.name + ': la activas tú con el botón 🛠', 'info'); };
      modeRow.appendChild(autoB);
      modeRow.appendChild(manB);
      div.appendChild(modeRow);

      const upRow = document.createElement('div');
      upRow.className = 'tool-row';
      const lv = SAVE.toolLevel(tool.key);
      const upBtn = document.createElement('button');
      if (lv >= 5) {
        upBtn.className = 'chip chip-max';
        upBtn.textContent = '⭐ Nivel MAX';
      } else {
        upBtn.className = 'chip chip-up';
        upBtn.innerHTML = '⬆ Mejorar · Nv ' + lv + ' → ' + (lv + 1) + ' <div class="coin-ico"></div> ' + SAVE.toolUpPrice(tool.key);
      }
      upBtn.onclick = (ev) => {
        if (ev.stopPropagation) ev.stopPropagation();
        const res = SAVE.upToolLevel(tool.key);
        if (!res.ok) {
          if (res.msg === 'max') { toast(tool.name + ' ya está al máximo ⭐', 'info'); }
          else { SND.sfx.deny(); toast('No tienes suficientes monedas 💤', ''); }
          return;
        }
        SND.sfx.buy();
        FX.confetti(400, 150);
        drawToolsItems(); refreshHome();
        const gc = $('genCoins');
        if (gc) gc.textContent = SAVE.get().coins;
        toast('⬆ ' + tool.name + ' mejorada a nivel ' + res.level, 'good');
        SAVE.checkAch().forEach(a => popAch(a));
      };
      upRow.appendChild(upBtn);
      div.appendChild(upRow);

      grid.appendChild(div);
    });
  }

  function levelStars(key) {
    const lv = SAVE.toolLevel(key);
    return lv > 0 ? ' ' + '⭐'.repeat(lv) : '';
  }
  function upgradeHint(key) {
    const lv = SAVE.toolLevel(key);
    if (lv <= 0) return '';
    const lvTxt = {
      magnet: ' · Más duración y atracción',
      slow: ' · Más duración',
      coins: ' · Más duración y +monedas',
      luck: ' · +más monedas',
      boost: ' · +más puntos',
      start: ' · +más puntos',
      score: ' · +más puntos',
      sprint: ' · Caída aún más ligera',
      treasure: ' · +más monedas',
      clock: ' · Más duración',
      turbo: ' · Más duración y velocidad',
      combo: ' · Más duración y +puntos',
      shield: ' · (siempre igual)',
      ghost: ' · Más duración',
      frenzy: ' · Más duración',
      eco: ' · +más monedas',
      hype: ' · (siempre igual)',
      bomb: ' · Más duración',
      aura: ' · Más duración',
      twin: ' · +más puntos',
      oasis: ' · (siempre igual)',
      doble: ' · (siempre igual)',
      runa: ' · +más XP',
      titan: ' · (siempre igual)',
      fenix: ' · (sin cambios)',
      bateria: ' · +más avance de barra',
      cris: ' · +más monedas'
    }[key] || '';
    return lvTxt;
  }

  function buyToolItem(tool) {
    const s = SAVE.get();
    if (s.coins < tool.price) {
      SND.sfx.deny();
      toast('No tienes suficientes monedas 💤', '');
      return;
    }
    const res = SAVE.buyTool(tool.id);
    if (res.ok) {
      SND.sfx.buy();
      FX.confetti(400, 150);
      drawToolsItems();
      drawShopPrev('tools', tool);
      refreshHome();
      const gc = $('genCoins');
      if (gc) gc.textContent = SAVE.get().coins;
      toast('🛠 +1 ' + tool.name + ' (🎒 x' + res.owned + ')', 'good');
      SAVE.checkAch().forEach(a => popAch(a));
    }
  }

  function buyItem(cat, item, ownedList) {
    const s = SAVE.get();
    const vt = cat === 'hats' ? 'hat' : cat === 'fx' ? 'fx' : 'skin';
    if (s.coins < item.price) {
      SND.sfx.deny();
      toast('No tienes suficientes monedas 💤', '');
      return;
    }
    const res = SAVE.buy(vt, item.id);
    if (res.ok) {
      SAVE.equip(vt, item.id);
      SND.sfx.buy();
      FX.confetti(400, 150);
      drawShopItems(cat);
      updateShopLoad();
      refreshHome();
      $('genCoins').textContent = SAVE.get().coins;
      toast('¡Compraste ' + item.name + '!', 'good');
      SAVE.checkAch().forEach(a => popAch(a));
    }
  }

  /* ---------- MAPAS ---------- */
  function renderMaps() {
    const body = $('genBody');
    body.innerHTML = ''; // re-entradas (comprar/usar) reconstruyen desde cero
    const info = document.createElement('div');
    info.className = 'panel-note week-note';
    info.textContent = nextWeekPreview() || '📅 Hoy es la Semana ' + DAT.curWeek() + ' · en su semana, los mapas se desbloquean solos aquí.';
    body.appendChild(info);
    const grid = document.createElement('div');
    grid.className = 'items';
    const s = SAVE.get();
    DAT.MAPS.forEach(m => {
      const div = document.createElement('div');
      div.className = 'item';
      const prev = document.createElement('div');
      prev.className = 'map-preview';
      prev.style.background = 'linear-gradient(180deg,' + m.sky[0] + ',' + m.sky[1] + ')';
      const nm = document.createElement('div');
      nm.className = 'm-name';
      nm.textContent = m.icon + ' ' + m.name + (s.map === m.id ? '  ✔' : '');
      prev.appendChild(nm);
      div.appendChild(prev);
      const owned = SAVE.owns(s.mapsOwned, m.id);
      const locked = !owned && m.week && !DAT.isUnlocked(m);
      if (locked) {
        const lock = document.createElement('div');
        lock.className = 'map-lock';
        lock.innerHTML = '<div class="lock-ico">📅</div><div class="ml-t">Semana ' + m.week + '</div>';
        prev.appendChild(lock);
        div.onclick = () => { SND.sfx.click(); toast('Se habilitará en la Semana ' + m.week, 'info'); };
      } else if (owned && s.map === m.id) {
        const pr = document.createElement('div');
        pr.className = 'i-price'; pr.innerHTML = 'En uso';
        pr.style.color = '#69f0ae';
        div.appendChild(pr);
      } else if (owned) {
        const pr = document.createElement('div');
        pr.className = 'i-price'; pr.innerHTML = 'Toque para usar';
        pr.style.color = '#cdefff';
        div.appendChild(pr);
        div.onclick = () => {
          SAVE.equip('map', m.id);
          BG.init(m.id); BG.reset();
          SND.sfx.click();
          renderMaps();
          toast('Mapa: ' + m.name, 'info');
        };
      } else {
        const canBuy = s.stats.best >= m.minScore;
        if (!canBuy) {
          const lock = document.createElement('div');
          lock.className = 'map-lock';
          lock.innerHTML = '<div class="lock-ico">🔒</div><div class="ml-t">Alcanza ' + m.minScore + ' pts</div>';
          prev.appendChild(lock);
          div.onclick = () => { SND.sfx.deny(); toast('Desbloquea ' + m.name + ' con ' + m.minScore + ' pts', ''); };
        } else {
          const pr = document.createElement('div');
          pr.className = 'i-price';
          pr.innerHTML = '<div class="coin-ico"></div> ' + m.price;
          div.appendChild(pr);
          div.onclick = () => {
            if (s.coins < m.price) { SND.sfx.deny(); toast('Necesitas más monedas para ' + m.name, ''); return; }
            const res = SAVE.buy('map', m.id);
            if (res.ok) {
              SAVE.equip('map', m.id);
              BG.init(m.id); BG.reset();
              SND.sfx.buy();
              renderMaps();
              $('genCoins').textContent = SAVE.get().coins;
              toast('¡Mapa desbloqueado: ' + m.name + '!', 'good');
            }
          };
        }
      }
      grid.appendChild(div);
    });
    body.appendChild(grid);
  }

  /* ---------- PROGRESO ---------- */
  function renderProgress() {
    const body = $('genBody');
    body.innerHTML = ''; // re-entradas (reclamar caja) no duplican
    const s = SAVE.get();
    const html = [];
    const top3 = s.best3 || [];
    html.push('<div class="prog-card prog-lv"><h3>NIVEL DE JUGADOR</h3><div class="big">' + s.level + '</div>' +
      '<div class="player-level" style="width:100%;margin-top:10px"><span>' + rankName(s.level) + '</span>' +
      '<div class="xpbar"><div id="pxp" style="height:100%;width:' + Math.min(100, s.xp / SAVE.xpFor(s.level) * 100) + '%;background:linear-gradient(90deg,#69f0ae,#00c853);border-radius:6px"></div></div></div></div>');
    html.push('<div class="prog-card"><h3>🏆 MEJORES VUELOS</h3>' +
      (top3.length
        ? top3.map((e, i) => '<div class="stat-row"><span>' + (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') + ' ' + (i + 1) + '.º</span><span><b>' + e.s + ' pts</b></span></div>').join('')
        : '<div class="stat-row"><span>Sin vuelos aún…</span><span>💭</span></div>') +
      '</div>');
    html.push(seedCard(s));
    html.push(replayCard(s));
    html.push('<div class="prog-card"><h3>ESTADÍSTICAS</h3>' +
      statRow('Partidas jugadas', s.stats.flights) +
      statRow('Récord de puntos', s.stats.best) +
      statRow('Obstáculos superados', s.stats.pipes) +
      statRow('Distancia volada', s.stats.dist + ' m') +
      statRow('Power-ups recogidos', s.stats.powersGot || 0) +
      statRow('Monedas de oro 🪙', s.stats.megaGot || 0) +
      statRow('Doble monedas 💰', s.stats.xcGot || 0) +
      statRow('Enemigos esquivados', s.stats.enemiesGot || 0) +
      statRow('Murciélagos 🦇', s.stats.batsGot || 0) +
      statRow('Fantasmas 👻', s.stats.ghostsGot || 0) +
      statRow('Diamantes 💎', s.stats.gemsGot || 0) +
      statRow('Monedas de cadena 🍒', s.stats.chainGot || 0) +
      statRow('Choques absorbidos 🛡️', s.stats.shieldAbsorbed || 0) +
      statRow('Obstáculos fantasma 👻', s.stats.ghostPassed || 0) +
      statRow('Tubos gigantes pasados 🏗️', s.stats.giantPassed || 0) +
      statRow('Zonas de viento 🌬️', s.stats.windZones || 0) +
      statRow('Duelos ganados 🆚', s.stats.duelWins || 0) +
      statRow('Estrellas de niveles ⭐', s.stats.levelStars || 0) +
      statRow('Vuelos de fin de semana ⚡', s.stats.weekendRuns || 0) +
      statRow('Mejor semilla 🌱', (s.dailyC && s.dailyC.best) || 0) +
      statRow('Semillas jugadas', s.stats.seedDays || 0) +
      statRow('Vuelo más largo sin chocar 🛩️', s.stats.maxDistNoHit ? s.stats.maxDistNoHit + ' m' : '—') +
      statRow('Vuelos sin monedas 🚫', s.stats.zeroCoinRuns || 0) +
      statRow('Replays grabados 🎬', s.stats.replaysWatched || 0) +
      statRow('Herramientas usadas 🎒', s.stats.toolsUsed || 0) +
      statRow('Herramientas compradas', s.stats.toolsBought || 0) +
      statRow('Recompensas diarias', s.stats.dailyClaimed || 0) +
      statRow('Monedas recolectadas', s.stats.coinsGot) +
      statRow('Monedas gastadas', s.stats.spent || 0) +
      statRow('Tiempo de vuelo', fmtTime(s.stats.timePlayed)) +
      '</div>');
    body.innerHTML = html.join('');
    renderSeason(body);
    const achTitle = document.createElement('h3');
    achTitle.style.cssText = 'color:#ffe066;font-size:15px;margin:6px 0 10px;letter-spacing:1px';
    achTitle.textContent = '🏅 LOGROS (' + s.achieved.length + '/' + DAT.ACH.length + ')';
    body.appendChild(achTitle);
    DAT.ACH.forEach(a => {
      const got = s.achieved.indexOf(a.id) !== -1;
      const d = document.createElement('div');
      d.className = 'achv' + (got ? ' unlocked' : '');
      d.innerHTML = '<div class="a-ico">' + (got ? '🏅' : '🎯') + '</div>' +
        '<div class="a-t"><div class="a-name">' + a.name + '</div><div class="a-desc">' + a.desc + '</div>' +
        '<div class="a-reward">+' + a.reward + ' monedas</div></div>' +
        '<div>' + (got ? '✔' : '🔒') + '</div>';
      body.appendChild(d);
    });
  }

  function statRow(k, v) { return '<div class="stat-row"><span>' + k + '</span><span><b>' + v + '</b></span></div>'; }

  /* Tarjeta líder de la Semilla diaria (récords locales por día) */
  function seedCard(s) {
    const h = SAVE.dailyHistory();
    let rows = '<div class="stat-row"><span>No has jugado ninguna semilla aún</span><span>🌱</span></div>';
    if (h.length) {
      rows = h.map(e =>
        '<div class="stat-row"><span>🌱 ' + e.key + '</span><span><b>' + e.best + ' pts</b></span></div>').join('') +
        '<div style="font-size:11px;color:#8aa0cc;margin-top:4px">Últimos 7 días</div>';
    }
    return '<div class="prog-card"><h3>🌱 LÍDER DE SEMILLA</h3>' +
      '<div style="font-size:12px;color:#dbe7ff;margin-bottom:8px">Todos juegan la misma partida cada día. Tu mejor marca queda registrada aquí.</div>' +
      rows + '</div>';
  }

  /* Tarjeta del mejor vuelo guardado (Replay) */
  function replayCard(s) {
    const rp = s.replay;
    if (!rp) return '';
    return '<div class="prog-card"><h3>🎬 TU MEJOR VUELO</h3>' +
      '<div class="stat-row"><span>Puntos</span><span><b>' + rp.score + ' pts</b></span></div>' +
      '<div class="stat-row"><span>Fecha</span><span><b>' + rp.date + '</b></span></div>' +
      '<div class="stat-row"><span>Toques grabados</span><span><b>' + (rp.taps ? rp.taps.length : 0) + '</b></span></div>' +
      '<div style="font-size:12px;color:#8aa0cc;margin-top:6px">Pulsa «Replay» en el menú para volver a verlo y exportarlo como video.</div></div>';
  }

  /* Texto de recompensa (el Pase también regala cosméticos: sombrero/estela/mapa/ave) */
  function rewardText(t) {
    if (t.reward.item) {
      const tk = DAT.TOOLS.find(x => x.key === t.reward.item);
      return '🎒 ' + t.reward.n + ' × ' + (tk ? tk.name : t.reward.item);
    }
    if (t.reward.hat) { const h = DAT.getHat(t.reward.hat); return '👒 ' + h.name; }
    if (t.reward.fx) { const f = DAT.getFx(t.reward.fx); return '✨ ' + f.name; }
    if (t.reward.map) { const m = DAT.getMap(t.reward.map); return '🗺 ' + m.name; }
    if (t.reward.skin) { const sk = DAT.getSkin(t.reward.skin); return '🐤 ' + sk.name; }
    return (t.reward.coins || 0) + ' 🪙';
  }

  /* ---------- TEMPORADA 2026 🗓 ---------- */
  function renderSeason(body) {
    const sx = SAVE.totalXp();
    const srl = SAVE.seasonReached();
    const card = document.createElement('div');
    card.className = 'prog-card';
    card.innerHTML =
      '<h3>🗓 TEMPORADA 2026</h3>' +
      '<div style="font-size:13px;color:#dbe7ff">Cada vuelo suma XP (×1,5 los fines de semana ⚡). Reclama tu caja de temporada.</div>' +
      '<div style="font-size:22px;font-weight:900;color:#7ee0ff;margin:6px 0">' + sx + ' XP</div>' +
      '<div style="font-size:12px;color:#bcd0ff">Nivel de temporada: ' + srl + ' / ' + DAT.SEASON_TIERS.length + '</div>';
    body.appendChild(card);
    DAT.SEASON_TIERS.forEach((t, idx) => {
      const claimed = SAVE.get().seasonClaimed.indexOf(idx) !== -1;
      const can = !claimed && srl > idx;
      const c2 = document.createElement('div');
      c2.className = 'prog-card';
      const rw = rewardText(t);
      const st = claimed ? '<span style="color:#7dffa0">✓ Reclamada</span>' : (can ? '<span style="color:#ffd54f">Disponible</span>' : '<span style="color:#8aa0cc">Bloqueada</span>');
      c2.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<b>🗓 ' + t.xp + ' XP</b>' + st + '</div>' +
        '<div style="font-size:13px;color:#dbe7ff">Recompensa: <b style="color:#7ee0ff">' + rw + '</b></div>';
      const btn = document.createElement('button');
      btn.className = 'btn ' + (claimed ? 'btn-ghost' : '');
      btn.disabled = claimed || !can;
      btn.textContent = claimed ? 'Reclamada' : (can ? 'Reclamar' : 'Necesitas ' + t.xp + ' XP');
      btn.onclick = () => {
        const r = SAVE.claimSeasonTier(idx);
        if (r) { toast('🎁 ¡Caja de Temporada 2026!', 'good'); SND.sfx.level(); renderProgress(); }
        SAVE.checkAch().forEach(a => popAch(a));
      };
      c2.appendChild(btn);
      body.appendChild(c2);
    });
  }

  function rankName(lv) {
    if (lv >= 20) return '🌌 Leyenda del Cielo';
    if (lv >= 12) return '👑 As del Vuelo';
    if (lv >= 8) return '⚡ Veloz';
    if (lv >= 5) return '🪽 Explorador';
    if (lv >= 3) return '🐣 Aprendiz';
    return '🐤 Novato';
  }
  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + 'm ' + s + 's';
  }

  /* ---------- AJUSTES ---------- */
  function renderSettings() {
    const body = $('genBody');
    const s = SAVE.get();
    body.innerHTML = '';
    const groupTitle = (t) => {
      const g = document.createElement('div');
      g.className = 'set-group';
      g.innerHTML = '<div class="set-group-title">' + t + '</div>';
      return g;
    };

    const gSound = groupTitle('🎧 Sonido');
    gSound.appendChild(switchRow('🔊 Sonido', 'sfx', s.set.sfx, v => {
      SND.setSfx(v);
      if (v) SND.sfx.click();
      else toast('Sonido desactivado', 'info');
    }));
    gSound.appendChild(switchRow('🎵 Música', 'music', s.set.music, v => {
      if (v) { SND.setMusic(true); SND.sfx.level(); }
      else { SND.setMusic(false); toast('Música desactivada', 'info'); }
    }));
    gSound.appendChild(sliderRow('🔊 Volumen efectos', 'volS', s.set.volS, v => {
      SND.setSfxVol(v);
      if (v > 0.05) SND.sfx.click();
    }));
    gSound.appendChild(sliderRow('🎵 Volumen música', 'volM', s.set.volM, v => {
      SND.setMusicVol(v);
    }));
    body.appendChild(gSound);

    const gCom = groupTitle('🛋 Comodidad');
    gCom.appendChild(switchRow('📳 Vibración', 'vib', s.set.vib, v => {
      if (v && navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { } }
      else toast('Vibración desactivada', 'info');
    }));
    gCom.appendChild(switchRow('💥 Sacudida de pantalla', 'shake', s.set.shake !== false, v => {
      if (!v) FX.shake(0);
      toast(v ? 'Sacudida activada' : 'Sacudida desactivada', 'info');
    }));
    gCom.appendChild(switchRow('♿ Reducir movimiento', 'reduced', s.set.reduced === true, v => {
      FX.setReduced(v);
      toast(v ? 'Movimiento reducido (accesibilidad)' : 'Movimiento completo', 'info');
    }));
    body.appendChild(gCom);

    const gCtrl = groupTitle('🐤 Control');
    gCtrl.appendChild(switchRow('👆 Flap al soltar', 'lift', s.set.lift === true, v => {
      toast(v ? 'Flap también al soltar el dedo' : 'Flap solo al tocar', 'info');
    }));
    gCtrl.appendChild(switchRow('🌙 Gravedad lunar', 'moon', s.set.moon === true, v => {
      toast(v ? 'Caes más suave: ¡modo luna! 🌙' : 'Gravedad normal', 'info');
    }));
    gCtrl.appendChild(switchRow('🗿 Contraste alto', 'hc', s.set.hc === true, v => {
      ENTS.setHC(v);
      toast(v ? 'Bordes más definidos' : 'Contraste normal', 'info');
    }));
    body.appendChild(gCtrl);

    const gGame = groupTitle('🎯 Juego');
    const difRow = document.createElement('div');
    difRow.className = 'set-row';
    difRow.innerHTML = '<span>🎯 Dificultad</span>';
    const pick = document.createElement('div');
    pick.className = 'set-pick';
    DAT.DIFFS.forEach(d => {
      const b = document.createElement('button');
      b.textContent = d.name;
      b.className = s.set.diff === d.id ? 'active' : '';
      b.onclick = () => {
        SAVE.setSetting('diff', d.id);
        renderSettings();
        SND.sfx.click();
        toast('Dificultad: ' + d.name + ' (para tu próximo vuelo)', 'info');
      };
      pick.appendChild(b);
    });
    difRow.appendChild(pick);
    gGame.appendChild(difRow);

    const gfxRow = document.createElement('div');
    gfxRow.className = 'set-row';
    gfxRow.innerHTML = '<span>✨ Efectos visuales</span>';
    const pick2 = document.createElement('div');
    pick2.className = 'set-pick';
    [['low', 'Bajo'], ['medium', 'Medio'], ['high', 'Alto']].forEach(g => {
      const b = document.createElement('button');
      b.textContent = g[1];
      b.className = s.set.gfx === g[0] ? 'active' : '';
      b.onclick = () => {
        SAVE.setSetting('gfx', g[0]);
        renderSettings();
        SND.sfx.click();
        toast('Efectos visuales: ' + g[1], 'info');
      };
      pick2.appendChild(b);
    });
    gfxRow.appendChild(pick2);
    gGame.appendChild(gfxRow);
    body.appendChild(gGame);

    const gData = groupTitle('💾 Datos');
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-danger';
    resetBtn.style.marginTop = '2px';
    resetBtn.textContent = '🗑 Reiniciar todo el progreso';
    resetBtn.onclick = () => {
      SND.sfx.click();
      confirm('¿Reiniciar progreso?', 'Se borrarán monedas, aves, mapas y logros. Esta acción no se puede deshacer.',
        [
          { label: 'Cancelar', cb: () => { } },
          { label: 'Sí, borrar', style: 'btn-danger', cb: () => { SAVE.reset(); SND.stopMusic(); location.reload(); } }
        ]);
    };
    gData.appendChild(resetBtn);
    body.appendChild(gData);

    const about = document.createElement('div');
    about.className = 'prog-card';
    about.style.textAlign = 'center';
    about.innerHTML = '<h3>ACERCA DE</h3><div style="font-size:13px;color:#dbe7ff">Pío Vuelo v2.2 · Temporada ' + DAT.seasonInfo().name + ' 🌍<br>Toca la pantalla para volar y esquivar obstáculos.<br><b style="color:#ffe066">Creado por Joseph Games</b> 🐤</div>';
    body.appendChild(about);
  }

  function switchRow(label, key, initVal, onChange) {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = '<span>' + label + '</span><div class="switch' + (initVal ? ' on' : '') + '" id="sw-' + key + '"></div>';
    const sw = row.querySelector('.switch');
    sw.onclick = () => {
      const on = !sw.classList.contains('on');
      sw.classList.toggle('on', on);
      SAVE.setSetting(key, on);
      onChange(on);
      SND.sfx.click();
    };
    return row;
  }

  function sliderRow(label, key, initVal, onChange) {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = '<span>' + label + '</span>';
    const wrap = document.createElement('div');
    wrap.className = 'set-slider';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0'; input.max = '1'; input.step = '0.05';
    input.value = String(initVal);
    input.oninput = () => {
      const v = parseFloat(input.value);
      SAVE.setSetting(key, v);
      onChange(v);
    };
    wrap.appendChild(input);
    row.appendChild(wrap);
    return row;
  }

  /* ---------- MISIONES 📋 ---------- */
  function renderMissions() {
    const body = $('genBody');
    body.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'prog-card';
    head.style.textAlign = 'center';
    const done = (SAVE.get().stats.missionsDone || 0);
    head.innerHTML = '<h3>MISIONES DIARIAS Y SEMANALES</h3><div style="font-size:13px;color:#dbe7ff">Completa misiones y reclama monedas 🪙. <b>Hechas: ' + done + '</b></div>';
    body.appendChild(head);

    DAT.MISSIONS.forEach(m => {
      const isW = !!m.weekly;
      const cur = SAVE.missionProgress(m);
      const target = m.target;
      const pct = Math.min(100, Math.round(cur / target * 100));
      const claimed = SAVE.missionDoneToday(m);
      const card = document.createElement('div');
      card.className = 'prog-card';
      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<b style="color:#ffe066">' + (isW ? '🎖 ' : '📌 ') + m.name + '</b>' +
        '<span style="font-size:13px;color:#dbe7ff">' + cur + ' / ' + target + '</span></div>' +
        '<div style="font-size:12px;color:#bcd0ff">' + m.desc + '</div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>';
      const btn = document.createElement('button');
      btn.className = 'btn ' + (claimed ? 'btn-ghost' : pct >= 100 ? '' : 'btn-ghost');
      btn.disabled = claimed || pct < 100;
      btn.textContent = claimed ? '✓ Reclamada' : (pct >= 100 ? 'Reclamar +' + m.reward + ' 🪙' : 'Faltan ' + (target - cur));
      btn.onclick = () => {
        const r = SAVE.claimMission(m);
        if (r) { toast('¡Misión completada! +' + r.reward + ' 🪙', 'good'); SND.sfx.level(); renderMissions(); refreshHome(); }
        SAVE.checkAch().forEach(a => popAch(a));
      };
      card.appendChild(btn);
      body.appendChild(card);
    });
  }

  /* ---------- PASE DE VUELO 🎫 ---------- */
  function passRewardIco(t) {
    if (t.reward.item) {
      const tk = DAT.TOOLS.find(x => x.key === t.reward.item);
      return { icon: tk ? tk.icon : '🎒', name: tk ? tk.name : t.reward.item, n: t.reward.n };
    }
    if (t.reward.hat) { const h = DAT.getHat(t.reward.hat); return { icon: '👒', name: h.name, n: 1 }; }
    if (t.reward.fx) { const f = DAT.getFx(t.reward.fx); return { icon: '✨', name: f.name, n: 1 }; }
    if (t.reward.map) { const m = DAT.getMap(t.reward.map); return { icon: '🗺', name: m.name, n: 1 }; }
    if (t.reward.skin) { const sk = DAT.getSkin(t.reward.skin); return { icon: '🐤', name: sk.name, n: 1 }; }
    return { icon: '🪙', name: (t.reward.coins || 0) + ' monedas', n: 1 };
  }

  function renderPass() {
    const body = $('genBody');
    body.innerHTML = '';
    const se = DAT.seasonInfo();
    const tiers = DAT.passTiers();
    const xp = SAVE.totalXp();
    const tier = SAVE.passReached();
    const pc = SAVE.passClaimedCount();

    const head = document.createElement('div');
    head.className = 'prog-card';
    head.style.border = '2px solid ' + se.accent;
    head.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">' +
      '<span style="font-size:28px">' + se.pass.icon + ' ' + se.icon + '</span>' +
      '<div><h3 style="margin:0;color:' + se.accent + '">' + se.pass.name.toUpperCase() + '</h3>' +
      '<div style="font-size:12px;color:#dbe7ff">' + se.name + ' ' + DAT.seasonKey() + ' · ' + se.months + '</div></div></div>' +
      '<div style="font-size:20px;font-weight:900;color:#ffe066;margin:8px 0 4px">' + xp + ' XP' +
      '<span style="font-size:12px;color:#8aa0cc"> · Nv pase ' + tier + '/' + tiers.length + ' · ' + pc + ' recompensas</span></div>' +
      '<div class="pass-prog-bar"><div class="pass-prog-fill" style="width:' + Math.min(100, Math.round(tier / tiers.length * 100)) + '%"></div></div>' +
      '<div style="font-size:11px;color:#8aa0cc;margin-top:6px">⚡ Cuando cambie la temporada, el Pase rota solo con nuevas recompensas.</div>';
    body.appendChild(head);

    const track = document.createElement('div');
    track.className = 'pass-track';
    const scroll = document.createElement('div');
    scroll.className = 'pass-track-scroll';
    const curI = tier - 1;
    tiers.forEach((t, idx) => {
      const claimed = SAVE.get().passClaimed.indexOf(idx) !== -1;
      const can = !claimed && tier > idx;
      const rw = passRewardIco(t);
      const cell = document.createElement('button');
      cell.className = 'pass-cell' + (claimed ? ' claimed' : '') + (can ? ' avail' : '') + (idx === curI ? ' cur' : '');
      cell.disabled = claimed || !can;
      cell.innerHTML =
        '<div class="pass-cell-ico">' + rw.icon + (rw.n > 1 ? '<b>×' + rw.n + '</b>' : '') + '</div>' +
        '<div class="pass-cell-xp">' + t.xp + ' XP</div>' +
        '<div class="pass-cell-name">' + rw.name + '</div>' +
        (claimed ? '<div class="pass-cell-st ok">✓</div>' : (can ? '<div class="pass-cell-st">Reclamar</div>' : '<div class="pass-cell-st lock">🔒</div>'));
      cell.onclick = () => {
        if (idx >= tier) { toast('Nivel de pase ' + (idx + 1) + ' (necesitas ' + t.xp + ' XP)', 'info'); return; }
        const r = SAVE.claimPassTier(idx);
        if (r) { toast('¡Recompensa del Pase! 🎫', 'good'); SND.sfx.level(); renderPass(); refreshHome(); }
        SAVE.checkAch().forEach(a => popAch(a));
      };
      scroll.appendChild(cell);
    });
    track.appendChild(scroll);
    body.appendChild(track);
  }

  /* ---------- Modo Niveles: etapas fijas con estrellas ---------- */
  function renderLevels() {
    const body = $('genBody');
    body.innerHTML = '';
    const st = SAVE.get().levels;
    const stg = DAT.getStage(st.cur);
    const head = document.createElement('div');
    head.className = 'prog-card';
    head.innerHTML =
      '<div style="font-size:22px;font-weight:900;color:#ffe066">🌟 MODOS DE VUELO</div>' +
      '<div style="font-size:12px;color:#dbe7ff;margin-top:4px">Etapas fijas: cada una es idéntica para todos y se supera en un solo vuelo.</div>' +
      '<div style="font-size:20px;font-weight:900;color:#ffb74d;margin-top:10px">Próxima etapa: ' + stg.name + '</div>' +
      '<div style="font-size:12px;color:#8aa0cc">' + stg.pipes + ' tubos · velocidad ×' + stg.speedMul + ' · gap ×' + stg.gapMul + '</div>';
    body.appendChild(head);

    const wrap = document.createElement('div');
    wrap.className = 'stages-grid';
    DAT.STAGES.forEach((sg, i) => {
      const stars = st.stars[i] || 0;
      const unlocked = i <= st.cur;
      const done = stars > 0;
      const cell = document.createElement('button');
      cell.className = 'stage-card' + (i === st.cur ? ' cur' : '') + (done ? ' done' : '');
      cell.disabled = !unlocked;
      cell.innerHTML =
        '<div class="stage-num">' + (i + 1) + '</div>' +
        '<div class="stage-name">' + sg.name + '</div>' +
        '<div class="stage-meta">' + sg.pipes + ' tubos · ' + sg.coins + ' 🪙</div>' +
        '<div class="stage-stars">' + (stars < 1 ? '☆☆☆' : stars === 1 ? '★☆☆' : stars === 2 ? '★★☆' : '★★★') + '</div>' +
        '<div class="stage-hit">' + (stars >= sg.s1 ? '⭐' : '') + ' ' + (stars >= sg.s2 ? '⭐⭐' : '') + (stars >= sg.s3 ? '⭐⭐⭐' : '') + '</div>' +
        '<div class="stage-btn">' + (done ? '▶ Reintentar' : unlocked ? '▶ Jugar' : '🔒 Bloqueada') + '</div>';
      cell.onclick = () => {
        if (!unlocked) { toast('Supera la etapa ' + (i + 1) + ' para desbloquear', 'info'); return; }
        SND.sfx.tap();
        G.setLevelStage(i);
        closeGeneric();
        G.startPlay('levels');
      };
      wrap.appendChild(cell);
    });
    body.appendChild(wrap);

    const cur = DAT.getStage(st.cur);
    const info = document.createElement('div');
    info.className = 'prog-card';
    info.innerHTML =
      '<div style="font-size:14px;font-weight:800">💎 Cómo se puntúa</div>' +
      '<div style="font-size:12px;color:#dbe7ff;margin-top:4px">⭐ alcanza ' + cur.s1 + ' pts · ⭐⭐ alcanza ' + cur.s2 + ' pts · ⭐⭐⭐ alcanza ' + cur.s3 + ' pts. Cada estrella da +25 🪙 y +10 XP.</div>' +
      '<div style="font-size:12px;color:#8aa0cc;margin-top:6px">Pasar la etapa la desbloquea para siempre. Al morir no pierdes nada: tu mejor resultado de hoy cuenta y se guarda en la tarjeta de Progreso.</div>';
    body.appendChild(info);
  }

  return {
    hideAllScreens, showLoading, showHome, refreshHome,
    setHudVisible, showStartHint, setPaused, refreshHudTools,
    showGameOver, showTimeClear, showModeClear, toast, confirm, openGeneric, closeGeneric,
    popAch,
    current: () => currentGeneric
  };
})();