// dados/slots.js - SLOTS COM NOMES AMIGÁVEIS
const SLOTS = {
    'arma': 'mao_direita',
    'escudo': 'mao_esquerda',
    'capacete': 'capacete',
    'peitoral': 'peitoral',
    'pernas': 'pernas',
    'pes': 'pes',
    'acessorio': 'acessorio1'
};

// 🔥 MAPA DE NOMES AMIGÁVEIS → ID DO SLOT
const SLOTS_ALIAS = {
    // Mão direita
    'mao direita': 'mao_direita',
    'mão direita': 'mao_direita',
    'mao direta': 'mao_direita',
    'mão direta': 'mao_direita',
    'direita': 'mao_direita',
    'mao': 'mao_direita',
    'mão': 'mao_direita',
    
    // Mão esquerda
    'mao esquerda': 'mao_esquerda',
    'mão esquerda': 'mao_esquerda',
    'mao canhota': 'mao_esquerda',
    'mão canhota': 'mao_esquerda',
    'esquerda': 'mao_esquerda',
    'escudo': 'mao_esquerda',
    
    // Capacete
    'capacete': 'capacete',
    'cabeca': 'capacete',
    'cabeça': 'capacete',
    'elmo': 'capacete',
    
    // Peitoral
    'peitoral': 'peitoral',
    'armadura': 'peitoral',
    'corpo': 'peitoral',
    'peito': 'peitoral',
    
    // Pernas
    'pernas': 'pernas',
    'perna': 'pernas',
    'calça': 'pernas',
    'calcas': 'pernas',
    
    // Pés
    'pes': 'pes',
    'pés': 'pes',
    'pe': 'pes',
    'pé': 'pes',
    'botas': 'pes',
    'bota': 'pes',
    
    // Acessórios
    'acessorio1': 'acessorio1',
    'acessório1': 'acessorio1',
    'acessorio 1': 'acessorio1',
    'acessório 1': 'acessorio1',
    'anel': 'acessorio1',
    'acessorio2': 'acessorio2',
    'acessório2': 'acessorio2',
    'acessorio 2': 'acessorio2',
    'acessório 2': 'acessorio2',
    'amuleto': 'acessorio2'
};

// 🔥 NOMES EXIBIDOS PARA CADA SLOT
const SLOTS_NOMES = {
    'mao_direita': '🗡️ Mão Direita',
    'mao_esquerda': '🛡️ Mão Esquerda',
    'capacete': '⛑️ Capacete',
    'peitoral': '🦺 Peitoral',
    'pernas': '👖 Pernas',
    'pes': '👢 Pés',
    'acessorio1': '💍 Acessório 1',
    'acessorio2': '💍 Acessório 2'
};

function slotValidoParaItem(itemTipo, slot) {
    if (itemTipo === 'acessorio') {
        return slot === 'acessorio1' || slot === 'acessorio2';
    }
    return SLOTS[itemTipo] === slot;
}

function getSlotCorreto(itemTipo) {
    if (itemTipo === 'acessorio') {
        return 'acessorio1 (ou acessorio2)';
    }
    return SLOTS[itemTipo] || 'desconhecido';
}

// 🔥 CONVERTE NOME AMIGÁVEL PARA ID DO SLOT
function converterSlot(nomeSlot) {
    const nomeLower = nomeSlot.toLowerCase().trim();
    return SLOTS_ALIAS[nomeLower] || nomeLower;
}

// 🔥 LISTA DE SLOTS PARA O MENU
function listarSlots() {
    let texto = '📌 *Slots disponíveis:*\n\n';
    for (const [id, nome] of Object.entries(SLOTS_NOMES)) {
        texto += `   • ${nome} (${id})\n`;
    }
    return texto;
}

module.exports = {
    SLOTS,
    SLOTS_ALIAS,
    SLOTS_NOMES,
    slotValidoParaItem,
    getSlotCorreto,
    converterSlot,
    listarSlots
};
