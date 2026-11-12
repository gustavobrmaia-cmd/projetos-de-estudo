"use strict";

// =========================
// PERFIL, NOME DO JOGADOR, ESTATÍSTICAS E CONQUISTAS
// - Ícones em pixel art dos botões quadrados do menu (engrenagem, perfil, mapa, loja, medalha)
// - Perfil: avatar do macaco, nome, nível, estrelas, distância, pulos, inimigos, poderes, dashs e conquistas
// - Nome: pedido na primeira vez que joga (3 a 20 letras)
// - Conquistas: lista no botão de medalha; quando desbloqueia, o aviso desce do topo, espera e sobe
// =========================

let perfilAberto = false;
let conquistasAbertas = false;
let nomeAberto = false;
let depoisDoNome = null;

// ---------- Ícones dos botões (grade 12x12, ampliada 4x) ----------
const ICONES_MENU = {
  // símbolo de perfil: cabeça e ombros
  perfil: { cores: { K: "#2a1608", W: "#fff3d6", w: "#e0c9a0", L: "#ffffff" }, mapa: [
    "....KKKK....", "...KWLWWK...", "..KWLWWWwK..", "..KWWWWWwK..", "..KWWWWWwK..", "...KWWWwK...",
    "....KKKK....", "..KKKKKKKK..", ".KWLWWWWWwK.", "KWLWWWWWWWwK", "KWWWWWWWWWwK", "KKKKKKKKKKKK"] },
  engrenagem: { cores: { G: "#ced4da", g: "#5f6873", L: "#ffffff", K: "#2a1608" }, mapa: [
    "....gGGg....", ".gg.gLLg.gg.", ".gLGGLLGGLg.", "..GGGGGGGGg.", "gGGGg..gGGGg", "gLLg....gGGg",
    "gLGg....gGGg", "gGGGg..gGGGg", "..GGGGGGGGg.", ".gGGgGGgGGg.", ".gg.gGGg.gg.", "....gggg...."] },
  mapa: { cores: { K: "#2a1608", P: "#f3e3c0", p: "#d4c08a", G: "#40c057", B: "#4dabf7", R: "#e03131", r: "#8a5a2b" }, mapa: [
    "KKKKKKKKKKKK", "KPPPPPPPPpPK", "KPGGPPPPPPPK", "KPGGGPPRPRPK", "KPPGPPPPRPPK", "KPPPPrPRPRPK",
    "KPPPrPPPPPPK", "KPPrPPPPBBPK", "KPrPPPPBBBpK", "KPPPPPPPBBPK", "KpPPPPPPPPpK", "KKKKKKKKKKKK"] },
  pausa: { cores: { K: "#2a1608", W: "#fff3d6", w: "#e0c9a0", L: "#ffffff" }, mapa: [
    "............", "..KKKK.KKKK.", "..KLWK.KLWK.", "..KWWK.KWWK.", "..KWWK.KWWK.", "..KWWK.KWWK.",
    "..KWWK.KWWK.", "..KWWK.KWWK.", "..KWWK.KWWK.", "..KWwK.KWwK.", "..KKKK.KKKK.", "............"] },
  // lojinha: toldo listrado, vitrine e porta
  loja: { cores: { K: "#2a1608", R: "#e03131", W: "#ffffff", B: "#e9c48a", b: "#c99a5a", C: "#74c0fc", L: "#e7f5ff", D: "#8a5a2b", Y: "#ffd43b" }, mapa: [
    "KKKKKKKKKKKK", "KRRWWRRWWRRK", "KRRWWRRWWRRK", ".KRKWKRKWKK.", ".KBBBBBBBBK.", ".KBKKKBKKbK.",
    ".KKCLKBDDKK.", ".KKCCKBDDKK.", ".KKKKKBDYKK.", ".KBBBBBDDbK.", ".KbbbbbDDbK.", "KKKKKKKKKKKK"] },
  medalha: { cores: { K: "#2a1608", R: "#e03131", B: "#1c7ed6", Y: "#ffd43b", y: "#c98a00", L: "#fff3bf" }, mapa: [
    "..RRK..KBB..", "..RRRKKBBB..", "...RRKKBB...", "....RKKB....", "....KKKK....", "...KYYYYK...",
    "..KYYLYYyK..", "..KYLYYYyK..", "..KYYYYYyK..", "..KyYYYyyK..", "...KyyyyK...", "....KKKK...."] }
};

