// !moeda - Cara ou coroa
const { registrarJogo } = require("./utils/pontos");

module.exports = {
    nome: "moeda",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        const emoji = resultado === 'Cara' ? '👑' : '🪙';

        // 🎮 Registra +1 ponto
        await registrarJogo(remetenteId, "moeda", "play", 1, resultado);

        await sock.sendMessage(remoteJid, {
            text: `${emoji} *MOEDA*\n\n` +
                  `🎯 Caiu: *${resultado}*!\n\n` +
                  `⭐ +1 ponto no ranking!`
        });
    }
};
