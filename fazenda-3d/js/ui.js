/* ================= FAZENDA 3D — INTERFACE (DOM) =================
   HUD, painéis, modais, toasts, sons, música e i18n. */

const uiDirty = { coins: true, gems: true, xp: true };

const $ = id => document.getElementById(id);

/* ---------- Internacionalização ---------- */
const I18N = {
  'pt-BR': {
    'menu.missions': 'Missões', 'menu.shop': 'Loja',
    'menu.achievements': 'Conquistas', 'menu.friends': 'Amigos',
    'build.build': 'Construir', 'build.move': 'Mover', 'build.remove': 'Remover',
    'build.rotate': 'Girar', 'build.buy': 'Comprar',
    'modal.shop': '🏪 Loja da Fazenda', 'modal.missions': '📋 Missões',
    'modal.achievements': '🏆 Conquistas', 'modal.friends': '👥 Amigos',
    'modal.settings': '⚙️ Configurações', 'modal.buy': '🛒 Comprar',
    'modal.coins': '🪙 Loja de Moedas', 'modal.gems': '💎 Loja de Diamantes',
    'settings.sound': '🔊 Som', 'settings.music': '🎵 Música',
    'settings.quality': '✨ Qualidade gráfica', 'settings.language': '🌐 Idioma',
    'settings.saveNow': '💾 Salvar progresso agora',
    'settings.reset': '🗑️ Reiniciar fazenda (apaga tudo)',
    'settings.resetConfirm': 'Tem certeza? Todo o progresso será PERDIDO para sempre.',
    'q.baixa': 'baixa', 'q.média': 'média', 'q.alta': 'alta',
    'cat.construcoes': 'Construções', 'cat.decoracoes': 'Decorações',
    'cat.cercas': 'Cercas', 'cat.arvores': 'Árvores',
    'shop.select': 'Selecionar', 'shop.noCoins': 'Sem moedas 🪙',
    'shop.locked': '🔒 Requer nível {n}', 'shop.expansion': 'Expansão de Terreno',
    'shop.expansionDesc': '+2 tiles em toda a borda da fazenda',
    'shop.buyExpansion': 'Comprar expansão', 'shop.unavailable': 'Indisponível',
    'shop.hint': 'Para construir estruturas, use o botão 🪧 Construir ou a 🏪 Loja.',
    'confirm.build': '{icon} {name} — 🪙 {price}',
    'confirm.move': '✥ Mover para esta posição (grátis)',
    'confirm.rotate': '🔄 Girar 90°?',
    'dialog.cancel': 'Cancelar', 'dialog.ok': 'Confirmar',
    'dialog.removeText': 'Remover {icon} {name}? Você receberá 🪙 {refund} de volta.',
    'coinshop.body': 'A loja de moedas com compras reais será integrada na fase de monetização. Por enquanto, ganhe moedas vendendo produtos e concluindo missões!',
    'coinshop.daily': '🎁 Receber 100 moedas de boas-vindas (1x por dia)',
    'gemshop.body': 'Diamantes são a moeda premium: aceleram construções e produções e desbloqueiam itens especiais. A loja de compra será integrada na fase de monetização.',
    'friends.placeholder': '👥 O sistema de amigos (visitar fazendas, trocar presentes e produtos) será ativado na fase multiplayer. Sua fazenda está pronta para recebê-los!',
    'toast.welcome': '🌾 Bem-vindo à sua fazenda! Use 🪧 Construir para começar.',
    'toast.buildHint': '{icon} Escolha o local e clique para confirmar (R gira · Esc cancela)',
    'toast.invalid': '🚫 Local inválido! Escolha uma área livre dentro do terreno.',
    'toast.noCoins': '🪙 Moedas insuficientes!',
    'toast.built': '{icon} {name} construído!',
    'toast.moved': '✥ Construção movida!',
    'toast.rotated': '🔄 Construção girada!',
    'toast.rotateNoSpace': '🚫 Sem espaço para girar aqui.',
    'toast.removed': '🗑️ Removido! +🪙 {refund}',
    'toast.removeHint': 'Clique em uma construção para removê-la.',
    'toast.moveHint': '✥ Clique em uma construção e depois no novo local.',
    'toast.moveSelect': 'Agora clique no novo local (R gira · Esc cancela).',
    'toast.rotateHint': '🔄 Clique em uma construção para visualizar a rotação.',
    'toast.noRotate': 'Esta construção não precisa girar.',
    'toast.clickBuilding': 'Clique em uma construção para mover.',
    'toast.missionDone': '📋 Missão concluída! +{c} 🪙 +{x} XP',
    'toast.achievementDone': '🏆 Conquista desbloqueada! +{c} 🪙',
    'toast.levelUp': '⭐ Nível {n} alcançado! Novos itens desbloqueados.',
    'toast.saved': '💾 Progresso salvo!',
    'toast.landExpanded': '🌍 Terreno ampliado! Área agora: {w}×{h}',
    'toast.expandLimit': '🚫 Limite de expansões atingido!',
    'toast.dailyWait': '⏰ Volte amanhã para a recompensa diária!',
    'toast.dailyDone': '🪙 +100 moedas!',
    'toast.highlight': '{icon} {name}',
    'b_house': 'Casa Principal', 'b_house_desc': 'Centro administrativo da fazenda.',
    'b_barn': 'Celeiro', 'b_barn_desc': 'Armazena produtos agrícolas.',
    'b_stable': 'Estábulo', 'b_stable_desc': 'Abriga vacas e produz leite (fase 2).',
    'b_coop': 'Galinheiro', 'b_coop_desc': 'Abriga galinhas e produz ovos (fase 2).',
    'b_well': 'Poço', 'b_well_desc': 'Fornece água para irrigação (fase 2).',
    'b_stall': 'Barraca de Vendas', 'b_stall_desc': 'Ponto de comercialização de produtos (fase 3).',
    'b_fence': 'Cerca', 'b_fence_desc': 'Delimita áreas e currais.',
    'b_tree': 'Árvore', 'b_tree_desc': 'Decoração natural da fazenda.',
    'b_flowers': 'Canteiro de Flores', 'b_flowers_desc': 'Enfeita os caminhos da fazenda.',
    'b_path': 'Trilha de Pedra', 'b_path_desc': 'Caminho decorativo de pedras.'
  },
  'en-US': {
    'menu.missions': 'Missions', 'menu.shop': 'Shop',
    'menu.achievements': 'Achievements', 'menu.friends': 'Friends',
    'build.build': 'Build', 'build.move': 'Move', 'build.remove': 'Remove',
    'build.rotate': 'Rotate', 'build.buy': 'Buy',
    'modal.shop': '🏪 Farm Shop', 'modal.missions': '📋 Missions',
    'modal.achievements': '🏆 Achievements', 'modal.friends': '👥 Friends',
    'modal.settings': '⚙️ Settings', 'modal.buy': '🛒 Buy',
    'modal.coins': '🪙 Coin Shop', 'modal.gems': '💎 Diamond Shop',
    'settings.sound': '🔊 Sound', 'settings.music': '🎵 Music',
    'settings.quality': '✨ Graphics quality', 'settings.language': '🌐 Language',
    'settings.saveNow': '💾 Save progress now',
    'settings.reset': '🗑️ Reset farm (erases everything)',
    'settings.resetConfirm': 'Are you sure? All progress will be LOST forever.',
    'q.baixa': 'low', 'q.média': 'medium', 'q.alta': 'high',
    'cat.construcoes': 'Buildings', 'cat.decoracoes': 'Decorations',
    'cat.cercas': 'Fences', 'cat.arvores': 'Trees',
    'shop.select': 'Select', 'shop.noCoins': 'Not enough coins 🪙',
    'shop.locked': '🔒 Requires level {n}', 'shop.expansion': 'Land Expansion',
    'shop.expansionDesc': '+2 tiles along the entire farm border',
    'shop.buyExpansion': 'Buy expansion', 'shop.unavailable': 'Unavailable',
    'shop.hint': 'To build structures, use the 🪧 Build button or the 🏪 Shop.',
    'confirm.build': '{icon} {name} — 🪙 {price}',
    'confirm.move': '✥ Move to this spot (free)',
    'confirm.rotate': '🔄 Rotate 90°?',
    'dialog.cancel': 'Cancel', 'dialog.ok': 'Confirm',
    'dialog.removeText': 'Remove {icon} {name}? You will get 🪙 {refund} back.',
    'coinshop.body': 'The real-money coin shop will be integrated in the monetization phase. For now, earn coins by selling products and completing missions!',
    'coinshop.daily': '🎁 Claim 100 welcome coins (once a day)',
    'gemshop.body': 'Diamonds are the premium currency: they speed up construction and production and unlock special items. The purchase shop will be integrated in the monetization phase.',
    'friends.placeholder': '👥 The friends system (visit farms, trade gifts and products) will be enabled in the multiplayer phase. Your farm is ready to receive them!',
    'toast.welcome': '🌾 Welcome to your farm! Use 🪧 Build to get started.',
    'toast.buildHint': '{icon} Choose a spot and click to confirm (R rotates · Esc cancels)',
    'toast.invalid': '🚫 Invalid spot! Choose a free area inside your land.',
    'toast.noCoins': '🪙 Not enough coins!',
    'toast.built': '{icon} {name} built!',
    'toast.moved': '✥ Building moved!',
    'toast.rotated': '🔄 Building rotated!',
    'toast.rotateNoSpace': '🚫 No room to rotate here.',
    'toast.removed': '🗑️ Removed! +🪙 {refund}',
    'toast.removeHint': 'Click a building to remove it.',
    'toast.moveHint': '✥ Click a building, then the new spot.',
    'toast.moveSelect': 'Now click the new spot (R rotates · Esc cancels).',
    'toast.rotateHint': '🔄 Click a building to preview the rotation.',
    'toast.noRotate': 'This building does not need rotating.',
    'toast.clickBuilding': 'Click a building to move it.',
    'toast.missionDone': '📋 Mission complete! +{c} 🪙 +{x} XP',
    'toast.achievementDone': '🏆 Achievement unlocked! +{c} 🪙',
    'toast.levelUp': '⭐ Level {n} reached! New items unlocked.',
    'toast.saved': '💾 Progress saved!',
    'toast.landExpanded': '🌍 Land expanded! Area is now {w}×{h}',
    'toast.expandLimit': '🚫 Expansion limit reached!',
    'toast.dailyWait': '⏰ Come back tomorrow for the daily reward!',
    'toast.dailyDone': '🪙 +100 coins!',
    'toast.highlight': '{icon} {name}',
    'b_house': 'Main House', 'b_house_desc': 'Administrative center of the farm.',
    'b_barn': 'Barn', 'b_barn_desc': 'Stores agricultural products.',
    'b_stable': 'Stable', 'b_stable_desc': 'Houses cows and produces milk (phase 2).',
    'b_coop': 'Chicken Coop', 'b_coop_desc': 'Houses chickens and produces eggs (phase 2).',
    'b_well': 'Well', 'b_well_desc': 'Provides water for irrigation (phase 2).',
    'b_stall': 'Market Stall', 'b_stall_desc': 'Selling point for products (phase 3).',
    'b_fence': 'Fence', 'b_fence_desc': 'Delimits areas and pens.',
    'b_tree': 'Tree', 'b_tree_desc': 'Natural farm decoration.',
    'b_flowers': 'Flower Bed', 'b_flowers_desc': 'Beautifies the farm paths.',
    'b_path': 'Stone Path', 'b_path_desc': 'Decorative stone walkway.'
  }
};

