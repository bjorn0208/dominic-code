/* ================= FAZENDA 3D — RENDERIZAÇÃO =================
   Desenha terreno, construções, prévia fantasma e destaques. */

const COLORS = {
  grassOwned: '#7ec850',
  grassOwnedAlt: '#76c14a',
  grassLocked: '#5da03f',
  grassLockedAlt: '#57993b',
  dirt: '#c8a061',
  water: '#4fc3f7',
  stone: '#9e9e9e'
};

function render(ctx, cam, cw, ch, state) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#6ab04a';
  ctx.fillRect(0, 0, cw, ch);

  const view = visibleGridRange(cam, cw, ch);

  drawTerrain(ctx, cam, cw, ch, view);
  drawBuildings(ctx, cam, cw, ch, state);
  if (state.ghost) drawGhost(ctx, cam, cw, ch, state);
  if (state.highlightTile) drawTileHighlight(ctx, cam, cw, ch, state.highlightTile);
}

/* Faixa de grid visível (culling simples). */
function visibleGridRange(cam, cw, ch) {
  const corners = [
    screenToWorld(cam, 0, 0, cw, ch),
    screenToWorld(cam, cw, 0, cw, ch),
    screenToWorld(cam, 0, ch, cw, ch),
    screenToWorld(cam, cw, ch, cw, ch)
  ].map(w => screenToGrid(w.x, w.y));
  return {
    x0: Math.max(0, Math.min(...corners.map(c => c.gx)) - 2),
    y0: Math.max(0, Math.min(...corners.map(c => c.gy)) - 2),
    x1: Math.min(GRID_SIZE, Math.max(...corners.map(c => c.gx)) + 3),
    y1: Math.min(GRID_SIZE, Math.max(...corners.map(c => c.gy)) + 3)
  };
}

function drawTerrain(ctx, cam, cw, ch, view) {
  const a = game.ownedArea;
  for (let x = view.x0; x < view.x1; x++) {
    for (let y = view.y0; y < view.y1; y++) {
      const corners = tileCorners(cam, cw, ch, x, y);
      const owned = inOwnedArea(x, y);
      const alt = (x + y) % 2 === 0;
      let fill = owned
        ? (alt ? COLORS.grassOwned : COLORS.grassOwnedAlt)
        : (alt ? COLORS.grassLocked : COLORS.grassLockedAlt);
      drawTileDiamond(ctx, corners, fill, 'rgba(0,0,0,0.06)');
    }
  }
  // borda da área possuída
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  const pA = [
    projectPoint(a.x0, a.y0, 0), projectPoint(a.x1 + 1, a.y0, 0),
    projectPoint(a.x1 + 1, a.y1 + 1, 0), projectPoint(a.x0, a.y1 + 1, 0)
  ].map(pt => worldToScreen(cam, pt.x, pt.y, cw, ch));
  ctx.beginPath();
  ctx.moveTo(pA[0].x, pA[0].y); ctx.lineTo(pA[1].x, pA[1].y);
  ctx.lineTo(pA[2].x, pA[2].y); ctx.lineTo(pA[3].x, pA[3].y);
  ctx.closePath(); ctx.stroke();
}

function drawTileHighlight(ctx, cam, cw, ch, tile) {
  const corners = tileCorners(cam, cw, ch, tile.gx, tile.gy);
  drawTileDiamond(ctx, corners, 'rgba(255,235,59,0.35)', 'rgba(255,235,59,0.9)');
}

/* ---------- Desenho das construções ---------- */
function drawBuildings(ctx, cam, cw, ch, state) {
  const sorted = [...game.buildings].sort((a, b) =>
    (a.gx + a.gy + footprintOf(a.type, a.rot).w + footprintOf(a.type, a.rot).d) -
    (b.gx + b.gy + footprintOf(b.type, b.rot).w + footprintOf(b.type, b.rot).d));

  let selected = null;
  for (const b of sorted) {
    if (state.mode === 'move' && state.moveId === b.id) { selected = b; continue; }
    // no modo girar o fantasma já mostra a rotação; não desenhar a original por cima
    if (state.mode === 'rotate' && state.rotateId === b.id) continue;
    drawBuilding(ctx, cam, cw, ch, b);
  }
  if (selected) drawBuilding(ctx, cam, cw, ch, selected, true);
}

