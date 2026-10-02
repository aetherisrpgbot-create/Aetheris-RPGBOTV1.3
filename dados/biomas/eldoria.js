// dados/biomas/eldoria.js - BIOMA I: FLORESTA DE ELDORIA (ESTRUTURADO)

const BIOMA_ELDORIA = {
    id: 'eldoria',
    nome: '🌲 Floresta de Eldoria',
    descricao: 'Uma floresta antiga e cheia de mistérios. Onde tudo começou.',
    nivel_necessario: 1,
    
    // ============================================================
    // 🔹 ÁREAS
    // ============================================================
    areas: [
        {
            id: 'acampamento',
            nome: '🏕️ Acampamento dos Viajantes',
            descricao: 'O ponto de partida. Onde os aventureiros descansam e se preparam.',
            nivel_necessario: 1,
            npcs: ['mestre_arven', 'mira_mercadora', 'kael_fracassado', 'elya_curandeira']
        },
        {
            id: 'trilha_cacadores',
            nome: '🌲 Trilha dos Caçadores',
            descricao: 'O caminho inicial. Cheio de animais selvagens e pequenos perigos.',
            nivel_necessario: 1
        },
        {
            id: 'torre_cacador',
            nome: '🏹 Torre do Caçador',
            descricao: 'Uma torre de madeira no alto da colina. Abriga Ronan, o caçador solitário.',
            nivel_necessario: 2,
            npcs: ['ronan_cacador']
        },
        {
            id: 'aldeia_abandonada',
            nome: '🕯️ Aldeia Abandonada',
            descricao: 'Uma vila vazia. Todos desapareceram. Algo antigo habita aqui.',
            nivel_necessario: 3
        },
        {
            id: 'bosque_antigo',
            nome: '🌳 Bosque Antigo',
            descricao: 'O coração da floresta. Onde o Fragmento de Eldoria está escondido.',
            nivel_necessario: 4
        },
        {
            id: 'santuario_guardiao',
            nome: '⚔️ Santuário do Guardião',
            descricao: 'A clareira sagrada. Tharion, o Guardião Verde, aguarda.',
            nivel_necessario: 5
        }
    ],
    
    // ============================================================
    // 🔹 RECURSOS (COLETÁVEIS)
    // ============================================================
    recursos: [
        { item: 'madeira', chance: 0.6, quantidade: '1-3' },
        { item: 'erva', chance: 0.4, quantidade: '1-2' },
        { item: 'couro', chance: 0.2, quantidade: '1' },
        { item: 'pedra', chance: 0.1, quantidade: '1-2' }
    ],
    
    // ============================================================
    // 🔹 NPCs
    // ============================================================
    npcs: {
        'mestre_arven': {
            id: 'mestre_arven',
            nome: '🧓 Mestre Arven',
            titulo: 'O Instrutor',
            descricao: 'Um antigo aventureiro que treina iniciantes.',
            dialogo_inicial: '"Então você é o novo recruta."',
            funcoes: ['treinar', 'ensinar_comandos'],
            missao: 'conheca_voce_mesmo'
        },
        'mira_mercadora': {
            id: 'mira_mercadora',
            nome: '🧺 Mira',
            titulo: 'A Mercadora',
            descricao: 'Uma comerciante falante que conhece todos os aventureiros.',
            dialogo_inicial: '"Quer sobreviver? Monstros não aceitam pagamento em experiência."',
            funcoes: ['comprar', 'vender', 'trocar'],
            itens_venda: ['pocao_vida', 'pocao_mana']
        },
        'kael_fracassado': {
            id: 'kael_fracassado',
            nome: '🗡️ Kael',
            titulo: 'O Aventureiro Fracassado',
            descricao: 'Um jovem aventureiro que ainda não derrotou nenhum monstro.',
            dialogo_inicial: '"Espada não paga comida."',
            funcoes: ['trabalhar', 'ensinar_stamina'],
            missao: 'primeiro_pagamento'
        },
        'elya_curandeira': {
            id: 'elya_curandeira',
            nome: '🧙 Elya',
            titulo: 'A Curandeira',
            descricao: 'Uma jovem curandeira silenciosa.',
            dialogo_inicial: '"Até os maiores guerreiros precisam parar."',
            funcoes: ['curar', 'ensinar_descanso'],
            dialogo_secreto: '"Só não confunda descanso com segurança."'
        },
        'ronan_cacador': {
            id: 'ronan_cacador',
            nome: '🏹 Ronan',
            titulo: 'O Caçador Solitário',
            descricao: 'Um caçador que vive na torre.',
            dialogo_inicial: '"Meu irmão desapareceu."',
            funcoes: ['missao_cacador'],
            missao: 'o_desaparecido'
        }
    },
    
// ============================================================
// 🔹 INIMIGOS (HOSTIS) - DROPS MELHORADOS
// ============================================================
inimigos: {
    'lobo_selvagem': {
        id: 'lobo_selvagem',
        nome: '🐺 Lobo Selvagem',
        tipo: 'hostil',
        area: ['trilha_cacadores', 'torre_cacador', 'bosque_antigo'],
        nivel: 1,
        vida: 25,
        poder: 6,
        defesa: 2,
        xp: 10,
        ouro: 3,
        drop: [
            { item: 'couro', chance: 0.4, quantidade: '1-2' },
            { item: 'carne', chance: 0.3, quantidade: '1' },
            { item: 'dente_lobo', chance: 0.15, quantidade: '1' },
            { item: 'pelo_lobo', chance: 0.1, quantidade: '1' }
        ],
        descricao: 'Um lobo rápido e feroz. Comum nas bordas da floresta.'
    },
    'javali_corrompido': {
        id: 'javali_corrompido',
        nome: '🐗 Javali Corrompido',
        tipo: 'hostil',
        area: ['trilha_cacadores', 'torre_cacador'],
        nivel: 2,
        vida: 35,
        poder: 8,
        defesa: 4,
        xp: 15,
        ouro: 5,
        drop: [
            { item: 'couro', chance: 0.5, quantidade: '1-2' },
            { item: 'carne', chance: 0.4, quantidade: '1-2' },
            { item: 'presa_javali', chance: 0.2, quantidade: '1' },
            { item: 'essencia_sombria', chance: 0.05, quantidade: '1' }
        ],
        descricao: 'Um javali agressivo, corrompido pelo Fragmento.'
    },
    'trepadeira_sombria': {
        id: 'trepadeira_sombria',
        nome: '🌿 Trepadeira Sombria',
        tipo: 'hostil',
        area: ['aldeia_abandonada'],
        nivel: 3,
        vida: 30,
        poder: 10,
        defesa: 3,
        xp: 20,
        ouro: 4,
        drop: [
            { item: 'erva', chance: 0.5, quantidade: '1-2' },
            { item: 'vidro', chance: 0.2, quantidade: '1' },
            { item: 'essencia_sombria', chance: 0.15, quantidade: '1' },
            { item: 'raiz_ancestral', chance: 0.05, quantidade: '1' }
        ],
        descricao: 'Uma criatura vegetal que surgiu depois da Grande Ruptura.'
    },
    'goblin_batedor': {
        id: 'goblin_batedor',
        nome: '👺 Goblin Batedor',
        tipo: 'hostil',
        area: ['aldeia_abandonada'],
        nivel: 3,
        vida: 28,
        poder: 12,
        defesa: 2,
        xp: 22,
        ouro: 8,
        drop: [
            { item: 'ouro', chance: 0.3, quantidade: '1-3' },
            { item: 'ferro', chance: 0.2, quantidade: '1' },
            { item: 'dente_goblin', chance: 0.15, quantidade: '1' },
            { item: 'mapa_antigo', chance: 0.05, quantidade: '1' }
        ],
        descricao: 'O primeiro inimigo inteligente. Goblin não deveria estar em Eldoria.'
    },
    'espirito_florestal': {
        id: 'espirito_florestal',
        nome: '👻 Espírito Florestal',
        tipo: 'hostil',
        area: ['bosque_antigo', 'santuario_guardiao'],
        nivel: 4,
        vida: 40,
        poder: 14,
        defesa: 5,
        xp: 30,
        ouro: 10,
        drop: [
            { item: 'cristal', chance: 0.2, quantidade: '1' },
            { item: 'essencia_ancestral', chance: 0.15, quantidade: '1' },
            { item: 'pólen_magico', chance: 0.1, quantidade: '1' },
            { item: 'fragmento_espiritual', chance: 0.05, quantidade: '1' }
        ],
        descricao: 'Uma alma ancestral que protege o Bosque Antigo.'
    }
},
    
    // ============================================================
    // 🔹 CRIATURAS PACÍFICAS - COM area
    // ============================================================
    criaturas_pacificas: {
        'vaca': {
            id: 'vaca',
            nome: '🐄 Vaca',
            tipo: 'pacifica',
            area: ['acampamento'],
            descricao: 'Uma vaca tranquila pastando. Pode ser ordenhada.',
            acoes: ['ordenhar'],
            drop: [{ item: 'leite', chance: 0.5, quantidade: '1-2' }]
        },
        'galinha': {
            id: 'galinha',
            nome: '🐔 Galinha',
            tipo: 'pacifica',
            area: ['acampamento'],
            descricao: 'Uma galinha ciscando no chão. Pode deixar ovos.',
            acoes: ['coletar_ovos'],
            drop: [{ item: 'ovo', chance: 0.6, quantidade: '1-3' }]
        },
        'coelho': {
            id: 'coelho',
            nome: '🐇 Coelho',
            tipo: 'pacifica',
            area: ['acampamento', 'trilha_cacadores', 'torre_cacador', 'aldeia_abandonada'],
            descricao: 'Um coelho rápido e assustado. Difícil de pegar.',
            acoes: ['capturar'],
            drop: [{ item: 'couro', chance: 0.3, quantidade: 1 }]
        },
        'veado': {
            id: 'veado',
            nome: '🦌 Veado',
            tipo: 'pacifica',
            area: ['trilha_cacadores', 'torre_cacador', 'bosque_antigo'],
            descricao: 'Um veado majestoso observando a floresta.',
            acoes: ['observar'],
            drop: [{ item: 'couro', chance: 0.4, quantidade: '1-2' }]
        },
        'passaro': {
            id: 'passaro',
            nome: '🐦 Pássaro',
            tipo: 'pacifica',
            area: ['acampamento', 'trilha_cacadores', 'torre_cacador'],
            descricao: 'Um pássaro cantando nos galhos.',
            acoes: ['observar', 'espantar'],
            drop: [{ item: 'pena', chance: 0.3, quantidade: 1 }]
        },
        'corvo': {
            id: 'corvo',
            nome: '🐦‍⬛ Corvo',
            tipo: 'pacifica',
            area: ['aldeia_abandonada', 'bosque_antigo'],
            descricao: 'Um corvo observando tudo com seus olhos brilhantes.',
            acoes: ['observar'],
            drop: [{ item: 'pena', chance: 0.2, quantidade: 1 }]
        }
    },
    
// ============================================================
// 🔹 BOSS - THARION, O GUARDIÃO VERDE (MELHORADO)
// ============================================================
boss: {
    'tharion_guardiao_verde': {
        id: 'tharion_guardiao_verde',
        nome: '⚔️ Tharion, o Guardião Verde',
        titulo: 'O Primeiro Guardião',
        nivel: 5,
        vida: 120,
        poder: 22,
        defesa: 12,
        xp: 150,
        ouro: 150,
        descricao: 'O lendário guardião do Fragmento de Eldoria. Corrompido pelo tempo, mas ainda poderoso.',
        
        // ============================================================
        // 🔹 DIÁLOGOS DO BOSS
        // ============================================================
        dialogos: {
            inicio: '"Outro aventureiro... Vocês sempre vêm. Buscam ouro. Buscam poder. Buscam os fragmentos."',
            ataque: '"A floresta se ergue contra você!"',
            defesa: '"Você não passará!"',
            derrota: '"Então... ainda existem aventureiros dignos. Leve-o. Eu o protegi durante toda a minha existência. Agora... é sua vez."',
            alerta: '"Sinta o poder da natureza!"'
        },
        
        // ============================================================
        // 🔹 ATAQUES ESPECIAIS DO BOSS
        // ============================================================
        ataques: [
            { 
                nome: '🌿 Golpe da Raiz', 
                descricao: 'Raízes surgem do chão e te golpeiam.',
                dano: 12,
                chance: 0.4
            },
            { 
                nome: '🌪️ Investida Verde', 
                descricao: 'Tharion se lança contra você com força total.',
                dano: 20,
                chance: 0.25
            },
            { 
                nome: '🌱 Chamado da Floresta', 
                descricao: 'Tharion invoca criaturas da floresta para ajudá-lo.',
                dano: 8,
                chance: 0.2,
                invoca: ['trepadeira_sombria', 'espirito_florestal']
            },
            { 
                nome: '🛡️ Proteção Ancestral', 
                descricao: 'Tharion se protege com a energia da floresta, recuperando vida.',
                dano: 0,
                chance: 0.1,
                cura: 20
            }
        ],
        
        // ============================================================
        // 🔹 DROPS DO BOSS
        // ============================================================
        drop: [
            { 
                item: 'fragmento_eldoria', 
                chance: 1.0, 
                quantidade: 1,
                descricao: '💎 O coração da floresta. Essencial para a jornada.'
            },
            { 
                item: 'ouro', 
                chance: 1.0, 
                quantidade: '100-150',
                descricao: '💰 Recompensa dos antigos guardiões.'
            },
            { 
                item: 'essencia_ancestral', 
                chance: 0.3, 
                quantidade: 1,
                descricao: '🔮 Essência pura dos antigos guardiões.'
            },
            { 
                item: 'cristal', 
                chance: 0.5, 
                quantidade: '1-2',
                descricao: '💎 Cristal mágico da floresta.'
            },
            { 
                item: 'raiz_ancestral', 
                chance: 0.2, 
                quantidade: 1,
                descricao: '🌱 Raiz da árvore milenar de Eldoria.'
            }
        ],
        
        // ============================================================
        // 🔹 RECOMPENSAS ESPECIAIS
        // ============================================================
        recompensas: {
            xp: 200,
            ouro: 200,
            titulo: '🌱 Guardião de Eldoria',
            blessing: '🌿 Bênção do Primeiro Guardião',
            conquista: '🌳 A Queda do Guardião',
            item_especial: '💍 Anel da Floresta'
        },
        
        // ============================================================
        // 🔹 ESTATÍSTICAS AVANÇADAS
        // ============================================================
        stats: {
            critico: 10,
            esquiva: 5,
            regeneracao: 3,
            resistencia: 15
        },
        
        // ============================================================
        // 🔹 FASES DA BATALHA
        // ============================================================
        fases: [
            {
                nome: '🌿 Fase 1: O Guardião',
                vida: '100-80%',
                descricao: 'Tharion testa sua força com ataques básicos.'
            },
            {
                nome: '🌪️ Fase 2: A Fúria da Floresta',
                vida: '79-40%',
                descricao: 'Tharion fica mais agressivo e invoca criaturas.'
            },
            {
                nome: '💀 Fase 3: A Última Defesa',
                vida: '39-0%',
                descricao: 'Tharion usa todo seu poder para te impedir.'
            }
        ]
    }
},
    
    // ============================================================
    // 🔹 MISSÕES
    // ============================================================
    missoes: {
        'conheca_voce_mesmo': {
            id: 'conheca_voce_mesmo',
            nome: '📜 Conheça a si mesmo',
            descricao: 'Consulte seu perfil e descubra seus atributos.',
            objetivo: 'usar !perfil',
            recompensa_xp: 10,
            recompensa_ouro: 0,
            npc: 'mestre_arven'
        },
        'primeiro_pagamento': {
            id: 'primeiro_pagamento',
            nome: '📜 Primeiro pagamento',
            descricao: 'Realize um trabalho para ganhar seu primeiro dinheiro.',
            objetivo: 'usar !trabalhar',
            recompensa_xp: 5,
            recompensa_ouro: 20,
            npc: 'kael_fracassado'
        },
        'o_desaparecido': {
            id: 'o_desaparecido',
            nome: '📜 O desaparecido',
            descricao: 'Encontre pistas sobre o irmão de Ronan na floresta.',
            objetivo: 'encontrar_pistas',
            recompensa_xp: 30,
            recompensa_ouro: 15,
            npc: 'ronan_cacador'
        }
    },
    
    // ============================================================
    // 🔹 EVENTOS
    // ============================================================
    eventos: [
        {
            id: 'lua_cheia',
            nome: '🌕 Lua Cheia',
            descricao: 'Os lobos estão mais fortes.',
            chance: 0.1,
            efeito: 'inimigos_poder +50%',
            duracao: 3
        },
        {
            id: 'chuva_forte',
            nome: '🌧️ Chuva Forte',
            descricao: 'A chuva dificulta a visão.',
            chance: 0.15,
            efeito: 'inimigos_esquiva -30%',
            duracao: 2
        }
    ],
    
    // ============================================================
    // 🔹 RECOMPENSAS PERMANENTES
    // ============================================================
    recompensas_permanentes: {
        'benção_eldoria': {
            id: 'benção_eldoria',
            nome: '🌿 Bênção do Primeiro Guardião',
            descricao: 'Descanso +20% recuperação.',
            efeito: 'descanso +20% recuperação'
        },
        'titulo_guardiao': {
            id: 'titulo_guardiao',
            nome: '🌱 Guardião de Eldoria',
            descricao: 'Concedido aos que salvaram a floresta.',
            permanente: true
        }
    }
};

