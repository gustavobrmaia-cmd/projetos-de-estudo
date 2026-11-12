"use strict";

// =========================
// CONFIGURAÇÕES
// =========================

// Fundo da Selva (primeiro mundo). Vazio = o jogo desenha o próprio fundo em pixel art.
// Para publicar (Poki, itch.io) deixe vazio: imagem de outro site pode sair do ar ou ter direitos autorais.
const FUNDO_SELVA_URL = "";

// Sua imagem do macaco: vira a skin "Original" na loja (se não carregar, a skin some).
// As roupas são desenhadas para o macaco pixelado, então na sua imagem podem não encaixar perfeito.
// Vazio = só as skins em pixel art. Um caminho do seu PC (file:///C:/...) só funciona no seu computador.
const IMAGEM_PERSONAGEM = "";

// Poki: true carrega o SDK de anúncios do Poki (intervalo entre fases e "assista para reviver").
// Se o SDK não carregar (sem internet, bloqueador de anúncio), o jogo segue normal, sem anúncios.
// false = nada do Poki carrega (bom para itch.io).
const USAR_POKI = false;

// Moeda: por padrão é pixelada feita no código. Para usar seu PNG: imagem: "moeda.png", frames: quadros
const MOEDA = { imagem: "", frames: 8, tamanho: 32 };


// =========================
// MUNDOS
// Cada mundo tem 10 fases + o chefe. A cada 2 fases entra um inimigo novo e um obstáculo novo
// (fases 1-2: o 1º de cada lista, 3-4: o 2º, ... 9-10: o 5º).
// A ordem da lista é a ordem do jogo: a lava fica por último (o Dragão guarda a banana).
// =========================

const MUNDOS = [
  { id: "selva",    nome: "Selva",              cor: "#2f9e44", chefe: "gorila",       nomeChefe: "Gorila Rei",
    inimigos: ["cobra", "abelha", "sapo", "macacoLadrao", "aranha"],
    obstaculos: ["espinhos", "cipo", "cogumelo", "troncos", "plantas"] },
  { id: "deserto",  nome: "Deserto",            cor: "#e8a33d", chefe: "escorpiaoRei", nomeChefe: "Escorpião Faraó",
    inimigos: ["escorpiao", "abutre", "cacto", "mumia", "tatu"],
    obstaculos: ["areia", "tornado", "cospeAreia", "pedraRolante", "ventania"] },
  { id: "gelo",     nome: "Era do Gelo",        cor: "#4dabf7", chefe: "yeti",         nomeChefe: "Yeti Ancestral",
    inimigos: ["pinguim", "morcegoGelo", "boneco", "foca", "lobo"],
    obstaculos: ["tunel", "estalactites", "pista", "geloFino", "avalanche"] },
  { id: "oceano",   nome: "Oceano",             cor: "#15aabf", chefe: "tubarao",      nomeChefe: "Tubarão Abissal",
    inimigos: ["caranguejo", "aguaViva", "baiacu", "polvo", "peixeEspada"],
    obstaculos: ["corrente", "concha", "minas", "fumarola", "ancoras"] },
  { id: "montanha", nome: "Montanhas Rochosas", cor: "#b07a4f", chefe: "condor",       nomeChefe: "Condor dos Andes",
    inimigos: ["cabra", "aguia", "marmota", "lhama", "urso"],
    obstaculos: ["rochasCaindo", "ponteCorda", "tirolesa", "correnteAr", "pendulo"] },
  { id: "lava",     nome: "Vulcão de Lava",     cor: "#e8590c", chefe: "dragao",       nomeChefe: "Dragão de Magma",
    inimigos: ["slime", "morcegoFogo", "diabinho", "golem", "fenix"],
    obstaculos: ["lagoLava", "geiser", "plataformasCaem", "barraFogo", "meteoros"] }
];

// Índices dos mundos (use estes nomes em vez de números soltos)
const M_SELVA = 0, M_DESERTO = 1, M_GELO = 2, M_OCEANO = 3, M_MONTANHA = 4, M_LAVA = 5;

const FASES_NORMAIS = 10;                     // fases antes do chefe
const FASES_POR_MUNDO = FASES_NORMAIS + 1;    // + o chefe
const TOTAL_FASES = MUNDOS.length * FASES_POR_MUNDO;
const RECOMPENSA_CHEFE = [150, 250, 350, 450, 550, 700];

function idxFase(mundo, etapa) { return mundo * FASES_POR_MUNDO + etapa; }
// Qual inimigo/obstáculo novo a fase libera (0 a 4): um a cada 2 fases
function nivelDaEtapa(etapa) { return Math.min(4, Math.floor(etapa / 2)); }
function idMundo(m) { return MUNDOS[m] ? MUNDOS[m].id : ""; }

const NOMES_OBSTACULO = {
  espinhos: "Espinhos", cipo: "Cipós de balançar", cogumelo: "Cogumelo pula-pula", troncos: "Troncos rolando",
  plantas: "Plantas carnívoras", areia: "Areia movediça", tornado: "Redemoinho", cospeAreia: "Cospe-areia",
  pedraRolante: "Pedras rolando", ventania: "Ventania de areia", tunel: "Túnel de gelo (deslize!)",
  estalactites: "Estalactites", pista: "Pista de gelo", geloFino: "Gelo fino", avalanche: "Avalanche",
  corrente: "Correnteza", concha: "Concha gigante", minas: "Minas do mar", fumarola: "Fumarola", ancoras: "Âncoras caindo",
  rochasCaindo: "Rochas caindo", ponteCorda: "Ponte de corda", tirolesa: "Tirolesa", correnteAr: "Corrente de ar",
  pendulo: "Pêndulo de pedra",
  lagoLava: "Lago de lava", geiser: "Rocha de impulso", plataformasCaem: "Plataformas que caem",
  barraFogo: "Barra de fogo", meteoros: "Chuva de meteoros"
};

function nomeFase(i) {
  const m = Math.floor(i / FASES_POR_MUNDO);
  const e = i % FASES_POR_MUNDO;
  if (!MUNDOS[m]) return "";
  if (e === FASES_POR_MUNDO - 1) return tr("{0} - Chefe", MUNDOS[m].nome);
  return MUNDOS[m].nome + " " + (m + 1) + "-" + (e + 1);
}


// =========================
// INIMIGOS
// comp: como se mexe   hp: vida   espinhoso: não dá para pisar em cima
// =========================

