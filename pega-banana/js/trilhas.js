"use strict";

// =========================
// TRILHAS SONORAS (geradas na hora, sem arquivos)
// No estilo dos jogos de aventura em pixel art: cada música tem acordes de verdade, partes
// diferentes (A, B, C), melodia com motivo que se repete e varia, arpejos, pad, baixo e bateria,
// com eco suave. Cada mundo tem 2 músicas (1-2 min cada) que se alternam; os chefes têm a sua.
// A melodia é composta por regras a partir de uma semente fixa (sai sempre igual).
// =========================

// mundo do jogo (selva, deserto, gelo, oceano, montanha, lava) -> trilha/ambiente
const MUS_DO_MUNDO = [0, 1, 2, 4, 5, 3];

const MODOS = {
  maior:   [0, 2, 4, 5, 7, 9, 11],
  menor:   [0, 2, 3, 5, 7, 8, 10],
  dorico:  [0, 2, 3, 5, 7, 9, 10],
  lidio:   [0, 2, 4, 6, 7, 9, 11],
  mixo:    [0, 2, 4, 5, 7, 9, 10],
  harmon:  [0, 2, 3, 5, 7, 8, 11],
  frigDom: [0, 1, 4, 5, 7, 8, 10]
};

// estilo de cada trilha: instrumentos e ritmo
// mel: instrumento da melodia, arp: acompanhamento, bat: bateria, arpPadrao: notas do acorde por colcheia
const ESTILOS = [
  { nome: "selva",    mel: "marimba", contra: "flauta", arp: "harpa",   bat: "bongo",   arpPadrao: [0, 1, 2, 1, 3, 1, 2, 1], pad: 0.5 },
  { nome: "deserto",  mel: "flauta",  contra: "harpa",  arp: "alaude",  bat: "darbuka", arpPadrao: [0, -1, 2, -1, 1, 2, -1, 1], pad: 0.6 },
  { nome: "gelo",     mel: "sino",    contra: "flauta", arp: "harpa",   bat: "neve",    arpPadrao: [0, 2, 1, 3, 2, 1, 3, 2], pad: 0.8 },
  { nome: "lava",     mel: "lead",    contra: "sino",   arp: "baixoArp", bat: "rock",   arpPadrao: [0, 0, 2, 0, 1, 0, 2, 3], pad: 0.4 },
  { nome: "oceano",   mel: "bolha",   contra: "flauta", arp: "harpa",   bat: "onda",    arpPadrao: [0, 2, 3, 2, 1, 2, 3, 2], pad: 0.9 },
  { nome: "montanha", mel: "flauta",  contra: "marimba", arp: "alaude", bat: "bombo",   arpPadrao: [0, 1, 2, 3, 2, 1, 2, 1], pad: 0.5 }
];