let LANG = 'pt-BR';

function t(key, params) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N['pt-BR'][key] || key;
  if (params) for (const k in params) s = s.replaceAll('{' + k + '}', params[k]);
  return s;
}

function applyLang() {
  LANG = game.settings.language || 'pt-BR';
  document.documentElement.lang = LANG;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
}

/* ---------- Sons (WebAudio, sem arquivos externos) ---------- */
let audioCtx = null;

function getAudioCtx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(kind) {
  if (!game.settings.sound) return;
  try {
    const ac = getAudioCtx();
    const notes = {
      click: [660, 0.05], place: [520, 0.12], remove: [220, 0.15],
      rotate: [440, 0.08], level: [784, 0.2], error: [180, 0.18]
    };
    const [freq, dur] = notes[kind] || notes.click;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(); osc.stop(ac.currentTime + dur);
  } catch (e) { /* áudio indisponível */ }
}

/* ---------- Música ambiente (gerada, sem arquivos) ---------- */
const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880, 783.99,
                659.25, 523.25, 587.33, 659.25, 523.25, 392, 440, 523.25];
const BASS = [130.81, 130.81, 174.61, 174.61, 196, 196, 130.81, 130.81];
let musicTimer = null;
let musicStep = 0;

function musicNote(freq, dur, vol, type) {
  const ac = getAudioCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(); osc.stop(ac.currentTime + dur);
}

