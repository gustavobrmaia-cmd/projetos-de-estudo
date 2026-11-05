"use strict";

// =========================
// INIMIGOS DOS MUNDOS NOVOS (todos olhando para a direita, grade de letras como em arte.js)
// Oceano: caranguejo, água-viva, baiacu, polvo, peixe-espada
// Montanhas Rochosas: cabra-montesa, águia, marmota, lhama, urso
// =========================

// ---------- Oceano ----------

// Caranguejo 30x18: anda de lado abrindo e fechando as pinças
function quadroCaranguejo(pose) {
  const g = gGrade(30, 18);
  const T = "BLDH";
  const f = { a: 0, b: 1, c: 2, d: 3, belisca: 4 }[pose];
  const passo = [0, 1, 0, -1, 0][f];
  const abre = pose === "belisca" ? 1.8 : [0.6, 1.2, 0.6, 0.1][f];
  const cx0 = 15;
  // garras: braço, palma e os dois dedos (o de baixo abre)
  [-1, 1].forEach(function(s) {
    const cx = cx0 + s * 10.4, cy = 6.8 - (f === 1 ? 0.5 : 0);
    gFio(g, cx0 + s * 6.4, 10.2, cx - s * 1.4, cy + 2, 1.3, 1.1, "D");
    gBola(g, cx, cy, 2.9, 2.6, T);
    gPoli(g, [[cx + s * 0.5, cy - 2.6], [cx + s * 4.4, cy - 3.6 - abre * 0.4], [cx + s * 4, cy - 1.4], [cx + s * 1.6, cy - 0.6]], "B");
    gPoli(g, [[cx + s * 0.8, cy + 0.8], [cx + s * 4.2, cy + 0.4 + abre], [cx + s * 3.4, cy + 1.8 + abre], [cx + s * 1, cy + 2.4]], "D");
  });
  // carapaça larga
  gBola(g, cx0, 10.6, 8.8, 4.8, T);
  gElipse(g, cx0, 13.6, 6.4, 1.4, "P");
  // pintinhas e borda serrilhada
  [[11, 8, "H"], [12, 8, "L"], [18, 8, "L"], [20, 10, "D"], [10, 11, "D"], [15, 7, "L"]].forEach(function(p) { gPonto(g, p[0], p[1], p[2]); });
  // olhos nas hastes
  gRet(g, 12, 4, 1, 3, "D"); gRet(g, 17, 4, 1, 3, "D");
  gElipse(g, 12.5, 3.2, 1.8, 1.8, "W"); gElipse(g, 17.5, 3.2, 1.8, 1.8, "W");
  gRet(g, 13, 3, 1, 2, "E"); gRet(g, 18, 3, 1, 2, "E");
  // boquinha
  gRet(g, 14, 11, 3, 1, "M");
  gContorno(g, "K");
  // perninhas finas (3 de cada lado)
  for (let k = 0; k < 3; k++) {
    [-1, 1].forEach(function(s) {
      const x0 = cx0 + s * (3.6 + k * 2.2), y0 = 14.4;
      const lev = ((k + (s > 0 ? 1 : 0)) % 2 ? passo : -passo) * 0.8;
      const xj = x0 + s * 2.2, yj = 15.2 - Math.max(0, lev);
      gLinha(g, x0, y0, xj, yj, "K");
      gLinha(g, xj, yj, xj + s * 1.2, 17 - Math.max(0, lev), "K");
    });
  }
  return gMapa(g);
}

registrarInimigo("caranguejo", ["a", "b", "c", "d", "belisca"].map(quadroCaranguejo),
  { K: "#4a0f08", D: "#b4321c", B: "#e8562e", L: "#ff8a5c", H: "#ffd0b8", P: "#ffc9a8", W: "#ffffff", E: "#111111", M: "#5a0f08" }, 2, {
  poses: { andar: P(6, 0, 1, 2, 3), parado: P(16, 0, 4) },
  olhos: [[13, 3], [18, 3]]
});