function drawBuilding(ctx, cam, cw, ch, b, selected) {
  const def = BUILDINGS[b.type];
  const f = footprintOf(b.type, b.rot);
  const gx = b.gx, gy = b.gy, w = f.w, d = f.d;
  const q = game.settings.quality;

  if (selected) {
    // destaque de seleção
    const p = [
      projectPoint(gx, gy, 0), projectPoint(gx + w, gy, 0),
      projectPoint(gx + w, gy + d, 0), projectPoint(gx, gy + d, 0)
    ].map(pt => worldToScreen(cam, pt.x, pt.y, cw, ch));
    ctx.fillStyle = 'rgba(255,235,59,0.35)';
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y);
    ctx.lineTo(p[2].x, p[2].y); ctx.lineTo(p[3].x, p[3].y);
    ctx.closePath(); ctx.fill();
  }

  switch (b.type) {
    case 'house':   drawHouse(ctx, cam, cw, ch, gx, gy, w, d, q); break;
    case 'barn':    drawBarn(ctx, cam, cw, ch, gx, gy, w, d, q); break;
    case 'stable':  drawStable(ctx, cam, cw, ch, gx, gy, w, d, q); break;
    case 'coop':    drawCoop(ctx, cam, cw, ch, gx, gy, w, d, q); break;
    case 'well':    drawWell(ctx, cam, cw, ch, gx, gy, q); break;
    case 'stall':   drawStall(ctx, cam, cw, ch, gx, gy, w, d, q); break;
    case 'fence':   drawFence(ctx, cam, cw, ch, gx, gy, b.rot, q); break;
    case 'tree':    drawTree(ctx, cam, cw, ch, gx, gy, q); break;
    case 'flowers': drawFlowers(ctx, cam, cw, ch, gx, gy); break;
    case 'path':    drawPath(ctx, cam, cw, ch, gx, gy); break;
  }
}

/* --- Casa: paredes brancas, telhado vermelho, porta e janelas --- */
function drawHouse(ctx, cam, cw, ch, gx, gy, w, d, q) {
  const wallH = 0.9;
  drawPrism(ctx, cam, cw, ch, gx + 0.15, gy + 0.15, w - 0.3, d - 0.3, wallH, '#f5f0e6');
  drawGableRoof(ctx, cam, cw, ch, gx + 0.05, gy + 0.05, w - 0.1, d - 0.1, wallH, 0.75, '#d84343', 'x');
  // porta (face direita)
  const door = [projectPoint(gx + w - 0.15, gy + d * 0.45, 0), projectPoint(gx + w - 0.15, gy + d * 0.45 + 0.5, 0),
                projectPoint(gx + w - 0.15, gy + d * 0.45 + 0.5, 0.55), projectPoint(gx + w - 0.15, gy + d * 0.45, 0.55)]
    .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.moveTo(door[0].x, door[0].y); ctx.lineTo(door[1].x, door[1].y);
  ctx.lineTo(door[2].x, door[2].y); ctx.lineTo(door[3].x, door[3].y);
  ctx.closePath(); ctx.fill();
  // janelas (face esquerda)
  ctx.fillStyle = '#7ec8e3';
  for (const wy of [0.2, 0.65]) {
    const win = [projectPoint(gx + w * wy, gy + d - 0.15, 0.35), projectPoint(gx + w * wy + 0.4, gy + d - 0.15, 0.35),
                 projectPoint(gx + w * wy + 0.4, gy + d - 0.15, 0.7), projectPoint(gx + w * wy, gy + d - 0.15, 0.7)]
      .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
    ctx.beginPath();
    ctx.moveTo(win[0].x, win[0].y); ctx.lineTo(win[1].x, win[1].y);
    ctx.lineTo(win[2].x, win[2].y); ctx.lineTo(win[3].x, win[3].y);
    ctx.closePath(); ctx.fill();
  }
}

/* --- Celeiro: vermelho com detalhes brancos --- */
function drawBarn(ctx, cam, cw, ch, gx, gy, w, d, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.1, gy + 0.1, w - 0.2, d - 0.2, 0.8, '#c62828');
  drawGableRoof(ctx, cam, cw, ch, gx, gy, w, d, 0.8, 0.7, '#8d6e63', 'x');
  // portão branco em X
  const door = [projectPoint(gx + w / 2 - 0.35, gy + d - 0.12, 0), projectPoint(gx + w / 2 + 0.35, gy + d - 0.12, 0),
                projectPoint(gx + w / 2 + 0.35, gy + d - 0.12, 0.6), projectPoint(gx + w / 2 - 0.35, gy + d - 0.12, 0.6)]
    .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
  ctx.fillStyle = '#efebe9';
  ctx.beginPath();
  ctx.moveTo(door[0].x, door[0].y); ctx.lineTo(door[1].x, door[1].y);
  ctx.lineTo(door[2].x, door[2].y); ctx.lineTo(door[3].x, door[3].y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(door[0].x, door[0].y); ctx.lineTo(door[2].x, door[2].y);
  ctx.moveTo(door[1].x, door[1].y); ctx.lineTo(door[3].x, door[3].y);
  ctx.stroke();
}