function startMusic() {
  if (musicTimer) return;
  try {
    getAudioCtx();
    musicTimer = setInterval(() => {
      if (!game.settings.music) { stopMusic(); return; }
      musicNote(MELODY[musicStep % MELODY.length], 0.9, 0.045, 'triangle');
      if (musicStep % 2 === 0) {
        musicNote(BASS[(musicStep / 2) % BASS.length], 1.8, 0.03, 'sine');
      }
      musicStep++;
    }, 450);
  } catch (e) { /* áudio indisponível */ }
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.classList.add('hidden'), 300);
  }, 2200);
}

/* ---------- HUD ---------- */
function refreshHud() {
  if (uiDirty.coins) { $('coins-value').textContent = game.coins.toLocaleString('pt-BR'); uiDirty.coins = false; }
  if (uiDirty.gems) { $('gems-value').textContent = game.gems; uiDirty.gems = false; }
  if (uiDirty.xp) {
    $('level-text').textContent = 'Nível ' + game.level;
    $('farm-name').textContent = game.farmName;
    const need = xpForLevel(game.level);
    $('xp-fill').style.width = Math.min(100, (game.xp / need) * 100) + '%';
    uiDirty.xp = false;
  }
}

/* ---------- Modais ---------- */
function openModal(title, bodyBuilder) {
  $('modal-title').textContent = title;
  const body = $('modal-body');
  body.innerHTML = '';
  bodyBuilder(body);
  $('modal-overlay').classList.remove('hidden');
  playSound('click');
}

