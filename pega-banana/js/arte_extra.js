"use strict";

// =========================
// ARTE EXTRA
// - Bananeira da história (pixel art com folhas rasgadas, tronco em camadas e o "coração" roxo)
// Carregado depois de arte_chefes2.js (usa o motor de pixelarte.js e objCanvas de arte_objetos.js).
// =========================

// Folha de bananeira: segue uma curva (início no topo do tronco, ponta caída), larga no meio,
// com nervura central, nervuras laterais e rasgos nas bordas (como as folhas de verdade).
function pxFolhaBananeira(b, p0, p1, p2, larg, cores, sem, opc) {
  opc = opc || {};
  const comp = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const passos = Math.ceil(comp * 3);
  const pinta = {};
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const u = 1 - t;
    const px = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
    const py = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
    let tx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    let ty = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl; ty /= tl;
    // normal apontando "para cima" (lado de cima da folha recebe mais luz)
    let nx = -ty, ny = tx;
    if (ny > 0) { nx = -nx; ny = -ny; }
    // largura: o talo é fino, a folha alarga logo e afina na ponta
    const talo = opc.talo === undefined ? 0.12 : opc.talo;
    let w = t < talo ? 0.6 : larg * Math.pow(Math.sin(Math.PI * Math.min(1, (t - talo) / (1 - talo) * 0.97 + 0.03)), 0.55);
    const seg = Math.floor(t * (opc.rasgos || 22));
    for (let s = -w; s <= w; s += 0.35) {
      const lado = s < 0 ? 0 : 1;
      // rasgos: faixas finas da borda até perto da nervura
      if (t > talo && Math.abs(s) > w * 0.3 && pxHash(seg, lado, sem) < (opc.rasgado === undefined ? 0.2 : opc.rasgado) &&
          (t * (opc.rasgos || 22)) % 1 < 0.42) continue;
      const x = Math.round(px + nx * s), y = Math.round(py + ny * s);
      const chave = x + "," + y;
      let tom;
      if (Math.abs(s) < 0.55) tom = "nervura";
      else if (Math.abs(s) > w - 0.9) tom = 0;
      else {
        // lado de cima mais claro; nervuras laterais (curvas) mais escuras
        tom = s < 0 ? 3 : 2;
        if (Math.abs(s) < w * 0.35) tom += s < 0 ? 0 : -1;
        if (((t * (opc.rasgos || 22)) % 1) < 0.18 && Math.abs(s) > 1.2) tom -= 1;
        if (s < 0 && Math.abs(s) > w * 0.55 && pxHash(x, y, sem + 3) < 0.25) tom = 4;
      }
      // a última camada vence, menos a nervura (que fica por cima)
      if (pinta[chave] === "nervura") continue;
      pinta[chave] = tom;
    }
  }
  Object.keys(pinta).forEach(function(k) {
    const xy = k.split(",");
    const tom = pinta[k];
    pxPonto(b, +xy[0], +xy[1], tom === "nervura" ? cores.nervura : cores.f[limitar(tom, 0, cores.f.length - 1)]);
  });
}

