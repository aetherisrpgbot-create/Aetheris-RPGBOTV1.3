// comandos/rpg/craft.js
const { Craft } = require('../../core/craft');

module.exports = {
    nome: "craft",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const craft = new Craft(remetenteId);
            const receitas = await craft.listarReceitas();
            const texto = craft.formatarLista(receitas);
            await sock.sendMessage(remoteJid, { text: texto });
        } catch (err) {
            console.error("❌ ERRO craft:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao carregar receitas."
            });
        }
    }
};
