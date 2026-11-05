"use strict";

// =========================
// CENAS NOVAS
// - Logo "Feito por Felipe e Miguel" sempre que o jogo abre
// - História em páginas (como um livro) depois de clicar em Jogar
// - Mapa do mundo entre um mapa e outro (o macaco seguindo a banana)
// - Praia: o macaco sai do mar e vê as Montanhas Rochosas
// Todas usam o estado "cena": cenaAtual.atualizar() / desenhar() / pular()
// =========================

let cenaAtual = null;

function iniciarCena(c) {
  cenaAtual = c;
  c.t = 0;
  estado = "cena";
  pausado = false;
  mensagem = null;
  particulas = [];
  tremor = 0;
  cameraX = 0;
  if (typeof atualizarTelas === "function") atualizarTelas();
}

function acabarCena() {
  const c = cenaAtual;
  if (!c || c.acabou) return;
  c.acabou = true;
  if (c.depois) c.depois();
}

function textoCentro(txt, y, tam, cor, esp) {
  ctx.font = "bold " + tam + "px " + FONTE;
  ctx.textAlign = "center";
  textoSombra(txt, LARGURA / 2, y, cor || "#ffffff", esp || 2);
}

function dicaPularCena(t) {
  if (t < 40) return;
  ctx.globalAlpha = 0.55 + Math.sin(t * 0.08) * 0.3;
  textoCentro(toqueAtivo ? tr("Toque para continuar") : tr("Clique ou aperte uma tecla para continuar"), ALTURA - 18, 15, "#dee2e6");
  ctx.globalAlpha = 1;
}

function barrasCinema(k) {
  const h = Math.round(64 * suavizar(k));
  if (h <= 0) return;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, LARGURA, h);
  ctx.fillRect(0, ALTURA - h, LARGURA, h);
}

// Balão de pensamento com "!" ou "?"
function balaoSinal(x, y, sinal, cor) {
  painelPixel(x - 20, y - 22, 40, 40, "#8a5a2b", "rgba(255,255,255,0.97)");
  ctx.fillStyle = "#0d0704";
  ctx.fillRect(x - 4, y + 18, 8, 2); ctx.fillRect(x - 2, y + 20, 4, 2);
  ctx.font = "bold 28px " + FONTE;
  ctx.textAlign = "center";
  ctx.fillStyle = cor || "#e03131";
  ctx.fillText(sinal, x, y + 9);
}


// ---------- LOGO ----------

// Texto desenhado pequeno e ampliado 4x: fica pixelado de verdade
function logoPixelado() {
  return cacheVis("logoPixel", function() {
    const p = criarCanvas(300, 120);
    const g = p.getContext("2d");
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = "bold 13px " + FONTE;
    const linha = function(txt, y, cores, borda) {
      g.fillStyle = borda;
      [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [0, 2], [1, 2]].forEach(function(d) { g.fillText(txt, 150 + d[0], y + d[1]); });
      const gr = g.createLinearGradient(0, y - 12, 0, y);
      cores.forEach(function(c, i) { gr.addColorStop(i / (cores.length - 1), c); });
      g.fillStyle = gr;
      g.fillText(txt, 150, y);
    };
    g.font = "bold 10px " + FONTE;
    linha(tr("Feito por"), 40, ["#fff3bf", "#ffd43b"], "#2a1608");
    g.font = "bold 22px " + FONTE;
    linha("Felipe e Miguel", 72, ["#fff9c4", "#ffd43b", "#f59f00"], "#2a1608");
    // limpa o serrilhado: cada pixel vira 100% opaco ou some
    const d = g.getImageData(0, 0, 300, 120);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
    g.putImageData(d, 0, 0);
    return ampliarCanvas(p, 4);
  });
}