function construirBananeira() {
  const W = 104, H = 142;
  const b = pxNovo(W, H);
  const verde = { f: ["#123d1a", "#1d5e26", "#2b8a3e", "#40c057", "#8ce99a"], nervura: "#c0eb75" };
  const fundo = { f: ["#0e2e14", "#164a1f", "#1f6b2c", "#2f9e44", "#51cf66"], nervura: "#94d82d" };
  const seca = { f: ["#3d2a10", "#5c4018", "#8a6424", "#b08a3e", "#d4b06a"], nervura: "#e8cf94" };
  const cx = 50, topo = 38;

  // folhas de trás (mais escuras)
  pxFolhaBananeira(b, [cx, topo], [36, 4], [14, 10], 9.5, fundo, 11);
  pxFolhaBananeira(b, [cx, topo], [70, 2], [90, 12], 9.5, fundo, 12);
  pxFolhaBananeira(b, [cx, topo], [50, 6], [42, 0], 4.2, fundo, 13, { rasgado: 0.05 });

  // tronco (pseudocaule): camadas de bainha, listras e cicatrizes de folhas velhas
  const T = ["#2e3a16", "#4a5a22", "#6b7a32", "#929a4a", "#bdbf72"];
  pxMembro(b, cx, H - 1, cx + 1, topo + 2, 7.2, 4.6, T, {
    rim: false,
    tex: function(x, y, i) {
      if ((y + Math.floor(x / 3)) % 9 === 0) return i - 1;           // cicatrizes horizontais
      if (Math.abs(x - 2) % 5 === 0 && pxHash(x, y >> 2, 7) < 0.6) return i - 1;   // fibras
      if (pxHash(x, y, 9) < 0.05) return i + 1;
      return i;
    }
  });
  // manchas marrons no pé do tronco
  for (let y = H - 30; y < H; y++) for (let x = cx - 8; x <= cx + 8; x++) {
    if (pxLeitura(b, x, y) && pxHash(x, y, 21) < 0.18 + (y - (H - 30)) / 60) pxPonto(b, x, y, pxHash(x, y, 22) < 0.5 ? "#5c4018" : "#3d2a10");
  }
  // folha seca pendurada no tronco
  pxFolhaBananeira(b, [cx - 2, topo + 6], [36, 50], [42, 82], 3.2, seca, 31, { rasgado: 0.35, talo: 0.05 });

  // folhas da frente: abrem em leque e caem nas pontas
  pxFolhaBananeira(b, [cx, topo], [20, 6], [2, 46], 11.5, verde, 41);
  pxFolhaBananeira(b, [cx, topo + 1], [24, 26], [10, 76], 10, verde, 42);
  pxFolhaBananeira(b, [cx, topo], [82, 4], [102, 44], 11.5, verde, 43);
  pxFolhaBananeira(b, [cx, topo + 1], [80, 24], [95, 74], 10, verde, 44);
  pxFolhaBananeira(b, [cx, topo], [58, 10], [72, 4], 5.5, verde, 45, { rasgado: 0.1 });

  // engaço: o cabo do cacho saindo da copa e descendo (a banana dourada fica pendurada nele)
  pxMembro(b, cx + 2, topo + 2, cx + 10, topo + 14, 1.4, 1.2, ["#3a4a18", "#5c6b2a", "#8a9a3a", "#b5c060"], { rim: false });
  // cachinho de bananas verdes
  [[cx + 12, topo + 12, -0.9], [cx + 14, topo + 15, -0.6], [cx + 9, topo + 16, -1.2], [cx + 13, topo + 19, -0.7]].forEach(function(p, i) {
    pxMembro(b, p[0], p[1], p[0] + Math.cos(p[2]) * 5, p[1] + Math.sin(p[2]) * 5, 1.5, 1.1,
      i % 2 ? ["#4a6a14", "#74a020", "#a9d03a", "#d8f07a"] : ["#5a7a10", "#8ab020", "#c0e040", "#ecf8a0"], { rim: false });
  });
  // "coração" da bananeira (flor roxa pendurada)
  pxMembro(b, cx + 12, topo + 20, cx + 15, topo + 30, 0.9, 0.9, ["#3a4a18", "#5c6b2a", "#8a9a3a", "#b5c060"], { rim: false });
  pxElipse(b, cx + 15.5, topo + 34, 3.2, 4.6, ["#3b0a2a", "#6a1648", "#9c2a6e", "#d0569a", "#f3a6cc"], { rim: false, ang: -0.25,
    tex: function(x, y, i) { return (y % 3 === 0) ? i - 1 : i; } });

  // brotos e capim no pé
  pxFolhaBananeira(b, [cx - 6, H - 2], [cx - 16, H - 16], [cx - 22, H - 22], 2.6, verde, 51, { rasgado: 0, talo: 0.2 });
  pxFolhaBananeira(b, [cx + 6, H - 2], [cx + 15, H - 14], [cx + 24, H - 18], 2.4, verde, 52, { rasgado: 0, talo: 0.2 });
  for (let k = 0; k < 14; k++) {
    const x = cx - 20 + Math.floor(pxHash(k, 1, 61) * 40);
    const h = 2 + Math.floor(pxHash(k, 2, 61) * 4);
    pxRet(b, x, H - h, 1, h, k % 3 ? "#2f9e44" : "#69db7c");
  }

  pxContorno(b, "#0b1f0e");
  return pxCanvas(b, 4);
}

