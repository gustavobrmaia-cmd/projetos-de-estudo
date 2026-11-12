"use strict";

// =========================
// GERADOR DE FASES
// Cada fase é montada com "pedaços" (chunks). Quanto mais longe no jogo,
// mais pedaços, buracos maiores, mais inimigos e mais perigos.
// A fase N de cada mundo libera o N-ésimo inimigo e o N-ésimo obstáculo do mundo.
// A mesma fase sai sempre igual (semente fixa).
// =========================

// Power-ups que aparecem na fase, com o peso de cada um (a nuke e o dobro de moedas são raros)
const TIPOS_POWERUP = ["velocidade", "puloDuplo", "escudo", "ima", "nuke", "invisivel", "moedas2x"];
const PESO_POWERUP = { velocidade: 10, puloDuplo: 10, escudo: 8, ima: 10, nuke: 0.6, invisivel: 5, moedas2x: 2.5 };

function sortearPowerup(r) {
  let total = 0;
  TIPOS_POWERUP.forEach(function(t) { total += PESO_POWERUP[t]; });
  let v = (r ? r() : Math.random()) * total;
  for (let i = 0; i < TIPOS_POWERUP.length; i++) {
    v -= PESO_POWERUP[TIPOS_POWERUP[i]];
    if (v < 0) return TIPOS_POWERUP[i];
  }
  return "velocidade";
}

function novaFase(indice) {
  const mundo = Math.floor(indice / FASES_POR_MUNDO);
  const etapa = indice % FASES_POR_MUNDO;
  return {
    indice: indice, mundo: mundo, etapa: etapa, id: idMundo(mundo),
    ehChefe: etapa === FASES_POR_MUNDO - 1,
    dificuldade: 0, largura: 0, inicioX: 100, fimX: 0, pool: [],
    solidos: [], plataformas: [], espinhos: [], lavas: [], aguas: [], moedas: [], inimigos: [],
    cipos: [], tornados: [], geiseres: [], areias: [], estalactites: [], fogos: [],
    lancadores: [], plantas: [], barras: [], ventos: [], zonasMeteoro: [], powerups: [],
    placas: [], checkpoints: [], decoracoes: [],
    // Deserto: cospe-areia
    cospeAreias: [],
    // Oceano
    correntes: [], conchas: [], minas: [], fumarolas: [], zonasAncora: [], ventosAr: [],
    // Montanhas Rochosas
    zonasRocha: [], pontes: [], tirolesas: [], subidas: [], pendulos: []
  };
}

// Fases de aprendizado: nas primeiras fases da Selva os buracos de cipó e as plataformas começam
// bem fáceis e vão endurecendo até a dificuldade normal.
// 1 = mais fácil, 0 = normal. (No Player Fit Test metade saía na 1-1 e 22% no meio da 1-2.)
function facilidade(f) {
  return f.mundo === M_SELVA && f.etapa <= 4 ? [1, 0.8, 0.6, 0.4, 0.2][f.etapa] : 0;
}

// valor normal -> valor da versão fácil, conforme a facilidade da fase
function aliviar(f, normal, facil) {
  return Math.round(normal + (facil - normal) * facilidade(f));
}

// ---------- peças ----------

function fChao(f, x, w, gelo) {
  f.solidos.push({ x: x, y: CHAO, w: w, h: 240, tipo: "chao", gelo: !!gelo });
}

// No Gelo, metade dos pedaços de chão é pista lisa
function geloSorteado(f, r) {
  return f.id === "gelo" && r() < 0.5;
}

function fBloco(f, x, y, w, h, gelo) {
  f.solidos.push({ x: x, y: y, w: w, h: h, tipo: "bloco", gelo: !!gelo });
}

function fPlat(f, x, y, w, extra) {
  const p = Object.assign({ x: x, y: y, w: w, h: 16, x0: x, y0: y, dx: 0, dy: 0 }, extra || {});
  f.plataformas.push(p);
  return p;
}

function fMoeda(f, x, y) {
  f.moedas.push({ x: Math.round(x), y: Math.round(y), pega: false });
}

function fLinhaMoedas(f, x, y, n, passo) {
  for (let i = 0; i < n; i++) fMoeda(f, x + i * (passo || 40), y);
}

function fArcoMoedas(f, x1, x2, yBase, altura, n) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    fMoeda(f, x1 + (x2 - x1) * t - 16, yBase - Math.sin(t * Math.PI) * altura);
  }
}

function fPlaca(f, x, texto) {
  f.placas.push({ x: x, texto: texto });
}

// Coloca o inimigo do jeito certo para o tipo dele (no chão, voando ou pendurado)
function fColocar(f, tipo, x, baseY) {
  const t = TIPOS_INIMIGO[tipo];
  const cat = categoriaInimigo(tipo);
  baseY = baseY === undefined ? CHAO : baseY;
  if (cat === "voador") f.inimigos.push({ tipo: tipo, x: x, y: baseY - 200 });
  else if (cat === "nadador") f.inimigos.push({ tipo: tipo, x: x, y: baseY - 52 - t.h });
  else if (cat === "aranha") f.inimigos.push({ tipo: tipo, x: x, y: CHAO - 330 });
  else f.inimigos.push({ tipo: tipo, x: x, y: baseY - t.h });
}

// Sorteia um inimigo já liberado nesta fase, de preferência da categoria pedida
function inimigoDe(f, r, categoria) {
  const pool = f.pool.filter(function(t) {
    const c = categoriaInimigo(t);
    return c === categoria || (categoria === "voador" && c === "nadador");
  });
  return sorteio(pool.length ? pool : f.pool, r);
}

// ---------- pedaços comuns ----------

