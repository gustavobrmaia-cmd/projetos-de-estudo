"use strict";

// =========================
// ARTE DOS MUNDOS NOVOS (Oceano e Montanhas Rochosas) e objetos novos
// Terreno, fundos com paralaxe, decoração, ícones dos poderes novos, projéteis e obstáculos.
// Usa as mesmas ferramentas de arte.js / pixelarte.js / arte_objetos.js, no mesmo estilo.
// Os mundos novos entram ANTES da Lava nas listas (TEMAS, SPR_DECOR, FUNDO_MUNDO).
// =========================

// ---------- TERRENO: OCEANO ----------
function terraOceano() {
  const r = criarRng(5501);
  const t = telaPixel(16, 16, 2, true);
  t.ret(0, 0, 16, 16, "#c8b27c");
  // camadinhas de areia molhada
  t.ret(0, 5, 16, 2, "#bca56f");
  t.ret(0, 11, 16, 2, "#d2bd88");
  manchasPx(t, r, ["#b39b66", "#bba26c"], 12, 3);
  manchasPx(t, r, ["#d8c592", "#dccb9a"], 10, 3);
  pontosPx(t, r, "#9c8656", 7);
  pontosPx(t, r, "#efe3bc", 4);
  // conchinha e pedrinha
  t.px(4, 9, "#f8e1d8"); t.px(5, 9, "#f2c9bc"); t.px(4, 10, "#e3a99a"); t.px(5, 10, "#f2c9bc"); t.px(6, 10, "#e3a99a");
  pedraPx(t, 11, 13, 2, 1, { borda: "#5f5038", cor: "#8f9aa6", luz: "#c5ced8", sombra: "#5f6a76" });
  return t.c;
}

function topoOceano(terra) {
  const r = criarRng(5502);
  const t = topoSobre(terra);
  for (let x = 0; x < 16; x++) {
    const prof = 4 + Math.round(Math.abs(Math.sin(x * Math.PI / 8 + 0.4)) * 1.2);
    for (let y = 0; y < prof; y++) {
      t.px(x, y, y === 0 ? "#fff3cc" : y < 2 ? "#f0dda8" : y < prof - 1 ? "#e2cd94" : "#cdb67e");
    }
    t.px(x, prof, "#a38c58");
    if (r() < 0.4) t.px(x, prof + 1, "#b19a64");
  }
  // marcas da correnteza na areia
  [[1, 2, 4], [8, 1, 4], [12, 3, 3]].forEach(function(o) {
    t.ret(o[0], o[1], o[2], 1, "#d4bd86");
    t.ret(o[0] + 1, o[1] - 1, Math.max(1, o[2] - 2), 1, "#fff8dc");
  });
  pontosPx(t, r, "#fffbe8", 2);
  t.ret(0, 0, 16, 1, "#fff6d4");
  return t.c;
}

function franjaOceano() {
  const t = telaPixel(16, 4, 2, false);
  // capim-marinho (fitas verdes) e uma estrela-do-mar
  [[0, 3, "#2b8a3e"], [1, 4, "#37b24d"], [5, 2, "#2b8a3e"], [10, 3, "#37b24d"], [11, 4, "#2b8a3e"], [15, 2, "#37b24d"]].forEach(function(b) {
    for (let k = 0; k < b[1]; k++) t.px(b[0] + (k > 1 ? 1 : 0), 3 - k, k === b[1] - 1 ? "#8ce99a" : b[2]);
  });
  t.px(7, 2, "#ff8787"); t.px(6, 3, "#ff6b6b"); t.px(7, 3, "#ffc9c9"); t.px(8, 3, "#ff6b6b");
  t.px(13, 3, "#f783ac"); t.px(14, 3, "#fcc2d7");
  return t.c;
}

function criarTemaOceano() {
  const terra = terraOceano();
  return {
    topo: topoOceano(terra), terra: terra, franja: franjaOceano(),
    bloco: tijolosTile(5511, {
      arg: "#1f4352", cor: ["#6e8c99", "#668593", "#78969f"], claro: "#8eaab4", escuro: "#557380",
      luz: "#b0c8d0", sombra: "#41606c"
    }, function(t) {
      // corais e algas grudados nas pedras
      t.ret(1, 0, 3, 1, "#f06595"); t.px(2, 1, "#c2255c"); t.px(1, 1, "#ff8fab");
      t.ret(9, 8, 4, 1, "#2f9e44"); t.px(10, 9, "#2b8a3e"); t.px(11, 9, "#69db7c");
      t.px(13, 2, "#ff922b"); t.px(14, 2, "#ffc078"); t.px(5, 11, "#ffffff"); t.px(6, 12, "#dee2e6");
    }),
    plat: plataformaTile(5512, {
      cor: "#7d6a52", luz: "#b39d7e", luz2: "#9a8466", sombra: "#55463a", borda: "#2c241c",
      veio: "#6a5844", veio2: "#998268", prego: "#e9ecef"
    }, function(t) {
      // cracas (bolinhas brancas) na tábua velha de navio
      [[4, 6], [5, 6], [11, 6], [12, 5]].forEach(function(p) { t.px(p[0], p[1], "#f1f3f5"); });
      t.ret(7, 0, 2, 1, "#2f9e44");
    }),
    espinho: espinhoTile({
      cor: "#3d2a63", luz: "#8466c4", sombra: "#22163f", borda: "#140b28", ponta: "#e5dbff", brilho: "#b197fc",
      base: "#c8b27c", baseLuz: "#fff3cc"
    })
  };
}

