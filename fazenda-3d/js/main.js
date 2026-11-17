/* ================= FAZENDA 3D — INICIALIZAÇÃO, ENTRADA E LOOP ================= */

const canvas = $('game-canvas');
const ctx = canvas.getContext('2d');

const cam = { x: 0, y: 0, zoom: 1 };
const MIN_ZOOM = 0.5, MAX_ZOOM = 2.2;

const state = {
  mode: 'idle',        // idle | build | move | remove | rotate
  ghost: null,         // {type, gx, gy, rot, valid}
  moveId: null,
  rotateId: null,
  ghostPinned: false,  // posição fixa aguardando confirmação
  highlightTile: null
};

let lastPointerGrid = { gx: 12, gy: 12 };

/* ---------- Canvas / resize ---------- */
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

/* ---------- Câmera ---------- */
function centerCamera() {
  const c = projectPoint((game.ownedArea.x0 + game.ownedArea.x1 + 1) / 2,
                         (game.ownedArea.y0 + game.ownedArea.y1 + 1) / 2, 0);
  cam.x = c.x; cam.y = c.y;
}

function clampCamera() {
  const limit = GRID_SIZE * TILE_W / 2 + 200;
  cam.x = Math.max(-limit, Math.min(limit, cam.x));
  cam.y = Math.max(-limit, Math.min(limit, cam.y));
}

function zoomAt(sx, sy, factor) {
  const before = screenToWorld(cam, sx, sy, canvas.clientWidth, canvas.clientHeight);
  cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * factor));
  const after = screenToWorld(cam, sx, sy, canvas.clientWidth, canvas.clientHeight);
  cam.x += before.x - after.x;
  cam.y += before.y - after.y;
  clampCamera();
}

/* ---------- Entrada: mouse e toque ---------- */
const pointer = { down: false, dragging: false, sx: 0, sy: 0, cx: 0, cy: 0 };
const touches = new Map();
let pinchActive = false;
let pinchDist = 0;

function eventPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function gridFromEvent(e) {
  const p = eventPos(e);
  const w = screenToWorld(cam, p.x, p.y, canvas.clientWidth, canvas.clientHeight);
  lastPointerGrid = screenToGrid(w.x, w.y);
  return lastPointerGrid;
}

canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  if (e.pointerType === 'touch') {
    touches.set(e.pointerId, eventPos(e));
    if (touches.size === 2) {
      pinchActive = true;
      const [a, b] = [...touches.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      return;
    }
  }

  pointer.down = true; pointer.dragging = false;
  pointer.sx = e.clientX; pointer.sy = e.clientY;
  pointer.cx = cam.x; pointer.cy = cam.y;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
    touches.set(e.pointerId, eventPos(e));
    if (touches.size >= 2) {
      const [a, b] = [...touches.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) {
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        zoomAt(mid.x, mid.y, d / pinchDist);
      }
      pinchDist = d;
      return;
    }
  }

  gridFromEvent(e);

  if (pointer.down) {
    const dx = e.clientX - pointer.sx, dy = e.clientY - pointer.sy;
    if (!pointer.dragging && Math.abs(dx) + Math.abs(dy) > 6) pointer.dragging = true;
    if (pointer.dragging) {
      cam.x = pointer.cx - dx / cam.zoom;
      cam.y = pointer.cy - dy / cam.zoom;
      clampCamera();
      canvas.classList.add('dragging');
    }
  }

  if (!state.ghostPinned && state.ghost &&
      (state.mode === 'build' || (state.mode === 'move' && state.moveId))) {
    updateGhostPosition(lastPointerGrid.gx, lastPointerGrid.gy);
  }
});

