// core/missao_system.js - SISTEMA DE MISSÕES COMPLETO

const { Jogador } = require('../servicos/jogador');
const MISSOES = require('../dados/missoes');
const { getNPC } = require('../dados/npcs');
const ITENS_BASE = require('../dados/itens_base');
const { 
    gerarMensagemProgresso,
    gerarMensagemConclusao,
    gerarMensagemOferta,
    gerarMensagemAndamento
} = require('./mensagens');

// ============================================================
// 🔹 CLASSE MISSAO_SYSTEM
// ============================================================

class MissaoSystem {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.jogador = null;
        this.missoesAtivas = [];
        this.missoesConcluidas = [];
    }

    async carregar() {
        this.jogador = new Jogador(this.usuarioId);
        await this.jogador.carregar();
        
        // Carrega missões do jogador
        const missoes = await this.jogador.listarMissoes();
        
        for (const m of missoes) {
            const missaoData = MISSOES[m.missao_id];
            if (!missaoData) continue;
            
            const missaoCompleta = {
                ...missaoData,
                progresso: m.progresso || 0,
                status: m.status || 'em_andamento',
                id: m.missao_id,
                data_inicio: m.data_inicio,
                data_conclusao: m.data_conclusao
            };
            
            if (m.status === 'concluida') {
                this.missoesConcluidas.push(missaoCompleta);
            } else {
                this.missoesAtivas.push(missaoCompleta);
            }
        }
        
        return this;
    }

    // ============================================================
    // 🔹 PROGRESSO AUTOMÁTICO (COM LOGS)
    // ============================================================

    async registrarProgresso(tipo, alvo, quantidade = 1) {
        console.log(`📝 [MISSÃO] Registrar progresso: ${tipo} | ${alvo}`);
        
        // 🔥 RECARREGA AS MISSÕES ATIVAS DO BANCO
        const missoesJogador = await this.jogador.listarMissoes();
        this.missoesAtivas = [];
        
        for (const m of missoesJogador) {
            if (m.status === 'em_andamento') {
                const missaoData = MISSOES[m.missao_id];
                if (missaoData) {
                    this.missoesAtivas.push({
                        ...missaoData,
                        progresso: m.progresso || 0,
                        status: m.status,
                        id: m.missao_id
                    });
                }
            }
        }
        
        console.log(`📋 [MISSÃO] Missões ativas: ${this.missoesAtivas.length}`);
        
        for (const missao of this.missoesAtivas) {
            if (missao.status === 'concluida') continue;
            
            console.log(`🔍 [MISSÃO] Verificando: ${missao.nome}`);
            
            for (const objetivo of missao.objetivos) {
                // 🔥 COMPARAÇÃO FLEXÍVEL
                const tipoMatch = objetivo.tipo === tipo || 
                                 (objetivo.tipo === 'usar_comando' && tipo === 'comando') ||
                                 (objetivo.tipo === 'comando' && tipo === 'usar_comando');
                
                const alvoMatch = objetivo.alvo === alvo || objetivo.alvo === '*';
                
                console.log(`   🎯 Objetivo: ${objetivo.tipo} == ${tipo} (match: ${tipoMatch}) | ${objetivo.alvo} == ${alvo} (match: ${alvoMatch})`);
                
                if (tipoMatch && alvoMatch) {
                    console.log(`✅ [MISSÃO] Match encontrado!`);
                    
                    const progressoAtual = missao.progresso || 0;
                    const totalObjetivos = missao.objetivos.length;
                    const novoProgresso = Math.min(progressoAtual + 1, totalObjetivos);
                    
                    missao.progresso = novoProgresso;
                    await this.jogador.atualizarProgressoMissao(missao.id, novoProgresso);
                    
                    console.log(`📊 [MISSÃO] Progresso: ${novoProgresso}/${totalObjetivos}`);
                    
                    if (novoProgresso >= totalObjetivos) {
                        console.log(`🎉 [MISSÃO] Missão concluída!`);
                        const resultado = await this.concluirMissao(missao);
                        const mensagem = gerarMensagemConclusao(missao);
                        return { 
                            concluida: true, 
                            missao: missao,
                            mensagem: mensagem
                        };
                    }
                    
                    const mensagem = gerarMensagemProgresso(missao, novoProgresso);
                    return { 
                        progresso: true, 
                        missao: missao,
                        mensagem: mensagem
                    };
                }
            }
        }
        
        console.log(`ℹ️ [MISSÃO] Nenhuma missão atualizada.`);
        return { progresso: false };
    }

    // ============================================================
    // 🔹 CONCLUIR MISSÃO
    // ============================================================

    async concluirMissao(missao) {
        // Marca como concluída no banco
        await this.jogador.concluirMissao(missao.id);
        
        // Aplica recompensas
        const recompensas = missao.recompensas;
        let textoRecompensas = '';
        
        if (recompensas.xp) {
            await this.jogador.adicionarXp(recompensas.xp);
            textoRecompensas += `\n⭐ +${recompensas.xp} XP`;
        }
        
        if (recompensas.ouro) {
            await this.jogador.adicionarOuro(recompensas.ouro);
            textoRecompensas += `\n💰 +${recompensas.ouro} Ouro`;
        }
        
        if (recompensas.item) {
            try {
                await this.jogador.adicionarItem(recompensas.item, 1);
                const info = ITENS_BASE[recompensas.item];
                textoRecompensas += `\n📦 ${info?.nome || recompensas.item}`;
            } catch (err) {
                if (err.message.includes('Mochila cheia')) {
                    textoRecompensas += `\n🎒 ${err.message}`;
                }
            }
        }
        
        if (recompensas.titulo) {
            textoRecompensas += `\n🏷️ Título: ${recompensas.titulo}`;
        }
        
        if (recompensas.conquista) {
            textoRecompensas += `\n🏆 Conquista: ${recompensas.conquista}`;
        }
        
        // Remove da lista de ativas
        this.missoesAtivas = this.missoesAtivas.filter(m => m.id !== missao.id);
        this.missoesConcluidas.push(missao);
        
        await this.jogador.salvar();
        
        return {
            missao: missao,
            recompensas: textoRecompensas
        };
    }

    // ============================================================
    // 🔹 LISTAR MISSÕES
    // ============================================================

    listarMissoes() {
        const disponiveis = [];
        const emAndamento = [];
        const concluidas = [];
        
        // Missões disponíveis (não iniciadas)
        for (const [id, missao] of Object.entries(MISSOES)) {
            if (this.jogador.dados.nivel < missao.nivel_necessario) continue;
            
            const jaTem = this.missoesAtivas.some(m => m.id === id);
            const jaConcluiu = this.missoesConcluidas.some(m => m.id === id);
            
            if (!jaTem && !jaConcluiu) {
                disponiveis.push(missao);
            }
        }
        
        // Em andamento
        for (const missao of this.missoesAtivas) {
            emAndamento.push(missao);
        }
        
        // Concluídas
        for (const missao of this.missoesConcluidas) {
            concluidas.push(missao);
        }
        
        return { disponiveis, emAndamento, concluidas };
    }

    // ============================================================
    // 🔹 ACEITAR MISSÃO (VIA NPC)
    // ============================================================

    async aceitarMissao(missaoId) {
        const missao = MISSOES[missaoId];
        if (!missao) {
            return { error: '❌ Missão não encontrada!' };
        }
        
        if (this.jogador.dados.nivel < missao.nivel_necessario) {
            return { error: `❌ Você precisa ser nível ${missao.nivel_necessario} para esta missão!` };
        }
        
        const jaTem = this.missoesAtivas.some(m => m.id === missaoId);
        const jaConcluiu = this.missoesConcluidas.some(m => m.id === missaoId);
        
        if (jaTem) {
            return { error: '⏳ Você já está fazendo esta missão!' };
        }
        if (jaConcluiu) {
            return { error: '✅ Você já concluiu esta missão!' };
        }
        
        // Aceita a missão
        await this.jogador.aceitarMissao(missaoId);
        
        // Adiciona à lista de ativas
        const missaoCompleta = {
            ...missao,
            progresso: 0,
            status: 'em_andamento',
            id: missaoId
        };
        this.missoesAtivas.push(missaoCompleta);
        
        return { success: true, missao: missaoCompleta };
    }

    // ============================================================
    // 🔹 MENSAGENS (USANDO O CENTRALIZADOR)
    // ============================================================

    getMensagemProgresso(missao) {
        return gerarMensagemProgresso(missao, missao.progresso || 0);
    }

    getMensagemConclusao(missao) {
        return gerarMensagemConclusao(missao);
    }

    getMensagemOferta(missao) {
        return gerarMensagemOferta(missao);
    }

    getMensagemAndamento(missao) {
        return gerarMensagemAndamento(missao, missao.progresso || 0);
    }

    // ============================================================
    // 🔹 FORMATAR LISTA DE MISSÕES PARA O USUÁRIO
    // ============================================================

    async formatarMissoes() {
        const missoes = await this.jogador.listarMissoes();
        
        if (missoes.length === 0) {
            return '📜 Você ainda não tem missões.\n\n📌 Fale com os NPCs para receber missões!';
        }
        
        let texto = `📊 *MINHAS MISSÕES*\n\n`;
        
        const emAndamento = missoes.filter(m => m.status === 'em_andamento');
        const concluidas = missoes.filter(m => m.status === 'concluida');
        
        if (emAndamento.length > 0) {
            texto += `⏳ *EM ANDAMENTO*\n`;
            for (const m of emAndamento) {
                const missao = MISSOES[m.missao_id];
                if (!missao) continue;
                const total = missao.objetivos?.length || 1;
                const percentual = Math.floor((m.progresso / total) * 100);
                const npc = getNPC(missao.npc);
                texto += `\n📌 ${missao.nome}\n`;
                texto += `   📊 ${m.progresso}/${total} (${percentual}%)\n`;
                texto += `   📝 ${missao.descricao}\n`;
                texto += `   👤 ${npc?.nome || missao.npc}\n`;
                
                // Mostra objetivos
                for (const obj of missao.objetivos) {
                    const jaFeito = m.progresso > 0;
                    texto += `   ${jaFeito ? '✅' : '⬜'} ${obj.descricao}\n`;
                }
            }
        }
        
        if (concluidas.length > 0) {
            texto += `\n✅ *CONCLUÍDAS*\n`;
            for (const m of concluidas) {
                const missao = MISSOES[m.missao_id];
                if (!missao) continue;
                texto += `\n📌 ${missao.nome}\n`;
                texto += `   ✅ Concluída\n`;
            }
        }
        
        return texto;
    }
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = { MissaoSystem };
