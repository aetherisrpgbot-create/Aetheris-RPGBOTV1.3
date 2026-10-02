// !rankquiz - Ranking do quiz (busca do BANCO, igual rankgame)
const { executarPython } = require("../../servicos/jogador");

// ============================================================
// 🔹 CONTROLE EM MEMÓRIA (para dados do dia)
// ============================================================
function getControleMemoria() {
    return global.__controleDiarioQuiz || {};
}

module.exports = {
    nome: "rankquiz",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 📊 BUSCA NOME DO BANCO (mesma fonte do rankgame)
            // ============================================================
            const mapaJogadores = {};
            const controleMemoria = getControleMemoria();

            // Pega lista de IDs da memória
            const ids = Object.keys(controleMemoria);

            // Para cada ID, busca o nome REAL no banco
            for (const userId of ids) {
                const dadosMemoria = controleMemoria[userId];

                // Só mostra quem jogou
                if ((dadosMemoria.perguntas || 0) + (dadosMemoria.erros || 0) === 0) continue;

                let nome = null;

                // 🔥 BUSCA NO BANCO (igual rankgame faz com jogos_ranking)
                try {
                    const result = await executarPython('jogador_carregar', userId);
                    if (result && result.jogador && result.jogador.nome) {
                        nome = result.jogador.nome;
                    }
                } catch (e) {
                    console.log(`⚠️ Não achei ${userId} no banco`);
                }

                // Fallback se não achou no banco
                if (!nome) {
                    nome = dadosMemoria.nome || `User_${String(userId).slice(-4)}`;
                }

                mapaJogadores[userId] = {
                    id: userId,
                    nome: nome,
                    acertos: dadosMemoria.perguntas || 0,
                    erros: dadosMemoria.erros || 0
                };
            }

            // ============================================================
            // 🏅 MONTA RANKING
            // ============================================================
            const ranking = Object.values(mapaJogadores)
                .map(j => {
                    const total = j.acertos + j.erros;
                    const taxa = total > 0 ? Math.round((j.acertos / total) * 100) : 0;
                    const pontos = j.acertos - (j.erros * 0.5);
                    return { ...j, total, taxa, pontos };
                })
                .sort((a, b) => b.pontos - a.pontos || b.acertos - a.acertos)
                .slice(0, 10);

            if (ranking.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: "📚 Ninguém respondeu perguntas ainda!\n\n" +
                          "Use *!pergunta* para começar!"
                });
            }

            // ============================================================
            // 📋 MONTA TEXTO
            // ============================================================
            let texto = `╔═══════════════════════════════════╗\n`;
            texto += `║  📚 *RANKING DO QUIZ* 📚          ║\n`;
            texto += `╚═══════════════════════════════════╝\n\n`;

            ranking.forEach((jogador, index) => {
                const medalha = index === 0 ? "🥇" :
                                index === 1 ? "🥈" :
                                index === 2 ? "🥉" : "👤";

                texto += `${medalha} *${jogador.nome}*\n`;
                texto += `   ✅ Acertos: ${jogador.acertos}\n`;
                texto += `   ❌ Erros: ${jogador.erros}\n`;
                texto += `   🎯 Taxa: ${jogador.taxa}%\n`;
                texto += `   ⭐ Pontos: ${jogador.pontos.toFixed(1)}\n\n`;
            });

            texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `📝 Use *!pergunta* para jogar!\n`;
            texto += `🏆 Ranking por pontos (acerto +1, erro -0.5)`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ Erro no comando rankquiz:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar ranking: ${err.message}`
            });
        }
    }
};
