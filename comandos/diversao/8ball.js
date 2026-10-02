// !8ball - Bola 8 mágica
const { registrarJogo } = require("./utils/pontos");

module.exports = {
    nome: "8ball",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const pergunta = args.join(" ").trim();

        if (!pergunta) {
            return sock.sendMessage(remoteJid, {
                text: "❓ *Faça uma pergunta!*\n\n" +
                      "Ex: *!8ball Vou ganhar na loteria?*"
            });
        }

        const respostas = [
            '🎱 Sim, definitivamente.',
            '🎱 Não.',
            '🎱 Tem que ver com os cara lá.',
            '🎱 Pergunte novamente mais tarde.',
            '🎱 Talvez...',
            '🎱 Com certeza!',
            '🎱 Melhor não dizer agora.',
            '🎱 Sim, mas se esforce.',
            '🎱 Não conte com isso.',
            '🎱 As estrelas dizem não.',
            '🎱 Meu oráculo está confuso.',
            '🎱 Sem dúvidas!',
            '🎱 Nem pense nisso.',
            '🎱 O destino é incerto.',
            '🎱 Sim, siga em frente!'
        ];

        const resposta = respostas[Math.floor(Math.random() * respostas.length)];

        // 🎮 Registra +1 ponto
        await registrarJogo(remetenteId, "8ball", "play", 1, pergunta.substring(0, 50));

        await sock.sendMessage(remoteJid, {
            text: `🔮 *BOLA 8 MÁGICA*\n\n` +
                  `❓ _${pergunta}_\n\n` +
                  `${resposta}\n\n` +
                  `⭐ +1 ponto no ranking!`
        });
    }
};
