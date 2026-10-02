// comandos/diversao/utils/pontos.js
// Helper para registrar pontos de jogos no banco do jogador

const { executarPython } = require("../../../servicos/jogador");

// ============================================================
// 🔹 REGISTRAR PARTIDA
// ============================================================
async function registrarJogo(jogadorId, nomeJogo, resultado, pontos = 0, detalhes = '') {
    try {
        const result = await executarPython(
            'jogos_registrar',
            jogadorId,
            nomeJogo,
            resultado,
            String(pontos),
            detalhes
        );

        if (result.erro) {
            console.error(`❌ Erro ao registrar jogo ${nomeJogo}:`, result.erro);
            return { ok: false, erro: result.erro };
        }

        return { ok: true };
    } catch (err) {
        console.error(`❌ Erro ao registrar jogo ${nomeJogo}:`, err.message);
        return { ok: false, erro: err.message };
    }
}

// ============================================================
// 🔹 BUSCAR ESTATÍSTICAS DO JOGADOR
// ============================================================
async function getStatsJogador(jogadorId) {
    try {
        const result = await executarPython('jogos_stats', jogadorId);
        if (result.erro) {
            console.error('❌ Erro ao buscar stats:', result.erro);
            return null;
        }
        return result.stats;
    } catch (err) {
        console.error('❌ Erro ao buscar stats:', err.message);
        return null;
    }
}

// ============================================================
// 🔹 BUSCAR RANKING GERAL
// ============================================================
async function getRankingJogos(limite = 10) {
    try {
        const result = await executarPython('jogos_ranking', String(limite));
        if (result.erro) {
            console.error('❌ Erro no ranking:', result.erro);
            return [];
        }
        return result.ranking || [];
    } catch (err) {
        console.error('❌ Erro ao buscar ranking:', err.message);
        return [];
    }
}

module.exports = {
    registrarJogo,
    getStatsJogador,
    getRankingJogos
};