// Acordes: grau da escala (0 = I). Partes de 8 compassos; "ordem" diz como a música é montada.
const TRILHAS = [
  [ // Selva
    { bpm: 112, raiz: 65, modo: "maior", sem: 11, A: [0, 5, 3, 4, 0, 5, 1, 4], B: [3, 4, 2, 5, 3, 4, 0, 0], C: [5, 3, 0, 4, 5, 3, 1, 4], ordem: "AABACB" },
    { bpm: 100, raiz: 62, modo: "mixo", sem: 12, A: [0, 6, 3, 0, 0, 6, 3, 4], B: [3, 3, 0, 0, 1, 6, 4, 4], C: [5, 1, 6, 0, 5, 1, 4, 4], ordem: "AABBCA" }
  ],
  [ // Deserto
    { bpm: 98, raiz: 57, modo: "frigDom", sem: 21, A: [0, 1, 0, 6, 0, 1, 5, 0], B: [5, 6, 0, 0, 3, 1, 0, 0], C: [0, 6, 5, 6, 0, 6, 1, 0], ordem: "AABACB" },
    { bpm: 108, raiz: 55, modo: "harmon", sem: 22, A: [0, 3, 4, 0, 0, 5, 4, 4], B: [5, 3, 4, 0, 5, 1, 4, 4], C: [3, 0, 5, 4, 3, 0, 1, 4], ordem: "AABBAC" }
  ],
  [ // Era do Gelo
    { bpm: 84, raiz: 67, modo: "lidio", sem: 31, A: [0, 1, 0, 1, 5, 1, 4, 4], B: [3, 4, 5, 5, 3, 4, 0, 0], C: [5, 2, 3, 0, 5, 2, 1, 4], ordem: "AABACA" },
    { bpm: 92, raiz: 64, modo: "maior", sem: 32, A: [0, 4, 5, 2, 3, 0, 3, 4], B: [5, 3, 0, 4, 5, 3, 4, 4], C: [3, 4, 2, 5, 1, 4, 0, 0], ordem: "AABBAC" }
  ],
  [ // Vulcão
    { bpm: 142, raiz: 52, modo: "harmon", sem: 41, A: [0, 0, 5, 4, 0, 0, 5, 4], B: [3, 3, 0, 0, 5, 5, 4, 4], C: [0, 6, 5, 4, 0, 6, 1, 4], ordem: "AABACB" },
    { bpm: 132, raiz: 50, modo: "menor", sem: 42, A: [0, 5, 6, 0, 0, 5, 6, 4], B: [5, 3, 6, 2, 5, 3, 4, 4], C: [0, 0, 3, 3, 5, 5, 4, 4], ordem: "AABBCA" }
  ],
  [ // Oceano
    { bpm: 88, raiz: 62, modo: "dorico", sem: 51, A: [0, 3, 0, 3, 6, 3, 4, 0], B: [2, 3, 6, 0, 2, 3, 4, 4], C: [3, 6, 0, 5, 3, 6, 1, 4], ordem: "AABACA" },
    { bpm: 94, raiz: 60, modo: "maior", sem: 52, A: [0, 2, 5, 3, 0, 2, 3, 4], B: [5, 4, 3, 0, 1, 3, 4, 4], C: [3, 0, 4, 5, 3, 0, 1, 4], ordem: "AABBAC" }
  ],
  [ // Montanhas
    { bpm: 118, raiz: 64, modo: "mixo", sem: 61, A: [0, 6, 0, 3, 0, 6, 3, 0], B: [3, 0, 6, 0, 3, 0, 4, 4], C: [5, 6, 0, 0, 5, 6, 3, 4], ordem: "AABACB" },
    { bpm: 110, raiz: 62, modo: "dorico", sem: 62, A: [0, 3, 0, 6, 0, 3, 4, 0], B: [2, 3, 0, 6, 2, 3, 4, 4], C: [6, 0, 3, 0, 6, 5, 4, 4], ordem: "AABBCA" }
  ]
];
// Chefe: mais rápido, tom menor e bateria forte (usa os instrumentos do mundo)
const TRILHA_CHEFE = { bpm: 150, raiz: 52, modo: "harmon", sem: 99, A: [0, 0, 5, 5, 3, 3, 4, 4], B: [0, 6, 5, 4, 0, 6, 1, 4], C: [5, 3, 0, 4, 5, 3, 4, 4], ordem: "AABACB", chefe: true };

// ---------- Saída de áudio da música: volume, eco e compressor ----------
let musSaida = null;
function musBus() {
  if (musSaida || !audioCtx) return musSaida;
  const g = audioCtx.createGain();
  g.gain.value = 0.55;
  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.ratio.value = 3;
  const eco = audioCtx.createDelay(1);
  eco.delayTime.value = 0.32;
  const ecoVolta = audioCtx.createGain();
  ecoVolta.gain.value = 0.28;
  const ecoFiltro = audioCtx.createBiquadFilter();
  ecoFiltro.type = "lowpass"; ecoFiltro.frequency.value = 2400;
  g.connect(comp);
  g.connect(eco); eco.connect(ecoFiltro); ecoFiltro.connect(ecoVolta); ecoVolta.connect(eco); ecoVolta.connect(comp);
  comp.connect(audioCtx.destination);
  musSaida = g;
  return g;
}

