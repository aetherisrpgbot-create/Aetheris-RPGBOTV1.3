// comandos/rpg/coletar.js
const { Coleta } = require('../../core/coleta');

module.exports = {
    nome: "coletar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const coleta = new Coleta(remetenteId);
            await coleta.carregar();

            // ============================================================
            // 🔥 SE TIVER ARGUMENTO "LISTA" → MOSTRA RECURSOS
            // ============================================================
            if (args.length > 0 && args[0].toLowerCase() === 'lista') {
                const texto = coleta.listarRecursos();
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 SE TIVER ARGUMENTO → TENTA COLETAR ESPECÍFICO
            // ============================================================
            if (args.length > 0) {
                const itemId = args[0].toLowerCase();
                const resultado = await coleta.coletarEspecifico(itemId);
                return sock.sendMessage(remoteJid, { text: resultado.message });
            }

            // ============================================================
            // 🔥 SEM ARGUMENTO → COLETA ALEATÓRIA
            // ============================================================
            const resultado = await coleta.coletarAleatorio();
            await sock.sendMessage(remoteJid, { text: resultado.message });

        } catch (err) {
            console.error("❌ ERRO coletar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao coletar: ${err.message}`
            });
        }
    }
};