// ---------- TERRENO: MONTANHAS ROCHOSAS ----------
function terraMontanha() {
  const r = criarRng(6601);
  const t = telaPixel(16, 16, 2, true);
  const faixas = ["#8a5c46", "#8a5c46", "#7c5040", "#9a6a50", "#9a6a50", "#a97a5a", "#8a5c46", "#74493a",
    "#7c5040", "#8a5c46", "#9a6a50", "#9a6a50", "#86584a", "#7c5040", "#8a5c46", "#8a5c46"];
  for (let x = 0; x < 16; x++) {
    const onda = Math.round(Math.sin(x * Math.PI * 2 / 16) * 0.9);
    for (let y = 0; y < 16; y++) t.px(x, y, faixas[((y + onda) % 16 + 16) % 16]);
  }
  manchasPx(t, r, ["#6b4434", "#734a3a"], 9, 3);
  pontosPx(t, r, "#b88c6a", 6);
  pedraPx(t, 4, 9, 3, 2, { borda: "#4a2e22", cor: "#9aa0a8", luz: "#cfd4da", sombra: "#6a7078" });
  pedraPx(t, 12, 3, 2, 1, { borda: "#4a2e22", cor: "#8d939b", luz: "#c3c8ce", sombra: "#5f656c" });
  return t.c;
}

function topoMontanha(terra) {
  const r = criarRng(6602);
  const t = topoSobre(terra);
  const verdes = ["#a9c95a", "#86b04a", "#6a9a3c", "#557f30", "#40632a"];
  for (let x = 0; x < 16; x++) {
    const prof = 4 + (r() < 0.5 ? 0 : 1);
    t.px(x, prof, "#5a3a2a");
    for (let y = 0; y < prof; y++) {
      t.px(x, y, y === 0 ? verdes[0] : y === 1 ? verdes[1] : y === prof - 1 ? verdes[4] : verdes[2]);
    }
  }
  // tufinhos e florzinhas brancas
  [3, 9, 13].forEach(function(x) { t.px(x, 2, verdes[3]); t.px(x, 3, verdes[3]); });
  t.px(6, 1, "#ffffff"); t.px(12, 1, "#ffffff"); t.px(6, 0, "#fff3bf");
  t.ret(0, 0, 16, 1, "#b8d46a");
  return t.c;
}

function franjaMontanha() {
  const r = criarRng(6603);
  const t = telaPixel(16, 4, 2, false);
  for (let x = 0; x < 16; x++) {
    if (r() < 0.6) {
      const h = 1 + Math.floor(r() * 3);
      for (let k = 0; k < h; k++) t.px(x, 3 - k, k === h - 1 ? "#b8d46a" : "#6a9a3c");
    }
  }
  // edelvais (estrelinha branca) e uma pedrinha
  t.px(5, 1, "#ffffff"); t.px(4, 2, "#ffffff"); t.px(6, 2, "#ffffff"); t.px(5, 3, "#ffffff"); t.px(5, 2, "#ffe066");
  pedraPx(t, 11, 3, 2, 1, { borda: "#4a2e22", cor: "#8d939b", luz: "#c3c8ce", sombra: "#5f656c" });
  return t.c;
}

function criarTemaMontanha() {
  const terra = terraMontanha();
  return {
    topo: topoMontanha(terra), terra: terra, franja: franjaMontanha(),
    bloco: tijolosTile(6611, {
      arg: "#3e3a3c", cor: ["#8c8a8e", "#838186", "#96949a"], claro: "#a6a4aa", escuro: "#6e6c72",
      luz: "#c8c6cc", sombra: "#56545a"
    }, function(t) {
      // líquen laranja e verde nas pedras
      t.px(2, 2, "#f59f00"); t.px(3, 2, "#ffc078"); t.px(2, 3, "#e67700");
      t.px(11, 10, "#82c91e"); t.px(12, 10, "#a9e34b"); t.px(12, 11, "#5c940d");
    }),
    plat: plataformaTile(6612, {
      cor: "#8a6440", luz: "#c49a6a", luz2: "#a87c50", sombra: "#5e4128", borda: "#2e1e10",
      veio: "#74522f", veio2: "#a87c50", prego: "#ced4da"
    }, function(t) {
      // corda amarrando as tábuas
      for (let y = 1; y < 7; y++) { t.px(4, y, y % 2 ? "#e9d8a6" : "#c2a76a"); t.px(11, y, y % 2 ? "#c2a76a" : "#e9d8a6"); }
    }),
    espinho: espinhoTile({
      cor: "#7c7a80", luz: "#c8c6cc", sombra: "#4a484e", borda: "#242226", ponta: "#ffffff", brilho: "#e9ecef",
      base: "#8a5c46", baseLuz: "#a9c95a"
    })
  };
}

// Os dois mundos novos entram antes da Lava
TEMAS.splice(M_OCEANO, 0, criarTemaOceano(), criarTemaMontanha());


// ---------- DECORAÇÃO ----------
function decorOceano() {
  const t = telaPixel(44, 30, 2, false);
  t.ret(3, 28, 38, 2, "rgba(0,30,40,0.3)");
  // alga comprida atrás
  for (let y = 4; y < 28; y++) {
    const x = 34 + Math.round(Math.sin(y * 0.45) * 1.5);
    t.ret(x, y, 2, 1, y % 5 === 0 ? "#69db7c" : "#2b8a3e");
    if (y % 4 === 1) t.px(x + 2, y, "#37b24d");
  }
  // coral-cérebro (bola rosada com sulcos)
  circuloPx(t, 12, 22, 7, "#a61e4d");
  circuloPx(t, 11, 21, 6, "#f06595");
  circuloPx(t, 10, 20, 3, "#ffa8c5");
  for (let k = 0; k < 4; k++) t.ret(6 + k * 3, 18 + (k % 2) * 3, 2, 1, "#c2255c");
  // coral galhado laranja
  const galho = function(x, y, a, n) {
    for (let i = 0; i < n; i++) {
      t.ret(x, y, 2, 1, i > n - 3 ? "#ffc078" : "#ff922b");
      y -= 1; x += a * (i % 3 === 0 ? 1 : 0);
      if (i === Math.floor(n / 2)) galho(x, y, -a, Math.floor(n / 2));
    }
  };
  galho(23, 27, 1, 14);
  galho(26, 27, -1, 11);
  // anêmona roxa com tentáculos
  t.ret(28, 24, 8, 4, "#5f3dc4");
  t.ret(28, 24, 8, 1, "#9775fa");
  for (let k = 0; k < 6; k++) {
    const x = 28 + k + (k > 2 ? 1 : 0);
    t.ret(x, 20 + (k % 2), 1, 4 - (k % 2), "#e599f7");
    t.px(x, 19 + (k % 2), "#f3d9fa");
  }
  // concha e estrela-do-mar
  t.ret(4, 26, 4, 2, "#f8e1d8"); t.px(5, 26, "#e3a99a"); t.px(6, 27, "#e3a99a");
  [[39, 26], [38, 27], [40, 27], [39, 28], [37, 28], [41, 28]].forEach(function(p) { t.px(p[0], p[1], "#ff8787"); });
  t.px(39, 27, "#ffc9c9");
  return t.c;
}

