"use strict";

// =========================
// CHEFES MAIS FORTES E COM MAIS MECÂNICAS
// - Mais vida (sem exagero) e um pouco mais de pausa entre os ataques (dá para ler o que vem).
// - Três fases: ao chegar em 2/3 e em 1/3 da vida o chefe para, ruge (empurra o macaco sem machucar)
//   e fica invulnerável por um instante. A barra de vida mostra onde muda de fase.
// - A partir da fase 2 cada chefe ganha um ataque novo; na fase 3 o ataque fica mais forte.
//     Gorila Rei:       Batucada (bate no peito e solta ondas de choque no ritmo; na fase 3 chama cobras)
//     Escorpião Faraó:  Ferrões da areia (ferrões saem do chão onde o macaco está, com aviso)
//     Yeti Ancestral:   Avalanche (bolas de neve gigantes rolando, uma de cada lado)
//     Tubarão Abissal:  Redemoinho (puxa o macaco para o meio; o olho do redemoinho machuca)
//     Condor dos Andes: Leque de penas (penas afiadas em leque, com aviso)
//     Dragão de Magma:  Rio de fogo (uma onda de fogo corre pelo chão: suba nas plataformas)
// Não mexe no Saru (chefe secreto).
// =========================

const HP_CHEFE_NOVO = { gorila: 48, escorpiaoRei: 66, yeti: 84, tubarao: 96, condor: 106, dragao: 120 };
Object.keys(HP_CHEFE_NOVO).forEach(function(k) {
  DEF_CHEFES[k].hp = HP_CHEFE_NOVO[k];
  DEF_CHEFES[k].ritmo = Math.round(DEF_CHEFES[k].ritmo * 1.12 * 100) / 100;
});

const ATAQUE_NOVO = { gorila: "batucada", escorpiaoRei: "ferroesAreia", yeti: "avalanche", tubarao: "redemoinho", condor: "penas", dragao: "rioDeFogo" };
const ESTADO_LIVRE = { parado: 1, voar: 1, nadar: 1, descansando: 1, tonto: 1, andar: 1 };

function faseDaVida(c) {
  const r = c.hp / c.hpMax;
  return r > 0.66 ? 1 : r > 0.33 ? 2 : 3;
}

function estadoDescanso(c) {
  return c.def.voa ? (c.def.primeiro || "voar") : "parado";
}

// ---------- o novo ataque entra no sorteio a partir da fase 2 ----------
const proximoAtaqueOriginal = proximoAtaque;
proximoAtaque = function(c, lista) {
  const novo = ATAQUE_NOVO[c.tipo];
  if (novo && (c.faseLuta || 1) >= 2 && c.ultimo !== novo && Math.random() < (c.faseLuta === 3 ? 0.4 : 0.3)) {
    c.ultimo = novo;
    c.estado = novo;
    c.t = 0;
    return;
  }
  proximoAtaqueOriginal(c, lista);
};

// ---------- invulnerável enquanto ruge na troca de fase; derrota leva os ajudantes junto ----------
const danoChefeOriginal = danoChefe;
danoChefe = function(dano, origemX, ignora) {
  const c = chefe;
  if (c && c.estado === "furia") { som("negado"); return; }
  danoChefeOriginal(dano, origemX, ignora);
  if (c && !c.vivo) {
    c.estacas = []; c.rio = null;
    inimigos.forEach(function(e) { if (e.daChefe && e.vivo) matarInimigo(e, "nuke"); });
  }
};

