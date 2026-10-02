// comandos/rpg/missoes.js
const { Jogador } = require('../../servicos/jogador');
const MISSOES = require('../../dados/missoes');
const { getNPC } = require('../../dados/npcs/');

module.exports = {
    nome: "missoes",
    alias: ["missao"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // 🔥 UMA ÚNICA CHAMADA
            const minhasMissoes = await jogador.listarMissoes();
            
            let texto = `📊 *MINHAS MISSÕES*\n\n`;
            
            if (minhasMissoes.length === 0) {
                texto += 'Você ainda não tem missões.\n';
                texto += '\n📌 Fale com os NPCs para receber missões!';
                texto += '\n   !falar com Arven';
            } else {
                const emAndamento = minhasMissoes.filter(m => m.status === 'em_andamento');
                const concluidas = minhasMissoes.filter(m => m.status === 'concluida');
                
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
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO missoes:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar missões: ${err.message}`
            });
        }
    }
};
