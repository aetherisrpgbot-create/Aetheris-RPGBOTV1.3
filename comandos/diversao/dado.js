// !dado - Rola um dado (padrão D6, aceita !dado 20)
const { registrarJogo } = require("./utils/pontos");

module.exports = {
    nome: "dado",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const lados = parseInt(args[0]) || 6;

        if (lados < 2 || lados > 1000) {
            return sock.sendMessage(remoteJid, {
                text: "❌ Escolha um dado entre 2 e 1000 lados!\n\nEx: *!dado 20*"
            });
        }

        const resultado = Math.floor(Math.random() * lados) + 1;

        // 🎮 Registra +1 ponto
        await registrarJogo(remetenteId, "dado", "play", 1, `D${lados}=${resultado}`);

        await sock.sendMessage(remoteJid, {
            text: `🎲 *DADO D${lados}*\n\n` +
                  `🎯 Resultado: *${resultado}*\n\n` +
                  `⭐ +1 ponto no ranking!`
        });
    }
};
