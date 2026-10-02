// core/observer.js - OBSERVADOR DE EVENTOS DO JOGADOR

const { MissaoSystem } = require('./missao_system');
const { ConquistaSystem } = require('./conquista_system');
const { getCriatura } = require('../dados/biomas/eldoria');
const { gerarMensagemConclusao } = require('./mensagens');

// ============================================================
// 🔹 MAPA DE EVENTOS OBSERVÁVEIS
// ============================================================

class Observer {
    constructor() {
        this.eventos = {};
        this.fila = [];
    }

    // ============================================================
    // 🔹 REGISTRAR OBSERVADOR
    // ============================================================

    registrar(tipo, callback) {
        if (!this.eventos[tipo]) {
            this.eventos[tipo] = [];
        }
        this.eventos[tipo].push(callback);
    }

    // ============================================================
    // 🔹 EMITIR EVENTO
    // ============================================================

    async emitir(tipo, dados) {
        if (!this.eventos[tipo]) return;
        
        for (const callback of this.eventos[tipo]) {
            try {
                await callback(dados);
            } catch (err) {
                console.error(`Erro no observer ${tipo}:`, err);
            }
        }
    }

    // ============================================================
    // 🔹 PROCESSAR EVENTO E DISPARAR MISSÕES E CONQUISTAS
    // ============================================================

    async processarEvento(usuarioId, tipo, alvo, quantidade = 1, detalhes = {}) {
        console.log(`🔍 [OBSERVER] Evento: ${tipo} | Alvo: ${alvo} | Usuário: ${usuarioId}`);
        
        try {
            // ============================================================
            // 🔥 1. PROCESSAR MISSÕES
            // ============================================================
            const missaoSystem = new MissaoSystem(usuarioId);
            await missaoSystem.carregar();
            
            const resultado = await missaoSystem.registrarProgresso(tipo, alvo, quantidade);
            
            // ============================================================
            // 🔥 2. PROCESSAR CONQUISTAS
            // ============================================================
            const conquistaSystem = new ConquistaSystem(usuarioId);
            await conquistaSystem.carregar();
            
            // Dados acumulados para conquistas
            const dadosConquista = {
                totalTreinos: detalhes.totalTreinos || 0,
                totalColetas: detalhes.totalColetas || 0,
                areasExploradas: detalhes.areasExploradas || new Set(),
                totalMortes: detalhes.totalMortes || {}
            };
            
            const conquistasDesbloqueadas = await conquistaSystem.verificar(tipo, alvo, quantidade, dadosConquista);
            
            // ============================================================
            // 🔥 3. NOTIFICAR CONQUISTAS DESBLOQUEADAS
            // ============================================================
            if (conquistasDesbloqueadas.length > 0) {
                for (const conquista of conquistasDesbloqueadas) {
                    const mensagem = `🏆 *CONQUISTA DESBLOQUEADA!*\n\n${conquista.icone} ${conquista.nome}\n📝 ${conquista.descricao}\n\n⭐ +${conquista.recompensas.xp || 0} XP`;
                    
                    await this.emitir('conquista_desbloqueada', {
                        usuarioId,
                        conquista: conquista,
                        mensagem: mensagem
                    });
                    
                    // 🔥 Envia a notificação imediatamente se houver listener
                    if (this.eventos['conquista_desbloqueada']) {
                        // A mensagem será enviada pelo index.js
                    }
                }
            }

            // ============================================================
            // 🔥 4. NOTIFICAR PROGRESSO/CONCLUSÃO DE MISSÃO
            // ============================================================
            if (resultado.concluida) {
                const mensagem = resultado.mensagem || gerarMensagemConclusao(resultado.missao);
                await this.emitir('missao_concluida', {
                    usuarioId,
                    mensagem: mensagem,
                    missao: resultado.missao
                });
                return resultado;
            }
            
            if (resultado.progresso) {
                await this.emitir('missao_progresso', {
                    usuarioId,
                    mensagem: resultado.mensagem,
                    missao: resultado.missao
                });
                return resultado;
            }
            
            return { progresso: false };
        } catch (err) {
            console.error('❌ Erro no observer:', err);
            return { progresso: false, erro: err.message };
        }
    }

    // ============================================================
    // 🔹 PROCESSAR COMANDO (USADO PELO INDEX.JS)
    // ============================================================

