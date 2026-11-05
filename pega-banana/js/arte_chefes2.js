"use strict";

// =========================
// CHEFES NOVOS: Tubarão Abissal (Oceano) e Condor dos Andes (Montanhas Rochosas)
// Mesmo motor de pixel art dos outros chefes (pixelarte.js); tudo olhando para a direita.
// Também: piranhas (rajada do tubarão) e os filhotes do condor.
// =========================

// ---------- Tubarão Abissal (grade 74x36, escala 3 = 222x108) ----------

const COR_TUBARAO = {
  costas: ["#1c2b3a", "#334a62", "#4f6a86", "#7590ab", "#a8bfd4"],
  barriga: ["#9aa8b4", "#c9d3db", "#e9eef2", "#ffffff"],
  boca: ["#2a0610", "#5a0c1c", "#8a1a2c", "#b83a48"],
  brilho: ["#0b6a8a", "#22b8cf", "#99e9f2", "#e3fafc"]
};

// Pose: cauda (balanço do rabo, -1 a 1), boca 0 (fechada) a 2.5 (escancarada), olhos "raiva"|"fechado"|"tonto",
// fino (investida: corpo mais esticado), bob
function tubaraoQuadro(p) {
  const C = COR_TUBARAO;
  const b = pxNovo(74, 36);
  const bob = p.bob || 0;
  const cd = p.cauda || 0;
  const ab = p.boca || 0;
  const fino = p.fino ? 0.86 : 1;
  const RIM = "#0b141c";
  const cy = 17 + bob;

  // barbatana do rabo (meia-lua), balançando
  const tx = 8, ty = cy;
  pxPoligono(b, [[tx + 6, ty - 1.5], [tx - 3 + cd, ty - 14 + cd * 2], [tx + 1, ty - 13 + cd * 2], [tx + 10, ty - 2], [tx + 10, ty + 2], [tx + 1, ty + 10 + cd * 2], [tx - 2 + cd, ty + 10 + cd * 2], [tx + 6, ty + 1.5]],
    C.costas, { rim: RIM, curva: 0.5, luz: 0.05 });
  // pedúnculo (afina até o rabo)
  pxMembro(b, tx + 7, ty, 26, cy, 2.6, 7.6 * fino, C.costas, { rim: RIM });
  // barbatana dorsal
  pxPoligono(b, [[32, cy - 8 * fino], [38, cy - 20 * fino], [41, cy - 19 * fino], [46, cy - 8 * fino]], C.costas, { rim: RIM, curva: 0.6, luz: 0.1 });
  // barbatanas pequenas de baixo (do lado de trás)
  pxPoligono(b, [[22, cy + 5], [18, cy + 11], [26, cy + 6]], C.costas, { rim: RIM, curva: 0.4, luz: -0.2 });

  // corpo: costas escuras e barriga clara
  pxElipse(b, 38, cy, 22, 10 * fino, C.costas, { rim: RIM, rimClaro: C.costas[3] });
  pxElipse(b, 40, cy + 4.6 * fino, 19, 5.2 * fino, C.barriga, { rim: false });
  // cabeça e focinho
  const hx = 57, hy = cy - 0.5;
  pxElipse(b, hx, hy, 11, 8.6 * fino, C.costas, { rim: RIM, rimClaro: C.costas[3] });
  pxPoligono(b, [[hx + 4, hy - 6.6 * fino], [hx + 15.5, hy - 1], [hx + 14, hy + 2], [hx + 4, hy + 3]], C.costas, { rim: RIM, curva: 0.7, luz: 0.1 });
  pxElipse(b, hx + 2, hy + 4.6 * fino, 9, 3.6 * fino, C.barriga, { rim: false });

  // boca: a mandíbula de baixo abre
  const mx = hx + 2, my = hy + 3;
  if (ab > 0.2) {
    pxPoligono(b, [[mx - 2, my - 1], [mx + 12, my - 2], [mx + 11, my + 2 + ab * 3.2], [mx - 1, my + 1 + ab * 2.2]], C.boca, { rim: "#14030a", curva: 0.3 });
    // fileiras de dentes (cima e baixo)
    for (let k = 0; k < 6; k++) {
      const x = mx + k * 2;
      pxPoligono(b, [[x - 0.7, my - 1.6], [x + 0.9, my - 1.6], [x + 0.1, my + 0.6 + (k % 2) * 0.6]], ["#c9c2ad", "#efe9da", "#ffffff", "#ffffff"], { rim: false, curva: 0 });
      pxPoligono(b, [[x - 0.5, my + 1.4 + ab * 2.4], [x + 1.1, my + 1.4 + ab * 2.4], [x + 0.3, my - 0.6 + ab * 2.4]], ["#c9c2ad", "#efe9da", "#ffffff", "#ffffff"], { rim: false, curva: 0 });
    }
    pxMembro(b, mx - 1, my + 2 + ab * 2.4, mx + 11, my + 3 + ab * 3.3, 1.6, 1.2, C.barriga, { rim: RIM });
  } else {
    pxLinha(b, mx - 1, my, mx + 12, my - 1, RIM);
    for (let k = 0; k < 5; k++) pxPonto(b, mx + 1 + k * 2.4, my + 0.4, "#ffffff");
  }

  // guelras
  for (let k = 0; k < 4; k++) pxLinha(b, 47 + k * 2, cy - 4 * fino, 46 + k * 2, cy + 3 * fino, C.costas[0]);
  // barbatana de lado (peitoral), para trás na investida
  const pf = p.fino ? [[46, cy + 5], [36, cy + 12], [44, cy + 7]] : [[46, cy + 5], [40, cy + 15], [44, cy + 13], [49, cy + 6]];
  pxPoligono(b, pf, C.costas, { rim: RIM, curva: 0.5, luz: -0.1 });
  // cicatrizes e pintinhas que brilham (é um tubarão do abismo)
  pxLinha(b, 30, cy - 6, 34, cy - 4, C.costas[4]);
  pxLinha(b, 52, cy - 6, 55, cy - 7, C.costas[4]);
  [[24, cy + 1], [29, cy + 2.5], [34, cy + 3], [40, cy + 2], [27, cy - 2], [45, cy + 1]].forEach(function(q) { pxPonto(b, q[0], q[1], C.brilho[2]); });

  // olho
  const ex = hx + 4.5, ey = hy - 3;
  const ol = p.olhos || "raiva";
  if (ol === "fechado") pxLinha(b, ex - 1.5, ey + 0.5, ex + 1.5, ey + 0.5, "#05080c");
  else if (ol === "tonto") { pxRet(b, ex - 1.5, ey - 1, 3, 3, "#ffffff"); pxPonto(b, ex, ey, "#05080c"); }
  else {
    pxRet(b, ex - 1, ey - 1, 3, 2.5, "#05080c");
    pxPonto(b, ex - 1, ey - 1, "#e3fafc");
    pxPonto(b, ex + 1, ey, "#22b8cf");
    pxLinha(b, ex - 3, ey - 3, ex + 2, ey - 1.6, RIM);
  }
  // narina
  pxPonto(b, hx + 13, hy - 1.4, RIM);

  pxContorno(b, "#060a10");
  return { b: b, olhos: [[ex, ey]], boca: [mx + 10, my + ab * 1.6] };
}