function hzDe(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// Uma voz: osciladores com envelope (ataque, queda) e filtro, ligada ao bus da música
function voz(t, nota, dur, vol, o) {
  const bus = musBus();
  if (!bus) return;
  const f = hzDe(nota);
  const amp = audioCtx.createGain();
  const filtro = audioCtx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = o.corte || 3000;
  filtro.Q.value = o.q || 0.7;
  amp.connect(filtro);
  filtro.connect(bus);
  const ataque = o.ataque || 0.01;
  const solta = o.solta || 0.15;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vol, t + ataque);
  if (o.sustenta) amp.gain.setValueAtTime(vol * o.sustenta, t + Math.max(ataque, dur - solta));
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + solta);
  (o.partes || [[o.onda || "triangle", 1, 1]]).forEach(function(pt) {
    const osc = audioCtx.createOscillator();
    osc.type = pt[0];
    osc.frequency.setValueAtTime(f * pt[1], t);
    if (o.desafina) osc.detune.value = (pt[3] || 0) * o.desafina;
    const g = audioCtx.createGain();
    g.gain.value = pt[2];
    if (o.vibrato) {
      const lfo = audioCtx.createOscillator(), lg = audioCtx.createGain();
      lfo.frequency.value = 5.2; lg.gain.value = f * pt[1] * 0.006;
      lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t + 0.12); lfo.stop(t + dur + solta + 0.05);
    }
    osc.connect(g); g.connect(amp);
    osc.start(t); osc.stop(t + dur + solta + 0.05);
  });
}

const INSTR = {
  marimba:  function(t, n, d, v) { voz(t, n, Math.min(d, 0.25), v, { partes: [["sine", 1, 1], ["sine", 4, 0.18], ["triangle", 2, 0.12]], ataque: 0.004, solta: 0.35, corte: 4000 }); },
  flauta:   function(t, n, d, v) { voz(t, n, d, v * 0.9, { partes: [["sine", 1, 1], ["triangle", 2, 0.08]], ataque: 0.06, sustenta: 0.8, solta: 0.18, vibrato: true, corte: 3200 }); },
  sino:     function(t, n, d, v) { voz(t, n, Math.min(d, 0.3), v * 0.8, { partes: [["sine", 1, 1], ["sine", 2.76, 0.25], ["sine", 5.4, 0.08]], ataque: 0.003, solta: 0.9, corte: 6000 }); },
  harpa:    function(t, n, d, v) { voz(t, n, Math.min(d, 0.2), v, { partes: [["triangle", 1, 1], ["sine", 2, 0.2]], ataque: 0.004, solta: 0.5, corte: 2600 }); },
  alaude:   function(t, n, d, v) { voz(t, n, Math.min(d, 0.15), v, { partes: [["sawtooth", 1, 0.5], ["triangle", 1, 0.6]], ataque: 0.003, solta: 0.28, corte: 1800, q: 2 }); },
  lead:     function(t, n, d, v) { voz(t, n, d, v * 0.55, { partes: [["square", 1, 0.6, -1], ["sawtooth", 1, 0.4, 1]], desafina: 8, ataque: 0.01, sustenta: 0.7, solta: 0.1, corte: 2200, vibrato: true }); },
  bolha:    function(t, n, d, v) { voz(t, n, Math.min(d, 0.4), v, { partes: [["sine", 1, 1], ["sine", 2, 0.25]], ataque: 0.02, solta: 0.6, corte: 2000 }); },
  baixoArp: function(t, n, d, v) { voz(t, n, Math.min(d, 0.14), v, { partes: [["sawtooth", 1, 0.7], ["square", 0.5, 0.4]], ataque: 0.004, solta: 0.08, corte: 900, q: 4 }); },
  baixo:    function(t, n, d, v) { voz(t, n, d, v, { partes: [["triangle", 1, 1], ["sine", 0.5, 0.5]], ataque: 0.01, sustenta: 0.7, solta: 0.1, corte: 700 }); },
  pad:      function(t, n, d, v) { voz(t, n, d, v, { partes: [["sawtooth", 1, 0.5, -1], ["sawtooth", 1, 0.5, 1], ["triangle", 0.5, 0.3]], desafina: 9, ataque: 0.5, sustenta: 0.9, solta: 0.8, corte: 900 }); }
};