function closeModal() { $('modal-overlay').classList.add('hidden'); }

/* ---------- Loja ---------- */
let currentShopTab = 'construcoes';

function openShop() {
  openModal(t('modal.shop'), body => {
    const tabs = document.createElement('div');
    tabs.className = 'shop-tabs';
    for (const cat of SHOP_CATEGORIES) {
      const btn = document.createElement('button');
      btn.className = 'shop-tab' + (cat.id === currentShopTab ? ' active' : '');
      btn.textContent = t('cat.' + cat.id);
      btn.onclick = () => { currentShopTab = cat.id; openShop(); };
      tabs.appendChild(btn);
    }
    body.appendChild(tabs);

    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    for (const def of Object.values(BUILDINGS)) {
      if (def.category !== currentShopTab) continue;
      const locked = game.level < def.level;
      const afford = game.coins >= def.price;
      const item = document.createElement('div');
      item.className = 'shop-item';
      item.innerHTML = `
        <div class="shop-item-icon">${def.icon}</div>
        <div class="shop-item-name">${t('b_' + def.id)}</div>
        <div class="shop-item-size">${def.w}×${def.d} tiles</div>
        <div class="shop-item-desc" style="font-size:11px;color:#6d4c41;text-align:center">${t('b_' + def.id + '_desc')}</div>
        <div class="shop-item-price">🪙 ${def.price.toLocaleString('pt-BR')}</div>
        ${locked ? `<div class="shop-item-locked">${t('shop.locked', { n: def.level })}</div>` : ''}
      `;
      const buyBtn = document.createElement('button');
      buyBtn.className = 'shop-buy-btn';
      buyBtn.textContent = locked ? t('shop.locked', { n: def.level }) : (!afford ? t('shop.noCoins') : t('shop.select'));
      buyBtn.disabled = locked || !afford;
      buyBtn.onclick = () => {
        closeModal();
        enterBuildMode(def.id);
      };
      item.appendChild(buyBtn);
      grid.appendChild(item);
    }
    body.appendChild(grid);
  });
}

