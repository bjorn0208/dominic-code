/* ================= FAZENDA 3D — PROJEÇÃO ISOMÉTRICA E PRIMITIVAS DE DESENHO ================= */

const TILE_W = 64;   // largura do losango em px (zoom 1)
const TILE_H = 32;   // altura do losango em px
const TILE_Z = 28;   // altura de 1 unidade "z" em px

/* Converte coordenadas de grade (podem ser fracionárias) + altura em coords de mundo. */
function projectPoint(gx, gy, gz) {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2) - gz * TILE_Z
  };
}

/* Converte coords de tela (mundo, sem câmera) para grade (inteiro do tile). */
function screenToGrid(wx, wy) {
  const a = wx / (TILE_W / 2);
  const b = wy / (TILE_H / 2);
  const gx = (b + a) / 2;
  const gy = (b - a) / 2;
  return { gx: Math.floor(gx), gy: Math.floor(gy) };
}

/* Aplica câmera: mundo → tela. */
function worldToScreen(cam, wx, wy, canvasW, canvasH) {
  return {
    x: (wx - cam.x) * cam.zoom + canvasW / 2,
    y: (wy - cam.y) * cam.zoom + canvasH / 2
  };
}

/* Tela → mundo (sem câmera). */
function screenToWorld(cam, sx, sy, canvasW, canvasH) {
  return {
    x: (sx - canvasW / 2) / cam.zoom + cam.x,
    y: (sy - canvasH / 2) / cam.zoom + cam.y
  };
}

/* ---------- Primitivas de desenho ---------- */

function shadeColor(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `rgb(${r},${g},${b})`;
}

/* Desenha um prisma isométrico (caixa) na grade, com faces sombreadas. */
function drawPrism(ctx, cam, cw, ch, gx, gy, w, d, h, color, alpha) {
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  const p = [
    projectPoint(gx, gy, 0), projectPoint(gx + w, gy, 0),
    projectPoint(gx + w, gy + d, 0), projectPoint(gx, gy + d, 0),
    projectPoint(gx, gy, h), projectPoint(gx + w, gy, h),
    projectPoint(gx + w, gy + d, h), projectPoint(gx, gy + d, h)
  ].map(pt => worldToScreen(cam, pt.x, pt.y, cw, ch));

  // face esquerda (gy+d)
  ctx.fillStyle = shadeColor(color, 0.72);
  ctx.beginPath();
  ctx.moveTo(p[3].x, p[3].y); ctx.lineTo(p[2].x, p[2].y);
  ctx.lineTo(p[6].x, p[6].y); ctx.lineTo(p[7].x, p[7].y);
  ctx.closePath(); ctx.fill();

  // face direita (gx+w)
  ctx.fillStyle = shadeColor(color, 0.88);
  ctx.beginPath();
  ctx.moveTo(p[2].x, p[2].y); ctx.lineTo(p[1].x, p[1].y);
  ctx.lineTo(p[5].x, p[5].y); ctx.lineTo(p[6].x, p[6].y);
  ctx.closePath(); ctx.fill();

  // topo
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(p[4].x, p[4].y); ctx.lineTo(p[5].x, p[5].y);
  ctx.lineTo(p[6].x, p[6].y); ctx.lineTo(p[7].x, p[7].y);
  ctx.closePath(); ctx.fill();

  // contorno sutil estilo cartoon
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p[4].x, p[4].y); ctx.lineTo(p[5].x, p[5].y);
  ctx.lineTo(p[6].x, p[6].y); ctx.lineTo(p[7].x, p[7].y);
  ctx.closePath(); ctx.stroke();

  if (alpha !== undefined) ctx.globalAlpha = 1;
}

/* Telhado de duas águas (cumeeira ao longo do eixo maior). */
function drawGableRoof(ctx, cam, cw, ch, gx, gy, w, d, baseH, ridgeH, color, axis) {
  const top = shadeColor(color, 1.0);
  const sideL = shadeColor(color, 0.7);
  const sideR = shadeColor(color, 0.85);
  const alongX = axis === 'x';

  let corners, ridgeA, ridgeB;
  if (alongX) {
    corners = [
      projectPoint(gx, gy, baseH), projectPoint(gx + w, gy, baseH),
      projectPoint(gx + w, gy + d, baseH), projectPoint(gx, gy + d, baseH)
    ];
    ridgeA = projectPoint(gx, gy + d / 2, baseH + ridgeH);
    ridgeB = projectPoint(gx + w, gy + d / 2, baseH + ridgeH);
  } else {
    corners = [
      projectPoint(gx, gy, baseH), projectPoint(gx + w, gy, baseH),
      projectPoint(gx + w, gy + d, baseH), projectPoint(gx, gy + d, baseH)
    ];
    ridgeA = projectPoint(gx + w / 2, gy, baseH + ridgeH);
    ridgeB = projectPoint(gx + w / 2, gy + d, baseH + ridgeH);
  }
  const c = corners.map(pt => worldToScreen(cam, pt.x, pt.y, cw, ch));
  const ra = worldToScreen(cam, ridgeA.x, ridgeA.y, cw, ch);
  const rb = worldToScreen(cam, ridgeB.x, ridgeB.y, cw, ch);

  // duas águas
  ctx.fillStyle = sideL;
  ctx.beginPath();
  ctx.moveTo(c[0].x, c[0].y); ctx.lineTo(c[1].x, c[1].y);
  ctx.lineTo(rb.x, rb.y); ctx.lineTo(ra.x, ra.y);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = sideR;
  ctx.beginPath();
  ctx.moveTo(c[1].x, c[1].y); ctx.lineTo(c[2].x, c[2].y);
  ctx.lineTo(rb.x, rb.y);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(c[2].x, c[2].y); ctx.lineTo(c[3].x, c[3].y);
  ctx.lineTo(ra.x, ra.y); ctx.lineTo(rb.x, rb.y);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = sideR;
  ctx.beginPath();
  ctx.moveTo(c[3].x, c[3].y); ctx.lineTo(c[0].x, c[0].y);
  ctx.lineTo(ra.x, ra.y);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ra.x, ra.y); ctx.lineTo(rb.x, rb.y);
  ctx.stroke();
}

/* Losango de tile. */
function tileCorners(cam, cw, ch, gx, gy) {
  return [
    projectPoint(gx, gy, 0), projectPoint(gx + 1, gy, 0),
    projectPoint(gx + 1, gy + 1, 0), projectPoint(gx, gy + 1, 0)
  ].map(pt => worldToScreen(cam, pt.x, pt.y, cw, ch));
}

function drawTileDiamond(ctx, corners, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  ctx.lineTo(corners[1].x, corners[1].y);
  ctx.lineTo(corners[2].x, corners[2].y);
  ctx.lineTo(corners[3].x, corners[3].y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

/* Círculo "esfera" para copas de árvores. r é dado em unidades de tile. */
function drawSphere(ctx, cam, cw, ch, gx, gy, gz, r, color) {
  const p = projectPoint(gx, gy, gz);
  const s = worldToScreen(cam, p.x, p.y, cw, ch);
  const rr = r * (TILE_W / 2) * cam.zoom;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s.x, s.y, rr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shadeColor(color, 1.18);
  ctx.beginPath();
  ctx.arc(s.x - rr * 0.25, s.y - rr * 0.3, rr * 0.55, 0, Math.PI * 2);
  ctx.fill();
}
