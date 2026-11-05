"use strict";

// =========================
// MÚSICA, SONS DE AMBIENTE E PASSOS (gerados na hora, sem arquivos)
// Cada mapa (selva, deserto, gelo, oceano, montanhas, lava) tem 3 músicas próprias que tocam em sequência,
// com 30 segundos de silêncio entre elas. Sons de ambiente tocam só de vez em quando (9 a 20 s).
// =========================

// escalas: pentatônica (selva), frígia dominante (deserto), lídia (gelo), blues (lava),
// dórica (oceano: calma e misteriosa), mixolídia (montanhas: flauta andina)
const MUS_ESC = [[0, 2, 4, 7, 9], [0, 1, 4, 5, 7, 8, 10], [0, 2, 4, 6, 7, 9, 11], [0, 3, 5, 6, 7, 10],
  [0, 2, 3, 5, 7, 9, 10], [0, 2, 4, 5, 7, 9, 10]];
const MUS_TIMBRE = ["triangle", "sawtooth", "sine", "square", "sine", "triangle"];
const MUS_VOL = [0.13, 0.05, 0.11, 0.05, 0.12, 0.12];
// mundo do jogo (selva, deserto, gelo, oceano, montanha, lava) -> trilha
const MUS_DO_MUNDO = [0, 1, 2, 4, 5, 3];
// [bpm, nota-base MIDI, melodia de 32 colcheias (dígito/letra = grau da escala, . = pausa, - = segura), baixo (1 grau por compasso)]
const MUS_FAIXAS = [
  [[138, 60, "0.24.42.5.75.42.0.24.45.7.54.20-", "0430"], [126, 62, "4.4.5.4.2.0.2.4.3.3.4.3.1.0.1.3.", "0340"], [150, 57, "02430243.5.6.54.4.2.0.12-.0.-.2.", "0230"]],
  [[108, 57, "0.1.2.1.0.-.-.1.2.3.4.3.2.1.0.-.", "0034"], [116, 55, "2.1.0.1.2.-.4.-.3.2.1.2.3.-.5.-.", "0030"], [100, 50, "04.21.0.-.1.23.4.2.34.54.3.21.0-", "0340"]],
  [[96, 72, "0.2.4.7.9.7.4.2.0.2.4.7.b.9.7.4.", "0453"], [84, 69, "4...2...0...2...4...7...9...7...", "0230"], [112, 74, "7.4.7.9.7.4.2.4.5.4.2.0.2.4.-.-.", "0340"]],
  [[150, 45, "0.0.3.0.5.0.6.5.0.0.3.0.7.6.5.3.", "0024"], [160, 40, "03.03.5.6.5.3.0.03.03.7.6.5.3.50", "0400"], [144, 43, "5.5.6.5.3.-.0.3.5.-.7.-.6.5.3.-.", "0235"]],
  // oceano: notas longas e redondas, como se estivessem debaixo d'água
  [[92, 62, "0..2.4-5.4.2.-.0..2.4.-7.-5.4.-.", "0350"], [100, 57, "4.5.7.-5.4.2.-.4.5.7.9.8.7.5.-..", "0543"], [88, 60, "7...5...4.5.4.2.0...2...4.2.0.-.", "0420"]],
  // montanhas: flauta de pã com bumbo andino e chocalho
  [[126, 67, "0.2.4.4.2.0.-.6.0.2.4.7.6.4.-.-.", "0340"], [116, 64, "4.4.6.7.6.4.2.-.4.2.0.2.4.-.-.-.", "0640"], [132, 62, "7.6.4.6.7.-.9.7.6.4.2.4.0.-.-.-.", "0450"]]
];

