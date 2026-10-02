// !rankgame - Ranking geral de jogos
const { getRankingJogos, getStatsJogador } = require("./utils/pontos");

module.exports = {
    nome: "rankgame",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // ============================================================
        // 🎮 MODO PESSOAL: !rankgame eu
        // ============================================================
        if (args[0]?.toLowerCase() === 'eu' || args[0]?.toLowerCase() === 'me') {
            const stats = await getStatsJogador(remetenteId);

            if (!stats || stats.total === 0) {
                return sock.sendMessage(remoteJid, {
                    text: "🎮 Você ainda não jogou nenhum jogo!\n\n" +
                          "Use *!menudiv* para ver os jogos disponíveis."
                });
            }

            const taxa = stats.total > 0
                ? Math.round((stats.vitorias / stats.total) * 100)
                : 0;

            let texto = `╔═══════════════════════════════════╗\n`;
            texto += `║  🎮 *SUAS ESTATÍSTICAS* 🎮        ║\n`;
            texto += `╚═══════════════════════════════════╝\n\n`;
            texto += `📊 Partidas: *${stats.total}*\n`;
            texto += `🏆 Vitórias: *${stats.vitorias}*\n`;
            texto += `❌ Derrotas: *${stats.derrotas}*\n`;
            texto += `🎯 Taxa de vitória: *${taxa}%*\n`;
            texto += `⭐ Pontos totais: *${stats.pontos}*\n\n`;

            const jogos = Object.entries(stats.porJogo);
            if (jogos.length > 0) {
                texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `🎲 *POR JOGO:*\n\n`;
                for (const [jogo, s] of jogos) {
                    const taxaJogo = s.total > 0
                        ? Math.round((s.vitorias / s.total) * 100)
                        : 0;
                    texto += `🎮 *${jogo}*\n`;
                    texto += `   ✅ ${s.vitorias}V / ❌ ${s.derrotas}D (${taxaJogo}%)\n`;
                    texto += `   ⭐ ${s.pontos} pts\n\n`;
                }
            }

            return sock.sendMessage(remoteJid, { text: texto });
        }

        // ============================================================
        // 🏆 MODO GERAL: !rankgame
        // ============================================================
        const ranking = await getRankingJogos(10);

        if (!ranking || ranking.length === 0) {
            return sock.sendMessage(remoteJid, {
                text: "📊 Ninguém jogou ainda!\n\n" +
                      "Use *!menudiv* para começar!"
            });
        }

        let texto = `╔═══════════════════════════════════╗\n`;
        texto += `║  🏆 *RANKING DE JOGOS* 🏆         ║\n`;
        texto += `╚═══════════════════════════════════╝\n\n`;

        ranking.forEach((j, index) => {
            const medalha = index === 0 ? "🥇" :
                            index === 1 ? "🥈" :
                            index === 2 ? "🥉" :
                            `${index + 1}º`;

            const taxa = j.total > 0
                ? Math.round((j.vitorias / j.total) * 100)
                : 0;

            texto += `${medalha} *${j.nome}*\n`;
            texto += `   🏆 ${j.vitorias}V / ❌ ${j.derrotas}D\n`;
            texto += `   🎯 Taxa: ${taxa}% | 📊 ${j.total} partidas\n`;
            texto += `   ⭐ ${j.pontos} pontos\n\n`;
        });

        texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `📌 Use *!rankgame eu* para ver SUAS estatísticas\n`;
        texto += `🎮 Use *!menudiv* para jogar!`;

        await sock.sendMessage(remoteJid, { text: texto });
    }
};
