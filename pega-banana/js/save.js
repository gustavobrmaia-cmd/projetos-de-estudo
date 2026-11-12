"use strict";

// =========================
// SAVE (fica guardado no navegador)
// =========================


function buscarItem(tipo, id) {
  if (tipo === "skin") return SKINS.find(function(s) { return s.id === id; }) || null;
  return ITENS.find(function(i) { return i.id === id && i.tipo === tipo; }) || null;
}

function copiaTeclasPadrao() {
  const t = {};
  Object.keys(TECLAS_PADRAO).forEach(function(a) { t[a] = TECLAS_PADRAO[a].slice(); });
  return t;
}

function saveNovo() {
  const poderes = {};
  PODERES.forEach(function(p) { poderes[p.id] = 0; });
  return {
    moedas: 0,
    comprados: SKINS.filter(function(s) { return s.preco === 0; }).map(function(s) { return s.id; }),
    equip: { skin: SKINS[0].id, chapeu: null, oculos: null, roupa: null },
    desbloqueado: 0,              // maior fase liberada
    chefes: MUNDOS.map(function() { return false; }),
    mapaVersao: 2,                // 2 = 6 mundos com 10 fases + chefe
    poderes: poderes,             // quantos de cada poder você tem
    melhorias: [],                // ids das melhorias permanentes
    nivel: 1,
    xp: 0,
    teclas: copiaTeclasPadrao(),
    stats: { inimigos: 0, chutes: 0, chefes: 0, mortes: 0, tempo: 0 },
    viuIntro: false,
    viuTutorial: false,           // já fez a primeira visita (história -> 1-1 sem menu)
    zerou: false,
    mudo: false,
    idioma: "",                   // "pt", "en", "es"... (IDIOMAS em idioma.js) ou vazio (segue o navegador)
    cronometro: false,            // cronômetro de speedrun na tela
    recordes: { fases: [], run: 0 },
    estrelas: [],
                      // por fase: 1 = completa, 2 = sem perder vida, 4 = meta de tempo   // melhores tempos (em quadros de 1/60s)
  };
}

let save = saveNovo();