// ---------- bateria ----------
function bumbo(t, v) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g); g.connect(musBus()); o.start(t); o.stop(t + 0.22);
}
function ruidoMus(t, dur, v, tipo, freq) {
  const s = audioCtx.createBufferSource(); s.buffer = bufferRuido;
  const f = audioCtx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(musBus()); s.start(t); s.stop(t + dur + 0.02);
}
function tambor(t, f1, f2, dur, v) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(musBus()); o.start(t); o.stop(t + dur + 0.02);
}

// passo = colcheia (0-7 no compasso); forte = parte mais animada (B/C ou chefe)
const BATERIAS = {
  bongo:   function(t, p, forte) { if (p === 0 || p === 5) bumbo(t, 0.22); if (p === 2 || p === 6) tambor(t, 320, 200, 0.1, 0.12); if (p === 3 || p === 7) tambor(t, 420, 300, 0.07, 0.08); ruidoMus(t, 0.04, forte ? 0.05 : 0.03, "highpass", 6000); },
  darbuka: function(t, p, forte) { if (p === 0) tambor(t, 160, 70, 0.18, 0.24); if (p === 3 || p === 6) tambor(t, 260, 160, 0.08, 0.14); if (p === 5 || (forte && p === 7)) ruidoMus(t, 0.06, 0.08, "bandpass", 2500); },
  neve:    function(t, p, forte) { if (p === 0) bumbo(t, 0.12); if (p % 2 === 1) ruidoMus(t, 0.05, 0.02, "highpass", 8000); if (forte && p === 4) ruidoMus(t, 0.12, 0.05, "bandpass", 1800); },
  rock:    function(t, p, forte) { if (p === 0 || p === 3 || (forte && p === 5)) bumbo(t, 0.3); if (p === 2 || p === 6) ruidoMus(t, 0.14, 0.16, "bandpass", 1800); ruidoMus(t, 0.03, 0.05, "highpass", 8000); },
  onda:    function(t, p, forte) { if (p === 0) bumbo(t, 0.14); if (p === 4 && forte) tambor(t, 220, 140, 0.12, 0.08); if (p === 6) ruidoMus(t, 0.3, 0.03, "bandpass", 900); },
  bombo:   function(t, p, forte) { if (p === 0 || p === 3 || p === 6) tambor(t, 120, 50, 0.16, 0.24); if (p % 2 === 1) ruidoMus(t, 0.05, 0.035, "highpass", 5500); if (forte && p === 4) tambor(t, 200, 120, 0.1, 0.1); }
};

// ---------- composição: melodia por regras a partir de uma semente ----------
const RITMOS = [[2, 2, 2, 2], [3, 1, 2, 2], [2, 1, 1, 4], [1, 1, 2, 2, 2], [4, 2, 2], [2, 2, 4], [3, 3, 2], [1, 1, 1, 1, 2, 2], [2, 4, 2]];

function acordeNotas(tr, grau, oitava) {
  const esc = MODOS[tr.modo];
  const n = function(d) { return tr.raiz + esc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7) + 12 * (oitava || 0); };
  return [n(grau), n(grau + 2), n(grau + 4), n(grau + 6)];
}