/* --- Estábulo: marrom com telhado vermelho --- */
function drawStable(ctx, cam, cw, ch, gx, gy, w, d, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.1, gy + 0.1, w - 0.2, d - 0.2, 0.7, '#a1887f');
  drawGableRoof(ctx, cam, cw, ch, gx, gy, w, d, 0.7, 0.55, '#d84343', 'x');
  // cerca do curral frontal
  drawPrism(ctx, cam, cw, ch, gx + 0.2, gy + d - 0.1, w - 0.4, 0.08, 0.3, '#8d6e63');
}

/* --- Galinheiro: pequeno, marrom com telhado vermelho --- */
function drawCoop(ctx, cam, cw, ch, gx, gy, w, d, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.15, gy + 0.15, w - 0.3, d - 0.3, 0.55, '#bcaaa4');
  drawGableRoof(ctx, cam, cw, ch, gx + 0.05, gy + 0.05, w - 0.1, d - 0.1, 0.55, 0.45, '#e57373', 'x');
  // rampinha
  drawPrism(ctx, cam, cw, ch, gx + w / 2 - 0.1, gy + d - 0.05, 0.2, 0.3, 0.08, '#8d6e63');
}

/* --- Poço: base de pedra + água animada + suporte --- */
function drawWell(ctx, cam, cw, ch, gx, gy, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.15, gy + 0.15, 0.7, 0.7, 0.35, '#9e9e9e');
  // água (anima com o tempo)
  const t = performance.now() / 1000;
  const lvl = 0.3 + Math.sin(t * 2) * 0.03;
  const water = [projectPoint(gx + 0.25, gy + 0.25, lvl), projectPoint(gx + 0.75, gy + 0.25, lvl),
                 projectPoint(gx + 0.75, gy + 0.75, lvl), projectPoint(gx + 0.25, gy + 0.75, lvl)]
    .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
  ctx.fillStyle = COLORS.water;
  ctx.beginPath();
  ctx.moveTo(water[0].x, water[0].y); ctx.lineTo(water[1].x, water[1].y);
  ctx.lineTo(water[2].x, water[2].y); ctx.lineTo(water[3].x, water[3].y);
  ctx.closePath(); ctx.fill();
  // estrutura de madeira + telhado
  drawPrism(ctx, cam, cw, ch, gx + 0.2, gy + 0.2, 0.08, 0.08, 0.85, '#6d4c41');
  drawPrism(ctx, cam, cw, ch, gx + 0.72, gy + 0.2, 0.08, 0.08, 0.85, '#6d4c41');
  drawGableRoof(ctx, cam, cw, ch, gx + 0.05, gy + 0.05, 0.9, 0.9, 0.85, 0.3, '#c62828', 'x');
}

/* --- Barraca de vendas: balcão + toldo listrado --- */
function drawStall(ctx, cam, cw, ch, gx, gy, w, d, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.1, gy + 0.2, w - 0.2, d - 0.35, 0.5, '#d7a86e');
  // pernas do toldo
  drawPrism(ctx, cam, cw, ch, gx + 0.15, gy + 0.15, 0.07, 0.07, 1.0, '#8d6e63');
  drawPrism(ctx, cam, cw, ch, gx + w - 0.22, gy + 0.15, 0.07, 0.07, 1.0, '#8d6e63');
  // toldo listrado
  const stripes = 4;
  for (let i = 0; i < stripes; i++) {
    const x0 = gx + 0.05 + (w - 0.1) * (i / stripes);
    const x1 = gx + 0.05 + (w - 0.1) * ((i + 1) / stripes);
    const c = i % 2 === 0 ? '#e53935' : '#ffffff';
    const quad = [projectPoint(x0, gy + 0.05, 1.0), projectPoint(x1, gy + 0.05, 1.0),
                  projectPoint(x1, gy + d - 0.05, 0.85), projectPoint(x0, gy + d - 0.05, 0.85)]
      .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(quad[0].x, quad[0].y); ctx.lineTo(quad[1].x, quad[1].y);
    ctx.lineTo(quad[2].x, quad[2].y); ctx.lineTo(quad[3].x, quad[3].y);
    ctx.closePath(); ctx.fill();
  }
}