const CHUNKS = {

  plano: function(f, x, d, r) {
    const w = 360 + Math.floor(r() * 4) * 40;
    fChao(f, x, w, geloSorteado(f, r));
    fLinhaMoedas(f, x + 60, CHAO - 50, 3 + Math.floor(r() * 3), 40);
    if (r() < 0.35 + 0.5 * d) fColocar(f, inimigoDe(f, r, "terrestre"), x + w * 0.65);
    if (r() < 0.5) {
      const py = CHAO - 130 - Math.floor(r() * 2) * 20;
      fPlat(f, x + 80, py, 128);
      fLinhaMoedas(f, x + 96, py - 44, 3, 32);
      if (r() < d) fColocar(f, inimigoDe(f, r, "voador"), x + w / 2);
    }
    return x + w;
  },

  buraco: function(f, x, d, r) {
    const vao = Math.round(90 + 90 * d + r() * 20);
    fChao(f, x, 160);
    fArcoMoedas(f, x + 160, x + 160 + vao, CHAO - 90, 80, 3);
    fChao(f, x + 160 + vao, 200);
    if (d > 0.5 && r() < 0.5) fColocar(f, inimigoDe(f, r, "voador"), x + 160 + vao / 2);
    return x + 160 + vao + 200;
  },

  muro: function(f, x, d, r) {
    const h = d < 0.4 ? 64 : d < 0.8 ? 96 : 128;
    fChao(f, x, 480);
    fBloco(f, x + 200, CHAO - h, 64, h);
    fMoeda(f, x + 216, CHAO - h - 50);
    if (r() < 0.3 + 0.5 * d) fColocar(f, inimigoDe(f, r, "terrestre"), x + 340);
    return x + 480;
  },

  escada: function(f, x, d, r) {
    fChao(f, x, 680);
    for (let i = 0; i < 3; i++) {
      fBloco(f, x + 120 + i * 96, CHAO - 64 * (i + 1), 96, 64 * (i + 1));
      fMoeda(f, x + 152 + i * 96, CHAO - 64 * (i + 1) - 50);
    }
    if (d > 0.4 && r() < 0.6) fColocar(f, inimigoDe(f, r, "terrestre"), x + 330, CHAO - 192);
    if (r() < 0.5) fPlat(f, x + 470, CHAO - 260, 96);
    return x + 680;
  },

  plataformas: function(f, x, d, r) {
    const n = d > 0.5 ? 3 : 2;
    const larg = aliviar(f, 96, 150);   // plataformas mais largas
    const vao = aliviar(f, 120, 80);    // e mais perto uma da outra
    const borda = aliviar(f, 110, 80);
    fChao(f, x, 160);
    let px = x + 160 + borda;
    for (let i = 0; i < n; i++) {
      const y = CHAO - 70 - (i % 2) * 50;
      let mov = null;
      if (d > 0.35 && r() < 0.6) {
        mov = r() < 0.5 ? { ax: 40, periodo: Math.round(220 - d * 60), fase: r() * 6 }
                        : { ay: 40, periodo: 200, fase: r() * 6 };
      }
      fPlat(f, px, y, larg, mov);
      fLinhaMoedas(f, px + 16 + (larg - 96) / 2, y - 44, 2, 40);
      px += larg + vao;
    }
    const fim = px - vao + borda;
    if (f.id === "lava") f.lavas.push({ x: x + 160, w: fim - x - 160 });
    fChao(f, fim, 200);
    return fim + 200;
  },

  grupo: function(f, x, d, r) {
    const w = 560;
    fChao(f, x, w, geloSorteado(f, r));
    const n = d > 0.5 ? 3 : 2;
    for (let i = 0; i < n; i++) fColocar(f, sorteio(f.pool, r), x + 140 + i * 150);
    fLinhaMoedas(f, x + 100, CHAO - 150, 5, 70);
    return x + w;
  },

  atirador: function(f, x, d, r) {
    fChao(f, x, 520);
    fBloco(f, x + 260, CHAO - 96, 96, 96);
    fColocar(f, inimigoDe(f, r, "atirador"), x + 280, CHAO - 96);
    fLinhaMoedas(f, x + 60, CHAO - 50, 4, 40);
    if (d > 0.5) fColocar(f, inimigoDe(f, r, "terrestre"), x + 420);
    return x + 520;
  },

  // Mostra o inimigo novo da fase
  apresentaInimigo: function(f, x, d, r) {
    const tipo = MUNDOS[f.mundo].inimigos[nivelDaEtapa(f.etapa)];
    fChao(f, x, 680);
    if (categoriaInimigo(tipo) === "atirador") {
      fBloco(f, x + 380, CHAO - 64, 96, 64);
      fColocar(f, tipo, x + 400, CHAO - 64);
    } else {
      fColocar(f, tipo, x + 340);
      fColocar(f, tipo, x + 540);
    }
    fLinhaMoedas(f, x + 220, CHAO - 50, 4, 40);
    return x + 680;
  },

  espinhos: function(f, x, d, r) {
    const w = 64 + Math.round(d * 3) * 32;
    fChao(f, x, 220 + w + 220);
    f.espinhos.push({ x: x + 220, y: CHAO - 24, w: w, h: 24 });
    fArcoMoedas(f, x + 220, x + 220 + w, CHAO - 100, 60, 3);
    if (d > 0.6 && r() < 0.5) fColocar(f, inimigoDe(f, r, "voador"), x + 220 + w / 2);
    return x + 220 + w + 220;
  },

  // ---------- Selva ----------

  cipo: function(f, x, d, r) {
    // na Selva não tem cipó duplo (era onde muita gente caía na 1-4); o r() continua sendo sorteado
    // na mesma ordem para o resto da fase sair igual
    const dois = (f.etapa > 1 || d > 0.45) && r() < 0.6 && f.mundo !== M_SELVA;
    fChao(f, x, 200);
    const x0 = x + 200;
    // fases de aprendizado: cipó mais perto da beirada, mais comprido e buraco menor
    const a1 = x0 + aliviar(f, 120, 95);
    f.cipos.push({ x: a1, y: 150, comp: aliviar(f, 300, 335), fase: r() * 6 });
    let fim = a1 + aliviar(f, 320, 220);
    if (dois) {
      const a2 = a1 + 330;
      f.cipos.push({ x: a2, y: 150, comp: 300, fase: r() * 6 });
      fArcoMoedas(f, a1, a2, 380, 50, 4);
      fim = a2 + 320;
    }
    fArcoMoedas(f, fim - aliviar(f, 300, 210), fim - 40, 420, 90, 4);
    fChao(f, fim, 240);
    if (r() < d) fColocar(f, inimigoDe(f, r, "terrestre"), fim + 140);
    return fim + 240;
  },

  cogumelo: function(f, x, d, r) {
    const h = 224 + Math.round(d * 2) * 32;
    fChao(f, x, 700);
    fPlat(f, x + 170, CHAO - 28, 64, { cogumelo: true, amassar: 0 });
    fBloco(f, x + 300, CHAO - h, 192, h);
    fMoeda(f, x + 186, CHAO - 160);
    fMoeda(f, x + 186, CHAO - 270);
    fLinhaMoedas(f, x + 330, CHAO - h - 50, 4, 36);
    if (d > 0.1) fColocar(f, inimigoDe(f, r, "terrestre"), x + 420, CHAO - h);
    return x + 700;
  },

  troncos: function(f, x, d, r) {
    const w = 940;
    fChao(f, x, w);
    f.lancadores.push({ tipo: "tronco", x: x + w - 90, y: CHAO - 40, intervalo: Math.round(150 - d * 50), t: 60 });
    fLinhaMoedas(f, x + 120, CHAO - 130, 6, 100);
    return x + w;
  },

  plantas: function(f, x, d, r) {
    const n = d > 0.15 ? 4 : 3;
    const w = 220 + n * 170;
    fChao(f, x, w);
    for (let i = 0; i < n; i++) {
      // em "onda": quem passa logo depois que a primeira se esconde pega as outras escondidas
      f.plantas.push({ x: x + 180 + i * 170, t: Math.round(400 - i * 30 - r() * 12) % 200 });
      fMoeda(f, x + 188 + i * 170, CHAO - 170);
    }
    return x + w;
  },

  // ---------- Deserto ----------

  areia: function(f, x, d, r) {
    const w = 160 + Math.round(d * 4) * 32;
    fChao(f, x, 200 + w + 200);
    f.areias.push({ x: x + 200, w: w });
    fArcoMoedas(f, x + 200, x + 200 + w, CHAO - 90, 70, 4);
    if (d > 0.4 && r() < 0.6) fColocar(f, inimigoDe(f, r, "voador"), x + 200 + w / 2);
    return x + 200 + w + 200;
  },

  tornado: function(f, x, d, r) {
    const h = 256 + Math.round(d * 2) * 32;
    fChao(f, x, 700);
    f.tornados.push({ x: x + 160, w: 110, topo: CHAO - h - 140 });
    fBloco(f, x + 300, CHAO - h, 192, h);
    fMoeda(f, x + 199, CHAO - 120);
    fMoeda(f, x + 199, CHAO - 220);
    fLinhaMoedas(f, x + 330, CHAO - h - 50, 4, 36);
    if (d > 0.4) fColocar(f, inimigoDe(f, r, "terrestre"), x + 420, CHAO - h);
    return x + 700;
  },

  // Montinho de areia que cospe bolas de areia no macaco (recarrega em ~3 s; dá para destruir pisando em cima)
  cospeAreia: function(f, x, d, r) {
    const w = 780;
    fChao(f, x, w);
    const n = d > 0.25 ? 2 : 1;
    for (let i = 0; i < n; i++) f.cospeAreias.push({ x: x + 320 + i * 250, t: 30 + Math.floor(r() * 50) + i * 40, abre: 0 });
    fLinhaMoedas(f, x + 110, CHAO - 150, 5, 120);
    return x + w;
  },

  pedraRolante: function(f, x, d, r) {
    const w = 1000;
    fChao(f, x, w);
    f.lancadores.push({ tipo: "pedra", x: x + w - 110, y: CHAO - 80, intervalo: Math.round(220 - d * 60), t: 120 });
    fLinhaMoedas(f, x + 150, CHAO - 170, 5, 120);
    return x + w;
  },

  ventania: function(f, x, d, r) {
    const vao = 90 + Math.round(d * 10);
    fChao(f, x, 220);
    fChao(f, x + 220 + vao, 240);
    fChao(f, x + 220 + vao + 240 + vao, 300);
    const w = 220 + vao + 240 + vao + 300;
    f.ventos.push({ x: x + 100, w: w - 200, t: Math.floor(r() * 240) });
    fArcoMoedas(f, x + 220, x + 220 + vao, CHAO - 90, 60, 2);
    fArcoMoedas(f, x + 460 + vao, x + 460 + vao * 2, CHAO - 90, 60, 2);
    return x + w;
  },

  // ---------- Era do Gelo ----------

  tunel: function(f, x, d, r) {
    const w = 256 + Math.round(d * 3) * 64;
    fChao(f, x, 240 + w + 200, true);
    fBloco(f, x + 240, CHAO - 44 - 256, w, 256, true);
    fLinhaMoedas(f, x + 280, CHAO - 38, Math.floor(w / 64), 64);
    return x + 240 + w + 200;
  },

  estalactites: function(f, x, d, r) {
    const w = 680;
    fChao(f, x, w, r() < 0.5);
    fBloco(f, x + 120, 200, w - 240, 32, true);
    const n = 3 + Math.round(d * 2);
    for (let i = 0; i < n; i++) f.estalactites.push({ x: x + 140 + i * ((w - 300) / n), y: 232 });
    fLinhaMoedas(f, x + 140, CHAO - 50, 6, 70);
    if (d > 0.5) fColocar(f, inimigoDe(f, r, "terrestre"), x + w - 120);
    return x + w;
  },

  pista: function(f, x, d, r) {
    const vao = 320 + Math.round(d * 2) * 20;
    fChao(f, x, 700, true);
    fArcoMoedas(f, x + 700, x + 700 + vao, CHAO - 100, 70, 5);
    fChao(f, x + 700 + vao, 260, true);
    return x + 700 + vao + 260;
  },

  geloFino: function(f, x, d, r) {
    const n = 3 + Math.round(d);
    fChao(f, x, 180, true);
    let px = x + 180 + 100;
    for (let i = 0; i < n; i++) {
      fPlat(f, px, CHAO - 50 - (i % 2) * 30, 96, { cai: true, fragil: true });
      fMoeda(f, px + 32, CHAO - 140 - (i % 2) * 30);
      px += 96 + 105;
    }
    const fim = px - 105 + 100;
    f.aguas.push({ x: x + 180, w: fim - x - 180 });
    fChao(f, fim, 200, true);
    return fim + 200;
  },

  avalanche: function(f, x, d, r) {
    const w = 1000;
    fChao(f, x, w, r() < 0.5);
    f.lancadores.push({ tipo: "bolaNeve", x: x + w - 90, y: CHAO - 56, intervalo: Math.round(130 - d * 40), t: 40 });
    fLinhaMoedas(f, x + 150, CHAO - 150, 6, 110);
    return x + w;
  },

  // ---------- Lava ----------

  lagoLava: function(f, x, d, r) {
    const w = 128 + Math.round(d * 3) * 32;
    fChao(f, x, 200);
    f.lavas.push({ x: x + 200, w: w });
    if (d > 0.3) f.fogos.push({ x: x + 200 + w / 2 - 16, t: Math.floor(r() * 150) });
    fArcoMoedas(f, x + 200, x + 200 + w, CHAO - 110, 80, 3);
    fChao(f, x + 200 + w, 200);
    return x + 400 + w;
  },

  geiser: function(f, x, d, r) {
    const h = 288 + Math.round(d * 2) * 32;
    fChao(f, x, 700);
    f.geiseres.push({ x: x + 180, w: 64, t: Math.floor(r() * 200) });
    fBloco(f, x + 300, CHAO - h, 224, h);
    fMoeda(f, x + 196, CHAO - 200);
    fMoeda(f, x + 196, CHAO - 300);
    fLinhaMoedas(f, x + 330, CHAO - h - 50, 4, 40);
    if (d > 0.5) fColocar(f, inimigoDe(f, r, "terrestre"), x + 430, CHAO - h);
    return x + 700;
  },

  plataformasCaem: function(f, x, d, r) {
    const n = 3 + Math.round(d);
    fChao(f, x, 180);
    let px = x + 180 + 100;
    for (let i = 0; i < n; i++) {
      fPlat(f, px, CHAO - 60 - (i % 2) * 40, 96, { cai: true });
      fMoeda(f, px + 32, CHAO - 150 - (i % 2) * 40);
      px += 96 + 110;
    }
    const fim = px - 110 + 100;
    f.lavas.push({ x: x + 180, w: fim - x - 180 });
    if (d > 0.5) f.fogos.push({ x: x + 180 + (fim - x - 180) / 2, t: Math.floor(r() * 150) });
    fChao(f, fim, 200);
    return fim + 200;
  },

  barraFogo: function(f, x, d, r) {
    const n = d > 0.85 ? 2 : 1;
    const w = 300 + n * 300;
    fChao(f, x, w);
    for (let i = 0; i < n; i++) {
      const cx = x + 260 + i * 300;
      fBloco(f, cx - 16, CHAO - 32, 32, 32);
      f.barras.push({ cx: cx, cy: CHAO - 16, n: d > 0.9 ? 6 : 5, ang: r() * 6, vel: (0.03 + d * 0.012) * (i % 2 ? -1 : 1) });
      fMoeda(f, cx - 16, CHAO - 150);
    }
    return x + w;
  },

  meteoros: function(f, x, d, r) {
    const w = 900;
    fChao(f, x, w);
    f.zonasMeteoro.push({ x: x, w: w, t: 0, intervalo: Math.round(55 - d * 15) });
    fLinhaMoedas(f, x + 100, CHAO - 50, 8, 90);
    return x + w;
  },

  // ---------- Oceano ----------

  // Correnteza: empurra pra frente ou pra trás (liga e desliga)
  corrente: function(f, x, d, r) {
    const vao = 150 + Math.round(d * 40);
    const w1 = 320, w2 = 320;
    fChao(f, x, w1);
    fChao(f, x + w1 + vao, w2);
    const dir = r() < 0.5 ? -1 : 1;
    f.correntes.push({ x: x + 40, w: w1 + vao + w2 - 80, dir: dir, t: Math.floor(r() * 300), forca: 0.9 + d * 0.5 });
    fArcoMoedas(f, x + w1, x + w1 + vao, CHAO - 120, 70, 3);
    return x + w1 + vao + w2;
  },

  // Concha gigante: abre (com uma pérola dentro) e fecha de repente
  concha: function(f, x, d, r) {
    const n = d > 0.6 ? 2 : 1;
    const w = 300 + n * 300;
    fChao(f, x, w);
    for (let i = 0; i < n; i++) {
      const cx = x + 240 + i * 300;
      fBloco(f, cx - 56, CHAO - 22, 112, 22);    // a metade de baixo da concha (dá para pisar)
      f.conchas.push({ x: cx, t: Math.floor(r() * 90) + i * 70, perola: true });
    }
    fLinhaMoedas(f, x + 60, CHAO - 50, 3, 40);
    return x + w;
  },

  // Minas presas por correntes no fundo, subindo e descendo
  minas: function(f, x, d, r) {
    const w = 820;
    fChao(f, x, w);
    const n = 2 + Math.round(d);
    for (let i = 0; i < n; i++) {
      const mx = x + 210 + i * (440 / Math.max(1, n - 1));
      f.minas.push({ x: mx, alto: 130 + (i % 2) * 80, amp: 55 + r() * 35, fase: r() * 6, vel: 0.022 + r() * 0.014, volta: 0 });
    }
    fLinhaMoedas(f, x + 100, CHAO - 50, 7, 90);
    return x + w;
  },

  // Fumarola: solta um jato de água fervendo de tempos em tempos
  fumarola: function(f, x, d, r) {
    const w = 780;
    fChao(f, x, w);
    const n = d > 0.6 ? 2 : 1;
    for (let i = 0; i < n; i++) f.fumarolas.push({ x: x + 270 + i * 260, w: 56, t: Math.floor(r() * 120) + i * 90 });
    fLinhaMoedas(f, x + 110, CHAO - 160, 5, 120);
    return x + w;
  },

  // Âncoras caindo dos navios lá em cima
  ancoras: function(f, x, d, r) {
    const w = 900;
    fChao(f, x, w);
    f.zonasAncora.push({ x: x, w: w, t: 0, intervalo: Math.round(105 - d * 25) });
    fLinhaMoedas(f, x + 100, CHAO - 50, 8, 90);
    return x + w;
  },

  // ---------- Montanhas Rochosas ----------

  // Rochas que despencam sempre nos mesmos lugares (pedrinhas caem antes, avisando)
  rochasCaindo: function(f, x, d, r) {
    const w = 900;
    fChao(f, x, w);
    const n = 2 + Math.round(d);
    for (let i = 0; i < n; i++) {
      f.zonasRocha.push({ x: x + 170 + i * (560 / Math.max(1, n - 1)), t: Math.floor(r() * 120) + i * 55, periodo: Math.round(180 - d * 40) });
    }
    fLinhaMoedas(f, x + 100, CHAO - 50, 8, 90);
    return x + w;
  },

  // Ponte de corda: balança e afunda com o peso; algumas tábuas estão podres
  ponteCorda: function(f, x, d, r) {
    const vao = 360 + Math.round(d * 2) * 40;
    fChao(f, x, 220);
    const n = Math.floor(vao / 40);
    const ponte = { x: x + 220, w: vao, tabuas: [] };
    for (let i = 0; i < n; i++) {
      const p = fPlat(f, x + 220 + i * 40 + 2, CHAO - 6, 36, { tabua: true, ponte: ponte, i: i, n: n });
      if (d > 0.3 && i > 1 && i < n - 2 && r() < 0.16 + d * 0.14) { p.cai = true; p.podre = true; }
      ponte.tabuas.push(p);
    }
    f.pontes.push(ponte);
    fArcoMoedas(f, x + 220, x + 220 + vao, CHAO - 80, 40, 5);
    fChao(f, x + 220 + vao, 240);
    return x + 220 + vao + 240;
  },

  // Tirolesa: sobe na torre, pula no cabo e desce até o outro lado do abismo
  tirolesa: function(f, x, d, r) {
    const vao = 520 + Math.round(d * 3) * 40;
    const alt = 160;
    fChao(f, x, 380);
    fBloco(f, x + 150, CHAO - 80, 100, 80);
    fBloco(f, x + 250, CHAO - alt, 130, alt);
    const x1 = x + 370, y1 = CHAO - alt - 120;
    const x2 = x + 380 + vao + 150, y2 = CHAO - 150;
    f.tirolesas.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
    for (let i = 1; i < 7; i++) {
      const k = i / 7;
      fMoeda(f, x1 + (x2 - x1) * k - 16, y1 + (y2 - y1) * k + 40);
    }
    fChao(f, x + 380 + vao, 420);
    return x + 380 + vao + 420;
  },

  // Corrente de ar subindo do abismo: carrega o macaco por cima do buraco (às vezes enfraquece)
  correnteAr: function(f, x, d, r) {
    const vao = 300 + Math.round(d * 2) * 40;
    fChao(f, x, 220);
    f.subidas.push({ x: x + 250, w: vao - 60, topo: 150, t: Math.floor(r() * 200) });
    fArcoMoedas(f, x + 250, x + 220 + vao - 30, 330, 110, 5);
    fChao(f, x + 220 + vao, 240);
    return x + 220 + vao + 240;
  },

  // Pêndulo: pedra enorme balançando numa corrente presa numa viga
  pendulo: function(f, x, d, r) {
    const n = d > 0.75 ? 2 : 1;
    const w = 360 + n * 320;
    fChao(f, x, w);
    for (let i = 0; i < n; i++) {
      const px = x + 320 + i * 320;
      fBloco(f, px - 70, 120, 140, 28);
      f.pendulos.push({ x: px, y: 148, comp: 405, amp: 0.85, vel: 0.026 + d * 0.01, fase: r() * 6 + i * 2 });
    }
    fLinhaMoedas(f, x + 80, CHAO - 50, 4, 60);
    return x + w;
  }
};