const TIPOS_INIMIGO = {
  cobra:        { nome: "Cobra",            comp: "patrulha",    vel: 1.2, hp: 1 },
  abelha:       { nome: "Abelha",           comp: "voador",      vel: 1.6, hp: 1, voa: true, amplitude: 30 },
  sapo:         { nome: "Sapo",             comp: "pulador",     vel: 3,   hp: 1, pulo: -11 },
  macacoLadrao: { nome: "Macaco Ladrão",    comp: "atirador",    hp: 2, tiro: "coco", intervalo: 110 },
  aranha:       { nome: "Aranha",           comp: "aranha",      vel: 4,   hp: 1, voa: true },
  escorpiao:    { nome: "Escorpião",        comp: "patrulha",    vel: 1.7, hp: 2 },
  abutre:       { nome: "Abutre",           comp: "mergulhador", vel: 1.6, hp: 1, voa: true, amplitude: 20 },
  cacto:        { nome: "Cacto Atirador",   comp: "atirador",    hp: 2, espinhoso: true, tiro: "espinho", intervalo: 185 },
  mumia:        { nome: "Múmia",            comp: "patrulha",    vel: 0.9, hp: 3 },
  tatu:         { nome: "Tatu-bola",        comp: "investida",   vel: 1,   hp: 2, velInvestida: 8, rolaEspinhoso: true },
  pinguim:      { nome: "Pinguim",          comp: "investida",   vel: 1,   hp: 1, velInvestida: 7 },
  morcegoGelo:  { nome: "Morcego de Gelo",  comp: "voador",      vel: 2.2, hp: 1, voa: true, amplitude: 50 },
  boneco:       { nome: "Boneco de Neve",   comp: "atirador",    hp: 2, tiro: "neve", intervalo: 120 },
  foca:         { nome: "Foca",             comp: "pulador",     vel: 3.5, hp: 2, pulo: -12 },
  lobo:         { nome: "Lobo do Gelo",     comp: "investida",   vel: 1.8, hp: 2, velInvestida: 9 },
  // Oceano
  caranguejo:   { nome: "Caranguejo",       comp: "patrulha",    vel: 1.4, hp: 2 },
  aguaViva:     { nome: "Água-viva",        comp: "aguaViva",    vel: 0.7, hp: 1, voa: true, espinhoso: true, amplitude: 70 },
  baiacu:       { nome: "Baiacu",           comp: "baiacu",      vel: 1.1, hp: 2, nada: true },
  polvo:        { nome: "Polvo",            comp: "atirador",    hp: 2, tiro: "tinta", intervalo: 150 },
  peixeEspada:  { nome: "Peixe-espada",     comp: "investidaNado", vel: 0.8, hp: 2, nada: true, velInvestida: 9 },
  // Montanhas Rochosas
  cabra:        { nome: "Cabra-montesa",    comp: "investida",   vel: 1.3, hp: 2, velInvestida: 8.5 },
  aguia:        { nome: "Águia",            comp: "mergulhador", vel: 1.9, hp: 1, voa: true, amplitude: 25 },
  marmota:      { nome: "Marmota",          comp: "toca",        hp: 1 },
  lhama:        { nome: "Lhama",            comp: "atirador",    hp: 2, tiro: "cuspe", intervalo: 140 },
  urso:         { nome: "Urso Pardo",       comp: "patrulha",    vel: 1.0, hp: 4 },
  slime:        { nome: "Slime de Magma",   comp: "pulador",     vel: 3.5, hp: 2, pulo: -13, espinhoso: true },
  morcegoFogo:  { nome: "Morcego de Fogo",  comp: "voador",      vel: 3,   hp: 1, voa: true, amplitude: 60 },
  diabinho:     { nome: "Diabinho",         comp: "atirador",    hp: 2, tiro: "fogo", intervalo: 95 },
  golem:        { nome: "Golem de Pedra",   comp: "atirador",    hp: 4, tiro: "pedra", intervalo: 130 },
  fenix:        { nome: "Fênix",            comp: "mergulhador", vel: 2.4, hp: 2, voa: true, amplitude: 30, rastro: "#ff922b" }
};

function categoriaInimigo(tipo) {
  const t = TIPOS_INIMIGO[tipo];
  if (t.comp === "aranha") return "aranha";
  if (t.nada) return "nadador";
  if (t.voa) return "voador";
  if (t.comp === "atirador") return "atirador";
  return "terrestre";
}


// =========================
// XP E NÍVEIS
// =========================

const XP = { moeda: 1, inimigo: 10, chute: 15, checkpoint: 15, powerup: 5, fase: 60, chefe: 300 };

function xpParaSubir(nivel) {
  return 100 + (nivel - 1) * 60;
}


// =========================
// SKINS E ROUPAS (desenhadas numa grade 20x20)
// preco: compra na loja   fase: ganha ao passar daquela fase   nivel: ganha ao chegar no nível
// detalhe: desenho por cima do corpo (listras, manchas...)   faixas: cores do pelo por linha
// =========================

const CORES_BASE = { E: "#111111", W: "#ffffff", M: "#6b2a1a" };

