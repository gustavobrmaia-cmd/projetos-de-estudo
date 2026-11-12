"use strict";

// =========================
// CENA DO CIPÓ-LAÇO (depois de vencer o Gorila Rei pela primeira vez)
// 1. O macaco anda até o cipó-laço caído logo à frente de onde ele e o Gorila lutavam e pega.
// 2. A banana aparece, ele tenta laçar... e ela escapa como sempre.
// 3. Um painel mostra como o cipó funciona e a tecla dele (K / J).
// Depois o macaco sai correndo atrás da banana (vai para o mapa do mundo).
// =========================

function iniciarCenaCipo() {
  const j = jogador;
  if (!j || j.morto || j.saindo || j.cenaCipo) return;
  j.cipo = null;
  cancelarLaco();
  if (j.deslizando) { j.deslizando = false; j.y -= 36; j.h = 72; }
  j.comemorar = 0;
  j.vx = 0;
  projeteis = [];
  const meio = j.x + j.w / 2;
  // o cipó fica logo à frente do macaco (para o lado de onde dá para andar)
  let cx = meio + 230;
  if (cx > LARGURA - 170) cx = meio - 230;
  cx = limitar(cx, 170, LARGURA - 170);
  j.cenaCipo = { etapa: "anda", t: 0, x: cx, laco: 0 };
  banana = { estado: "cenaCipo", x: -300, y: -300, t: 0, rot: 0, vy: 0 };
}

function lacoDaCena(j) {
  const m = maoJogador();
  return { x: m.x, y: m.y };
}

function atualizarCenaCipo(j, apertou) {
  const c = j.cenaCipo;
  c.t++;
  j.cenaPose = null;
  // gravidade (para o caso de ter acabado a luta no ar)
  if (j.y + j.h < CHAO) {
    j.vy = Math.min(j.vy + GRAV, MAX_QUEDA);
    j.y = Math.min(j.y + j.vy, CHAO - j.h);
  }
  j.noChao = j.y + j.h >= CHAO;
  if (j.noChao) j.vy = 0;
  const b = banana;

  if (c.etapa === "anda") {
    const meio = j.x + j.w / 2;
    const d = c.x - meio;
    j.dir = d > 0 ? 1 : -1;
    j.vx = Math.abs(d) > 30 ? j.dir * 2.6 : 0;
    j.x += j.vx;
    if (j.noChao && j.vx) { j.passos++; if (j.passos % 15 === 0) somPasso(j); }
    if (Math.abs(d) <= 30 || c.t > 400) { c.etapa = "acha"; c.t = 0; j.vx = 0; som("aviso"); }
  } else if (c.etapa === "acha") {
    // olha pro chão, levanta o cipó e comemora
    j.cenaPose = c.t < 40 ? (c.t % 20 < 10 ? "olhar1" : "olhar2") : "vitoria";
    if (c.t === 40) {
      som("cipoAchado");
      tremor = 4;
      particula({ tipo: "texto", x: j.x + j.w / 2, y: j.y - 70, vx: 0, vy: -0.6, g: 0, vida: 90, max: 90, texto: tr("Cipó-laço!"), cor: "#8ce99a", tam: 34 });
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * Math.PI * 2;
        particula({ tipo: "q", x: j.x + j.w / 2, y: j.y - 20, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, g: 0.05, vida: 30, max: 30, cor: k % 2 ? "#69db7c" : "#ffe066", tam: 6 });
      }
    }
    if (c.t > 140) {
      c.etapa = "banana"; c.t = 0;
      // a banana chega voando com o vento e para no ar na frente dele
      const lado = c.x > LARGURA / 2 ? -1 : 1;
      c.lado = lado;
      c.bx = limitar(j.x + j.w / 2 + lado * 330, 140, LARGURA - 140);
      c.by = CHAO - 130;
      b.x = c.bx - 24 + lado * 420;
      b.y = -60;
      som("vento");
      for (let k = 0; k < 4; k++) vento();
    }
  } else if (c.etapa === "banana") {
    j.dir = c.lado;
    j.cenaPose = c.t < 70 ? "parado" : "olhar2";
    b.t++;
    b.x += (c.bx - 24 - b.x) * 0.06;
    b.y += (c.by - 20 + Math.sin(b.t * 0.08) * 8 - b.y) * 0.06;
    b.rot = Math.sin(b.t * 0.06) * 0.3;
    brilhoBanana(b);
    if (c.t > 100) { c.etapa = "laca"; c.t = 0; som("laco"); }
  } else if (c.etapa === "laca") {
    // joga o cipó... quase pega!
    j.dir = c.lado;
    j.cenaPose = "laco";
    b.t++;
    b.y += (c.by - 20 + Math.sin(b.t * 0.08) * 8 - b.y) * 0.06;
    brilhoBanana(b);
    const m = lacoDaCena(j);
    const alvo = Math.abs(b.x + 24 - m.x) - 26;
    c.laco = Math.min(alvo, c.laco + 18);
    if (c.laco >= alvo) {
      c.etapa = "escapa"; c.t = 0;
      som("vento");
      tremor = 6;
      j.surpreso = 70;
      for (let k = 0; k < 6; k++) vento();
    }
  } else if (c.etapa === "escapa") {
    // a banana dá um pulo pra cima, escapa do laço e foge rodopiando
    j.cenaPose = c.t < 50 ? "dano" : "olhar" + (c.t % 30 < 15 ? "1" : "2");
    b.t++;
    b.x += c.lado * (3 + c.t * 0.35);
    b.y += -7 + c.t * 0.06;
    b.rot += 0.35;
    brilhoBanana(b);
    if (tempo % 3 === 0) vento();
    c.laco = Math.max(0, c.laco - 30);
    if (c.t > 110) { c.etapa = "tutorial"; c.t = 0; som("poder"); b.x = -500; }
  } else if (c.etapa === "tutorial") {
    j.cenaPose = "parado";
    j.dir = 1;
    if (c.t > 50 && (apertou || j.cenaCipoClique || c.t > 900)) {
      j.cenaCipoClique = false;
      j.cenaCipo = null;
      j.cenaPose = null;
      banana = { estado: "escapando", x: -400, y: -400, t: 0, rot: 0, vy: 0 };
      iniciarSaida();
    }
  }
}