/* Loja de moedas (botão + das moedas) */
function openCoinShop() {
  openModal(t('modal.coins'), body => {
    body.innerHTML = `<p style="text-align:center;margin-bottom:12px">${t('coinshop.body')}</p>`;
    const btn = document.createElement('button');
    btn.className = 'settings-btn';
    btn.style.background = 'var(--green)';
    btn.style.color = '#fff';
    btn.textContent = t('coinshop.daily');
    btn.onclick = () => {
      const today = new Date().toDateString();
      const last = localStorage.getItem('fazenda3d_daily');
      if (last === today) { showToast(t('toast.dailyWait')); return; }
      localStorage.setItem('fazenda3d_daily', today);
      addCoins(100);
      playSound('level');
      showToast(t('toast.dailyDone'));
      refreshHud();
    };
    body.appendChild(btn);
  });
}

function openGemShop() {
  openModal(t('modal.gems'), body => {
    body.innerHTML = `<p style="text-align:center">${t('gemshop.body')}</p>`;
  });
}

/* ---------- Missões ---------- */
function openMissions() {
  openModal(t('modal.missions'), body => {
    for (const m of MISSIONS) {
      const done = game.missionsClaimed.includes(m.id);
      const prog = missionProgress(m);
      const item = document.createElement('div');
      item.className = 'mission-item' + (done ? ' mission-done' : '');
      item.innerHTML = `
        <div class="mission-info">
          <div class="mission-title">${done ? '✅ ' : ''}${m.title}</div>
          <div class="mission-desc">${m.desc}</div>
          <div class="mission-progress">Progresso: ${prog}/${m.target}</div>
        </div>
        <div class="mission-reward">🪙 ${m.rewardCoins}<br>⭐ ${m.rewardXp} XP</div>
      `;
      body.appendChild(item);
    }
  });
}

/* ---------- Conquistas ---------- */
function openAchievements() {
  openModal(t('modal.achievements'), body => {
    for (const a of ACHIEVEMENTS) {
      const done = game.achievementsClaimed.includes(a.id);
      const prog = achievementProgress(a);
      const item = document.createElement('div');
      item.className = 'achievement-item' + (done ? ' achievement-done' : '');
      item.innerHTML = `
        <div class="achievement-info">
          <div class="achievement-title">${done ? '🏆 ' : '🔒 '}${a.title}</div>
          <div class="achievement-desc">${a.desc} (${prog}/${a.target})</div>
        </div>
        <div class="achievement-reward">🪙 ${a.rewardCoins}</div>
      `;
      body.appendChild(item);
    }
  });
}

/* ---------- Amigos ---------- */
function openFriends() {
  openModal(t('modal.friends'), body => {
    body.innerHTML = `<div class="friends-placeholder">${t('friends.placeholder')}</div>`;
  });
}

/* ---------- Configurações ---------- */
function openSettings() {
  openModal(t('modal.settings'), body => {
    const rows = [
      { label: t('settings.sound'), key: 'sound', type: 'toggle' },
      { label: t('settings.music'), key: 'music', type: 'toggle' },
      { label: t('settings.quality'), key: 'quality', type: 'select',
        options: ['baixa', 'média', 'alta'], translate: true },
      { label: t('settings.language'), key: 'language', type: 'select',
        options: ['pt-BR', 'en-US'], translate: false }
    ];
    for (const r of rows) {
      const row = document.createElement('div');
      row.className = 'settings-row';
      row.innerHTML = `<span>${r.label}</span>`;
      let input;
      if (r.type === 'toggle') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = game.settings[r.key];
        input.onchange = () => {
          game.settings[r.key] = input.checked;
          playSound('click');
          if (r.key === 'music') {
            if (input.checked) startMusic(); else stopMusic();
          }
          saveGame(false);
        };
      } else {
        input = document.createElement('select');
        for (const opt of r.options) {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = r.translate ? t('q.' + opt) : opt;
          if (game.settings[r.key] === opt) o.selected = true;
          input.appendChild(o);
        }
        input.onchange = () => {
          game.settings[r.key] = input.value;
          playSound('click');
          if (r.key === 'language') applyLang();
          saveGame(false);
        };
      }
      row.appendChild(input);
      body.appendChild(row);
    }

    const saveBtn = document.createElement('button');
    saveBtn.className = 'settings-btn';
    saveBtn.style.background = 'var(--blue)';
    saveBtn.style.color = '#fff';
    saveBtn.textContent = t('settings.saveNow');
    saveBtn.onclick = () => { saveGame(true); refreshHud(); };

    const resetBtn = document.createElement('button');
    resetBtn.className = 'settings-btn';
    resetBtn.style.background = 'var(--red)';
    resetBtn.style.color = '#fff';
    resetBtn.textContent = t('settings.reset');
    resetBtn.onclick = () => {
      confirmDialog(t('settings.resetConfirm'), () => resetGame());
    };

    body.appendChild(saveBtn);
    body.appendChild(resetBtn);
  });
}

