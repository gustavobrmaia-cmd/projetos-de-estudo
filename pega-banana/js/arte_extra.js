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
