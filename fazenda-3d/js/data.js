/* ================= FAZENDA 3D — DADOS DO JOGO =================
   Catálogo de construções, missões e conquistas.
   Cada construção define: id, nome, ícone, preço, tamanho (w×d em tiles),
   nível necessário, categoria e se pode ser girada. */

const BUILDINGS = {
  house: {
    id: 'house', name: 'Casa Principal', icon: '🏠',
    price: 500, w: 3, d: 3, level: 1, category: 'construcoes',
    desc: 'Centro administrativo da fazenda.',
    refund: 0.5
  },
  barn: {
    id: 'barn', name: 'Celeiro', icon: '🏚️',
    price: 400, w: 3, d: 3, level: 1, category: 'construcoes',
    desc: 'Armazena produtos agrícolas.',
    refund: 0.5
  },
  stable: {
    id: 'stable', name: 'Estábulo', icon: '🐴',
    price: 300, w: 2, d: 2, level: 1, category: 'construcoes',
    desc: 'Abriga vacas e produz leite (fase 2).',
    refund: 0.5
  },
  coop: {
    id: 'coop', name: 'Galinheiro', icon: '🐔',
    price: 250, w: 2, d: 2, level: 1, category: 'construcoes',
    desc: 'Abriga galinhas e produz ovos (fase 2).',
    refund: 0.5
  },
  well: {
    id: 'well', name: 'Poço', icon: '🪣',
    price: 150, w: 1, d: 1, level: 1, category: 'construcoes',
    desc: 'Fornece água para irrigação (fase 2).',
    refund: 0.5
  },
  stall: {
    id: 'stall', name: 'Barraca de Vendas', icon: '🎪',
    price: 200, w: 2, d: 1, level: 1, category: 'construcoes',
    desc: 'Ponto de comercialização de produtos (fase 3).',
    refund: 0.5
  },
  fence: {
    id: 'fence', name: 'Cerca', icon: '🚧',
    price: 10, w: 1, d: 1, level: 1, category: 'cercas',
    desc: 'Delimita áreas e currais.',
    refund: 0.5
  },
  tree: {
    id: 'tree', name: 'Árvore', icon: '🌳',
    price: 50, w: 1, d: 1, level: 1, category: 'arvores',
    desc: 'Decoração natural da fazenda.',
    refund: 0.5
  },
  flowers: {
    id: 'flowers', name: 'Canteiro de Flores', icon: '🌷',
    price: 30, w: 1, d: 1, level: 1, category: 'decoracoes',
    desc: 'Enfeita os caminhos da fazenda.',
    refund: 0.5
  },
  path: {
    id: 'path', name: 'Trilha de Pedra', icon: '🪨',
    price: 15, w: 1, d: 1, level: 1, category: 'decoracoes',
    desc: 'Caminho decorativo de pedras.',
    refund: 0.5
  }
};

const SHOP_CATEGORIES = [
  { id: 'construcoes', name: 'Construções' },
  { id: 'decoracoes', name: 'Decorações' },
  { id: 'cercas', name: 'Cercas' },
  { id: 'arvores', name: 'Árvores' }
];

/* Missões iniciais — progresso rastreado por contadores do jogo. */
const MISSIONS = [
  { id: 'm_house', title: 'Lar doce lar', desc: 'Construa a Casa Principal.',
    stat: 'built_house', target: 1, rewardCoins: 100, rewardXp: 50 },
  { id: 'm_well', title: 'Água na torneira', desc: 'Construa um Poço.',
    stat: 'built_well', target: 1, rewardCoins: 80, rewardXp: 40 },
  { id: 'm_fence', title: 'Cercando o sítio', desc: 'Posicione 10 Cercas.',
    stat: 'built_fence', target: 10, rewardCoins: 120, rewardXp: 60 },
  { id: 'm_tree', title: 'Pegada verde', desc: 'Plante 3 Árvores.',
    stat: 'built_tree', target: 3, rewardCoins: 90, rewardXp: 45 },
  { id: 'm_any', title: 'Em obras', desc: 'Construa 5 estruturas quaisquer.',
    stat: 'built_any', target: 5, rewardCoins: 150, rewardXp: 75 },
  { id: 'm_land', title: 'Território', desc: 'Compre 1 expansão de terreno.',
    stat: 'land_expansions', target: 1, rewardCoins: 200, rewardXp: 100 }
];

/* Conquistas de longo prazo. */
const ACHIEVEMENTS = [
  { id: 'a_first', title: 'Primeira construção', desc: 'Construa sua primeira estrutura.',
    stat: 'built_any', target: 1, rewardCoins: 50 },
  { id: 'a_five', title: 'Constructor', desc: 'Construa 5 estruturas.',
    stat: 'built_any', target: 5, rewardCoins: 150 },
  { id: 'a_ten', title: 'Mestre das obras', desc: 'Construa 10 estruturas.',
    stat: 'built_any', target: 10, rewardCoins: 300 },
  { id: 'a_rich', title: 'Cofrinho cheio', desc: 'Acumule 2.000 moedas.',
    stat: 'peak_coins', target: 2000, rewardCoins: 200 },
  { id: 'a_level5', title: 'Fazendeiro experiente', desc: 'Alcance o nível 5.',
    stat: 'level', target: 5, rewardCoins: 250 },
  { id: 'a_expand', title: 'Expansor', desc: 'Compre 2 expansões de terreno.',
    stat: 'land_expansions', target: 2, rewardCoins: 300 }
];

/* Expansão de terreno: cada compra adiciona um anel de tiles ao redor da área atual. */
const LAND_EXPANSION = {
  basePrice: 250,
  priceGrowth: 1.6,
  maxExpansions: 6
};

/* XP necessário por nível (nível 1 → 100, cresce 50% por nível). */
function xpForLevel(level) {
  return Math.round(100 * Math.pow(1.5, level - 1));
}
