// comandos/rpg/stats.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "stats",
    alias: ["atributos", "status"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const d = jogador.dados;
            const atributos = await jogador.atributosTotais();

            let texto = `⚔️ *ATRIBUTOS DE ${d.nome}*\n\n`;
            texto += `📊 Nível: ${d.nivel}\n`;
            texto += `❤️ Vida: ${d.vida}/${d.vida_max}\n`;
            texto += `💙 Mana: ${d.mana}/${d.mana_max}\n`;
            texto += `⚡ Stamina: ${d.stamina}/${d.stamina_max}\n\n`;
            texto += `🗡️ Poder: ${atributos.poder}\n`;
            texto += `🛡️ Defesa: ${atributos.defesa}\n`;
            texto += `💀 Crítico: ${atributos.critico}%\n`;
            texto += `💨 Esquiva: ${atributos.esquiva}%\n\n`;
            
            texto += `💪 Força: ${d.forca}\n`;
            texto += `🎯 Destreza: ${d.destreza}\n`;
            texto += `🛡️ Constituição: ${d.constituicao}\n`;
            texto += `🧠 Inteligência: ${d.inteligencia}\n`;
            texto += `🌿 Sabedoria: ${d.sabedoria}\n`;
            texto += `💬 Carisma: ${d.carisma}\n\n`;
            
            // Mostra bonus de equipamentos
            const equipamentos = jogador.equipamentos || {};
            let bonusTexto = '';
            for (const [slot, itemId] of Object.entries(equipamentos)) {
                if (itemId) {
                    const info = require('../../dados/itens_base')[itemId];
                    if (info) {
                        bonusTexto += `   • ${slot}: ${info.nome}\n`;
                    }
                }
            }
            if (bonusTexto) {
                texto += `📦 *Equipamentos:*\n${bonusTexto}`;
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO stats:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao consultar atributos: ${err.message}`
            });
        }
    }
};