// Compõe uma parte (8 compassos): motivo (2 compassos), resposta, motivo de novo e cadência
function comporParte(tr, nome, acordes) {
  const r = criarRng(tr.sem * 31 + nome.charCodeAt(0) * 7);
  const esc = MODOS[tr.modo];
  const alto = nome === "B" ? 2 : nome === "C" ? 1 : 0;
  const ritmoA = [RITMOS[Math.floor(r() * RITMOS.length)], RITMOS[Math.floor(r() * RITMOS.length)]];
  const ritmoB = [RITMOS[Math.floor(r() * RITMOS.length)], [4, 4]];
  // contorno do motivo em passos de escala (repetido nos compassos 1-2 e 5-6)
  const contorno = [];
  for (let i = 0; i < 12; i++) contorno.push(r() < 0.6 ? (r() < 0.5 ? 1 : -1) : (r() < 0.5 ? 2 : -2));
  const notas = [];   // [compasso, colcheia, duração (colcheias), grau absoluto]
  let grau = 7 + alto;  // começa uma oitava acima da raiz
  for (let c = 0; c < 8; c++) {
    const ritmo = c === 7 ? [6, 2] : (c % 4 < 2 ? ritmoA[c % 2] : (c === 6 ? ritmoA[0] : ritmoB[c % 2]));
    const acorde = acordes[c];
    let pos = 0;
    ritmo.forEach(function(dur, i) {
      if (i === 0 || pos === 4) {
        // tempo forte: nota do acorde mais perto
        const alvos = [acorde, acorde + 2, acorde + 4].map(function(a) { let g = a; while (g < grau - 3) g += 7; while (g > grau + 3) g -= 7; return g; });
        grau = alvos.reduce(function(m, g) { return Math.abs(g - grau) < Math.abs(m - grau) ? g : m; }, alvos[0]);
      } else {
        grau += contorno[(c * 3 + i) % contorno.length];
      }
      if (c === 7 && i === 0) { grau = acorde + 7 + (grau > 10 + alto ? 7 : 0); while (grau > 12 + alto) grau -= 7; }
      grau = limitar(grau, 4 + alto, 13 + alto);
      // evita a mesma nota muitas vezes seguidas (fica sem graça)
      const ant = notas.length ? notas[notas.length - 1][3] : null;
      const ant2 = notas.length > 1 ? notas[notas.length - 2][3] : null;
      if (grau === ant && (grau === ant2 || r() < 0.6) && !(c === 7 && i === 0)) grau += grau >= 12 + alto ? -1 : (r() < 0.5 ? 1 : -1);
      // pausa de vez em quando (respiração da frase), menos no começo do compasso
      const pausa = i > 0 && i === ritmo.length - 1 && c % 2 === 1 && r() < 0.35;
      if (!pausa) notas.push([c, pos, dur, grau]);
      pos += dur;
    });
  }
  return notas.map(function(n) { return [n[0], n[1], n[2], tr.raiz + esc[((n[3] % 7) + 7) % 7] + 12 * Math.floor(n[3] / 7)]; });
}

const CACHE_TRILHA = {};
function montarTrilha(tr) {
  const chave = tr.sem;
  if (CACHE_TRILHA[chave]) return CACHE_TRILHA[chave];
  const partes = {};
  ["A", "B", "C"].forEach(function(p) { partes[p] = { acordes: tr[p], notas: comporParte(tr, p, tr[p]) }; });
  // a música inteira: lista de compassos { parte, compasso, vez }
  const compassos = [];
  const vezes = {};
  tr.ordem.split("").forEach(function(p) {
    vezes[p] = (vezes[p] || 0) + 1;
    for (let c = 0; c < 8; c++) compassos.push({ parte: p, c: c, vez: vezes[p] });
  });
  CACHE_TRILHA[chave] = { tr: tr, partes: partes, compassos: compassos };
  return CACHE_TRILHA[chave];
}

// Nota da escala duas posições abaixo (a "terça" que harmoniza com a melodia)
function tercaAbaixo(tr, nota) {
  const esc = MODOS[tr.modo];
  const rel = nota - tr.raiz, oit = Math.floor(rel / 12), pc = ((rel % 12) + 12) % 12;
  let i = esc.indexOf(pc);
  if (i < 0) return nota - 3;
  i -= 2;
  return tr.raiz + esc[(i + 7) % 7] + 12 * (oit + Math.floor(i / 7));
}

