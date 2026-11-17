/* ================= FAZENDA 3D — LÓGICA DO JOGO =================
   Estado, grade de ocupação, economia, XP/nível, missões,
   conquistas e salvamento. */

const GRID_SIZE = 30;
const SAVE_KEY = 'fazenda3d_save_v1';
const START_AREA = { x0: 11, y0: 11, x1: 18, y1: 18 }; // 8x8 inicial

const game = {
  coins: 750,
  gems: 5,
  xp: 0,
  level: 1,
  farmName: 'Fazenda do Jogador',
  ownedArea: { ...START_AREA },
  buildings: [],          // {id, type, gx, gy, rot}
  nextId: 1,
  stats: {},              // contadores p/ missões e conquistas
  missionsClaimed: [],
  achievementsClaimed: [],
  settings: { sound: true, music: false, quality: 'alta', language: 'pt-BR' },
  landExpansions: 0
};

/* ---------- Grade de ocupação ---------- */
const occupancy = new Array(GRID_SIZE * GRID_SIZE).fill(null);

function occIndex(x, y) { return y * GRID_SIZE + x; }

function inOwnedArea(x, y) {
  const a = game.ownedArea;
  return x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1;
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;
}

/* Footprint de um tipo com rotação aplicada (0 ou 1 → 90°). */
function footprintOf(type, rot) {
  const b = BUILDINGS[type];
  return (rot % 2 === 0) ? { w: b.w, d: b.d } : { w: b.d, d: b.w };
}

/* Verifica se um prédio cabe em (gx,gy) com rotação dada.
   ignoreId permite ignorar o próprio prédio (modo mover). */
function canPlace(type, gx, gy, rot, ignoreId) {
  const f = footprintOf(type, rot);
  for (let x = gx; x < gx + f.w; x++) {
    for (let y = gy; y < gy + f.d; y++) {
      if (!inBounds(x, y) || !inOwnedArea(x, y)) return false;
      const occ = occupancy[occIndex(x, y)];
      if (occ && occ.id !== ignoreId) return false;
    }
  }
  return true;
}

function markOccupancy(building, value) {
  const f = footprintOf(building.type, building.rot);
  for (let x = building.gx; x < building.gx + f.w; x++) {
    for (let y = building.gy; y < building.gy + f.d; y++) {
      occupancy[occIndex(x, y)] = value ? building : null;
    }
  }
}

function buildingAt(x, y) {
  if (!inBounds(x, y)) return null;
  return occupancy[occIndex(x, y)];
}

/* ---------- Economia ---------- */
function addCoins(n) {
  game.coins = Math.max(0, game.coins + n);
  game.stats.peak_coins = Math.max(game.stats.peak_coins || 0, game.coins);
  uiDirty.coins = true;
}

function addGems(n) { game.gems = Math.max(0, game.gems + n); uiDirty.gems = true; }

function addXp(n) {
  game.xp += n;
  uiDirty.xp = true;
  while (game.xp >= xpForLevel(game.level)) {
    game.xp -= xpForLevel(game.level);
    game.level++;
    game.stats.level = game.level;
    showToast(t('toast.levelUp', { n: game.level }));
    playSound('level');
  }
}

/* ---------- Construções ---------- */
function placeBuilding(type, gx, gy, rot, free) {
  const def = BUILDINGS[type];
  if (!canPlace(type, gx, gy, rot)) return null;
  if (!free) {
    if (game.coins < def.price) { showToast(t('toast.noCoins')); return null; }
    addCoins(-def.price);
  }
  const building = {
    id: game.nextId++,
    type, gx, gy, rot: rot || 0
  };
  game.buildings.push(building);
  markOccupancy(building, true);

  game.stats.built_any = (game.stats.built_any || 0) + 1;
  game.stats['built_' + type] = (game.stats['built_' + type] || 0) + 1;
  if (!free) addXp(Math.max(5, Math.round(def.price / 10)));
  playSound('place');
  return building;
}

function removeBuilding(id) {
  const idx = game.buildings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  const b = game.buildings[idx];
  markOccupancy(b, false);
  game.buildings.splice(idx, 1);
  const def = BUILDINGS[b.type];
  const refund = Math.floor(def.price * def.refund);
  if (refund > 0) addCoins(refund);
  playSound('remove');
  return { refund, def };
}

function moveBuilding(id, gx, gy, rot) {
  const b = game.buildings.find(b => b.id === id);
  if (!b) return false;
  const newRot = (rot === undefined) ? b.rot : rot;
  if (!canPlace(b.type, gx, gy, newRot, id)) return false;
  markOccupancy(b, false);
  b.gx = gx; b.gy = gy; b.rot = newRot;
  markOccupancy(b, true);
  playSound('place');
  return true;
}

