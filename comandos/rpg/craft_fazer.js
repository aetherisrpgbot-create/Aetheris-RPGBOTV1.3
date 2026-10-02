// comandos/rpg/craft_fazer.js
const { Craft } = require('../../core/craft');

module.exports = {
    nome: "craft_fazer",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (args.length < 1) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Use: !craft fazer <receita_id>\n\n📌 Exemplo: !craft fazer espada_madeira'
                });
            }

            const receitaId = args[0];
            const craft = new Craft(remetenteId);
            const resultado = await craft.craftar(receitaId);

            await sock.sendMessage(remoteJid, { text: resultado.message });

        } catch (err) {
            console.error("❌ ERRO craft_fazer:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao craftar item."
            });
        }
    }
};