function decorMontanha() {
  const t = telaPixel(42, 34, 2, false);
  t.ret(3, 32, 36, 2, "rgba(30,15,5,0.3)");
  // pinheirinho atrás
  pinheiroPx(t, 30, 32, 26, { tronco: "#4a3328", cor: "#2f6b45", sombra: "#1f4d32" });
  // pedregulho com líquen
  poligonoPx(t, [[2, 33], [4, 23], [10, 17], [18, 16], [24, 20], [27, 27], [27, 33]], "#5f5d63");
  poligonoPx(t, [[2, 33], [4, 23], [10, 17], [14, 17], [12, 33]], "#8c8a8e");
  poligonoPx(t, [[10, 17], [18, 16], [22, 19], [15, 21]], "#aeacb2");
  t.ret(6, 22, 3, 1, "#f59f00"); t.px(7, 23, "#e67700"); t.ret(18, 25, 3, 1, "#82c91e"); t.px(19, 26, "#5c940d");
  // tufo de capim e edelvais
  [[29, 4], [31, 5], [33, 3], [35, 4], [37, 3]].forEach(function(c) {
    for (let k = 0; k < c[1]; k++) t.px(c[0], 32 - k, k === c[1] - 1 ? "#b8d46a" : "#6a9a3c");
  });
  [[34, 27], [38, 29]].forEach(function(f) {
    t.px(f[0], f[1] - 1, "#ffffff"); t.px(f[0] - 1, f[1], "#ffffff"); t.px(f[0] + 1, f[1], "#ffffff"); t.px(f[0], f[1] + 1, "#ffffff");
    t.px(f[0], f[1], "#ffe066");
  });
  return t.c;
}

SPR_DECOR.splice(M_OCEANO, 0, decorOceano(), decorMontanha());


// Pedra arredondada simples (como rochaPx do Vulcão, mas sem rachaduras de magma)
function rochaLisaPx(t, r, cx, base, w, h, c) {
  const rr = [];
  for (let x = 0; x < w; x++) {
    const u = x / (w - 1);
    rr.push(Math.round(h * Math.pow(Math.sin(Math.PI * u), 0.6) + (r() < 0.25 ? 1 : 0)));
  }
  for (let x = 0; x < w; x++) {
    const y = base - rr[x];
    t.ret(cx - w / 2 + x, y, 1, rr[x] + 1, c.cor);
    t.px(cx - w / 2 + x, y, c.luz);
    if (x < w - 1 && rr[x] > rr[x + 1]) t.px(cx - w / 2 + x, y + 1, c.luz);
    if (x > w * 0.6) t.px(cx - w / 2 + x, y + 2, c.sombra);
  }
}