// ============================================================
// 🔹 FUNÇÕES AUXILIARES
// ============================================================

// ============================================================
// 🔹 BUSCAR CRIATURAS POR ÁREA
// ============================================================

function getCriaturasPorArea(areaId) {
    const result = [];
    
    // Busca nas pacíficas
    for (const [id, criatura] of Object.entries(BIOMA_ELDORIA.criaturas_pacificas || {})) {
        const areas = Array.isArray(criatura.area) ? criatura.area : [criatura.area];
        if (areas.includes(areaId)) {
            result.push({ id, ...criatura });
        }
    }
    
    // Busca nos inimigos
    for (const [id, criatura] of Object.entries(BIOMA_ELDORIA.inimigos || {})) {
        const areas = Array.isArray(criatura.area) ? criatura.area : [criatura.area];
        if (areas.includes(areaId)) {
            result.push({ id, ...criatura });
        }
    }
    
    return result;
}

// ============================================================
// 🔹 BUSCAR CRIATURAS POR TIPO
// ============================================================

function getCriaturasPorTipo(areaId, tipo) {
    const result = [];
    const fonte = tipo === 'pacifica' ? BIOMA_ELDORIA.criaturas_pacificas : BIOMA_ELDORIA.inimigos;
    
    for (const [id, criatura] of Object.entries(fonte || {})) {
        const areas = Array.isArray(criatura.area) ? criatura.area : [criatura.area];
        if (areas.includes(areaId)) {
            result.push({ id, ...criatura });
        }
    }
    
    return result;
}

