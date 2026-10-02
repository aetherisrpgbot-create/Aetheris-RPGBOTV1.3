// comandos/rpg/golpe.js
const { Batalha } = require('../../core/batalha');

module.exports = {
    nome: "golpe",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const batalha = new Batalha(remetenteId);
            await batalha.carregar();

            if (!batalha.estaEmBatalha()) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em batalha! Use !batalhar para começar.'
                });
            }

            const staminaCheck = batalha.verificarStamina(10);
            if (!staminaCheck.ok) {
                return sock.sendMessage(remoteJid, { text: staminaCheck.message });
            }

            batalha.consumirStamina(10);
            await batalha.jogador.salvar();

            const resultado = await batalha.atacar('golpe', 1.5);
            
            if (resultado.error) {
                return sock.sendMessage(remoteJid, { text: resultado.error });
            }

            await sock.sendMessage(remoteJid, { text: resultado.texto });

        } catch (err) {
            console.error("❌ ERRO golpe:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao usar golpe: ${err.message}`
            });
        }
    }
};
