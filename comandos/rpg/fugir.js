// comandos/rpg/fugir.js
const { Batalha } = require('../../core/batalha');

module.exports = {
    nome: "fugir",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const batalha = new Batalha(remetenteId);
            await batalha.carregar();

            if (!batalha.estaEmBatalha()) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em batalha! Use !batalhar para começar.'
                });
            }

            const resultado = await batalha.fugir();
            
            if (resultado.error) {
                return sock.sendMessage(remoteJid, { text: resultado.error });
            }

            await sock.sendMessage(remoteJid, { text: resultado.texto });

        } catch (err) {
            console.error("❌ ERRO fugir:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao fugir: ${err.message}`
            });
        }
    }
};