// ============================================================
// 🔹 SELECIONAR CRIATURA ALEATÓRIA
// ============================================================

function getCriaturaAleatoria(areaId) {
    const criaturas = getCriaturasPorArea(areaId);
    if (criaturas.length === 0) return null;
    return criaturas[Math.floor(Math.random() * criaturas.length)];
}

function getCriaturaHostilAleatoria(areaId) {
    const criaturas = getCriaturasPorTipo(areaId, 'hostil');
    if (criaturas.length === 0) return null;
    return criaturas[Math.floor(Math.random() * criaturas.length)];
}

function getCriaturaPacificaAleatoria(areaId) {
    const criaturas = getCriaturasPorTipo(areaId, 'pacifica');
    if (criaturas.length === 0) return null;
    return criaturas[Math.floor(Math.random() * criaturas.length)];
}

// ============================================================
// 🔹 CALCULAR DROP
// ============================================================

function getDrop(criatura) {
    if (!criatura.drop || criatura.drop.length === 0) return null;
    
    for (const drop of criatura.drop) {
        if (Math.random() < drop.chance) {
            let quantidade = 1;
            
            if (drop.quantidade) {
                if (typeof drop.quantidade === 'string' && drop.quantidade.includes('-')) {
                    const [min, max] = drop.quantidade.split('-').map(Number);
                    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
                        quantidade = Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                } else {
                    const num = Number(drop.quantidade);
                    if (!isNaN(num) && num > 0) quantidade = num;
                }
            }
            
            if (isNaN(quantidade) || quantidade < 1) quantidade = 1;
            return { item: drop.item, quantidade: Math.floor(quantidade) };
        }
    }
    return null;
}

