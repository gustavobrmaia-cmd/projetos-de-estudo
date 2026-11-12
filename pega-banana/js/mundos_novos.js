"use strict";

// =========================
// MECÂNICAS DOS MUNDOS NOVOS
// Oceano: física debaixo d'água, ar (10 s parado), fontes de bolhas (a bolha só enche o ar: o
//         macaco abre a boca e engole; depois 3 s de recarga), correnteza, concha gigante, minas,
//         fumarolas e âncoras caindo.
// Montanhas Rochosas: rochas caindo, ponte de corda, tirolesa, corrente de ar e pêndulo.
// Deserto: cospe-areia.
// Também os comportamentos dos inimigos novos.
// =========================

// ---------- Física: água ----------

const AR_MAX = 600;              // 10 s parado (andando o ar dura o dobro)

function noMar() {
  return !!fase && fase.id === "oceano" && !fase.tutorial;
}

function gravidade() { return noMar() ? 0.36 : GRAV; }
function quedaMax() { return noMar() ? 6.5 : MAX_QUEDA; }
function velMaxima() { return noMar() ? 4.3 : VEL; }
function puloBase() { return noMar() ? -10.6 : PULO; }
// soltar o botão cedo corta o pulo neste valor
function corteDoPulo() { return noMar() ? -3.4 : -5; }

// Inimigos comuns perdem o macaco de vista quando ele está invisível
function alvoVisivel() {
  return !!jogador && !jogador.morto && !(buffs.invisivel > 0);
}


// ---------- Ar e bolhas (Oceano) ----------

function atualizarAr(j) {
  if (!noMar() || j.morto || j.saindo || j.cenaBanana || j.bolhaCena) return;
  if (mensagem && mensagem.congela) return;
  atualizarRespiracao(j);
  const parado = Math.abs(j.vx) < 0.6 && j.noChao;
  let gasto = parado ? 1 : 0.5;
  if (fase.ehChefe) gasto *= 0.6;
  j.ar = Math.max(0, j.ar - gasto);
  // bolhinhas saindo da boca de vez em quando (mais seguido quando o ar está acabando)
  const k = j.ar / AR_MAX;
  if (tempo % (k < 0.3 ? 14 : 50) === 0) {
    particula({ tipo: "q", x: j.x + j.w / 2 + j.dir * 18, y: j.y + 22, vx: j.dir * 0.3, vy: -1.6, g: -0.01, vida: 40, max: 40, cor: "#e3fafc", tam: 4 });
  }
  if (k < 0.3 && tempo % 40 === 0) som("alarmeAr");
  if (j.ar <= 0) {
    texto(j.x + j.w / 2, j.y - 20, tr("Sem ar!"), "#a5d8ff", 26);
    j.vidas = 0;
    perdeuVida();
    medir("damage", nomeNivel(), "air");
    morrer();
  }
}

function desenharArHud(j) {
  if (!noMar()) return;
  const k = limitar(j.ar / AR_MAX, 0, 1);
  const x = 20, y = 132, w = 166;
  const alerta = k < 0.3;
  painelPixel(x - 10, y - 6, w + 50, 28, alerta && tempo % 20 < 10 ? "#ff8787" : "#74c0fc");
  // ícone de bolha (apagado e enchendo de baixo pra cima durante a recarga de respirar)
  const rec = j.recargaAr > 0 ? j.recargaAr / RECARGA_AR : 0;
  ctx.globalAlpha = rec > 0 ? 0.35 : 1;
  ctx.drawImage(SPR_BOLHA, x - 2, y - 3, 22, 22);
  ctx.globalAlpha = 1;
  if (rec > 0) {
    const hh = Math.round(22 * (1 - rec));
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 2, y - 3 + 22 - hh, 22, hh); ctx.clip();
    ctx.drawImage(SPR_BOLHA, x - 2, y - 3, 22, 22);
    ctx.restore();
  }
  const bx = x + 26;
  ctx.fillStyle = "#0d0704";
  ctx.fillRect(bx - 2, y + 1, w - 26 + 4, 14);
  ctx.fillStyle = "#0b2a3a";
  ctx.fillRect(bx, y + 3, w - 26, 10);
  const f = Math.round((w - 26) * k);
  if (f > 0) {
    ctx.fillStyle = alerta ? "#ff6b6b" : "#3bc9db";
    ctx.fillRect(bx, y + 3, f, 10);
    ctx.fillStyle = alerta ? "#ffc9c9" : "#c5f6fa";
    ctx.fillRect(bx, y + 3, f, 3);
  }
  // marquinhas de bolha dentro da barra
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 1; i < 10; i++) ctx.fillRect(bx + Math.round((w - 26) * i / 10), y + 3, 1, 10);
}

// Fontes de bolhas: soltam uma bolha grande de tempos em tempos
function atualizarFontesAr() {
  if (!fase.ventosAr.length) return;
  if (!fase.bolhasAr) fase.bolhasAr = [];
  const j = jogador;
  for (let i = 0; i < fase.ventosAr.length; i++) {
    const v = fase.ventosAr[i];
    if (Math.abs(v.x - cameraX - LARGURA / 2) > LARGURA) continue;
    v.t++;
    if (tempo % 6 === 0) particula({ tipo: "q", x: v.x + (Math.random() - 0.5) * 14, y: CHAO - 10, vx: 0, vy: -1.2 - Math.random(), g: -0.01, vida: 50, max: 50, cor: "#c5f6fa", tam: 4 });
    if (v.t % 150 === 1) fase.bolhasAr.push({ x: v.x, y: CHAO - 30, t: 0, arena: !!v.arena });
  }
  for (let i = fase.bolhasAr.length - 1; i >= 0; i--) {
    const b = fase.bolhasAr[i];
    b.t++;
    b.y -= 1.1;
    const bx = b.x + Math.sin(b.t * 0.05) * 10;
    if (b.y < 30) {
      estourarBolha(bx, b.y);
      fase.bolhasAr.splice(i, 1);
      continue;
    }
    // só respira se a recarga de 3 s acabou (senão a bolha passa direto por ele)
    if (!j.morto && !j.saindo && !j.cenaBanana && !(j.recargaAr > 0) && Math.hypot(j.x + j.w / 2 - bx, j.y + j.h / 2 - b.y) < 46) {
      fase.bolhasAr.splice(i, 1);
      pegarBolhaAr(j, b, bx);
    }
  }
  // bolhas sendo "engolidas": encolhem indo para a boca do macaco
  if (fase.bolhasSugadas) {
    for (let i = fase.bolhasSugadas.length - 1; i >= 0; i--) {
      const s = fase.bolhasSugadas[i];
      s.t++;
      const boca = bocaDoMacaco(j);
      s.x += (boca.x - s.x) * 0.3;
      s.y += (boca.y - s.y) * 0.3;
      if (s.t >= 12) fase.bolhasSugadas.splice(i, 1);
    }
  }
}

// Onde fica a boca do macaco (para a bolha entrar nela)
function bocaDoMacaco(j) {
  return { x: j.x + j.w / 2 + j.dir * 6, y: j.y + j.h - 34 };
}

function estourarBolha(x, y) {
  som("bolhaPop");
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    particula({ tipo: "q", x: x, y: y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, g: 0, vida: 18, max: 18, cor: "#e3fafc", tam: 4 });
  }
}

