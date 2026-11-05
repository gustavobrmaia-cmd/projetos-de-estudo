"use strict";

// =========================
// CENA DEPOIS DO CHEFE: o macaco anda pra frente, acha a banana... e o vento leva ela
// =========================

function iniciarCenaBanana() {
  const j = jogador;
  if (!j || j.morto || j.saindo || j.cenaBanana) return;
  j.cipo = null;
  cancelarLaco();
  if (j.deslizando) { j.deslizando = false; j.y -= 36; j.h = 72; }
  j.comemorar = 0;
  j.dir = 1;
  j.vx = 0;
  j.cenaBanana = true;
  j.x = Math.min(j.x, LARGURA - 620);
  banana = { estado: "parada", x: LARGURA - 150, y: CHAO - 44, base: CHAO - 44, t: 0, rot: 0, vy: 0 };
}

function andarCena(j) {
  const anda = !!banana && banana.estado === "parada";
  j.dir = 1;
  j.vx = anda ? 2.6 : 0;
  j.x += j.vx;
  if (j.y + j.h < CHAO) {
    j.vy = Math.min(j.vy + GRAV, MAX_QUEDA);
    j.y = Math.min(j.y + j.vy, CHAO - j.h);
  }
  j.noChao = j.y + j.h >= CHAO;
  if (j.noChao) {
    j.vy = 0;
    if (anda) { j.passos++; if (j.passos % 15 === 0) somPasso(j); }
  }
  if (j.comemorar > 0) j.comemorar--;
  // (sem texto grande: o susto do macaco e a banana fugindo contam a história)
}

// =========================
// PETS (só enfeite, não fazem nada): seguem o macaco
// =========================

const PET_SPR = {};
let petPos = null;

function spritePet(item) {
  if (!PET_SPR[item.id]) {
    const w = item.mapa[0].length, h = item.mapa.length;
    const c = criarCanvas(w * 3, h * 3);
    pintarMapa(c.getContext("2d"), item.mapa, item.cores, 3, 0, 0);
    PET_SPR[item.id] = { d: c, e: espelhar(c), w: w * 3, h: h * 3 };
  }
  return PET_SPR[item.id];
}

function desenharPetJogo() {
  const j = jogador;
  const item = save.equip.pet && buscarItem("pet", save.equip.pet);
  if (!item || !j || j.morto) return;
  const s = spritePet(item);
  const alvoX = j.x + j.w / 2 - j.dir * 62 - s.w / 2;
  const alvoY = j.y + j.h - s.h;
  if (!petPos || Math.abs(petPos.x - alvoX) > 500) petPos = { x: alvoX, y: alvoY };
  petPos.x += (alvoX - petPos.x) * 0.12;
  petPos.y += (alvoY - petPos.y) * 0.2;
  const pulinho = j.noChao && Math.abs(j.vx) > 1 ? Math.abs(Math.sin(tempo * 0.3)) * 4 : 0;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(j.dir > 0 ? s.d : s.e, Math.round(petPos.x), Math.round(petPos.y - pulinho));
}

function desenharPetLoja(g, item) {
  const s = spritePet(item);
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 96, 96);
  g.drawImage(s.d, 0, 0, s.w, s.h, Math.round((96 - s.w * 2) / 2), 96 - s.h * 2 - 10, s.w * 2, s.h * 2);
}
