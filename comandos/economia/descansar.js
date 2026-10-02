// comandos/rpg/descansar.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "descansar",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        try {
            const jogador = new Jogador(remetenteId);
            jogador.carregar();

            jogador.descansar();

            await sock.sendMessage(remoteJid, {
                text: `⛺ *Você descansou!*

❤️ Vida: ${jogador.dados.vida}/${jogador.dados.vida_max}
💧 Mana: ${jogador.dados.mana}/${jogador.dados.mana_max}
⚡ Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}

💤 Continue sua jornada, aventureiro!`
            });

        } catch (err) {
            console.error("❌ ERRO descansar:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao descansar."
            });
        }
    }
};