// Bolha de ar (como no Minecraft): só enche o ar, não carrega o macaco.
// Ele abre a boca e "engole" a bolha; depois tem 3 s de recarga até poder respirar de novo
// (assim não fica preso num ciclo de bolhas).
const RECARGA_AR = 180;
const TEMPO_RESPIRAR = 34;
function pegarBolhaAr(j, b, bx) {
  j.ar = AR_MAX;
  j.recargaAr = RECARGA_AR;
  j.respirando = TEMPO_RESPIRAR;
  som("respira");
  texto(j.x + j.w / 2, j.y - 16, tr("Ar!"), "#c5f6fa", 22);
  if (!fase.bolhasSugadas) fase.bolhasSugadas = [];
  fase.bolhasSugadas.push({ x: bx === undefined ? b.x : bx, y: b.y, t: 0 });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    particula({ tipo: "q", x: (bx === undefined ? b.x : bx) + Math.cos(a) * 20, y: b.y + Math.sin(a) * 20, vx: -Math.cos(a) * 1.5, vy: -Math.sin(a) * 1.5, g: 0, vida: 14, max: 14, cor: "#e3fafc", tam: 4 });
  }
}

// Recarga do ar e a animação de respirar (roda todo passo, no Oceano)
function atualizarRespiracao(j) {
  if (j.recargaAr > 0) j.recargaAr--;
  if (j.respirando > 0) {
    j.respirando--;
    if (j.respirando % 6 === 0) {
      const boca = bocaDoMacaco(j);
      particula({ tipo: "q", x: boca.x + (Math.random() - 0.5) * 10, y: boca.y + 4, vx: (Math.random() - 0.5) * 0.6, vy: -0.6, g: -0.02, vida: 20, max: 20, cor: "#e3fafc", tam: 3 });
    }
  }
}

// A "cutscene" da bolha: sobe, estoura na superfície, o macaco olha em volta confuso e afunda de volta
function atualizarBolhaCena(j) {
  const c = j.bolhaCena;
  c.t++;
  j.invencivel = Math.max(j.invencivel, 20);
  if (c.etapa === "sobe") {
    j.vy = Math.max(-5, (j.vy || 0) - 0.25);
    j.y += j.vy;
    j.x += Math.sin(c.t * 0.1) * 0.6;
    if (tempo % 3 === 0) particula({ tipo: "q", x: j.x + j.w / 2 + (Math.random() - 0.5) * 50, y: j.y + j.h, vx: 0, vy: -1, g: 0, vida: 20, max: 20, cor: "#e3fafc", tam: 4 });
    if (j.y < 40) {
      j.y = 40;
      j.vy = 0;
      c.etapa = "boia";
      c.t = 0;
      estourarBolha(j.x + j.w / 2, j.y + j.h / 2);
      som("confuso");
    }
  } else if (c.etapa === "boia") {
    // boiando na superfície: olha pra um lado, pro outro...
    j.y = 40 + Math.sin(c.t * 0.12) * 3;
    const dur = c.longa ? 90 : 30;
    if (c.longa) j.dir = c.t < 30 ? 1 : c.t < 60 ? -1 : 1;
    if (c.t > dur) { c.etapa = "desce"; c.t = 0; j.dir = 1; }
  } else {
    // afunda devagar até o chão
    j.vy = Math.min(3.2, j.vy + 0.12);
    const antes = j.y;
    j.vx = 0;
    moverCorpo(j, true);
    if (j.y === antes && !j.noChao) j.y += j.vy;
    if (j.noChao) {
      j.bolhaCena = null;
      j.invencivel = 40;
      j.esticar = -0.6;
      poeira(j.x + j.w / 2, j.y + j.h, 5);
    } else if (j.y > ALTURA + 40) {
      // (não deve acontecer: as fontes ficam em chão firme) volta pro lugar seguro
      j.bolhaCena = null;
      voltarProSeguro(j);
    }
  }
}

function desenharBolhasAr() {
  const j = jogador;
  const recarga = j && j.recargaAr > 0;
  if (fase.bolhasAr) {
    for (let i = 0; i < fase.bolhasAr.length; i++) {
      const b = fase.bolhasAr[i];
      const bx = b.x + Math.sin(b.t * 0.05) * 10;
      // durante a recarga as bolhas ficam mais apagadas (ainda não dá para respirar)
      luzAditiva(bx, b.y, 44, "180,240,255", recarga ? 0.1 : 0.25);
      const s = 52 + Math.sin(b.t * 0.15) * 3;
      ctx.globalAlpha = recarga ? 0.55 : 1;
      ctx.drawImage(SPR_BOLHA_AR, Math.round(bx - s / 2), Math.round(b.y - s / 2), Math.round(s), Math.round(s));
      ctx.globalAlpha = 1;
    }
  }
  if (fase.bolhasSugadas) {
    for (let i = 0; i < fase.bolhasSugadas.length; i++) {
      const s = fase.bolhasSugadas[i];
      const tam = Math.max(6, 52 * (1 - s.t / 12));
      ctx.drawImage(SPR_BOLHA_AR, Math.round(s.x - tam / 2), Math.round(s.y - tam / 2), Math.round(tam), Math.round(tam));
    }
  }
}

function desenharFontesAr(cam) {
  for (let i = 0; i < fase.ventosAr.length; i++) {
    const v = fase.ventosAr[i];
    if (!visivel(v.x - 40, 80, cam)) continue;
    ctx.drawImage(SPR_FONTE_AR, Math.round(v.x - 36), CHAO - 22);
    luzAditiva(v.x, CHAO - 14, 34, "160,235,255", 0.2 + Math.sin(tempo * 0.1 + i) * 0.06);
  }
}

// Bolha em volta do macaco (subindo) e o "?" quando ele chega na superfície
function desenharBolhaCena() {
  const j = jogador;
  const c = j && j.bolhaCena;
  if (!c) return;
  const cx = j.x + j.w / 2, cy = j.y + j.h / 2;
  if (c.etapa === "sobe") {
    luzAditiva(cx, cy, 70, "180,240,255", 0.25);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(SPR_BOLHA_AR, Math.round(cx - 58), Math.round(cy - 58), 116, 116);
    ctx.globalAlpha = 1;
  } else if (c.etapa === "boia") {
    // marolinhas em volta e o balão de "?"
    ctx.fillStyle = "rgba(220,250,255,0.8)";
    for (let k = 0; k < 3; k++) {
      const r = 20 + ((c.t * 1.5 + k * 14) % 42);
      ctx.fillRect(Math.round(cx - r), Math.round(j.y + 28), Math.round(r * 2), 2);
    }
    const sobe = Math.min(1, c.t / 8);
    ctx.save();
    ctx.translate(Math.round(cx + 34), Math.round(j.y - 18 - sobe * 8));
    painelPixel(-18, -20, 36, 36, "#8a5a2b", "rgba(255,255,255,0.97)");
    ctx.font = "bold 26px " + FONTE;
    ctx.textAlign = "center";
    ctx.fillStyle = "#1c7ed6";
    ctx.fillText(c.t % 40 < 30 || !c.longa ? "?" : "??", 0, 8);
    ctx.restore();
  }
}


// ---------- Correnteza (Oceano) ----------

