// utils/penalidades.js - FUNÇÃO PARA APLICAR PENALIDADES DE MORTE

async function aplicarPenalidades(jogador, criaturaNome) {
    const ouroPerdido = Math.max(1, Math.floor(jogador.dados.ouro * 0.2));
    jogador.dados.ouro = Math.max(0, jogador.dados.ouro - ouroPerdido);
    
    const xpPerdido = Math.max(1, Math.floor(jogador.dados.xp * 0.1));
    jogador.dados.xp = Math.max(0, jogador.dados.xp - xpPerdido);
    
    jogador.dados.stamina = 0;
    
    if (jogador.dados.vida_max > 20) {
        jogador.dados.vida_max = Math.max(20, jogador.dados.vida_max - 1);
    }
    jogador.dados.vida = Math.floor(jogador.dados.vida_max * 0.2);
    
    // 🔥 TEMPO DE RECUPERAÇÃO (5 minutos)
    jogador.dados.morreu_em = Date.now();
    
    await jogador.salvar();
    
    // 🔥 REGISTRA NO HISTÓRICO
    try {
        const { executarPython } = require('../servicos/jogador');
        await executarPython('jogador_acao', jogador.id, 'morte', 
            `Derrotado por ${criaturaNome} - Perdeu ${ouroPerdido} ouro e ${xpPerdido} XP`);
    } catch (e) {}
    
    return {
        ouroPerdido,
        xpPerdido,
        vidaMax: jogador.dados.vida_max
    };
}

module.exports = { aplicarPenalidades };
