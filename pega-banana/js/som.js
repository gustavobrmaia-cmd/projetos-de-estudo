"use strict";

// =========================
// SONS (gerados na hora, sem arquivos)
// =========================

let audioCtx = null;
let bufferRuido = null;

function iniciarAudio() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return;
  }
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const n = audioCtx.sampleRate;
    bufferRuido = audioCtx.createBuffer(1, n, n);
    const d = bufferRuido.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) {
    audioCtx = null;
  }
}

function tom(tipo, f1, f2, dur, vol, atraso) {
  const t = audioCtx.currentTime + (atraso || 0);
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function ruido(dur, vol, freq, atraso) {
  const t = audioCtx.currentTime + (atraso || 0);
  const s = audioCtx.createBufferSource();
  s.buffer = bufferRuido;
  const f = audioCtx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(audioCtx.destination);
  s.start(t);
  s.stop(t + dur + 0.02);
}

const SONS = {
  pulo:      function() { tom("square", 280, 560, 0.12, 0.05); },
  puloDuplo: function() { tom("square", 420, 900, 0.14, 0.05); },
  impulso:   function() { ruido(0.4, 0.2, 900); tom("sawtooth", 120, 600, 0.35, 0.05); },
  moeda:     function() { tom("square", 990, 990, 0.05, 0.04); tom("square", 1320, 1320, 0.1, 0.04, 0.05); },
  tiro:      function() { ruido(0.12, 0.25, 3000); tom("square", 180, 60, 0.08, 0.06); },
  recarga:   function() { tom("square", 300, 300, 0.04, 0.04); tom("square", 450, 450, 0.04, 0.04, 0.1); },
  vazio:     function() { tom("square", 120, 100, 0.05, 0.04); },
  laco:      function() { ruido(0.15, 0.12, 1800); tom("sine", 600, 300, 0.15, 0.04); },
  agarrou:   function() { tom("square", 200, 400, 0.08, 0.05); },
  chute:     function() { ruido(0.2, 0.35, 700); tom("square", 160, 40, 0.2, 0.08); },
  estrela:   function() { tom("sine", 1568, 1568, 0.12, 0.06); tom("sine", 2093, 2093, 0.3, 0.06, 0.1); },
  pisao:     function() { tom("square", 220, 80, 0.12, 0.07); },
  inimigo:   function() { tom("square", 330, 110, 0.15, 0.05); },
  dano:      function() { tom("sawtooth", 320, 90, 0.3, 0.08); },
  morte:     function() { tom("square", 500, 60, 0.9, 0.07); },
  dash:      function() { ruido(0.2, 0.2, 2500); },
  poder:     function() { tom("square", 523, 523, 0.08, 0.05); tom("square", 659, 659, 0.08, 0.05, 0.08); tom("square", 784, 784, 0.15, 0.05, 0.16); },
  nuke:      function() { ruido(1.4, 0.5, 400); tom("sawtooth", 200, 30, 1.2, 0.1); },
  negado:    function() { tom("square", 150, 150, 0.12, 0.05); },
  vento:     function() { ruido(1.2, 0.15, 600); },
  checkpoint:function() { tom("square", 660, 660, 0.08, 0.05); tom("square", 880, 880, 0.15, 0.05, 0.08); },
  pancada:   function() { ruido(0.35, 0.45, 300); tom("sine", 90, 35, 0.4, 0.15); },
  rugido:    function() { ruido(0.9, 0.3, 500); tom("sawtooth", 110, 70, 0.9, 0.08); },
  vitoria:   function() { [523, 659, 784, 1047].forEach(function(f, i) { tom("square", f, f, 0.18, 0.05, i * 0.14); }); },
  compra:    function() { tom("square", 880, 880, 0.06, 0.05); tom("square", 1175, 1175, 0.12, 0.05, 0.06); },
  nham:      function() { ruido(0.12, 0.2, 1200); tom("square", 300, 200, 0.08, 0.04); },
  // mundos novos
  pagina:     function() { ruido(0.18, 0.08, 3500); },
  alarmeAr:   function() { tom("sine", 880, 660, 0.12, 0.05); },
  bolhaAr:    function() { tom("sine", 300, 900, 0.25, 0.06); tom("sine", 500, 1200, 0.2, 0.04, 0.08); },
  bolhaPop:   function() { tom("sine", 900, 1400, 0.06, 0.04); },
  confuso:    function() { tom("triangle", 500, 700, 0.15, 0.05); tom("triangle", 700, 450, 0.2, 0.05, 0.16); },
  conchaFecha:function() { ruido(0.12, 0.25, 900); tom("square", 200, 90, 0.1, 0.06); },
  explosao:   function() { ruido(0.6, 0.4, 500); tom("sine", 120, 40, 0.5, 0.12); },
  fumarola:   function() { ruido(0.8, 0.15, 1500); },
  rochaQuebra:function() { ruido(0.3, 0.3, 600); tom("sine", 110, 50, 0.25, 0.1); },
  tirolesa:   function() { ruido(0.08, 0.04, 5000); },
  pendulo:    function() { ruido(0.25, 0.06, 400); },
  cospe:      function() { ruido(0.1, 0.12, 2000); tom("square", 260, 140, 0.08, 0.03); },
  baiacu:     function() { tom("sine", 200, 600, 0.25, 0.05); },
  espada:     function() { tom("sawtooth", 600, 1200, 0.15, 0.03); },
  apito:      function() { tom("sine", 1800, 2400, 0.2, 0.04); tom("sine", 2400, 1700, 0.25, 0.04, 0.22); },
  tinta:      function() { ruido(0.15, 0.1, 700); },
  cuspe:      function() { ruido(0.08, 0.15, 3000); tom("square", 400, 200, 0.06, 0.03); },
  urro:       function() { ruido(1.2, 0.35, 420); tom("sawtooth", 140, 60, 1.1, 0.1); tom("sawtooth", 90, 45, 1.1, 0.08, 0.1); },
  mordida:    function() { ruido(0.1, 0.3, 1800); tom("square", 300, 80, 0.12, 0.08); },
  grasnado:   function() { tom("sawtooth", 900, 500, 0.35, 0.05); tom("sawtooth", 800, 420, 0.3, 0.04, 0.3); },
  // novos
  corrente:   function() { for (let k = 0; k < 5; k++) { tom("square", 1400 - k * 60, 1100, 0.03, 0.015, k * 0.06); ruido(0.03, 0.03, 5000, k * 0.06); } },
  respira:    function() { ruido(0.35, 0.06, 900); tom("sine", 260, 520, 0.3, 0.04); },
  cipoAchado: function() { [392, 523, 659, 784, 1047].forEach(function(f, i) { tom("triangle", f, f, 0.22, 0.06, i * 0.1); }); },
  ondaBolhas: function() { for (let k = 0; k < 8; k++) tom("sine", 300 + k * 90, 900 + k * 60, 0.12, 0.03, k * 0.05); },
  rugidoCurto:function() { ruido(0.4, 0.25, 600); tom("sawtooth", 160, 80, 0.4, 0.06); },
  trovao:     function() { ruido(1.6, 0.22, 260); ruido(0.3, 0.12, 1200); },
  aviso:      function() { tom("square", 880, 880, 0.08, 0.04); tom("square", 660, 660, 0.08, 0.04, 0.1); }
};

// Som de inimigo: só quando está na tela e no máximo um a cada tanto (para não ficar chato)
let ultimoSomInimigo = 0;
function somInimigo(e, acao) {
  if (!e || Math.abs(e.x - cameraX - LARGURA / 2) > LARGURA * 0.6) return;
  if (tempo - ultimoSomInimigo < 45) return;
  ultimoSomInimigo = tempo;
  const porTipo = { macacoLadrao: "laco", cacto: "cospe", boneco: "tinta", diabinho: "tiro", golem: "pancada", polvo: "tinta", lhama: "cuspe" };
  if (acao === "tiro" && porTipo[e.tipo]) som(porTipo[e.tipo]);
}

// Vozes dos inimigos: de vez em quando (8 a 16 s) um inimigo que está na tela faz o seu som, baixinho
const VOZES = {
  cobra:       function() { ruido(0.45, 0.035, 5200); },                                                        // sssss
  abelha:      function() { tom("sawtooth", 210, 230, 0.5, 0.015); tom("sawtooth", 225, 205, 0.4, 0.012, 0.15); }, // bzzz
  sapo:        function() { tom("sawtooth", 160, 100, 0.09, 0.035); tom("sawtooth", 150, 95, 0.11, 0.035, 0.13); },
  macacoLadrao:function() { for (let k = 0; k < 3; k++) tom("square", 700 + k * 80, 520, 0.07, 0.02, k * 0.09); },
  aranha:      function() { for (let k = 0; k < 4; k++) ruido(0.015, 0.03, 7000, k * 0.04); },
  escorpiao:   function() { ruido(0.03, 0.04, 4500); ruido(0.03, 0.04, 4500, 0.07); },
  abutre:      function() { tom("sawtooth", 700, 420, 0.3, 0.02); },
  mumia:       function() { tom("sawtooth", 130, 110, 0.7, 0.025); tom("sine", 260, 220, 0.7, 0.02); },
  tatu:        function() { tom("triangle", 600, 900, 0.06, 0.02); },
  pinguim:     function() { tom("square", 520, 640, 0.07, 0.018); tom("square", 640, 500, 0.08, 0.018, 0.09); },
  morcegoGelo: function() { tom("sine", 3200, 2600, 0.05, 0.02); tom("sine", 3300, 2700, 0.05, 0.02, 0.08); },
  foca:        function() { tom("sawtooth", 300, 240, 0.1, 0.03); tom("sawtooth", 310, 230, 0.1, 0.03, 0.16); },
  lobo:        function() { tom("sine", 330, 560, 0.5, 0.03); tom("sine", 560, 380, 0.7, 0.03, 0.5); },
  caranguejo:  function() { for (let k = 0; k < 2; k++) { tom("square", 1500, 1200, 0.025, 0.02, k * 0.08); ruido(0.02, 0.03, 6000, k * 0.08); } },
  aguaViva:    function() { tom("sine", 900, 1400, 0.25, 0.012); },
  baiacu:      function() { tom("sine", 300, 600, 0.12, 0.02); },
  polvo:       function() { tom("sine", 220, 160, 0.2, 0.025); ruido(0.15, 0.02, 600, 0.05); },
  peixeEspada: function() { ruido(0.15, 0.03, 2500); },
  cabra:       function() { for (let k = 0; k < 4; k++) tom("square", 560 - k * 6, 500, 0.06, 0.016, k * 0.065); },  // béééé
  aguia:       function() { tom("sawtooth", 1800, 1300, 0.4, 0.012); tom("sine", 1800, 1300, 0.4, 0.02); },
  lhama:       function() { tom("triangle", 380, 420, 0.35, 0.025); },
  urso:        function() { ruido(0.6, 0.06, 300); tom("sawtooth", 95, 70, 0.6, 0.035); },
  slime:       function() { tom("sine", 200, 500, 0.1, 0.03); },
  morcegoFogo: function() { tom("sine", 2900, 2300, 0.05, 0.02); ruido(0.1, 0.02, 3000, 0.05); },
  diabinho:    function() { for (let k = 0; k < 3; k++) tom("square", 900 + k * 120, 800, 0.05, 0.016, k * 0.07); },
  golem:       function() { ruido(0.5, 0.06, 250); },
  fenix:       function() { tom("triangle", 1200, 1700, 0.25, 0.025); tom("triangle", 1500, 2000, 0.2, 0.02, 0.2); }
};
let proxVoz = 300;
function vozesInimigos() {
  if (save.mudo || somBloqueado || !audioCtx || typeof inimigos === "undefined") return;
  if (--proxVoz > 0) return;
  proxVoz = 480 + Math.floor(Math.random() * 480);
  const vis = [];
  for (let i = 0; i < inimigos.length; i++) {
    const e = inimigos[i];
    if (e.vivo && !e.morto && VOZES[e.tipo] && Math.abs(e.x - cameraX - LARGURA / 2) < LARGURA * 0.45) vis.push(e);
  }
  if (!vis.length) { proxVoz = 120; return; }
  try { VOZES[vis[Math.floor(Math.random() * vis.length)].tipo](); } catch (err) { /* sem som */ }
}

let somBloqueado = false;   // anúncio na tela

function som(nome) {
  if (save.mudo || somBloqueado || !audioCtx || !SONS[nome]) return;
  try { SONS[nome](); } catch (e) { /* sem som */ }
}