function correnteAtiva(c) { return c.t % 300 < 190; }

// Empurrão da correnteza no macaco (soma na velocidade a cada passo)
function aplicarCorrentes(j) {
  if (!fase.correntes.length || j.cipo) return;
  const cx = j.x + j.w / 2;
  for (let i = 0; i < fase.correntes.length; i++) {
    const c = fase.correntes[i];
    if (cx > c.x && cx < c.x + c.w && correnteAtiva(c)) {
      const empurra = c.dir * c.forca * (j.noChao ? 0.11 : 0.17);
      j.vx = limitar(j.vx + empurra, -7, 7);
    }
  }
}

function desenharCorrentes(cam) {
  for (let i = 0; i < fase.correntes.length; i++) {
    const c = fase.correntes[i];
    if (!visivel(c.x, c.w, cam)) continue;
    const ativa = correnteAtiva(c);
    const k = ativa ? Math.min(1, (c.t % 300) / 30) : Math.max(0, 1 - ((c.t % 300) - 190) / 30);
    if (k <= 0) continue;
    // faixas de água correndo e grãozinhos de areia levados
    ctx.globalAlpha = 0.35 * k;
    ctx.fillStyle = "#e3fafc";
    for (let n = 0; n < 9; n++) {
      const yy = CHAO - 20 - ((n * 53) % 300);
      const comp = 40 + (n % 3) * 24;
      const off = ((tempo * 6 * c.dir + n * 97) % c.w + c.w) % c.w;
      ctx.fillRect(Math.round(c.x + off), yy, comp, 2);
    }
    ctx.globalAlpha = 0.6 * k;
    ctx.fillStyle = "#d8c592";
    for (let n = 0; n < 6; n++) {
      const off = ((tempo * 4 * c.dir + n * 131) % c.w + c.w) % c.w;
      ctx.fillRect(Math.round(c.x + off), CHAO - 6 - (n % 3) * 8, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}


// ---------- Concha gigante (Oceano) ----------
// ciclo de 240: aberta (0-120), treme (120-150), FECHA (150-160), fechada (160-240)

function aberturaConcha(t) {
  if (t < 12) return t / 12;
  if (t < 150) return 1;
  if (t < 160) return 1 - (t - 150) / 10;
  if (t < 228) return 0;
  return 0;
}

function atualizarConchas() {
  const j = jogador;
  const cj = caixaJogador();
  for (let i = 0; i < fase.conchas.length; i++) {
    const c = fase.conchas[i];
    c.t = (c.t + 1) % 240;
    if (c.t === 150 && Math.abs(c.x - (j.x + j.w / 2)) < 500) som("conchaFecha");
    // fechando com o macaco dentro: morde!
    if (c.t >= 150 && c.t < 158 && !j.morto && encosta(cj, { x: c.x - 48, y: CHAO - 22 - 60, w: 96, h: 60 })) {
      machucar(c.x);
      j.vy = -9;
    }
    // pérola: dá para pegar enquanto está aberta
    if (c.perola && c.t > 10 && c.t < 150 && !j.morto && encosta(cj, { x: c.x - 12, y: CHAO - 22 - 22, w: 24, h: 22 })) {
      c.perola = false;
      ganharMoedas(5, c.x, CHAO - 80);
      ganharXp(XP.powerup * 2, c.x, CHAO - 100);
      j.brilho = 8;
      for (let k = 0; k < 10; k++) particula({ tipo: "q", x: c.x, y: CHAO - 34, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4, g: 0.1, vida: 24, max: 24, cor: "#ffffff", tam: 5 });
    }
  }
}

function desenharConchas(cam) {
  for (let i = 0; i < fase.conchas.length; i++) {
    const c = fase.conchas[i];
    if (!visivel(c.x - 60, 120, cam)) continue;
    const ab = aberturaConcha(c.t);
    const treme = c.t >= 120 && c.t < 150 ? (tempo % 4 < 2 ? -1 : 1) : 0;
    const base = CHAO - 22;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    sombraNoChao(c.x - 56, CHAO - 1, 112, 5);
    // pérola
    if (c.perola && ab > 0.2) {
      luzAditiva(c.x, base - 10, 26, "255,255,255", 0.35 * ab);
      ctx.drawImage(SPR_PEROLA, Math.round(c.x - 10), base - 20);
    }
    ctx.drawImage(SPR_CONCHA_BAIXO, Math.round(c.x - 56) + treme, base - 4);
    // metade de cima gira na dobradiça de trás (lado esquerdo)
    ctx.save();
    ctx.translate(Math.round(c.x - 54) + treme, base + 2);
    ctx.rotate(-ab * 0.95);
    ctx.drawImage(SPR_CONCHA_CIMA, -2, -42);
    ctx.restore();
  }
}


// ---------- Minas do mar (Oceano) ----------

function posMina(m) {
  return CHAO - m.alto + Math.sin(tempo * m.vel + m.fase) * m.amp;
}

function atualizarMinas() {
  const j = jogador;
  const cj = caixaJogador();
  for (let i = 0; i < fase.minas.length; i++) {
    const m = fase.minas[i];
    if (m.volta > 0) { m.volta--; continue; }
    const my = posMina(m);
    if (!j.morto && encosta(cj, { x: m.x - 20, y: my - 20, w: 40, h: 40 })) {
      explodirMina(m, my);
      machucar(m.x, false);
      if (!j.morto) { j.vx = (j.x + j.w / 2 < m.x ? -1 : 1) * 8; j.vy = -9; }
    }
  }
}

function explodirMina(m, my) {
  m.volta = 300;
  tremor = Math.max(tremor, 14);
  som("explosao");
  particula({ tipo: "anel", x: m.x, y: my, vx: 0, vy: 0, g: 0, vida: 24, max: 24, raio: 120 });
  for (let k = 0; k < 18; k++) {
    const a = Math.random() * Math.PI * 2;
    particula({ tipo: "q", x: m.x, y: my, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, g: 0, vida: 26, max: 26, cor: k % 3 ? "#e3fafc" : "#ff922b", tam: 7 });
  }
}

function desenharMinas(cam) {
  for (let i = 0; i < fase.minas.length; i++) {
    const m = fase.minas[i];
    if (!visivel(m.x - 30, 60, cam)) continue;
    // âncora no chão
    ctx.fillStyle = "#2f353c";
    ctx.fillRect(m.x - 10, CHAO - 8, 20, 8);
    ctx.fillStyle = "#4f5761";
    ctx.fillRect(m.x - 10, CHAO - 8, 20, 2);
    if (m.volta > 0) {
      // renascendo: cresce de novo no fim da espera
      if (m.volta > 60) continue;
      ctx.globalAlpha = 1 - m.volta / 60;
    }
    const my = posMina(m);
    // corrente em elos
    for (let y = my + 18; y < CHAO - 8; y += 8) {
      ctx.fillStyle = "#16191d";
      ctx.fillRect(m.x - 3, y, 6, 6);
      ctx.fillStyle = (Math.floor(y / 8) % 2) ? "#6c757d" : "#495057";
      ctx.fillRect(m.x - 2, y + 1, 4, 4);
    }
    const pisca = (tempo + i * 20) % 50 < 8;
    if (pisca) luzAditiva(m.x, my - 12, 24, "255,60,40", 0.55);
    ctx.drawImage(SPR_MINA, Math.round(m.x - 26), Math.round(my - 26));
    ctx.globalAlpha = 1;
  }
}


// ---------- Fumarolas (Oceano) ----------
// ciclo de 240: calma (0-150), avisa (150-190), jato quente (190-240)

function atualizarFumarolas() {
  const j = jogador;
  const cj = caixaJogador();
  for (let i = 0; i < fase.fumarolas.length; i++) {
    const f = fase.fumarolas[i];
    f.t = (f.t + 1) % 240;
    const perto = Math.abs(f.x - cameraX - LARGURA / 2) < LARGURA;
    if (perto && f.t >= 150 && f.t < 190 && tempo % 4 === 0) {
      particula({ tipo: "q", x: f.x + (Math.random() - 0.5) * 20, y: CHAO - 40, vx: 0, vy: -2, g: 0, vida: 20, max: 20, cor: "#ffa94d", tam: 4 });
    }
    if (f.t === 190 && perto) { som("fumarola"); tremor = Math.max(tremor, 4); }
    if (f.t >= 190) {
      if (perto && tempo % 2 === 0) {
        particula({ tipo: "q", x: f.x + (Math.random() - 0.5) * 36, y: CHAO - 40 - Math.random() * 40, vx: (Math.random() - 0.5) * 1.5, vy: -6 - Math.random() * 3, g: 0, vida: 50, max: 50, cor: Math.random() < 0.5 ? "#ffffff" : "#ffc9a8", tam: 6 + Math.floor(Math.random() * 4) });
      }
      if (!j.morto && encosta(cj, { x: f.x - 26, y: CHAO - 400, w: 52, h: 370 })) {
        machucar(f.x);
        if (!j.morto) j.vy = -9;
      }
    }
  }
}

function desenharFumarolas(cam) {
  for (let i = 0; i < fase.fumarolas.length; i++) {
    const f = fase.fumarolas[i];
    if (!visivel(f.x - 40, 80, cam)) continue;
    const avisa = f.t >= 150 && f.t < 190;
    const jato = f.t >= 190;
    if (avisa || jato) luzAditiva(f.x, CHAO - 40, jato ? 70 : 40, "255,140,60", jato ? 0.45 : 0.25 + (tempo % 8 < 4 ? 0.1 : 0));
    if (jato) {
      // coluna de água fervendo (bolhas e vapor)
      const k = Math.min(1, (f.t - 190) / 6) * Math.min(1, (240 - f.t) / 8);
      const alt = 370 * k;
      ctx.globalAlpha = 0.55 * k;
      preencherDegrade(degradeVertical("jatoQuente", 64, [[0, "rgba(255,240,230,0)"], [0.4, "rgba(255,210,180,0.6)"], [1, "rgba(255,160,90,0.9)"]]), f.x - 24, CHAO - 40 - alt, 48, alt);
      ctx.globalAlpha = 1;
    }
    const tx = avisa ? (tempo % 4 < 2 ? -1 : 1) : 0;
    ctx.drawImage(SPR_FUMAROLA, Math.round(f.x - 32) + tx, CHAO - 44);
  }
}


// ---------- Âncoras (Oceano) ----------

// Antes as âncoras miravam na frente do macaco, mas caíam tão devagar (45 passos de aviso invisível +
// queda lenta) que sempre cravavam atrás dele, e apareciam "do nada" no topo da tela.
// Agora: a âncora desce à vista até o topo da tela e balança (aviso), a sombra cresce no chão onde
// ela vai cair, e aí despenca rápido. Mira onde o macaco vai estar quando ela chegar.
const ANCORA_AVISO = 50;      // passos pendurada lá em cima antes de soltar
const ANCORA_TOPO = 74;       // altura (y) onde ela fica pendurada avisando (abaixo do HUD de cima)
function atualizarAncoras() {
  const j = jogador;
  const cj = caixaJogador();
  if (!fase.ancoras) fase.ancoras = [];
  const cena = j.morto || j.saindo || j.cenaBanana || (mensagem && mensagem.congela);
  for (let i = 0; i < fase.zonasAncora.length; i++) {
    const z = fase.zonasAncora[i];
    const cx = j.x + j.w / 2;
    if (cena || cx < z.x || cx > z.x + z.w) continue;
    if (++z.t >= z.intervalo && fase.ancoras.length < 3) {
      z.t = 0;
      // onde o macaco vai estar quando ela chegar (aviso + ~30 passos de queda), com um pouco de sorte
      const prevista = cx + j.vx * (ANCORA_AVISO + 30) * 0.7;
      const ax = limitar(prevista + (Math.random() - 0.5) * 120, z.x + 30, z.x + z.w - 30);
      fase.ancoras.push({ x: ax, y: -90, vy: 0, estado: "aviso", t: 0 });
      som("corrente");
    }
  }
  for (let i = fase.ancoras.length - 1; i >= 0; i--) {
    const a = fase.ancoras[i];
    a.t++;
    if (a.estado === "aviso") {
      // desce devagar até ficar à vista e treme antes de soltar
      a.y += (ANCORA_TOPO - a.y) * 0.12;
      if (a.t > ANCORA_AVISO) { a.estado = "cai"; a.t = 0; a.vy = 4; }
    } else if (a.estado === "cai") {
      a.vy = Math.min(a.vy + 0.9, 17);
      a.y += a.vy;
      if (!j.morto && encosta(cj, { x: a.x - 18, y: a.y + 10, w: 36, h: 48 })) machucar(a.x);
      if (a.y + 60 >= CHAO) {
        a.y = CHAO - 60;
        a.estado = "cravada";
        a.t = 0;
        tremor = Math.max(tremor, 6);
        som("pancada");
        for (let k = 0; k < 12; k++) particula({ tipo: "q", x: a.x + (Math.random() - 0.5) * 50, y: CHAO - 4, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 3.5, g: 0.1, vida: 26, max: 26, cor: "#d8c592", tam: 6 });
        for (let k = 0; k < 6; k++) particula({ tipo: "bolha", x: a.x + (Math.random() - 0.5) * 40, y: CHAO - 20, vx: (Math.random() - 0.5) * 1.5, vy: -1.5 - Math.random() * 1.5, g: -0.01, vida: 40, max: 40, tam: 6 + Math.random() * 8 });
      }
    } else if (a.estado === "cravada") {
      if (a.t > 60) { a.estado = "sobe"; a.t = 0; }
    } else {
      a.y -= 5;
      if (a.y < -130) { fase.ancoras.splice(i, 1); continue; }
    }
    // longe da tela: some (não fica acumulando)
    if (Math.abs(a.x - (cameraX + larguraVista() / 2)) > LARGURA * 1.5) fase.ancoras.splice(i, 1);
  }
}

function desenharAncoras(cam) {
  if (!fase.ancoras) return;
  for (let i = 0; i < fase.ancoras.length; i++) {
    const a = fase.ancoras[i];
    if (!visivel(a.x - 30, 60, cam)) continue;
    if (a.estado === "aviso" || a.estado === "cai") {
      // sombra crescendo no chão onde ela vai cravar + faixa vermelha piscando
      const k = a.estado === "aviso" ? Math.min(1, a.t / ANCORA_AVISO) : 1;
      const w = Math.round(16 + k * 34);
      ctx.fillStyle = "rgba(0,20,40," + (0.2 + k * 0.35).toFixed(2) + ")";
      ctx.fillRect(Math.round(a.x - w / 2), CHAO - 6, w, 6);
      if (tempo % 10 < 5 || a.estado === "cai") {
        ctx.fillStyle = "#e03131";
        ctx.fillRect(Math.round(a.x - w / 2 + 4), CHAO - 4, w - 8, 4);
      }
    }
    // corrente subindo até lá em cima
    for (let y = Math.round(a.y) - 4; y > -10; y -= 8) {
      ctx.fillStyle = "#16191d";
      ctx.fillRect(Math.round(a.x - 3), y - 6, 6, 7);
      ctx.fillStyle = "#5f6873";
      ctx.fillRect(Math.round(a.x - 2), y - 5, 4, 5);
    }
    // tremendo pouco antes de soltar
    const treme = a.estado === "aviso" && a.t > ANCORA_AVISO - 18 ? (tempo % 4 < 2 ? -2 : 2) : 0;
    ctx.drawImage(SPR_ANCORA, Math.round(a.x - 24) + treme, Math.round(a.y));
    if (a.estado === "aviso" && a.t > 10) {
      // "!" em cima avisando
      ctx.font = "bold 22px " + FONTE;
      ctx.textAlign = "center";
      textoSombra("!", Math.round(a.x) + 26, Math.round(a.y) + 30, "#ff6b6b", 2);
    }
  }
}


// ---------- Rochas caindo (Montanhas) ----------

function atualizarRochasCaindo() {
  const j = jogador;
  const cj = caixaJogador();
  if (!fase.rochas) fase.rochas = [];
  for (let i = 0; i < fase.zonasRocha.length; i++) {
    const z = fase.zonasRocha[i];
    if (Math.abs(z.x - cameraX - LARGURA / 2) > LARGURA) continue;
    z.t = (z.t + 1) % z.periodo;
    // pedrinhas caindo avisam antes da rocha grande
    if (z.t > z.periodo - 60 && tempo % 5 === 0) {
      particula({ tipo: "q", x: z.x + (Math.random() - 0.5) * 30, y: -10, vx: 0, vy: 3 + Math.random() * 2, g: 0.2, vida: 70, max: 70, cor: "#8a7a70", tam: 4 });
    }
    if (z.t === z.periodo - 1) fase.rochas.push({ x: z.x, y: -70, vy: 2, rot: 0 });
  }
  for (let i = fase.rochas.length - 1; i >= 0; i--) {
    const r = fase.rochas[i];
    r.vy = Math.min(r.vy + 0.55, 14);
    r.y += r.vy;
    r.rot += 0.12;
    if (!j.morto && encosta(cj, { x: r.x - 26, y: r.y - 26, w: 52, h: 52 })) {
      machucar(r.x);
      quebrarRocha(r);
      fase.rochas.splice(i, 1);
      continue;
    }
    if (r.y + 28 >= CHAO && temChao(r.x, CHAO + 2)) {
      quebrarRocha(r);
      fase.rochas.splice(i, 1);
    } else if (r.y > ALTURA + 60) {
      fase.rochas.splice(i, 1);
    }
  }
}

function quebrarRocha(r) {
  som("rochaQuebra");
  tremor = Math.max(tremor, 5);
  for (let k = 0; k < 14; k++) {
    particula({ tipo: "q", x: r.x + (Math.random() - 0.5) * 30, y: Math.min(r.y, CHAO - 10), vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6, g: 0.3, vida: 30, max: 30, cor: k % 2 ? "#8c8a8e" : "#5f5d63", tam: 6 + (k % 3) * 2 });
  }
}

function desenharRochasCaindo(cam) {
  for (let i = 0; i < fase.zonasRocha.length; i++) {
    const z = fase.zonasRocha[i];
    if (!visivel(z.x - 40, 80, cam)) continue;
    // marca no chão onde as rochas sempre caem (pedrinhas quebradas) e sombra crescendo
    ctx.fillStyle = "#5f5d63";
    ctx.fillRect(z.x - 22, CHAO - 4, 6, 4); ctx.fillRect(z.x + 10, CHAO - 3, 8, 3); ctx.fillRect(z.x - 4, CHAO - 2, 5, 2);
    const k = z.t > z.periodo - 60 ? (z.t - (z.periodo - 60)) / 60 : 0;
    if (k > 0) {
      ctx.fillStyle = "rgba(0,0,0," + (0.15 + k * 0.35).toFixed(2) + ")";
      const w = Math.round(20 + k * 36);
      ctx.fillRect(Math.round(z.x - w / 2), CHAO - 3, w, 5);
    }
  }
  if (!fase.rochas) return;
  for (let i = 0; i < fase.rochas.length; i++) {
    const r = fase.rochas[i];
    ctx.save();
    ctx.translate(Math.round(r.x), Math.round(r.y));
    ctx.rotate(r.rot);
    ctx.drawImage(SPR_PROJ.pedra, -28, -28, 56, 56);
    ctx.restore();
  }
}


// ---------- Ponte de corda (Montanhas) ----------
// As tábuas afundam com o peso do macaco (mais perto dele, mais fundo)

function sagPonte(p) {
  const ponte = p.ponte;
  const u = (p.i + 0.5) / p.n;
  let s = Math.sin(Math.PI * u) * 12;
  const j = jogador;
  if (j && j.chao && j.chao.ponte === ponte) {
    const uj = limitar((j.x + j.w / 2 - ponte.x) / ponte.w, 0, 1);
    const peso = Math.sin(Math.PI * uj) * 22;
    s += Math.max(0, peso * (1 - Math.abs(u - uj) * 2.2));
  }
  return s;
}

function desenharPontes(cam) {
  for (let i = 0; i < fase.pontes.length; i++) {
    const pt = fase.pontes[i];
    if (!visivel(pt.x - 20, pt.w + 40, cam)) continue;
    const y0 = CHAO - 6;
    // postes nas duas pontas
    ctx.drawImage(SPR_POSTE, pt.x - 14, CHAO - 76);
    ctx.drawImage(SPR_POSTE, pt.x + pt.w - 2, CHAO - 76);
    // cordas de cima (corrimão) acompanhando as tábuas
    const pts = pt.tabuas.map(function(p) { return [p.x + p.w / 2, p.caiu ? y0 + 12 : p.y]; });
    const corda = function(dy, cor, esp) {
      ctx.fillStyle = cor;
      let ax = pt.x - 6, ay = CHAO - 64;
      for (let k = 0; k <= pts.length; k++) {
        const bx = k < pts.length ? pts[k][0] : pt.x + pt.w + 6;
        const by = k < pts.length ? pts[k][1] + dy : CHAO - 64;
        const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 3));
        for (let s = 0; s < n; s++) ctx.fillRect(Math.round(ax + (bx - ax) * s / n), Math.round(ay + (by - ay) * s / n), 3, esp);
        ax = bx; ay = by;
      }
    };
    corda(-44, "#5a4020", 4);
    corda(-44, "#c2a76a", 2);
    // fios verticais ligando o corrimão às tábuas
    ctx.fillStyle = "#a88c56";
    pts.forEach(function(q, k) { if (k % 2 === 0) ctx.fillRect(Math.round(q[0]), Math.round(q[1] - 42), 2, 40); });
    // tábuas (as que caíram vão sumindo lá embaixo)
    pt.tabuas.forEach(function(p) {
      if (p.y > ALTURA) return;
      const tx = p.tremendo > 0 && !p.caiu ? Math.round((Math.random() - 0.5) * 3) : 0;
      ctx.drawImage(p.podre ? SPR_TABUA_PODRE : SPR_TABUA, Math.round(p.x) - 1 + tx, Math.round(p.y) - 2);
    });
    // cordas de baixo segurando as tábuas
    corda(4, "#5a4020", 3);
  }
}


// ---------- Tirolesa (Montanhas) ----------

function agarrarTirolesa(j) {
  if (j.noChao || j.tirolesa || j.cipo || j.soltouCipo > 0 || j.dash > 0) return false;
  const hx = j.x + j.w / 2, hy = j.y + 4;
  for (let i = 0; i < fase.tirolesas.length; i++) {
    const t = fase.tirolesas[i];
    if (hx < t.x1 - 10 || hx > t.x2 - 80) continue;
    const k = (hx - t.x1) / (t.x2 - t.x1);
    const ly = t.y1 + (t.y2 - t.y1) * k;
    if (hy > ly - 24 && hy < ly + 30) {
      j.tirolesa = t;
      j.tirK = limitar(k, 0, 1);
      j.tirVel = Math.max(3, Math.abs(j.vx));
      j.vx = 0; j.vy = 0;
      j.bufferPulo = 0;
      if (j.deslizando) { j.deslizando = false; j.h = 72; }
      som("agarrou");
      return true;
    }
  }
  return false;
}

function deslizarTirolesa(j) {
  const t = j.tirolesa;
  const L = Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
  const sen = (t.y2 - t.y1) / L;
  j.tirVel = Math.min(12, j.tirVel + 0.55 * sen + 0.02);
  j.tirK += j.tirVel / L;
  const hx = t.x1 + (t.x2 - t.x1) * j.tirK, hy = t.y1 + (t.y2 - t.y1) * j.tirK;
  j.x = hx - j.w / 2;
  j.y = hy + 10;
  j.dir = 1;
  if (tempo % 2 === 0) particula({ tipo: "q", x: hx, y: hy, vx: -2, vy: -0.5 + Math.random(), g: 0.1, vida: 12, max: 12, cor: Math.random() < 0.5 ? "#ffd43b" : "#ffffff", tam: 3 });
  if (tempo % 10 === 0) som("tirolesa");
  const fim = j.tirK >= 1 || hx >= t.x2 - 40;
  if (j.bufferPulo > 0 || fim) {
    const ang = Math.atan2(t.y2 - t.y1, t.x2 - t.x1);
    j.vx = Math.cos(ang) * j.tirVel * 0.8;
    j.vy = fim ? -4 : -8;
    j.tirolesa = null;
    j.soltouCipo = 20;
    j.bufferPulo = 0;
    j.pulouNormal = false;
    j.esticar = 1;
    som("pulo");
  }
}

function desenharTirolesas(cam) {
  for (let i = 0; i < fase.tirolesas.length; i++) {
    const t = fase.tirolesas[i];
    if (!visivel(t.x1 - 20, t.x2 - t.x1 + 40, cam)) continue;
    // postes
    ctx.drawImage(SPR_POSTE, t.x1 - 8, t.y1 - 6, 16, 80);
    ctx.drawImage(SPR_POSTE, t.x2 - 8, t.y2 - 6, 16, CHAO - t.y2 + 6);
    // cabo de aço
    const n = Math.round(Math.hypot(t.x2 - t.x1, t.y2 - t.y1) / 3);
    ctx.fillStyle = "#2a2e33";
    for (let s = 0; s <= n; s++) ctx.fillRect(Math.round(t.x1 + (t.x2 - t.x1) * s / n), Math.round(t.y1 + (t.y2 - t.y1) * s / n) - 1, 3, 3);
    ctx.fillStyle = "#adb5bd";
    for (let s = 0; s <= n; s += 2) ctx.fillRect(Math.round(t.x1 + (t.x2 - t.x1) * s / n), Math.round(t.y1 + (t.y2 - t.y1) * s / n) - 1, 3, 1);
    // roldana: com o macaco, vai junto; sem ele, espera no começo
    const j = jogador;
    const k = j && j.tirolesa === t ? j.tirK : 0.03;
    const hx = t.x1 + (t.x2 - t.x1) * k, hy = t.y1 + (t.y2 - t.y1) * k;
    ctx.drawImage(SPR_ROLDANA, Math.round(hx - 14), Math.round(hy - 6));
  }
}


// ---------- Corrente de ar (Montanhas) ----------

function subidaForte(s) { return s.t % 280 < 210; }

function aplicarSubidas(j) {
  const cj = caixaJogador();
  for (let i = 0; i < fase.subidas.length; i++) {
    const s = fase.subidas[i];
    if (cj.x + cj.w > s.x && cj.x < s.x + s.w && cj.y + cj.h > s.topo) {
      if (subidaForte(s)) j.vy = Math.max(j.vy - 1.25, -7.5);
      else j.vy = Math.min(j.vy, 2.4);
      j.pulouNormal = false;
      j.coyote = 0;
    }
  }
}

function atualizarSubidas() {
  for (let i = 0; i < fase.subidas.length; i++) {
    const s = fase.subidas[i];
    s.t++;
    if (Math.abs(s.x - cameraX - LARGURA / 2) < LARGURA && tempo % (subidaForte(s) ? 3 : 9) === 0) {
      particula({ tipo: "q", x: s.x + Math.random() * s.w, y: ALTURA, vx: (Math.random() - 0.5), vy: -7 - Math.random() * 3, g: 0, vida: 70, max: 70,
        cor: Math.random() < 0.7 ? "#ffffff" : "#c08552", tam: Math.random() < 0.7 ? 3 : 5 });
    }
  }
}

function desenharSubidas(cam) {
  for (let i = 0; i < fase.subidas.length; i++) {
    const s = fase.subidas[i];
    if (!visivel(s.x, s.w, cam)) continue;
    const forte = subidaForte(s);
    ctx.globalAlpha = forte ? 0.32 : 0.12;
    ctx.fillStyle = "#ffffff";
    for (let n = 0; n < 10; n++) {
      const x = s.x + ((n * 37) % s.w);
      const comp = 50 + (n % 4) * 30;
      const y = ALTURA - ((tempo * (forte ? 7 : 2) + n * 71) % (ALTURA - s.topo + comp));
      ctx.fillRect(Math.round(x + Math.sin((y + n) * 0.03) * 6), Math.round(y), 2, comp);
    }
    ctx.globalAlpha = 1;
  }
}


// ---------- Pêndulo de pedra (Montanhas) ----------

function posPendulo(p) {
  const a = Math.sin(tempo * p.vel + p.fase) * p.amp;
  return { x: p.x + Math.sin(a) * p.comp, y: p.y + Math.cos(a) * p.comp, a: a };
}

function atualizarPendulos() {
  const j = jogador;
  const cj = caixaJogador();
  for (let i = 0; i < fase.pendulos.length; i++) {
    const p = fase.pendulos[i];
    const q = posPendulo(p);
    if (Math.abs(p.x - cameraX - LARGURA / 2) < LARGURA && Math.abs(q.a) < 0.04 && (tempo % 3 === 0)) som("pendulo");
    if (!j.morto && encosta(cj, { x: q.x - 26, y: q.y - 26, w: 52, h: 52 })) {
      machucar(q.x);
      if (!j.morto) { j.vx = (j.x + j.w / 2 < q.x ? -1 : 1) * 9; j.vy = -8; }
    }
  }
}

function desenharPendulos(cam) {
  for (let i = 0; i < fase.pendulos.length; i++) {
    const p = fase.pendulos[i];
    if (!visivel(p.x - 360, 720, cam)) continue;
    const q = posPendulo(p);
    // corrente em elos
    const n = Math.round(p.comp / 9);
    for (let s = 1; s < n; s++) {
      const x = p.x + (q.x - p.x) * s / n, y = p.y + (q.y - p.y) * s / n;
      ctx.fillStyle = "#16191d";
      ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 7, 7);
      ctx.fillStyle = s % 2 ? "#868e96" : "#5f6873";
      ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 5, 5);
    }
    ctx.save();
    ctx.translate(Math.round(q.x), Math.round(q.y));
    ctx.rotate(q.a * 1.5);
    ctx.drawImage(SPR_PROJ.pedra, -32, -32, 64, 64);
    ctx.restore();
    // argola presa na viga
    ctx.fillStyle = "#2a2e33";
    ctx.fillRect(p.x - 6, p.y - 4, 12, 8);
  }
}


