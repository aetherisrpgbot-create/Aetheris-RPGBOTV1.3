// comandos/rpg/vender.js - SISTEMA DE VENDAS
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');
const { getPreco, getPrecoTotal, PRECOS } = require('../../dados/precos');

module.exports = {
    nome: "vender",
    alias: ["sell", "venda"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // ============================================================
            // 🔥 SE NÃO TIVER ARGUMENTO → MOSTRA AJUDA
            // ============================================================
            
            if (!args || args.length === 0) {
                let texto = `💰 *SISTEMA DE VENDAS*\n\n`;
                texto += `📌 *Como usar:*\n`;
                texto += `   !vender <item> → Vende 1 unidade\n`;
                texto += `   !vender <item> <qtd> → Vende X unidades\n`;
                texto += `   !vender tudo → Vende tudo\n`;
                texto += `   !precos → Ver tabela de preços\n\n`;
                
                // Mostra itens que o jogador pode vender
                const itensVendaveis = jogador.inventario.filter(item => {
                    return PRECOS[item.item_id] > 0;
                });
                
                if (itensVendaveis.length === 0) {
                    texto += `❌ Você não tem itens vendáveis!\n`;
                    texto += `📌 Use !coletar para conseguir itens.`;
                } else {
                    texto += `📦 *Itens que você pode vender:*\n`;
                    for (const item of itensVendaveis) {
                        const info = ITENS_BASE[item.item_id];
                        const emoji = info?.emoji || '📦';
                        const nome = info?.nome || item.item_id;
                        const preco = PRECOS[item.item_id];
                        const total = preco * item.quantidade;
                        
                        texto += `   ${emoji} ${nome}\n`;
                        texto += `      💰 ${preco} cada (x${item.quantidade} = 💰 ${total})\n`;
                    }
                }
                
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 VENDER TUDO
            // ============================================================
            
            if (args[0].toLowerCase() === 'tudo' || args[0].toLowerCase() === 'all') {
                let totalOuro = 0;
                let itensVendidos = 0;
                let detalhes = [];
                
                for (const item of [...jogador.inventario]) {
                    const preco = PRECOS[item.item_id];
                    if (!preco || preco <= 0) continue;
                    
                    const ouroItem = preco * item.quantidade;
                    totalOuro += ouroItem;
                    itensVendidos += item.quantidade;
                    
                    const info = ITENS_BASE[item.item_id];
                    const emoji = info?.emoji || '📦';
                    const nome = info?.nome || item.item_id;
                    detalhes.push(`   ${emoji} ${nome} x${item.quantidade} → 💰 ${ouroItem}`);
                    
                    // Remove do inventário
                    await jogador.removerItem(item.item_id, item.quantidade);
                }
                
                if (itensVendidos === 0) {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Você não tem itens vendáveis!'
                    });
                }
                
                // Adiciona ouro
                await jogador.adicionarOuro(totalOuro);
                await jogador.salvar();
                
                let texto = `💰 *VENDA TOTAL!*\n\n`;
                texto += detalhes.join('\n');
                texto += `\n\n━━━━━━━━━━━━━━━━━━━━━`;
                texto += `\n📦 Itens vendidos: ${itensVendidos}`;
                texto += `\n💰 Ouro ganho: +${totalOuro}`;
                texto += `\n💰 Ouro atual: ${jogador.dados.ouro}`;
                
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 VENDER ITEM ESPECÍFICO
            // ============================================================
            
            // Pega o nome do item (tudo menos o último se for número)
            let nomeItem = args.join(' ');
            let quantidade = 1;
            
            // Verifica se o último argumento é um número
            const ultimoArg = args[args.length - 1];
            if (!isNaN(ultimoArg) && args.length > 1) {
                quantidade = parseInt(ultimoArg);
                nomeItem = args.slice(0, -1).join(' ');
            }
            
            // 🔥 BUSCA O ITEM NO INVENTÁRIO (PELO NOME)
            const itemEncontrado = jogador.inventario.find(item => {
                const info = ITENS_BASE[item.item_id];
                if (!info) return false;
                
                // Remove emojis e compara
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
                    if (info && PRECOS[item.item_id] > 0) {
                        texto += `   • ${info.nome} x${item.quantidade}\n`;
                    }
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }
            
            const infoItem = ITENS_BASE[itemEncontrado.item_id];
            const precoItem = PRECOS[itemEncontrado.item_id];
            
            // Verifica se o item é vendável
            if (!precoItem || precoItem <= 0) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *${infoItem.nome}* não pode ser vendido!`
                });
            }
            
            // Verifica se tem quantidade suficiente
            if (quantidade > itemEncontrado.quantidade) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você só tem ${itemEncontrado.quantidade}x ${infoItem.nome}!\n\n📌 Use: !vender ${nomeItem} ${itemEncontrado.quantidade}`
                });
            }
            
            if (quantidade <= 0) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Quantidade inválida!`
                });
            }
            
            // Calcula o ouro
            const ouroGanho = precoItem * quantidade;
            
            // Remove do inventário
            await jogador.removerItem(itemEncontrado.item_id, quantidade);
            
            // Adiciona ouro
            await jogador.adicionarOuro(ouroGanho);
            await jogador.salvar();
            
            // Mensagem de sucesso
            const emoji = infoItem.emoji || '📦';
            let texto = `💰 *VENDA REALIZADA!*\n\n`;
            texto += `${emoji} **${infoItem.nome}** x${quantidade}\n`;
            texto += `💰 Preço unitário: ${precoItem}\n`;
            texto += `💰 Total: +${ouroGanho} ouro\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━`;
            texto += `\n💰 Ouro atual: ${jogador.dados.ouro}`;
            
            return sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO vender:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao vender: ${err.message}`
            });
        }
    }
};