// Onde fica a ponta do cacho (para pendurar a banana dourada), em pixels do sprite ampliado
const BANANEIRA_GANCHO = { x: (50 + 10) * 4, y: (38 + 15) * 4 };
let SPR_BANANEIRA = null;
function sprBananeira() {
  if (!SPR_BANANEIRA) SPR_BANANEIRA = construirBananeira();
  return SPR_BANANEIRA;
}

// Desenha a bananeira com a base em (x, base); balança de leve com o vento
function desenharBananeira(x, base, t, vento) {
  const s = sprBananeira();
  const balanco = Math.sin(t * 0.035) * 0.012 + (vento || 0) * (0.03 + Math.sin(t * 0.3) * 0.015);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(base));
  ctx.rotate(balanco);
  ctx.drawImage(s, -s.width / 2, -s.height);
  ctx.restore();
  // devolve onde fica o gancho do cacho (já com o balanço)
  const gx = BANANEIRA_GANCHO.x - s.width / 2, gy = BANANEIRA_GANCHO.y - s.height;
  return { x: x + gx * Math.cos(balanco) - gy * Math.sin(balanco), y: base + gx * Math.sin(balanco) + gy * Math.cos(balanco) };
}


// =========================
// MAPA DO MUNDO EM PIXEL ART (tela entre um mundo e outro)
// Desenhado numa grade de 300x175 e ampliado 4x. Cada região tem o seu bioma com detalhes;
// o caminho, a banana, o macaco e as animações (lava, ondas, nuvens) vão por cima.
// =========================

const MAPA_ESC = 4;
const MAPA_W = 300, MAPA_H = 175;

function centrosMapa() { return POS_MAPA.map(function(p) { return [p[0] / MAPA_ESC, p[1] / MAPA_ESC]; }); }