const CHUNKS_GERAIS = ["plano", "buraco", "muro", "escada", "plataformas", "grupo", "atirador"];

// ---------- Pedaços novos (usados nas fases com tema: 2, 4, 6, 8 e 10 de cada mundo) ----------
// Os pulos foram medidos: o macaco sobe ~150 px e alcança ~200 px na horizontal correndo.

// Fundo de buraco: lava no Vulcão, água gelada no Gelo (só visual: cair continua sendo cair)
function fundoDoBuraco(f, x, w) {
  if (f.id === "lava") f.lavas.push({ x: x, w: w });
  else if (f.id === "gelo") f.aguas.push({ x: x, w: w });
}

Object.assign(CHUNKS, {
  // Torre: sobe por blocos, plataforma alta cheia de moedas e desce do outro lado
  torre: function(f, x, d, r) {
    // degraus de 64 px (nunca um muro alto demais) e nenhum vão onde dê para ficar preso
    const w = 820;
    fChao(f, x, w, geloSorteado(f, r));
    fBloco(f, x + 120, CHAO - 64, 100, 64);
    fBloco(f, x + 220, CHAO - 128, 100, 128);
    fBloco(f, x + 320, CHAO - 192, 180, 192);
    fPlat(f, x + 350, CHAO - 300, 120, d > 0.45 && r() < 0.5 ? { ax: 24, periodo: 200, fase: r() * 6 } : null);
    fArcoMoedas(f, x + 330, x + 500, CHAO - 330, 40, 4);
    fBloco(f, x + 500, CHAO - 128, 100, 128);
    fBloco(f, x + 600, CHAO - 64, 100, 64);
    fMoeda(f, x + 154, CHAO - 114); fMoeda(f, x + 254, CHAO - 178);
    fMoeda(f, x + 534, CHAO - 178); fMoeda(f, x + 634, CHAO - 114);
    if (d > 0.25) fColocar(f, inimigoDe(f, r, "terrestre"), x + 400, CHAO - 192);
    if (d > 0.5 && r() < 0.6) fColocar(f, inimigoDe(f, r, "voador"), x + 430);
    return x + w;
  },

  // Escadinha de plataformas soltas sobre um buraco: sobe e desce
  degraus: function(f, x, d, r) {
    const larg = aliviar(f, 96, 128);
    const passo = aliviar(f, 150, 140);
    const alto = aliviar(f, 60, 45);
    fChao(f, x, 200);
    const alturas = [1, 2, 3, 2, 1];
    let px = x + 200 + (passo - larg);
    alturas.forEach(function(a, i) {
      const y = CHAO - a * alto;
      fPlat(f, px, y, larg);
      fLinhaMoedas(f, px + larg / 2 - 36, y - 46, 2, 40);
      px += passo;
    });
    const fim = px;     // mesmo vão do último degrau até o chão
    fundoDoBuraco(f, x + 200, fim - x - 200);
    if (d > 0.4 && r() < 0.6) fColocar(f, inimigoDe(f, r, "voador"), x + 200 + (fim - x - 200) / 2);
    fChao(f, fim, 240);
    return fim + 240;
  },

  // Plataformas que vão e voltam, uma atrás da outra, sobre um buraco comprido
  pontesFlutuantes: function(f, x, d, r) {
    const n = d > 0.5 ? 4 : 3;
    const larg = aliviar(f, 110, 140);
    fChao(f, x, 200);
    let px = x + 200 + 70;
    for (let i = 0; i < n; i++) {
      const y = CHAO - 70 - (i % 2) * 40;
      fPlat(f, px, y, larg, { ax: 36, periodo: Math.round(190 - d * 40), fase: i * 1.6 });
      fLinhaMoedas(f, px + larg / 2 - 36, y - 46, 2, 40);
      px += larg + 70;
    }
    const fim = px;
    fundoDoBuraco(f, x + 200, fim - x - 200);
    if (d > 0.6) fColocar(f, inimigoDe(f, r, "voador"), x + 200 + (fim - x - 200) / 2);
    fChao(f, fim, 220);
    return fim + 220;
  },

  // Zigue-zague: plataformas alternando alto e baixo sobre o vazio
  zigueZague: function(f, x, d, r) {
    const larg = aliviar(f, 110, 140);
    fChao(f, x, 180);
    const ys = [CHAO - 40, CHAO - 140, CHAO - 50, CHAO - 150, CHAO - 60];
    let px = x + 180 + 50;
    ys.forEach(function(y, i) {
      fPlat(f, px, y, larg, d > 0.6 && i === 2 ? { ay: 26, periodo: 180, fase: r() * 6 } : null);
      fMoeda(f, px + larg / 2 - 16, y - 50);
      px += larg + 50;
    });
    const fim = px;
    fundoDoBuraco(f, x + 180, fim - x - 180);
    if (d > 0.3 && r() < 0.6) fColocar(f, inimigoDe(f, r, "voador"), x + 180 + (fim - x - 180) * 0.6);
    fChao(f, fim, 220);
    return fim + 220;
  },

  // Emboscada: um vale entre dois murinhos cheio de inimigos
  arena: function(f, x, d, r) {
    const w = 900;
    fChao(f, x, w, geloSorteado(f, r));
    fBloco(f, x + 120, CHAO - 64, 64, 64);
    fBloco(f, x + w - 184, CHAO - 64, 64, 64);
    const n = 2 + (d > 0.35 ? 1 : 0) + (d > 0.75 ? 1 : 0);
    for (let i = 0; i < n; i++) fColocar(f, sorteio(f.pool, r), x + 260 + i * (420 / Math.max(1, n - 1)));
    fArcoMoedas(f, x + 200, x + w - 200, CHAO - 120, 90, 7);
    if (r() < 0.5) f.powerups.push({ x: x + w / 2 - 22, y: CHAO - 190, tipo: sortearPowerup(r), base: CHAO - 190 });
    return x + w;
  },

  // Corredor de teto baixo: dá só para pulinhos (espinhos e inimigos lá dentro)
  corredor: function(f, x, d, r) {
    const w = 860;
    fChao(f, x, w, f.id === "gelo");
    fBloco(f, x + 180, CHAO - 176, w - 360, 40);
    fBloco(f, x + 180, CHAO - 176 - 300, 40, 300);        // parede segurando o teto (não dá pra passar por cima)
    f.espinhos.push({ x: x + 330, y: CHAO - 24, w: 64, h: 24 });
    if (d > 0.45) f.espinhos.push({ x: x + 560, y: CHAO - 24, w: 64, h: 24 });
    fLinhaMoedas(f, x + 220, CHAO - 50, 3, 34);
    fLinhaMoedas(f, x + 420, CHAO - 50, 3, 34);
    if (d > 0.2) fColocar(f, inimigoDe(f, r, "terrestre"), x + 470);
    return x + w;
  },

  // Rota alta: no chão, inimigos e espinhos; lá em cima, um caminho de plataformas com muitas moedas
  rotaAlta: function(f, x, d, r) {
    const w = 1160;
    fChao(f, x, w);
    fBloco(f, x + 100, CHAO - 90, 96, 90);
    const plats = [[260, 170], [450, 230], [660, 200], [870, 160]];
    plats.forEach(function(p) {
      fPlat(f, x + p[0], CHAO - p[1], 140);
      fLinhaMoedas(f, x + p[0] + 14, CHAO - p[1] - 46, 3, 40);
    });
    f.espinhos.push({ x: x + 420, y: CHAO - 24, w: 96, h: 24 });
    fColocar(f, inimigoDe(f, r, "terrestre"), x + 300);
    fColocar(f, inimigoDe(f, r, "terrestre"), x + 720);
    if (d > 0.5) fColocar(f, inimigoDe(f, r, "atirador"), x + 980);
    return x + w;
  },

  // Tesouro: pirâmide de moedas e um power-up garantido em cima de um pedestal
  bau: function(f, x, d, r) {
    const w = 640;
    fChao(f, x, w, geloSorteado(f, r));
    fBloco(f, x + 272, CHAO - 72, 96, 72);
    f.powerups.push({ x: x + 298, y: CHAO - 170, tipo: sortearPowerup(r), base: CHAO - 170 });
    for (let lin = 0; lin < 4; lin++) fLinhaMoedas(f, x + 84 + lin * 20, CHAO - 50 - lin * 36, 4 - lin, 40);
    for (let lin = 0; lin < 4; lin++) fLinhaMoedas(f, x + 412 + lin * 20, CHAO - 50 - lin * 36, 4 - lin, 40);
    if (d > 0.3) fColocar(f, inimigoDe(f, r, "voador"), x + 320);
    return x + w;
  }
});

