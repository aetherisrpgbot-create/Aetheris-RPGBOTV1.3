// comandos/rpg/defender.js
const { Batalha } = require('../../core/batalha');

module.exports = {
    nome: "defender",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const batalha = new Batalha(remetenteId);
            await batalha.carregar();

            if (!batalha.estaEmBatalha()) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em batalha! Use !batalhar para começar.'
                });
            }

            const resultado = await batalha.defender();
            
            if (resultado.error) {
                return sock.sendMessage(remoteJid, { text: resultado.error });
            }

            await sock.sendMessage(remoteJid, { text: resultado.texto });

        } catch (err) {
            console.error("❌ ERRO defender:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao defender: ${err.message}`
            });
        }
    }
};
