// !apagar / !deletar / !delete - Tenta deletar mensagem respondida
module.exports = {
    nomes: [
        "apagar",
        "deletar",
        "delete",
        "del",
        "rm",
        "remover",
        "limpar",
        "clear",
        "d",
        "apaga",
        "deleta"
    ],

    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🎯 PEGA A MENSAGEM RESPONDIDA
            // ============================================================
            const quoted = msg.message?.extendedTextMessage?.contextInfo;

            // Se não respondeu nada, mostra ajuda
            if (!quoted || !quoted.stanzaId) {
                return sock.sendMessage(remoteJid, {
                    text: `🗑️ *APAGAR*\n\n` +
                          `📌 Responda uma mensagem com *!apagar*\n\n` +
                          `💡 Aliases: !deletar, !delete, !del, !rm, !limpar, !clear`
                });
            }

            // ============================================================
            // 🗑️ TENTA DELETAR (SÓ TENTA)
            // ============================================================
            const targetMsgKey = {
                remoteJid: remoteJid,
                fromMe: false,
                id: quoted.stanzaId,
                participant: quoted.participant
            };

            await sock.sendMessage(remoteJid, {
                delete: targetMsgKey
            });

            // Reação de sucesso
            try {
                await sock.sendMessage(remoteJid, {
                    react: { text: "🗑️", key: msg.key }
                });
            } catch (e) {}

        } catch (err) {
            console.error("❌ Erro ao apagar:", err.message);
            await sock.sendMessage(remoteJid, {
                text: `❌ Não consegui apagar.\n\n💡 O bot precisa ser admin do grupo.`
            });
        }
    }
};
