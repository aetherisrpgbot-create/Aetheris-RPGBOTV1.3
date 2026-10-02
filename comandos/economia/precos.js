// comandos/rpg/precos.js - TABELA DE PREÇOS
const { listarPrecos } = require('../../dados/precos');

module.exports = {
    nome: "precos",
    alias: ["preços", "tabela", "preco"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const texto = listarPrecos();
            await sock.sendMessage(remoteJid, { text: texto });
        } catch (err) {
            console.error("❌ ERRO precos:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar preços: ${err.message}`
            });
        }
    }
};