function musPasso(w, f, i, atraso, acel) {
  const esc = MUS_ESC[w], n = esc.length, mel = f[2], k = i % 32, dt = 30 / (f[0] * acel);
  const nota = function(d) { return f[1] + esc[d % n] + 12 * Math.floor(d / n); };
  const hz = function(m) { return 440 * Math.pow(2, (m - 69) / 12); };
  const c = mel[k % mel.length];
  if (c && c !== "." && c !== "-") {
    let len = 1;
    while (mel[(k + len) % mel.length] === "-" && len < 6) len++;
    const h = hz(nota(parseInt(c, 16)));
    tom(MUS_TIMBRE[w], h, h, dt * len * 1.15, MUS_VOL[w], atraso);
    if (w === 4) tom("sine", h * 2, h * 2.01, dt * len * 0.9, MUS_VOL[w] * 0.18, atraso + 0.02);   // brilho de "eco"
    if (w === 5) ruido(0.05, 0.012, 3200, atraso);                                                  // sopro da flauta
  }
  if (k % 2 === 0) {
    const b = hz(nota(parseInt(f[3][Math.floor(k / 8) % 4], 16)) - 24);
    tom(w === 3 ? "square" : "triangle", b, b, dt * (w === 4 ? 2.6 : 1.7), w === 3 ? 0.06 : 0.15, atraso);
  }
  const m8 = k % 8;
  if (w === 0) {          // selva: tambores e chocalho
    if (m8 === 0) tom("sine", 150, 55, 0.12, 0.18, atraso);
    if (m8 === 4) tom("sine", 190, 80, 0.1, 0.12, atraso);
    if (k % 2 === 1) ruido(0.03, 0.04, 6000, atraso);
  } else if (w === 1) {   // deserto: darbuka
    if (m8 === 0) tom("sine", 160, 60, 0.12, 0.18, atraso);
    if (m8 === 3 || m8 === 6) tom("sine", 230, 120, 0.07, 0.12, atraso);
    if (m8 === 5) ruido(0.05, 0.08, 2500, atraso);
  } else if (w === 2) {   // gelo: sininhos
    if (m8 === 0) tom("sine", 95, 50, 0.25, 0.12, atraso);
    if (k % 4 === 2) tom("sine", 2400, 2400, 0.05, 0.015, atraso);
  } else if (w === 3) {   // lava: bumbo, caixa e chimbal
    if (k % 4 === 0) tom("sine", 150, 40, 0.15, 0.24, atraso);
    if (k % 4 === 2) ruido(0.1, 0.12, 3000, atraso);
    if (k % 2 === 1) ruido(0.02, 0.05, 8000, atraso);
  } else if (w === 4) {   // oceano: bumbo abafado e "bolhinhas" no contratempo
    if (m8 === 0) tom("sine", 110, 45, 0.2, 0.14, atraso);
    if (m8 === 6) tom("sine", 600, 1100, 0.05, 0.02, atraso);
    if (k % 16 === 11) { tom("sine", 500, 950, 0.04, 0.018, atraso); tom("sine", 700, 1300, 0.04, 0.015, atraso + 0.06); }
  } else {                // montanhas: bombo legüero e chocalho de sementes
    if (m8 === 0) tom("sine", 120, 48, 0.16, 0.2, atraso);
    if (m8 === 3 || m8 === 6) tom("sine", 150, 70, 0.08, 0.1, atraso);
    if (k % 2 === 1) ruido(0.04, 0.03, 5000, atraso);
  }
}

// Sons de ambiente de cada mapa (tocam sozinhos de vez em quando)
const MUS_AMB = [
  [ // selva: passarinhos, macaco ao longe, sapo, insetos
    function() { for (let k = 0; k < 3; k++) { const f = 2200 + Math.random() * 1800; tom("sine", f, f * 1.5, 0.08, 0.04, k * 0.11); } },
    function() { tom("square", 420, 300, 0.12, 0.03); tom("square", 420, 300, 0.12, 0.03, 0.2); },
    function() { tom("sawtooth", 150, 95, 0.1, 0.035); tom("sawtooth", 140, 90, 0.12, 0.035, 0.14); },
    function() { ruido(0.5, 0.025, 7000); }
  ],
  [ // deserto: vento, abutre, cascavel
    function() { ruido(1, 0.05, 900); },
    function() { tom("sawtooth", 1000, 520, 0.5, 0.025); },
    function() { for (let k = 0; k < 8; k++) ruido(0.03, 0.05, 6000, k * 0.045); }
  ],
  [ // gelo: vento gelado, gelo estalando, lobo ao longe
    function() { ruido(1, 0.05, 1800); tom("sine", 900, 1100, 1.5, 0.012); },
    function() { ruido(0.08, 0.1, 6000); tom("sine", 3200, 2400, 0.2, 0.025); },
    function() { tom("sine", 300, 520, 0.7, 0.03); tom("sine", 520, 330, 1, 0.03, 0.7); }
  ],
  [ // lava: ronco do vulcão, bolhas, faíscas
    function() { ruido(1, 0.09, 200); },
    function() { tom("sine", 200 + Math.random() * 200, 700, 0.1, 0.05); },
    function() { for (let k = 0; k < 4; k++) ruido(0.02, 0.08, 4000, k * 0.06 * (1 + Math.random())); }
  ],
  [ // oceano: canto de baleia ao longe, bolhas subindo, casco rangendo
    function() { tom("sine", 180, 290, 1.4, 0.025); tom("sine", 290, 210, 1.6, 0.022, 1.4); },
    function() { for (let k = 0; k < 5; k++) { const f = 400 + Math.random() * 500; tom("sine", f, f * 2.2, 0.05, 0.02, k * (0.07 + Math.random() * 0.08)); } },
    function() { tom("sawtooth", 70, 55, 0.9, 0.012); ruido(0.8, 0.02, 300); }
  ],
  [ // montanhas: rajada de vento, águia ao longe, pedrinhas rolando, cabra
    function() { ruido(1.4, 0.045, 1100); },
    function() { tom("sawtooth", 1700, 1250, 0.45, 0.012); tom("sine", 1700, 1250, 0.45, 0.02); },
    function() { for (let k = 0; k < 5; k++) ruido(0.025, 0.05, 3500, k * (0.05 + Math.random() * 0.07)); },
    function() { for (let k = 0; k < 3; k++) tom("square", 520 - k * 10, 470, 0.08, 0.012, k * 0.09); }
  ]
];

