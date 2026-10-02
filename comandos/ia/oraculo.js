// comandos/ia/oraculo.js - ORÁCULO DE AETHERIS (ATUALIZADO)
const { gerarResposta } = require('../../servicos/ia');

module.exports = {
    nome: "oraculo",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
        try {
            const pergunta = args.join(" ").trim();
            
            if (!pergunta) {
                return sock.sendMessage(remoteJid, {
                    text: `🔮 *ORÁCULO DE AETHERIS*

📌 *Como consultar o Oráculo:*
!oraculo <pergunta>

💡 *Exemplos:*
!oraculo Qual é o meu destino?
!oraculo O que me espera na Floresta Sombria?
!oraculo !perfil
!oraculo !batalhar

🌙 *O Oráculo vê o passado, presente e futuro.*
📜 *Ele conhece os segredos dos Fragmentos e a profecia de Aetheris.*
⚔️ *Você pode pedir para ele executar comandos também!*`
                });
            }

            await sock.sendMessage(remoteJid, {
                text: `🔮 *Oráculo está refletindo...*\n⏳ Aguarde, jovem aventureiro.`
            });

            const nome = msg.pushName || 'Aventureiro';
            const resposta = await gerarResposta(
                'oraculo',        // personagem
                pergunta,         // pergunta
                nome,             // nome do usuário
                remetenteId,      // ID do usuário
                sock,             // socket
                msg,              // mensagem
                remoteJid,        // JID remoto
                isGroup           // se é grupo
            );

            await sock.sendMessage(remoteJid, { text: resposta });

        } catch (err) {
            console.log("❌ ERRO oraculo:", err);
            await sock.sendMessage(remoteJid, {
                text: `🌙 O Oráculo está em silêncio...\n\n${err.message?.substring(0, 100) || 'Tente novamente mais tarde.'}`
            });
        }
    }
};