// Água-viva 22x30: o sino pulsa (abre e contrai) e os tentáculos ondulam
function quadroAguaViva(f) {
  const g = gGrade(22, 30);
  const k = [0, 0.5, 1, 0.5][f];             // 1 = contraída (é quando ela sobe)
  const rx = 9.4 - k * 1.8, ry = 7 + k * 1.3;
  const cy = 9 - k * 0.6;
  const base = cy + ry * 0.55;
  // sino (só a parte de cima da elipse)
  gElipse(g, 11, cy, rx, ry, function(u, v, x, y) {
    if (v > 0.55) return g[y][x];
    if (Math.hypot(u + 0.35, v + 0.45) < 0.22) return "H";
    if (v < -0.35) return "L";
    if (v > 0.38) return "D";
    return Math.hypot(u, v + 0.1) < 0.45 ? "I" : "B";
  });
  // babadinho da borda
  for (let x = Math.ceil(11 - rx); x <= 11 + rx; x += 2) gPonto(g, x, base + 0.6, "D");
  // carinha
  gRet(g, 8, cy + 1, 2, 2, "E"); gRet(g, 13, cy + 1, 2, 2, "E");
  gPonto(g, 8, cy + 1, "W"); gPonto(g, 13, cy + 1, "W");
  gPonto(g, 7, cy + 3, "R"); gPonto(g, 15, cy + 3, "R");
  gRet(g, 10, cy + 3, 2, 1, "M");
  gContorno(g, "K");
  // tentáculos finos ondulando e os braços do meio (depois do contorno)
  const comp = 15 - k * 3;
  for (let i = 0; i < 5; i++) {
    const x0 = 11 + (i - 2) * 3.2 * (rx / 9.4);
    for (let y = 0; y < comp; y++) {
      const x = x0 + Math.sin(y * 0.45 + i * 1.3 + f * 1.6) * (0.6 + y * 0.08);
      gPonto(g, x, base + 1.5 + y, y > comp - 3 ? "t" : (i % 2 ? "T" : "t"));
    }
  }
  for (let y = 0; y < 8 - k * 2; y++) {
    gPonto(g, 10 + Math.sin(y * 0.6 + f) * 0.8, base + 1.5 + y, "R");
    gPonto(g, 11 + Math.sin(y * 0.6 + f) * 0.8, base + 1.5 + y, "S");
  }
  return gMapa(g);
}

registrarInimigo("aguaViva", [0, 1, 2, 3].map(quadroAguaViva),
  { K: "#6a1f7a", D: "#b45ad0", B: "#e2a4f4", I: "#f3d0fb", L: "#f6dcfd", H: "#ffffff", E: "#3a0a4a", W: "#ffffff", R: "#ff8fbf", M: "#7a1a5a",
    T: "#f783ac", t: "#fcc2d7", S: "#ffd6e8" }, 2, {
  poses: { voar: P(8, 0, 1, 2, 3), p0: P(1, 0), p1: P(1, 1), p2: P(1, 2), p3: P(1, 3) },
  olhos: [[9, 10], [14, 10]]
});

// Baiacu 30x26: peixinho nadando; quando se assusta vira uma bola de espinhos
function quadroBaiacu(pose) {
  const g = gGrade(30, 26);
  const T = "BLDH";
  const cx = 15, cy = 13;
  if (pose === "cheio" || pose === "meio") {
    const R = pose === "cheio" ? 10 : 7.2;
    const n = pose === "cheio" ? 14 : 10;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.2;
      gFio(g, cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1), cx + Math.cos(a) * (R + (pose === "cheio" ? 3 : 1.6)), cy + Math.sin(a) * (R + (pose === "cheio" ? 3 : 1.6)), 1, 0.4, "S");
    }
    // nadadeira do rabo e as de lado
    gPoli(g, [[cx - R + 1, cy], [cx - R - 3.4, cy - 3], [cx - R - 3.4, cy + 3]], "T");
    gBola(g, cx, cy, R, R, T);
    gElipse(g, cx + 1, cy + R * 0.4, R * 0.72, R * 0.42, "P");
    [[-3, -4], [2, -6], [-6, 1], [4, -2], [-1, -1]].forEach(function(p) { gPonto(g, cx + p[0] * R / 10, cy + p[1] * R / 10, "M"); });
    // olho grande assustado e boquinha em "o"
    gElipse(g, cx + R * 0.45, cy - R * 0.32, 2.3, 2.3, "W");
    gRet(g, cx + R * 0.45, cy - R * 0.32 - 1, 1, 2, "E");
    gRet(g, cx + R - 1.6, cy + 1, 2, 2, "R");
    gPoli(g, [[cx - 1, cy + 1], [cx - 4, cy + 3], [cx - 1, cy + 4]], "T");
  } else {
    const rabo = pose === "a" ? 1 : -1;
    gPoli(g, [[cx - 6, cy + 1], [cx - 11, cy - 3 + rabo], [cx - 11, cy + 5 + rabo]], "T");
    gBola(g, cx, cy + 1, 8, 5.8, T);
    gElipse(g, cx + 1, cy + 3.6, 6, 2.2, "P");
    gPoli(g, [[cx - 2, cy - 4], [cx + 1, cy - 8 + (pose === "a" ? 1 : 0)], [cx + 3, cy - 4.4]], "T");
    [[-3, -2], [0, -3], [-5, 1], [3, -1], [-1, 0]].forEach(function(p) { gPonto(g, cx + p[0], cy + p[1], "M"); });
    // espinhos baixinhos (ele está relaxado)
    [[-4, -5], [1, -6], [4, -5], [-6, -3]].forEach(function(p) { gPonto(g, cx + p[0], cy + p[1], "S"); });
    gElipse(g, cx + 4, cy - 0.6, 2, 2, "W");
    gRet(g, cx + 5, cy - 1.4, 1, 2, "E");
    gRet(g, cx + 7.6, cy + 1.6, 1, 2, "R");
    gPoli(g, [[cx, cy + 2], [cx - 3, cy + 4.6], [cx, cy + 5]], "T");
  }
  gContorno(g, "K");
  return gMapa(g);
}

