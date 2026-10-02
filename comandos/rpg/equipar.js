// comandos/rpg/equipar.js - USANDO O Jogador (QUE JÁ USA SQLITE)
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');
const { 
    slotValidoParaItem, 
    getSlotCorreto, 
    converterSlot, 
    listarSlots, 
    SLOTS_NOMES 
} = require('../../dados/slots');

module.exports = {
    nome: "equipar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // SE NÃO TIVER ARGUMENTOS, MOSTRA ITENS
            if (args.length < 2) {
                const jogador = new Jogador(remetenteId);
                try {
                    await jogador.carregar();
                } catch (err) {
                    if (err.message === 'Jogador não encontrado') {
                        await jogador.criar(msg.pushName || 'Aventureiro');
                        await jogador.carregar();
                    } else {
                        throw err;
                    }
                }

                const itensEquipaveis = jogador.inventario.filter(item => {
                    const info = ITENS_BASE[item.item_id];
                    return info && ['arma', 'escudo', 'capacete', 'peitoral', 'pernas', 'pes', 'acessorio'].includes(info.tipo);
                });

                if (itensEquipaveis.length === 0) {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Você não tem nenhum item equipável!'
                    });
                }

                let texto = '📦 *Itens disponíveis para equipar:*\n\n';
                for (const item of itensEquipaveis) {
                    const info = ITENS_BASE[item.item_id];
                    texto += `• ${info.nome} (x${item.quantidade})\n`;
                }
                texto += '\n📌 *Como usar:*\n';
                texto += '!equipar <nome do item> <slot>\n\n';
                texto += listarSlots();
                texto += '\n📌 *Exemplos:*\n';
                texto += '!equipar Espada de Madeira direita\n';
                texto += '!equipar Capacete de Couro cabeca';

                return sock.sendMessage(remoteJid, { text: texto });
            }

            // EXTRAI NOME E SLOT
            const slotRaw = args[args.length - 1];
            const nomeItem = args.slice(0, -1).join(' ');
            const slot = converterSlot(slotRaw);

            // VALIDA SLOT
            const slotsValidos = ['mao_direita', 'mao_esquerda', 'capacete', 'peitoral', 'pernas', 'pes', 'acessorio1', 'acessorio2'];
            if (!slotsValidos.includes(slot)) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Slot "${slotRaw}" não reconhecido!\n\n${listarSlots()}`
                });
            }

            // CARREGA JOGADOR (USANDO A CLASSE)
            const jogador = new Jogador(remetenteId);
            try {
                await jogador.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    await jogador.criar(msg.pushName || 'Aventureiro');
                    await jogador.carregar();
                } else {
                    throw err;
                }
            }

            // BUSCA ITEM (REMOVE EMOJIS)
            const itemEncontrado = jogador.inventario.find(item => {
                const info = ITENS_BASE[item.item_id];
                if (!info) return false;
                const nomeLimpo = info.nome.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();
                return nomeLimpo.toLowerCase() === nomeItem.toLowerCase();
            });

            if (!itemEncontrado) {
                let texto = `❌ Você não tem "${nomeItem}" no inventário!\n\n`;
                texto += '📌 *Itens disponíveis:*\n';
                for (const item of jogador.inventario) {
                    const info = ITENS_BASE[item.item_id];
                    if (info) {
                        texto += `• ${info.nome} (x${item.quantidade})\n`;
                    }
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            const infoItem = ITENS_BASE[itemEncontrado.item_id];

            // VERIFICA SE É EQUIPÁVEL
            if (!['arma', 'escudo', 'capacete', 'peitoral', 'pernas', 'pes', 'acessorio'].includes(infoItem.tipo)) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ "${infoItem.nome}" não pode ser equipado!`
                });
            }

            // VERIFICA SLOT
            if (!slotValidoParaItem(infoItem.tipo, slot)) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ "${infoItem.nome}" não vai no slot "${slotRaw}"!\nSlot correto: ${getSlotCorreto(infoItem.tipo)}`
                });
            }

            // 🔥 EQUIPA USANDO O JOGADOR (QUE USA SQLITE)
            await jogador.equipar(itemEncontrado.item_id, slot);

            return sock.sendMessage(remoteJid, {
                text: `✅ *${infoItem.nome}* equipado em ${SLOTS_NOMES[slot]}!`
            });

        } catch (error) {
            console.error('Erro no equipar:', error);
            return sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${error.message}`
            });
        }
    }
};
