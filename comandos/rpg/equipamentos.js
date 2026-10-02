// comandos/rpg/equipamentos.js - COM STATS
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');
const { SLOTS_NOMES } = require('../../dados/slots');

module.exports = {
    nome: "equipamentos",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            
            try {
                await jogador.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    const nome = msg.pushName || 'Aventureiro';
                    await jogador.criar(nome);
                    await jogador.carregar();
                } else {
                    throw err;
                }
            }

            const equipamentos = jogador.equipamentos || {};
            let texto = '╭━━━ 🛡️ *EQUIPAMENTOS* ━━━╮\n\n';
            let temItem = false;
            let poderTotal = 0;
            let defesaTotal = 0;

            for (const [slot, nomeSlot] of Object.entries(SLOTS_NOMES)) {
                const idItem = equipamentos[slot];
                let nomeItem = '— Vazio —';
                let emojiItem = '⚪';
                let stats = '';

                if (idItem && ITENS_BASE[idItem]) {
                    const info = ITENS_BASE[idItem];
                    nomeItem = info.nome || idItem;
                    emojiItem = info.emoji || '📦';
                    temItem = true;

                    // Pega os stats
                    const poder = info.poder || 0;
                    const defesa = info.defesa || 0;
                    const esquiva = info.esquiva || 0;
                    const critico = info.critico || 0;

                    poderTotal += poder;
                    defesaTotal += defesa;

                    if (poder > 0) stats += ` ⚔️+${poder}`;
                    if (defesa > 0) stats += ` 🛡️+${defesa}`;
                    if (esquiva > 0) stats += ` 💨+${esquiva}`;
                    if (critico > 0) stats += ` 💀+${critico}`;
                }

                texto += `${nomeSlot}: ${emojiItem} ${nomeItem}${stats}\n`;
            }

            texto += '\n━━━━━━━━━━━━━━━━━━━━━\n';
            texto += `📊 *STATS TOTAIS:*\n`;
            texto += `⚔️ Poder: +${poderTotal}\n`;
            texto += `🛡️ Defesa: +${defesaTotal}\n`;

            if (!temItem) {
                texto = '╭━━━ 🛡️ *EQUIPAMENTOS* ━━━╮\n\n';
                texto += '❌ Nenhum item equipado!\n';
                texto += '\n━━━━━━━━━━━━━━━━━━━━━';
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO equipamentos:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao carregar equipamentos."
            });
        }
    }
};