// ---------- Cospe-areia (Deserto) ----------

// Antes: imortal, cuspia a cada 1,5 s e as bolas voavam rápido demais.
// Agora: recarrega em ~3,3 s, avisa antes (incha e solta grãos), a bola é lenta e faz um arco alto,
// e dá para destruir o montinho: pisando em cima, com o dash, com o laço de cipó ou com a nuke.
const RECARGA_COSPE = 200;
const AVISO_COSPE = 40;

function caixaCospe(c) { return { x: c.x - 34, y: CHAO - 44, w: 68, h: 44 }; }

function destruirCospe(c, como) {
  if (c.morto) return;
  c.morto = 1;
  som("rochaQuebra");
  tremor = Math.max(tremor, 5);
  ganharXp(XP.inimigo, c.x, CHAO - 80);
  ganharMoedas(2, c.x, CHAO - 60);
  for (let k = 0; k < 22; k++) {
    particula({ tipo: "q", x: c.x + (Math.random() - 0.5) * 60, y: CHAO - 10 - Math.random() * 30, vx: (Math.random() - 0.5) * 6, vy: -1 - Math.random() * 5,
      g: 0.25, vida: 30 + Math.floor(Math.random() * 20), max: 50, cor: k % 3 ? "#e8bd6a" : "#b8862e", tam: 5 + (k % 3) * 2 });
  }
  if (como === "pisao") texto(c.x, CHAO - 90, tr("Esmagado!"), "#ffe066", 20);
}