registrarInimigo("baiacu", ["a", "b", "meio", "cheio"].map(quadroBaiacu),
  { K: "#3a2a08", D: "#a8741a", B: "#e8b23a", L: "#ffd866", H: "#fff3c4", P: "#fff8e6", S: "#6b4a12", T: "#f0a830", M: "#8a5a14",
    W: "#ffffff", E: "#111111", R: "#c2255c" }, 2, {
  poses: { nadar: P(9, 0, 1), parado: P(9, 0, 1), inflando: P(1, 2), cheio: P(1, 3) },
  olhos: [[20, 12]]
});

// Polvo 26x24: na pedra, com os tentáculos enrolando; enche a cabeça e cospe tinta
function quadroPolvo(pose) {
  const g = gGrade(26, 24);
  const T = "BLDH";
  const car = pose === "carregar", ati = pose === "atirar";
  const resp = pose === "respira" ? 0.6 : 0;
  const ch = car ? 1.2 : 0;
  // tentáculos (oito, quatro aparecem de cada lado), enrolando nas pontas
  const tent = [[6, 15, -1, 0], [9, 16, -1, 1], [13, 17, 1, 2], [17, 16, 1, 3], [20, 15, 1, 4]];
  tent.forEach(function(t, i) {
    const s = t[2];
    const pts = [[t[0], t[1]], [t[0] + s * 2.5, t[1] + 4], [t[0] + s * 4.5, t[1] + 4.6 - (i % 2) * 1.2]];
    for (let k = 0; k <= 10; k++) {
      const p = gCurva(pts[0], pts[1], pts[2], k / 10);
      gElipse(g, p[0], p[1], 1.6 - k * 0.08, 1.6 - k * 0.08, "B");
    }
    gPonto(g, pts[2][0] + s, pts[2][1] - 1, "B");
  });
  gBorda(g, "B", "L", "D", 1);
  // ventosas
  [[7, 19], [10, 20], [14, 21], [18, 20], [21, 19]].forEach(function(p) { gPonto(g, p[0], p[1], "W"); });
  // manto (cabeça grande)
  gBola(g, 13, 9 - resp - ch * 0.5, 7.4 + ch, 7.6 + resp + ch, T);
  [[9, 5], [15, 4], [17, 8], [11, 10], [8, 9]].forEach(function(p) { gPonto(g, p[0], p[1] - resp, "S"); });
  // olhos e sobrancelha brava
  gRet(g, 10, 11, 2, 3, "W"); gRet(g, 15, 11, 2, 3, "W");
  gRet(g, 11, 12, 1, 2, "E"); gRet(g, 16, 12, 1, 2, "E");
  gLinha(g, 9, 10, 12, 11, "D"); gLinha(g, 18, 10, 15, 11, "D");
  // bochechas cheias de tinta / sifão cuspindo
  if (car) { gElipse(g, 8.4, 14, 1.8, 1.4, "R"); gElipse(g, 18.6, 14, 1.8, 1.4, "R"); }
  if (ati) {
    gFio(g, 19, 14, 24, 13, 1.4, 1.6, "D");
    gElipse(g, 24.4, 13, 1.3, 1.3, "I");
  } else {
    gRet(g, 12, 15, 3, 1, "M");
  }
  gContorno(g, "K");
  return gMapa(g);
}