function tubaraoQuadros() {
  const q = {};
  const def = {
    nadar0: { cauda: -1.2 },
    nadar1: { cauda: 1.2, bob: 0.4 },
    morder0: { cauda: 0, boca: 2.2, bob: -0.3 },
    morder1: { cauda: 0.5, boca: 0.1 },
    investida: { cauda: 0, fino: true, boca: 0.6 },
    rugido: { cauda: -0.6, boca: 2.6, bob: -0.6 },
    tonto: { cauda: 0.4, olhos: "tonto", boca: 0.8, bob: 1 },
    dano: { cauda: -0.4, olhos: "fechado", boca: 0.9, bob: 0.5 }
  };
  Object.keys(def).forEach(function(k) {
    const r = tubaraoQuadro(def[k]);
    const s = pxSprite(pxCanvas(r.b, 3));
    s.olhos = r.olhos;
    s.boca = r.boca;
    q[k] = s;
  });
  return q;
}

registrarChefe("tubarao", tubaraoQuadros(), "nadar0");


// ---------- Condor dos Andes (grade 78x54, escala 3 = 234x162) ----------

const COR_CONDOR = {
  pena: ["#0c0c10", "#1d1d24", "#2f2f38", "#4a4a56", "#6a6a78"],
  penaLonge: ["#060608", "#121216", "#1e1e24", "#2e2e36"],
  branca: ["#8a8f98", "#c9ced6", "#eef1f4", "#ffffff"],
  pele: ["#3a2026", "#6a3a40", "#9a5a5a", "#c88480"],
  crista: ["#3a0a10", "#6a1420", "#9a2430", "#c84a50"],
  bico: ["#5a4a30", "#a8946a", "#e8dcc0", "#fff8e6"],
  perna: ["#2a2226", "#5a4a50", "#8a7a80", "#b8a8ae"]
};