// Passos: cada terreno tem o seu som (o gelo estala, a areia arrasta...)
function somPasso(j) {
  if (!audioCtx || save.mudo || somBloqueado || !fase) return;
  const m = MUS_DO_MUNDO[fase.mundo | 0] || 0;
  if (m === 2 || (j && j.chao && j.chao.gelo)) { ruido(0.05, 0.1, 5500); tom("sine", 2600, 1900, 0.04, 0.025); }
  else if (m === 0) ruido(0.07, 0.09, 1400);
  else if (m === 1) ruido(0.12, 0.06, 800);
  else if (m === 4) ruido(0.1, 0.05, 500);                                        // areia do fundo do mar, abafada
  else if (m === 5) { tom("square", 190, 95, 0.04, 0.02); ruido(0.03, 0.07, 2600); } // rocha
  else { tom("square", 150, 70, 0.05, 0.03); ruido(0.04, 0.07, 700); }
}

let musMundo = -1, musFaixa = 0, musI = 0, musProx = 0, musAte = 0, ambProx = 0, ambUltimo = -1;

function musTick() {
  if (!audioCtx || estado !== "jogo" || !fase) { musMundo = -1; return; }
  if (pausado || save.mudo || somBloqueado) { musProx = 0; return; }
  const w = MUS_DO_MUNDO[fase.mundo | 0] || 0;
  const agora = audioCtx.currentTime;
  // ambiente: um som de vez em quando (a cada 9 a 20 s), nunca o mesmo duas vezes seguidas
  if (!ambProx || ambProx > agora + 30) ambProx = agora + 6 + Math.random() * 6;
  if (agora >= ambProx) {
    const a = MUS_AMB[w];
    let q = Math.floor(Math.random() * a.length);
    if (q === ambUltimo) q = (q + 1) % a.length;
    ambUltimo = q;
    a[q]();
    ambProx = agora + 9 + Math.random() * 11;
  }
  if (musMundo !== w) { musMundo = w; musFaixa = 0; musI = 0; musProx = 0; musAte = 0; }
  if (agora < musAte) return;   // intervalo entre uma música e outra
  const f = MUS_FAIXAS[w][musFaixa % 3];
  const acel = fase.ehChefe ? 1.2 : 1;
  const dt = 30 / (f[0] * acel);
  const total = 32 * Math.max(3, Math.round(55 / (32 * dt)));   // ~55 s por música
  if (musProx < agora) musProx = agora + 0.05;
  while (musProx < agora + 0.3) {
    musPasso(w, f, musI, musProx - agora, acel);
    musProx += dt;
    if (++musI >= total) {
      musI = 0;
      musFaixa++;
      musAte = musProx + (fase.ehChefe ? 6 : 30);
      return;
    }
  }
}

setInterval(function() { try { musTick(); } catch (e) { /* sem som */ } }, 150);