(function carregarSave() {
  let s = null;
  let versao = 3;
  try {
    s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) { s = JSON.parse(localStorage.getItem("primata-save-v2")); versao = 2; }
    if (!s) { s = JSON.parse(localStorage.getItem("primata-save-v1")); versao = 1; }
  } catch (e) { s = null; }
  if (!s || typeof s !== "object") return;

  if (typeof s.moedas === "number" && s.moedas >= 0) save.moedas = Math.floor(s.moedas);
  if (Array.isArray(s.comprados)) {
    s.comprados.forEach(function(id) {
      if (typeof id === "string" && save.comprados.indexOf(id) < 0) save.comprados.push(id);
    });
  }
  if (s.equip) {
    ["skin", "pet"].concat(CAMADAS).forEach(function(tipo) {
      const id = s.equip[tipo];
      if (id && buscarItem(tipo, id) && save.comprados.indexOf(id) >= 0) save.equip[tipo] = id;
    });
  }
  // Saves antigos: 4 mundos (Selva, Deserto, Gelo, Lava) com 5 fases + chefe (ou 3 + chefe na versão 2).
  // Agora são 6 mundos (Oceano e Montanhas antes da Lava) com 10 fases + chefe.
  const antigo = s.mapaVersao !== 2;
  const porMundoAntigo = versao === 2 ? 4 : 6;
  const MUNDO_ANTIGO = [M_SELVA, M_DESERTO, M_GELO, M_LAVA];
  function converter(i) {
    const m = Math.floor(i / porMundoAntigo), e = i % porMundoAntigo;
    if (m >= MUNDO_ANTIGO.length) return -1;
    const chefe = e === porMundoAntigo - 1;
    return idxFase(MUNDO_ANTIGO[m], chefe ? FASES_POR_MUNDO - 1 : Math.min(FASES_NORMAIS - 1, e * 2));
  }
  if (typeof s.desbloqueado === "number") {
    let d = Math.floor(s.desbloqueado);
    if (antigo) {
      const m = Math.floor(d / porMundoAntigo);
      // quem já tinha chegado na Lava continua no primeiro mundo novo (o Oceano)
      d = m >= 3 ? idxFase(M_OCEANO, 0) : Math.max(0, converter(d));
    }
    save.desbloqueado = limitar(d, 0, TOTAL_FASES - 1);
  }
  if (Array.isArray(s.chefes)) {
    if (antigo) {
      save.chefes[M_SELVA] = !!s.chefes[0]; save.chefes[M_DESERTO] = !!s.chefes[1];
      save.chefes[M_GELO] = !!s.chefes[2]; save.chefes[M_LAVA] = !!s.chefes[3];
    } else {
      save.chefes = save.chefes.map(function(v, i) { return !!s.chefes[i]; });
    }
  }
  if (s.poderes) {
    PODERES.forEach(function(p) {
      const n = s.poderes[p.id];
      if (typeof n === "number" && n > 0) save.poderes[p.id] = Math.floor(n);
    });
  }
  if (Array.isArray(s.melhorias)) {
    // o revólver saiu do jogo: quem tinha comprado o Revólver Turbo recebe as 500 moedas de volta
    if (s.melhorias.indexOf("revolver") >= 0) save.moedas += 500;
    save.melhorias = s.melhorias.filter(function(id) {
      return MELHORIAS.some(function(m) { return m.id === id; });
    });
  }
  if (typeof s.nivel === "number" && s.nivel >= 1) save.nivel = Math.floor(s.nivel);
  if (typeof s.xp === "number" && s.xp >= 0) save.xp = Math.floor(s.xp);
  if (s.teclas && typeof s.teclas === "object") {
    ACOES.forEach(function(a) {
      const lista = s.teclas[a.id];
      if (Array.isArray(lista)) save.teclas[a.id] = lista.filter(function(k) { return typeof k === "string"; }).slice(0, 3);
    });
    // save antigo: a tecla do revólver (K) vira mais uma tecla do cipó-laço
    // pulo: o Espaço vem primeiro (é a tecla que aparece nas placas); só muda quem nunca mexeu nele
    if ((save.teclas.pulo || []).join("|") === "w|arrowup| ") save.teclas.pulo = [" ", "w", "arrowup"];
    if (Array.isArray(s.teclas.tiro)) {
      const usadas = {};
      ACOES.forEach(function(a) { (save.teclas[a.id] || []).forEach(function(k) { usadas[k] = true; }); });
      s.teclas.tiro.forEach(function(k) {
        if (typeof k === "string" && !usadas[k] && save.teclas.laco.length < 3) save.teclas.laco.push(k);
      });
    }
  }
  if (s.stats) {
    Object.keys(save.stats).forEach(function(k) {
      if (typeof s.stats[k] === "number") save.stats[k] = s.stats[k];
    });
  }
  save.viuIntro = !!s.viuIntro;
  // quem já jogava antes do tutorial existir não precisa dele
  save.viuTutorial = !!s.viuTutorial || !!s.viuIntro || (s.desbloqueado || 0) > 0;
  save.zerou = !!s.zerou;
  save.mudo = !!s.mudo;
  save.cronometro = !!s.cronometro;
  if (Array.isArray(s.estrelas)) {
    if (antigo) {
      save.estrelas = [];
      s.estrelas.forEach(function(v, i) { const n = converter(i); if (n >= 0 && typeof v === "number") save.estrelas[n] = v & 7; });
    } else {
      save.estrelas = s.estrelas.slice(0, TOTAL_FASES).map(function(v) { return typeof v === "number" ? v & 7 : 0; });
    }
  } else {
    // save antigo: fases já passadas ganham a 1ª estrela
    for (let i = 0; i < TOTAL_FASES; i++) {
      const chefe = i % FASES_POR_MUNDO === FASES_POR_MUNDO - 1;
      const feita = chefe ? save.chefes[Math.floor(i / FASES_POR_MUNDO)] : (i < save.desbloqueado || save.zerou);
      save.estrelas[i] = feita ? 1 : 0;
    }
  }
  if (idiomaValido(s.idioma)) save.idioma = s.idioma;
  if (s.recordes && typeof s.recordes === "object") {
    if (Array.isArray(s.recordes.fases)) {
      const ok = function(v) { return typeof v === "number" && v > 0 ? Math.floor(v) : 0; };
      if (antigo) {
        save.recordes.fases = [];
        s.recordes.fases.forEach(function(v, i) { const n = converter(i); if (n >= 0) save.recordes.fases[n] = ok(v); });
      } else {
        save.recordes.fases = s.recordes.fases.slice(0, TOTAL_FASES).map(ok);
      }
    }
    // a run antiga tinha menos fases: o recorde não vale mais
    if (antigo) s.recordes.run = 0;
    if (typeof s.recordes.run === "number" && s.recordes.run > 0) save.recordes.run = Math.floor(s.recordes.run);
  }
})();

function salvar() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* navegador bloqueou */ }
}

function temMelhoria(id) {
  return save.melhorias.indexOf(id) >= 0;
}

function temCosmetico(id) {
  return save.comprados.indexOf(id) >= 0;
}

// Nome da tecla principal de uma ação (para mostrar nas placas e na tela)
function teclaDe(acao) {
  const lista = save.teclas[acao] || [];
  const k = lista.find(function(x) { return x; });
  return nomeDaTecla(k);
}
