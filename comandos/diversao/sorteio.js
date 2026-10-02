// !sorteio - Sorteio de número ou pessoa
const { registrarJogo } = require("./utils/pontos");

module.exports = {
    nome: "sorteio",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = args.join(" ").trim();

        // ============================================================
        // 🎲 MODO 1 — SORTEIO DE NÚMERO (!sorteio 1 100)
        // ============================================================
        if (/^\d+\s+\d+$/.test(texto)) {
            const [min, max] = texto.split(/\s+/).map(Number);

            if (min >= max) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ O primeiro número deve ser menor que o segundo!\n\nEx: !sorteio 1 100"
                });
            }

            if (max - min > 1000000) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Intervalo muito grande! Máximo: 1.000.000 de diferença."
                });
            }

            const numero = Math.floor(Math.random() * (max - min + 1)) + min;

            // 🎮 Registra no ranking
            await registrarJogo(
                remetenteId,
                "sorteio",
                "play",
                1,
                `numero:${numero} (${min}-${max})`
            );

            return sock.sendMessage(remoteJid, {
                text: `🎲 *SORTEIO DE NÚMERO*\n\n` +
                      `📊 Intervalo: *${min}* até *${max}*\n` +
                      `🎯 Resultado: *${numero}*\n\n` +
                      `⭐ +1 ponto no ranking!`
            });
        }

        // ============================================================
        // 👥 MODO 2 — SORTEIO DE PESSOA (!sorteio @user1 @user2)
        // ============================================================
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentions.length > 0) {
            if (mentions.length < 2) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Marque pelo menos *2 pessoas* para sortear!\n\nEx: !sorteio @joao @maria @pedro"
                });
            }

            if (mentions.length > 50) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Máximo de 50 participantes por sorteio!"
                });
            }

            const sorteado = mentions[Math.floor(Math.random() * mentions.length)];
            const numeroSorteado = sorteado.split("@")[0];

            // 🎮 Registra no ranking (quem pediu o sorteio)
            await registrarJogo(
                remetenteId,
                "sorteio",
                "play",
                1,
                `pessoa:${numeroSorteado} (${mentions.length} participantes)`
            );

            return sock.sendMessage(remoteJid, {
                text: `🎉 *SORTEIO DE PESSOA*\n\n` +
                      `👥 Participantes: *${mentions.length}*\n` +
                      `🏆 Sorteado: @${numeroSorteado}\n\n` +
                      `⭐ +1 ponto para quem pediu o sorteio!`,
                mentions: [sorteado]
            });
        }

        // ============================================================
        // ❓ MODO 3 — AJUDA (!sorteio)
        // ============================================================
        await sock.sendMessage(remoteJid, {
            text: `🎲 *SORTEIO*\n\n` +
                  `📌 *Como usar:*\n\n` +
                  `🎯 *Sortear número:*\n` +
                  `   !sorteio 1 100\n` +
                  `   → Sorteia entre 1 e 100\n\n` +
                  `👥 *Sortear pessoa:*\n` +
                  `   !sorteio @joao @maria @pedro\n` +
                  `   → Sorteia uma das pessoas marcadas\n\n` +
                  `━━━━━━━━━━━━━━━━━━━\n` +
                  `💡 *Dica:*\n` +
                  `• Marque pelo menos 2 pessoas\n` +
                  `• Máximo de 50 participantes\n` +
                  `• Máximo 1.000.000 de intervalo\n\n` +
                  `⭐ Cada uso vale +1 ponto no !rankgame`
        });
    }
};