// ---------- FUNDO: OCEANO ----------
function montarFundoOceano() {
  const agua = "#1a8fb4";
  const ceuT = telaPixel(300, ALT_LOGICA, 1, false);
  ceuDegrade(ceuT, [[0, "#7fe3f2"], [0.22, "#3cbad6"], [0.55, "#1a86b0"], [0.85, "#0f5a84"], [1, "#0b3f66"]], 170, 14);
  // brilho da superfície lá em cima
  for (let x = 0; x < 300; x++) {
    if ((x * 7) % 11 < 4) ceuT.px(x, 1 + Math.round(Math.sin(x * 0.3) * 1), "rgba(255,255,255,0.45)");
  }

  // rochedos distantes, navio afundado e algas compridas (tudo azulado)
  const longe = novaCamada(70, 170);
  {
    const r = criarRng(5521);
    const M = function(c) { return mixar(c, agua, 0.62); };
    dunasPx(longe, r, { base: 150, amp: 22, harm: [[2, 1.1], [5, 0.6], [11, 0.3]], sombra: M("#244a5e"), luz: M("#3d6a80"), rim: M("#6aa0b4") });
    // navio afundado inclinado
    const nx = 380, ny = 128;
    poligonoPx(longe, [[nx - 34, ny - 2], [nx + 30, ny - 12], [nx + 26, ny + 4], [nx - 28, ny + 14]], M("#3a3026"));
    poligonoPx(longe, [[nx - 34, ny - 2], [nx + 30, ny - 12], [nx + 30, ny - 9], [nx - 32, ny + 1]], M("#5a4a3a"));
    longe.ret(nx - 4, ny - 44, 2, 36, M("#3a3026"));
    longe.ret(nx + 14, ny - 34, 2, 26, M("#3a3026"));
    poligonoPx(longe, [[nx - 3, ny - 42], [nx + 12, ny - 36], [nx - 2, ny - 28]], M("#7a8a8a"));
    for (let k = 0; k < 4; k++) longe.ret(nx - 20 + k * 10, ny + 2 - k * 2, 3, 2, M("#1c1812"));
    // algas compridas
    for (let x = 10; x < LARG_CAMADA; x += 23 + Math.floor(r() * 30)) {
      const alt = 30 + Math.floor(r() * 40);
      for (let y = 0; y < alt; y++) longe.ret(x + Math.round(Math.sin(y * 0.18 + x) * 2), 152 - y, 2, 1, M("#2b8a3e"));
    }
    nevoaPx(longe, 110, 166, "#0f5a84", 0.55);
  }

  // recife de coral no meio
  const meio = novaCamada(95, 175);
  {
    const r = criarRng(5522);
    const M = function(c) { return mixar(c, agua, 0.32); };
    const recife = perfilSeno(r, LARG_CAMADA, [[3, 6], [7, 3], [13, 1.5]]);
    const topo = function(x) { return Math.round(150 + recife(x)); };
    for (let x = 0; x < LARG_CAMADA; x++) {
      meio.ret(x, topo(x), 1, 175 - topo(x), M("#2c4a5c"));
      meio.px(x, topo(x), M("#5a8090"));
    }
    const cores = [["#f06595", "#ff8fab"], ["#ff922b", "#ffc078"], ["#be4bdb", "#e599f7"], ["#fcc419", "#ffe066"], ["#20c997", "#96f2d7"]];
    for (let x = 4; x < LARG_CAMADA; x += 7 + Math.floor(r() * 9)) {
      const c = cores[Math.floor(r() * cores.length)];
      const base = topo(x);
      const tipo = r();
      if (tipo < 0.4) {
        // coral galhado
        for (let k = 0; k < 3; k++) {
          const h = 6 + Math.floor(r() * 8);
          const gx = x + k * 2 - 2;
          meio.ret(gx, base - h, 1, h, M(c[0]));
          meio.px(gx, base - h, M(c[1]));
          if (k === 1) meio.ret(gx - 1, base - h + 2, 3, 1, M(c[0]));
        }
      } else if (tipo < 0.7) {
        // leque-do-mar
        for (let k = 0; k < 8; k++) {
          const a = Math.PI * (0.15 + 0.7 * k / 7);
          for (let s = 0; s < 9; s++) meio.px(x + Math.cos(a) * s, base - Math.sin(a) * s, M(s > 6 ? c[1] : c[0]));
        }
      } else {
        // coral-cérebro
        circuloPx(meio, x, base - 2, 3 + r() * 2, M(c[0]));
        meio.px(x - 1, base - 4, M(c[1]));
      }
    }
    nevoaPx(meio, 140, 172, "#0f5a84", 0.3);
  }

  // pedras escuras com algas bem perto
  const perto = novaCamada(125, 175);
  {
    const r = criarRng(5523);
    perto.ret(0, 162, LARG_CAMADA, 13, "#0a2a3a");
    for (let x = 6; x < LARG_CAMADA; x += 30 + Math.floor(r() * 30)) {
      rochaLisaPx(perto, r, x, 164, 20 + Math.floor(r() * 14), 8 + Math.floor(r() * 10), { cor: "#0e3346", luz: "#2a5d74", sombra: "#061a24" });
      for (let k = 0; k < 3; k++) {
        const ax = x - 8 + k * 7, h = 12 + Math.floor(r() * 14);
        for (let y = 0; y < h; y++) perto.px(ax + Math.round(Math.sin(y * 0.4 + k) * 1.2), 164 - y, y > h - 3 ? "#1f6b3a" : "#124a2a");
      }
    }
  }

  // cardume passando e bolhas subindo (animados)
  const peixes = [];
  for (let i = 0; i < 3; i++) peixes.push({ y: 160 + i * 90, v: 0.6 + i * 0.25, f: 0.04 + i * 0.03, n: 6 + i * 2, x: i * 700, cor: ["#a5d8ff", "#ffe066", "#ffc9c9"][i] });
  const bolhas = [];
  for (let i = 0; i < 14; i++) bolhas.push({ x: (i * 173) % 1200, v: 0.4 + (i % 4) * 0.2, f: (i * 97) % 700, s: 4 + (i % 3) * 2 });

  return {
    ceu: ampliarCanvas(ceuT.c, ESC_FUNDO),
    itens: [
      fecharCamada(longe, 0.1),
      { fn: function(g, cam, t) {
        for (let i = 0; i < peixes.length; i++) {
          const p = peixes[i];
          const span = LARGURA + 600;
          const bx = ((((p.x + t * p.v - cam * p.f) % span) + span) % span) - 300;
          g.fillStyle = p.cor;
          g.globalAlpha = 0.45;
          for (let k = 0; k < p.n; k++) {
            const fx = Math.round(bx + (k % 4) * 26 + Math.floor(k / 4) * 13);
            const fy = Math.round(p.y + Math.floor(k / 4) * 14 + Math.sin(t * 0.05 + k) * 4);
            g.fillRect(fx, fy, 12, 4);
            g.fillRect(fx - 4, fy - 2, 4, 8);
          }
        }
        g.globalAlpha = 1;
      } },
      fecharCamada(meio, 0.25),
      { fn: function(g, cam, t) {
        g.fillStyle = "rgba(220,250,255,0.55)";
        for (let i = 0; i < bolhas.length; i++) {
          const b = bolhas[i];
          const y = 700 - ((t * b.v + b.f) % 760);
          const x = ((b.x + Math.sin(t / 40 + i) * 10 - cam * 0.3) % 1200 + 1200) % 1200;
          g.fillRect(Math.round(x), Math.round(y), b.s, b.s);
        }
      } },
      fecharCamada(perto, 0.5)
    ]
  };
}