// Asa (pontos para a asa levantada, ombro em (0,0)); "rot" gira em volta do ombro (0 = pra cima, -1.2 = aberta, -2.2 = pra baixo)
const ASA_CONDOR = [[2, 2], [-1, -6], [-3, -14], [-5, -22], [-6, -33], [-8, -30], [-10, -34.5], [-12, -30.5], [-14.5, -33.5], [-16, -29], [-19, -31], [-19.6, -26.5], [-23, -27], [-22.4, -22],
  [-22, -15], [-19, -9], [-14, -4], [-8, 0], [-2, 4]];
const FAIXA_CONDOR = [[-5, -1.5], [-11, -5.5], [-16.5, -10.5], [-19.6, -16.5], [-16.8, -17], [-13.6, -12], [-9, -7.5], [-4, -4]];
const DEDOS_CONDOR = [[-6, -33], [-10, -34.5], [-14.5, -33.5], [-19, -31], [-23, -27]];

function asaCondor(b, ox, oy, rot, k, longe) {
  const C = COR_CONDOR;
  const ca = Math.cos(rot), sa = Math.sin(rot);
  const P = function(q) { return [ox + (q[0] * ca - q[1] * sa) * k, oy + (q[0] * sa + q[1] * ca) * k]; };
  const pts = ASA_CONDOR.map(P);
  pxPoligono(b, pts, longe ? C.penaLonge : C.pena, { rim: longe ? "#000000" : "#050507", curva: 0.4, luz: longe ? -0.2 : 0 });
  if (!longe) {
    // faixa branca das penas de dentro (marca do condor)
    pxPoligono(b, FAIXA_CONDOR.map(P), C.branca, { rim: false, curva: 0.3, luz: 0.2 });
    // "dedos" das penas da ponta, separados por riscos escuros
    DEDOS_CONDOR.forEach(function(q) {
      const a = P(q), c = P([q[0] * 0.72, q[1] * 0.72]);
      pxLinha(b, c[0], c[1], a[0], a[1], C.pena[3]);
    });
  }
}

