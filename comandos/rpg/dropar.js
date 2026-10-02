// comandos/rpg/dropar.js - JOGAR ITEM FORA
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nomes: ["dropar", "drop", "jogar", "jogarfora", "descartar", "lixo", "deletar"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // ============================================================
            // 🔥 SE NÃO TIVER ARGUMENTO → MOSTRA AJUDA
            // ============================================================
            
            if (!args || args.length === 0) {
                let texto = `🗑️ *SISTEMA DE DROP*\n\n`;
                texto += `📌 *Como usar:*\n`;
                texto += `   !dropar <item> → Joga 1 unidade fora\n`;
                texto += `   !dropar <item> <qtd> → Joga X unidades fora\n`;
                texto += `   !dropar tudo → Joga TUDO fora\n\n`;
                texto += `⚠️ *ATENÇÃO:* Não tem volta!\n\n`;
                
                if (jogador.inventario.length === 0) {
                    texto += `❌ Seu inventário está vazio!`;
                } else {
                    texto += `📦 *Seu inventário:*\n`;
                    for (const item of jogador.inventario) {
                        const info = ITENS_BASE[item.item_id];
                        const emoji = info?.emoji || '📦';
                        const nome = info?.nome || item.item_id;
                        texto += `   ${emoji} ${nome} x${item.quantidade}\n`;
                    }
                }
                
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 DROPAR TUDO
            // ============================================================
            
            if (args[0].toLowerCase() === 'tudo' || args[0].toLowerCase() === 'all') {
                if (jogador.inventario.length === 0) {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Seu inventário já está vazio!'
                    });
                }

                let totalItens = 0;
                let detalhes = [];

                for (const item of [...jogador.inventario]) {
                    const info = ITENS_BASE[item.item_id];
                    const emoji = info?.emoji || '📦';
                    const nome = info?.nome || item.item_id;
                    
                    detalhes.push(`   ${emoji} ${nome} x${item.quantidade}`);
                    totalItens += item.quantidade;
                    
                    await jogador.removerItem(item.item_id, item.quantidade);
                }

                await jogador.salvar();

                let texto = `🗑️ *DROP TOTAL!*\n\n`;
                texto += detalhes.join('\n');
                texto += `\n\n━━━━━━━━━━━━━━━━━━━━━`;
                texto += `\n📦 Itens descartados: ${totalItens}`;
                texto += `\n💔 Tudo foi perdido...`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 DROPAR ITEM ESPECÍFICO
            // ============================================================
            
            let nomeItem = args.join(' ');
            let quantidade = 1;

            // Verifica se o último argumento é número
            const ultimoArg = args[args.length - 1];
            if (!isNaN(ultimoArg) && args.length > 1) {
                quantidade = parseInt(ultimoArg);
                nomeItem = args.slice(0, -1).join(' ');
            }

            // Busca o item (com normalizador)
            const itemEncontrado = jogador.inventario.find(item => {
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
                for (const item of jogador.inventario) {
                    const info = ITENS_BASE[item.item_id];
                    texto += `   • ${info?.nome || item.item_id} x${item.quantidade}\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            const infoItem = ITENS_BASE[itemEncontrado.item_id];

            // Verifica quantidade
            if (quantidade > itemEncontrado.quantidade) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você só tem ${itemEncontrado.quantidade}x ${infoItem.nome}!\n\n📌 Use: !dropar ${nomeItem} ${itemEncontrado.quantidade}`
                });
            }

            if (quantidade <= 0) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Quantidade inválida!'
                });
            }

            // Remove do inventário
            await jogador.removerItem(itemEncontrado.item_id, quantidade);
            await jogador.salvar();

            const emoji = infoItem.emoji || '📦';
            let texto = `🗑️ *ITEM DESCARTADO!*\n\n`;
            texto += `${emoji} **${infoItem.nome}** x${quantidade}\n\n`;
            texto += `💔 O item foi perdido para sempre...`;

            return sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO dropar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao dropar: ${err.message}`
            });
        }
    }
};
