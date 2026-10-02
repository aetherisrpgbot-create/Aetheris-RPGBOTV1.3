// comandos/rpg/passar.js
const { batalhasAtivas } = require('../../core/batalha');

module.exports = {
    nome: "passar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.turno > 0) {
                return sock.sendMessage(remoteJid, {
                    text: `⚔️ Você já está em batalha contra ${encontro.criatura.nome}! Use !fugir para tentar escapar.`
                });
            }

            if (encontro.tipo === 'hostil') {
                return sock.sendMessage(remoteJid, {
                    text: `⚔️ ${encontro.criatura.nome} é hostil! Você precisa lutar ou fugir.\n\n📌 Use !batalhar para lutar ou !fugir para tentar escapar.`
                });
            }

            const nome = encontro.criatura?.nome || 'criatura';
            batalhasAtivas.delete(remetenteId);

            return sock.sendMessage(remoteJid, {
                text: `🚶‍♂️ Você passou reto e deixou ${nome} para trás.`
            });

        } catch (err) {
            console.error("❌ ERRO passar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao passar: ${err.message}`
            });
        }
    }
};
