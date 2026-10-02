// comandos/rpg/dar.js - DAR ITEM (MENÇÃO OU RESPOSTA)
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nomes: ["dar", "doar", "give", "presente", "presentear", "entregar", "passaritem"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🔥 PEGA O DESTINATÁRIO (MENÇÃO OU RESPOSTA)
            // ============================================================
            
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            
            let destinatarioId = null;

            // 1. Tenta por MENÇÃO
            if (contextInfo?.mentionedJid && contextInfo.mentionedJid.length > 0) {
                destinatarioId = contextInfo.mentionedJid[0];
            }

            // 2. Tenta por RESPOSTA
            if (!destinatarioId && contextInfo?.participant) {
                destinatarioId = contextInfo.participant;
            }

            // ============================================================
            // 🔥 SE NÃO TIVER ARGUMENTO → MOSTRA AJUDA
            // ============================================================
            
            if (!args || args.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: `🎁 *SISTEMA DE DOAÇÃO*\n\n` +
                          `📌 *Como usar:*\n` +
                          `   !dar @usuario <item>\n` +
                          `   !dar @usuario <item> <qtd>\n\n` +
                          `💡 *Ou responda a mensagem de alguém:*\n` +
                          `   !dar <item>\n` +
                          `   !dar <item> <qtd>\n\n` +
                          `📌 *Exemplos:*\n` +
                          `   !dar @Widnes espada de madeira\n` +
                          `   !dar @Lucas madeira 10`
                });
            }

            // Se não achou destinatário, mostra ajuda
            if (!destinatarioId) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você precisa *marcar* alguém ou *responder* uma mensagem!\n\n` +
                          `📌 *Exemplos:*\n` +
                          `   !dar @usuario espada de madeira\n` +
                          `   (responda a mensagem da pessoa com !dar espada de madeira)`
                });
            }

            if (destinatarioId === remetenteId) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode dar item para si mesmo!\n\n💡 Use !dropar para jogar fora.`
                });
            }

            // ============================================================
            // 🔥 PEGA O NOME DO ITEM E A QUANTIDADE
            // ============================================================
            
            let argsItem = [...args];
            
            // 🔥 SE TIVER MENÇÃO, REMOVE O PRIMEIRO ARG (que é a menção)
            // Se for RESPOSTA, não tem menção nos args
            
            // Verifica se o primeiro arg é uma menção (@12345)
            if (argsItem[0] && argsItem[0].startsWith('@')) {
                argsItem = argsItem.slice(1);
            }
            
            let nomeItem = argsItem.join(' ');
            let quantidade = 1;

            // Verifica se o último argumento é número
            const ultimoArg = argsItem[argsItem.length - 1];
            if (!isNaN(ultimoArg) && argsItem.length > 1) {
                quantidade = parseInt(ultimoArg);
                nomeItem = argsItem.slice(0, -1).join(' ');
            }

            if (!nomeItem || nomeItem.trim() === '') {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você precisa dizer qual item dar!\n\n📌 *Exemplo:*\n   !dar @usuario espada de madeira`
                });
            }

            // ============================================================
            // 🔥 CARREGA OS JOGADORES
            // ============================================================
            
            const remetente = new Jogador(remetenteId);
            try {
                await remetente.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Você ainda não tem um perfil!\n📌 Use !perfil para criar.'
                    });
                }
                throw err;
            }

            const destinatario = new Jogador(destinatarioId);
            try {
                await destinatario.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ O jogador mencionado ainda não tem um perfil!'
                    });
                }
                throw err;
            }

            // ============================================================
            // 🔥 BUSCA O ITEM NO INVENTÁRIO DO REMETENTE
            // ============================================================
            
            const itemEncontrado = remetente.inventario.find(item => {
                const info = ITENS_BASE[item.item_id];
                if (!info) return false;
                
                const nomeLimpo = info.nome
                    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
                    .replace(/[\u{2600}-\u{27BF}]/gu, '')
                    .trim()
                    .toLowerCase();
                
                return nomeLimpo === nomeItem.toLowerCase() ||
                       nomeLimpo.includes(nomeItem.toLowerCase());
            });

            if (!itemEncontrado) {
                let texto = `❌ Você não tem "${nomeItem}" no inventário!\n\n`;
                texto += `📦 *Itens disponíveis:*\n`;
                for (const item of remetente.inventario) {
                    const info = ITENS_BASE[item.item_id];
                    texto += `   • ${info?.nome || item.item_id} x${item.quantidade}\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            const infoItem = ITENS_BASE[itemEncontrado.item_id];

            if (quantidade > itemEncontrado.quantidade) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você só tem ${itemEncontrado.quantidade}x ${infoItem.nome}!\n\n📌 Use: !dar @usuario ${nomeItem} ${itemEncontrado.quantidade}`
                });
            }

            if (quantidade <= 0) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Quantidade inválida!'
                });
            }

            // ============================================================
            // 🔥 REALIZA A TRANSFERÊNCIA
            // ============================================================
            
            await remetente.removerItem(itemEncontrado.item_id, quantidade);
            await remetente.salvar();

            await destinatario.adicionarItem(itemEncontrado.item_id, quantidade);
            await destinatario.salvar();

            // ============================================================
            // 🔥 REGISTRA NO HISTÓRICO
            // ============================================================
            
            try {
                await remetente.registrarAcao('doacao', `Deu ${infoItem.nome} x${quantidade} para ${destinatario.dados.nome}`);
                await destinatario.registrarAcao('recebimento_item', `Recebeu ${infoItem.nome} x${quantidade} de ${remetente.dados.nome}`);
            } catch (e) {}

            // ============================================================
            // 🔥 ENVIA A CONFIRMAÇÃO
            // ============================================================
            
            const nomeRemetente = remetente.dados.nome || 'Aventureiro';
            const nomeDestinatario = destinatario.dados.nome || 'Aventureiro';
            const emoji = infoItem.emoji || '📦';

            let texto = `🎁 *ITEM DOADO!*\n\n`;
            texto += `${emoji} **${infoItem.nome}** x${quantidade}\n\n`;
            texto += `👤 *De:* ${nomeRemetente}\n`;
            texto += `👤 *Para:* ${nomeDestinatario}\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `✨ ${nomeDestinatario} recebeu o item!`;

            await sock.sendMessage(remoteJid, { text: texto });

            // 🔥 NOTIFICA O DESTINATÁRIO
            try {
                await sock.sendMessage(destinatarioId, {
                    text: `🎁 *VOCÊ RECEBEU UM PRESENTE!*\n\n` +
                          `${emoji} **${infoItem.nome}** x${quantidade}\n\n` +
                          `👤 *De:* ${nomeRemetente}`
                });
            } catch (e) {}

        } catch (err) {
            console.error("❌ ERRO dar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao dar item: ${err.message}`
            });
        }
    }
};