// Temas das fases pares do mundo (2, 4, 6, 8 e 10): cada uma tem um jeito próprio, em vez de
// repetir a fase anterior. As ímpares (1, 3, 5, 7, 9) apresentam o inimigo e o obstáculo novos.
const TEMAS_FASE = [
  { id: "subida",    nome: "A Subida",
    montar: function(n, o) { return ["torre", n, "degraus", "grupo", "escada", o(), "zigueZague", n, "torre"]; } },
  { id: "emboscada", nome: "Emboscada",
    montar: function(n, o) { return ["arena", n, "corredor", "grupo", o(), "atirador", "arena", n, "corredor"]; } },
  { id: "abismo",    nome: "O Abismo",
    montar: function(n, o) { return ["pontesFlutuantes", n, "zigueZague", "grupo", "buraco", o(), "degraus", "pontesFlutuantes", n, "atirador"]; } },
  { id: "tesouro",   nome: "Caça ao Tesouro",
    montar: function(n, o) { return ["rotaAlta", n, "bau", o(), "rotaAlta", "zigueZague", n, "bau", "torre"]; } },
  { id: "final",     nome: "Desafio Final",
    montar: function(n, o, todos, r) {
      const extras = ["arena", "pontesFlutuantes", "torre", "corredor", "degraus"];
      const lista = [];
      const obs = todos.slice().sort(function() { return r() - 0.5; });
      for (let i = 0; i < obs.length; i++) { lista.push(obs[i]); lista.push(extras[i % extras.length]); }
      lista.push(n);
      lista.push("rotaAlta");
      return lista;
    } }
];

