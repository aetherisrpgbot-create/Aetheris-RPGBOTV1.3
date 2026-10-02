// dados/receitas.js - RECEITAS DE CRAFTING
const RECEITAS = {
    // ============================================================
    // 🔹 ARMAS
    // ============================================================
    'espada_madeira': {
        id: 'espada_madeira',
        nome: '🗡️ Espada de Madeira',
        nivel_necessario: 1,
        materiais: { madeira: 3 },
        resultado: { id: 'espada_madeira', quantidade: 1 },
        tempo: '5s',
        descricao: 'Uma espada simples de madeira.'
    },
    'espada_ferro': {
        id: 'espada_ferro',
        nome: '🗡️ Espada de Ferro',
        nivel_necessario: 3,
        materiais: { ferro: 3, madeira: 2 },
        resultado: { id: 'espada_ferro', quantidade: 1 },
        tempo: '15s',
        descricao: 'Uma espada resistente de ferro.'
    },

    // ============================================================
    // 🔹 POÇÕES
    // ============================================================
    'pocao_vida': {
        id: 'pocao_vida',
        nome: '🧪 Poção de Vida',
        nivel_necessario: 1,
        materiais: { erva: 2, vidro: 1 },
        resultado: { id: 'pocao_vida', quantidade: 1 },
        tempo: '5s',
        descricao: 'Restaura 30 de vida.'
    },

    // ============================================================
    // 🔹 ARMADURAS
    // ============================================================
    'capacete_couro': {
        id: 'capacete_couro',
        nome: '⛑️ Capacete de Couro',
        nivel_necessario: 2,
        materiais: { couro: 2 },
        resultado: { id: 'capacete_couro', quantidade: 1 },
        tempo: '10s',
        descricao: 'Um capacete simples de couro.'
    },
    'peitoral_couro': {
        id: 'peitoral_couro',
        nome: '🦺 Peitoral de Couro',
        nivel_necessario: 2,
        materiais: { couro: 3 },
        resultado: { id: 'peitoral_couro', quantidade: 1 },
        tempo: '10s',
        descricao: 'Um peitoral resistente de couro.'
    },

    // ============================================================
    // 🔹 FERRAMENTAS (PARA MINERAÇÃO/COLETA)
    // ============================================================
    'picareta_madeira': {
        id: 'picareta_madeira',
        nome: '⛏️ Picareta de Madeira',
        nivel_necessario: 1,
        materiais: { madeira: 3 },
        resultado: { id: 'picareta_madeira', quantidade: 1 },
        tempo: '5s',
        descricao: 'Picareta simples para mineração básica.'
    },
    'picareta_ferro': {
        id: 'picareta_ferro',
        nome: '⛏️ Picareta de Ferro',
        nivel_necessario: 3,
        materiais: { ferro: 2, madeira: 2 },
        resultado: { id: 'picareta_ferro', quantidade: 1 },
        tempo: '15s',
        descricao: 'Picareta resistente para mineração avançada.'
    }
};

module.exports = RECEITAS;