function atualizarCospeAreias() {
  const j = jogador;
  const cj = caixaJogador();
  for (let i = 0; i < fase.cospeAreias.length; i++) {
    const c = fase.cospeAreias[i];
    if (c.morto) { c.morto++; continue; }
    const dx = j.x + j.w / 2 - c.x;
    if (c.abre > 0) c.abre--;
    // pisão: caindo em cima do montinho
    if (!j.morto && j.vy > 1 && j.y + j.h <= CHAO - 18 + j.vy + 2 && encosta(cj, caixaCospe(c))) {
      destruirCospe(c, "pisao");
      j.vy = noMar() ? -8 : -11;
      j.pulouNormal = false;
      j.esticar = 1;
      som("pisao");
      continue;
    }
    // dash atravessando
    if (!j.morto && j.dash > 0 && encosta(cj, caixaCospe(c))) { destruirCospe(c, "dash"); continue; }
    if (Math.abs(dx) > 620 || j.morto) { c.t = Math.min(c.t, RECARGA_COSPE - AVISO_COSPE - 1); continue; }
    c.t++;
    // aviso: incha e solta grãozinhos antes de cuspir
    c.aviso = c.t > RECARGA_COSPE - AVISO_COSPE;
    if (c.aviso && tempo % 5 === 0) particula({ tipo: "q", x: c.x + (Math.random() - 0.5) * 30, y: CHAO - 44, vx: 0, vy: -1.2, g: 0.08, vida: 16, max: 16, cor: "#f2d28b", tam: 4 });
    if (c.t >= RECARGA_COSPE) {
      c.t = 0;
      c.abre = 18;
      const voo = 80;     // bola mais lenta, num arco alto (dá tempo de ver e pular/desviar)
      projeteis.push({ tipo: "areia", x: c.x - 12, y: CHAO - 46, w: 24, h: 24,
        vx: limitar(dx / voo, -4.2, 4.2), vy: -7.5, g: 0.19, vida: 260, quebraNoChao: true });
      if (Math.abs(dx) < 700) som("cospe");
      for (let k = 0; k < 6; k++) particula({ tipo: "q", x: c.x, y: CHAO - 34, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3, g: 0.15, vida: 20, max: 20, cor: "#e8bd6a", tam: 5 });
    }
  }
}