function nomeTemaFase(f) {
  const t = TEMAS_FASE.find(function(x) { return x.id === f.tema; });
  return t ? tr(t.nome) : "";
}

function temaDaFase(f) {
  if (f.ehChefe || f.tutorial || f.etapa % 2 === 0) return null;
  return TEMAS_FASE[Math.min(TEMAS_FASE.length - 1, Math.floor(f.etapa / 2))];
}

// Junta pedaços de chão encostados (menos coisas para desenhar e testar)
function juntarChao(f) {
  const chaos = f.solidos.filter(function(s) { return s.tipo === "chao"; }).sort(function(a, b) { return a.x - b.x; });
  const outros = f.solidos.filter(function(s) { return s.tipo !== "chao"; });
  const juntos = [];
  chaos.forEach(function(s) {
    const u = juntos[juntos.length - 1];
    if (u && u.x + u.w === s.x && u.gelo === s.gelo) u.w += s.w;
    else juntos.push(Object.assign({}, s));
  });
  f.solidos = juntos.concat(outros);
}

function gerarFase(indice) {
  const f = novaFase(indice);
  const mundo = MUNDOS[f.mundo];
  if (f.ehChefe) return gerarArena(f);

  const r = criarRng(indice * 7919 + 13);
  const d = (f.mundo * FASES_NORMAIS + f.etapa) / (MUNDOS.length * FASES_NORMAIS - 1);
  const nivel = nivelDaEtapa(f.etapa);
  f.dificuldade = d;
  f.pool = mundo.inimigos.slice(0, nivel + 1);

  // Começo (o macaco nasce à direita do analógico de toque, que fica no canto esquerdo)
  fChao(f, 0, 640);
  f.inicioX = 280;
  f.decoracoes.push({ x: 620, spr: f.mundo });

  const novoObstaculo = mundo.obstaculos[nivel];
  const obstaculos = mundo.obstaculos.slice(0, nivel + 1);
  let lista;

  // Sem placas explicando inimigos e obstáculos: o jogador descobre sozinho.
  // Só os controles aparecem (na primeira fase e quando ganha o cipó-laço).
  if (indice === 0) {
    fPlaca(f, 440, tr("{esquerda}/{direita} andar   {pulo} pular\nSegure {pulo} para pular mais alto"));
    // curta: a primeira vitória (e o primeiro prêmio) chega logo
    lista = ["plano", "buraco", "apresentaInimigo", "espinhos", "muro", "plataformas", "escada"];
  } else {
    if (f.mundo === M_DESERTO && f.etapa === 0) fPlaca(f, 440, tr("Seu prêmio: cipó-laço! {laco}: puxa o inimigo"));
    const tema = temaDaFase(f);
    if (tema) {
      // fase com tema: um "roteiro" próprio com os pedaços novos (não repete a fase anterior)
      f.tema = tema.id;
      lista = tema.montar(novoObstaculo, function() { return sorteio(obstaculos, r); }, mundo.obstaculos.slice(0, nivel + 1), r);
      // nunca o mesmo pedaço duas vezes seguidas
      for (let i = 1; i < lista.length; i++) {
        if (lista[i] === lista[i - 1]) lista[i] = sorteio(CHUNKS_GERAIS.filter(function(n) { return n !== lista[i - 1]; }), r);
      }
    }
  }
  if (!lista) {
    const total = 6 + Math.round(d * 7) + (f.etapa % 2);
    lista = [novoObstaculo, "apresentaInimigo"];
    let ultimo = "apresentaInimigo";
    while (lista.length < total) {
      let nome;
      do {
        nome = r() < 0.45 ? sorteio(obstaculos, r) : sorteio(CHUNKS_GERAIS, r);
      } while (nome === ultimo);
      lista.push(nome);
      ultimo = nome;
    }
    // o obstáculo novo aparece pelo menos 2 vezes
    if (lista.filter(function(n) { return n === novoObstaculo; }).length < 2) lista.splice(3 + Math.floor(r() * (lista.length - 3)), 0, novoObstaculo);
  }

  let x = 640;
  let checkpointCipo = false;
  let ultimoCheckpoint = -99999;    // nunca dois checkpoints colados (acontecia na 1-5)
  let ultimoAr = 0;                 // Oceano: onde ficou a última fonte de bolhas de ar
  const noMar = f.id === "oceano";
  lista.forEach(function(nome, i) {
    // fases de aprendizado: checkpoint logo antes do primeiro buraco de cipó
    if (nome === "cipo" && !checkpointCipo && facilidade(f) > 0 && i > 0) {
      checkpointCipo = true;
      fChao(f, x, 280);
      f.checkpoints.push({ x: x + 120, ativo: false, sobe: 0 });
      ultimoCheckpoint = x + 120;
      x += 280;
    }
    // fases compridas (Desafio Final) ganham dois checkpoints; as outras, um no meio
    const pontos = lista.length >= 11 ? [Math.floor(lista.length / 3), Math.floor(lista.length * 2 / 3)] : [Math.floor(lista.length / 2)];
    if (pontos.indexOf(i) >= 0 && x + 120 - ultimoCheckpoint > 1200) {
      fChao(f, x, 280);
      f.checkpoints.push({ x: x + 120, ativo: false, sobe: 0 });
      ultimoCheckpoint = x + 120;
      if (noMar) { f.ventosAr.push({ x: x + 200, t: 0 }); ultimoAr = x + 200; }
      x += 280;
    }
    // Oceano: fonte de bolhas de ar a cada ~900 px (num pedaço de chão só dela)
    if (noMar && x - ultimoAr > 900 && i > 0) {
      fChao(f, x, 220);
      f.ventosAr.push({ x: x + 110, t: Math.floor(r() * 60) });
      ultimoAr = x + 110;
      x += 220;
    }
    // Power-up de vez em quando no começo do pedaço
    if (i > 0 && r() < 0.2) f.powerups.push({ x: x + 70, y: CHAO - 200, tipo: sortearPowerup(r), base: CHAO - 200 });
    x = CHUNKS[nome](f, x, d, r);
    if (r() < 0.5) f.decoracoes.push({ x: x - 120, spr: f.mundo });
  });
  if (noMar && f.ventosAr.length === 0) f.ventosAr.push({ x: 520, t: 0 });
  if (noMar) f.ventosAr.unshift({ x: 520, t: 30 });

  // Final: a banana
  fChao(f, x, 900);
  f.decoracoes.push({ x: x + 640, spr: f.mundo });
  f.fimX = x + 520;
  f.largura = x + 900;

  juntarChao(f);
  garantirAlcance(f);
  return f;
}