// ---------- IA: troca de fase + ataques novos, por cima da IA de cada chefe ----------
Object.keys(ATAQUE_NOVO).forEach(function(tipo) {
  const original = IA_CHEFES[tipo];
  IA_CHEFES[tipo] = function(c, raiva) {
    if (!c.faseLuta) c.faseLuta = 1;
    atualizarPerigosChefe(c);
    const f = faseDaVida(c);
    if (f > c.faseLuta && ESTADO_LIVRE[c.estado] && !c.intangivel && !jogador.agarrado) {
      c.faseLuta = f;
      irPara(c, "furia");
    }
    if (c.estado === "furia") { furiaChefe(c); return; }
    if (c.estado === ATAQUE_NOVO[tipo]) { ATAQUES_NOVOS[tipo](c, c.faseLuta >= 3); return; }
    original(c, raiva);
  };
});

function furiaChefe(c) {
  const j = jogador;
  c.vx = 0;
  if (c.def.voa) {
    c.y += (Math.min(c.y, 200) - c.y) * 0.05;
    c.x += Math.sin(c.t * 0.9) * 1.5;
  } else fisicaChefe(c);
  olharProJogador(c);
  if (c.t === 1) som("aviso");
  if (c.t === 25) {
    som(c.tipo === "condor" ? "grasnado" : "urro");
    tremor = 32;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    particula({ tipo: "anel", x: cx, y: cy, vx: 0, vy: 0, g: 0, vida: 36, max: 36, raio: 520 });
    particula({ tipo: "texto", x: limitar(cx, 200, LARGURA - 200), y: Math.max(130, c.y - 10), vx: 0, vy: -0.5, g: 0, vida: 110, max: 110,
      texto: tr("Fase {0}!", c.faseLuta), cor: c.faseLuta === 3 ? "#ff6b6b" : "#ffd43b", tam: 52 });
    // empurra o macaco para longe (sem dano) e limpa os tiros da tela
    const d = Math.hypot(j.x + j.w / 2 - cx, j.y + j.h / 2 - cy);
    if (!j.morto && d < 420) {
      j.vx = (j.x + j.w / 2 < cx ? -1 : 1) * 11;
      j.vy = -8;
      j.travado = 18;
    }
    projeteis = projeteis.filter(function(p) { return p.doJogador; });
  }
  if (c.t > 25 && c.t < 70 && c.t % 4 === 0) tremor = Math.max(tremor, 5);
  if (c.t > 100) irPara(c, estadoDescanso(c));
}

// Perigos que continuam vivos mesmo depois do ataque (ferrões, rio de fogo, redemoinho)
function atualizarPerigosChefe(c) {
  const j = jogador;
  const cj = caixaJogador();
  if (c.estacas) {
    for (let i = c.estacas.length - 1; i >= 0; i--) {
      const e = c.estacas[i];
      e.t++;
      if (e.t === 40) { som("cospe"); tremor = Math.max(tremor, 4); }
      if (e.t >= 40 && e.t < 66 && !j.morto && encosta(cj, { x: e.x - 18, y: CHAO - 96, w: 36, h: 96 })) machucar(e.x);
      if (e.t > 80) c.estacas.splice(i, 1);
    }
  }
  if (c.rio) {
    const r = c.rio;
    r.t++;
    if (r.t > 40) {
      r.x += r.dir * 6;
      if (tempo % 2 === 0) particula({ tipo: "q", x: r.x + (Math.random() - 0.5) * 180, y: CHAO - 10, vx: 0, vy: -3 - Math.random() * 3, g: 0.05, vida: 26, max: 26, cor: Math.random() < 0.5 ? "#ffd43b" : "#ff6b00", tam: 6 });
      if (!j.morto && j.y + j.h >= CHAO - 4 && Math.abs(j.x + j.w / 2 - r.x) < 100) {
        machucar(r.x);
        if (!j.morto) j.vy = -13;
      }
      if (r.x < -200 || r.x > LARGURA + 200) c.rio = r.depois || null;
    }
  }
}