function desenharCospeAreias(cam) {
  for (let i = 0; i < fase.cospeAreias.length; i++) {
    const c = fase.cospeAreias[i];
    if (!visivel(c.x - 40, 80, cam)) continue;
    if (c.morto) {
      // montinho desmanchado: vira um morrinho baixo de areia
      const k = Math.max(0.25, 1 - c.morto / 20);
      ctx.drawImage(SPR_COSPE[0], Math.round(c.x - 40), Math.round(CHAO - 44 * k), 80, Math.round(44 * k));
      continue;
    }
    // fica de olho fechado longe, abre os olhos perto, incha avisando e escancara a boca ao cuspir
    const perto = Math.abs(jogador.x - c.x) < 620;
    const q = c.abre > 0 || c.aviso ? 2 : perto ? 1 : 0;
    let inc = c.abre > 0 ? Math.sin((18 - c.abre) / 18 * Math.PI) * 4 : 0;
    let tx = 0;
    if (c.aviso) { inc = 3 + Math.sin(tempo * 0.6) * 2; tx = tempo % 4 < 2 ? -1 : 1; }
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    sombraNoChao(c.x - 38, CHAO - 1, 76, 4);
    ctx.drawImage(SPR_COSPE[q], Math.round(c.x - 40) + tx, Math.round(CHAO - 44 - inc), 80, Math.round(44 + inc));
  }
}