// ---------- FUNDO: MONTANHAS ROCHOSAS ----------
function montarFundoMontanha() {
  const haze = "#c9d6ea";
  const ceuT = telaPixel(300, ALT_LOGICA, 1, false);
  ceuDegrade(ceuT, [[0, "#3a6cb4"], [0.45, "#6fa2dc"], [0.8, "#b9d6f2"], [1, "#f4e4d2"]], 140);
  astroPx(ceuT, 52, 30, 8, ["#fff0b0", "#fff8d6", "#ffffff"], 0.045, "#fff2c0");

  const rn = criarRng(6621);
  const cores = ["#ffffff", "#f6f8ff", "#e2e8f6", "#c6d0e6"];
  const nuvens = [
    { c: nuvemSprite(rn, 50, 14, cores, true), x: 200, y: 90, v: 0.14, f: 0.04 },
    { c: nuvemSprite(rn, 36, 11, cores, true), x: 640, y: 170, v: 0.2, f: 0.06 },
    { c: nuvemSprite(rn, 60, 16, cores, true), x: 980, y: 60, v: 0.1, f: 0.03 },
    { c: nuvemSprite(rn, 30, 9, cores, true), x: 420, y: 260, v: 0.17, f: 0.08 }
  ];

  // picos altos com neve
  const longe = novaCamada(30, 165);
  {
    const r = criarRng(6622);
    const M = function(c) { return mixar(c, haze, 0.45); };
    montanhasPx(longe, r, {
      base: 150, alt: 112, harm: [[3, 0.7], [5, 0.5], [8, 0.3], [13, 0.2], [21, 0.1]],
      cor: M("#7a5a6e"), luz: M("#a87a7e"), sombra: M("#4f3a56"), luzDir: -1, fenda: M("#3e2e46"),
      neve: { linha: 64, cor: "#ffffff", sombra: M("#b8c4de"), topo: "#ffffff" }
    });
    nevoaPx(longe, 112, 156, haze, 0.75);
  }

  // cordilheira de rocha avermelhada com pinheiros
  const meio = novaCamada(80, 175);
  {
    const r = criarRng(6623);
    const M = function(c) { return mixar(c, haze, 0.25); };
    montanhasPx(meio, r, {
      base: 160, alt: 62, harm: [[4, 0.6], [7, 0.4], [11, 0.3], [17, 0.15]],
      cor: M("#8a5a44"), luz: M("#c08a62"), sombra: M("#5c3a32"), luzDir: -1, fenda: M("#4a2c26")
    });
    const c = { tronco: M("#3a2a24"), cor: M("#2f5e42"), sombra: M("#1f4230") };
    for (let x = 6; x < LARG_CAMADA; x += 7 + Math.floor(r() * 9)) {
      pinheiroPx(meio, x, 160 + Math.floor(r() * 4), 9 + Math.floor(r() * 7), c);
    }
    nevoaPx(meio, 140, 168, haze, 0.35);
  }

  // pinheiros grandes, pedregulhos e capim bem perto
  const perto = novaCamada(100, 175);
  {
    const r = criarRng(6624);
    const c = { tronco: "#3a2a22", cor: "#24503a", sombra: "#183a2a" };
    [20, 150, 236, 330, 452, 548].forEach(function(x, i) { pinheiroPx(perto, x, 162, 30 + (i % 3) * 8, c); });
    dunasPx(perto, r, { base: 166, amp: 8, harm: [[2, 0.8], [5, 0.5], [9, 0.2]], sombra: "#4a3a30", luz: "#6e5848", rim: "#8c7460" });
    for (let x = 10; x < LARG_CAMADA; x += 34 + Math.floor(r() * 30)) {
      rochaLisaPx(perto, r, x, 164, 16 + Math.floor(r() * 12), 7 + Math.floor(r() * 7), { cor: "#6e6a70", luz: "#a8a4aa", sombra: "#48444a" });
      for (let k = 0; k < 4; k++) {
        const ax = x + 9 + k * 2, h = 3 + Math.floor(r() * 4);
        perto.ret(ax, 165 - h, 1, h, k % 2 ? "#6a8a3a" : "#4a6a2a");
      }
    }
  }

  // condores bem longe planando
  const aves = [{ x: 200, y: 150, v: 0.35, f: 0.05, a: 0 }, { x: 900, y: 210, v: 0.25, f: 0.07, a: 2 }];

  return {
    ceu: ampliarCanvas(ceuT.c, ESC_FUNDO),
    itens: [
      { fn: fnNuvens(nuvens) },
      { fn: function(g, cam, t) {
        g.fillStyle = "rgba(40,30,50,0.55)";
        for (let i = 0; i < aves.length; i++) {
          const a = aves[i];
          const span = LARGURA + 200;
          const x = ((((a.x + t * a.v - cam * a.f) % span) + span) % span) - 100;
          const y = a.y + Math.sin(t / 70 + a.a) * 14;
          const asa = Math.sin(t / 25 + a.a) > 0.6 ? 4 : 0;
          g.fillRect(Math.round(x) - 14, Math.round(y) - asa, 12, 3);
          g.fillRect(Math.round(x) + 4, Math.round(y) - asa, 12, 3);
          g.fillRect(Math.round(x) - 2, Math.round(y), 6, 4);
        }
      } },
      fecharCamada(longe, 0.08),
      fecharCamada(meio, 0.22),
      fecharCamada(perto, 0.5)
    ]
  };
}

FUNDO_MUNDO.splice(M_OCEANO, 0, montarFundoOceano(), montarFundoMontanha());


// ---------- ÍCONES DOS PODERES QUE FALTAVAM ----------
ICONES.congelar = objCanvas(16, 16, 2, function(b) {
  const B = ["#1864ab", "#4dabf7", "#a5d8ff", "#ffffff"];
  // floco de neve de 6 pontas
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
    const x2 = 8 + Math.cos(a) * 7, y2 = 8 + Math.sin(a) * 7;
    pxMembro(b, 8, 8, x2, y2, 1.2, 0.7, B, { rim: false, luz: 0.2 });
    const xm = 8 + Math.cos(a) * 4.5, ym = 8 + Math.sin(a) * 4.5;
    pxLinha(b, xm, ym, xm + Math.cos(a + 0.9) * 2.2, ym + Math.sin(a + 0.9) * 2.2, B[2]);
    pxLinha(b, xm, ym, xm + Math.cos(a - 0.9) * 2.2, ym + Math.sin(a - 0.9) * 2.2, B[2]);
  }
  pxElipse(b, 8, 8, 2, 2, B, { rim: false });
  pxPonto(b, 7, 7, "#ffffff");
}, "#0b2a50");