registrarInimigo("polvo", ["parado", "respira", "carregar", "atirar"].map(quadroPolvo),
  { K: "#3a0a1e", D: "#a61e4d", B: "#d6336c", L: "#f06595", H: "#ffc9de", S: "#ff8fab", W: "#fff0f6", E: "#111111", M: "#5a0a24",
    R: "#7a3a9a", I: "#1a0a2a" }, 2, {
  poses: { parado: P(30, 0, 1), carregar: P(1, 2), atirar: P(1, 3) },
  olhos: [[11, 12], [16, 12]]
});

// Peixe-espada 38x16: vela nas costas, espada comprida; arma e dispara em linha reta
function quadroPeixeEspada(pose) {
  const g = gGrade(38, 16);
  const T = "BLDH";
  const prep = pose === "preparar", inv = pose === "investida";
  const rabo = pose === "b" ? 1 : pose === "a" ? -1 : 0;
  // rabo em forquilha
  gPoli(g, [[8, 8], [2, 3 + rabo], [4.4, 8], [2, 13 + rabo]], "S");
  // vela (barbatana das costas) — erguida quando prepara, deitada na investida
  const vh = inv ? 2 : prep ? 7.5 : 5.5;
  gPoli(g, [[11, 6], [13, 6 - vh], [17, 6 - vh - 0.6], [22, 6 - vh * 0.6], [25, 6]], function(x, y) { return (x + y) % 3 === 0 ? "s" : "S"; });
  // corpo
  gBola(g, 17, 8.4, 10, 3.8 - (inv ? 0.4 : 0), T);
  gElipse(g, 18, 10.4, 7.6, 1.4, "P");
  // listras verticais
  for (let x = 12; x < 22; x += 3) gLinha(g, x, 6, x - 1, 9, "D");
  // espada
  gPoli(g, [[26, 7.4], [37.6, 8.6], [26, 9.6]], "Y");
  gLinha(g, 27, 8, 36, 8.6, "y");
  // olho
  gElipse(g, 24, 7.6, 1.6, 1.6, "W");
  gRet(g, 24, 7, 1, 2, "E");
  if (prep) { gLinha(g, 22, 5.6, 25.6, 6.6, "K"); }
  // nadadeira de lado
  gPoli(g, [[19, 10], [15, 13.4 + rabo * 0.5], [18, 11]], "S");
  gContorno(g, "K");
  return gMapa(g);
}

registrarInimigo("peixeEspada", ["a", "b", "preparar", "investida"].map(quadroPeixeEspada),
  { K: "#0b2a3f", D: "#1c5a8a", B: "#3a8ac8", L: "#7cc4f0", H: "#e3f6ff", P: "#dfe8ee", S: "#1c4f7a", s: "#2f7ab0",
    Y: "#a8b4c0", y: "#e8eef4", W: "#ffffff", E: "#111111" }, 2, {
  poses: { andar: P(10, 0, 1), parado: P(10, 0, 1), preparar: P(1, 2), deslizar: P(1, 3), cansado: P(16, 0, 1) },
  olhos: [[24, 8]]
});


// ---------- Montanhas Rochosas ----------