// Toda moeda e todo poder precisam dar para pegar (com folga): o que estiver alto demais desce até
// uma altura boa em cima do chão/plataforma mais perto; o que estiver no meio do vazio, longe de
// cipó, tirolesa ou corrente de ar, sai da fase.
function garantirAlcance(f) {
  const H = 118, HX = 96;          // altura e alcance para o lado "com folga" (o pulo real vai mais longe)
  const sup = [];
  f.solidos.forEach(function(s) { sup.push({ x: s.x, w: s.w, y: s.y, h: H }); });
  f.plataformas.forEach(function(p) {
    if (p.cai && p.fragil) return;
    sup.push({ x: p.x0 - (p.ax || 0), w: p.w + 2 * (p.ax || 0), y: p.y0 + Math.abs(p.ay || 0), h: p.cogumelo ? 290 : H });
  });
  f.geiseres.forEach(function(g) { sup.push({ x: g.x, w: g.w, y: CHAO, h: 360 }); });
  const especial = function(cx, cy) {
    if (f.tornados.some(function(t) { return cx > t.x - 20 && cx < t.x + t.w + 20 && cy > t.topo - 40; })) return true;
    if (f.subidas.some(function(s) { return cx > s.x && cx < s.x + s.w && cy > s.topo; })) return true;
    // no arco do cipó (onde o macaco passa balançando)
    if (f.cipos.some(function(c) { const d = Math.hypot(cx - c.x, cy - c.y); return cy > c.y + 40 && d > c.comp - 70 && d < c.comp + 50; })) return true;
    if (f.tirolesas.some(function(t) { return cx > t.x1 && cx < t.x2 && Math.abs(cy - (t.y1 + (t.y2 - t.y1) * (cx - t.x1) / (t.x2 - t.x1)) - 50) < 60; })) return true;
    return false;
  };
  const dentroSolido = function(b) {
    return f.solidos.some(function(s) { return b.x < s.x + s.w && b.x + b.w > s.x && b.y < s.y + s.h && b.y + b.h > s.y; });
  };
  // devolve a nova altura (topo da caixa) ou null se não tem como pegar
  const ajustar = function(x, y, w, h) {
    const cx = x + w / 2;
    let melhor = null;
    for (let i = 0; i < sup.length; i++) {
      const s = sup[i];
      if (cx < s.x - HX || cx > s.x + s.w + HX) continue;
      if (y > s.y) continue;                                 // a superfície está acima do item
      const minY = s.y - 72 - s.h;                           // mais alto que dá para pegar daqui (base da caixa)
      const ny = y + h >= minY ? y : minY - h + 8;
      if (dentroSolido({ x: x, y: ny, w: w, h: h })) continue;
      if (melhor === null || Math.abs(ny - y) < Math.abs(melhor - y)) melhor = ny;
    }
    if (melhor !== null) return melhor;
    if (especial(cx, y + h / 2) && !dentroSolido({ x: x, y: y, w: w, h: h })) return y;
    return null;
  };
  f.moedas = f.moedas.filter(function(m) {
    const ny = ajustar(m.x, m.y, 32, 32);
    if (ny === null) return false;
    m.y = Math.round(ny);
    return true;
  });
  f.powerups = f.powerups.filter(function(u) {
    const ny = ajustar(u.x, u.base, 44, 44);
    if (ny === null) return false;
    u.base = u.y = Math.round(ny);
    return true;
  });
}

