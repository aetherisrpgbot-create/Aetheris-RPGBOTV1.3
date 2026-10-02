// core/npc_system.js - SISTEMA DE NPCs (COM ROTEIRO DO ARVEN)

const { Jogador } = require('../servicos/jogador');
const { buscarNPC, getNPC } = require('../dados/npcs');
const { gerarResposta } = require('../servicos/ia');
const MISSOES = require('../dados/missoes');
const ITENS_BASE = require('../dados/itens_base');
const { 
    gerarMensagemOferta,
    gerarMensagemAndamento,
    gerarMensagemConclusao,
    gerarMensagemSemMissoes,
    gerarMensagemErro
} = require('./mensagens');

// ============================================================
// 🔹 CLASSE NPC_SYSTEM
// ============================================================

class NPCSystem {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.jogador = null;
        this.npc = null;
        this.missoesCache = null; // Cache para evitar chamadas duplicadas
    }

    async carregar() {
        this.jogador = new Jogador(this.usuarioId);
        await this.jogador.carregar();
        this.missoesCache = null; // Limpa cache ao recarregar
        return this;
    }

    // ============================================================
    // 🔹 DEFINIR NPC
    // ============================================================

    setNPC(nome) {
        const npc = buscarNPC(nome);
        if (!npc) {
            return { error: `❌ NPC "${nome}" não encontrado!` };
        }
        this.npc = npc;
        return { success: true };
    }

    // ============================================================
    // 🔹 OBTER MISSÕES DO JOGADOR (COM CACHE)
    // ============================================================

    async getMissoesJogador() {
        if (this.missoesCache) return this.missoesCache;
        this.missoesCache = await this.jogador.listarMissoes();
        return this.missoesCache;
    }

    // ============================================================
    // 🔹 FALAR COM NPC
    // ============================================================

    async falar(nome, mensagem = '') {
        const resultado = this.setNPC(nome);
        if (resultado.error) return resultado;

        const npc = this.npc;

        // 🔥 VERIFICA MISSÕES CONCLUÍDAS (USANDO CACHE)
        const missaoConcluida = await this.verificarMissoesConcluidas();
        if (missaoConcluida) {
            return missaoConcluida;
        }

        // 🔥 VERIFICA CONQUISTAS
        const conquistaDesbloqueada = await this.verificarConquistas();
        if (conquistaDesbloqueada) {
            return conquistaDesbloqueada;
        }

        if (!mensagem || mensagem.trim() === '') {
            return this.getInfo(npc);
        }

        const acao = mensagem.toLowerCase().trim();
        
        // ============================================================
        // 🔹 AÇÕES ESPECIAIS
        // ============================================================
        
        if (acao === 'treinar' && npc.id === 'mestre_arven') {
            return this.treinar();
        }
        
        if (acao === 'missao' || acao === 'missoes' || acao === 'missões') {
            return this.missao();
        }
        
        if (acao === 'ensinar' || acao === 'sobre' || acao === 'historia') {
            return this.ensinar();
        }
        
        if (acao === 'curar' && npc.id === 'elya_curandeira') {
            return this.curar();
        }
        
        if (acao === 'trabalhar' && npc.id === 'kael_fracassado') {
            return this.trabalhar();
        }
        
        if (acao === 'comprar' && npc.id === 'mira_mercadora') {
            return this.comprar();
        }
        
        if (acao === 'vender' && npc.id === 'mira_mercadora') {
            return this.vender();
        }
        
        if (acao === 'investigar' && npc.id === 'ronan_cacador') {
            return this.investigar();
        }

        // 🔥 CONVERSA COM IA (se não for ação especial)
        return this.conversarIA(mensagem);
    }

    // ============================================================
    // 🔹 VERIFICAR MISSÕES CONCLUÍDAS (COM CACHE)
    // ============================================================

    async verificarMissoesConcluidas() {
        const missoesJogador = await this.getMissoesJogador();
        const emAndamento = missoesJogador.filter(m => m.status === 'em_andamento');
        
        for (const m of emAndamento) {
            const missao = MISSOES[m.missao_id];
            if (!missao) continue;
            
            const total = missao.objetivos?.length || 1;
            
            if (m.progresso >= total) {
                // Conclui a missão
                await this.jogador.concluirMissao(m.missao_id);
                
                // Aplica recompensas
                if (missao.recompensas.xp) {
                    await this.jogador.adicionarXp(missao.recompensas.xp);
                }
                if (missao.recompensas.ouro) {
                    await this.jogador.adicionarOuro(missao.recompensas.ouro);
                }
                if (missao.recompensas.item) {
                    try {
                        await this.jogador.adicionarItem(missao.recompensas.item, 1);
                    } catch (e) {}
                }
                await this.jogador.salvar();

                // Limpa cache pois mudou
                this.missoesCache = null;

                const npc = getNPC(missao.npc) || this.npc;
                const nomeNPC = npc?.nome_completo || 'O NPC';
                const dialogos = missao.dialogos || {};
                
                // Tenta gerar resposta com IA
                let respostaIA = null;
                try {
                    const prompt = `O aventureiro acabou de completar a missão "${missao.nome}". 
O objetivo era: ${missao.descricao}
As recompensas foram: ${missao.recompensas.xp ? `+${missao.recompensas.xp} XP` : ''} ${missao.recompensas.ouro ? `+${missao.recompensas.ouro} Ouro` : ''} ${missao.recompensas.item ? `+${ITENS_BASE[missao.recompensas.item]?.nome || missao.recompensas.item}` : ''}

Você é ${nomeNPC}, um personagem do RPG. 
Parabenize o aventureiro pela conquista de forma imersiva e encorajadora, como seu personagem falaria.
Seja breve (máximo 2 frases).`;
                    
                    const resposta = await gerarResposta(
                        'mestre',
                        prompt,
                        this.jogador.dados.nome || 'Aventureiro',
                        this.usuarioId
                    );
                    if (resposta && !resposta.includes('silêncio')) {
                        respostaIA = resposta;
                    }
                } catch (err) {
                    console.error('Erro ao gerar IA para conclusão:', err);
                }

                const mensagemIA = respostaIA || dialogos.conclusao || '"Excelente trabalho!"';
                
                return {
                    success: true,
                    texto: `🎉 *MISSÃO CONCLUÍDA!*\n\n📌 ${missao.nome}\n\n👤 ${nomeNPC}:\n${mensagemIA}\n\n📦 *Recompensas:*\n${missao.recompensas.xp ? `   ⭐ +${missao.recompensas.xp} XP\n` : ''}${missao.recompensas.ouro ? `   💰 +${missao.recompensas.ouro} Ouro\n` : ''}${missao.recompensas.item ? `   📦 ${ITENS_BASE[missao.recompensas.item]?.nome || missao.recompensas.item}\n` : ''}`
                };
            }
        }
        
        return null;
    }

    // ============================================================
    // 🔹 VERIFICAR CONQUISTAS
    // ============================================================