function endPointer(e) {
  const wasPinch = pinchActive;

  if (e.pointerType === 'touch') touches.delete(e.pointerId);

  if (touches.size === 1 && wasPinch) {
    // pinça -> 1 dedo restante: reancora a câmera sem dar salto
    const [a] = [...touches.values()];
    const rect = canvas.getBoundingClientRect();
    pointer.down = true; pointer.dragging = false;
    pointer.sx = rect.left + a.x; pointer.sy = rect.top + a.y;
    pointer.cx = cam.x; pointer.cy = cam.y;
  }
  if (touches.size === 0) {
    pinchActive = false;
    pinchDist = 0;
  }

  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (wasPinch) {
    canvas.classList.remove('dragging');
    if (touches.size === 0) pointer.down = false;
    return;
  }
  if (!pointer.down) return;

  canvas.classList.remove('dragging');
  const wasDragging = pointer.dragging;
  pointer.down = false; pointer.dragging = false;
  if (!wasDragging) handleClick(e);
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const p = eventPos(e);
  zoomAt(p.x, p.y, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

/* ---------- Clique no mundo ---------- */
function handleClick(e) {
  const g = gridFromEvent(e);

  if (state.mode === 'build' && state.ghost) {
    if (state.ghostPinned) {
      // novo clique reposiciona o fantasma em vez de ficar preso
      state.ghostPinned = false;
      hideConfirmBar();
      updateGhostPosition(g.gx, g.gy);
      if (state.ghost.valid) {
        state.ghostPinned = true;
        const def = BUILDINGS[state.ghost.type];
        showConfirmBar(t('confirm.build', { icon: def.icon, name: t('b_' + def.id), price: def.price.toLocaleString('pt-BR') }));
      }
      return;
    }
    updateGhostPosition(g.gx, g.gy);
    if (state.ghost.valid) {
      state.ghostPinned = true;
      const def = BUILDINGS[state.ghost.type];
      showConfirmBar(t('confirm.build', { icon: def.icon, name: t('b_' + def.id), price: def.price.toLocaleString('pt-BR') }));
    } else {
      playSound('error');
      showToast(t('toast.invalid'));
    }
    return;
  }

  if (state.mode === 'move') {
    if (!state.moveId) {
      const sel = buildingAt(g.gx, g.gy);
      if (!sel) { showToast(t('toast.clickBuilding')); return; }
      state.moveId = sel.id;
      state.ghost = { type: sel.type, gx: sel.gx, gy: sel.gy, rot: sel.rot, valid: true };
      showToast(t('toast.moveSelect'));
      return;
    }
    if (state.ghostPinned) {
      state.ghostPinned = false;
      hideConfirmBar();
      updateGhostPosition(g.gx, g.gy);
      if (state.ghost.valid) {
        state.ghostPinned = true;
        showConfirmBar(t('confirm.move'));
      }
      return;
    }
    updateGhostPosition(g.gx, g.gy);
    if (state.ghost.valid) {
      state.ghostPinned = true;
      showConfirmBar(t('confirm.move'));
    } else {
      playSound('error');
      showToast(t('toast.invalid'));
    }
    return;
  }

  const b = buildingAt(g.gx, g.gy);

  if (state.mode === 'remove') {
    if (b) {
      const def = BUILDINGS[b.type];
      const refund = Math.floor(def.price * def.refund);
      confirmDialog(
        t('dialog.removeText', { icon: def.icon, name: t('b_' + def.id), refund: refund.toLocaleString('pt-BR') }),
        () => {
          const r = removeBuilding(b.id);
          if (r) showToast(t('toast.removed', { refund: r.refund.toLocaleString('pt-BR') }));
          refreshHud();
          autoClaimReady();
        });
    } else {
      showToast(t('toast.removeHint'));
    }
    return;
  }

  if (state.mode === 'rotate') {
    if (b) {
      const def = BUILDINGS[b.type];
      if (def.w === 1 && def.d === 1) {
        showToast(t('toast.noRotate'));
        return;
      }
      state.rotateId = b.id;
      const newRot = (b.rot + 1) % 4;
      const valid = canPlace(b.type, b.gx, b.gy, newRot, b.id);
      state.ghost = { type: b.type, gx: b.gx, gy: b.gy, rot: newRot, valid };
      state.ghostPinned = true;
      showConfirmBar(t('confirm.rotate'));
    } else {
      showToast(t('toast.rotateHint'));
    }
    return;
  }

  // modo normal: destaque informativo
  if (b) {
    const def = BUILDINGS[b.type];
    state.highlightTile = { gx: b.gx, gy: b.gy };
    showToast(t('toast.highlight', { icon: def.icon, name: t('b_' + def.id) }));
    setTimeout(() => { state.highlightTile = null; }, 1200);
  }
}

/* ---------- Fantasma ---------- */
function updateGhostPosition(gx, gy) {
  if (!state.ghost) return;
  const g = state.ghost;
  const f = footprintOf(g.type, g.rot);
  g.gx = Math.max(0, Math.min(GRID_SIZE - f.w, gx));
  g.gy = Math.max(0, Math.min(GRID_SIZE - f.d, gy));
  g.valid = canPlace(g.type, g.gx, g.gy, g.rot, state.moveId || undefined);
}

/* ---------- Modos ---------- */
function setMode(mode) {
  state.mode = mode;
  state.ghost = null;
  state.ghostPinned = false;
  state.moveId = null;
  state.rotateId = null;
  hideConfirmBar();
  canvas.classList.remove('mode-build', 'mode-move', 'mode-remove', 'mode-rotate');
  if (mode !== 'idle') canvas.classList.add('mode-' + mode);
  for (const btn of document.querySelectorAll('.build-btn')) btn.classList.remove('active');
  const map = { build: 'btn-build', move: 'btn-move', remove: 'btn-remove', rotate: 'btn-rotate' };
  if (map[mode]) $(map[mode]).classList.add('active');
}

function enterBuildMode(typeId) {
  setMode('build');
  const def = BUILDINGS[typeId];
  state.ghost = { type: typeId, gx: lastPointerGrid.gx, gy: lastPointerGrid.gy, rot: 0, valid: false };
  updateGhostPosition(lastPointerGrid.gx, lastPointerGrid.gy);
  showToast(t('toast.buildHint', { icon: def.icon }));
}

const uiHandlers = {
  build() {
    if (state.mode === 'build' && !state.ghostPinned) { setMode('idle'); return; }
    playSound('click');
    openShop();
  },
  move() {
    playSound('click');
    if (state.mode === 'move') { setMode('idle'); return; }
    setMode('move');
    showToast(t('toast.moveHint'));
  },
  remove() {
    playSound('click');
    if (state.mode === 'remove') { setMode('idle'); return; }
    setMode('remove');
    showToast(t('toast.removeHint'));
  },
  rotate() {
    playSound('click');
    if (state.mode === 'rotate') { setMode('idle'); return; }
    setMode('rotate');
    showToast(t('toast.rotateHint'));
  },
  confirmOk() {
    if (state.mode === 'build' && state.ghost) {
      const b = placeBuilding(state.ghost.type, state.ghost.gx, state.ghost.gy, state.ghost.rot);
      if (b) {
        showToast(t('toast.built', { icon: BUILDINGS[b.type].icon, name: t('b_' + b.type) }));
        autoClaimReady();
        refreshHud();
        // continua no modo construir, fantasma livre a partir do cursor
        const type = state.ghost.type;
        setMode('build');
        state.ghost = { type, gx: lastPointerGrid.gx, gy: lastPointerGrid.gy, rot: 0, valid: false };
        updateGhostPosition(lastPointerGrid.gx, lastPointerGrid.gy);
      }
    } else if (state.mode === 'move' && state.moveId && state.ghost) {
      if (moveBuilding(state.moveId, state.ghost.gx, state.ghost.gy, state.ghost.rot)) {
        showToast(t('toast.moved'));
        autoClaimReady();
      }
      setMode('idle');
    } else if (state.mode === 'rotate' && state.rotateId) {
      if (rotateBuilding(state.rotateId)) {
        showToast(t('toast.rotated'));
      } else {
        playSound('error');
        showToast(t('toast.rotateNoSpace'));
      }
      setMode('idle');
    } else {
      hideConfirmBar();
    }
  },
  confirmCancel() {
    setMode('idle');
  }
};

/* ---------- Teclado ---------- */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('modal-overlay').classList.contains('hidden')) { closeModal(); return; }
    if (!$('dialog-overlay').classList.contains('hidden')) {
      $('dialog-overlay').classList.add('hidden');
      dialogCallback = null;
      return;
    }
    setMode('idle');
    return;
  }
  if ((e.key === 'r' || e.key === 'R') && state.ghost && !state.ghostPinned &&
      (state.mode === 'build' || state.mode === 'move')) {
    state.ghost.rot = (state.ghost.rot + 1) % 4;
    updateGhostPosition(state.ghost.gx, state.ghost.gy);
  }
  if (e.key === 'Enter' && state.ghostPinned) uiHandlers.confirmOk();
});

/* ---------- Salvamento ao sair ---------- */
window.addEventListener('beforeunload', () => saveGame(false));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGame(false);
});

/* ---------- Loop ---------- */
let lastTime = 0;
let autosaveAcc = 0;

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 1);
  lastTime = ts;
  render(ctx, cam, canvas.clientWidth, canvas.clientHeight, state);
  autosaveAcc += dt;
  if (autosaveAcc > 15) { autosaveAcc = 0; saveGame(false); }
  requestAnimationFrame(loop);
}

/* ---------- Início ---------- */
function init() {
  resize();
  const loaded = loadGame();
  if (!loaded) {
    // propriedade inicial: casa e poço já construídos
    placeBuilding('house', 12, 12, 0, true);
    placeBuilding('well', 16, 16, 0, true);
    saveGame(false);
  }
  game.stats.level = game.level;
  game.stats.peak_coins = Math.max(game.stats.peak_coins || 0, game.coins);
  applyLang();
  centerCamera();
  bindUi(uiHandlers);
  refreshHud();
  requestAnimationFrame(loop);
  if (!loaded) showToast(t('toast.welcome'));
}

init();
