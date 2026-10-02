// dados/precos.js - TABELA DE PREÇOS DOS ITENS

const PRECOS = {
    // ============================================================
    // 🔹 MATERIAIS (COLETÁVEIS)
    // ============================================================
    'madeira': 2,
    'ferro': 5,
    'erva': 3,
    'erva_curativa': 3,
    'vidro': 8,
    'couro': 4,
    'pedra': 2,
    'carvao': 3,
    
    // ============================================================
    // 🔹 DROPS DE MONSTROS
    // ============================================================
    'dente_lobo': 5,
    'pelo_lobo': 6,
    'presa_javali': 10,
    'essencia_sombria': 25,
    'dente_goblin': 12,
    'mapa_antigo': 50,
    'raiz_ancestral': 20,
    'polen_magico': 18,
    'fragmento_espiritual': 40,
    'essencia_ancestral': 35,
    'cristal': 30,
    'pena': 2,
    'pena_colorida': 8,
    'chifre': 10,
    'olho_corvo': 15,
    
    // ============================================================
    // 🔹 COMIDAS
    // ============================================================
    'ovo': 2,
    'leite': 3,
    'carne': 5,
    
    // ============================================================
    // 🔹 ARMAS
    // ============================================================
    'espada_madeira': 15,
    'espada_ferro': 40,
    'escudo_madeira': 20,
    'picareta_madeira': 15,
    'picareta_ferro': 40,
    
    // ============================================================
    // 🔹 ARMADURAS
    // ============================================================
    'capacete_couro': 15,
    'peitoral_couro': 25,
    'botas_couro': 15,
    
    // ============================================================
    // 🔹 POÇÕES
    // ============================================================
    'pocao_vida': 10,
    'pocao_mana': 8,
    'pocao_vida_grande': 25,
};

// ============================================================
// 🔹 FUNÇÕES
// ============================================================

function getPreco(itemId) {
    return PRECOS[itemId] || 0;
}

function getPrecoTotal(itemId, quantidade) {
    return getPreco(itemId) * quantidade;
}

function listarPrecos() {
    const ITENS_BASE = require('./itens_base');
    let texto = '💰 *TABELA DE PREÇOS*\n\n';
    
    // Agrupa por tipo
    const categorias = {
        'material': '📦 MATERIAIS',
        'arma': '⚔️ ARMAS',
        'escudo': '🛡️ ESCUDOS',
        'capacete': '⛑️ CAPACETES',
        'peitoral': '🦺 PEITORAIS',
        'pernas': '👖 PERNAS',
        'pes': '👢 PÉS',
        'acessorio': '💍 ACESSÓRIOS',
        'consumivel': '🧪 CONSUMÍVEIS',
        'comida': '🍖 COMIDAS'
    };
    
    for (const [tipo, titulo] of Object.entries(categorias)) {
        const itens = Object.entries(PRECOS)
            .filter(([id]) => ITENS_BASE[id]?.tipo === tipo)
            .sort(([, a], [, b]) => b - a);
        
        if (itens.length === 0) continue;
        
        texto += `*${titulo}*\n`;
        for (const [id, preco] of itens) {
            const info = ITENS_BASE[id];
            const emoji = info?.emoji || '📦';
            const nome = info?.nome || id;
            texto += `   ${emoji} ${nome} → 💰 ${preco}\n`;
        }
        texto += '\n';
    }
    
    return texto;
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    PRECOS,
    getPreco,
    getPrecoTotal,
    listarPrecos
};
