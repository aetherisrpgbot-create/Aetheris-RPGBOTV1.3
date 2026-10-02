// comandos/rpg/atacar.js
const { Batalha } = require('../../core/batalha');

module.exports = {
    nome: "atacar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const batalha = new Batalha(remetenteId);
            await batalha.carregar();

            if (!batalha.estaEmBatalha()) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em batalha! Use !batalhar para começar.'
                });
            }

            const resultado = await batalha.atacar('atacar', 1);
            
            if (resultado.error) {
                return sock.sendMessage(remoteJid, { text: resultado.error });
            }

            await sock.sendMessage(remoteJid, { text: resultado.texto });

        } catch (err) {
            console.error("❌ ERRO atacar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao atacar: ${err.message}`
            });
        }
    }
};