// ============================================================
// 🔹 ÁREAS
// ============================================================

function getArea(areaId) {
    const areas = {
        'acampamento': { id: 'acampamento', nome: '🏕️ Acampamento dos Viajantes' },
        'trilha_cacadores': { id: 'trilha_cacadores', nome: '🌲 Trilha dos Caçadores' },
        'torre_cacador': { id: 'torre_cacador', nome: '🏹 Torre do Caçador' },
        'aldeia_abandonada': { id: 'aldeia_abandonada', nome: '🕯️ Aldeia Abandonada' },
        'bosque_antigo': { id: 'bosque_antigo', nome: '🌳 Bosque Antigo' },
        'santuario_guardiao': { id: 'santuario_guardiao', nome: '⚔️ Santuário do Guardião' }
    };
    return areas[areaId] || { id: areaId, nome: areaId };
}

function getAreaNome(areaId) {
    const area = getArea(areaId);
    return area ? area.nome : areaId;
}

function getCriatura(id) {
    return BIOMA_ELDORIA.criaturas_pacificas?.[id] || BIOMA_ELDORIA.inimigos?.[id] || null;
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    ELDORIA: BIOMA_ELDORIA,
    getCriaturasPorArea,
    getCriaturasPorTipo,
    getCriaturaAleatoria,
    getCriaturaHostilAleatoria,
    getCriaturaPacificaAleatoria,
    getDrop,
    getArea,
    getAreaNome,
    getCriatura
};