// Cabra-montesa 28x24: chifres enrolados, barbicha; abaixa a cabeça e dá cabeçada correndo
function quadroCabra(pose) {
  const g = gGrade(28, 24);
  const T = "BLDH";
  const idx = { c0: 0, c1: 1, c2: 2, c3: 3 }[pose];
  const corre = idx !== undefined;
  const prep = pose === "preparar", inv = pose === "investida", cansa = pose === "cansado";
  const by = prep ? 1.5 : (corre ? [0, 0.6, 0, 0.6][idx] : 0);
  // pernas finas com cascos
  const patas = corre ? [[[19, 15], [20 + [2, 0, -1, 0][idx], 22]], [[17, 15], [16 + [-1, 0, 2, 0][idx], 22]], [[9, 15], [8 + [2, 0, -1, 0][idx], 22]], [[7, 15], [6 + [-1, 0, 2, 0][idx], 22]]]
    : inv ? [[[19, 15], [24, 21]], [[17, 15], [21, 22]], [[9, 15], [4, 21]], [[7, 15], [2, 22]]]
    : [[[19, 15], [19.5, 22]], [[17, 15], [16.6, 22]], [[9, 15], [9, 22]], [[7, 15], [6.6, 22]]];
  patas.forEach(function(p, i) {
    gFio(g, p[0][0], p[0][1] + by, p[1][0], p[1][1] - 1, 1.3, 0.9, i % 2 ? "D" : "B");
    gRet(g, p[1][0] - 1, p[1][1] - 1, 2, 1, "N");
  });
  // rabinho
  gElipse(g, 4.4, 9.6 + by, 1.6, 1.2, "L");
  // corpo lanoso
  gBola(g, 13, 11.6 + by, 9, 4.8, T);
  gRuido(g, 11, "B", "L", 0.12);
  // pescoço e cabeça (abaixa na cabeçada)
  const hx = inv || prep ? 23 : 22, hy = inv ? 11 + by : prep ? 10 + by : cansa ? 9 + by : 6 + by;
  gFio(g, 19, 10 + by, hx - 1, hy + 1, 3, 2.4, "B");
  gBola(g, hx, hy, 3.2, 2.8, T);
  gElipse(g, hx + 2.4, hy + 1.4, 1.8, 1.4, "L");
  gPonto(g, hx + 3.4, hy + 1, "R");
  // barbicha
  gPoli(g, [[hx + 1, hy + 2.6], [hx + 2.6, hy + 2.6], [hx + 1.6, hy + 5.4]], "L");
  // orelha e chifre enrolado para trás
  gPoli(g, [[hx - 2, hy - 1], [hx - 4.6, hy - 0.4], [hx - 2.2, hy + 0.6]], "B");
  gPonto(g, hx - 3, hy - 0.4, "P");
  const cy = inv || prep ? hy - 2 : hy - 2.6;
  for (let k = 0; k <= 10; k++) {
    const a = -Math.PI * 0.2 - k * 0.3;
    const rr = 3.6 - k * 0.12;
    gElipse(g, hx - 1.2 + Math.cos(a) * rr * (inv ? -0.2 : 1) - (inv ? 0 : 1), cy + Math.sin(a) * rr + 1.6, 1.1, 1.1, k % 3 === 0 ? "c" : "C");
  }
  // olho (bravo quando prepara)
  gRet(g, hx, hy - 1, 1, 1, "E");
  if (prep || inv) gLinha(g, hx - 1, hy - 2, hx + 1.4, hy - 1.4, "K");
  if (cansa) gRet(g, hx + 2, hy + 3, 2, 1, "M");
  gContorno(g, "K");
  return gMapa(g);
}

registrarInimigo("cabra", ["c0", "c1", "c2", "c3", "preparar", "investida", "cansado"].map(quadroCabra),
  { K: "#2e2a26", D: "#b8ad9c", B: "#e9e2d4", L: "#fbf8f1", H: "#ffffff", C: "#7a6650", c: "#a8927a", N: "#3a2e24",
    E: "#111111", R: "#5a4a40", P: "#e8b0a8", M: "#7a1f2a" }, 2, {
  poses: { andar: P(6, 0, 1, 2, 3), parado: P(22, 0, 2), preparar: P(1, 4), deslizar: P(3, 5), cansado: P(16, 6) },
  olhos: [[22, 6]]
});

// Águia: o mesmo desenho do abutre com as cores de uma águia (cabeça branca, bico amarelo)
registrarInimigo("aguia", [0, 1, 2, 3, 4].map(quadroAbutre),
  { K: "#1a120a", D: "#3a2614", d: "#4a301a", N: "#6b4626", L: "#8f6236", H: "#b88a52", C: "#ffffff", V: "#e6e9ec", S: "#c5cbd2",
    P: "#ffffff", Q: "#dfe3e7", q: "#ffffff", Y: "#ffc21a", y: "#c98a00", E: "#111111", G: "#ffe066" }, 2, {
  poses: { voar: P(4, 0, 1, 2, 3), parado: P(4, 0, 1, 2, 3), subindo: P(3, 0, 1, 2, 3), mergulho: P(1, 4) },
  olhos: [[22, 7]]
});