function iconeMenu(nome) {
  const c = criarCanvas(48, 48);
  const g = c.getContext("2d");
  const ic = ICONES_MENU[nome];
  pintarMapa(g, ic.mapa, ic.cores, 4, 0, 0);
  return c;
}

function desenharIconesMenu() {
  document.querySelectorAll("canvas.icone").forEach(function(c) {
    const img = iconeMenu(c.dataset.icone);
    c.width = 48; c.height = 48;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, 48, 48);
    g.drawImage(img, 0, 0);
  });
}

// ---------- Estatísticas (contadas durante o jogo) ----------
const PX_POR_METRO = 64;
let ultimoXJogador = null;

const atualizarJogoOriginal = atualizarJogo;
atualizarJogo = function() {
  const j = jogador;
  const antes = j ? j.x : null;
  atualizarJogoOriginal();
  if (j && jogador === j && antes !== null && !j.morto && !j.saindo && !j.cenaBanana && !j.cenaCipo) {
    const dx = Math.abs(j.x - antes);
    if (dx > 0 && dx < 40) save.stats.distancia += dx / PX_POR_METRO;
  }
};

const pularOriginal = pular;
pular = function(v) { save.stats.pulos++; pularOriginal(v); };
const superPuloOriginal = superPulo;
superPulo = function() { save.stats.pulos++; superPuloOriginal(); };

const iniciarDashOriginal = iniciarDash;
iniciarDash = function() {
  const antes = jogador ? jogador.dash : 0;
  iniciarDashOriginal();
  if (jogador && jogador.dash > antes) save.stats.dashs++;
};

const usarPoderOriginal = usarPoder;
usarPoder = function(id) {
  const antes = save.poderes[id];
  usarPoderOriginal(id);
  if (save.poderes[id] < antes) save.stats.poderes++;
};
const pegarPowerupOriginal = pegarPowerup;
pegarPowerup = function(pu) { save.stats.poderes++; pegarPowerupOriginal(pu); };

const ganharMoedasOriginal = ganharMoedas;
ganharMoedas = function(n, x, y) {
  const antes = save.moedas;
  ganharMoedasOriginal(n, x, y);
  save.stats.moedasTotal += Math.max(0, save.moedas - antes);
};