// Cipó no chão, levantado e o laço sendo jogado (no espaço do mundo)
function desenharCenaCipoMundo() {
  const j = jogador;
  const c = j && j.cenaCipo;
  if (!c) return;
  if (c.etapa === "anda" || (c.etapa === "acha" && c.t < 40)) {
    // enrolado no chão, brilhando
    luzAditiva(c.x, CHAO - 14, 60, "120,230,120", 0.35 + Math.sin(tempo * 0.12) * 0.12);
    desenharIconeCipo(c.x, CHAO - 18, 18);
    if (tempo % 24 < 12) desenharEstrela4(c.x + 22, CHAO - 34, 5, "#ffffff");
  } else if (c.etapa === "acha") {
    // erguido acima da cabeça
    const y = j.y - 26 + Math.sin(tempo * 0.15) * 2;
    luzAditiva(j.x + j.w / 2, y, 70, "120,230,120", 0.45);
    desenharIconeCipo(j.x + j.w / 2, y, 20);
  }
  if ((c.etapa === "laca" || c.etapa === "escapa") && c.laco > 0) {
    const m = lacoDaCena(j);
    const px = m.x + c.lado * c.laco;
    const onda = c.etapa === "laca" ? Math.sin(tempo * 0.9) * 6 : 0;
    desenharCorda(m.x, m.y, px, m.y + onda, "#2b8a3e", "#69db7c");
    ctx.strokeStyle = "#2b8a3e";
    ctx.lineWidth = 5;
    ctx.strokeRect(Math.round(px) - 10, Math.round(m.y + onda) - 10, 20, 20);
  }
  if (c.etapa === "banana" && c.t > 60) balaoSinal(Math.round(j.x + j.w / 2) + 20, Math.round(j.y) - 40, "!");
}

// Tecla desenhada em pixel art
function teclaPixel(x, y, txt, apertada) {
  const w = Math.max(46, 18 + txt.length * 16), h = 46;
  const dy = apertada ? 4 : 0;
  ctx.fillStyle = "#0d0704";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 9);
  ctx.fillStyle = "#6b5a4a";
  ctx.fillRect(x, y + 6, w, h);
  ctx.fillStyle = "#f1e7d0";
  ctx.fillRect(x, y + dy, w, h - 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 4, y + dy + 4, w - 8, 4);
  ctx.fillStyle = "#cbbd9e";
  ctx.fillRect(x + 4, y + dy + h - 12, w - 8, 3);
  ctx.font = "bold 26px " + FONTE;
  ctx.textAlign = "center";
  ctx.fillStyle = "#2a1608";
  ctx.fillText(txt, x + w / 2, y + dy + 30);
  return w;
}