// Toca uma colcheia da música (em t, tempo do audioCtx)
function tocarColcheia(m, estilo, idx, t, dt) {
  const tr = m.tr;
  const cp = m.compassos[Math.floor(idx / 8) % m.compassos.length];
  const passo = idx % 8;
  const parte = m.partes[cp.parte];
  const grau = parte.acordes[cp.c];
  const ac = acordeNotas(tr, grau, 0);
  const forte = cp.parte !== "A" || tr.chefe;
  const vol = tr.chefe ? 1.1 : 1;
  // pad: segura o acorde o compasso inteiro
  if (passo === 0) {
    const durC = dt * 8;
    [ac[0] - 12, ac[1] - 12, ac[2] - 12].forEach(function(n) { INSTR.pad(t, n, durC * 0.95, 0.035 * estilo.pad * vol); });
  }
  // baixo
  if (passo === 0 || passo === 4 || (forte && passo === 6)) INSTR.baixo(t, ac[passo === 4 ? 2 : 0] - 24, dt * (passo === 6 ? 1.5 : 3), 0.16 * vol);
  // arpejo
  const k = estilo.arpPadrao[passo];
  if (k >= 0 && (forte || passo % 2 === 0 || cp.vez > 1)) INSTR[estilo.arp](t, ac[k] - (estilo.arp === "baixoArp" ? 12 : 0), dt, (estilo.arp === "baixoArp" ? 0.09 : 0.06) * vol);
  // melodia (na segunda vez a parte A ganha uma segunda voz, uma terça abaixo)
  parte.notas.forEach(function(n) {
    if (n[0] !== cp.c || n[1] !== passo) return;
    INSTR[estilo.mel](t, n[3], dt * n[2] * 0.95, 0.12 * vol);
    if (cp.vez > 1 || tr.chefe) INSTR[estilo.contra](t + 0.01, tercaAbaixo(tr, n[3]), dt * n[2] * 0.9, 0.05 * vol);
  });
  // bateria (some na primeira volta da parte A, para começar suave)
  if (!(cp.parte === "A" && cp.vez === 1 && cp.c < 2 && !tr.chefe)) BATERIAS[tr.chefe ? "rock" : estilo.bat](t, passo, forte);
  // virada no último compasso de cada parte
  if (cp.c === 7 && passo >= 6 && forte) tambor(t, 300 - passo * 20, 120, 0.08, 0.1);
}

// ---------- tocador ----------
let musW = -1, musChefe = false, musFaixa = 0, musIdx = 0, musProx = 0, musAte = 0, ambProx = 0, ambUltimo = -1;

function musTick() {
  if (!audioCtx || estado !== "jogo" || !fase) { musW = -1; return; }
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
  const chefeAgora = !!fase.ehChefe;
  if (musW !== w || musChefe !== chefeAgora) { musW = w; musChefe = chefeAgora; musFaixa = fase.indice % 2; musIdx = 0; musProx = 0; musAte = 0; }
  if (agora < musAte) return;   // pausa curta entre uma música e outra
  let tr = chefeAgora ? Object.assign({}, TRILHA_CHEFE, { raiz: TRILHAS[w][0].raiz - 12 + (w === 3 ? 12 : 0), sem: 99 + w }) : TRILHAS[w][musFaixa % 2];
  const m = montarTrilha(tr);
  const dt = 30 / tr.bpm;
  const total = m.compassos.length * 8;
  if (musProx < agora) musProx = agora + 0.05;
  while (musProx < agora + 0.35) {
    tocarColcheia(m, ESTILOS[w], musIdx, musProx, dt);
    musProx += dt;
    if (++musIdx >= total) {
      musIdx = 0;
      musFaixa++;
      musAte = musProx + (chefeAgora ? 0.5 : 6);
      return;
    }
  }
}

setInterval(function() { try { musTick(); } catch (e) { /* sem som */ } }, 120);