function rotateBuilding(id) {
  const b = game.buildings.find(b => b.id === id);
  if (!b) return false;
  const newRot = (b.rot + 1) % 4;
  if (!canPlace(b.type, b.gx, b.gy, newRot, id)) return false;
  markOccupancy(b, false);
  b.rot = newRot;
  markOccupancy(b, true);
  playSound('rotate');
  return true;
}

/* ---------- Expansão de terreno ---------- */
function expansionPrice() {
  return Math.round(LAND_EXPANSION.basePrice * Math.pow(LAND_EXPANSION.priceGrowth, game.landExpansions));
}

function canExpand() {
  return game.landExpansions < LAND_EXPANSION.maxExpansions;
}

function buyLand() {
  if (!canExpand()) { showToast(t('toast.expandLimit')); return false; }
  const price = expansionPrice();
  if (game.coins < price) { showToast(t('toast.noCoins')); return false; }
  addCoins(-price);
  game.landExpansions++;
  game.stats.land_expansions = game.landExpansions;

  // adiciona um anel de 2 tiles ao redor da área atual
  const a = game.ownedArea;
  const ring = 2;
  a.x0 = Math.max(0, a.x0 - ring);
  a.y0 = Math.max(0, a.y0 - ring);
  a.x1 = Math.min(GRID_SIZE - 1, a.x1 + ring);
  a.y1 = Math.min(GRID_SIZE - 1, a.y1 + ring);

  addXp(60);
  playSound('level');
  showToast(t('toast.landExpanded', { w: a.x1 - a.x0 + 1, h: a.y1 - a.y0 + 1 }));
  return true;
}

/* ---------- Missões e conquistas ---------- */
function missionProgress(m) {
  return Math.min(m.target, game.stats[m.stat] || 0);
}

function claimMission(m) {
  if (game.missionsClaimed.includes(m.id)) return false;
  if (missionProgress(m) < m.target) return false;
  game.missionsClaimed.push(m.id);
  addCoins(m.rewardCoins);
  addXp(m.rewardXp);
  playSound('level');
  showToast(t('toast.missionDone', { c: m.rewardCoins, x: m.rewardXp }));
  return true;
}

function achievementProgress(a) {
  return Math.min(a.target, game.stats[a.stat] || 0);
}

function claimAchievement(a) {
  if (game.achievementsClaimed.includes(a.id)) return false;
  if (achievementProgress(a) < a.target) return false;
  game.achievementsClaimed.push(a.id);
  addCoins(a.rewardCoins);
  playSound('level');
  showToast(t('toast.achievementDone', { c: a.rewardCoins }));
  return true;
}

function autoClaimReady() {
  for (const m of MISSIONS) {
    if (!game.missionsClaimed.includes(m.id) && missionProgress(m) >= m.target) claimMission(m);
  }
  for (const a of ACHIEVEMENTS) {
    if (!game.achievementsClaimed.includes(a.id) && achievementProgress(a) >= a.target) claimAchievement(a);
  }
}

/* ---------- Salvamento ---------- */
function saveGame(showToastMsg) {
  try {
    const data = {
      coins: game.coins, gems: game.gems, xp: game.xp, level: game.level,
      farmName: game.farmName, ownedArea: game.ownedArea,
      buildings: game.buildings, nextId: game.nextId,
      stats: game.stats, missionsClaimed: game.missionsClaimed,
      achievementsClaimed: game.achievementsClaimed,
      settings: game.settings, landExpansions: game.landExpansions
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    if (showToastMsg) showToast(t('toast.saved'));
    return true;
  } catch (e) {
    console.error('Falha ao salvar', e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    Object.assign(game, {
      coins: data.coins ?? 750, gems: data.gems ?? 5,
      xp: data.xp ?? 0, level: data.level ?? 1,
      farmName: data.farmName ?? 'Fazenda do Jogador',
      ownedArea: data.ownedArea ?? { ...START_AREA },
      buildings: data.buildings ?? [], nextId: data.nextId ?? 1,
      stats: data.stats ?? {}, missionsClaimed: data.missionsClaimed ?? [],
      achievementsClaimed: data.achievementsClaimed ?? [],
      settings: { ...game.settings, ...(data.settings ?? {}) },
      landExpansions: data.landExpansions ?? 0
    });
    game.stats.level = game.level;
    game.stats.peak_coins = Math.max(game.stats.peak_coins || 0, game.coins);
    occupancy.fill(null);
    for (const b of game.buildings) markOccupancy(b, true);
    return true;
  } catch (e) {
    console.error('Falha ao carregar', e);
    return false;
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}
