// dados/missoes.js - MISSÕES DO JOGO (COMPLETO)

const MISSOES = {
    // ============================================================
    // 🔹 ARVEN - MISSÕES DE TREINAMENTO (NÍVEL 1-3)
    // ============================================================

    'conheca_voce_mesmo': {
        id: 'conheca_voce_mesmo',
        nome: '📜 Conheça a si mesmo',
        descricao: 'Consulte seu perfil e descubra seus atributos.',
        npc: 'mestre_arven',
        nivel_necessario: 1,
        objetivos: [
            {
                tipo: 'comando',
                alvo: 'perfil',
                descricao: 'Use !perfil para ver seus atributos',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Antes de qualquer coisa, você precisa se conhecer. Consulte seu perfil."',
            progresso: '"Continue assim! Você está no caminho certo."',
            conclusao: '"Excelente! Agora você sabe quem é. Seu primeiro passo como aventureiro."',
            recompensa: '"Aqui está sua recompensa. Continue treinando!"'
        },
        recompensas: {
            xp: 10,
            ouro: 0,
            item: null,
            titulo: null,
            conquista: 'primeiro_passo'
        }
    },

    'treinamento_basico': {
        id: 'treinamento_basico',
        nome: '📜 Treinamento básico',
        descricao: 'Treine com Arven para melhorar suas habilidades.',
        npc: 'mestre_arven',
        nivel_necessario: 1,
        objetivos: [
            {
                tipo: 'treinar',
                alvo: '*',
                descricao: 'Treine 1 vez com Arven',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Para sobreviver, você precisa treinar. Mostre do que é capaz."',
            progresso: '"Continue treinando. A disciplina é o que separa os vivos dos mortos."',
            conclusao: '"Bom trabalho! Você está no caminho certo para se tornar um aventureiro."',
            recompensa: '"Você merece isso. Continue assim!"'
        },
        recompensas: {
            xp: 20,
            ouro: 0,
            item: 'pocao_vida',
            titulo: null,
            conquista: 'aprendiz_de_arven'
        }
    },

    'primeiro_treino': {
        id: 'primeiro_treino',
        nome: '📜 Primeiro treino',
        descricao: 'Treine 3 vezes com Arven para fortalecer seu corpo e mente.',
        npc: 'mestre_arven',
        nivel_necessario: 2,
        objetivos: [
            {
                tipo: 'treinar',
                alvo: '*',
                descricao: 'Treine 3 vezes com Arven',
                quantidade: 3
            }
        ],
        dialogos: {
            inicio: '"Treinar uma vez não é suficiente. Você precisa de disciplina. Treine 3 vezes."',
            progresso: '"Continue! A dor de hoje é a força de amanhã."',
            conclusao: '"Você está mais forte. Sinto isso em você."',
            recompensa: '"Sua dedicação merece reconhecimento."'
        },
        recompensas: {
            xp: 30,
            ouro: 10,
            item: 'espada_madeira',
            titulo: null,
            conquista: 'disciplina_em_dia'
        }
    },

    'coletor_de_recursos': {
        id: 'coletor_de_recursos',
        nome: '📜 Coletor de recursos',
        descricao: 'Colete recursos na floresta para aprender a sobreviver.',
        npc: 'mestre_arven',
        nivel_necessario: 1,
        objetivos: [
            {
                tipo: 'coletar',
                alvo: 'madeira',
                descricao: 'Colete 5 madeiras',
                quantidade: 5
            },
            {
                tipo: 'coletar',
                alvo: 'erva',
                descricao: 'Colete 3 ervas',
                quantidade: 3
            }
        ],
        dialogos: {
            inicio: '"Um aventureiro sem recursos é um aventureiro morto. Colete madeira e ervas."',
            progresso: '"Continue coletando. Cada recurso é uma ferramenta."',
            conclusao: '"Agora você tem o básico para sobreviver."',
            recompensa: '"Use esses recursos com sabedoria."'
        },
        recompensas: {
            xp: 15,
            ouro: 5,
            item: null,
            titulo: null,
            conquista: 'coletor_iniciante'
        }
    },

    'primeiro_craft': {
        id: 'primeiro_craft',
        nome: '📜 Primeiro craft',
        descricao: 'Crafte sua primeira ferramenta: uma picareta de madeira.',
        npc: 'mestre_arven',
        nivel_necessario: 2,
        objetivos: [
            {
                tipo: 'craftar',
                alvo: 'picareta_madeira',
                descricao: 'Crafte uma Picareta de Madeira',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Uma ferramenta pode mudar tudo. Crafte sua primeira picareta."',
            progresso: '"Continue! A madeira está esperando por você."',
            conclusao: '"Excelente! Agora você tem uma ferramenta que pode usar."',
            recompensa: '"Essa picareta vai te levar longe."'
        },
        recompensas: {
            xp: 25,
            ouro: 0,
            item: null,
            titulo: null,
            conquista: 'artesao_iniciante'
        }
    },

    'primeiro_equipamento': {
        id: 'primeiro_equipamento',
        nome: '📜 Primeiro equipamento',
        descricao: 'Equipe sua picareta de madeira e aprenda a usar ferramentas.',
        npc: 'mestre_arven',
        nivel_necessario: 2,
        objetivos: [
            {
                tipo: 'equipar',
                alvo: 'picareta_madeira',
                descricao: 'Equipe a Picareta de Madeira na mão direita',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Uma ferramenta só é útil se você souber usá-la. Equipe sua picareta."',
            progresso: '"Continue! Você está aprendendo rápido."',
            conclusao: '"Agora você está pronto para minerar!"',
            recompensa: '"Use sua picareta para coletar pedras preciosas."'
        },
        recompensas: {
            xp: 15,
            ouro: 0,
            item: null,
            titulo: null,
            conquista: 'equipado'
        }
    },

    'explorador_de_eldoria': {
        id: 'explorador_de_eldoria',
        nome: '📜 Explorador de Eldoria',
        descricao: 'Explore diferentes áreas da Floresta de Eldoria.',
        npc: 'mestre_arven',
        nivel_necessario: 2,
        objetivos: [
            {
                tipo: 'explorar',
                alvo: 'trilha_cacadores',
                descricao: 'Explore a Trilha dos Caçadores',
                quantidade: 1
            },
            {
                tipo: 'explorar',
                alvo: 'torre_cacador',
                descricao: 'Explore a Torre do Caçador',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Eldoria é vasta. Explore-a para entender seus segredos."',
            progresso: '"Continue explorando. Cada área tem algo a ensinar."',
            conclusao: '"Agora você conhece mais da floresta do que a maioria."',
            recompensa: '"O conhecimento da terra é o maior tesouro."'
        },
        recompensas: {
            xp: 30,
            ouro: 15,
            item: null,
            titulo: '🌲 Explorador de Eldoria',
            conquista: 'explorador_nato'
        }
    },

    'proteja_a_floresta': {
        id: 'proteja_a_floresta',
        nome: '📜 Proteja a floresta',
        descricao: 'Derrote os goblins que estão ameaçando Eldoria.',
        npc: 'mestre_arven',
        nivel_necessario: 3,
        objetivos: [
            {
                tipo: 'matar',
                alvo: 'goblin_batedor',
                descricao: 'Derrote 3 goblins batedores',
                quantidade: 3
            },
            {
                tipo: 'matar',
                alvo: 'trepadeira_sombria',
                descricao: 'Derrote 2 trepadeiras sombrias',
                quantidade: 2
            }
        ],
        dialogos: {
            inicio: '"Os goblins estão se espalhando. Precisamos agir."',
            progresso: '"Continue lutando. A floresta precisa de você."',
            conclusao: '"Você fez o que muitos não conseguiram. Eldoria está mais segura."',
            recompensa: '"Você é um verdadeiro guardião da floresta."'
        },
        recompensas: {
            xp: 50,
            ouro: 30,
            item: 'espada_ferro',
            titulo: '🌱 Defensor de Eldoria',
            conquista: 'protetor_da_floresta'
        }
    },

    'o_guardião_verde': {
        id: 'o_guardião_verde',
        nome: '📜 O Guardião Verde',
        descricao: 'Enfrente Tharion, o Guardião Verde, e recupere o Fragmento de Eldoria.',
        npc: 'mestre_arven',
        nivel_necessario: 5,
        objetivos: [
            {
                tipo: 'matar',
                alvo: 'tharion_guardiao_verde',
                descricao: 'Derrote Tharion, o Guardião Verde',
                quantidade: 1
            }
        ],
        dialogos: {
            inicio: '"Tharion foi um herói. Agora ele está corrompido. Liberte-o."',
            progresso: '"Continue lutando. Ele merece descanso."',
            conclusao: '"Você fez o impossível. Tharion encontrou paz."',
            recompensa: '"O Fragmento de Eldoria agora está em boas mãos."'
        },
        recompensas: {
            xp: 100,
            ouro: 100,
            item: 'fragmento_eldoria',
            titulo: '🌳 Guardião de Eldoria',
            conquista: 'a_queda_do_guardião'
        }
    }
};

module.exports = MISSOES;
