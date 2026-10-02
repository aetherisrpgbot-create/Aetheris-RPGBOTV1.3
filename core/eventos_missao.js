// core/eventos_missao.js - EVENTOS QUE ATUALIZAM MISSÕES

const { MissaoSystem } = require('./missao_system');

// ============================================================
// 🔹 REGISTRAR EVENTOS
// ============================================================

async function registrarEvento(usuarioId, tipo, alvo, quantidade = 1) {
    try {
        const missaoSystem = new MissaoSystem(usuarioId);
        await missaoSystem.carregar();
        
        const resultado = await missaoSystem.registrarProgresso(tipo, alvo, quantidade);
        
        if (resultado.concluida) {
            return { 
                evento: 'missao_concluida',
                mensagem: resultado.mensagem,
                missao: resultado.missao
            };
        }
        
        if (resultado.progresso) {
            return { 
                evento: 'missao_progresso',
                mensagem: resultado.mensagem,
                missao: resultado.missao
            };
        }
        
        return { evento: 'nenhum' };
    } catch (err) {
        console.error('Erro ao registrar evento:', err);
        return { evento: 'erro', mensagem: err.message };
    }
}

// ============================================================
// 🔹 EVENTOS ESPECÍFICOS
// ============================================================

async function eventoComando(usuarioId, comando) {
    return registrarEvento(usuarioId, 'comando', comando);
}

async function eventoColetar(usuarioId, item) {
    return registrarEvento(usuarioId, 'coletar', item);
}

async function eventoMatar(usuarioId, criatura) {
    return registrarEvento(usuarioId, 'matar', criatura);
}

async function eventoExplorar(usuarioId, area) {
    return registrarEvento(usuarioId, 'explorar', area);
}

async function eventoTreinar(usuarioId) {
    return registrarEvento(usuarioId, 'treinar', '*');
}

async function eventoTrabalhar(usuarioId) {
    return registrarEvento(usuarioId, 'trabalhar', '*');
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    registrarEvento,
    eventoComando,
    eventoColetar,
    eventoMatar,
    eventoExplorar,
    eventoTreinar,
    eventoTrabalhar
};
