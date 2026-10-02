// comandos/economia/pagar.js - TRANSFERIR OURO ENTRE JOGADORES
const { Jogador } = require('../../servicos/jogador');
const { getDestinatario } = require('../../utils/mencoes');

module.exports = {
    nomes: ["pagar", "pay", "pix", "transferir", "transfer", "enviar", "mandar", "passar", "doar", "manda", "envia", "paga", "pague", "transferencia", "transferência"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🔥 PEGA O DESTINATÁRIO (MENÇÃO OU RESPOSTA)
            // ============================================================
            
            const destinatario = getDestinatario(msg);
            
            if (!destinatario) {
                return sock.sendMessage(remoteJid, {
                    text: `💸 *SISTEMA DE PAGAMENTO*\n\n` +
                          `📌 *Como usar:*\n` +
                          `   !pagar @usuario <quantia>\n` +
                          `   (ou responda a mensagem de alguém)\n\n` +
                          `📌 *Exemplos:*\n` +
                          `   !pagar @Widnes 100\n` +
                          `   !pix @Lucas 50\n` +
                          `   (responda a msg com !pagar 100)\n\n` +
                          `💰 *Precisa ter ouro suficiente!*\n` +
                          `📌 Use !saldo para ver seu ouro.`
                });
            }

            const destinatarioId = destinatario.id;

            // Não pode pagar pra si mesmo
            if (destinatarioId === remetenteId) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode pagar para si mesmo!`
                });
            }

            // ============================================================
            // 🔥 PEGA A QUANTIA
            // ============================================================
            
            // Se tiver menção (@12345), remove o primeiro arg
            let argsLimpos = [...args];
            if (argsLimpos[0] && argsLimpos[0].startsWith('@')) {
                argsLimpos = argsLimpos.slice(1);
            }
            
            // Pega a quantia (último arg)
            const quantiaArg = argsLimpos[argsLimpos.length - 1];
            const quantia = parseInt(quantiaArg);

            if (isNaN(quantia) || quantia <= 0) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Quantia inválida!\n\n` +
                          `📌 *Exemplo:*\n` +
                          `   !pagar @usuario 100\n` +
                          `   (responda a msg com !pagar 100)`
                });
            }

            // ============================================================
            // 🔥 CARREGA OS JOGADORES
            // ============================================================
            
            // Carrega o remetente
            const remetente = new Jogador(remetenteId);
            try {
                await remetente.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ Você ainda não tem um perfil!\n📌 Use !perfil para criar.`
                    });
                }
                throw err;
            }

            // Carrega o destinatário
            const destinatarioJogador = new Jogador(destinatarioId);
            try {
                await destinatarioJogador.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ O jogador mencionado ainda não tem um perfil!`
                    });
                }
                throw err;
            }

            // ============================================================
            // 🔥 VERIFICA SE TEM OURO SUFICIENTE
            // ============================================================
            
            if (remetente.dados.ouro < quantia) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Ouro insuficiente!*\n\n` +
                          `💰 Seu ouro: ${remetente.dados.ouro}\n` +
                          `💸 Você tentou pagar: ${quantia}\n\n` +
                          `📌 *Faltam:* ${quantia - remetente.dados.ouro} ouro`
                });
            }

            // ============================================================
            // 🔥 REALIZA A TRANSFERÊNCIA
            // ============================================================
            
            // Remove do remetente
            remetente.dados.ouro -= quantia;
            await remetente.salvar();

            // Adiciona pro destinatário
            await destinatarioJogador.adicionarOuro(quantia);
            await destinatarioJogador.salvar();

            // ============================================================
            // 🔥 REGISTRA NO HISTÓRICO
            // ============================================================
            
            try {
                await remetente.registrarAcao('pagamento', `Enviou ${quantia} ouro para ${destinatarioJogador.dados.nome}`);
                await destinatarioJogador.registrarAcao('recebimento', `Recebeu ${quantia} ouro de ${remetente.dados.nome}`);
            } catch (e) {}

            // ============================================================
            // 🔥 ENVIA A CONFIRMAÇÃO
            // ============================================================
            
            const nomeRemetente = remetente.dados.nome || 'Aventureiro';
            const nomeDestinatario = destinatarioJogador.dados.nome || 'Aventureiro';

            let texto = `💸 *PAGAMENTO REALIZADO!*\n\n`;
            texto += `👤 *De:* ${nomeRemetente}\n`;
            texto += `👤 *Para:* ${nomeDestinatario}\n\n`;
            texto += `💰 *Valor:* ${quantia} ouro\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `💰 Seu ouro: ${remetente.dados.ouro}`;

            await sock.sendMessage(remoteJid, { text: texto });

            // 🔥 NOTIFICA O DESTINATÁRIO
            try {
                await sock.sendMessage(destinatarioId, {
                    text: `💰 *VOCÊ RECEBEU UM PAGAMENTO!*\n\n` +
                          `👤 *De:* ${nomeRemetente}\n` +
                          `💰 *Valor:* ${quantia} ouro\n\n` +
                          `💰 Seu ouro: ${destinatarioJogador.dados.ouro}`
                });
            } catch (e) {}

        } catch (err) {
            console.error("❌ ERRO pagar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao fazer pagamento: ${err.message}`
            });
        }
    }
};
