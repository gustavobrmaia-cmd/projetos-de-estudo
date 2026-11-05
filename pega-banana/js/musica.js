"use strict";

// =========================
// MÚSICA, SONS DE AMBIENTE E PASSOS (gerados na hora, sem arquivos)
// Cada mapa (selva, deserto, gelo, oceano, montanhas, lava) tem 3 músicas próprias que tocam em sequência,
// com 30 segundos de silêncio entre elas. Sons de ambiente tocam só de vez em quando (9 a 20 s).
// =========================

// (as trilhas agora ficam em js/trilhas.js)

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

// (o tocador das trilhas fica em js/trilhas.js)