// Pose: asa (rotação da asa), dobrada (asa recolhida no corpo), bob, cab [dx, dy], boca 0-2,
// pernas "recolhidas"|"pouso"|"agarrar", olhos "raiva"|"fechado"|"tonto", incl (inclinação do corpo)
function condorQuadro(p) {
  const C = COR_CONDOR;
  const b = pxNovo(78, 66);
  const bob = p.bob || 0;
  const cab = p.cab || [0, 0];
  const RIM = "#050507";
  const sx = 38, sy = 36 + bob;       // ombro
  const dob = !!p.dobrada;
  const rotA = dob ? -1.45 : (p.asa === undefined ? -1.2 : p.asa);
  const kA = dob ? 0.62 : 1;

  // asa de longe (atrás do corpo)
  asaCondor(b, sx - 3, sy - 1.5, rotA + (dob ? 0 : 0.12), kA * 0.95, true);

  // rabo em leque
  pxPoligono(b, [[24, sy + 2], [10, sy + 3], [9, sy + 6], [11, sy + 9], [24, sy + 7]], C.pena, { rim: RIM, curva: 0.4 });
  for (let k = 0; k < 3; k++) pxLinha(b, 22, sy + 4 + k, 11, sy + 4 + k * 2, C.pena[3]);

  // pernas e garras
  const pernas = p.pernas || "recolhidas";
  if (pernas === "pouso") {
    [[33, 0], [40, 1]].forEach(function(l) {
      pxElipse(b, l[0], sy + 9, 3.4, 3, C.pena, { rim: RIM });
      pxMembro(b, l[0], sy + 11, l[0] + 1, 61.5, 2.4, 2, C.perna, { rim: RIM });
      for (let d = 0; d < 3; d++) pxMembro(b, l[0] + 1, 62, l[0] + 1 + (d - 0.5) * 3, 64.5, 1.2, 0.6, C.perna, { rim: RIM });
    });
  } else if (pernas === "agarrar") {
    [[38, 0], [42, 1]].forEach(function(l, i) {
      pxMembro(b, l[0], sy + 6, l[0] + 7, sy + 17 + i, 1.8, 1.4, C.perna, { rim: RIM });
      for (let d = 0; d < 3; d++) pxMembro(b, l[0] + 7, sy + 17 + i, l[0] + 9.5 + d * 1.2, sy + 19 + i - d * 1.6, 1, 0.4, ["#1a1a20", "#3a3a40", "#6a6a74", "#9a9aa4"], { rim: RIM });
    });
  } else {
    pxMembro(b, 36, sy + 7, 30, sy + 11, 1.6, 1.2, C.perna, { rim: RIM });
    pxMembro(b, 39, sy + 7, 33, sy + 12, 1.6, 1.2, C.perna, { rim: RIM });
  }

  // corpo
  pxElipse(b, 36, sy + 2, 13, 9, C.pena, { rim: RIM, rimClaro: C.pena[3], tex: pxTexPelo(61, 0.1) });

  // asa de perto
  asaCondor(b, sx, sy, rotA, kA, false);

  // gola branca fofinha
  const nx = 48 + cab[0] * 0.5, ny = 29 + bob + cab[1] * 0.5;
  pxElipse(b, nx, ny, 6.2, 4.4, C.branca, { rim: "#5a5f68", tex: pxTexPelo(62, 0.25) });
  // pescoço pelado e cabeça
  const hx = 54 + cab[0], hy = 23 + bob + cab[1];
  pxMembro(b, nx + 1, ny - 1, hx - 1, hy + 2, 2.6, 2.2, C.pele, { rim: RIM });
  pxElipse(b, hx, hy, 5, 4.2, C.pele, { rim: RIM, tex: pxTexPelo(63, 0.12) });
  // crista (carúncula) em cima da cabeça
  pxPoligono(b, [[hx - 3, hy - 3], [hx - 2, hy - 7], [hx, hy - 5.5], [hx + 1.5, hy - 8], [hx + 3, hy - 5], [hx + 4.5, hy - 6.6], [hx + 5, hy - 2.5]], C.crista, { rim: "#200508", curva: 0.4 });
  // bico em gancho (abre na mandíbula de baixo)
  const ab = p.boca || 0;
  pxPoligono(b, [[hx + 3, hy - 1.6], [hx + 9, hy - 1], [hx + 10.6, hy + 1.6], [hx + 9.2, hy + 3.2], [hx + 8.6, hy + 1.2], [hx + 3, hy + 1.4]], C.bico, { rim: "#2a2010", curva: 0.5, luz: 0.1 });
  pxPoligono(b, [[hx + 3, hy + 1.8 + ab], [hx + 8, hy + 2 + ab * 1.4], [hx + 7.6, hy + 3 + ab * 1.6], [hx + 3, hy + 3 + ab]], [C.bico[0], C.bico[1], C.bico[1], C.bico[2]], { rim: "#2a2010", curva: 0.3 });
  if (ab > 0.5) pxRet(b, hx + 4, hy + 1.6, 3, ab, "#3a0a10");
  pxPonto(b, hx + 6, hy - 0.4, "#2a2010");
  // olho
  const ex = hx + 1, ey = hy - 1;
  const ol = p.olhos || "raiva";
  if (ol === "fechado") pxLinha(b, ex - 1.5, ey, ex + 1, ey, "#050507");
  else if (ol === "tonto") { pxRet(b, ex - 1, ey - 1, 3, 3, "#ffffff"); pxPonto(b, ex, ey, "#050507"); }
  else {
    pxRet(b, ex - 1, ey - 0.5, 2.5, 2, "#c92a2a");
    pxPonto(b, ex, ey, "#050507");
    pxPonto(b, ex - 1, ey - 0.5, "#ffc9c9");
    pxLinha(b, ex - 2.4, ey - 2, ex + 1.6, ey - 1, "#050507");
  }

  pxFiapos(b, 0.18, 64, null, [C.pena[1], C.pena[2]]);
  pxContorno(b, "#030304");
  return { b: b, olhos: [[ex, ey]], boca: [hx + 9, hy + 1.5] };
}