const ATAQUES_NOVOS = {
  // Gorila: bate no peito (aviso) e solta ondas de choque no ritmo da batucada
  gorila: function(c, forte) {
    c.vx = 0;
    olharProJogador(c);
    fisicaChefe(c);
    if (c.t === 1) som("rugido");
    const batidas = forte ? [50, 78, 106, 134] : [50, 80, 110];
    if (c.t < 50 && c.t % 8 === 0) { som("pancada"); tremor = 3; }
    if (batidas.indexOf(c.t) >= 0) {
      tremor = 14;
      som("pancada");
      const meio = c.x + c.w / 2;
      const v = 5.5 + batidas.indexOf(c.t) * 0.5;
      projeteis.push({ tipo: "onda", x: meio - 60, y: CHAO - 30, w: 34, h: 30, vx: -v, vy: 0, vida: 260 });
      projeteis.push({ tipo: "onda", x: meio + 26, y: CHAO - 30, w: 34, h: 30, vx: v, vy: 0, vida: 260 });
      poeira(meio, CHAO, 8);
    }
    // fase 3: chama duas cobras da selva para ajudar (no máximo 2 ao mesmo tempo)
    if (forte && c.t === 60) {
      const vivas = inimigos.filter(function(e) { return e.daChefe && e.vivo; }).length;
      for (let k = vivas; k < 2; k++) {
        const e = criarInimigo({ tipo: "cobra", x: k === 0 ? 70 : LARGURA - 130, y: CHAO - 300 });
        e.daChefe = true;
        e.dir = k === 0 ? 1 : -1;
        inimigos.push(e);
      }
      texto(LARGURA / 2, 170, tr("Cobras!"), "#69db7c", 26);
    }
    if (c.t > (forte ? 175 : 150)) irPara(c, "parado");
  },

  // Escorpião: ferrões saem da areia bem onde o macaco está (montinho e "!" avisam antes)
  escorpiaoRei: function(c, forte) {
    c.vx = 0;
    olharProJogador(c);
    fisicaChefe(c);
    if (!c.estacas) c.estacas = [];
    const n = forte ? 6 : 4;
    if (c.t === 1) som("rugido");
    if (c.t >= 20 && c.t < 20 + n * 24 && (c.t - 20) % 24 === 0) {
      const j = jogador;
      c.estacas.push({ x: limitar(j.x + j.w / 2 + j.vx * 12, 40, LARGURA - 40), t: 0 });
    }
    if (c.t > 20 + n * 24 + 70) irPara(c, "parado");
  },

  // Yeti: ruge e bolas de neve gigantes descem rolando, alternando os lados
  yeti: function(c, forte) {
    c.vx = 0;
    fisicaChefe(c);
    if (c.t === 1) { som("rugido"); tremor = 12; }
    if (c.t < 40 && c.t % 3 === 0) {
      for (let s = 0; s < 2; s++) particula({ tipo: "q", x: s ? LARGURA - 40 * Math.random() : 40 * Math.random(), y: 0, vx: 0, vy: 4 + Math.random() * 3, g: 0.1, vida: 60, max: 60, cor: "#ffffff", tam: 6 });
    }
    const tiros = forte ? [40, 85, 130, 175] : [40, 90, 140];
    const k = tiros.indexOf(c.t);
    if (k >= 0) {
      const daEsquerda = (k + (jogador.x < LARGURA / 2 ? 0 : 1)) % 2 === 0;
      projeteis.push({ tipo: "bolao", x: daEsquerda ? -80 : LARGURA + 8, y: CHAO - 72, w: 72, h: 72,
        vx: (daEsquerda ? 1 : -1) * (forte ? 6 : 5), vy: 0, g: 0.6, rola: true, vida: 500 });
      som("pancada");
    }
    if (forte && c.t === 100) chuvaDoCeu(3, "gelo", 24, 36);
    olharProJogador(c);
    if (c.t > tiros[tiros.length - 1] + 60) irPara(c, "parado");
  },

  // Tubarão: nada em círculos e faz um redemoinho que puxa o macaco para o olho (que machuca)
  tubarao: function(c, forte) {
    const j = jogador;
    const cx = LARGURA / 2;
    if (c.t === 1) { som("rugido"); c.redemoinho = 0; }
    const a = c.t * (forte ? 0.055 : 0.045);
    c.x += (cx + Math.cos(a) * 360 - c.w / 2 - c.x) * 0.08;
    c.y += (260 + Math.sin(a) * 90 - c.y) * 0.08;
    c.dir = -Math.sin(a) > 0 ? 1 : -1;
    c.redemoinho = Math.min(1, Math.max(0, (c.t - 30) / 30)) * Math.min(1, Math.max(0, (230 - c.t) / 20));
    if (c.redemoinho > 0 && !j.morto) {
      const dx = cx - (j.x + j.w / 2);
      j.vx = limitar(j.vx + Math.sign(dx) * 0.32 * c.redemoinho * (forte ? 1.25 : 1), -6, 6);
      if (Math.abs(dx) < 46 && j.y + j.h > CHAO - 130) { machucar(cx); if (!j.morto) j.vy = -9; }
      if (tempo % 2 === 0) {
        const ang = Math.random() * Math.PI * 2, r = 40 + Math.random() * 220;
        particula({ tipo: "bolha", x: cx + Math.cos(ang) * r, y: CHAO - 60 + Math.sin(ang) * r * 0.35, vx: -Math.sin(ang) * 4, vy: Math.cos(ang) * 1.2 - 0.5, g: 0, vida: 30, max: 30, tam: 6 + Math.random() * 8 });
      }
    }
    if (forte && c.t === 120) {
      const fy = CHAO - 210, daDireita = j.x < LARGURA / 2;
      for (let k = 0; k < 3; k++) projeteis.push({ tipo: "piranha", x: daDireita ? LARGURA + 20 + k * 70 : -70 - k * 70, y: fy, w: 48, h: 33, vx: (daDireita ? -1 : 1) * 5, vy: 0, vida: 400, atravessa: true });
    }
    if (c.t > 240) { c.redemoinho = 0; irPara(c, "nadar"); }
  },

  // Condor: sobe, mira (o olho brilha) e solta penas afiadas em leque
  condor: function(c, forte) {
    const j = jogador;
    c.semContato = false;
    const ax = limitar(j.x + j.w / 2 - c.w / 2, 0, LARGURA - c.w);
    c.x += (ax - c.x) * 0.02;
    c.y += (110 - c.y) * 0.05;
    olharProJogador(c);
    const tiros = forte ? [35, 65, 95, 125] : [40, 80, 120];
    if (tiros.indexOf(c.t + 15) >= 0) som("aviso");
    if (tiros.indexOf(c.t) >= 0) {
      som("grasnado");
      const ox = c.x + c.w / 2, oy = c.y + c.h * 0.7;
      const base = Math.atan2(j.y + j.h / 2 - oy, j.x + j.w / 2 - ox);
      const n = forte ? 7 : 5;
      for (let k = 0; k < n; k++) {
        const ang = base + (k - (n - 1) / 2) * 0.22;
        projeteis.push({ tipo: "pena", x: ox - 9, y: oy - 9, w: 18, h: 18, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5, vida: 260 });
      }
    }
    if (c.t > tiros[tiros.length - 1] + 40) irPara(c, "voar");
  },

  // Dragão: vai para um canto, ruge e solta um rio de fogo que corre pelo chão (suba nas plataformas!)
  dragao: function(c, forte) {
    const j = jogador;
    if (c.t === 1) { c.lado = j.x < LARGURA / 2 ? 1 : -1; som("rugido"); }
    const ax = c.lado > 0 ? LARGURA - c.w - 20 : 20;
    c.x += (ax - c.x) * 0.06;
    c.y += (160 - c.y) * 0.06;
    c.dir = -c.lado;
    if (c.t === 50) {
      tremor = 18;
      const daDireita = c.lado > 0;
      c.rio = { x: daDireita ? LARGURA + 120 : -120, dir: daDireita ? -1 : 1, t: 0 };
      // fase 3: depois do primeiro, vem outro do outro lado
      if (forte) c.rio.depois = { x: daDireita ? -120 : LARGURA + 120, dir: daDireita ? 1 : -1, t: -30 };
      som("explosao");
    }
    if (c.t > 50 && c.t < 90 && c.t % 6 === 0) {
      const bx = c.dir > 0 ? c.x + c.w - 60 : c.x + 60;
      particula({ tipo: "q", x: bx, y: c.y + 60, vx: c.dir * 3, vy: 2, g: 0.1, vida: 30, max: 30, cor: "#ff922b", tam: 10 });
    }
    if (c.t > (forte ? 290 : 220)) irPara(c, "voar");
  }
};