const SKINS = [
  { id: "classico", nome: "Clássico", preco: 0,
    cores: { F: "#8a5a2b", D: "#3b2412", P: "#e8c08a", B: "#c79a62" } },
  { id: "dourado", nome: "Dourado", preco: 150,
    cores: { F: "#e0a526", D: "#6e4504", P: "#fff0c2", B: "#ffd166" } },
  { id: "chiclete", nome: "Chiclete", preco: 200,
    cores: { F: "#f783ac", D: "#a61e4d", P: "#ffdeeb", B: "#fcc2d7" } },
  { id: "gelo", nome: "Gelo", preco: 250,
    cores: { F: "#e8f1f8", D: "#4a6a8a", P: "#a8d8ff", B: "#ffffff", E: "#1b3a5c" } },
  { id: "sombra", nome: "Sombra", preco: 300,
    cores: { F: "#3a2f4a", D: "#0e0914", P: "#a08cc0", B: "#5d4b78", E: "#ff3b6b", W: "#ffd1dc" } },
  { id: "camuflado", nome: "Camuflado", preco: 350,
    cores: { F: "#5c7a3a", D: "#1f2a14", P: "#c9b89a", B: "#7a8f52" },
    detalhe: { y: 4, cores: { N: "#3b2a14", G: "#2f4a1f" }, mapa: [
      "........NN..........",
      "......GG....NN......",
      "..............G.....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".......NN...........",
      "......G.....GG......",
      "..........NN........",
      "......GG....N......."
    ] } },
  { id: "fogo", nome: "Fogo", preco: 350,
    cores: { F: "#d9480f", D: "#5c1a03", P: "#ffd8a8", B: "#ffa94d" },
    detalhe: { y: 1, cores: { Y: "#ffd43b", O: "#ff922b" }, mapa: [
      "........Y...........",
      ".......YO.Y.........",
      "......YOOYO.........",
      "........OO.........."
    ] } },
  { id: "dalmata", nome: "Dálmata", preco: 400,
    cores: { F: "#f8f9fa", D: "#343a40", P: "#ffe3e3", B: "#ffffff" },
    detalhe: { y: 4, cores: { K: "#212529" }, mapa: [
      "..........KK........",
      "......K.............",
      "..K.............K...",
      "....K...............",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".......K............",
      "............K.......",
      "......K.............",
      "...........K........",
      "........K....K......"
    ] } },
  { id: "zumbi", nome: "Zumbi", preco: 400,
    cores: { F: "#5c8a3a", D: "#1f3312", P: "#b5d99c", B: "#8fbf6a", E: "#c92a2a", W: "#f8f9c8", M: "#3a1010" },
    detalhe: { y: 4, cores: { K: "#1f3312", N: "#6b4220" }, mapa: [
      ".......K.K.K........",
      ".......KKKKK........",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".........NN.........",
      "........NNN........."
    ] } },
  { id: "zebra", nome: "Zebra", preco: 450,
    cores: { F: "#f8f9fa", D: "#111111", P: "#dee2e6", B: "#ffffff" },
    detalhe: { y: 4, cores: { K: "#111111" }, mapa: [
      "........K.K.........",
      ".......K.K.K........",
      "......K.......K.....",
      "....K..........K....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "......K......K......",
      ".....K........K.....",
      "......K......K......",
      "......K......K......",
      ".......K....K......."
    ] } },
  { id: "panda", nome: "Panda", preco: 450,
    cores: { F: "#f8f9fa", D: "#111111", P: "#ffffff", B: "#dee2e6" },
    detalhe: { y: 6, cores: { K: "#111111" }, mapa: [
      ".KK..............KK.",
      ".....KKKK..KKKK.....",
      ".....K..K..K..K.....",
      ".....K..K..K..K.....",
      "......KK....KK......",
      "....................",
      "....................",
      "....................",
      "....................",
      "....KK........KK....",
      "....K..........K....",
      "....K..........K....",
      ".....KKKKKKKKK......"
    ] } },
  { id: "robo", nome: "Robô", preco: 600,
    cores: { F: "#868e96", D: "#212529", P: "#ced4da", B: "#adb5bd", E: "#22b8cf", W: "#0b7285", M: "#343a40" },
    detalhe: { y: 0, cores: { R: "#ff3b3b", K: "#495057", Y: "#ffd43b", G: "#40c057" }, mapa: [
      ".........R..........",
      ".........K..........",
      ".........K..........",
      "....................",
      "....................",
      "....................",
      "....................",
      "....Y..........Y....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".........RG.........",
      "........GRG........."
    ] } },
  { id: "esqueleto", nome: "Esqueleto", preco: 650,
    cores: { F: "#1a1a1a", D: "#000000", P: "#e9ecef", B: "#1a1a1a", E: "#ff3b3b", W: "#000000", M: "#000000" },
    detalhe: { y: 14, cores: { W: "#e9ecef" }, mapa: [
      "........WW..........",
      ".......WWWW.........",
      "........WW..........",
      ".......WWWW........."
    ] } },
  { id: "neon", nome: "Neon", preco: 700,
    cores: { F: "#111827", D: "#00f5d4", P: "#2b2d42", B: "#1b1f3a", E: "#ff00e5", W: "#00f5d4", M: "#ff00e5" } },
  { id: "fantasma", nome: "Fantasma", preco: 750,
    cores: { F: "rgba(255,255,255,0.6)", D: "rgba(190,210,255,0.8)", P: "rgba(255,255,255,0.8)", B: "rgba(230,240,255,0.6)", E: "#1c1c3c" } },
  { id: "diamante", nome: "Diamante", preco: 900,
    cores: { F: "#3bc9db", D: "#0b7285", P: "#e3fafc", B: "#99e9f2", E: "#1864ab" },
    detalhe: { y: 4, cores: { W: "#ffffff" }, mapa: [
      ".........W..........",
      "....................",
      "......W.......W.....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "............W.......",
      "......W.............",
      "....................",
      "..........W........."
    ] } },
  { id: "galaxia", nome: "Galáxia", preco: 1200,
    cores: { F: "#2b1d5c", D: "#0b0620", P: "#c0a9ff", B: "#4c2a9e", E: "#ffffff", W: "#ff9cf3", M: "#ff6bd6" },
    detalhe: { y: 4, cores: { W: "#ffffff", Y: "#ffe066" }, mapa: [
      "........W...........",
      "............W.......",
      "......Y.......W.....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".......W............",
      "..............Y.....",
      "....................",
      "............Y......."
    ] } },
  { id: "arcoiris", nome: "Arco-íris", preco: 1500,
    faixas: ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#9775fa"],
    cores: { F: "#ff6b6b", D: "#2b2b2b", P: "#fff4e6", B: "#ffffff" } },

  // ---------- Ganhas passando de fase ----------
  { id: "tigre", nome: "Tigre", fase: idxFase(M_SELVA, 8),
    cores: { F: "#f08c00", D: "#5c2b00", P: "#fff4e6", B: "#ffffff" },
    detalhe: { y: 4, cores: { K: "#2b1400" }, mapa: [
      "........K.K.........",
      ".......K.K.K........",
      "....................",
      "....K..........K....",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "......K......K......",
      "....................",
      "......K......K......",
      "....................",
      ".......K....K......."
    ] } },
  { id: "gorila", nome: "Gorila", fase: idxFase(M_SELVA, 10),
    cores: { F: "#3d3d3d", D: "#141414", P: "#a07a5a", B: "#7a7a7a", E: "#c92a2a" } },
  { id: "camelo", nome: "Camelo", fase: idxFase(M_DESERTO, 8),
    cores: { F: "#c9a26b", D: "#6b4f2a", P: "#f2e1c2", B: "#e0c79c" } },
  { id: "pinguimSkin", nome: "Pinguim", fase: idxFase(M_GELO, 6),
    cores: { F: "#1e2a44", D: "#0b1020", P: "#ffffff", B: "#ffffff", M: "#ff922b" } },
  { id: "yetiSkin", nome: "Yeti", fase: idxFase(M_GELO, 10),
    cores: { F: "#f8f9fa", D: "#1c3d5a", P: "#9fb3c8", B: "#ffffff", E: "#c92a2a" } },
  { id: "lavaSkin", nome: "Lava", fase: idxFase(M_LAVA, 6),
    cores: { F: "#343a40", D: "#111111", P: "#ff922b", B: "#495057", E: "#ffd43b" },
    detalhe: { y: 4, cores: { O: "#ff6b00", Y: "#ffd43b" }, mapa: [
      "........O...........",
      ".........OO.........",
      "...........O........",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "......O.............",
      ".......OY.......O...",
      ".............O......",
      ".......O....YO......"
    ] } },
  { id: "dragaoSkin", nome: "Dragão", fase: idxFase(M_LAVA, 10),
    cores: { F: "#c92a2a", D: "#2b0a0a", P: "#ff922b", B: "#ffd43b", E: "#111111" },
    detalhe: { y: 1, cores: { H: "#f1f3f5" }, mapa: [
      "......H......H......",
      "......HH....HH......",
      ".......H....H......."
    ] } },

  // ---------- Ganhas subindo de nível ----------
  { id: "bronze", nome: "Bronze", nivel: 5,
    cores: { F: "#b0703c", D: "#4a2a10", P: "#f2d0a9", B: "#d9a066" },
    detalhe: { y: 4, cores: { W: "#ffe8cc" }, mapa: [".........W..........", "....................", "......W............."] } },
  { id: "prata", nome: "Prata", nivel: 10,
    cores: { F: "#ced4da", D: "#495057", P: "#f8f9fa", B: "#e9ecef" },
    detalhe: { y: 4, cores: { W: "#ffffff" }, mapa: [".........W..........", "....................", "......W.......W....."] } },
  { id: "ouro", nome: "Ouro", nivel: 15,
    cores: { F: "#fab005", D: "#7a4f05", P: "#fff3bf", B: "#ffe066" },
    detalhe: { y: 4, cores: { W: "#ffffff" }, mapa: [
      ".........W..........", "....................", "......W.......W.....",
      "....................", "....................", "....................", "....................",
      "....................", "....................", "....................", "............W......."
    ] } },
  { id: "lendario", nome: "Lendário", nivel: 20,
    cores: { F: "#3b1f6e", D: "#ffd43b", P: "#e5dbff", B: "#5f3dc4", E: "#ffd43b", W: "#ffffff" },
    detalhe: { y: 1, cores: { Y: "#ffd43b", W: "#ffffff" }, mapa: [
      ".......Y.YY.Y.......", ".......YYYYYY.......", "....................",
      "....................", "........W...........", "....................", "......Y.......W.....",
      "....................", "....................", "....................", "....................",
      "....................", "....................", "....................", ".......W......Y.....",
      "....................", "............W......."
    ] } }
];


if (IMAGEM_PERSONAGEM) {
  SKINS.unshift({ id: "original", nome: "Original", preco: 0, imagem: true });
}