ICONES.superPulo = objCanvas(16, 16, 2, function(b) {
  const G = ["#2b8a3e", "#40c057", "#8ce99a", "#ebfbee"];
  // mola e seta para cima
  for (let k = 0; k < 3; k++) pxRet(b, 4, 11 + k * 1.6, 8, 1, k % 2 ? "#868e96" : "#dee2e6");
  pxRet(b, 3, 15, 10, 1, "#495057");
  pxPoligono(b, [[8, 0.5], [14, 6.5], [10.5, 6.5], [10.5, 10], [5.5, 10], [5.5, 6.5], [2, 6.5]], G, { rim: false, curva: 0.6, luz: 0.2 });
  pxLinha(b, 8, 1.5, 3.5, 6, "#ffffff");
}, "#0b3a14");

ICONES.cura = objCanvas(16, 16, 2, function(b) {
  const R = ["#7a1010", "#e03131", "#ff8787", "#ffe3e3"];
  pxElipse(b, 5, 6, 4, 3.8, R, { rim: false });
  pxElipse(b, 11, 6, 4, 3.8, R, { rim: false });
  pxPoligono(b, [[1.2, 7], [14.8, 7], [8, 15]], R, { rim: false, curva: 0.6 });
  pxRet(b, 7, 4, 2, 7, "#ffffff");
  pxRet(b, 4.5, 6.5, 7, 2, "#ffffff");
  pxPonto(b, 3, 4, "#ffe3e3");
}, "#3a0606");

ICONES.invisivel = objCanvas(16, 16, 2, function(b) {
  const W = ["#748ca6", "#a5b8cc", "#dce6f0", "#ffffff"];
  // fantasminha meio transparente
  pxElipse(b, 8, 7, 6, 6, W, { rim: false });
  pxRet(b, 2, 7, 12, 6, W[2]);
  pxRet(b, 2, 7, 3, 6, W[3]);
  for (let k = 0; k < 4; k++) pxRet(b, 2 + k * 3, 13, 2, 2, W[k % 2 ? 1 : 2]);
  pxRet(b, 5, 6, 2, 3, "#2b3a4a");
  pxRet(b, 9, 6, 2, 3, "#2b3a4a");
  pxPonto(b, 5, 6, "#ffffff");
  // risquinhos de "sumindo"
  pxPonto(b, 14, 2, "#ffffff"); pxPonto(b, 1, 3, "#ffffff"); pxPonto(b, 15, 10, "#dce6f0");
}, "#2b3a4a");

ICONES.moedas2x = objCanvas(16, 16, 2, function(b) {
  const Y = ["#a8680a", "#f2b705", "#ffd43b", "#fff3a0"];
  pxElipse(b, 6, 9, 5, 5, Y, { rim: "#7a4a04" });
  pxElipse(b, 10, 6, 5, 5, Y, { rim: "#7a4a04" });
  pxRet(b, 9.5, 3.5, 1, 5, "#a8680a");
  pxPonto(b, 8, 4, "#ffffff");
  pxRet(b, 4.5, 6.5, 1, 5, "#a8680a");
  // brilhinho
  pxRet(b, 13, 11, 1, 5, "#ffffff"); pxRet(b, 11, 13, 5, 1, "#ffffff"); pxPonto(b, 13, 13, "#fff3a0");
}, "#3a2204");

ICONES.puloDuploP = objCanvas(16, 16, 2, function(b) {
  const B = ["#1a5aa8", "#3f95e8", "#74c0fc", "#d0ebff"];
  // asinhas de cada lado e duas setas
  [[1, 8], [15, 8]].forEach(function(p, i) {
    const s = i ? -1 : 1;
    pxPoligono(b, [[p[0], p[1] - 4], [p[0] + s * 4, p[1] - 1], [p[0] + s * 4, p[1] + 3], [p[0], p[1] + 1]], ["#adb5bd", "#dee2e6", "#f8f9fa", "#ffffff"], { rim: false, curva: 0.5 });
  });
  [2, 8].forEach(function(y, i) {
    pxPoligono(b, [[8, y], [12, y + 4], [10, y + 4], [8, y + 2.5], [6, y + 4], [4, y + 4]], B, { rim: false, curva: 0.5, luz: i ? 0 : 0.25 });
  });
  pxPonto(b, 8, 0, "#ffd43b");
}, "#0b2a58");


// ---------- PROJÉTEIS NOVOS ----------
SPR_PROJ.areia = objCanvas(12, 12, 2, function(b) {
  esferaPx(b, 6, 6, 5, ["#9c6a26", "#c9953f", "#e8bd6a", "#fff0bf"], { rim: false, tex: pxTexPelo(17, 0.3) });
  pxPonto(b, 4, 4, "#fff6d8");
  pxFiapos(b, 0.45, 5, null, ["#9c6a26", "#c9953f"]);
}, "#6b4410");

SPR_PROJ.tinta = objCanvas(12, 12, 2, function(b) {
  esferaPx(b, 6, 6.5, 5.2, ["#120a1e", "#2a1a40", "#4a2f6a", "#7a5aa0"], { rim: false });
  pxRet(b, 3, 3, 2, 1, "#b197fc");
  pxPonto(b, 9, 2, "#2a1a40");
  pxFiapos(b, 0.4, 2, null, ["#120a1e", "#2a1a40"]);
}, "#05030a");

SPR_PROJ.cuspe = objCanvas(10, 10, 2, function(b) {
  esferaPx(b, 5, 5, 4, ["#8fa86a", "#c3d99a", "#e9f5d0", "#ffffff"], { rim: false });
  pxPonto(b, 3, 3, "#ffffff");
  pxPonto(b, 8, 7, "#c3d99a");
}, "#4a5a30");