// ---------- Atualiza e desenha tudo dos mundos novos ----------

function atualizarMundosNovos() {
  const j = jogador;
  vozesInimigos();
  if (fase.cospeAreias.length) atualizarCospeAreias();
  if (fase.ventosAr.length || fase.bolhasAr) atualizarFontesAr();
  if (fase.correntes.length) for (let i = 0; i < fase.correntes.length; i++) fase.correntes[i].t++;
  if (fase.conchas.length) atualizarConchas();
  if (fase.minas.length) atualizarMinas();
  if (fase.fumarolas.length) atualizarFumarolas();
  if (fase.zonasAncora.length || fase.ancoras) atualizarAncoras();
  if (fase.zonasRocha.length || fase.rochas) atualizarRochasCaindo();
  if (fase.subidas.length) atualizarSubidas();
  if (fase.pendulos.length) atualizarPendulos();
  atualizarAr(j);
}

// Atrás do macaco e dos inimigos (no chão)
function desenharMundoAtras(cam) {
  if (fase.correntes.length) desenharCorrentes(cam);
  if (fase.ventosAr.length) desenharFontesAr(cam);
  if (fase.tirolesas.length) desenharTirolesas(cam);
  if (fase.pontes.length) desenharPontes(cam);
  if (fase.conchas.length) desenharConchas(cam);
  if (fase.fumarolas.length) desenharFumarolas(cam);
  if (fase.minas.length) desenharMinas(cam);
  if (fase.cospeAreias.length) desenharCospeAreias(cam);
  if (fase.pendulos.length) desenharPendulos(cam);
  if (fase.subidas.length) desenharSubidas(cam);
}

