// comandos/rpg/conquistas.js
const { ConquistaSystem } = require('../../core/conquista_system');

module.exports = {
    nome: "conquistas",
    alias: ["conquista", "trofeus"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const conquistaSystem = new ConquistaSystem(remetenteId);
            await conquistaSystem.carregar();

            const texto = await conquistaSystem.formatarConquistas();
            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO conquistas:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar conquistas: ${err.message}`
            });
        }
    }
};