function iniciarLogo(depois) {
  iniciarCena({
    tipo: "logo", mundo: 0, depois: depois,
    atualizar: function() {
      tempo++;
      if (this.t === 30) som("estrela");
      if (this.t > 230) acabarCena();
    },
    desenhar: function() {
      const t = this.t;
      ctx.fillStyle = "#120a06";
      ctx.fillRect(0, 0, LARGURA, ALTURA);
      // estrelinhas no fundo
      for (let i = 0; i < 40; i++) {
        const x = (i * 211) % LARGURA, y = (i * 137) % ALTURA;
        const a = 0.2 + 0.3 * Math.abs(Math.sin(t * 0.03 + i));
        ctx.fillStyle = "rgba(255,230,150," + a.toFixed(2) + ")";
        ctx.fillRect(x, y, 3, 3);
      }
      const entra = suavizar(t / 40), sai = t > 190 ? 1 - suavizar((t - 190) / 40) : 1;
      ctx.globalAlpha = entra * sai;
      luzAditiva(LARGURA / 2, 330, 360, "255,200,80", 0.25);
      // macaco segurando a banana em cima do texto
      const spr = SPRITES_PRIMATA[Math.floor(t / 20) % 2 ? "vitoria" : "vitoria2"].d;
      ctx.drawImage(spr, LARGURA / 2 - 96, 70 + Math.round(Math.sin(t * 0.08) * 6), 192, 160);
      ctx.save();
      ctx.translate(LARGURA / 2, 62 + Math.sin(t * 0.08) * 6);
      ctx.rotate(Math.sin(t * 0.1) * 0.3);
      ctx.drawImage(SPR_BANANA, -36, -30, 72, 60);
      ctx.restore();
      const esc = 0.7 + 0.3 * saltitar(t / 35);
      const lg = logoPixelado();
      ctx.save();
      ctx.translate(LARGURA / 2, 400);
      ctx.scale(esc, esc);
      ctx.drawImage(lg, -lg.width / 2, -lg.height / 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    },
    pular: function() { if (this.t > 15) acabarCena(); }
  });
}


// ---------- HISTÓRIA EM PÁGINAS ----------

const PAGINAS_HISTORIA = [
  { txt: "Era uma vez, bem no meio da selva, um macaquinho muito guloso.", cena: "anda" },
  { txt: "Todo dia ele procurava a banana perfeita... mas nenhuma era boa o bastante.", cena: "procura" },
  { txt: "Até que, no alto da bananeira mais alta, ele viu uma banana DOURADA, brilhando!", cena: "ve" },
  { txt: "Ele subiu, pegou a banana com todo o cuidado e abriu a boca para a primeira mordida...", cena: "pega" },
  { txt: "...quando uma ventania fortíssima arrancou a banana da mão dele!", cena: "vento" },
  { txt: "A banana saiu rodopiando por cima das árvores, cada vez mais longe.", cena: "longe" },
  { txt: "O macaquinho apertou os olhos, estufou o peito e decidiu: ele ia pegar aquela banana!", cena: "decide" }
];

function iniciarHistoria(depois) {
  iniciarCena({
    tipo: "historia", mundo: 0, depois: depois, pag: 0, tPag: 0, virando: 0,
    atualizar: function() {
      tempo++;
      this.tPag++;
      if (this.virando > 0) {
        this.virando++;
        if (this.virando === 14) { this.pag++; this.tPag = 0; }
        if (this.virando >= 28) this.virando = 0;
      } else if (this.tPag > 330) {
        this.proxima();
      }
      if (this.pag === 4 && this.tPag % 3 === 0 && this.tPag < 200) vento();
      atualizarParticulas();
    },
    proxima: function() {
      if (this.virando) return;
      if (this.pag >= PAGINAS_HISTORIA.length - 1) { acabarCena(); return; }
      this.virando = 1;
      som("pagina");
    },
    desenhar: function() {
      // capa de couro e a página de papel
      ctx.fillStyle = "#2a160c";
      ctx.fillRect(0, 0, LARGURA, ALTURA);
      for (let y = 0; y < ALTURA; y += 8) {
        ctx.fillStyle = y % 16 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.02)";
        ctx.fillRect(0, y, LARGURA, 4);
      }
      const pag = Math.min(this.pag, PAGINAS_HISTORIA.length - 1);
      // virando a página: a folha "achata" e volta
      const k = this.virando ? Math.abs(1 - this.virando / 14) : 1;
      ctx.save();
      ctx.translate(LARGURA / 2, 0);
      ctx.scale(Math.max(0.02, k), 1);
      ctx.translate(-LARGURA / 2, 0);
      // folha
      ctx.fillStyle = "#0d0704";
      ctx.fillRect(92, 26, 1016, 620);
      ctx.fillStyle = "#f3e3c0";
      ctx.fillRect(96, 30, 1008, 612);
      ctx.fillStyle = "#e6d0a2";
      ctx.fillRect(96, 30, 1008, 6);
      ctx.fillRect(96, 636, 1008, 6);
      // ilustração dentro de uma moldura
      const fx = 136, fy = 62, fw = 928, fh = 420;
      ctx.fillStyle = "#5a3a1c";
      ctx.fillRect(fx - 8, fy - 8, fw + 16, fh + 16);
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();
      ctx.translate(fx, fy);
      ctx.scale(fw / LARGURA, fh / ALTURA);
      desenharIlustracao(PAGINAS_HISTORIA[pag].cena, this.tPag);
      ctx.restore();
      // texto da página (aparece aos poucos, letra por letra)
      const txt = tr(PAGINAS_HISTORIA[pag].txt);
      const n = Math.min(txt.length, Math.floor(this.tPag * 1.2));
      ctx.font = "bold 24px " + FONTE;
      ctx.textAlign = "center";
      const palavras = txt.slice(0, n).split(" ");
      const linhas = [""];
      palavras.forEach(function(p) {
        const tenta = (linhas[linhas.length - 1] + " " + p).trim();
        if (ctx.measureText(tenta).width > 900) linhas.push(p);
        else linhas[linhas.length - 1] = tenta;
      });
      ctx.fillStyle = "#3b2412";
      linhas.forEach(function(l, i) { ctx.fillText(l, LARGURA / 2, 535 + i * 34); });
      // número da página
      ctx.font = "bold 16px " + FONTE;
      ctx.fillStyle = "#8a6a4a";
      ctx.fillText("~ " + (pag + 1) + " ~", LARGURA / 2, 626);
      ctx.restore();
      dicaPularCena(this.tPag);
    },
    pular: function() {
      // primeiro clique termina de escrever a página; o próximo vira
      const txt = tr(PAGINAS_HISTORIA[Math.min(this.pag, PAGINAS_HISTORIA.length - 1)].txt);
      if (this.tPag * 1.2 < txt.length) this.tPag = Math.ceil(txt.length / 1.2) + 1;
      else this.proxima();
    }
  });
}