// Na frente (coisas caindo, bolhas)
function desenharMundoFrente(cam) {
  if (fase.ancoras) desenharAncoras(cam);
  if (fase.zonasRocha.length || fase.rochas) desenharRochasCaindo(cam);
  if (fase.bolhasAr) desenharBolhasAr();
  desenharBolhaCena();
}


// ---------- Inimigos novos: comportamentos ----------

COMPORTAMENTO.aguaViva = function(e) {
  // pulsa: contrai e sobe, abre e desce devagar; vai e volta de leve
  e.timer++;
  const ciclo = (e.timer + e.animOffAgua) % 120;
  if (e.animOffAgua === undefined) e.animOffAgua = Math.floor(Math.random() * 120);
  e.k = ciclo < 20 ? 2 : ciclo < 30 ? 1 : ciclo < 100 ? 0 : 3;
  e.vy = ciclo < 24 ? -2.2 : Math.min(0.8, e.vy + 0.06);
  e.y += e.vy;
  e.y = limitar(e.y, e.y0 - e.t.amplitude, e.y0 + e.t.amplitude);
  e.x = e.x0 + Math.sin(e.timer * 0.012) * 40;
  e.dir = Math.cos(e.timer * 0.012) > 0 ? 1 : -1;
};

COMPORTAMENTO.baiacu = function(e) {
  // nada de um lado pro outro; se o macaco chega perto, infla e vira bola de espinhos
  const j = jogador;
  e.timer++;
  if (e.inflado === undefined) { e.inflado = 0; e.cheio = 0; }
  const perto = Math.abs(j.x + j.w / 2 - (e.x + e.w / 2)) < 170 && Math.abs(j.y - e.y) < 150 && alvoVisivel();
  if (perto && e.cheio <= 0 && e.recarga <= 0) { e.cheio = 110; som("baiacu"); }
  if (e.recarga > 0) e.recarga--;
  if (e.cheio > 0) {
    e.cheio--;
    e.inflado = Math.min(1, e.inflado + 0.12);
    if (e.cheio === 0) e.recarga = 60;
  } else {
    e.inflado = Math.max(0, e.inflado - 0.06);
    e.x += e.dir * e.vel * 0.8;
    if (Math.abs(e.x - e.x0) > 110) e.dir = e.x > e.x0 ? -1 : 1;
  }
  e.y = e.y0 + Math.sin(e.timer * 0.05) * 6;
  e.espinhosoAgora = e.inflado > 0.6;
  // caixa de colisão: pequena nadando, grande inflado
  const r = 13 + e.inflado * 9;
  e.caixa = { x: e.x + e.w / 2 - r, y: e.y + e.h / 2 - r, w: r * 2, h: r * 2 };
};

COMPORTAMENTO.investidaNado = function(e) {
  // fica boiando; se vê o macaco na mesma altura, arma e dispara em linha reta
  const j = jogador;
  e.timer--;
  const dx = j.x + j.w / 2 - (e.x + e.w / 2);
  const dy = (j.y + j.h / 2) - (e.y + e.h / 2);
  if (e.estado === "normal") {
    e.x += e.dir * e.vel;
    if (Math.abs(e.x - e.x0) > 90) e.dir = e.x > e.x0 ? -1 : 1;
    e.y = e.y0 + Math.sin(tempo * 0.04 + e.ang) * 5;
    if (Math.abs(dx) < 430 && Math.abs(dy) < 90 && e.timer <= 0 && alvoVisivel()) {
      e.estado = "preparar";
      e.timer = 32;
      e.dir = dx > 0 ? 1 : -1;
      som("espada");
    }
  } else if (e.estado === "preparar") {
    if (e.timer <= 0) { e.estado = "deslizar"; e.timer = 70; }
  } else if (e.estado === "deslizar") {
    e.x += e.dir * e.t.velInvestida * (1 + fase.dificuldade * 0.25);
    if (tempo % 2 === 0) particula({ tipo: "q", x: e.x + e.w / 2 - e.dir * 30, y: e.y + e.h / 2, vx: -e.dir, vy: 0, g: 0, vida: 14, max: 14, cor: "#e3fafc", tam: 4 });
    if (e.timer <= 0 || solidoNaCaixa({ x: e.x + (e.dir > 0 ? e.w : -4), y: e.y + 4, w: 4, h: e.h - 8 })) {
      e.estado = "cansado"; e.timer = 50;
    }
  } else {
    e.y += (e.y0 - e.y) * 0.05;
    if (e.timer <= 0) { e.estado = "normal"; e.x0 = e.x; e.timer = 80; }
  }
};

COMPORTAMENTO.toca = function(e) {
  // marmota: sai da toca, olha em volta (assobia se vê o macaco) e se esconde de novo
  if (e.saida === undefined) { e.saida = 0; e.ciclo = Math.floor(Math.random() * 200); e.y = e.y0; }
  e.ciclo = (e.ciclo + 1) % 240;
  const c = e.ciclo;
  const alvo = c < 60 ? 0 : c < 80 ? (c - 60) / 20 : c < 200 ? 1 : c < 220 ? 1 - (c - 200) / 20 : 0;
  e.saida = alvo;
  e.y = e.y0 + (1 - e.saida) * (e.h + 4);
  const j = jogador;
  e.dir = j.x + j.w / 2 > e.x + e.w / 2 ? 1 : -1;
  if (c === 120 && Math.abs(j.x - e.x) < 500 && alvoVisivel()) { e.apito = 30; som("apito"); }
  if (e.apito > 0) e.apito--;
  e.escondido = e.saida < 0.35;
};


// ---------- Tiros novos dos inimigos ----------

function atirarInimigoNovo(e, cx, cy, dx, dy) {
  if (e.t.tiro === "tinta") {
    projeteis.push({ tipo: "tinta", x: cx - 12, y: cy - 12, w: 24, h: 24, vx: limitar(dx / 70, -5, 5), vy: -6.5, g: 0.16, vida: 260, rastro: "#2a1a40" });
    som("tinta");
    return true;
  }
  if (e.t.tiro === "cuspe") {
    projeteis.push({ tipo: "cuspe", x: cx - 10 + e.dir * 20, y: cy - 22, w: 20, h: 20, vx: limitar(dx / 46, -8, 8), vy: -6, g: 0.3, vida: 220 });
    som("cuspe");
    return true;
  }
  return false;
}