    async processar(usuarioId, comando, args, resultado) {
        console.log(`👀 [OBSERVER] Processando comando: ${comando}`);
        
        // Mapeia comandos para eventos
        const mapaEventos = {
            'perfil': { tipo: 'comando', alvo: 'perfil' },
            'treino': { tipo: 'treinar', alvo: '*' },
            'trabalhar': { tipo: 'trabalhar', alvo: '*' },
            'coletar': { tipo: 'coletar', alvo: args[0] || 'aleatorio' },
            'matar': { tipo: 'matar', alvo: args[0] || 'desconhecido' },
            'explorar': { tipo: 'explorar', alvo: args[0] || 'desconhecido' },
            'batalhar': { 
                tipo: 'matar', 
                alvo: resultado?.criatura || 'desconhecido',
                condicao: resultado?.venceu === true
            },
            'craftar': { 
                tipo: 'craftar', 
                alvo: args[0] || 'desconhecido'
            },
            'equipar': {
                tipo: 'equipar',
                alvo: args[0] || 'desconhecido'
            }
        };
        
        const evento = mapaEventos[comando];
        if (!evento) {
            console.log(`ℹ️ [OBSERVER] Comando não mapeado: ${comando}`);
            return null;
        }
        
        // Verifica condição (ex: só se venceu a batalha)
        if (evento.condicao === false) {
            console.log(`ℹ️ [OBSERVER] Condição não atendida para: ${comando}`);
            return null;
        }
        
        console.log(`✅ [OBSERVER] Evento mapeado: ${evento.tipo} -> ${evento.alvo}`);
        
        // 🔥 Dados adicionais para conquistas
        const detalhes = { args, resultado };
        
        return this.processarEvento(usuarioId, evento.tipo, evento.alvo, 1, detalhes);
    }
}

// ============================================================
// 🔹 INSTÂNCIA ÚNICA
// ============================================================

const observer = new Observer();

// ============================================================
// 🔹 FUNÇÕES PARA EMITIR EVENTOS DOS COMANDOS
// ============================================================

async function emitirEvento(usuarioId, tipo, alvo, quantidade = 1, detalhes = {}) {
    return observer.processarEvento(usuarioId, tipo, alvo, quantidade, detalhes);
}

// ============================================================
// 🔹 EVENTOS ESPECÍFICOS PARA CADA AÇÃO
// ============================================================

async function eventoComando(usuarioId, comando, args = []) {
    return emitirEvento(usuarioId, 'comando', comando, 1, { args });
}

async function eventoColetar(usuarioId, item, quantidade = 1) {
    return emitirEvento(usuarioId, 'coletar', item, quantidade);
}

async function eventoMatar(usuarioId, criaturaId) {
    const criatura = getCriatura(criaturaId);
    const nome = criatura?.nome || criaturaId;
    return emitirEvento(usuarioId, 'matar', criaturaId, 1, { nome });
}

async function eventoExplorar(usuarioId, areaId) {
    return emitirEvento(usuarioId, 'explorar', areaId, 1);
}

async function eventoTreinar(usuarioId) {
    return emitirEvento(usuarioId, 'treinar', '*', 1);
}

async function eventoTrabalhar(usuarioId) {
    return emitirEvento(usuarioId, 'trabalhar', '*', 1);
}

async function eventoMissaoAceitar(usuarioId, missaoId) {
    return emitirEvento(usuarioId, 'missao_aceitar', missaoId, 1);
}

async function eventoEquipar(usuarioId, itemId) {
    return emitirEvento(usuarioId, 'equipar', itemId, 1);
}

async function eventoCraftar(usuarioId, itemId) {
    return emitirEvento(usuarioId, 'craftar', itemId, 1);
}

// ============================================================
// 🔹 REGISTRAR OBSERVADORES DE NOTIFICAÇÃO
// ============================================================

observer.registrar('missao_progresso', async (dados) => {
    console.log(`📢 [OBSERVER] Progresso: ${dados.mensagem}`);
});

observer.registrar('missao_concluida', async (dados) => {
    console.log(`🎉 [OBSERVER] Concluída: ${dados.mensagem}`);
});

observer.registrar('conquista_desbloqueada', async (dados) => {
    console.log(`🏆 [OBSERVER] Conquista: ${dados.mensagem}`);
});

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    observer,
    emitirEvento,
    eventoComando,
    eventoColetar,
    eventoMatar,
    eventoExplorar,
    eventoTreinar,
    eventoTrabalhar,
    eventoMissaoAceitar,
    eventoEquipar,
    eventoCraftar
};