function condorQuadros() {
  const q = {};
  const def = {
    voar0: { asa: 0.15, bob: 1 },
    voar1: { asa: -0.95, bob: 0 },
    voar2: { asa: -2.1, bob: -1 },
    planar: { asa: -1.25, bob: 0.4 },
    avanco: { dobrada: true, cab: [3, 3], bob: 1 },
    rajada: { asa: 0.5, boca: 1.6, cab: [1, -1] },
    agarrar: { asa: -0.3, pernas: "agarrar", boca: 1, cab: [2, 2] },
    pouso: { dobrada: true, pernas: "pouso", bob: 6 },
    pouso1: { dobrada: true, pernas: "pouso", bob: 6.6, cab: [0, 1] },
    rugido: { asa: -0.35, pernas: "pouso", boca: 2, cab: [-1, -2], bob: 5.5 },
    tonto: { dobrada: true, pernas: "pouso", olhos: "tonto", cab: [-1, 3], bob: 7.5, boca: 0.8 },
    dano: { asa: -1.6, olhos: "fechado", boca: 1, cab: [-1, 1] }
  };
  Object.keys(def).forEach(function(k) {
    const r = condorQuadro(def[k]);
    const s = pxSprite(pxCanvas(r.b, 3));
    s.olhos = r.olhos;
    s.boca = r.boca;
    q[k] = s;
  });
  return q;
}

registrarChefe("condor", condorQuadros(), "voar1");


// ---------- Filhotes do condor (grade 18x16, escala 3) ----------
function filhoteQuadro(asa) {
  const b = pxNovo(20, 16);
  const F = ["#3a3436", "#5e575a", "#857d81", "#ada5a9", "#d4ccd0"];
  // asinha batendo
  pxPoligono(b, asa ? [[8, 7], [2, 2], [4, 6], [1, 6], [6, 10]] : [[8, 8], [1, 11], [4, 12], [2, 14], [8, 11]], ["#2a2628", "#4a4648", "#6a6468", "#8a8488"], { rim: false, curva: 0.4 });
  pxElipse(b, 9, 10, 6, 5, F, { rim: false, tex: pxTexPelo(71, 0.3) });
  pxElipse(b, 13, 5, 4.4, 3.8, F, { rim: false, tex: pxTexPelo(72, 0.3) });
  pxPoligono(b, [[16, 4], [19.6, 5], [16.4, 6.4]], ["#5a4a30", "#a8946a", "#e8dcc0", "#fff8e6"], { rim: false, curva: 0.3 });
  pxElipse(b, 10, 12, 3.4, 2.4, ["#ada5a9", "#d4ccd0", "#ece6e9", "#ffffff"], { rim: false });
  pxRet(b, 13.5, 3, 2, 2, "#111111");
  pxPonto(b, 13.5, 3, "#ffffff");
  pxFiapos(b, 0.5, 73, null, [F[2], F[3]]);
  pxContorno(b, "#1a1618");
  return pxSprite(pxCanvas(b, 3));
}
const SPR_FILHOTE = [filhoteQuadro(true), filhoteQuadro(false)];


// ---------- Piranhas (grade 16x12, escala 3) ----------
function piranhaQuadro(f) {
  const b = pxNovo(17, 12);
  const costas = ["#2a3a30", "#4a6a54", "#6a8a72", "#9ab8a0"];
  const barriga = ["#8a1a10", "#d9480f", "#ff8a4a", "#ffc9a0"];
  pxPoligono(b, [[4, 6], [0.5, 2 + f], [0.5, 10 - f]], costas, { rim: false, curva: 0.3 });
  pxElipse(b, 9.4, 6, 6.6, 4.6, costas, { rim: false });
  pxElipse(b, 9.8, 8, 5, 2.6, barriga, { rim: false });
  pxPoligono(b, [[8, 2], [10, -0.2], [12, 2]], costas, { rim: false, curva: 0.2 });
  // boca com dentes de serra (mordida pra fora)
  pxRet(b, 13, 7.4, 3.6, 1.6, "#3a0606");
  for (let k = 0; k < 3; k++) { pxPonto(b, 13.4 + k, 7.2, "#ffffff"); pxPonto(b, 13.8 + k, 8.8, "#ffffff"); }
  pxRet(b, 12, 4, 2, 2, "#ffd43b");
  pxPonto(b, 13, 4.6, "#111111");
  pxLinha(b, 11, 3, 14, 3.8, "#1a2a20");
  pxContorno(b, "#0e1610");
  return pxSprite(pxCanvas(b, 3));
}
const SPR_PIRANHA = [piranhaQuadro(0), piranhaQuadro(1)];
