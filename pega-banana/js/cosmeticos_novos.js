"use strict";

// =========================
// COSMÉTICOS NOVOS (muitos, em todas as abas)
// Desenhados com sombra e brilho (3-4 tons por cor). Carregado logo depois de dados.js.
// Cada item tem o nome em português e em inglês (o inglês vai para o dicionário EN).
// =========================

(function() {
  const EN_NOVOS = {};
  function nome(pt, en) { if (en) EN_NOVOS[pt] = en; return pt; }
  function c20(s) { const t = Math.floor((20 - s.length) / 2); return ".".repeat(t) + s + ".".repeat(Math.max(0, 20 - s.length - t)); }
  function item(tipo, id, pt, en, preco, y, cores, linhas, extra) {
    ITENS.push(Object.assign({ id: id, tipo: tipo, nome: nome(pt, en), preco: preco, y: y, cores: cores,
      mapa: linhas.map(function(l) { return l.length >= 20 ? l.slice(0, 20) : c20(l); }) }, extra || {}));
  }
  function estilo(tipo, id, pt, en, preco, est, padrao, cores) {
    if (!cores.B) cores.B = escurecer(cores.A, 0.28);
    ITENS.push({ id: id, tipo: tipo, nome: nome(pt, en), preco: preco, y: 0, estilo: est, padrao: padrao, cores: cores });
  }

  // ---------- CHAPÉUS ----------
  item("chapeu", "boina", "Boina Francesa", "French Beret", 140, 1, { R: "#c92a2a", r: "#8f1d1d", L: "#ff6b6b", K: "#2a1608" },
    ["KK", "LLRRRRr", "LLRRRRRRRRr", "LRRRRRRRRRRRr", "rrrrrrrrrrrrr"]);
  item("chapeu", "panama", "Chapéu Panamá", "Panama Hat", 190, 0, { W: "#f3e5c0", w: "#d4c08a", L: "#fff8e1", K: "#212529", R: "#c92a2a" },
    ["wLWWWWw", "wLWWWWWWw", "KKKRKKKKKK", "wLWWWWWWWWWWWWw", ".wwwwwwwwwwwww."]);
  item("chapeu", "coroaDiamante", "Coroa de Diamante", "Diamond Crown", 1400, 0, { Y: "#ffd43b", y: "#c98a00", L: "#fff3bf", C: "#4dabf7", c: "#d0ebff", R: "#e03131" },
    ["c...c...c", "C..cCc..C", "YCY.YCY.YCY", "LYYYYYYYYYY", "yyCyyRyyCyy", "yyyyyyyyyyy"]);
  item("chapeu", "kabuto", "Capacete Samurai", "Samurai Helmet", 650, 0, { K: "#212529", k: "#495057", R: "#c92a2a", Y: "#fcc419", y: "#e67700" },
    ["Y..........Y", "yY........Yy", ".yY.kKKk.Yy.", "..yYKRRKYy..", "kKKKKKKKKKKKKk", "kk.kKKKKKKk.kk"]);
  item("chapeu", "sapo", "Chapéu de Sapo", "Frog Hat", 260, 0, { G: "#51cf66", g: "#2b8a3e", W: "#ffffff", K: "#16161c", R: "#ff8787" },
    ["gWWg....gWWg", "GWKG....GWKG", "gGGGGGGGGGGg", "GGRGGGGGGRGGGG", "gggggggggggggg"]);
  item("chapeu", "gatinho", "Orelhas de Gatinho", "Cat Ears", 180, 1, { K: "#343a40", k: "#16161c", P: "#f783ac", p: "#fcc2d7" },
    ["kk........kk", "KPk......kPK", "KPPk....kPpK", "KKKKKKKKKKKK"]);
  item("chapeu", "cogumelo", "Chapéu de Cogumelo", "Mushroom Cap", 240, 0, { R: "#e03131", r: "#a51d1d", L: "#ff8787", W: "#ffffff" },
    ["rLRRRr", "rRWWRRRRWr", "RLRRRRRWWRRr", "rRWWRRRRRRRWRr", "rrrrrrrrrrrrrr"]);
  item("chapeu", "unicornio", "Chifre de Unicórnio", "Unicorn Horn", 420, 0, { Y: "#ffe066", y: "#f59f00", W: "#fff9db", P: "#f783ac", B: "#74c0fc", V: "#b197fc" },
    ["Y", "yW", "YyW", "PYyWB", "PVBPVBPVBP"]);
  item("chapeu", "coroaGelo", "Coroa de Gelo", "Ice Crown", 720, 0, { C: "#a5d8ff", c: "#4dabf7", W: "#ffffff", B: "#1c7ed6" },
    ["W...W...W", "CW.CWC.WC", "cCCCCWCCCCc", "cCBCCCCCBCc", "ccccccccccc"]);
  item("chapeu", "elmo", "Elmo de Cavaleiro", "Knight Helm", 560, 0, { S: "#dee2e6", s: "#868e96", L: "#ffffff", K: "#343a40", R: "#e03131", r: "#a51d1d" },
    ["RRr", "RRRRr", "sLSSSSs", "sLSSSSSSSSs", "sSSKKKKKKSSs", "ssssssssssss"]);
  item("chapeu", "helice", "Boné de Hélice", "Propeller Cap", 300, 0, { R: "#e03131", Y: "#ffd43b", B: "#1c7ed6", G: "#40c057", K: "#212529" },
    ["BBBBBKYYYYY", "K", "RRYYGGBB", "RRRYYYGGGBBB", "KKKKKKKKKKKKKKKK"]);
  item("chapeu", "formatura", "Chapéu de Formatura", "Graduation Cap", 380, 0, { K: "#212529", k: "#495057", Y: "#ffd43b", y: "#e67700" },
    ["...kKKKKKKKKKKKKk...", ".....KKKKKKKKKK.Y...", "......kKKKKKKk..Y...", "......kkkkkkkk..yY.."]);
  item("chapeu", "abacaxi", "Chapéu de Abacaxi", "Pineapple Hat", 330, 0, { G: "#2f9e44", g: "#8ce99a", Y: "#fab005", y: "#e67700", L: "#ffe066" },
    ["G.g.G", "gGgGg", "GgG", "yYLyYLy", "YyYLyYLyY", "yYyYyYyYyYy"]);
  item("chapeu", "cartolaMagica", "Cartola Mágica", "Magic Top Hat", 900, 0, { K: "#1a1a1a", k: "#343a40", W: "#ffffff", w: "#ffc9de", P: "#9c36b5", Y: "#ffd43b" },
    ["W....W", "Ww..wW", "kKKKKKKk", "kKKKKKKk", "PPPYPPPP", "KKKKKKKKKKKK"]);
  item("chapeu", "chapeuPalhaco", "Peruca de Palhaço", "Clown Wig", 200, 2, { R: "#ff6b6b", O: "#ff922b", Y: "#ffd43b", G: "#69db7c", B: "#4dabf7" },
    ["..ROYGBROYG..", ".RYBOGRBYOGR.", "OGB........ROG", "YR..........BY"]);
  item("chapeu", "astronauta", "Capacete Espacial", "Space Helmet", 1100, 0, { W: "#f1f3f5", w: "#adb5bd", C: "rgba(116,192,252,0.35)", c: "rgba(255,255,255,0.7)", R: "#e03131" },
    ["...wWWWWWWWw...", "..wWWRWWWWWWw..", ".wWCCCCCCCCCWw.", "wWCcCCCCCCCCCWw", "wWCCCCCCCCCCCWw", "wWCCCCCCCCCCCWw", "wWCCCCCCCCCCCWw", "wWCCCCCCCCCCCWw", "wWCCCCCCCCCCCWw", "wWWCCCCCCCCCWWw", ".wWWWWWWWWWWWw."]);

  // ---------- ÓCULOS ----------
  item("oculos", "pixelThug", "Óculos Pixel", "Pixel Shades", 260, 8, { K: "#111111", W: "#ffffff" },
    ["...KKKKKKKKKKKKKK...", "....KKWK....KKWK....", ".....KK......KK....."]);
  item("oculos", "gatinhoOc", "Óculos Gatinho", "Cat-Eye Glasses", 210, 7, { P: "#d6336c", p: "#f783ac", C: "rgba(229,153,247,0.55)" },
    ["...pP..........Pp...", "....PPPPP..PPPPP....", "....PCCCPPPPCCCP....", ".....PPP....PPP....."]);
  item("oculos", "viseiraNeon", "Viseira Neon", "Neon Visor", 340, 8, { G: "#00f5d4", g: "#0b7285", W: "#ffffff" },
    ["..gGGGGGGGGGGGGGGg..", "..gGWGGGGGGGGGGWGg.."]);
  item("oculos", "arcoirisOc", "Óculos Arco-íris", "Rainbow Glasses", 280, 8, { K: "#212529", R: "#ff6b6b", O: "#ffa94d", Y: "#ffe066", G: "#69db7c", B: "#4dabf7", V: "#b197fc" },
    ["....KKKKKKKKKKKK....", "....KROYKKKGBVK.....", ".....KKK....KKK....."]);
  item("oculos", "raioX", "Óculos de Raio-X", "X-Ray Specs", 360, 7, { K: "#212529", W: "#ffffff", R: "#e03131", r: "#ff8787" },
    ["....KKKKK..KKKKK....", "....KWRWK..KWRWK....", "....KRrRKKKKRrRK....", "....KKKKK..KKKKK...."]);
  item("oculos", "hexDourado", "Óculos Hexagonais", "Hexagon Glasses", 450, 7, { Y: "#fab005", y: "#e67700", C: "rgba(255,212,59,0.35)" },
    [".....YYY....YYY.....", "....YCCCYyyYCCCY....", "....YCCCY..YCCCY....", ".....yyy....yyy....."]);
  item("oculos", "lucha", "Máscara de Luta Livre", "Wrestler Mask", 520, 5, { R: "#1c7ed6", r: "#0b4a8c", Y: "#ffd43b", W: "#ffffff" },
    ["....rRRRRRRRRRRr....", "...rRYRRRRRRRRYRr...", "...RYYYRRRRRRYYYR...", "...R...RRYYRR...R...", "...R...RR..RR...R...", "...rRRRRRRRRRRRRr..."]);
  item("oculos", "esquiArco", "Óculos de Neve Aurora", "Aurora Goggles", 400, 8, { B: "#212529", A: "rgba(99,230,190,0.8)", V: "rgba(177,151,252,0.8)", W: "#ffffff" },
    ["..BBAAWAAVVVVWVVBB..", "..BBAAAAAVVVVVVVBB.."]);

  // ---------- CAMISAS (acompanham os braços) ----------
  [["camBanana", "Camisa de Bananas", "Banana Shirt", 240, "camisa", "banana", { A: "#74c0fc", C: "#ffd43b", Y: "#8a5a2b" }],
   ["camGalaxia", "Camiseta Galáxia", "Galaxy Tee", 420, "camisa", "galaxia", { A: "#2b1d5c", B: "#160e33", C: "#ffffff", Y: "#ff9cf3" }],
   ["camCoracao", "Camiseta de Corações", "Hearts Tee", 180, "camisa", "coracoes", { A: "#fff0f6", B: "#fcc2d7", C: "#e64980" }],
   ["camDiagonal", "Camisa Listrada Diagonal", "Diagonal Stripes", 200, "camisa", "diagonal", { A: "#fd7e14", C: "#fff4e6" }],
   ["camOncinha", "Camisa de Oncinha", "Leopard Shirt", 300, "camisa", "oncinha", { A: "#f2c166", B: "#c99a2e", C: "#3d2410", Y: "#8a5a2b" }],
   ["camPolo", "Camisa Polo", "Polo Shirt", 160, "camisa", "gola", { A: "#2f9e44", C: "#ffffff" }],
   ["camDegrade", "Camiseta Degradê", "Gradient Tee", 260, "camisa", "degrade", { A: "#ff8787", C: "#ffd43b", Y: "#ffa94d" }],
   ["camBasquete", "Regata de Basquete", "Basketball Jersey", 220, "regata", "numero", { A: "#7048e8", C: "#ffd43b" }],
   ["camPijama", "Pijama de Estrelinhas", "Star Pajamas", 190, "camisa", "galaxia", { A: "#4dabf7", B: "#1c7ed6", C: "#fff3bf", Y: "#ffffff" }],
   ["camMarinha", "Camisa Marinheiro Azul", "Navy Sailor", 210, "camisa", "listraH", { A: "#1c4f9c", B: "#0f2f63", C: "#f8f9fa" }],
   ["camLava", "Camiseta Lava", "Lava Tee", 380, "camisa", "degrade", { A: "#c92a2a", C: "#ffd43b", Y: "#ff6b00" }],
   ["camFloresta", "Camisa Xadrez da Floresta", "Forest Flannel", 230, "camisa", "xadrez", { A: "#2b8a3e", B: "#1b5e20", C: "#212529" }]
  ].forEach(function(d) { estilo("roupa", d[0], d[1], d[2], d[3], d[4], d[5], d[6]); });

  // ---------- CALÇAS ----------
  [["calcaGalaxia", "Calça Galáxia", "Galaxy Pants", 400, "calca", "galaxia", { A: "#2b1d5c", B: "#160e33", C: "#ffffff", Y: "#ff9cf3" }],
   ["shortOncinha", "Shorts de Oncinha", "Leopard Shorts", 240, "short", "oncinha", { A: "#f2c166", B: "#c99a2e", C: "#3d2410", Y: "#8a5a2b" }],
   ["calcaRosa", "Calça Rosa Chiclete", "Bubblegum Pants", 150, "calca", "liso", { A: "#f783ac" }],
   ["bermudaCargo", "Bermuda Cargo", "Cargo Shorts", 170, "short", "lateral", { A: "#8a7a4a", C: "#5c5030" }],
   ["calcaBanana", "Calça de Bananas", "Banana Pants", 280, "calca", "banana", { A: "#1c7ed6", C: "#ffd43b", Y: "#8a5a2b" }],
   ["shortCorrida", "Shorts de Corrida", "Running Shorts", 130, "short", "listraV", { A: "#e03131", C: "#ffffff" }],
   ["calcaPreta", "Calça Preta Social", "Black Slacks", 200, "calca", "faixa", { A: "#343a40", B: "#212529", C: "#868e96" }],
   ["jardRosa", "Jardineira Rosa", "Pink Overalls", 300, "jardineira", "jeans", { A: "#e64980", C: "#fcc2d7", Y: "#ffd43b" }]
  ].forEach(function(d) { estilo("calca", d[0], d[1], d[2], d[3], d[4], d[5], d[6]); });

  // ---------- SAPATOS ----------
  [["tenisNeon", "Tênis Neon", "Neon Sneakers", 260, "tenis", { A: "#00f5d4", C: "#ff00e5" }],
   ["tenisRosa", "Tênis Rosa", "Pink Sneakers", 120, "tenis", { A: "#f783ac", C: "#ffffff" }],
   ["botaCowboy", "Bota de Cowboy", "Cowboy Boots", 280, "bota", { A: "#8a5a2b", C: "#ffd43b" }],
   ["botaChuva", "Galocha Vermelha", "Red Rain Boots", 160, "bota", { A: "#e03131", C: "#a51d1d" }],
   ["pantufaUrso", "Pantufa de Ursinho", "Teddy Slippers", 240, "pantufa", { A: "#c08552", C: "#f3d3a8", Y: "#3d2410" }],
   ["sapatoVerniz", "Sapato de Verniz", "Patent Shoes", 220, "social", { A: "#16161c", C: "#ffffff" }],
   ["chineloPraia", "Chinelo de Praia", "Beach Flip-flops", 70, "chinelo", { A: "#ffd43b" }],
   ["botaEspacial", "Bota Espacial", "Space Boots", 480, "botaPelo", { A: "#dee2e6", C: "#4dabf7" }]
  ].forEach(function(d) { estilo("sapato", d[0], d[1], d[2], d[3], d[4], d[4], d[5]); });

  // ---------- CACHECÓIS (enrolados no pescoço, com a ponta caindo e franjinha) ----------
  function cachecol(listras) {
    const cor = function(i) { return listras[((i % listras.length) + listras.length) % listras.length]; };
    let r13 = "", r14 = "";
    for (let x = 0; x < 20; x++) {
      r13 += x >= 5 && x <= 14 ? (x === 5 || x === 14 ? "C" : cor(x)) : ".";
      r14 += x >= 5 && x <= 14 ? (x === 5 || x === 14 ? "C" : cor(x + 1)) : ".";
    }
    return [r13, r14, "..........C" + cor(0) + cor(1) + ".......", "..........C" + cor(1) + cor(2) + ".......", "...........FF......."];
  }
  [["cachRosa", "Cachecol Rosa", "Pink Scarf", 140, "AB", ["#f783ac", "#ffdeeb"]],
   ["cachNatal", "Cachecol de Natal", "Holiday Scarf", 220, "AABG", ["#e03131", "#ffffff", "#2f9e44"]],
   ["cachAbelha", "Cachecol Abelha", "Bumblebee Scarf", 180, "AB", ["#ffd43b", "#212529"]],
   ["cachOceano", "Cachecol Oceano", "Ocean Scarf", 200, "ABG", ["#1c7ed6", "#74c0fc", "#e7f5ff"]],
   ["cachLava", "Cachecol de Lava", "Lava Scarf", 260, "ABG", ["#c92a2a", "#ff6b00", "#ffd43b"]],
   ["cachMenta", "Cachecol Menta", "Mint Scarf", 150, "AAB", ["#63e6be", "#e6fcf5"]],
   ["cachGalaxia", "Cachecol Galáxia", "Galaxy Scarf", 380, "ABAG", ["#3b1f6e", "#b197fc", "#ffffff"]],
   ["cachPreto", "Cachecol Preto e Branco", "Checker Scarf", 170, "AB", ["#212529", "#f8f9fa"]]
  ].forEach(function(d) {
    const cores = { A: d[5][0], B: d[5][1], C: escurecer(d[5][0], 0.35), F: clarear(d[5][0], 0.35) };
    if (d[5][2]) cores.G = d[5][2];
    item("cachecol", d[0], d[1], d[2], d[3], 13, cores, cachecol(d[4]));
  });

  // ---------- PETS ----------
  function pet(id, pt, en, preco, cores, mapa, extra) { ITENS.push(Object.assign({ id: id, tipo: "pet", nome: nome(pt, en), preco: preco, y: 0, cores: cores, mapa: mapa }, extra || {})); }
  pet("coelhinho", "Coelhinho", "Bunny", 260, { W: "#ffffff", w: "#dee2e6", P: "#f783ac", K: "#212529" },
    ["......W.W.", "......WPWP", "..wWWWWWW.", ".wWWWWWKWP", "wWWWWWWWW.", ".w.w..w.w."]);
  pet("sapinho", "Sapinho", "Froggy", 220, { G: "#51cf66", g: "#2b8a3e", W: "#ffffff", K: "#212529", R: "#ff8787" },
    [".....WK.WK", "....GGGGGG", "..GGGGGGGG", ".GgGGGGRRG", ".GGgggGGG.", "GG.G..G.GG"]);
  pet("corujinha", "Corujinha", "Owlet", 340, { B: "#8a5a2b", b: "#d8b07a", W: "#ffffff", K: "#212529", Y: "#fab005" },
    ["..B....B..", "..BBBBBB..", ".BWKBBWKB.", ".BBBYYBBB.", ".BbbbbbbB.", "..BbbbbB..", "...Y..Y..."], { voa: true });
  pet("morceguinho", "Morceguinho", "Little Bat", 300, { k: "#5c5f66", K: "#343a40", R: "#ff6b6b", W: "#ffffff" },
    ["k........k", "kk..KK..kk", "kkkKRKRKkk", ".kkKWKWKk.", "...K..K..."], { voa: true });
  pet("abelhinha", "Abelhinha", "Bumblebee", 240, { Y: "#ffd43b", K: "#212529", W: "rgba(255,255,255,0.85)" },
    ["...WW.....", "..WWW.....", ".YKYKYKY..", "YKYKYKYKK.", ".YKYKYKY.."], { voa: true });
  pet("dino", "Dinossaurinho", "Baby Dino", 480, { G: "#40c057", g: "#2b8a3e", Y: "#ffe066", K: "#212529", W: "#ffffff" },
    ["......GGG.", "......GKGW", "......GGGG", "G..gGGGG..", ".GGGGGGG..", "..GYGYG...", "..g.g.g..."]);
  pet("unicorninho", "Unicorninho", "Little Unicorn", 650, { W: "#ffffff", w: "#dee2e6", P: "#f783ac", B: "#74c0fc", Y: "#ffd43b", K: "#212529" },
    ["........Y.", ".......WW.", "......PWKW", "PBWWWWWWW.", ".wWWWWWw..", ".w.w.w.w.."]);
  pet("siri", "Siri", "Little Crab", 260, { R: "#ff6b6b", r: "#c92a2a", W: "#ffffff", K: "#212529" },
    ["R..W..W..R", "RR.K..K.RR", ".RRRRRRRR.", "RRrRRRRrRR", ".r.r..r.r."]);
  pet("slimeVerde", "Slime", "Slime", 280, { G: "#8ce99a", g: "#2f9e44", W: "#ffffff", K: "#212529" },
    ["...gggg...", "..gGGWGg..", ".gGWKGWKg.", ".gGGGGGGg.", "gggggggggg"]);
  pet("robozinho", "Robozinho", "Tiny Robot", 560, { S: "#ced4da", s: "#868e96", C: "#22b8cf", R: "#ff3b3b", K: "#343a40" },
    ["....R.....", "....K.....", "..SSSSSS..", "..SCSSCS..", "..ssssss..", "..SSKKSS..", "..K....K.."]);
  pet("pandinha", "Pandinha", "Baby Panda", 520, { W: "#ffffff", K: "#212529", w: "#dee2e6" },
    ["..K....K..", "..WWWWWW..", ".WKKWWKKW.", ".WWWKKWWW.", "KKwWWWWwKK", ".K.K..K.K."]);
  pet("fenixMini", "Mini Fênix", "Mini Phoenix", 1200, { R: "#e03131", O: "#ff922b", Y: "#ffd43b", K: "#212529" },
    ["..YO......", ".YORRK....", "OORRRRY...", ".ORRRRRO..", "..OYRRYOO.", "...Y..YO.."], { voa: true });

  // ---------- SKINS ----------
  function skin(id, pt, en, preco, cores, extra) { SKINS.push(Object.assign({ id: id, nome: nome(pt, en), preco: preco, cores: cores }, extra || {})); }
  const listras = [
    "........K.K.........", ".......K.K.K........", "....................", "....K..........K....",
    "....................", "....................", "....................", "....................", "....................",
    "....................", "......K......K......", "....................", "......K......K......", "....................", ".......K....K......."];
  const pintas = [
    "........KO..........", "......O.....KO......", "...KO............O..", "....................",
    "....................", "....................", "....................", "....................", "....................",
    "....................", ".....KO.....KO......", "...........O........", "......O......KO.....", "....KO..............", "..........O........."];
  skin("tigreBranco", "Tigre-Branco", "White Tiger", 700, { F: "#f1f3f5", D: "#343a40", P: "#ffe3e3", B: "#ffffff", E: "#1c7ed6" },
    { detalhe: { y: 4, cores: { K: "#212529" }, mapa: listras } });
  skin("leopardo", "Leopardo", "Leopard", 650, { F: "#f2c166", D: "#5a3a10", P: "#fff4e6", B: "#fff0c2" },
    { detalhe: { y: 4, cores: { K: "#3d2410", O: "#8a5a2b" }, mapa: pintas } });
  skin("pessego", "Pêssego", "Peach", 280, { F: "#ffa8a8", D: "#862e2e", P: "#fff0f0", B: "#ffd8a8" });
  skin("lavanda", "Lavanda", "Lavender", 320, { F: "#b197fc", D: "#3b2491", P: "#f3f0ff", B: "#d0bfff" });
  skin("ouroRosa", "Ouro Rosé", "Rose Gold", 950, { F: "#e8a39a", D: "#6b2f2a", P: "#fff0ec", B: "#ffd1c7" },
    { detalhe: { y: 4, cores: { W: "#ffffff" }, mapa: [".........W..........", "....................", "......W.......W....."] } });
  skin("tropical", "Tropical", "Tropical", 800, { F: "#40c057", D: "#1b4d20", P: "#fff9db", B: "#ffffff" },
    { faixas: ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#38d9a9", "#4dabf7"] });
  skin("vaporwave", "Vaporwave", "Vaporwave", 1100, { F: "#f783ac", D: "#2b1d5c", P: "#e3fafc", B: "#ffffff", E: "#2b1d5c" },
    { faixas: ["#f783ac", "#e599f7", "#b197fc", "#74c0fc", "#66d9e8", "#b197fc"] });
  skin("ceuNoturno", "Céu Estrelado", "Starry Night", 1300, { F: "#1b2a5c", D: "#05091a", P: "#a5b4fc", B: "#2c3e8c", E: "#ffe066", W: "#ffffff" },
    { detalhe: { y: 4, cores: { W: "#ffffff", Y: "#ffe066", P: "#ff9cf3" }, mapa: [
      "........W.....Y.....", "......Y.............", "...W.........P......", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................",
      "......W.....Y.......", "...........W........", ".......P............", "..........Y........."] } });
  skin("coral", "Coral", "Coral Reef", 450, { F: "#ff8787", D: "#7a1f2b", P: "#fff5f5", B: "#ffc9c9" },
    { detalhe: { y: 4, cores: { W: "#fff0f6", Y: "#ffd43b" }, mapa: ["..........W.........", "......Y.............", "..............W.....", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", "......W.......Y....."] } });
  skin("cristal", "Cristal", "Crystal", 1500, { F: "rgba(165,216,255,0.75)", D: "rgba(28,126,214,0.9)", P: "rgba(231,245,255,0.9)", B: "rgba(208,235,255,0.7)", E: "#1864ab" },
    { detalhe: { y: 4, cores: { W: "#ffffff" }, mapa: ["........W...........", ".......W.W..........", "..............W.....", "....................", "....................",
      "....................", "....................", "....................", "....................", "....................", ".......W............", "............W.W....."] } });
  skin("floresta", "Espírito da Floresta", "Forest Spirit", 1000, { F: "#2b8a3e", D: "#0b2e13", P: "#d3f9d8", B: "#8ce99a", E: "#ffe066" },
    { detalhe: { y: 0, cores: { G: "#69db7c", g: "#2f9e44", R: "#ff8787" }, mapa: ["........gG.Gg.......", ".......gGRGGg.......", "........g..g........"] } });
  skin("abobora", "Abóbora", "Pumpkin", 600, { F: "#fd7e14", D: "#5c2b00", P: "#ffe8cc", B: "#ffa94d", E: "#ffd43b", W: "#fff3bf", M: "#5c2b00" },
    { detalhe: { y: 1, cores: { G: "#2f9e44", g: "#1b5e20" }, mapa: [".........gG.........", "..........G........."] } });

  Object.assign(EN, EN_NOVOS);
  // nomes no idioma do jogo (o resto do jogo já foi traduzido em dados.js)
  if (IDIOMA !== "pt") {
    ITENS.concat(SKINS).forEach(function(c) { if (EN_NOVOS[c.nome]) c.nome = tr(c.nome); });
  }
})();