// Cada página tem uma ilustração animada (desenhada no tamanho do jogo e encolhida na moldura)
function desenharIlustracao(cena, t) {
  desenharFundo(0, t * 0.6, t);
  desenharChaoCena(0, 0);
  const arvore = SPR_DECOR[0];
  ctx.drawImage(arvore, 80, CHAO - arvore.height);
  ctx.drawImage(arvore, 980, CHAO - arvore.height);
  const banana = function(x, y, rot, brilho) {
    luzAditiva(x, y, brilho || 70, "255,215,70", 0.5 + Math.sin(t * 0.1) * 0.15);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.drawImage(SPR_BANANA, -36, -30, 72, 60);
    ctx.restore();
  };
  if (cena === "anda") {
    const x = 200 + (t * 2.2) % 900;
    desenharMacacoCena(x, CHAO, Math.floor(t / 8) % 2 ? "andar1" : "andar2", 1, 0);
    balao(x + 10, CHAO - 130, function(bx, by) { ctx.drawImage(SPR_BANANA, bx - 14, by - 12, 28, 24); });
  } else if (cena === "procura") {
    const pose = ["olhar1", "olhar2", "coca1", "coca2"][Math.floor(t / 30) % 4];
    desenharMacacoCena(560, CHAO, pose, 1, 0);
    // bananas comuns (sem graça) no chão
    ctx.globalAlpha = 0.85;
    [380, 760, 820].forEach(function(x, i) { ctx.save(); ctx.translate(x, CHAO - 14); ctx.rotate(1.4 + i); ctx.drawImage(SPR_BANANA, -18, -15, 36, 30); ctx.restore(); });
    ctx.globalAlpha = 1;
    if (t % 120 > 60) balaoSinal(600, CHAO - 140, "?", "#1c7ed6");
  } else if (cena === "ve") {
    // bananeira gigante com a banana dourada pendurada no cacho, lá no alto
    const g = desenharBananeira(800, CHAO + 4, t);
    const balanca = Math.sin(t * 0.05) * 0.2;
    banana(g.x + 6 + Math.sin(balanca) * 20, g.y + 22, balanca, 120);
    for (let k = 0; k < 3; k++) desenharEstrela4(g.x + Math.cos(t * 0.05 + k * 2) * 60, g.y + 22 + Math.sin(t * 0.06 + k * 2) * 40, 6, "#ffffff");
    desenharMacacoCena(520, CHAO, "olhar2", 1, 0);
    if (t > 30) balaoSinal(560, CHAO - 140, "!");
  } else if (cena === "pega") {
    desenharBananeira(800, CHAO + 4, t);
    desenharMacacoCena(600, CHAO, t % 60 < 40 ? "vitoria" : "vitoria2", 1, 0);
    banana(600, CHAO - 116, 0, 90);
    if (t > 120) {
      // boca aberta... "nham?"
      ctx.font = "bold 30px " + FONTE;
      ctx.textAlign = "center";
      textoSombra("...", 690, CHAO - 150, "#ffffff", 2);
    }
  } else if (cena === "vento") {
    const k = Math.min(1, t / 120);
    desenharBananeira(800, CHAO + 4, t, Math.max(0, 1 - t / 200));
    desenharMacacoCena(600 - k * 40, CHAO, t < 20 ? "vitoria" : "queda", 1, 0);
    banana(600 + k * 700, CHAO - 116 - k * 380, t * 0.35, 70);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 14; i++) {
      const y = 120 + (i * 41) % 460;
      const x = ((t * 26 + i * 173) % 1500) - 200;
      ctx.fillRect(x, y, 80 + (i % 3) * 40, 4);
    }
    desenharParticulas();
    if (t > 30) balaoSinal(590, CHAO - 140, "!");
  } else if (cena === "longe") {
    const k = Math.min(1, t / 260);
    banana(500 + k * 600, 200 - k * 120, t * 0.2, 40 - k * 20);
    ctx.globalAlpha = 1;
    desenharMacacoCena(380, CHAO, "olhar2", 1, 0);
    // rastro de brilho da banana
    for (let i = 1; i < 6; i++) desenharEstrela4(500 + (k - i * 0.04) * 600, 200 - (k - i * 0.04) * 120, Math.max(1, 6 - i), "#fff3bf");
  } else {
    // decide: pulinho determinado
    const pulo = Math.abs(Math.sin(t * 0.08)) * 30;
    desenharMacacoCena(600, CHAO - pulo, pulo > 20 ? "pulo" : "parado", 1, 0);
    ctx.font = "bold 40px " + FONTE;
    ctx.textAlign = "center";
    if (t > 40) textoSombra("!!", 660, CHAO - 150, ["#fff9c4", "#ffc21a"], 3);
  }
}