// ---------- quadros de animação dos estados novos ----------
const QUADRO_NOVO = {
  gorila: function(c) { return c.t < 50 ? (Math.floor(c.t / 5) % 2 ? "peito" : "parado0") : (c.t % 30 < 8 ? "pancada" : "peito"); },
  escorpiaoRei: function(c) { return c.t % 24 < 10 ? "ferrao" : "prep"; },
  yeti: function(c) { return c.t < 40 ? "rugido" : (c.t % 50 < 15 ? "empurra" : "parado0"); },
  tubarao: function(c) { return Math.floor(tempo / 8) % 2 ? "nadar1" : "nadar0"; },
  condor: function(c) { return c.t % 40 > 28 ? "rajada" : ["voar0", "voar1", "voar2", "voar1"][Math.floor(tempo / 7) % 4]; },
  dragao: function(c) { return c.t < 50 ? "rugido" : c.t < 95 ? "sopro1" : "voar0"; }
};
Object.keys(QUADRO_NOVO).forEach(function(tipo) {
  const original = QUADRO_CHEFE[tipo];
  QUADRO_CHEFE[tipo] = function(c, raiva) {
    if (c.estado === "furia") return tipo === "condor" ? "rajada" : "rugido";
    if (c.estado === ATAQUE_NOVO[tipo]) return QUADRO_NOVO[tipo](c);
    return original(c, raiva);
  };
});
QUADROS_ATAQUE.gorila.push("peito");