/* ---------- Comprar (expansão + atalhos) ---------- */
function openBuyMenu() {
  openModal(t('modal.buy'), body => {
    const price = expansionPrice();
    const can = canExpand();
    const afford = game.coins >= price;
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.style.maxWidth = '320px';
    card.style.margin = '0 auto 14px';
    card.innerHTML = `
      <div class="shop-item-icon">🌍</div>
      <div class="shop-item-name">${t('shop.expansion')}</div>
      <div class="shop-item-size">${t('shop.expansionDesc')}</div>
      <div class="shop-item-price">🪙 ${price.toLocaleString('pt-BR')}</div>
      ${can ? '' : `<div class="shop-item-locked">${t('toast.expandLimit')}</div>`}
    `;
    const btn = document.createElement('button');
    btn.className = 'shop-buy-btn';
    btn.textContent = can ? t('shop.buyExpansion') : t('shop.unavailable');
    btn.disabled = !can || !afford;
    btn.onclick = () => { if (buyLand()) { closeModal(); refreshHud(); } };
    card.appendChild(btn);
    body.appendChild(card);

    const hint = document.createElement('p');
    hint.style.cssText = 'text-align:center;font-size:13px;color:#6d4c41';
    hint.textContent = t('shop.hint');
    body.appendChild(hint);
  });
}

/* ---------- Diálogo de confirmação ---------- */
let dialogCallback = null;
function confirmDialog(text, onOk) {
  $('dialog-text').textContent = text;
  $('dialog-ok').textContent = t('dialog.ok');
  $('dialog-cancel').textContent = t('dialog.cancel');
  dialogCallback = onOk;
  $('dialog-overlay').classList.remove('hidden');
  playSound('click');
}

/* ---------- Barra de confirmação flutuante ---------- */
function showConfirmBar(info) {
  $('confirm-info').textContent = info;
  $('confirm-ok').textContent = '✓ ' + t('dialog.ok');
  $('confirm-cancel').textContent = '✕ ' + t('dialog.cancel');
  $('confirm-bar').classList.remove('hidden');
}
function hideConfirmBar() { $('confirm-bar').classList.add('hidden'); }

/* ---------- Ligação dos botões ---------- */
function bindUi(handlers) {
  $('btn-settings').onclick = openSettings;
  $('btn-add-coins').onclick = openCoinShop;
  $('btn-add-gems').onclick = openGemShop;
  $('btn-build').onclick = () => handlers.build();
  $('btn-move').onclick = () => handlers.move();
  $('btn-remove').onclick = () => handlers.remove();
  $('btn-rotate').onclick = () => handlers.rotate();
  $('btn-buy').onclick = openBuyMenu;

  for (const btn of document.querySelectorAll('.side-btn')) {
    btn.onclick = () => {
      const panel = btn.dataset.panel;
      if (panel === 'missions') openMissions();
      else if (panel === 'shop') openShop();
      else if (panel === 'achievements') openAchievements();
      else if (panel === 'friends') openFriends();
    };
  }

  $('modal-close').onclick = closeModal;
  $('modal-overlay').onclick = e => { if (e.target === $('modal-overlay')) closeModal(); };

  $('dialog-ok').onclick = () => {
    $('dialog-overlay').classList.add('hidden');
    if (dialogCallback) dialogCallback();
    dialogCallback = null;
  };
  $('dialog-cancel').onclick = () => { $('dialog-overlay').classList.add('hidden'); dialogCallback = null; };

  $('confirm-ok').onclick = () => handlers.confirmOk();
  $('confirm-cancel').onclick = () => handlers.confirmCancel();

  // música só pode iniciar após um gesto do usuário (política de autoplay)
  document.addEventListener('pointerdown', () => {
    if (game.settings.music) startMusic();
  }, { once: true });
}
