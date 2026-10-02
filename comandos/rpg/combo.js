// comandos/rpg/combo.js
const { Batalha } = require('../../core/batalha');

module.exports = {
    nome: "combo",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const batalha = new Batalha(remetenteId);
            await batalha.carregar();

            if (!batalha.estaEmBatalha()) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em batalha! Use !batalhar para começar.'
                });
            }

            const staminaCheck = batalha.verificarStamina(15);
            if (!staminaCheck.ok) {
                return sock.sendMessage(remoteJid, { text: staminaCheck.message });
            }

            batalha.consumirStamina(15);
            await batalha.jogador.salvar();

            const resultado = await batalha.atacar('combo', 2.5);
            
            if (resultado.error) {
                return sock.sendMessage(remoteJid, { text: resultado.error });
            }

            await sock.sendMessage(remoteJid, { text: resultado.texto });

        } catch (err) {
            console.error("❌ ERRO combo:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao usar combo: ${err.message}`
            });
        }
    }
};