// ---------- Conquistas ----------
// progresso(): [quanto já tem, meta]
const CONQUISTAS = [
  { id: "primeiraFase", nome: "Primeiros Passos", desc: "Termine a fase 1-1", progresso: function() { return [Math.min(1, save.desbloqueado), 1]; } },
  { id: "gorila", nome: "Rei da Selva", desc: "Vença o Gorila Rei", progresso: function() { return [save.chefes[0] ? 1 : 0, 1]; } },
  { id: "escorpiao", nome: "Faraó Destronado", desc: "Vença o Escorpião Faraó", progresso: function() { return [save.chefes[1] ? 1 : 0, 1]; } },
  { id: "yeti", nome: "Quebra-Gelo", desc: "Vença o Yeti Ancestral", progresso: function() { return [save.chefes[2] ? 1 : 0, 1]; } },
  { id: "tubarao", nome: "Terror dos Mares", desc: "Vença o Tubarão Abissal", progresso: function() { return [save.chefes[3] ? 1 : 0, 1]; } },
  { id: "condor", nome: "Acima das Nuvens", desc: "Vença o Condor dos Andes", progresso: function() { return [save.chefes[4] ? 1 : 0, 1]; } },
  { id: "dragao", nome: "Domador de Dragões", desc: "Vença o Dragão de Magma", progresso: function() { return [save.chefes[5] ? 1 : 0, 1]; } },
  { id: "andarilho", nome: "Andarilho", desc: "Percorra 5.000 metros", progresso: function() { return [Math.floor(save.stats.distancia), 5000]; } },
  { id: "maratona", nome: "Maratonista", desc: "Percorra 25.000 metros", progresso: function() { return [Math.floor(save.stats.distancia), 25000]; } },
  { id: "cacador", nome: "Caçador", desc: "Derrote 50 inimigos", progresso: function() { return [save.stats.inimigos, 50]; } },
  { id: "exterminador", nome: "Exterminador", desc: "Derrote 300 inimigos", progresso: function() { return [save.stats.inimigos, 300]; } },
  { id: "espacial", nome: "Para o Espaço!", desc: "Chute 20 inimigos com o cipó-laço", progresso: function() { return [save.stats.chutes, 20]; } },
  { id: "relampago", nome: "Relâmpago", desc: "Use o dash 50 vezes", progresso: function() { return [save.stats.dashs, 50]; } },
  { id: "poderoso", nome: "Poderoso", desc: "Pegue ou use 25 poderes", progresso: function() { return [save.stats.poderes, 25]; } },
  { id: "estrelinha", nome: "Estrelinha", desc: "Ganhe 30 estrelas", progresso: function() { return [totalEstrelas(), 30]; } },
  { id: "ceuEstrelado", nome: "Céu Estrelado", desc: "Ganhe todas as estrelas", progresso: function() { return [totalEstrelas(), TOTAL_FASES * 3]; } },
  { id: "cofrinho", nome: "Cofrinho", desc: "Junte 1.000 moedas no total", progresso: function() { return [save.stats.moedasTotal, 1000]; } },
  { id: "tesouro", nome: "Tesouro do Macaco", desc: "Junte 10.000 moedas no total", progresso: function() { return [save.stats.moedasTotal, 10000]; } },
  { id: "estiloso", nome: "Estiloso", desc: "Tenha 10 cosméticos", progresso: function() { return [save.comprados.length, 10]; } },
  { id: "colecionador", nome: "Colecionador", desc: "Tenha 50 cosméticos", progresso: function() { return [save.comprados.length, 50]; } },
  { id: "experiente", nome: "Experiente", desc: "Chegue ao nível 10", progresso: function() { return [save.nivel, 10]; } }
];

const filaAvisos = [];
let avisoTocando = false;

function verificarConquistas() {
  if (!save || !save.conquistas) return;
  CONQUISTAS.forEach(function(c) {
    if (save.conquistas.indexOf(c.id) >= 0) return;
    const p = c.progresso();
    if (p[0] >= p[1]) {
      save.conquistas.push(c.id);
      salvar();
      filaAvisos.push(c);
    }
  });
  if (!avisoTocando && filaAvisos.length) mostrarAvisoConquista(filaAvisos.shift());
}

// Aviso no estilo do Minecraft: desce do topo, fica uns segundos (com som) e sobe
function mostrarAvisoConquista(c) {
  avisoTocando = true;
  const t = el("toastConquista");
  el("toastNome").textContent = tr(c.nome);
  t.classList.remove("mostrar");
  void t.offsetWidth;
  t.classList.add("mostrar");
  som("conquista");
  setTimeout(function() {
    t.classList.remove("mostrar");
    setTimeout(function() {
      avisoTocando = false;
      if (filaAvisos.length) mostrarAvisoConquista(filaAvisos.shift());
    }, 450);
  }, 3600);
}

setInterval(function() { try { verificarConquistas(); } catch (e) { /* nada */ } }, 700);

// ---------- Telas ----------
function abrirPerfil() { perfilAberto = true; renderizarPerfil(); atualizarTelas(); }
function fecharPerfil() { perfilAberto = false; atualizarTelas(); }
function abrirConquistas() { conquistasAbertas = true; renderizarConquistas(); atualizarTelas(); }
function fecharConquistas() { conquistasAbertas = false; atualizarTelas(); }

function numero(n) { return Math.floor(n).toLocaleString(IDIOMA === "en" ? "en-US" : "pt-BR"); }