// Painel com a ilustração animada de como o cipó-laço funciona
function desenharCenaCipoPainel() {
  const j = jogador;
  const c = j && j.cenaCipo;
  if (!c || c.etapa !== "tutorial") return;
  const k = suavizar(Math.min(1, c.t / 20));
  ctx.fillStyle = "rgba(0,0,0," + (0.45 * k).toFixed(2) + ")";
  ctx.fillRect(0, 0, LARGURA, alturaTela);
  const W = 820, H = 470;
  const x0 = Math.round(LARGURA / 2 - W / 2), y0 = Math.round(ALTURA / 2 - H / 2 + (1 - k) * 40);
  ctx.globalAlpha = k;
  painelPixel(x0, y0, W, H, "#69db7c", "rgba(18,24,12,0.96)");
  ctx.textAlign = "center";
  ctx.font = "bold 34px " + FONTE;
  textoSombra(tr("Você ganhou o cipó-laço!"), LARGURA / 2, y0 + 50, ["#d3f9d8", "#69db7c"], 3);

  // ---- ilustração (loop de 220 passos) ----
  const ix = x0 + 40, iy = y0 + 76, iw = W - 80, ih = 200;
  ctx.fillStyle = "#0d0704";
  ctx.fillRect(ix - 4, iy - 4, iw + 8, ih + 8);
  ctx.save();
  ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
  const t = c.t % 220;
  const chao = iy + ih - 34;
  // a selva de fundo, encolhida para caber na moldura (o chão fica na linha de baixo)
  const esc = iw / LARGURA;
  ctx.save();
  ctx.translate(ix, chao - CHAO * esc);
  ctx.scale(esc, esc);
  desenharFundo(0, c.t * 0.5, c.t);
  desenharChaoCena(0, 0);
  ctx.restore();
  const mx = ix + 150;
  // fases: 0-30 parado; 30-60 laço indo; 60-100 puxando; 100-120 chute; 120-200 inimigo voando pro espaço
  const sprCobra = SPR_INIMIGO.cobra;
  const ini0 = ix + iw - 170;
  let ex = ini0, ey = chao - sprCobra.h, erot = 0, eesc = 1;
  let pose = "parado", comp = 0;
  const mao = { x: mx + 32, y: chao - 22 };
  if (t >= 30 && t < 60) { pose = "laco"; comp = (ini0 + sprCobra.w / 2 - mao.x) * ((t - 30) / 30); }
  else if (t >= 60 && t < 100) {
    pose = "laco";
    const u = (t - 60) / 40;
    ex = ini0 + (mx + 50 - ini0) * u;
    comp = ex + sprCobra.w / 2 - mao.x;
  } else if (t >= 100 && t < 120) { pose = t < 110 ? "chute" : "chute2"; ex = mx + 50; }
  else if (t >= 120) {
    pose = t < 140 ? "chute2" : "vitoria";
    const u = (t - 120) / 80;
    ex = mx + 50 + u * 380;
    ey = chao - sprCobra.h - u * 260;
    erot = u * 12;
    eesc = Math.max(0.2, 1 - u * 0.8);
    if (t > 190) desenharEstrela4(Math.round(ex + 20), Math.round(ey), 10, "#fff3bf");
  }
  if (comp > 0) {
    desenharCorda(mao.x, mao.y, mao.x + comp, mao.y, "#2b8a3e", "#69db7c");
    ctx.strokeStyle = "#2b8a3e";
    ctx.lineWidth = 5;
    ctx.strokeRect(Math.round(mao.x + comp) - 10, Math.round(mao.y) - 10, 20, 20);
  }
  ctx.save();
  ctx.translate(Math.round(ex + sprCobra.w / 2), Math.round(ey + sprCobra.h / 2));
  ctx.rotate(erot);
  ctx.scale(eesc, eesc);
  ctx.drawImage(sprCobra.e, -sprCobra.w / 2, -sprCobra.h / 2);
  ctx.restore();
  const spr = (SPRITES_PRIMATA[pose] || SPRITES_PRIMATA.parado).d;
  ctx.drawImage(spr, mx - 48, chao - 80);
  if (t >= 100 && t < 112) {
    ctx.font = "bold 30px " + FONTE;
    textoSombra("POW!", mx + 90, chao - 90, "#ffd43b", 2);
  }
  ctx.restore();

  // ---- teclas e explicação ----
  const teclas = (save.teclas.laco || []).filter(function(x) { return x; }).map(nomeDaTecla);
  if (!teclas.length) teclas.push(nomeComando("laco"));
  if (controleAtivo || toqueAtivo) { teclas.length = 0; teclas.push(nomeComando("laco")); }
  const apertada = t >= 26 && t < 40;
  let larguras = 0;
  teclas.forEach(function(tx) { larguras += Math.max(46, 18 + tx.length * 16) + 50; });
  let kx = Math.round(LARGURA / 2 - larguras / 2 + 25);
  const ky = iy + ih + 18;
  teclas.forEach(function(tx, i) {
    const w = teclaPixel(kx, ky, tx, apertada);
    kx += w + 50;
    if (i < teclas.length - 1) {
      ctx.font = "bold 20px " + FONTE;
      ctx.textAlign = "center";
      textoSombra(tr("ou"), kx - 25, ky + 30, "#dee2e6", 2);
    }
  });
  ctx.font = "bold 20px " + FONTE;
  ctx.textAlign = "center";
  textoSombra(tr("Joga o cipó: laça o inimigo, puxa e chuta ele pro espaço!"), LARGURA / 2, ky + 86, "#ffffff", 2);
  ctx.font = "bold 16px " + FONTE;
  textoSombra(tr("Também acerta os chefes. Recarrega rapidinho."), LARGURA / 2, ky + 112, "#c0eb75", 2);
  if (c.t > 50) {
    ctx.globalAlpha = k * (0.55 + Math.sin(c.t * 0.1) * 0.35);
    ctx.font = "bold 16px " + FONTE;
    textoSombra(tr("Aperte {0} para continuar", nomeComando("pulo")), LARGURA / 2, y0 + H - 14, "#dee2e6", 2);
  }
  ctx.globalAlpha = 1;
}