SPR_PROJ.minhoca = objCanvas(12, 6, 2, function(b) {
  for (let k = 0; k < 5; k++) pxElipse(b, 2 + k * 2, 3 + (k % 2 ? 0.6 : -0.6), 1.6, 1.6, ["#a8506a", "#e07a96", "#ffa8be", "#ffe3ec"], { rim: false });
  pxPonto(b, 10, 2, "#2a0a12");
}, "#5a1a2a");

SPR_PROJ.graveto = objCanvas(16, 6, 2, function(b) {
  pxMembro(b, 1, 4, 15, 2, 1.2, 1, ["#3d2410", "#6b4423", "#8a5a2b", "#b88a55"], { rim: false });
  pxLinha(b, 6, 3, 8, 0.5, "#6b4423");
  pxPonto(b, 8, 0, "#40c057");
}, "#2a1608");

SPR_PROJ.pedregulho = construirPedra(22, 13, true);


// ---------- OBSTÁCULOS NOVOS ----------

// Cospe-areia: montinho de areia com cara (fechado, olhos abertos, boca aberta cuspindo)
function construirCospeAreia(estado) {
  return objCanvas(40, 22, 2, function(b) {
    const S = ["#9a6c24", "#c9953f", "#e8bd6a", "#f8dc98", "#fff0c4"];
    const alto = estado === 2 ? 1 : 0;
    pxElipse(b, 20, 22 - alto, 19, 13 + alto * 2, S, { rim: false, tex: pxTexPelo(23, 0.16) });
    pxElipse(b, 13, 14, 5, 2, [S[2], S[3], S[3], S[4]], { rim: false });
    // pedrinhas na areia
    pxRet(b, 30, 17, 2, 1, "#8f9aa6"); pxRet(b, 6, 19, 2, 1, "#a8742c");
    // olhos
    if (estado === 0) {
      pxRet(b, 14, 12, 3, 1, "#5a3a10"); pxRet(b, 23, 12, 3, 1, "#5a3a10");
    } else {
      pxRet(b, 14, 10, 3, 3, "#ffffff"); pxRet(b, 23, 10, 3, 3, "#ffffff");
      pxRet(b, 15, 11, 2, 2, "#2a1a08"); pxRet(b, 24, 11, 2, 2, "#2a1a08");
      pxLinha(b, 13, 9, 17, 10, "#5a3a10"); pxLinha(b, 27, 9, 23, 10, "#5a3a10");
    }
    // boca
    if (estado === 2) {
      pxElipse(b, 20.5, 17, 3.4, 2.6, ["#2a1205", "#4a220a", "#6a3210", "#8a4a1a"], { rim: false });
      pxPonto(b, 19, 16, "#c9953f");
    } else {
      pxRet(b, 18, 16, 5, 1, "#6a4210");
    }
  }, "#5a3a10");
}
const SPR_COSPE = [construirCospeAreia(0), construirCospeAreia(1), construirCospeAreia(2)];

// Concha gigante: a metade de baixo (fica no chão) e a de cima (gira na dobradiça de trás)
const SPR_CONCHA_BAIXO = objCanvas(56, 12, 2, function(b) {
  const C = ["#7a4a6a", "#b4709a", "#e6a8c8", "#f8d8e8", "#fff0f8"];
  pxElipse(b, 28, 3, 27.5, 9, C, { rim: false, tex: function(x, y, i) { return Math.abs(Math.sin((x - 28) * 0.45)) < 0.3 ? i - 1 : i; } });
  pxRet(b, 1, 0, 54, 2, "#5a2a4a");
  pxRet(b, 2, 0, 52, 1, "#f8d8e8");
}, "#3a1a30");
const SPR_CONCHA_CIMA = objCanvas(56, 22, 2, function(b) {
  const C = ["#7a4a6a", "#b4709a", "#e6a8c8", "#f8d8e8", "#fff0f8"];
  pxElipse(b, 28, 22, 27.5, 21, C, { rim: false, tex: function(x, y, i) {
    const a = Math.atan2(y - 22, x - 28);
    return Math.abs(Math.sin(a * 7)) < 0.22 ? i - 1 : i;
  } });
  pxRet(b, 1, 20, 54, 2, "#5a2a4a");
  pxRet(b, 3, 19, 50, 1, "#ffc9de");
}, "#3a1a30");
const SPR_PEROLA = objCanvas(10, 10, 2, function(b) {
  esferaPx(b, 5, 5, 4.2, ["#b8b0c8", "#e2dcef", "#f8f4ff", "#ffffff"]);
  pxPonto(b, 3, 3, "#ffffff"); pxPonto(b, 4, 3, "#ffffff");
}, "#6a6080");

// Mina do mar: bola de ferro com espetos e luzinha vermelha
const SPR_MINA = objCanvas(26, 26, 2, function(b) {
  const F = ["#16191d", "#2f353c", "#4f5761", "#8a939e", "#c5ccd4"];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    pxMembro(b, 13 + Math.cos(a) * 8, 13 + Math.sin(a) * 8, 13 + Math.cos(a) * 12.4, 13 + Math.sin(a) * 12.4, 1.6, 0.8, F, { rim: false });
  }
  esferaPx(b, 13, 13, 9, F, { rim: false });
  pxRet(b, 7, 12, 12, 1, "#16191d");
  [[9, 9], [17, 9], [9, 16], [17, 16]].forEach(function(p) { pxPonto(b, p[0], p[1], "#8a939e"); });
  pxElipse(b, 13, 6.5, 1.6, 1.4, ["#7a0a0a", "#e03131", "#ff8787", "#ffffff"], { rim: false });
}, "#0b0d10");