async verificarConquistas() {
    // 🔥 VERIFICA SE JÁ FOI DESBLOQUEADA
    try {
        const jaDesbloqueada = await this.jogador.verificarConquista('primeiro_passo');
        console.log(`🔍 Conquista "primeiro_passo" já desbloqueada? ${jaDesbloqueada}`);
        
        if (jaDesbloqueada) {
            console.log('✅ Conquista "primeiro_passo" já desbloqueada, ignorando...');
            return null;
        }
    } catch (err) {
        console.error('Erro ao verificar conquista:', err);
        return null;
    }

    // 🔥 SÓ CONTINUA SE NÃO TIVER SIDO DESBLOQUEADA
    const missoesJogador = await this.getMissoesJogador();
    const concluidas = missoesJogador.filter(m => m.status === 'concluida');
    
    const temPrimeiraMissao = concluidas.some(m => m.missao_id === 'conheca_voce_mesmo');
    
    if (temPrimeiraMissao) {
        try {
            await this.jogador.desbloquearConquista('primeiro_passo');
            
            let respostaIA = null;
            try {
                const prompt = `O aventureiro acaba de completar sua primeira missão: "Conheça a si mesmo".
Ele deu o primeiro passo como um verdadeiro aventureiro da Ordem do RPGBOT.

Você é ${this.npc?.nome_completo || 'Mestre Arven'}, um personagem sábio do RPG.
Parabenize o aventureiro por esta conquista especial de forma imersiva, como seu personagem falaria.
Seja breve (máximo 2 frases).`;
                
                const resposta = await gerarResposta(
                    'mestre',
                    prompt,
                    this.jogador.dados.nome || 'Aventureiro',
                    this.usuarioId
                );
                if (resposta && !resposta.includes('silêncio')) {
                    respostaIA = resposta;
                }
            } catch (err) {
                console.error('Erro ao gerar IA para conquista:', err);
            }

            const mensagemIA = respostaIA || '"O primeiro passo é sempre o mais importante. Continue assim!"';
            const nomeNPC = this.npc?.nome_completo || '🧓 Mestre Arven';
            
            await this.jogador.adicionarXp(20);
            await this.jogador.salvar();
            
            return {
                success: true,
                texto: `🏆 *CONQUISTA DESBLOQUEADA!*\n\n🌟 Primeiro Passo\n\n👤 ${nomeNPC}:\n${mensagemIA}\n\n⭐ +20 XP`
            };
        } catch (err) {
            console.error('Erro ao desbloquear conquista:', err);
            return null;
        }
    }
    
    return null;
}
        


    // ============================================================
    // 🔹 GET INFO DO NPC (COM ROTEIRO)
    // ============================================================

    getInfo(npc) {
        let texto = `${npc.nome_completo}\n`;
        texto += `📝 ${npc.titulo}\n`;
        texto += `📍 ${npc.local}\n\n`;
        texto += `📖 *Mini Lore:*\n${npc.lore}\n\n`;
        texto += `📌 *Funções:*\n`;
        for (const func of npc.funcoes || []) {
            texto += `   • ${func.nome} - ${func.descricao}\n`;
        }
        texto += `\n💬 *Para falar:* !falar com ${npc.nome} <mensagem>`;
        texto += `\n💬 Exemplo: !falar com ${npc.nome} Olá!`;
        return { success: true, texto };
    }

    // ============================================================
    // 🔹 CONVERSAR COM IA
    // ============================================================

    async conversarIA(mensagem) {
        const npc = this.npc;
        const nomeUsuario = this.jogador.dados.nome || 'Aventureiro';

        // 🔥 VERIFICA SE O NPC TEM ROTEIRO PRÉ-PROGRAMADO
        const roteiro = npc.roteiro || {};
        
        // Verifica se a mensagem corresponde a uma seção do roteiro
        const palavrasChave = {
            'perfil': 'licao_perfil',
            'ouro': 'licao_ouro',
            'dinheiro': 'licao_ouro',
            'floresta': 'licao_floresta',
            'eldoria': 'licao_eldoria',
            'combate': 'licao_combate',
            'luta': 'licao_combate',
            'explorar': 'licao_exploracao',
            'exploração': 'licao_exploracao',
            'stamina': 'licao_stamina',
            'descansar': 'licao_descanso',
            'missão': 'licao_missoes',
            'missoes': 'licao_missoes',
            'tharion': 'historia_simbolo',
            'símbolo': 'historia_simbolo',
            'fragmento': 'historia_simbolo',
            'guardião': 'aviso',
            'conselho': 'ultimo_conselho',
            'mapa': 'mapa',
            'arkhen': 'mapa'
        };

        const mensagemLower = mensagem.toLowerCase();
        let secaoEncontrada = null;
        
        for (const [palavra, secao] of Object.entries(palavrasChave)) {
            if (mensagemLower.includes(palavra)) {
                secaoEncontrada = secao;
                break;
            }
        }

        // Se encontrou uma seção do roteiro, usa ela
        if (secaoEncontrada && roteiro[secaoEncontrada]) {
            const falas = roteiro[secaoEncontrada];
            const fala = Array.isArray(falas) ? falas.join('\n') : falas;
            return {
                success: true,
                texto: `${npc.nome_completo}\n\n${fala}`
            };
        }

        // Se não, usa IA
        try {
            const resposta = await gerarResposta(
                'mestre',
                mensagem,
                nomeUsuario,
                this.usuarioId
            );
            return { 
                success: true, 
                texto: `${npc.nome_completo}\n\n${resposta}`
            };
        } catch (err) {
            const dialogos = npc.dialogos || {};
            const respostas = [
                dialogos.saudacao || '...',
                dialogos.despedida || '...'
            ];
            const resposta = respostas[Math.floor(Math.random() * respostas.length)];
            return { 
                success: true, 
                texto: `${npc.nome_completo}\n\n${resposta}`
            };
        }
    }

    // ============================================================
    // 🔹 TREINAR (ARVEN)
    // ============================================================

    async treinar() {
        if (this.npc.id !== 'mestre_arven') {
            return { error: `❌ ${this.npc.nome_completo} não pode treinar você.` };
        }

        const stamina = this.jogador.dados.stamina || 0;
        if (stamina < 10) {
            return { error: '❌ Você está muito cansado para treinar! Descanse com !descansar.' };
        }

        const xpGanho = 15 + Math.floor(Math.random() * 10);
        await this.jogador.adicionarXp(xpGanho);
        this.jogador.dados.stamina = Math.max(0, stamina - 10);
        await this.jogador.salvar();

        const dialogo = this.npc.dialogos?.treino || '"Treine todos os dias."';

        return {
            success: true,
            texto: `⚔️ *TREINO COM ${this.npc.nome_completo}*\n\n${dialogo}\n\n✅ +${xpGanho} XP\n⚡ Stamina: ${this.jogador.dados.stamina}/${this.jogador.dados.stamina_max}`
        };
    }

    // ============================================================
    // 🔹 MISSÃO (COM CACHE)
    // ============================================================

    async missao() {
        const npc = this.npc;
        const missoesNPC = npc.missoes || [];
        
        if (missoesNPC.length === 0) {
            return {
                success: true,
                texto: `📜 *${npc.nome_completo}*\n\n"Não tenho missões para você no momento."`
            };
        }

        // 🔥 USA CACHE
        const missoesJogador = await this.getMissoesJogador();
        const missoesConcluidas = missoesJogador.filter(m => m.status === 'concluida').map(m => m.missao_id);
        const missoesEmAndamento = missoesJogador.filter(m => m.status === 'em_andamento');

        // 🔥 VERIFICA SE TEM MISSÃO EM ANDAMENTO QUE JÁ FOI CONCLUÍDA
        for (const m of missoesEmAndamento) {
            const missao = MISSOES[m.missao_id];
            if (!missao) continue;
            
            const total = missao.objetivos?.length || 1;
            if (m.progresso >= total) {
                await this.jogador.concluirMissao(m.missao_id);
                
                if (missao.recompensas.xp) {
                    await this.jogador.adicionarXp(missao.recompensas.xp);
                }
                if (missao.recompensas.ouro) {
                    await this.jogador.adicionarOuro(missao.recompensas.ouro);
                }
                if (missao.recompensas.item) {
                    try {
                        await this.jogador.adicionarItem(missao.recompensas.item, 1);
                    } catch (e) {}
                }
                await this.jogador.salvar();
                
                // Limpa cache
                this.missoesCache = null;
                
                const dialogos = missao.dialogos || {};
                const mensagem = gerarMensagemConclusao(missao);
                return {
                    success: true,
                    texto: mensagem
                };
            }
        }

        // 🔥 FILTRA MISSÕES DISPONÍVEIS
        const missoesDisponiveis = [];
        
        for (const missaoData of missoesNPC) {
            const missaoId = typeof missaoData === 'string' ? missaoData : missaoData.id;
            
            if (missoesConcluidas.includes(missaoId)) continue;
            if (missoesEmAndamento.some(m => m.missao_id === missaoId)) continue;
            
            const missaoCompleta = MISSOES[missaoId];
            if (!missaoCompleta) continue;
            if (this.jogador.dados.nivel < missaoCompleta.nivel_necessario) continue;
            
            missoesDisponiveis.push(missaoCompleta);
        }

        if (missoesDisponiveis.length > 0) {
            const missao = missoesDisponiveis[0];
            await this.jogador.aceitarMissao(missao.id);
            
            // Limpa cache pois mudou
            this.missoesCache = null;
            
            const texto = gerarMensagemOferta(missao);
            return { success: true, texto };
        }

        if (missoesEmAndamento.length > 0) {
            const m = missoesEmAndamento[0];
            const missao = MISSOES[m.missao_id];
            if (missao) {
                const texto = gerarMensagemAndamento(missao, m.progresso);
                return { success: true, texto };
            }
        }

        const texto = gerarMensagemSemMissoes(npc.nome_completo);
        return { success: true, texto };
    }

    // ============================================================
    // 🔹 ENSINAR (ARVEN) - COM ROTEIRO
    // ============================================================

    async ensinar() {
        if (this.npc.id !== 'mestre_arven') {
            return { error: `❌ ${this.npc.nome_completo} não pode ensinar você.` };
        }

        const roteiro = this.npc.roteiro || {};
        const assuntos = [
            { nome: 'Ordem do RPGBOT', fala: roteiro.licao_perfil || 'A Ordem foi fundada para proteger Aetheris.' },
            { nome: 'Eldoria', fala: roteiro.licao_eldoria || 'Eldoria é uma floresta antiga e cheia de mistérios.' },
            { nome: 'Fragmentos', fala: roteiro.historia_simbolo || 'Os Fragmentos do Coração são a chave para tudo.' },
            { nome: 'Tharion', fala: roteiro.aviso || 'Tharion era um herói, agora é um guardião corrompido.' },
            { nome: 'Sobrevivência', fala: roteiro.ultimo_conselho || 'Sobreviver é mais importante que vencer.' }
        ];
        
        const assunto = assuntos[Math.floor(Math.random() * assuntos.length)];
        const fala = Array.isArray(assunto.fala) ? assunto.fala.join('\n') : assunto.fala;

        return {
            success: true,
            texto: `📖 *${this.npc.nome_completo} ensina sobre ${assunto.nome}:*\n\n${fala}`
        };
    }

    // ============================================================
    // 🔹 TRABALHAR (KAEL)
    // ============================================================

    async trabalhar() {
        if (this.npc.id !== 'kael_fracassado') {
            return { error: `❌ ${this.npc.nome_completo} não pode te dar trabalho.` };
        }

        const stamina = this.jogador.dados.stamina || 0;
        if (stamina < 10) {
            return { error: '❌ Você está muito cansado para trabalhar! Descanse com !descansar.' };
        }

        const ouroGanho = 15 + Math.floor(Math.random() * 15);
        const xpGanho = 3 + Math.floor(Math.random() * 4);
        
        await this.jogador.adicionarOuro(ouroGanho);
        await this.jogador.adicionarXp(xpGanho);
        this.jogador.dados.stamina = Math.max(0, stamina - 10);
        await this.jogador.salvar();

        const dialogo = this.npc.dialogos?.trabalho || '"Trabalho duro paga as contas."';

        return {
            success: true,
            texto: `💼 *TRABALHO COM ${this.npc.nome_completo}*\n\n${dialogo}\n\n💰 +${ouroGanho} Ouro\n⭐ +${xpGanho} XP\n⚡ Stamina: ${this.jogador.dados.stamina}/${this.jogador.dados.stamina_max}`
        };
    }

    // ============================================================
    // 🔹 CURAR (ELYA)
    // ============================================================

    async curar() {
        if (this.npc.id !== 'elya_curandeira') {
            return { error: `❌ ${this.npc.nome_completo} não pode curar você.` };
        }

        const vidaMax = this.jogador.dados.vida_max || 100;
        this.jogador.dados.vida = vidaMax;
        await this.jogador.salvar();

        const dialogo = this.npc.dialogos?.cura || '"Deixe a natureza cuidar de você."';

        return {
            success: true,
            texto: `💚 *CURA COM ${this.npc.nome_completo}*\n\n${dialogo}\n\n✅ Vida restaurada: ${this.jogador.dados.vida}/${vidaMax}`
        };
    }

    // ============================================================
    // 🔹 COMPRAR (MIRA)
    // ============================================================

    async comprar() {
        if (this.npc.id !== 'mira_mercadora') {
            return { error: `❌ ${this.npc.nome_completo} não vende itens.` };
        }

        const itens = this.npc.itens_venda || [];
        let texto = `🛒 *${this.npc.nome_completo} - ITENS À VENDA*\n\n`;
        for (const item of itens) {
            const info = ITENS_BASE[item.id];
            const nome = info?.nome || item.nome;
            texto += `   • ${nome} - ${item.preco} ouro\n`;
            texto += `     🆔 !comprar ${item.id}\n`;
        }
        texto += `\n💬 Para comprar: !comprar <id>`;

        return { success: true, texto };
    }

    // ============================================================
    // 🔹 VENDER (MIRA)
    // ============================================================

    async vender() {
        return {
            success: true,
            texto: `💰 *${this.npc.nome_completo}*\n\n"Me mostre o que você tem para vender."\n\n📌 Em breve: sistema de venda!`
        };
    }

    // ============================================================
    // 🔹 INVESTIGAR (RONAN)
    // ============================================================

    async investigar() {
        if (this.npc.id !== 'ronan_cacador') {
            return { error: `❌ ${this.npc.nome_completo} não tem nada para investigar.` };
        }

        const pistas = [
            '🔍 Você encontrou uma flecha quebrada perto da aldeia abandonada.',
            '🔍 Há pegadas de goblins na direção do bosque antigo.',
            '🔍 Um pedaço de tecido rasgado está preso em um galho.'
        ];
        
        const pista = pistas[Math.floor(Math.random() * pistas.length)];

        const dialogo = this.npc.dialogos?.investigar || '"Encontrei algumas pistas..."';

        return {
            success: true,
            texto: `🔍 *INVESTIGAÇÃO COM ${this.npc.nome_completo}*\n\n${dialogo}\n\n${pista}`
        };
    }
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = { NPCSystem };
