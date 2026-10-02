// comandos/rpg/upgrademochila.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "upgrademochila",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const resultado = await jogador.upgradeMochila();

            if (!resultado.success) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ ${resultado.message}`
                });
            }

            return sock.sendMessage(remoteJid, {
                text: `✅ ${resultado.message}\n\n📦 Agora com ${resultado.mochila.slots} slots!\n💰 Ouro restante: ${resultado.ouro}`
            });

        } catch (err) {
            console.error("❌ ERRO upgrademochila:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao evoluir mochila: ${err.message}`
            });
        }
    }
};
