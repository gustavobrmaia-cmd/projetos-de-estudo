"use strict";

// =========================
// CLIMA DAS FASES COM TEMA
// Cada fase com tema (2, 4, 6, 8 e 10 do mundo) tem uma hora do dia / tempo diferente,
// para não parecer a mesma fase de antes: tarde dourada, noite, neblina, pôr do sol e tempestade.
// Desenhado por cima do mundo (embaixo do HUD), em coordenadas da tela.
// =========================

const ESTRELAS_NOITE = (function() {
  const r = criarRng(77);
  const l = [];
  for (let i = 0; i < 70; i++) l.push({ x: r() * LARGURA, y: r() * 300, t: r() * 6, s: r() < 0.15 ? 3 : 2 });
  return l;
})();

function nomeTemaFase(f) {
  const t = TEMAS_FASE.find(function(x) { return x.id === f.tema; });
  return t ? tr(t.nome) : "";
}

function ambienteFase(f, cam, t) {
  const c = f && f.clima;
  if (!c) return;
  const W = LARGURA, H = ALTURA;
  const j = jogador;
  const jx = j ? j.x + j.w / 2 - cam : W / 2, jy = j ? j.y + j.h / 2 : H / 2;
  const mar = f.id === "oceano";

  if (c === "tarde") {
    // tarde dourada: luz quente e baixa vindo da direita
    ctx.fillStyle = "rgba(255,176,80,0.10)";
    ctx.fillRect(0, 0, W, H);
    luzAditiva(W - 120, 90, 620, "255,196,110", 0.2 + Math.sin(t * 0.02) * 0.03);
  } else if (c === "noite") {
    // noite: tudo azul-escuro, estrelas (ou plâncton brilhando no mar) e uma luz em volta do macaco
    ctx.fillStyle = mar ? "rgba(2,10,40,0.42)" : "rgba(8,12,44,0.44)";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < ESTRELAS_NOITE.length; i++) {
      const e = ESTRELAS_NOITE[i];
      const a = 0.35 + Math.abs(Math.sin(t * 0.03 + e.t)) * 0.6;
      if (mar) {
        // plâncton subindo devagar
        const y = ((e.y * 2 - t * 0.3) % H + H) % H;
        const x = ((e.x - cam * 0.2) % W + W) % W;
        ctx.fillStyle = "rgba(120,255,230," + (a * 0.6).toFixed(2) + ")";
        ctx.fillRect(Math.round(x), Math.round(y), e.s, e.s);
      } else {
        const x = ((e.x - cam * 0.05) % W + W) % W;
        ctx.fillStyle = "rgba(255,250,220," + a.toFixed(2) + ")";
        ctx.fillRect(Math.round(x), Math.round(e.y), e.s, e.s);
      }
    }
    // lua
    if (!mar) {
      luzAditiva(W - 170, 110, 140, "200,215,255", 0.25);
      ctx.fillStyle = "#e9eefc";
      ctx.fillRect(W - 196, 84, 52, 52);
      ctx.fillStyle = "#c9d2ec";
      ctx.fillRect(W - 180, 96, 10, 10); ctx.fillRect(W - 166, 116, 8, 8);
    }
    luzAditiva(jx, jy, 300, "255,236,190", 0.2);
    if (banana && banana.estado === "fugindo" && banana.viu) luzAditiva(banana.x + 24 - cam, banana.y + 20, 160, "255,215,70", 0.25);
  } else if (c === "neblina") {
    // manhã de neblina: tom claro e faixas de névoa passando
    ctx.fillStyle = mar ? "rgba(160,220,230,0.10)" : f.id === "lava" ? "rgba(90,40,30,0.12)" : "rgba(225,232,242,0.13)";
    ctx.fillRect(0, 0, W, H);
    const neb = neblina(f.id === "lava" ? "80,40,35" : mar ? "190,240,250" : "240,244,250");
    ctx.globalAlpha = 0.7;
    for (let k = 0; k < 5; k++) {
      const x = ((k * 430 + t * (0.4 + k * 0.15) - cam * (0.2 + k * 0.08)) % 1900 + 1900) % 1900 - 500;
      ctx.drawImage(neb, Math.round(x), 180 + k * 85, 900, 90);
    }
    ctx.globalAlpha = 1;
  } else if (c === "pordosol") {
    // pôr do sol: céu alaranjado e rosado, luz rasante
    preencherDegrade(degradeVertical("porDoSol", 64, [[0, "rgba(255,110,80,0.22)"], [0.5, "rgba(255,150,90,0.12)"], [1, "rgba(110,30,80,0.2)"]]), 0, 0, W, H);
    luzAditiva(160, 300, 520, "255,150,90", 0.22);
  } else if (c === "tempestade") {
    // tempestade: escuro, chuva (ou areia, neve, cinzas, correnteza) e relâmpagos
    ctx.fillStyle = "rgba(22,26,44,0.30)";
    ctx.fillRect(0, 0, W, H);
    const tipo = f.id === "deserto" ? "areia" : f.id === "gelo" ? "neve" : f.id === "lava" ? "cinza" : mar ? "corrente" : "chuva";
    for (let k = 0; k < 110; k++) {
      if (tipo === "chuva") {
        const x = ((k * 137 + t * 7 - cam * 0.6) % (W + 200) + W + 200) % (W + 200) - 100;
        const y = ((k * 251 + t * 24) % (H + 60)) - 30;
        ctx.fillStyle = "rgba(190,210,255,0.35)";
        ctx.fillRect(Math.round(x), Math.round(y), 2, 18);
        ctx.fillRect(Math.round(x) - 2, Math.round(y) + 14, 2, 6);
      } else if (tipo === "neve") {
        const x = ((k * 137 - t * 5 - cam * 0.6) % (W + 100) + W + 100) % (W + 100) - 50;
        const y = ((k * 251 + t * (3 + (k % 3))) % (H + 40)) - 20;
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
      } else if (tipo === "areia") {
        const x = ((k * 137 - t * 14 - cam * 0.7) % (W + 200) + W + 200) % (W + 200) - 100;
        const y = (k * 251) % H;
        ctx.fillStyle = k % 2 ? "rgba(240,200,130,0.5)" : "rgba(200,150,80,0.4)";
        ctx.fillRect(Math.round(x), Math.round(y + Math.sin(t * 0.05 + k) * 6), 10, 2);
      } else if (tipo === "cinza") {
        const x = ((k * 137 + Math.sin(t * 0.02 + k) * 30 - cam * 0.5) % W + W) % W;
        const y = ((k * 251 + t * 1.6) % (H + 40)) - 20;
        ctx.fillStyle = k % 7 === 0 ? "rgba(255,140,40,0.8)" : "rgba(60,55,60,0.55)";
        ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
      } else {
        const x = ((k * 137 + t * 10 - cam * 0.6) % (W + 200) + W + 200) % (W + 200) - 100;
        const y = (k * 251) % H;
        ctx.fillStyle = "rgba(220,250,255,0.22)";
        ctx.fillRect(Math.round(x), Math.round(y), 30, 2);
      }
    }
    if (f.id === "deserto") {
      ctx.fillStyle = "rgba(210,150,70,0.12)";
      ctx.fillRect(0, 0, W, H);
    }
    // relâmpago de tempos em tempos (no mar, no deserto e na lava não)
    if (tipo === "chuva" || tipo === "neve") {
      const ciclo = t % 470;
      if (ciclo < 10 && ciclo % 4 < 2) {
        ctx.fillStyle = "rgba(235,240,255,0.32)";
        ctx.fillRect(0, 0, W, H);
      }
      if (ciclo === 0) som("trovao");
    }
  }
}