// Fumarola: chaminé de pedra no fundo do mar
const SPR_FUMAROLA = objCanvas(32, 22, 2, function(b) {
  const P = ["#1e1a22", "#3a3240", "#5a4c62", "#7a6a84", "#a898b0"];
  pxPoligono(b, [[2, 22], [6, 10], [11, 4], [21, 4], [26, 10], [30, 22]], P, { rim: false, curva: 0.7, tex: pxTexPelo(41, 0.18) });
  pxElipse(b, 16, 5, 5, 1.8, ["#120a0a", "#3a1a10", "#6a2a10", "#a84a1a"], { rim: false });
  pxPonto(b, 9, 14, "#ff922b"); pxPonto(b, 22, 16, "#ff922b"); pxPonto(b, 23, 16, "#ffd43b");
  pxRet(b, 3, 20, 4, 1, "#f1f3f5"); pxRet(b, 24, 19, 3, 1, "#f1f3f5");
}, "#0e0a12");

// Âncora de navio
const SPR_ANCORA = objCanvas(24, 30, 2, function(b) {
  const F = ["#1c2024", "#3a4048", "#5f6873", "#8f99a5", "#c8d0d8"];
  pxElipse(b, 12, 3, 3, 3, F, { rim: false });
  pxElipse(b, 12, 3, 1.2, 1.2, ["#0a0c0e", "#0a0c0e", "#0a0c0e", "#0a0c0e"], { rim: false });
  pxMembro(b, 12, 6, 12, 26, 1.8, 1.8, F, { rim: false });
  pxMembro(b, 5, 9, 19, 9, 1.4, 1.4, F, { rim: false });
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI * (0.05 + 0.9 * k / 10);
    pxElipse(b, 12 + Math.cos(a) * 9, 22 + Math.sin(a) * 5, 1.8, 1.8, F, { rim: false });
  }
  pxPoligono(b, [[1, 20], [5, 24], [1, 26]], F, { rim: false });
  pxPoligono(b, [[23, 20], [19, 24], [23, 26]], F, { rim: false });
  pxRet(b, 11, 8, 1, 16, "#c8d0d8");
  pxPonto(b, 7, 25, "#7a5a2a"); pxPonto(b, 16, 26, "#7a5a2a");
}, "#0a0c0e");

// Fonte de ar no fundo do mar: pedra com buraco de onde saem as bolhas
const SPR_FONTE_AR = objCanvas(36, 12, 2, function(b) {
  const P = ["#24323a", "#3e525c", "#5a7480", "#80a0ac", "#b0ccd4"];
  pxElipse(b, 18, 12, 17.5, 9, P, { rim: false, tex: pxTexPelo(51, 0.15) });
  pxElipse(b, 18, 5, 5, 1.8, ["#06121a", "#0c2430", "#14384a", "#1c4c60"], { rim: false });
  pxRet(b, 4, 9, 3, 1, "#2f9e44"); pxRet(b, 27, 8, 4, 1, "#37b24d"); pxPonto(b, 28, 7, "#8ce99a");
}, "#0a161c");

// Bolha grande de ar (dá para ver o reflexo e o brilho)
const SPR_BOLHA_AR = (function() {
  const c = criarCanvas(64, 64);
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(SPR_BOLHA, 0, 0, 64, 64);
  return c;
})();

// Ponte de corda: tábua (boa e podre)
const SPR_TABUA = objCanvas(18, 6, 2, function(b) {
  const W = ["#3e2a16", "#6b4a2a", "#8f6a3e", "#b88e5a", "#d8b07a"];
  pxRet(b, 0, 0, 18, 6, W[2]);
  pxRet(b, 0, 0, 18, 1, W[4]);
  pxRet(b, 0, 5, 18, 1, W[0]);
  pxRet(b, 3, 2, 6, 1, W[1]); pxRet(b, 11, 3, 5, 1, W[3]);
  pxPonto(b, 1, 2, "#ced4da"); pxPonto(b, 16, 2, "#ced4da");
}, "#24160a");
const SPR_TABUA_PODRE = objCanvas(18, 6, 2, function(b) {
  const W = ["#2a1e14", "#4a3a2a", "#5f4c38", "#7a644c", "#8f7a60"];
  pxRet(b, 0, 0, 18, 6, W[2]);
  pxRet(b, 0, 0, 18, 1, W[3]);
  pxRet(b, 0, 5, 18, 1, W[0]);
  pxLinha(b, 6, 0, 8, 5, "#1a120a"); pxLinha(b, 12, 0, 11, 4, "#1a120a");
  pxRet(b, 2, 2, 2, 1, "#4f7a3a"); pxPonto(b, 15, 3, "#4f7a3a");
}, "#140c06");

// Poste de madeira (ponte e tirolesa)
const SPR_POSTE = objCanvas(8, 40, 2, function(b) {
  const W = ["#3e2a16", "#6b4a2a", "#8f6a3e", "#b88e5a"];
  pxRet(b, 1, 0, 6, 40, W[2]);
  pxRet(b, 1, 0, 2, 40, W[3]);
  pxRet(b, 5, 0, 2, 40, W[1]);
  pxRet(b, 1, 0, 6, 1, W[3]);
  for (let y = 4; y < 40; y += 9) pxRet(b, 2, y, 3, 1, W[1]);
  pxRet(b, 0, 3, 8, 2, "#e9d8a6"); pxRet(b, 0, 4, 8, 1, "#c2a76a");
}, "#24160a");

// Roldana da tirolesa (onde o macaco se pendura)
const SPR_ROLDANA = objCanvas(14, 12, 2, function(b) {
  const F = ["#2a2e33", "#495057", "#868e96", "#ced4da"];
  pxElipse(b, 7, 4, 4, 4, F, { rim: false });
  pxElipse(b, 7, 4, 1.4, 1.4, ["#16181b", "#16181b", "#16181b", "#16181b"], { rim: false });
  pxRet(b, 6, 7, 2, 4, "#495057");
  pxRet(b, 2, 10, 10, 2, "#e03131");
  pxRet(b, 2, 10, 10, 1, "#ff8787");
}, "#0e1012");
