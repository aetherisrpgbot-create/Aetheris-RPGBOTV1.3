// ============================================================
// ⚔️ AETHERIS — LORE OFICIAL DO RPGBOT (v1.1)
// ============================================================

const AETHERIS = {
    titulo: "O Enigma de Aetheris",
    versao: "1.1",
    
    // ============================================================
    // 🌍 O MUNDO
    // ============================================================
    mundo: {
        nome_original: "Terra de Trinitas",
        nome_atual: "Terras Divididas",
        descricao: "Há eras, quando os deuses ainda caminhavam entre os mortais, a Terra de Trinitas era uma só. Mas o tempo passou, os deuses desapareceram e o mundo acabou dividido em três grandes territórios.",
        
        regioes: [
            {
                id: "teviribo",
                nome: "Terras Verdes de Teviribo",
                direcao: "Norte",
                emoji: "🟢",
                descricao: "Vastas terras verdes. Em meio às florestas, os Stuntis ergueram uma poderosa fortaleza, onde passaram a guardar um antigo relicário conhecido como Artefato Perdido — uma relíquia ancestral capaz de alterar o destino das terras.",
                faccao: "Stuntis",
                artefato: "Artefato Perdido",
                perigo: "Criaturas corrompidas das sombras das florestas",
                evento: "Surgimento da Runa Oculta"
            },
            {
                id: "moglaori",
                nome: "Montes de Gelo de Moglaori",
                direcao: "Leste",
                emoji: "🔵",
                descricao: "Além das montanhas, sob camadas de gelo eterno, repousava o Coração Congelado, uma força adormecida cuja existência deveria permanecer esquecida.",
                faccao: "Guardiões do Gelo",
                artefato: "Coração Congelado",
                perigo: "Lago Congelado Prisional com espíritos e memórias dos deuses",
                evento: "Mapas proibidos descobertos"
            },
            {
                id: "domignia",
                nome: "Domínios de Fogo de Domignia",
                direcao: "Sul",
                emoji: "🔴",
                descricao: "Terras moldadas por chamas eternas, onde dragões e guerreiros conviviam entre cinzas e fogo. Ali, forças desconhecidas começavam a se mover nas sombras, buscando poder suficiente para dominar o mundo.",
                faccao: "Orcs de Dominus Magnus",
                artefato: "Altar Proibido",
                perigo: "Servos do dragão e o Labirinto de Cinzas",
                evento: "Altar Proibido violado"
            }
        ]
    },
    
    // ============================================================
    // 📖 CAPÍTULOS (v1.1)
    // ============================================================
    capitulos: [
        {
            numero: 1,
            titulo: "A Terra de Trinitas",
            texto: "Há eras, quando os deuses ainda caminhavam entre os mortais, a Terra de Trinitas era uma só."
        },
        {
            numero: 2,
            titulo: "A Divisão",
            texto: "Mas o tempo passou, os deuses desapareceram e o mundo acabou dividido em três grandes territórios."
        },
        {
            numero: 3,
            titulo: "As Terras Verdes",
            texto: "Ao norte, encontravam-se as vastas Terras Verdes de Teviribo. Em meio às florestas, os Stuntis ergueram uma poderosa fortaleza, onde passaram a guardar um antigo relicário conhecido como Artefato Perdido — uma relíquia ancestral capaz de alterar o destino das terras."
        },
        {
            numero: 4,
            titulo: "Os Montes de Gelo",
            texto: "A leste, além das montanhas, estendiam-se os Montes de Gelo de Moglaori. Sob camadas de gelo eterno repousava o Coração Congelado, uma força adormecida cuja existência deveria permanecer esquecida."
        },
        {
            numero: 5,
            titulo: "Os Domínios de Fogo",
            texto: "Ao sul estavam os ardentes Domínios de Fogo de Domignia, terras moldadas por chamas eternas, onde dragões e guerreiros conviviam entre cinzas e fogo. Ali, forças desconhecidas começavam a se mover nas sombras, buscando poder suficiente para dominar o mundo."
        },
        {
            numero: 6,
            titulo: "O Equilíbrio",
            texto: "Durante séculos, os três territórios permaneceram em equilíbrio. Até que o silêncio dos deuses começou a mudar."
        },
        {
            numero: 7,
            titulo: "A Runa Oculta",
            texto: "Na Fortaleza dos Stuntis, surgiu a Runa Oculta. A princípio, parecia apenas um símbolo antigo. Porém, os registros revelaram uma verdade muito mais perigosa: a runa era uma chave capaz de abrir portais entre os três territórios."
        },
        {
            numero: 8,
            titulo: "O Lago Congelado",
            texto: "Em Moglaori, outro segredo permanecia escondido. Nas profundezas dos Montes de Gelo, o Lago Congelado Prisional guardava espíritos aprisionados e fragmentos da memória dos próprios deuses."
        },
        {
            numero: 9,
            titulo: "O Altar Proibido",
            texto: "Enquanto esses mistérios permaneciam ocultos, algo ainda mais grave acontecia em Domignia. O Altar Proibido havia sido violado. Forças que deveriam permanecer seladas foram libertadas."
        },
        {
            numero: 10,
            titulo: "A Desconfiança",
            texto: "A partir daquele momento, a desconfiança começou a se espalhar pela Terra de Trinitas. Os Stuntis se dividiram entre aqueles que desejavam proteger o Artefato Perdido e aqueles que acreditavam que ele deveria ser destruído."
        },
        {
            numero: 11,
            titulo: "A Anciã Cassia Lisandra",
            texto: "Nas montanhas de Moglaori, a Anciã Cassia Lisandra guardava conhecimentos que poderiam significar a salvação — ou a condenação — de todos."
        },
        {
            numero: 12,
            titulo: "O Caçador Octavius",
            texto: "Ao mesmo tempo, o caçador Octavius Alexios encontrou mapas proibidos que revelavam passagens ocultas através das montanhas."
        },
        {
            numero: 13,
            titulo: "O Xamã Sombrio",
            texto: "Em Domignia, o Xamã Ignatius Flavianus realizava rituais sombrios, buscando utilizar o poder do dragão contra os próprios deuses."
        },
        {
            numero: 14,
            titulo: "As Hordas de Orcs",
            texto: "Enquanto isso, hordas de orcs avançavam sob a bandeira de Dominus Magnus."
        },
        {
            numero: 15,
            titulo: "Gregorius Tiberius",
            texto: "Em meio a tudo aquilo, um nome começava a ganhar importância. Gregorius Tiberius. Conhecido simplesmente como Tibério, sua presença começava a se tornar cada vez mais relevante diante dos conflitos que se espalhavam por Teviribo."
        },
        {
            numero: 16,
            titulo: "As Armas Lendárias",
            texto: "Enquanto os três territórios mergulhavam cada vez mais na desconfiança, antigas armas começaram a reaparecer. O Machado dos Stuntis. O Arco de Gelo. E a temida Glad Runa, a Espada da Ruína."
        },
        {
            numero: 17,
            titulo: "Símbolos de Esperança",
            texto: "Para alguns, essas armas eram símbolos de esperança. Para outros, eram apenas sinais de que algo muito maior estava despertando."
        },
        {
            numero: 18,
            titulo: "Os Perigos",
            texto: "Aqueles que buscavam seus poderes logo descobriam que cada passo em direção a esses tesouros trazia perigos ainda maiores. Tempestades mágicas começaram a atravessar os territórios. Servos do dragão surgiram das terras de fogo. E o Labirinto de Cinzas passou a engolir aqueles que ousavam desafiar seus caminhos."
        },
        {
            numero: 19,
            titulo: "Os Registros",
            texto: "Foi então que antigos registros vieram à tona. Registros que revelavam que nenhum daqueles acontecimentos era isolado. A Runa Oculta. O Coração Congelado. O Altar Proibido. Todos faziam parte de uma mesma profecia."
        },
        {
            numero: 20,
            titulo: "A Profecia",
            texto: "Uma profecia ligada a um nome que havia sido esquecido pelas gerações: AETHERIS."
        },
        {
            numero: 21,
            titulo: "O Reino dos Céus",
            texto: "Alguns acreditavam que Aetheris era o Reino dos Céus, o domínio dos antigos deuses. Outros acreditavam que seu verdadeiro significado estava além daquilo que os registros eram capazes de revelar."
        },
        {
            numero: 22,
            titulo: "O Retorno",
            texto: "A profecia falava sobre o retorno dos deuses. Mas ninguém sabia o que aconteceria quando eles voltassem."
        },
        {
            numero: 23,
            titulo: "Salvação ou Fúria",
            texto: "Alguns acreditavam que retornariam para restaurar o equilíbrio perdido. Outros temiam que sua fúria consumisse tudo aquilo que ainda restava da Terra de Trinitas."
        },
        {
            numero: 24,
            titulo: "As Forças Desconhecidas",
            texto: "Agora, os três territórios estão novamente ligados por forças que ninguém compreende completamente. As florestas de Teviribo escondem vozes e criaturas desconhecidas. Os símbolos antigos brilham nas montanhas de Moglaori. E, nas cinzas de Domignia, o dragão desperta."
        },
        {
            numero: 25,
            titulo: "A Verdade Escondida",
            texto: "Os segredos começam a se conectar. Os antigos poderes começam a despertar. E aqueles que ousarem seguir seus caminhos descobrirão que talvez o maior perigo não esteja nos monstros, nas guerras ou nas armas lendárias... Mas na verdade escondida por trás de Aetheris."
        },
        {
            numero: 26,
            titulo: "O Destino",
            texto: "O destino da Terra de Trinitas agora repousa nas mãos daqueles que tiverem coragem de enfrentar seus mistérios. E, diante de tudo isso, uma pergunta permanece: Quem será capaz de decifrar o Enigma de Aetheris antes que o mundo seja engolido pelo caos?"
        }
    ],
    
    // ============================================================
    // 🎭 NPCs PRINCIPAIS
    // ============================================================
npcs: {
        "cassia_lisandra": {
            nome: "Cassia Lisandra",
            titulo: "A Anciã de Moglaori",
            emoji: "🧙‍♀️",
            regiao: "moglaori",
            descricao: "Guarda conhecimentos ancestrais que poderiam significar a salvação — ou a condenação — de todos.",
            papel: "Mentora / Guardiã do conhecimento",
            personalidade: "Sábia, serena, mas com um peso profundo na voz. Fala devagar, como se cada palavra tivesse séculos de idade. Não se irrita facilmente. Faz perguntas antes de responder — gosta de testar a sabedoria dos viajantes. Tem um carinho silencioso pela Terra de Trinitas, mas sabe que o equilíbrio está se rompendo.",
            fala_exemplo: "Ah... mais um viajante. Sente-se, criança. O gelo não é frio para quem carrega fogo no coração. Mas me diga: você veio procurar respostas... ou já as tem?"
        },
        "octavius_alexios": {
            nome: "Octavius Alexios",
            titulo: "O Caçador",
            emoji: "🏹",
            regiao: "moglaori",
            descricao: "Descobriu mapas proibidos que revelam passagens ocultas através das montanhas. Conhece cada trilha, cada caverna, cada segredo escondido sob o gelo.",
            papel: "Explorador / Guia",
            personalidade: "Direto, prático, desconfiado no começo. Fala como alguém acostumado a sobreviver sozinho. Não gosta de conversa fiada. Prefere ações a palavras. Mas se você provar seu valor, ele se torna um aliado leal. Tem um lado sarcástico que aparece quando se sente confortável.",
            fala_exemplo: "Você quer atravessar as montanhas? Ótimo. Só não reclame quando o gelo tentar te matar. Aqui, ou você aprende rápido, ou vira estátua."
        },
        "ignatius_flavianus": {
            nome: "Ignatius Flavianus",
            titulo: "O Xamã Sombrio",
            emoji: "🔮",
            regiao: "domignia",
            descricao: "Realiza rituais sombrios, buscando utilizar o poder do dragão contra os próprios deuses.",
            papel: "Vilão / Antagonista",
            personalidade: "Manipulador, eloquente, convincente. Fala em enigmas, mas de forma que faz sentido. Nunca mente — mas omite. Acredita genuinamente que está certo. Tem um magnetismo perigoso: você quer acreditar nele. Trata os outros com uma cortesia que esconde crueldade.",
            fala_exemplo: "Ah, viajante... você chegou em boa hora. Os deuses nos abandonaram há eras, e agora eu danço com o dragão para trazer justiça. Você me chamaria de vilão? Talvez."
        },
        "gregorius_tiberius": {
            nome: "Gregorius Tiberius",
            titulo: "Tibério",
            emoji: "⚔️",
            regiao: "teviribo",
            descricao: "Sua presença começou a se tornar cada vez mais relevante diante dos conflitos que se espalhavam por Teviribo. Ainda não sabe o papel que carrega, mas o destino tem planos para ele.",
            papel: "Herói / Protagonista",
            personalidade: "Honesto, corajoso, mas inexperiente. Fala com convicção, mas às vezes duvida de si mesmo. Tem um senso de justiça forte, mas não é ingênuo. Está descobrindo seu lugar no mundo. Faz perguntas profundas porque está em conflito interno.",
            fala_exemplo: "Eu... eu sempre acreditei que os Stuntis eram os guardiões. Mas agora vejo irmãos apontando espadas uns para os outros por causa de um artefato. Me diga, viajante: qual é o lado certo, quando ambos os lados têm razão?"
        },
        "dominus_magnus": {
            nome: "Dominus Magnus",
            titulo: "O Senhor dos Orcs",
            emoji: "👹",
            regiao: "domignia",
            descricao: "Líder das hordas de orcs que avançam em Domignia. Acredita que os orcs foram oprimidos por séculos pelos outros povos e que chegou a hora de conquistar a Terra de Trinitas.",
            papel: "Líder militar / Vilão",
            personalidade: "Brutal, direto, sem diplomacia. Fala com a força de quem comanda exércitos. Não tem paciência para sutilezas. Respeita força, despreza fraqueza. Mas tem um código de honra próprio — não mata covardes, não ataca feridos, não mente. Estranhamente honrado para um vilão.",
            fala_exemplo: "Você é pequeno, viajante. Mas seus olhos... seus olhos têm fogo. Talvez você não seja tão fraco assim. Diga o que quer antes que eu decida se você vale a pena ou não."
        }
    },



    // ============================================================
    // ⚔️ ARTEFATOS LENDÁRIOS
    // ============================================================
    artefatos: {
        "machado_stuntis": {
            nome: "Machado dos Stuntis",
            emoji: "🪓",
            regiao: "teviribo",
            descricao: "Arma ancestral dos guardiões do norte."
        },
        "arco_gelo": {
            nome: "Arco de Gelo",
            emoji: "🏹",
            regiao: "moglaori",
            descricao: "Forjado nas montanhas congeladas, dispara flechas de gelo eterno."
        },
        "glad_runa": {
            nome: "Glad Runa",
            titulo: "A Espada da Ruína",
            emoji: "🗡️",
            regiao: "desconhecida",
            descricao: "A temida espada que carrega a ruína em sua lâmina."
        }
    },
    
    // ============================================================
    // 🎯 FACÇÕES
    // ============================================================
    faccoes: {
        "stuntis": {
            nome: "Stuntis",
            emoji: "🛡️",
            regiao: "teviribo",
            descricao: "Povo das Terras Verdes, guardiões do Artefato Perdido.",
            divididos: "Proteger ou destruir o Artefato"
        },
        "guardioes_gelo": {
            nome: "Guardiões do Gelo",
            emoji: "❄️",
            regiao: "moglaori",
            descricao: "Protetores do Coração Congelado nas montanhas."
        },
        "orcs_magnus": {
            nome: "Orcs de Dominus Magnus",
            emoji: "👹",
            regiao: "domignia",
            descricao: "Hordas que marcham sob a bandeira de Dominus Magnus."
        }
    },
    
    // ============================================================
    // 📜 LOCAIS MÍSTICOS
    // ============================================================
    locais: {
        "runa_oculta": {
            nome: "Runa Oculta",
            emoji: "🔮",
            regiao: "teviribo",
            descricao: "Chave capaz de abrir portais entre os três territórios."
        },
        "lago_congelado": {
            nome: "Lago Congelado Prisional",
            emoji: "❄️",
            regiao: "moglaori",
            descricao: "Guarda espíritos aprisionados e fragmentos da memória dos deuses."
        },
        "altar_proibido": {
            nome: "Altar Proibido",
            emoji: "🔥",
            regiao: "domignia",
            descricao: "Foi violado, libertando forças que deveriam permanecer seladas."
        },
        "labirinto_cinzas": {
            nome: "Labirinto de Cinzas",
            emoji: "🌫️",
            regiao: "domignia",
            descricao: "Engole aqueles que ousam desafiar seus caminhos."
        }
    }
};

module.exports = AETHERIS;