// Marmota 22x20: sai da toca, olha em volta e assobia
function quadroMarmota(pose) {
  const g = gGrade(22, 20);
  const T = "BLDH";
  const apito = pose === "apito";
  // corpo gordinho em pé
  gBola(g, 11, 13.4, 6.4, 6, T);
  gElipse(g, 11.6, 15, 3.8, 4, "P");
  // cabeça
  gBola(g, 11.4, 6, 5.2, 4.4, T);
  gElipse(g, 13.6, 7.6, 2.6, 1.8, "P");
  gPonto(g, 15.8, 6.6, "R");
  // orelhinhas
  gElipse(g, 7.6, 2.6, 1.4, 1.2, "D"); gElipse(g, 14.6, 2.4, 1.4, 1.2, "D");
  // olhos
  gRet(g, 9.6, 4.6, 1, 2, "E"); gRet(g, 13.4, 4.6, 1, 2, "E");
  gPonto(g, 9.6, 4.6, "W"); gPonto(g, 13.4, 4.6, "W");
  // dentões e boca
  if (apito) {
    gElipse(g, 14.6, 9.4, 1.2, 1.1, "M");
  } else {
    gRet(g, 13.6, 9, 2, 2, "W");
    gPonto(g, 14, 9, "Q");
  }
  // patinhas na frente da barriga
  const py = apito ? 9.8 : 12;
  gElipse(g, 9.2, py, 1.6, 1.2, "D"); gElipse(g, 13.6, py, 1.6, 1.2, "D");
  gContorno(g, "K");
  if (apito) { gLinha(g, 17, 6, 19, 5, "W"); gLinha(g, 17, 8, 20, 8, "W"); }
  return gMapa(g);
}

registrarInimigo("marmota", ["fora", "apito"].map(quadroMarmota),
  { K: "#2a1a0e", D: "#6b4626", B: "#a0724a", L: "#c99a6a", H: "#e8c49a", P: "#ead2b0", R: "#3a2418", E: "#111111", W: "#ffffff", Q: "#d8d0c0", M: "#5a1a1a" }, 2, {
  poses: { parado: P(40, 0, 1), fora: P(40, 0, 1), apito: P(1, 1) },
  olhos: [[10, 5], [14, 5]]
});

// Lhama 24x32: pescoço comprido, pompons coloridos nas orelhas e manta nas costas; cospe
function quadroLhama(pose) {
  const g = gGrade(24, 32);
  const T = "WLSH";
  const car = pose === "carregar", ati = pose === "atirar", resp = pose === "respira" ? 0.5 : 0;
  // pernas
  [[7, true], [9.6, false], [15, true], [17.6, false]].forEach(function(p) {
    gFio(g, p[0], 22, p[0] + 0.2, 30, 1.3, 1.1, p[1] ? "S" : "W");
    gRet(g, p[0] - 1, 30, 2, 1, "N");
  });
  // corpo de lã
  gBola(g, 12, 19 + resp * 0.5, 8, 5, T);
  gRuido(g, 13, "W", "L", 0.18);
  // manta colorida nas costas
  gRet(g, 7, 14 + resp * 0.5, 10, 4, "R");
  gRet(g, 7, 15 + resp * 0.5, 10, 1, "Y");
  gRet(g, 7, 17 + resp * 0.5, 10, 1, "B");
  for (let x = 7; x < 17; x += 2) gPonto(g, x, 18 + resp * 0.5, "Y");
  // rabinho
  gElipse(g, 3.6, 16.4, 1.6, 1.6, "L");
  // pescoço e cabeça (vai pra trás carregando, pra frente cuspindo)
  const hx = car ? 16 : ati ? 20 : 18, hy = car ? 6.6 : ati ? 7.6 : 6.4 + resp;
  gFio(g, 16, 16, hx - 1, hy + 2, 2.6, 2.2, "W");
  gBola(g, hx, hy, 3.4, 2.8, T);
  gElipse(g, hx + 2.6, hy + 1, 2, 1.6, "L");
  gPonto(g, hx + 3.8, hy + 0.6, "K");
  // orelhas de banana com pompons
  gPoli(g, [[hx - 2.4, hy - 1.6], [hx - 2.8, hy - 6], [hx - 1.2, hy - 2]], "W");
  gPoli(g, [[hx - 0.4, hy - 2], [hx + 0.2, hy - 6.2], [hx + 1.2, hy - 2]], "S");
  gElipse(g, hx - 2.8, hy - 6, 1, 1, "R"); gElipse(g, hx + 0.2, hy - 6.4, 1, 1, "B");
  // olho com cílios
  gRet(g, hx, hy - 0.6, 1, 2, "E");
  gPonto(g, hx - 1, hy - 1.4, "K");
  // bochecha cheia / boca cuspindo
  if (car) gElipse(g, hx + 1.6, hy + 1.8, 1.6, 1.2, "Q");
  if (ati) { gRet(g, hx + 2, hy + 2.2, 3, 1, "M"); gPonto(g, hx + 5, hy + 2, "G"); }
  else gRet(g, hx + 2, hy + 2, 2, 1, "M");
  gContorno(g, "K");
  return gMapa(g);
}