// ---------- MAPA DO MUNDO (entre um mapa e outro) ----------

const POS_MAPA = [[140, 500], [320, 330], [500, 510], [680, 330], [860, 500], [1050, 300]];

function desenharRegiaoMapa(i, x, y, feito, atual) {
  const cor = MUNDOS[i].cor;
  // ilha da região
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(x + 6, y + 10, 86, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = escurecer(cor, 0.35);
  ctx.beginPath(); ctx.ellipse(x, y + 4, 86, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.ellipse(x, y, 84, 42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = clarear(cor, 0.35);
  ctx.beginPath(); ctx.ellipse(x - 20, y - 14, 40, 14, 0, 0, Math.PI * 2); ctx.fill();
  // símbolo de cada mundo (pixel art simples)
  const id = MUNDOS[i].id;
  ctx.save();
  ctx.translate(x, y - 20);
  if (id === "selva") {
    ctx.fillStyle = "#6b4423"; ctx.fillRect(-4, 0, 8, 24);
    ctx.fillStyle = "#1b6b2c"; ctx.fillRect(-26, -22, 52, 26);
    ctx.fillStyle = "#40c057"; ctx.fillRect(-20, -30, 40, 20);
  } else if (id === "deserto") {
    ctx.fillStyle = "#c48d38"; ctx.beginPath(); ctx.moveTo(-34, 24); ctx.lineTo(0, -26); ctx.lineTo(34, 24); ctx.fill();
    ctx.fillStyle = "#f0c868"; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(34, 24); ctx.lineTo(4, 24); ctx.fill();
  } else if (id === "gelo") {
    ctx.fillStyle = "#1f4d66"; ctx.beginPath(); ctx.moveTo(-24, 24); ctx.lineTo(0, -30); ctx.lineTo(24, 24); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(0, -30); ctx.lineTo(10, -8); ctx.fill();
  } else if (id === "oceano") {
    ctx.fillStyle = "#e3fafc";
    for (let k = 0; k < 3; k++) ctx.fillRect(-30 + k * 6, -16 + k * 14, 50, 5);
    ctx.drawImage(SPR_CHEFE.tubarao.d, -30, -24, 60, 30);
  } else if (id === "montanha") {
    ctx.fillStyle = "#7a5a6e"; ctx.beginPath(); ctx.moveTo(-36, 24); ctx.lineTo(-8, -30); ctx.lineTo(18, 24); ctx.fill();
    ctx.fillStyle = "#a87a7e"; ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(18, -16); ctx.lineTo(38, 24); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(-15, -16); ctx.lineTo(-8, -30); ctx.lineTo(-1, -16); ctx.fill();
  } else {
    ctx.fillStyle = "#43262c"; ctx.beginPath(); ctx.moveTo(-36, 24); ctx.lineTo(-10, -22); ctx.lineTo(10, -22); ctx.lineTo(36, 24); ctx.fill();
    ctx.fillStyle = "#ff6b00"; ctx.fillRect(-10, -26, 20, 6);
    ctx.fillStyle = "#ffd43b"; ctx.fillRect(-4, -36 + Math.sin(tempo * 0.2) * 3, 8, 8);
  }
  ctx.restore();
  // nome
  ctx.font = "bold 18px " + FONTE;
  ctx.textAlign = "center";
  textoSombra((i + 1) + ". " + MUNDOS[i].nome, x, y + 66, atual ? "#ffe066" : "#ffffff");
  if (feito) { ctx.drawImage(SPR_ESTRELA, x + 50, y - 50, 28, 28); }
}

function pontoCaminho(a, b, k) {
  const ca = POS_MAPA[a], cb = POS_MAPA[b];
  const mx = (ca[0] + cb[0]) / 2, my = Math.min(ca[1], cb[1]) - 60;
  const u = 1 - k;
  return [u * u * ca[0] + 2 * u * k * mx + k * k * cb[0], u * u * ca[1] + 2 * u * k * my + k * k * cb[1]];
}

function iniciarMapaMundo(de, depois) {
  const para = Math.min(MUNDOS.length - 1, de + 1);
  iniciarCena({
    tipo: "mapa", mundo: para, depois: depois, de: de, para: para,
    atualizar: function() {
      tempo++;
      if (this.t === 20) som("vento");
      if (this.t > 300) acabarCena();
    },
    desenhar: function() {
      const t = this.t;
      // mar e papel do mapa
      ctx.fillStyle = "#1a5f86";
      ctx.fillRect(0, 0, LARGURA, ALTURA);
      for (let y = 0; y < ALTURA; y += 24) for (let x = (y / 24 % 2) * 24; x < LARGURA; x += 48) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(x + Math.round(Math.sin((t + y) * 0.03) * 4), y, 16, 3);
      }
      ctx.fillStyle = "#0d0704"; ctx.fillRect(36, 96, 1128, 560);
      ctx.fillStyle = "#e9d6a8"; ctx.fillRect(40, 100, 1120, 552);
      ctx.fillStyle = "rgba(120,80,30,0.18)"; ctx.fillRect(40, 100, 1120, 10); ctx.fillRect(40, 642, 1120, 10);
      // caminho pontilhado ligando os mundos
      for (let i = 0; i < MUNDOS.length - 1; i++) {
        for (let k = 0; k <= 1; k += 0.06) {
          const p = pontoCaminho(i, i + 1, k);
          ctx.fillStyle = i < this.de || (i === this.de && k <= Math.min(1, Math.max(0, (t - 80) / 160))) ? "#c92a2a" : "#8a6a4a";
          ctx.fillRect(Math.round(p[0]) - 3, Math.round(p[1]) - 3, 6, 6);
        }
      }
      for (let i = 0; i < MUNDOS.length; i++) desenharRegiaoMapa(i, POS_MAPA[i][0], POS_MAPA[i][1], !!save.chefes[i], i === this.para);
      // a banana voa na frente...
      const kb = limitar((t - 20) / 120, 0, 1);
      const pb = pontoCaminho(this.de, this.para, kb);
      luzAditiva(pb[0], pb[1] - 40, 50, "255,215,70", 0.5);
      ctx.save();
      ctx.translate(pb[0], pb[1] - 40 + Math.sin(t * 0.2) * 4);
      ctx.rotate(t * 0.15);
      ctx.drawImage(SPR_BANANA, -24, -20);
      ctx.restore();
      if (kb < 1 && t % 3 === 0) particula({ tipo: "vento", x: pb[0] - 120, y: pb[1] - 40 + (Math.random() - 0.5) * 30, vx: 10, vy: 0, g: 0, vida: 14, max: 14, tam: 40 });
      // ...e o macaco vai andando atrás dela
      const km = limitar((t - 80) / 160, 0, 1);
      const pm = pontoCaminho(this.de, this.para, km);
      const spr = SPRITES_PRIMATA[km < 1 ? (Math.floor(t / 7) % 2 ? "andar1" : "andar2") : "vitoria"].d;
      ctx.drawImage(spr, Math.round(pm[0] - 36), Math.round(pm[1] - 70), 72, 60);
      atualizarParticulas();
      desenharParticulas();
      // título
      ctx.font = "bold 40px " + FONTE;
      ctx.textAlign = "center";
      textoSombra(tr("Próximo mundo: {0}", MUNDOS[this.para].nome), LARGURA / 2, 66, ["#fff9c4", "#ffc21a"], 3);
      dicaPularCena(t);
    },
    pular: function() { if (this.t > 20) acabarCena(); }
  });
}


// ---------- PRAIA: saindo do Oceano e vendo as Montanhas Rochosas ----------

function iniciarPraia(depois) {
  iniciarCena({
    tipo: "praia", mundo: M_MONTANHA, depois: depois, x: -80, pose: "queda",
    atualizar: function() {
      tempo++;
      const t = this.t;
      if (t < 200) { this.x += 3.4; this.nadando = true; }
      else if (t < 250) { this.x += 2.4; this.nadando = false; }
      if (t === 205) som("pulo");
      if (t === 270) som("confuso");
      if (t > 380) this.x += 4;
      if (t > 470) acabarCena();
      atualizarParticulas();
    },
    desenhar: function() {
      const t = this.t;
      desenharFundoMundo(ctx, M_MONTANHA, 600 + t * 0.2, t);
      // areia da praia (direita) e o mar (esquerda)
      const praiaX = 640;
      ctx.fillStyle = "#e9cf94";
      ctx.beginPath(); ctx.moveTo(praiaX - 60, ALTURA); ctx.lineTo(praiaX + 40, 560); ctx.lineTo(LARGURA, 545); ctx.lineTo(LARGURA, ALTURA); ctx.fill();
      ctx.fillStyle = "#d6b878";
      ctx.fillRect(praiaX + 60, 600, 600, 6);
      for (let k = 0; k < 18; k++) ctx.fillRect(praiaX + 80 + (k * 53) % 520, 610 + (k * 31) % 80, 4, 4);
      // água com ondas indo e voltando
      const onda = Math.sin(t * 0.05) * 14;
      ctx.fillStyle = "#1c7ed6";
      ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(praiaX + onda, 560); ctx.lineTo(praiaX - 100 + onda, ALTURA); ctx.lineTo(0, ALTURA); ctx.fill();
      ctx.fillStyle = "#4dabf7";
      for (let x = 0; x < praiaX + onda; x += 32) ctx.fillRect(x, 556 + Math.round(Math.sin((x + t * 3) * 0.05) * 3), 24, 6);
      ctx.fillStyle = "#e7f5ff";
      ctx.fillRect(praiaX + onda - 30, 557, 30, 4);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let k = 0; k < 6; k++) ctx.fillRect(((k * 167 + t) % (praiaX + 40)), 600 + k * 14, 40, 3);
      // macaco: nadando (só cabeça e braços para fora), depois andando na areia e olhando as montanhas
      const SP = spritesDoMacaco(t < 250);
      const x = this.x;
      if (t < 200) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, LARGURA, 572); ctx.clip();
        const pose = Math.floor(t / 10) % 2 ? "balancoF" : "balancoT";
        ctx.drawImage(SP[pose].d, Math.round(x - 48), 520 + Math.round(Math.sin(t * 0.2) * 3));
        ctx.restore();
        if (t % 8 === 0) particula({ tipo: "q", x: x - 30, y: 568, vx: -1.5, vy: -1, g: 0.1, vida: 20, max: 20, cor: "#e7f5ff", tam: 5 });
      } else {
        const base = 572;
        const pose = t < 250 ? (Math.floor(t / 7) % 2 ? "andar1" : "andar2") : t < 380 ? (t < 300 ? "olhar2" : "parado") : (Math.floor(t / 6) % 2 ? "corre1" : "corre3");
        sombraCena(x, base, 58, 0.3);
        ctx.drawImage(SP[pose].d, Math.round(x - 48), base - 80);
        if (t > 260 && t < 380) balaoSinal(x + 30, base - 120, t < 320 ? "!" : "?", t < 320 ? "#e03131" : "#1c7ed6");
      }
      // a banana lá longe, indo para as montanhas
      const kb = Math.min(1, t / 400);
      luzAditiva(700 + kb * 420, 240 - kb * 120, 30, "255,215,70", 0.5);
      ctx.save();
      ctx.translate(700 + kb * 420, 240 - kb * 120);
      ctx.rotate(t * 0.2);
      ctx.drawImage(SPR_BANANA, -12, -10, 24, 20);
      ctx.restore();
      desenharParticulas();
      barrasCinema(Math.min(1, t / 30));
      dicaPularCena(t);
    },
    pular: function() { if (this.t > 20) acabarCena(); }
  });
}