/* --- Cerca: poste + travessas orientadas pela rotação --- */
function drawFence(ctx, cam, cw, ch, gx, gy, rot, q) {
  const horizontal = rot % 2 === 0;
  drawPrism(ctx, cam, cw, ch, gx + 0.42, gy + 0.42, 0.16, 0.16, 0.55, '#a1887f');
  if (horizontal) {
    drawPrism(ctx, cam, cw, ch, gx + 0.05, gy + 0.44, 0.9, 0.08, 0.12, '#8d6e63');
    drawPrism(ctx, cam, cw, ch, gx + 0.05, gy + 0.44, 0.9, 0.08, 0.34, '#8d6e63');
  } else {
    drawPrism(ctx, cam, cw, ch, gx + 0.44, gy + 0.05, 0.08, 0.9, 0.12, '#8d6e63');
    drawPrism(ctx, cam, cw, ch, gx + 0.44, gy + 0.05, 0.08, 0.9, 0.34, '#8d6e63');
  }
}

/* --- Árvore: tronco + copa em esferas --- */
function drawTree(ctx, cam, cw, ch, gx, gy, q) {
  drawPrism(ctx, cam, cw, ch, gx + 0.42, gy + 0.42, 0.16, 0.16, 0.5, '#795548');
  drawSphere(ctx, cam, cw, ch, gx + 0.5, gy + 0.5, 0.9, 0.5, '#43a047');
  if (q !== 'baixa') {
    drawSphere(ctx, cam, cw, ch, gx + 0.32, gy + 0.45, 0.68, 0.34, '#4caf50');
    drawSphere(ctx, cam, cw, ch, gx + 0.66, gy + 0.6, 0.72, 0.3, '#388e3c');
  }
}

function drawFlowers(ctx, cam, cw, ch, gx, gy) {
  drawPrism(ctx, cam, cw, ch, gx + 0.15, gy + 0.15, 0.7, 0.7, 0.12, '#6d4c41');
  const colors = ['#e91e63', '#ffeb3b', '#9c27b0', '#ff5722'];
  const t = performance.now() / 600;
  for (let i = 0; i < 4; i++) {
    const fx = gx + 0.3 + (i % 2) * 0.4;
    const fy = gy + 0.3 + Math.floor(i / 2) * 0.4;
    const sway = Math.sin(t + i) * 0.02;
    drawSphere(ctx, cam, cw, ch, fx + sway, fy, 0.26, 0.13, colors[i]);
  }
}

function drawPath(ctx, cam, cw, ch, gx, gy) {
  const corners = tileCorners(cam, cw, ch, gx, gy);
  drawTileDiamond(ctx, corners, COLORS.stone, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  const mid = [projectPoint(gx + 0.35, gy + 0.35, 0), projectPoint(gx + 0.6, gy + 0.5, 0)]
    .map(p => worldToScreen(cam, p.x, p.y, cw, ch));
  ctx.beginPath(); ctx.arc(mid[0].x, mid[0].y, 4 * cam.zoom, 0, Math.PI * 2); ctx.fill();
}

/* ---------- Prévia fantasma (construir / mover / girar) ---------- */
function drawGhost(ctx, cam, cw, ch, state) {
  const g = state.ghost;
  const valid = g.valid;
  const f = footprintOf(g.type, g.rot);

  // losangos do footprint
  for (let x = g.gx; x < g.gx + f.w; x++) {
    for (let y = g.gy; y < g.gy + f.d; y++) {
      const corners = tileCorners(cam, cw, ch, x, y);
      drawTileDiamond(ctx, corners,
        valid ? 'rgba(76,175,80,0.45)' : 'rgba(229,57,53,0.45)',
        valid ? 'rgba(46,125,50,0.9)' : 'rgba(183,28,28,0.9)');
    }
  }

  if (!valid) return;

  // desenho semitransparente da construção
  const fake = { id: -1, type: g.type, gx: g.gx, gy: g.gy, rot: g.rot };
  ctx.globalAlpha = 0.65;
  drawBuilding(ctx, cam, cw, ch, fake, false);
  ctx.globalAlpha = 1;
}