// y = linha da grade onde o desenho começa
const ITENS = [
  // ---------- Chapéus ----------
  { id: "bone", tipo: "chapeu", nome: "Boné", preco: 80, y: 2,
    cores: { R: "#d62828", W: "#ffffff", K: "#7a1010" },
    mapa: ["......RRRRRRR.......", ".....RRRWRRRRR......", ".....KRRRRRRRRRRRR.."] },
  { id: "festa", tipo: "chapeu", nome: "Chapéu de Festa", preco: 100, y: 0,
    cores: { W: "#ffffff", P: "#e64980", Y: "#ffd43b" },
    mapa: [".........WW.........", "........PPPP........", ".......PYPPYP.......", "......PPPYYPPP......"] },
  { id: "gorro", tipo: "chapeu", nome: "Gorro", preco: 120, y: 0,
    cores: { W: "#ffffff", B: "#1c7ed6" },
    mapa: [".........WW.........", ".......BBBBBB.......", "......BBBBBBBB......", ".....BBBBBBBBBB.....", ".....WWWWWWWWWW....."] },
  { id: "cowboy", tipo: "chapeu", nome: "Chapéu de Cowboy", preco: 180, y: 0,
    cores: { N: "#8a5a2b", K: "#3b2412" },
    mapa: ["........NNNN........", ".......NNNNNN.......", ".......KKKKKK.......", "..NNNNNNNNNNNNNNNN..", "...NN..........NN..."] },
  { id: "cartola", tipo: "chapeu", nome: "Cartola", preco: 220, y: 0,
    cores: { K: "#1a1a1a", R: "#c92a2a" },
    mapa: ["......KKKKKKKK......", "......KKKKKKKK......", "......RRRRRRRR......", "....KKKKKKKKKKKK...."] },
  { id: "chef", tipo: "chapeu", nome: "Chapéu de Chef", preco: 250, y: 0,
    cores: { W: "#ffffff", G: "#ced4da" },
    mapa: ["......WW.WW.WW......", ".....WWWWWWWWWW.....", ".....WWWWWWWWWW.....", "......GWWWWWWG......", "......GGGGGGGG......"] },
  { id: "viking", tipo: "chapeu", nome: "Capacete Viking", preco: 320, y: 0,
    cores: { W: "#f1f3f5", G: "#868e96", Y: "#fab005" },
    mapa: [".W................W.", ".WW.....GGGG.....WW.", "..WW..GGGGGGGG..WW..", "...WWGGGGGGGGGGWW...", ".....YYYYYYYYYY....."] },
  { id: "aureola", tipo: "chapeu", nome: "Auréola", preco: 500, y: 0,
    cores: { Y: "#ffe066" },
    mapa: ["......YYYYYYYY......", ".....Y........Y.....", "......YYYYYYYY......"] },
  { id: "coroa", tipo: "chapeu", nome: "Coroa", preco: 800, y: 0,
    cores: { Y: "#ffd43b", R: "#e03131", O: "#c98a00" },
    mapa: [".......Y.YY.Y.......", ".......YYRRYY.......", ".......YYYYYY.......", "......OOOOOOOO......"] },
  { id: "folha", tipo: "chapeu", nome: "Folha", fase: idxFase(M_SELVA, 0), y: 0,
    cores: { G: "#40c057", g: "#2b8a3e", N: "#6b4220" },
    mapa: ["..........GG........", "........GGGgG.......", ".......GGgGGG.......", "........NGG........."] },
  { id: "explorador", tipo: "chapeu", nome: "Chapéu de Explorador", fase: idxFase(M_SELVA, 5), y: 0,
    cores: { C: "#d4c08a", N: "#6b4220", S: "#a08c5a" },
    mapa: [".......CCCCCC.......", "......CCCCCCCC......", "......NNNNNNNN......", "..SCCCCCCCCCCCCCCS.."] },
  { id: "turbante", tipo: "chapeu", nome: "Turbante", fase: idxFase(M_DESERTO, 0), y: 0,
    cores: { W: "#f8f9fa", P: "#ced4da", R: "#e03131" },
    mapa: ["........WWWW........", "......WWPPWWWW......", ".....WWWWWRWWWW.....", ".....PPWWWWWWPP.....", "......WWWWWWWW......"] },
  { id: "farao", tipo: "chapeu", nome: "Coroa de Faraó", fase: idxFase(M_DESERTO, 10), y: 0,
    cores: { Y: "#fab005", B: "#1c7ed6" },
    mapa: [
      "......YYYYYYYY......",
      ".....YBYBYBYBYB.....",
      "....YBYBYBYBYBYB....",
      "....YBYBYBYBYBYB....",
      "...YB..........BY...",
      "..YB............BY..",
      "..BY............YB..",
      "..YB............BY..",
      "..BY............YB.."
    ] },
  { id: "protetor", tipo: "chapeu", nome: "Protetor de Orelha", fase: idxFase(M_GELO, 0), y: 3,
    cores: { R: "#c2255c", W: "#ffc9e3" },
    mapa: [
      "......RRRRRRRR......",
      "....RR........RR....",
      "...R............R...",
      ".WWWW..........WWWW.",
      "WWWWW..........WWWWW",
      "WWWWW..........WWWWW",
      ".WWWW..........WWWW."
    ] },
  { id: "ushanka", tipo: "chapeu", nome: "Chapéu de Pele", fase: idxFase(M_GELO, 8), y: 0,
    cores: { N: "#6b4220", F: "#e9dcc9" },
    mapa: [
      "......NNNNNNNN......",
      ".....NNNNNNNNNN.....",
      "....FFFFFFFFFFFF....",
      "...FFFFFFFFFFFFFF...",
      "..FF............FF..",
      "..FF............FF..",
      "..FF............FF..",
      "...F............F..."
    ] },
  { id: "bombeiro", tipo: "chapeu", nome: "Capacete de Bombeiro", fase: idxFase(M_LAVA, 0), y: 0,
    cores: { R: "#e03131", Y: "#ffd43b" },
    mapa: [".......RRRRRR.......", "......RRRYYRRR......", ".....RRRRYYRRRR.....", "....RRRRRRRRRRRR....", ".RRRRRRRRRRRRRRRRRR."] },
  { id: "chifres", tipo: "chapeu", nome: "Chifres de Demônio", fase: idxFase(M_LAVA, 8), y: 1,
    cores: { R: "#c92a2a" },
    mapa: ["....R..........R....", "....RR........RR....", ".....RR......RR....."] },

  // ---------- Óculos ----------
  { id: "escuros", tipo: "oculos", nome: "Óculos Escuros", preco: 80, y: 8,
    cores: { K: "#111111", G: "#6c757d" },
    mapa: ["....KGKKKKKKGKKK....", "....KKKKK..KKKKK...."] },
  { id: "oculos3d", tipo: "oculos", nome: "Óculos 3D", preco: 100, y: 8,
    cores: { K: "#f1f3f5", R: "#e03131", C: "#22b8cf" },
    mapa: ["....KRRRKKKKCCCK....", "....KRRRK..KCCCK...."] },
  { id: "nerd", tipo: "oculos", nome: "Óculos de Nerd", preco: 120, y: 7,
    cores: { K: "#111111" },
    mapa: [".....KKKK..KKKK.....", ".....K..KKKK..K.....", ".....K..K..K..K.....", ".....KKKK..KKKK....."] },
  { id: "mascara", tipo: "oculos", nome: "Máscara", preco: 150, y: 8,
    cores: { K: "#5f3dc4" },
    mapa: ["...KKK..KKKK..KKK...", "....KK..KKKK..KK...."] },
  { id: "coracao", tipo: "oculos", nome: "Óculos de Coração", preco: 180, y: 7,
    cores: { H: "#f06595", K: "#a61e4d" },
    mapa: ["....HH.HH..HH.HH....", "....HHHHHKKHHHHH....", ".....HHH....HHH.....", "......H......H......"] },
  { id: "monoculo", tipo: "oculos", nome: "Monóculo", preco: 220, y: 7,
    cores: { Y: "#fab005" },
    mapa: ["...........YYYY.....", "...........Y..Y.....", "...........Y..Y.....", "...........YYYY.....", "..............Y.....", "...............Y...."] },
  { id: "cyber", tipo: "oculos", nome: "Visor Cyber", preco: 380, y: 8,
    cores: { G: "#495057", R: "#ff2b5e" },
    mapa: ["...GRRRRRRRRRRRRG...", "...GGGGGGGGGGGGGG..."] },
  { id: "pintura", tipo: "oculos", nome: "Pintura de Guerra", fase: idxFase(M_SELVA, 3), y: 10,
    cores: { R: "#e03131", W: "#ffffff" },
    mapa: ["....RRR......RRR....", ".....WW......WW....."] },
  { id: "aviador", tipo: "oculos", nome: "Óculos de Aviador", fase: idxFase(M_DESERTO, 2), y: 7,
    cores: { N: "#6b4220", Y: "#fab005", C: "rgba(116,192,252,0.55)" },
    mapa: ["...NNNNNNNNNNNNNN...", "...NYCCYNNNNYCCYN...", "...NYCCYN..NYCCYN...", "....YYYY....YYYY...."] },
  { id: "esqui", tipo: "oculos", nome: "Óculos de Esqui", fase: idxFase(M_GELO, 2), y: 8,
    cores: { B: "#212529", O: "rgba(255,146,43,0.75)", W: "#ffffff" },
    mapa: ["..BBOWOOOOOOWOOOBB..", "..BBOOOOOOOOOOOOBB.."] },
  { id: "solda", tipo: "oculos", nome: "Óculos de Solda", fase: idxFase(M_LAVA, 2), y: 7,
    cores: { K: "#111111", G: "#2b8a3e" },
    mapa: ["....KKKK....KKKK....", "...KGGGGKKKKGGGGK...", "...KGGGGK..KGGGGK...", "....KKKK....KKKK...."] },

  // ---------- Roupas ----------
  { id: "gravata", tipo: "roupa", nome: "Gravata", preco: 80, y: 13,
    cores: { W: "#ffffff", R: "#c92a2a" },
    mapa: [".......WW..WW.......", ".........RR.........", ".........RR.........", "........RRRR........", ".........RR........."] },
  { id: "camiseta", tipo: "roupa", nome: "Camiseta", preco: 100, y: 14,
    cores: { R: "#e03131", Y: "#ffd43b" },
    mapa: ["......RRRRRRRR......", ".....RRRRRRRRRR.....", "......RRRYYRRR......", "......RRRRRRRR......"] },
  { id: "cachecol", tipo: "roupa", nome: "Cachecol", preco: 120, y: 13,
    cores: { R: "#e03131", W: "#ffffff" },
    mapa: [".....RWRWRWRWRW.....", "............RW......", "............WR......", "............RW......"] },
  { id: "macacao", tipo: "roupa", nome: "Macacão", preco: 150, y: 14,
    cores: { U: "#1c7ed6", Y: "#ffd43b" },
    mapa: [".......U....U.......", ".......YUUUUY.......", "......UUUUUUUU......", "......UUUUUUUU......", "......UUUUUUUU......"] },
  { id: "colete", tipo: "roupa", nome: "Colete Salva-vidas", preco: 160, y: 14,
    cores: { O: "#fd7e14", W: "#ffffff" },
    mapa: ["......OO....OO......", ".....OOOO..OOOO.....", "......OWO..OWO......", "......OOO..OOO......"] },
  { id: "smoking", tipo: "roupa", nome: "Smoking", preco: 280, y: 13,
    cores: { K: "#1a1a1a", W: "#ffffff", R: "#c92a2a" },
    mapa: ["........RRRR........", "......KKWWWWKK......", ".....KKKWWWWKKK.....", "......KKKWWKKK......", "......KKKKKKKK......"] },
  { id: "capa", tipo: "roupa", nome: "Capa de Herói", preco: 400, y: 13,
    cores: { R: "#e03131", Y: "#ffd43b" },
    mapa: [".....RRRRRRRRRR.....", "..RRR...............", ".RRRR....YY.........", ".RR.................", "RRR.................", "RR.................."] },
  { id: "armadura", tipo: "roupa", nome: "Armadura", preco: 650, y: 13,
    cores: { G: "#868e96", S: "#dee2e6" },
    mapa: ["......GGGGGGGG......", ".....GSSSSSSSSG.....", "....GSSSGGGGSSSG....", "...GGSSSSSSSSSSGG...", "......SSSSSSSS......", "......GGGGGGGG......"] },
  { id: "colarFlores", tipo: "roupa", nome: "Colar de Flores", fase: idxFase(M_SELVA, 1), y: 13,
    cores: { R: "#e03131", Y: "#ffd43b", P: "#f783ac" },
    mapa: [".....RYPRYPRYPR.....", "......PRYPRYPR......", "........YPRY........"] },
  { id: "lenco", tipo: "roupa", nome: "Lenço de Bandido", fase: idxFase(M_DESERTO, 4), y: 10,
    cores: { R: "#c92a2a", W: "#ffffff" },
    mapa: ["....RRRRRRRRRRRR....", "....RWRRRRRRWRRR....", ".....RRRRRRRRRR.....", ".......RRRRRR.......", ".........RR........."] },
  { id: "faixasMumia", tipo: "roupa", nome: "Faixas de Múmia", fase: idxFase(M_DESERTO, 6), y: 13,
    cores: { W: "#e9e4d4", S: "#b8ae94" },
    mapa: ["......WSWWSWWS......", ".....SWWWSWWWS......", "....WWSWWWWSWWW.....", "...WSWWWSWWWWSWW....", "...SWWSWWWWSWWSW....", ".....WWWSWWWSWW....."] },
  { id: "jaqueta", tipo: "roupa", nome: "Jaqueta de Neve", fase: idxFase(M_GELO, 4), y: 13,
    cores: { B: "#1c7ed6", W: "#ffffff", L: "#a5d8ff" },
    mapa: [".....WWWWWWWWWW.....", ".....BBBBBBBBBB.....", "....BBBBBLBBBBBB....", "...BBBBBBLBBBBBBB...", "...BBBBBBLBBBBBBB...", "...WW.BBBLBBBB.WW..."] },
  { id: "capaFogo", tipo: "roupa", nome: "Capa de Fogo", fase: idxFase(M_LAVA, 4), y: 13,
    cores: { O: "#ff6b00", Y: "#ffd43b" },
    mapa: [".....OOOOOOOOOO.....", "..OOO...............", ".YOOO...............", ".OYO................", "YOO.................", "OY.Y................", "Y.Y................."] }
];

