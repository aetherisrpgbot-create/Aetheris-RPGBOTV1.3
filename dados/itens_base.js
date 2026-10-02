// dados/itens_base.js
const ITENS_BASE = {
    // ============================================================
    // 🔹 MATERIAIS (COLETÁVEIS)
    // ============================================================
    'madeira': {
        id: 'madeira',
        nome: 'Madeira',
        emoji: '🪵',
        tipo: 'material',
        raridade: 'comum',
        descricao: 'Madeira comum, usada para criar ferramentas e armas simples.',
        bioma: 'floresta',
        coletavel: true,
        alias: ['madeira', 'tora', 'lenha']
    },
    'ferro': {
        id: 'ferro',
        nome: 'Ferro',
        emoji: '⛏️',
        tipo: 'material',
        raridade: 'comum',
        descricao: 'Minério de ferro, usado para criar armas e armaduras.',
        bioma: 'montanha',
        coletavel: true,
        alias: ['ferro', 'minerio', 'minério']
    },
    'erva': {
        id: 'erva',
        nome: 'Erva Curativa',
        emoji: '🌿',
        tipo: 'material',
        raridade: 'comum',
        descricao: 'Erva com propriedades curativas, usada em poções.',
        bioma: 'floresta',
        coletavel: true,
        alias: ['erva', 'planta', 'curativa']
    },
    'vidro': {
        id: 'vidro',
        nome: 'Vidro',
        emoji: '🧪',
        tipo: 'material',
        raridade: 'comum',
        descricao: 'Vidro translúcido, usado para frascos de poções.',
        bioma: 'deserto',
        coletavel: true,
        alias: ['vidro', 'frasco']
    },
    'couro': {
        id: 'couro',
        nome: 'Couro',
        emoji: '🟫',
        tipo: 'material',
        raridade: 'comum',
        descricao: 'Couro de animais, usado para armaduras leves.',
        bioma: 'floresta',
        coletavel: true,
        alias: ['couro', 'pele']
    },

// ============================================================
// 🔹 COMIDA
// ============================================================
'ovo': {
    id: 'ovo',
    nome: '🥚 Ovo',
    emoji: '🥚',
    tipo: 'comida',
    raridade: 'comum',
    descricao: 'Um ovo fresco de galinha. Pode ser consumido ou usado em receitas.',
    cura: 5,
    valor_venda: 2
},
'leite': {
    id: 'leite',
    nome: '🥛 Leite',
    emoji: '🥛',
    tipo: 'comida',
    raridade: 'comum',
    descricao: 'Leite fresco de vaca. Nutritivo e versátil.',
    cura: 8,
    valor_venda: 3
},
'carne': {
    id: 'carne',
    nome: '🥩 Carne',
    emoji: '🥩',
    tipo: 'comida',
    raridade: 'comum',
    descricao: 'Carne fresca de caça. Ótima para cozinhar.',
    cura: 15,
    valor_venda: 5
},
'pena': {
    id: 'pena',
    nome: '🪶 Pena',
    emoji: '🪶',
    tipo: 'material',
    raridade: 'comum',
    descricao: 'Pena de pássaro. Usada em artesanato e flechas.',
    valor_venda: 2
},
'pena_colorida': {
    id: 'pena_colorida',
    nome: '🪶 Pena Colorida',
    emoji: '🪶',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Pena colorida e brilhante. Muito procurada por artesãos.',
    valor_venda: 8
},
'chifre': {
    id: 'chifre',
    nome: '🦌 Chifre',
    emoji: '🦌',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Chifre de veado. Usado em poções e amuletos.',
    valor_venda: 10
},

// ============================================================
// 🔹 DROPS DE MONSTROS
// ============================================================
'dente_lobo': {
    id: 'dente_lobo',
    nome: '🦷 Dente de Lobo',
    emoji: '🦷',
    tipo: 'material',
    raridade: 'comum',
    descricao: 'Dente afiado de lobo. Usado em poções e artesanato.',
    valor_venda: 5
},
'pelo_lobo': {
    id: 'pelo_lobo',
    nome: '🐺 Pelo de Lobo',
    emoji: '🐺',
    tipo: 'material',
    raridade: 'comum',
    descricao: 'Pelo macio de lobo. Usado em roupas e armaduras.',
    valor_venda: 8
},
'presa_javali': {
    id: 'presa_javali',
    nome: '🐗 Presa de Javali',
    emoji: '🐗',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Presa curva de javali. Valiosa para artesanato.',
    valor_venda: 15
},
'essencia_sombria': {
    id: 'essencia_sombria',
    nome: '🌑 Essência Sombria',
    emoji: '🌑',
    tipo: 'material',
    raridade: 'raro',
    descricao: 'Essência pura das trevas. Usada em poções poderosas.',
    valor_venda: 30
},
'dente_goblin': {
    id: 'dente_goblin',
    nome: '👺 Dente de Goblin',
    emoji: '👺',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Dente torto de goblin. Usado em poções e amuletos.',
    valor_venda: 12
},
'mapa_antigo': {
    id: 'mapa_antigo',
    nome: '🗺️ Mapa Antigo',
    emoji: '🗺️',
    tipo: 'item_quest',
    raridade: 'epico',
    descricao: 'Um mapa rasgado com escritas antigas. Pode levar a um tesouro.',
    valor_venda: 50
},
'raiz_ancestral': {
    id: 'raiz_ancestral',
    nome: '🌱 Raiz Ancestral',
    emoji: '🌱',
    tipo: 'material',
    raridade: 'raro',
    descricao: 'Raiz de uma árvore milenar. Cheia de energia vital.',
    valor_venda: 25
},
'pólen_magico': {
    id: 'pólen_magico',
    nome: '✨ Pólen Mágico',
    emoji: '✨',
    tipo: 'material',
    raridade: 'raro',
    descricao: 'Pólen brilhante de flores mágicas. Usado em poções.',
    valor_venda: 20
},
'fragmento_espiritual': {
    id: 'fragmento_espiritual',
    nome: '💫 Fragmento Espiritual',
    emoji: '💫',
    tipo: 'material',
    raridade: 'epico',
    descricao: 'Fragmento de alma ancestral. Poderoso e raro.',
    valor_venda: 45
},
'essencia_ancestral': {
    id: 'essencia_ancestral',
    nome: '🔮 Essência Ancestral',
    emoji: '🔮',
    tipo: 'material',
    raridade: 'epico',
    descricao: 'Essência pura dos antigos guardiões.',
    valor_venda: 40
},

// ============================================================
// 🔹 ITENS DO BOSS
// ============================================================
'fragmento_eldoria': {
    id: 'fragmento_eldoria',
    nome: '💎 Fragmento de Eldoria',
    emoji: '💎',
    tipo: 'item_quest',
    raridade: 'epico',
    descricao: 'O coração da floresta. Essencial para a jornada.',
    valor_venda: 0
},
'essencia_ancestral': {
    id: 'essencia_ancestral',
    nome: '🔮 Essência Ancestral',
    emoji: '🔮',
    tipo: 'material',
    raridade: 'epico',
    descricao: 'Essência pura dos antigos guardiões.',
    valor_venda: 40
},
'raiz_ancestral': {
    id: 'raiz_ancestral',
    nome: '🌱 Raiz Ancestral',
    emoji: '🌱',
    tipo: 'material',
    raridade: 'raro',
    descricao: 'Raiz da árvore milenar de Eldoria.',
    valor_venda: 25
},
'cristal': {
    id: 'cristal',
    nome: '💎 Cristal',
    emoji: '💎',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Cristal mágico da floresta.',
    valor_venda: 20
},
'cristal': {
    id: 'cristal',
    nome: '💎 Cristal',
    emoji: '💎',
    tipo: 'material',
    raridade: 'incomum',
    descricao: 'Cristal mágico da floresta.',
    valor_venda: 20
},
'anel_floresta': {
    id: 'anel_floresta',
    nome: '💍 Anel da Floresta',
    emoji: '💍',
    tipo: 'acessorio',
    raridade: 'epico',
    descricao: 'Um anel antigo com poder da floresta. +5 Poder, +3 Defesa, +10 Vida Max.',
    poder: 5,
    defesa: 3,
    vidaMax: 10,
    valor_venda: 100
},

    // ============================================================
    // 🔹 ARMAS (CRAFTAVEIS)
    // ============================================================
    'espada_madeira': {
        id: 'espada_madeira',
        nome: 'Espada de Madeira',
        emoji: '🗡️',
        tipo: 'arma',
        raridade: 'comum',
        poder: 5,
        descricao: 'Uma espada simples de madeira, boa para treinos.',
        craftavel: true,
        receita: { madeira: 3 },
        alias: ['espada', 'espada madeira', 'madeira']
    },
    'espada_ferro': {
        id: 'espada_ferro',
        nome: 'Espada de Ferro',
        emoji: '🗡️',
        tipo: 'arma',
        raridade: 'incomum',
        poder: 12,
        descricao: 'Uma espada resistente de ferro.',
        craftavel: true,
        receita: { ferro: 3, madeira: 2 },
        alias: ['espada', 'espada ferro', 'ferro']
    },
    'escudo_madeira': {
        id: 'escudo_madeira',
        nome: 'Escudo de Madeira',
        emoji: '🛡️',
        tipo: 'escudo',
        raridade: 'comum',
        defesa: 5,
        descricao: 'Um escudo simples de madeira.',
        craftavel: true,
        receita: { madeira: 4 },
        alias: ['escudo', 'escudo madeira']
    },

    // ============================================================
    // 🔹 FERRAMENTAS
    // ============================================================
    'picareta_madeira': {
        id: 'picareta_madeira',
        nome: 'Picareta de Madeira',
        emoji: '⛏️',
        tipo: 'arma',
        raridade: 'comum',
        poder: 3,
        descricao: 'Picareta simples de madeira. Serve para minerar e como arma.',
        craftavel: true,
        receita: { madeira: 3 },
        alias: ['picareta', 'picareta madeira', 'picareta de madeira']
    },
    'picareta_ferro': {
        id: 'picareta_ferro',
        nome: 'Picareta de Ferro',
        emoji: '⛏️',
        tipo: 'arma',
        raridade: 'incomum',
        poder: 6,
        descricao: 'Picareta resistente de ferro. Melhor para minerar e combate.',
        craftavel: true,
        receita: { ferro: 3, madeira: 2 },
        alias: ['picareta', 'picareta ferro', 'picareta de ferro']
    },

    // ============================================================
    // 🔹 POÇÕES (CRAFTAVEIS)
    // ============================================================
    'pocao_vida': {
        id: 'pocao_vida',
        nome: 'Poção de Vida',
        emoji: '🧪',
        tipo: 'consumivel',
        raridade: 'comum',
        cura: 30,
        descricao: 'Restaura 30 de vida.',
        craftavel: true,
        receita: { erva: 2, vidro: 1 },
        alias: ['pocao', 'vida', 'pocao vida']
    },

    // ============================================================
    // 🔹 ARMADURAS (CRAFTAVEIS)
    // ============================================================
    'capacete_couro': {
        id: 'capacete_couro',
        nome: 'Capacete de Couro',
        emoji: '⛑️',
        tipo: 'capacete',
        raridade: 'comum',
        defesa: 3,
        descricao: 'Um capacete simples de couro.',
        craftavel: true,
        receita: { couro: 2 },
        alias: ['capacete', 'capacetecouro', 'elmo']
    },
    'peitoral_couro': {
        id: 'peitoral_couro',
        nome: 'Peitoral de Couro',
        emoji: '🦺',
        tipo: 'peitoral',
        raridade: 'comum',
        defesa: 5,
        descricao: 'Um peitoral resistente de couro.',
        craftavel: true,
        receita: { couro: 3 },
        alias: ['peitoral', 'armadura', 'couro']
    },
    'botas_couro': {
        id: 'botas_couro',
        nome: 'Botas de Couro',
        emoji: '👢',
        tipo: 'pes',
        raridade: 'comum',
        defesa: 2,
        esquiva: 3,
        descricao: 'Botas leves de couro que aumentam a esquiva.',
        craftavel: true,
        receita: { couro: 2 },
        alias: ['botas', 'bota', 'couro']
    }
};

module.exports = ITENS_BASE;
