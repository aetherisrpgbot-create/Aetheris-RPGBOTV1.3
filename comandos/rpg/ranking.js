// comandos/rpg/ranking.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "ranking",
    alias: ["rank", "top"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // Verifica se o jogador existe
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // Busca todos os jogadores do banco
            const { executarPython } = require('../../servicos/jogador');
            const result = await executarPython('jogador_ranking');
            
            if (result.erro) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Erro ao carregar ranking: ${result.erro}`
                });
            }

            const ranking = result.ranking || [];
            
            let texto = `🏆 *RANKING GLOBAL*\n\n`;
            
            if (ranking.length === 0) {
                texto += 'Nenhum jogador encontrado.';
            } else {
                const top = ranking.slice(0, 10);
                for (let i = 0; i < top.length; i++) {
                    const p = top[i];
                    const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`;
                    texto += `${medalha} **${p.nome}** - Nível ${p.nivel} (XP: ${p.xp})\n`;
                }
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO ranking:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar ranking: ${err.message}`
            });
        }
    }
};