// Arena do chefe: uma tela só, com paredes dos lados
function gerarArena(f) {
  f.largura = LARGURA;
  f.inicioX = 120;
  f.dificuldade = 1;
  f.pool = MUNDOS[f.mundo].inimigos.slice();
  fChao(f, -400, LARGURA + 800, f.id === "gelo");
  fBloco(f, -64, -2000, 64, 2000 + CHAO);
  fBloco(f, LARGURA, -2000, 64, 2000 + CHAO);
  if (f.id === "lava") {
    // laterais a um pulo do chão; a do meio, a partir das laterais
    fPlat(f, 130, CHAO - 110, 160);
    fPlat(f, 910, CHAO - 110, 160);
    fPlat(f, 430, CHAO - 225, 340);
  } else if (f.id === "oceano") {
    // rochas de coral para fugir das piranhas e duas fontes de ar
    fPlat(f, 150, CHAO - 140, 170);
    fPlat(f, 880, CHAO - 140, 170);
    f.ventosAr.push({ x: 60, t: 0, arena: true });
    f.ventosAr.push({ x: LARGURA - 60, t: 60, arena: true });
  } else if (f.id === "montanha") {
    // pico rochoso: dois degraus de pedra nas pontas
    f.inicioX = 210;
    fBloco(f, 0, CHAO - 90, 150, 90);
    fBloco(f, LARGURA - 150, CHAO - 90, 150, 90);
    fPlat(f, 470, CHAO - 170, 260);
  }
  f.decoracoes.push({ x: 40, spr: f.mundo });
  f.decoracoes.push({ x: 1080, spr: f.mundo });
  return f;
}