function renderizarPerfil() {
  const c = el("perfilAvatar");
  const g = c.getContext("2d");
  desenharPrimata(g, save.equip, 8, "parado");
  el("perfilNome").textContent = save.nome || tr("Sem nome");
  el("perfilNivel").textContent = save.nivel;
  el("perfilXp").style.width = Math.round((100 * save.xp) / xpParaSubir(save.nivel)) + "%";
  el("perfilXpTexto").textContent = save.xp + "/" + xpParaSubir(save.nivel) + " XP";
  el("perfilEstrelas").textContent = totalEstrelas() + "/" + TOTAL_FASES * 3;
  el("perfilConquistas").textContent = save.conquistas.length + "/" + CONQUISTAS.length;
  const stats = [
    ["🦶", tr("Distância"), numero(save.stats.distancia) + " m"],
    ["⤴", tr("Pulos"), numero(save.stats.pulos)],
    ["💥", tr("Inimigos derrotados"), numero(save.stats.inimigos)],
    ["⚡", tr("Poderes pegos"), numero(save.stats.poderes)],
    ["💨", tr("Dashs"), numero(save.stats.dashs)],
    ["🪙", tr("Moedas juntadas"), numero(save.stats.moedasTotal)]
  ];
  el("perfilStats").innerHTML = stats.map(function(s) {
    return '<div class="stat"><span class="ic">' + s[0] + '</span><span class="rot">' + s[1] + '</span><b>' + s[2] + "</b></div>";
  }).join("");
}

function renderizarConquistas() {
  el("conquistasTotal").textContent = tr("{0} de {1} desbloqueadas", save.conquistas.length, CONQUISTAS.length);
  el("listaConquistas").innerHTML = CONQUISTAS.map(function(c) {
    const feita = save.conquistas.indexOf(c.id) >= 0;
    const p = c.progresso();
    const k = Math.min(1, p[0] / p[1]);
    return '<div class="conquista' + (feita ? " feita" : "") + '"><span class="ic">' + (feita ? "🏅" : "🔒") + "</span>" +
      '<div class="txt"><b>' + tr(c.nome) + "</b><span>" + tr(c.desc) + "</span>" +
      (feita || p[1] <= 1 ? "" : '<span class="barra"><span style="width:' + Math.round(k * 100) + '%"></span></span><span class="num">' + numero(Math.min(p[0], p[1])) + "/" + numero(p[1]) + "</span>") +
      "</div></div>";
  }).join("");
}

// ---------- Nome do jogador ----------
function abrirNome(depois) {
  depoisDoNome = depois;
  nomeAberto = true;
  perfilAberto = false;
  atualizarTelas();
  const campo = el("campoNome");
  campo.value = save.nome || "";
  el("avisoNome").textContent = tr("De 3 a 20 letras.");
  el("avisoNome").classList.remove("erro");
  setTimeout(function() { campo.focus(); }, 50);
}

function fecharNome() {
  nomeAberto = false;
  el("campoNome").blur();
  setTimeout(ajustarTela, 300);   // o teclado fechou: recalcula o tamanho da tela
  atualizarTelas();
}

function confirmarNome() {
  const nome = el("campoNome").value.replace(/\s+/g, " ").trim();
  if (nome.length < 3 || nome.length > 20) {
    el("avisoNome").textContent = nome.length < 3 ? tr("O nome precisa ter pelo menos 3 letras.") : tr("O nome pode ter no máximo 20 letras.");
    el("avisoNome").classList.add("erro");
    som("negado");
    return;
  }
  save.nome = nome;
  salvar();
  som("compra");
  const depois = depoisDoNome;
  depoisDoNome = null;
  fecharNome();
  if (depois) depois();
  else abrirPerfil();
}

// Na primeira vez que joga, pede o nome antes
const jogarOriginal = jogar;
jogar = function() {
  if (!save.nome) { abrirNome(jogarOriginal); return; }
  jogarOriginal();
};

// os ícones usam o sprite do macaco (montado depois de carregar o save)
setTimeout(desenharIconesMenu, 0);
const montarSpritesOriginal = montarSprites;
montarSprites = function() { montarSpritesOriginal(); desenharIconesMenu(); };

SONS.conquista = function() {
  [784, 988, 1175, 1568].forEach(function(f, i) { tom("square", f, f, 0.14, 0.045, i * 0.09); });
  tom("triangle", 1568, 1568, 0.5, 0.05, 0.36);
};