// ---------- desenho dos perigos novos e das marcas de fase na barra ----------
const desenharChefeOriginal = desenharChefe;
desenharChefe = function() {
  const c = chefe;
  // redemoinho do tubarão (atrás do chefe)
  if (c.redemoinho > 0) {
    const cx = LARGURA / 2, cy = CHAO - 60;
    ctx.globalAlpha = 0.5 * c.redemoinho;
    for (let k = 0; k < 5; k++) {
      const r = 30 + k * 46;
      ctx.strokeStyle = k % 2 ? "#c5f6fa" : "#74c0fc";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.35, 0, tempo * 0.12 * (k % 2 ? 1 : -1) + k, tempo * 0.12 * (k % 2 ? 1 : -1) + k + 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    luzAditiva(cx, cy, 70, "255,90,90", 0.3 * c.redemoinho);
  }
  // aura da fúria
  if (c.estado === "furia") luzAditiva(c.x + c.w / 2, c.y + c.h / 2, Math.max(c.w, c.h), c.faseLuta === 3 ? "255,60,40" : "255,200,60", 0.35 + Math.sin(tempo * 0.4) * 0.15);
  desenharChefeOriginal();
  // ferrões da areia
  if (c.estacas) c.estacas.forEach(function(e) {
    const x = Math.round(e.x);
    if (e.t < 40) {
      // montinho tremendo e "!" avisando
      const tr2 = tempo % 4 < 2 ? -1 : 1;
      ctx.fillStyle = "#4a2f0a"; ctx.fillRect(x - 26 + tr2, CHAO - 10, 52, 10);
      ctx.fillStyle = "#e0b062"; ctx.fillRect(x - 24 + tr2, CHAO - 8, 48, 8);
      ctx.fillStyle = "#f6d68c"; ctx.fillRect(x - 12 + tr2, CHAO - 12, 24, 4);
      if (e.t % 10 < 6) { ctx.font = "bold 24px " + FONTE; ctx.textAlign = "center"; textoSombra("!", x, CHAO - 26, "#e599f7", 2); }
    } else if (e.t < 70) {
      const k = e.t < 46 ? (e.t - 40) / 6 : e.t > 62 ? Math.max(0, (70 - e.t) / 8) : 1;
      const h = Math.round(96 * k);
      for (let s = 0; s < h; s += 6) {
        const larg = Math.max(4, Math.round(30 * (1 - s / 100)));
        ctx.fillStyle = "#2a1260"; ctx.fillRect(x - larg / 2 - 2, CHAO - s - 6, larg + 4, 6);
        ctx.fillStyle = s % 12 ? "#8f5af5" : "#7048e8"; ctx.fillRect(x - larg / 2, CHAO - s - 6, larg, 6);
      }
      ctx.fillStyle = "#e599f7"; ctx.fillRect(x - 3, CHAO - h, 3, Math.min(h, 30));
      luzAditiva(x, CHAO - h / 2, 50, "190,90,255", 0.3);
    }
  });
  // rio de fogo do dragão
  const rios = [];
  if (c.rio) { rios.push(c.rio); if (c.rio.depois) rios.push(c.rio.depois); }
  rios.forEach(function(r) {
    if (r.t <= 0) return;
    if (r.t <= 40) {
      // fumaça avisando do lado de onde vem
      const sx = r.dir > 0 ? 30 : LARGURA - 30;
      if (tempo % 3 === 0) particula({ tipo: "fumaca", x: sx, y: CHAO - 10, vx: r.dir * 2, vy: -1.5, g: 0, vida: 40, max: 40, cor: "#ff922b", tam: 18 });
      return;
    }
    luzAditiva(r.x, CHAO - 30, 160, "255,120,30", 0.55);
    for (let dx = -100; dx <= 100; dx += 10) {
      const alt = Math.round((34 + Math.sin(tempo * 0.5 + dx * 0.2) * 12) * (1 - Math.abs(dx) / 140));
      const x = Math.round(r.x + dx);
      ctx.fillStyle = "#c92a2a"; ctx.fillRect(x - 1, CHAO - alt - 2, 12, alt + 2);
      ctx.fillStyle = "#ff6b00"; ctx.fillRect(x, CHAO - alt, 10, alt);
      ctx.fillStyle = "#ffd43b"; ctx.fillRect(x + 2, CHAO - Math.round(alt * 0.6), 6, Math.round(alt * 0.6));
    }
  });
};

const desenharVidaChefeOriginal = desenharVidaChefe;
desenharVidaChefe = function() {
  desenharVidaChefeOriginal();
  const c = chefe;
  if (!c || !ATAQUE_NOVO[c.tipo]) return;
  const x = LARGURA / 2 - 310, bx = x + 100, bw = 620 - 116, by = 6 + 38;
  [0.33, 0.66].forEach(function(k) {
    const mx = Math.round(bx + bw * k);
    ctx.fillStyle = "#0d0704";
    ctx.fillRect(mx - 4, by - 8, 8, 36);
    ctx.fillStyle = c.hp / c.hpMax > k ? "#ffd43b" : "#868e96";
    ctx.fillRect(mx - 2, by - 6, 4, 32);
  });
};

// Pena do Condor (projétil)
SPR_PROJ.pena = objCanvas(9, 9, 2, function(b) {
  pxPoligono(b, [[0, 8], [3, 3], [8, 0], [6, 5]], ["#3a3a3a", "#6b6b6b", "#a8a8a8", "#e9ecef"], { rim: false });
  pxLinha(b, 0, 8, 7, 1, "#f8f9fa");
}, "#16191d");