function construirMapaMundo() {
  const b = pxNovo(MAPA_W, MAPA_H);
  const C = centrosMapa();
  const h = function(x, y, s) { return pxHash(x, y, s); };
  // ---- mar: dois tons com pontilhado e marolas ----
  for (let y = 0; y < MAPA_H; y++) for (let x = 0; x < MAPA_W; x++) {
    const d = (PX_BAYER[y & 1][x & 1] + (y >> 3)) % 4;
    let cor = y < 30 ? "#1b6a96" : y < 140 ? "#1a5f86" : "#165478";
    if (d === 0 && h(x, y, 1) < 0.35) cor = "#1f72a0";
    pxPonto(b, x, y, cor);
  }
  for (let k = 0; k < 90; k++) {
    const x = Math.floor(h(k, 1, 2) * MAPA_W), y = Math.floor(h(k, 2, 2) * MAPA_H);
    pxRet(b, x, y, 3, 1, "#3d8fbd"); pxPonto(b, x + 1, y - 1, "#5aa9d3");
  }
  // ---- terra: união de manchas em volta de cada região, com borda irregular ----
  const regiao = new Array(MAPA_W * MAPA_H).fill(-1);
  const forca = function(x, y) {
    let melhor = -1, dist = 1e9;
    for (let i = 0; i < C.length; i++) {
      const dx = (x - C[i][0]) / 1.25, dy = y - C[i][1];
      const d = Math.sqrt(dx * dx + dy * dy) - 26 - (h(Math.floor(x / 3), Math.floor(y / 3), 5) - 0.5) * 8;
      if (d < dist) { dist = d; melhor = i; }
    }
    return [melhor, dist];
  };
  for (let y = 0; y < MAPA_H; y++) for (let x = 0; x < MAPA_W; x++) {
    const f = forca(x, y);
    // pontes de terra entre regiões vizinhas
    let ponte = false;
    for (let i = 0; i < C.length - 1; i++) {
      const a = C[i], c = C[i + 1];
      const vx = c[0] - a[0], vy = c[1] - a[1];
      const t = limitar(((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy), 0, 1);
      const px = a[0] + vx * t, py = a[1] + vy * t;
      if (Math.hypot(x - px, y - py) < 9 + h(x >> 2, y >> 2, 6) * 3) ponte = true;
    }
    if (f[1] < 0 || ponte) regiao[y * MAPA_W + x] = f[0];
  }
  const BASE = [
    ["#2b8a3e", "#2f9e44", "#237032"],      // selva
    ["#e9c46a", "#f2d28b", "#d4a650"],      // deserto
    ["#dbe9f6", "#f1f8ff", "#b9cfe4"],      // gelo
    ["#3fb6c6", "#5cc8d4", "#2fa0b2"],      // oceano (água rasa / recife)
    ["#8a6a52", "#a07e64", "#6f5442"],      // montanhas
    ["#4a2a24", "#5c342c", "#3a201c"]       // vulcão
  ];
  for (let y = 0; y < MAPA_H; y++) for (let x = 0; x < MAPA_W; x++) {
    const r = regiao[y * MAPA_W + x];
    if (r < 0) continue;
    const praia = [regiao[y * MAPA_W + x - 1], regiao[y * MAPA_W + x + 1], regiao[(y - 1) * MAPA_W + x], regiao[(y + 1) * MAPA_W + x]].some(function(v) { return v === -1 || v === undefined; });
    let cor = BASE[r][h(x, y, 17) < 0.07 ? 2 : h(x >> 3, y >> 3, 7) < 0.5 ? 0 : 1];
    if (praia) cor = r === 2 ? "#ffffff" : r === 5 ? "#2a1612" : r === 3 ? "#8fe3ea" : "#f3dfa8";
    pxPonto(b, x, y, cor);
  }
  // contorno da costa e espuma
  for (let y = 1; y < MAPA_H - 1; y++) for (let x = 1; x < MAPA_W - 1; x++) {
    if (regiao[y * MAPA_W + x] >= 0) continue;
    const viz = regiao[y * MAPA_W + x - 1] >= 0 || regiao[y * MAPA_W + x + 1] >= 0 || regiao[(y - 1) * MAPA_W + x] >= 0 || regiao[(y + 1) * MAPA_W + x] >= 0;
    if (viz) pxPonto(b, x, y, h(x, y, 8) < 0.5 ? "#a5d8ff" : "#e7f5ff");
  }
  const dentro = function(x, y, i) { return regiao[Math.floor(y) * MAPA_W + Math.floor(x)] === i; };
  // ---- detalhes de cada bioma ----
  // Selva: árvores (copa redonda com luz) e um rio
  for (let k = 0; k < 2000; k++) {
    const x = (k % 60) * 5 + Math.floor(h(k, 11, 9) * 3), y = Math.floor(k / 60) * 5 + Math.floor(h(k, 12, 9) * 3);
    if (h(k, 13, 9) < 0.35 || !dentro(x, y, 0) || !dentro(x + 3, y + 4, 0) || Math.hypot(x - C[0][0], (y - C[0][1]) * 1.4) < 9) continue;
    pxRet(b, x, y + 1, 4, 2, "#1b5e20"); pxRet(b, x + 1, y, 2, 4, "#1b5e20");
    pxRet(b, x + 1, y + 1, 2, 2, "#51cf66"); pxPonto(b, x + 1, y + 1, "#8ce99a");
    pxPonto(b, x + 2, y + 4, "#6b4423");
  }
  for (let t = 0; t < 1; t += 0.01) {
    const x = C[0][0] - 20 + t * 40, y = C[0][1] + 8 + Math.sin(t * 9) * 4;
    if (dentro(x, y, 0)) { pxPonto(b, x, y, "#3d8fbd"); pxPonto(b, x, y + 1, "#5aa9d3"); }
  }
  // Deserto: dunas, pirâmides e cactos
  for (let k = 0; k < 60; k++) {
    const x = Math.floor(h(k, 21, 9) * MAPA_W), y = Math.floor(h(k, 22, 9) * MAPA_H);
    if (!dentro(x, y, 1)) continue;
    pxRet(b, x, y, 5, 1, "#c99a45"); pxRet(b, x + 1, y - 1, 3, 1, "#fbe7b0");
  }
  [[C[1][0] - 9, C[1][1] + 8, 14], [C[1][0] + 10, C[1][1] + 11, 9]].forEach(function(p) {
    for (let i = 0; i < p[2]; i++) for (let k = -i; k <= i; k++) pxPonto(b, p[0] + k, p[1] - p[2] + i, k < 0 ? "#f2d28b" : "#c48d38");
  });
  [[C[1][0] - 20, C[1][1] - 6], [C[1][0] + 18, C[1][1] - 4], [C[1][0] + 2, C[1][1] + 16]].forEach(function(p) {
    if (!dentro(p[0], p[1], 1)) return;
    pxRet(b, p[0], p[1] - 4, 1, 5, "#2f9e44"); pxRet(b, p[0] - 2, p[1] - 3, 1, 2, "#2f9e44"); pxRet(b, p[0] + 2, p[1] - 2, 1, 2, "#2f9e44");
  });
  // Gelo: montanhas nevadas e pinheiros
  [[C[2][0] - 8, C[2][1] + 8, 17], [C[2][0] + 12, C[2][1] + 11, 12]].forEach(function(p) {
    for (let i = 0; i < p[2]; i++) for (let k = -i; k <= i; k++) pxPonto(b, p[0] + k, p[1] - p[2] + i, i < 6 ? "#ffffff" : k < 0 ? "#a5c8e8" : "#6f94bd");
  });
  for (let k = 0; k < 2000; k++) {
    const x = (k % 60) * 5 + Math.floor(h(k, 31, 9) * 3), y = Math.floor(k / 60) * 5 + Math.floor(h(k, 32, 9) * 3);
    if (h(k, 33, 9) < 0.6 || !dentro(x, y, 2) || !dentro(x, y + 4, 2) || y < C[2][1] + 6) continue;
    pxPonto(b, x, y, "#1f5a46"); pxRet(b, x - 1, y + 1, 3, 1, "#1f5a46"); pxRet(b, x - 1, y + 2, 3, 1, "#2b7a5e"); pxPonto(b, x, y + 3, "#6b4423");
    pxPonto(b, x, y, "#ffffff");
  }
  // Oceano: recife de corais, barco naufragado
  for (let k = 0; k < 70; k++) {
    const x = Math.floor(h(k, 41, 9) * MAPA_W), y = Math.floor(h(k, 42, 9) * MAPA_H);
    if (!dentro(x, y, 3)) continue;
    pxPonto(b, x, y, ["#ff8787", "#f783ac", "#ffd43b", "#ff922b"][k % 4]); pxPonto(b, x + 1, y - 1, "#ffc9c9");
  }
  pxRet(b, C[3][0] - 9, C[3][1] + 6, 14, 3, "#5c3d2e"); pxRet(b, C[3][0] - 8, C[3][1] + 6, 12, 1, "#8a5a2b");
  pxRet(b, C[3][0] - 3, C[3][1] - 2, 1, 8, "#5c3d2e"); pxRet(b, C[3][0] - 2, C[3][1] - 1, 4, 3, "#e9ecef");
  // Montanhas: cordilheira com picos nevados
  [[C[4][0] - 16, C[4][1] + 10, 14], [C[4][0], C[4][1] + 8, 19], [C[4][0] + 16, C[4][1] + 11, 13]].forEach(function(p) {
    for (let i = 0; i < p[2]; i++) for (let k = -i; k <= i; k++) pxPonto(b, p[0] + k, p[1] - p[2] + i, i < 5 ? "#ffffff" : k < 0 ? "#b89a84" : "#6f5442");
  });
  // Vulcão: cone escuro, cratera e rios de lava
  const vx = C[5][0], vy = C[5][1] + 10;
  for (let i = 0; i < 18; i++) for (let k = -i - 2; k <= i + 2; k++) pxPonto(b, vx + k, vy - 18 + i, k < 0 ? "#5c342c" : "#3a201c");
  pxRet(b, vx - 3, vy - 19, 7, 2, "#ff6b00"); pxRet(b, vx - 2, vy - 20, 5, 1, "#ffd43b");
  for (let i = 0; i < 16; i++) { pxPonto(b, vx - 2 - Math.floor(i * 0.6), vy - 17 + i, "#ff922b"); pxPonto(b, vx + 2 + Math.floor(i * 0.4), vy - 17 + i, "#ff6b00"); }
  // ---- moldura de pergaminho com rosa dos ventos ----
  for (let x = 0; x < MAPA_W; x++) for (let y = 0; y < MAPA_H; y++) {
    const borda = Math.min(x, y, MAPA_W - 1 - x, MAPA_H - 1 - y);
    if (borda < 4) pxPonto(b, x, y, borda === 0 ? "#2a1608" : borda < 3 ? (h(x, y, 50) < 0.5 ? "#c9a96e" : "#b8955a") : "#5a3a1c");
  }
  const rx = 20, ry = 150;
  pxRet(b, rx - 6, ry, 13, 1, "#f1e7d0"); pxRet(b, rx, ry - 6, 1, 13, "#f1e7d0");
  pxPoligono(b, [[rx, ry - 8], [rx + 2, ry], [rx, ry + 8], [rx - 2, ry]], ["#5a3a1c", "#8a6a4a", "#e9d6a8", "#fff8e1"], { rim: false });
  pxPonto(b, rx, ry - 10, "#c92a2a");
  return pxCanvas(b, MAPA_ESC);
}

let SPR_MAPA_MUNDO = null;
function sprMapaMundo() {
  if (!SPR_MAPA_MUNDO) SPR_MAPA_MUNDO = construirMapaMundo();
  return SPR_MAPA_MUNDO;
}


// ---------- Estampas novas das roupas (banana, galáxia, corações, diagonal, oncinha, gola, degradê) ----------
const letraRoupaOriginal = letraRoupa;
letraRoupa = function(item, ch, rg, x, y, mapa, reg) {
  const p = item.padrao;
  const novos = { banana: 1, galaxia: 1, coracoes: 1, diagonal: 1, oncinha: 1, gola: 1, degrade: 1 };
  if (!novos[p]) return letraRoupaOriginal(item, ch, rg, x, y, mapa, reg);
  if (ch === "." || ch === "D" || ch === "W" || ch === "E" || ch === "M") return ".";
  const est = item.estilo;
  const bx = x - MARGEM_PRIMATA;
  const tom = SOMBRA_PELO[ch] ? "B" : "A";
  if (est === "camisa" || est === "regata") {
    const manga = rg === "b" && y >= 13 && y <= 15 && est !== "regata";
    const corpo = rg === "t" || rg === "i";
    if (!corpo && !manga) return ".";
  } else if (est === "calca" || est === "short") {
    if (rg !== "i" && rg !== "p") return ".";
  } else return letraRoupaOriginal(item, ch, rg, x, y, mapa, reg);
  const h = pxHash(bx, y, 3);
  if (p === "banana") return (bx * 5 + y * 3) % 7 === 0 ? "C" : ((bx * 5 + y * 3) % 7 === 1 && y % 2 ? "Y" : tom);
  if (p === "galaxia") return h < 0.1 ? "C" : h > 0.94 ? "Y" : tom;
  if (p === "coracoes") return (bx + y * 2) % 6 === 0 || ((bx + y * 2) % 6 === 1 && y % 2 === 0) ? "C" : tom;
  if (p === "diagonal") return (bx + y) % 4 < 2 ? "C" : tom;
  if (p === "oncinha") return h < 0.12 ? "C" : h < 0.22 ? "Y" : tom;
  if (p === "gola") return y === 14 && rg === "t" ? "C" : (y === 15 && bx === 10 ? "C" : tom);
  if (p === "degrade") return y <= 14 ? "C" : y === 15 ? "Y" : tom;
  return tom;
};