registrarInimigo("lhama", ["parado", "respira", "carregar", "atirar"].map(quadroLhama),
  { K: "#3a2a1e", W: "#f4ead8", L: "#fffaf0", S: "#d8c8a8", H: "#ffffff", N: "#4a3626", E: "#111111",
    R: "#e03131", Y: "#ffd43b", B: "#1c7ed6", Q: "#f7c8b8", M: "#6a2a2a", G: "#c3d99a" }, 2, {
  poses: { parado: P(34, 0, 1), carregar: P(1, 2), atirar: P(1, 3) },
  olhos: [[18, 6]]
});

// Urso Pardo 32x24: grandão, anda nas quatro patas balançando a cabeça
function quadroUrso(pose) {
  const g = gGrade(32, 24);
  const T = "BLDH";
  const idx = { a: 0, b: 1, c: 2, d: 3, cheira: 4 }[pose];
  const by = [0, 0.7, 0, 0.7, 0][idx];
  // patas (de trás mais escuras)
  const pa = [[23, [1.5, 0, -1.5, 0, 0][idx]], [20, [-1.5, 0, 1.5, 0, 0][idx]], [10, [1.5, 0, -1.5, 0, 0][idx]], [7, [-1.5, 0, 1.5, 0, 0][idx]]];
  pa.forEach(function(p, i) {
    const cor = i % 2 ? "D" : "B";
    gFio(g, p[0], 14 + by, p[0] + p[1], 21, 2.4, 2, cor);
    gElipse(g, p[0] + p[1] + 0.6, 22, 2.6, 1.2, cor === "D" ? "d" : "D");
  });
  // corpo
  gBola(g, 15, 12 + by, 11, 6.6, T);
  gBola(g, 10, 10 + by, 6.4, 5.4, T);   // corcunda
  gRuido(g, 31, "B", "L", 0.08);
  // cabeça
  const hy = idx === 4 ? 14 : 11 + by;
  gBola(g, 25.4, hy, 4.6, 4, T);
  gElipse(g, 28.6, hy + 1.4, 2.4, 1.8, "P");
  gRet(g, 30, hy + 0.4, 2, 2, "E");
  gElipse(g, 23, hy - 3.6, 1.6, 1.4, "D"); gPonto(g, 23, hy - 3.6, "P");
  gRet(g, 25.6, hy - 1, 1, 2, "E"); gPonto(g, 25.6, hy - 1, "W");
  if (idx === 4) gLinha(g, 31, hy + 2.4, 32, hy + 3, "E");
  gContorno(g, "K");
  // garrinhas
  pa.forEach(function(p) { gPonto(g, p[0] + p[1] + 2.4, 22, "W"); });
  return gMapa(g);
}

registrarInimigo("urso", ["a", "b", "c", "d", "cheira"].map(quadroUrso),
  { K: "#1e120a", D: "#5a3a22", d: "#3e2816", B: "#7c5232", L: "#9e7048", H: "#c29466", P: "#c9a27a", E: "#111111", W: "#f1e9d2" }, 2, {
  poses: { andar: P(9, 0, 1, 2, 3), parado: P(30, 4, 0) },
  olhos: [[26, 10]]
});