const CAMADAS = ["calca", "sapato", "roupa", "cachecol", "oculos", "chapeu"]; // ordem de desenho por cima do corpo

// ---------- Mais cosméticos (montados por funções para ficar compacto) ----------
// Camisas, calças e sapatos com "estilo" acompanham a pose do macaco (o desenho troca as cores do pelo
// nas partes certas do corpo: tronco, mangas, cintura, pernas e pés). Ver roupaNaPose em arte.js.
// Cores: A = principal, B = sombra (sai sozinha se faltar), C = detalhe, Y = enfeite.
(function() {
  function c20(s) { const t = Math.floor((20 - s.length) / 2); return ".".repeat(t) + s + ".".repeat(20 - s.length - t); }
  function novo(tipo, id, nome, preco, y, cores, linhas, extra) {
    ITENS.push(Object.assign({ id: id, tipo: tipo, nome: nome, preco: preco, y: y, cores: cores,
      mapa: linhas.map(function(l) { return l.length === 20 ? l : c20(l); }) }, extra || {}));
  }
  function estilo(tipo, id, nome, preco, est, padrao, cores, extra) {
    if (!cores.B) cores.B = escurecer(cores.A, 0.28);
    ITENS.push(Object.assign({ id: id, tipo: tipo, nome: nome, preco: preco, y: 0, estilo: est, padrao: padrao, cores: cores }, extra || {}));
  }

  // ---------- Camisas (acompanham os braços: as mangas mexem junto) ----------
  [["camVerm", "Camiseta Vermelha", 90, "camisa", "liso", { A: "#e03131", C: "#ff8787" }],
   ["camMarinheiro", "Marinheiro", 160, "camisa", "listraH", { A: "#f8f9fa", B: "#ced4da", C: "#1c4f9c" }],
   ["camHavaiana", "Camisa Havaiana", 220, "camisa", "floral", { A: "#ffd43b", C: "#f06595", Y: "#2f9e44" }],
   ["camFutebol", "Camisa de Futebol", 260, "camisa", "numero", { A: "#2f9e44", C: "#ffd43b" }],
   ["camMoletom", "Moletom Roxo", 190, "camisa", "bolso", { A: "#7048e8", C: "#b197fc" }],
   ["camSocial", "Camisa Social", 140, "camisa", "botoes", { A: "#f1f3f5", B: "#c5cbd3", C: "#495057" }],
   ["camRosa", "Camiseta Rosa", 90, "camisa", "liso", { A: "#f783ac", C: "#ffdeeb" }],
   ["camPreta", "Camiseta Preta", 110, "camisa", "estrela", { A: "#343a40", B: "#212529", C: "#ffd43b" }],
   ["camXadrez", "Camisa Xadrez", 180, "camisa", "xadrez", { A: "#c92a2a", B: "#8f1d1d", C: "#212529" }],
   ["camArcoiris", "Camiseta Arco-íris", 320, "camisa", "arcoiris", { A: "#ff6b6b", C: "#ffd43b", G: "#69db7c", Y: "#4dabf7" }],
   ["camRegata", "Regata Esportiva", 80, "regata", "listraV", { A: "#1c7ed6", C: "#ffffff" }],
   ["camCamuflada", "Camisa Camuflada", 210, "camisa", "camuflado", { A: "#5c7a3a", B: "#3b5323", C: "#8a9a5b", Y: "#2b2b1a" }],
   ["camRaio", "Camiseta Relâmpago", 170, "camisa", "raio", { A: "#228be6", C: "#ffe066" }]].forEach(function(d) {
    estilo("roupa", d[0], d[1], d[2], d[3], d[4], d[5]);
  });
  // Prêmios: colar de conchas (Oceano) e poncho (Montanhas)
  novo("roupa", "colarConchas", "Colar de Conchas", undefined, 13, { W: "#fff4e6", P: "#ffa8a8", K: "#5c3d2e", Y: "#ffd8a8" },
    [".....K.W.P.Y.W.K....", "......WKPKYKWK......", ".......Y.P.W........"], { fase: idxFase(M_OCEANO, 1) });
  estilo("roupa", "poncho", "Poncho Andino", undefined, "poncho", "poncho", { A: "#c92a2a", C: "#ffd43b", Y: "#1c7ed6" }, { fase: idxFase(M_MONTANHA, 3) });

  // ---------- Chapéus ----------
  novo("chapeu", "mago", "Chapéu de Mago", 350, 0, { P: "#5f3dc4", p: "#3b2491", Y: "#ffd43b" }, ["P", "PPp", "PYPPp", "PPPPYPPPPPPp"]);
  novo("chapeu", "pirata", "Chapéu de Pirata", 300, 1, { K: "#212529", W: "#f8f9fa", Y: "#ffd43b" }, ["KKKKKKKKKK", "KKKKWWKKKK", "YKKKKKKKKKKKKY"]);
  novo("chapeu", "palha", "Chapéu de Palha", 120, 0, { Y: "#e9c46a", y: "#c9a227", R: "#d62828" }, ["YyYyYy", "YYYYYYYY", "RRRRRRRRRR", "YyYyYyYyYyYyYy"]);
  novo("chapeu", "tiara", "Tiara Real", 260, 1, { Y: "#ffd43b", R: "#e03131" }, ["Y.YRY.Y", "YYYYYYY"]);
  novo("chapeu", "natal", "Gorro de Natal", 200, 0, { R: "#e03131", r: "#a51d1d", W: "#ffffff" }, ["....W", "...RRr", "..RRRRr", "WWWWWWWWWW"]);
  novo("chapeu", "fones", "Fones de Ouvido", 240, 2, { K: "#343a40", R: "#e03131", G: "#868e96" }, [
    "......KKKKKKKK......", ".....K........K.....", "....K..........K....", "..RRK..........KRR..",
    ".RRRR..........RRRR.", ".RRRR..........RRRR.", "..GG............GG.."]);
  novo("chapeu", "boneAba", "Boné Aba Reta", 140, 1, { B: "#1c7ed6", W: "#ffffff", K: "#0b3d91" }, [
    ".......BBBBBB.......", "......BBBWWBBB......", ".....KBBBBBBBBBBBBBB"]);
  novo("chapeu", "bruxa", "Chapéu de Bruxa", 380, 0, { P: "#3b2491", p: "#22125c", G: "#40c057", Y: "#ffd43b" }, [
    "............P.......", "..........PPp.......", "........PPPPp.......", ".......GGGYGGG......", "...PPPPPPPPPPPPPP..."]);
  novo("chapeu", "sombreiro", "Sombreiro", 280, 0, { Y: "#f2c94c", y: "#c99a2e", R: "#e03131", G: "#2f9e44" }, ["YYYYYY", "YYYYYYYY", "RGRGRGRGRG", "yYYYYYYYYYYYYYYYYYy"]);
  novo("chapeu", "tiaraFlores", "Tiara de Flores", 160, 2, { P: "#f783ac", Y: "#ffd43b", W: "#ffffff", G: "#40c057" }, [
    "....PYP..WYW..PYP...", ".....G.GGGGGG.G....."]);
  novo("chapeu", "antenas", "Antenas", 150, 0, { K: "#212529", R: "#ff6b6b" }, [
    "...RR.........RR....", "....K.........K.....", ".....K.......K......", "......K.....K......."]);
  novo("chapeu", "marinheiro", "Chapéu de Marinheiro", undefined, 1, { W: "#f8f9fa", w: "#ced4da", B: "#1c3d7a", Y: "#ffd43b" },
    ["WWWWWW", "WWWWWWWW", "BBBBYYBBBB", "wWWWWWWWWWWWw"], { fase: idxFase(M_OCEANO, 3) });
  novo("chapeu", "coroaCoral", "Coroa de Coral", undefined, 0, { R: "#ff6b6b", O: "#ff922b", P: "#f783ac", W: "#fff0f6" }, [
    ".....R...O...P......", ".....RR.OO..PP......", "......RROOOPP.......", ".....WRROOOPPW......"], { fase: idxFase(M_OCEANO, 5) });
  novo("chapeu", "chullo", "Gorro Andino", undefined, 0, { R: "#c92a2a", Y: "#ffd43b", B: "#1c7ed6", W: "#f8f9fa" }, [
    ".........WW.........", ".......RYRYRY.......", "......RRRRRRRR......", ".....BWBWBWBWBW.....", "....RRRRRRRRRRRR....",
    "...YR..........RY...", "...RR..........RR...", "...Y............Y..."], { fase: idxFase(M_MONTANHA, 1) });

  // ---------- Óculos ----------
  novo("oculos", "redondos", "Óculos Redondos", 130, 7, { K: "#5c3d2e", C: "rgba(208,235,255,0.55)" }, [
    ".....KKK....KKK.....", "....KCCCK..KCCCK....", "....KCCCKKKKCCCK....", ".....KKK....KKK....."]);
  novo("oculos", "estrela", "Óculos Estrela", 200, 7, { Y: "#ffd43b", P: "#f06595" }, [
    "......Y......Y......", "....YYPYY..YYPYY....", ".....YPY....YPY.....", ".....Y.Y....Y.Y....."]);
  novo("oculos", "heroi", "Máscara de Herói", 170, 7, { R: "#c92a2a", r: "#8f1d1d" }, [
    "...rRRRRRRRRRRRRRr..", "...RR..RRRRRR..RR...", "....RRRR....RRRR...."]);
  novo("oculos", "tapaOlho", "Tapa-olho de Pirata", undefined, 6, { K: "#16161c", G: "#495057" }, [
    "..K.................", "...K................", "....KK..........KK..", ".....GKKKKKKK.KKKK..", "...........KKKKKK...", "............KKKK...."], { fase: idxFase(M_OCEANO, 9) });

  // ---------- Cachecóis (enrolados no pescoço, com a ponta caindo e franjinha) ----------
  function cachecol(listras) {
    const cor = function(i) { return listras[((i % listras.length) + listras.length) % listras.length]; };
    let r13 = "", r14 = "";
    for (let x = 0; x < 20; x++) {
      r13 += x >= 5 && x <= 14 ? (x === 5 || x === 14 ? "C" : cor(x)) : ".";
      r14 += x >= 5 && x <= 14 ? (x === 5 || x === 14 ? "C" : cor(x + 1)) : ".";
    }
    return [r13, r14,
      "..........C" + cor(0) + cor(1) + ".......",
      "..........C" + cor(1) + cor(2) + ".......",
      "...........FF......."];
  }
  [["cachVerm", "Cachecol Vermelho", 90, "AABB", "#e03131", "#ffffff"], ["cachAzul", "Cachecol Azul", 130, "AAB", "#1c7ed6", "#a5d8ff"],
   ["cachVerde", "Cachecol Verde", 130, "AB", "#2f9e44", "#b2f2bb"], ["cachTime", "Cachecol de Time", 200, "AAABBB", "#f08c00", "#212529"],
   ["cachRoxo", "Cachecol Roxo", 150, "A", "#9c36b5", "#eebefa"], ["cachOuro", "Cachecol Dourado", 420, "AB", "#ffd43b", "#fff3bf"],
   ["cachXadrez", "Cachecol Xadrez", 180, "ABAY", "#c92a2a", "#212529", "#ffd43b"], ["cachArco", "Cachecol Arco-íris", 300, "ABYGP", "#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7"],
   ["cachNeve", "Cachecol Nevado", 160, "AAB", "#e7f5ff", "#74c0fc"], ["cachLhama", "Cachecol de Lhama", undefined, "ABYA", "#f8f0e3", "#c92a2a", "#1c7ed6"]].forEach(function(d) {
    const cores = { A: d[4], B: d[5], C: escurecer(d[4], 0.35), F: clarear(d[4], 0.35) };
    if (d[6]) cores.Y = d[6];
    if (d[7]) cores.G = d[7];
    if (d[8]) cores.P = d[8];
    novo("cachecol", d[0], d[1], d[2], 13, cores, cachecol(d[3]), d[0] === "cachLhama" ? { fase: idxFase(M_MONTANHA, 5) } : null);
  });

  // ---------- Calças e shorts (acompanham as pernas) ----------
  [["shortJeans", "Shorts Jeans", 80, "short", "jeans", { A: "#4263eb", C: "#91a7ff" }],
   ["calcaJeans", "Calça Jeans", 140, "calca", "jeans", { A: "#364fc7", C: "#748ffc", Y: "#ffd43b" }],
   ["bermudaFlor", "Bermuda Florida", 190, "short", "floral", { A: "#20c997", C: "#f06595", Y: "#fff3bf" }],
   ["shortBanho", "Shorts de Banho", 150, "short", "listraV", { A: "#15aabf", C: "#ffffff" }],
   ["calcaMoletom", "Calça de Moletom", 130, "calca", "lateral", { A: "#868e96", C: "#f1f3f5" }],
   ["shortVerm", "Shorts Vermelho", 80, "short", "liso", { A: "#e03131" }],
   ["jardineira", "Jardineira", 260, "jardineira", "jeans", { A: "#4263eb", C: "#91a7ff", Y: "#ffd43b" }],
   ["calcaXadrez", "Calça Xadrez", 200, "calca", "xadrez", { A: "#2f9e44", B: "#1b6b2e", C: "#ffd43b" }],
   ["calcaCamuflada", "Calça Camuflada", 220, "calca", "camuflado", { A: "#5c7a3a", B: "#3b5323", C: "#8a9a5b", Y: "#2b2b1a" }],
   ["calcaKarate", "Calça de Karatê", 350, "calca", "faixa", { A: "#f8f9fa", B: "#ced4da", C: "#16161c" }],
   ["calcaOuro", "Calça Dourada", 600, "calca", "brilho", { A: "#fab005", C: "#fff3bf" }]].forEach(function(d) {
    estilo("calca", d[0], d[1], d[2], d[3], d[4], d[5]);
  });

  // ---------- Sapatos (acompanham os pés) ----------
  [["tenisVerm", "Tênis Vermelho", 100, "tenis", { A: "#e03131", C: "#ffffff" }],
   ["tenisAzul", "Tênis Azul", 100, "tenis", { A: "#1c7ed6", C: "#ffffff" }],
   ["chinelo", "Chinelo", 60, "chinelo", { A: "#74c0fc" }],
   ["tenisOuro", "Tênis Dourado", 450, "tenis", { A: "#fab005", C: "#fff3bf" }],
   ["botaMarrom", "Bota Marrom", 170, "bota", { A: "#6b4423", C: "#3d2410" }],
   ["botaNeve", "Bota de Neve", 220, "botaPelo", { A: "#74c0fc", C: "#f8f9fa" }],
   ["tenisPreto", "Tênis de Lona", 140, "tenis", { A: "#212529", C: "#f8f9fa" }],
   ["tenisVerde", "Tênis Verde", 100, "tenis", { A: "#37b24d", C: "#d3f9d8" }],
   ["sapatoSocial", "Sapato Social", 160, "social", { A: "#3d2410", C: "#c08552" }],
   ["galocha", "Galocha Amarela", 150, "bota", { A: "#fcc419", C: "#e67700" }],
   ["pantufa", "Pantufa de Coelho", 250, "pantufa", { A: "#fcc2d7", C: "#ffffff", Y: "#f06595" }],
   ["botaEscalada", "Bota de Escalada", undefined, "bota", { A: "#8a5a2b", C: "#e03131" }]].forEach(function(d) {
    estilo("sapato", d[0], d[1], d[2], d[3], d[3], d[4], d[0] === "botaEscalada" ? { fase: idxFase(M_MONTANHA, 9) } : null);
  });

  // ---------- Pets (só enfeite: não fazem nada) ----------
  function pet(id, nome, preco, cores, mapa, extra) { ITENS.push(Object.assign({ id: id, tipo: "pet", nome: nome, preco: preco, y: 0, cores: cores, mapa: mapa }, extra || {})); }
  const quad = ["......E.E.", "......EEE.", "OOOOO.OKO.", "OOOOOOOOO.", ".OOOOOOOO.", ".O.O..O.O."];
  pet("gato", "Gatinho", 220, { O: "#f08c00", E: "#f08c00", K: "#212529" }, quad);
  pet("cachorro", "Cachorrinho", 240, { O: "#c69c6d", E: "#6b4423", K: "#212529" }, quad);
  pet("raposa", "Raposinha", 380, { O: "#e8590c", E: "#212529", K: "#212529" }, quad);
  pet("passaro", "Passarinho", 260, { B: "#4dabf7", Y: "#ffd43b", K: "#212529" }, ["..........", "....BBB...", "..BBBBBBK.", ".BBBBBBBBY", "..BBBBBB..", "...Y..Y..."], { voa: true });
  pet("tartaruga", "Tartaruga", 300, { G: "#2f9e44", S: "#8ce99a", H: "#74b816" }, ["...GGGG...", "..GGSGGG..", ".GGSGGSGGH", ".GGGGGGGHH", "..G.G.G.G."]);
  pet("fantasma", "Fantasminha", 500, { W: "#f1f3f5", K: "#212529" }, ["..WWWWW...", ".WWWWWWW..", ".WKWWWKW..", ".WWWWWWW..", ".WWWWWWW..", ".W.WW.WW.."], { voa: true });
  pet("peixinho", "Peixinho", 280, { O: "#ff922b", o: "#e8590c", W: "#ffffff", K: "#212529" }, ["..........", "o...OOO...", "oo.OOOWK..", "ooOOOOOOO.", "oo.OOOOO..", "o...OOO..."], { voa: true });
  pet("pinguinzinho", "Pinguinzinho", 320, { K: "#1e2a44", W: "#ffffff", Y: "#ff922b", E: "#111111" }, ["...KKKK...", "..KKWEWY..", "..KWWWWK..", ".KKWWWWKK.", "..KWWWWK..", "..YY..YY.."]);
  pet("lhaminha", "Lhaminha", 420, { W: "#f8f0e3", w: "#d9c9a8", K: "#3d2b1f", R: "#e03131" }, [".......WW.", ".......WK.", ".......WW.", "RWWWWWWWW.", ".WWWWWWw..", ".w.w..w.w."]);
  pet("polvinho", "Polvinho", 360, { P: "#be4bdb", p: "#862e9c", W: "#ffffff", K: "#212529" }, ["...PPPP...", "..PPPPPP..", "..PWKPWK..", "..PPPPPP..", ".p.p.p.p..", "p.p.p.p.p."], { voa: true });
  pet("dragaozinho", "Dragãozinho", 900, { R: "#e03131", r: "#a51d1d", Y: "#ffd43b", K: "#212529", O: "#ff922b" }, ["....r..r..", "r..RRRRRK.", "rr.RRRRRRO", ".rRRYYRRR.", "..RRRRRR..", "..R.R..R.."], { voa: true });

  // ---------- Skins novas ----------
  [["ninja", "Ninja", 600, "#212529", "#000000", "#f2cfa0", "#343a40"],
   ["algodao", "Algodão-doce", 380, "#f783ac", "#a61e4d", "#ffdeeb", "#fcc2d7"], ["esmeralda", "Esmeralda", 550, "#12b886", "#087f5b", "#c3fae8", "#96f2d7"],
   ["meianoite", "Meia-noite", 650, "#5f3dc4", "#1b0f3b", "#d0bfff", "#7048e8"], ["mexerica", "Mexerica", 300, "#fd7e14", "#7a2e00", "#ffe8cc", "#ffa94d"],
   ["caramelo", "Caramelo", 280, "#c68642", "#5a3412", "#f3d3a8", "#e8b57a"], ["menta", "Menta", 320, "#63e6be", "#0b5e4a", "#e6fcf5", "#c3fae8"],
   ["cereja", "Cereja", 340, "#e64980", "#5c0f2c", "#ffdeeb", "#faa2c1"], ["chocolate", "Chocolate", 300, "#6b4226", "#1f120a", "#d6a77a", "#9c6b48"]].forEach(function(d) {
    SKINS.push({ id: d[0], nome: d[1], preco: d[2], cores: { F: d[3], D: d[4], P: d[5], B: d[6] } });
  });
  SKINS.push({ id: "abismo", nome: "Oceano Profundo", preco: 520,
    cores: { F: "#1971c2", D: "#0b2545", P: "#a5d8ff", B: "#4dabf7" },
    detalhe: { y: 4, cores: { W: "#e7f5ff", C: "#74c0fc" }, mapa: [".........W..........", "........C.C.........", "......W.........C...", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", "......C.......W.....", "............C.......", "..........W........."] } });
  SKINS.push({ id: "porDoSol", nome: "Pôr do Sol", preco: 900,
    faixas: ["#ff6b6b", "#ff8e53", "#ffb347", "#ffd166", "#ff9a8b", "#f06595"],
    cores: { F: "#ff8e53", D: "#5c1a2e", P: "#fff4e6", B: "#ffffff" } });
  // Prêmios dos mundos novos
  SKINS.push({ id: "polvoSkin", nome: "Polvo", fase: idxFase(M_OCEANO, 7),
    cores: { F: "#be4bdb", D: "#4a1259", P: "#f3d9fa", B: "#e599f7" },
    detalhe: { y: 4, cores: { W: "#f3d9fa" }, mapa: ["........W.W.........", "......W.....W.......", "....................", "....W.........W.....", "....................",
      "....................", "....................", "....................", "....................", "....................", ".....W.W.W..........", "............W.W.....", "......W.W....W.W...."] } });
  SKINS.push({ id: "tubaraoSkin", nome: "Tubarão", fase: idxFase(M_OCEANO, 10),
    cores: { F: "#748ca6", D: "#1d2b3a", P: "#e9ecef", B: "#f8f9fa", E: "#111111" },
    detalhe: { y: 0, cores: { F: "#5c738c", K: "#1d2b3a", W: "#ffffff" }, mapa: [".........KK.........", "........KFFK........", ".......KFFFFK.......", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", "...K...........K....", "...K...........K....", "....................",
      "........WKWKW......."] } });
  SKINS.push({ id: "lhamaSkin", nome: "Lhama", fase: idxFase(M_MONTANHA, 7),
    cores: { F: "#f1e3c8", D: "#5a4632", P: "#fff8eb", B: "#ffffff" },
    detalhe: { y: 0, cores: { W: "#fffdf7", R: "#e03131", B: "#1c7ed6" }, mapa: ["......W......W......", ".....WW......WW.....", "....................", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", "....................", "....................", "....................", "....................",
      ".....RBRBRBRBRB....."] } });
  SKINS.push({ id: "condorSkin", nome: "Condor", fase: idxFase(M_MONTANHA, 10),
    cores: { F: "#2b2b2b", D: "#000000", P: "#e8a49c", B: "#f8f9fa", E: "#7a1010" },
    detalhe: { y: 1, cores: { R: "#c92a2a", W: "#ffffff" }, mapa: ["........RRR.........", ".......RR.RR........", "....................", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", "....................", "....................",
      "....WWWWWWWWWWW....."] } });

  // Cosméticos de nível: o nível só LIBERA a compra na loja (não ganha de graça)
  SKINS.concat(ITENS).forEach(function(c) { if (c.nivel !== undefined && c.preco === undefined) c.preco = c.nivel * 70; });
})();

// Cosmético ganho em cada fase / nível
function premioDaFase(i) {
  return SKINS.concat(ITENS).find(function(c) { return c.fase === i; }) || null;
}

function premioDoNivel(n) {
  return SKINS.concat(ITENS).find(function(c) { return c.nivel === n; }) || null;
}


// =========================
// PODERES (temporários: você compra e usa um de cada vez)
// MELHORIAS (permanentes: mais caras)
// POWER-UPS: aparecem na fase de vez em quando e já ativam sozinhos (duram menos)
// =========================

const PODERES = [
  { id: "velocidade", nome: "Super Velocidade", desc: "+60% de velocidade por 10s", preco: 300,  duracao: 600, recarga: 1500 },
  { id: "puloDuplo",  nome: "Pulo Duplo",       desc: "Pula de novo no ar por 15s", preco: 400,  duracao: 900, recarga: 1800 },
  { id: "escudo",     nome: "Escudo",           desc: "Invencível por 8s",         preco: 500,  duracao: 480, recarga: 1800 },
  { id: "ima",        nome: "Ímã de Moedas",    desc: "Puxa as moedas por 15s",    preco: 250,  duracao: 900, recarga: 1500 },
  { id: "nuke",       nome: "Nuke",             desc: "Explode os inimigos perto", preco: 6000, duracao: 0,   recarga: 3600 },
  { id: "congelar",   nome: "Congelar",         desc: "Congela os inimigos por 6s", preco: 1100, duracao: 360, recarga: 2400 },
  { id: "superPulo",  nome: "Super Pulo",       desc: "Pulos bem mais altos por 12s", preco: 900, duracao: 720, recarga: 2100 },
  { id: "cura",       nome: "Cura Total",       desc: "Enche todos os corações",    preco: 1750, duracao: 0,   recarga: 3600 },
  { id: "invisivel",  nome: "Invisibilidade",   desc: "Os inimigos te ignoram por 10s (encostar ainda machuca)", preco: 1000, duracao: 600, recarga: 2400 }
];

// Power-ups que só aparecem nas fases (não estão na loja)
const PODERES_RAROS = [
  { id: "moedas2x", nome: "Moedas em Dobro", desc: "Cada moeda vale 2 por 20s", duracao: 1200 }
];

const DURACAO_POWERUP = 0.5;   // power-up achado na fase dura metade do comprado

const MELHORIAS = [
  { id: "dash",      nome: "Dash",             desc: "Dispara pra frente e atravessa inimigos", preco: 600 },
  { id: "coracao1",  nome: "Coração Extra",    desc: "+1 coração de vida",                preco: 400 },
  { id: "coracao2",  nome: "Coração Extra II", desc: "+1 coração de vida",                preco: 2500, requer: "coracao1" },
  { id: "cipoLongo", nome: "Cipó Longo",       desc: "O laço de cipó alcança mais longe", preco: 450 },
  { id: "puloDuploP", nome: "Pulo Duplo Eterno", desc: "Sempre pode pular mais uma vez no ar", preco: 5000 }
];

const ABAS = [
  { tipo: "skin",     nome: "Skins" },
  { tipo: "chapeu",   nome: "Chapéus" },
  { tipo: "oculos",   nome: "Óculos" },
  { tipo: "roupa",    nome: "Camisas" },
  { tipo: "cachecol", nome: "Cachecóis" },
  { tipo: "calca",    nome: "Calças/Shorts" },
  { tipo: "sapato",   nome: "Sapatos" },
  { tipo: "pet",      nome: "Pets" },
  { tipo: "poder",    nome: "Poderes" },
  { tipo: "melhoria", nome: "Melhorias" }
];


// =========================
// CONTROLES (dá para trocar no menu "Controles")
// =========================

const ACOES = [
  { id: "esquerda",   nome: "Andar para a esquerda" },
  { id: "direita",    nome: "Andar para a direita" },
  { id: "pulo",       nome: "Pular" },
  { id: "baixo",      nome: "Deslizar / soltar do cipó" },
  { id: "laco",       nome: "Cipó-laço" },
  { id: "dash",       nome: "Dash" },
  { id: "poder1",     nome: "Poder: Super Velocidade" },
  { id: "poder2",     nome: "Poder: Pulo Duplo" },
  { id: "poder3",     nome: "Poder: Escudo" },
  { id: "poder4",     nome: "Poder: Ímã de Moedas" },
  { id: "poder5",     nome: "Poder: Nuke" },
  { id: "poder6",     nome: "Poder: Congelar" },
  { id: "poder7",     nome: "Poder: Super Pulo" },
  { id: "poder8",     nome: "Poder: Cura Total" },
  { id: "poder9",     nome: "Poder: Invisibilidade" },
  { id: "loja",       nome: "Loja" },
  { id: "pausa",      nome: "Pausa" },
  { id: "som",        nome: "Ligar/desligar som" }
];

const TECLAS_PADRAO = {
  esquerda: ["a", "arrowleft"], direita: ["d", "arrowright"], pulo: [" ", "w", "arrowup"],
  baixo: ["s", "arrowdown"], laco: ["j", "k"], dash: ["shift"],
  poder1: ["1"], poder2: ["2"], poder3: ["3"], poder4: ["4"], poder5: ["5"], poder6: ["6"], poder7: ["7"], poder8: ["8"], poder9: ["9"],
  loja: ["l"], pausa: ["p"], som: ["m"]
};

function nomeDaTecla(k) {
  const nomes = { " ": tr("Espaço"), arrowleft: "←", arrowright: "→", arrowup: "↑", arrowdown: "↓", shift: "Shift",
    control: "Ctrl", alt: "Alt", enter: "Enter", tab: "Tab", backspace: tr("Apagar"), capslock: "Caps" };
  if (!k) return "-";
  return nomes[k] || k.toUpperCase();
}

traduzirDados();   // idioma.js: nomes em inglês quando o jogo está em inglês
