// comandos/rpg/mochila.js
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "mochila",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const espaco = await jogador.verificarEspaco();
            
            // Conta itens por tipo
            const tipos = {};
            for (const item of jogador.inventario) {
                if (!tipos[item.item_id]) {
                    tipos[item.item_id] = 0;
                }
                tipos[item.item_id] += item.quantidade;
            }

            let texto = `╭━━━ 🎒 *MOCHILA* ━━━╮\n\n`;
            texto += `📦 Slots: ${espaco.usados}/${espaco.slots}\n`;
            texto += `📦 Disponível: ${espaco.disponivel}\n`;
            texto += `📦 Máx por slot: ${espaco.max_por_slot} itens\n\n`;
            
            texto += `📋 *Itens guardados:*\n`;
            const itensOrdenados = Object.entries(tipos).sort((a, b) => {
                const infoA = ITENS_BASE[a[0]];
                const infoB = ITENS_BASE[b[0]];
                return (infoA?.nome || a[0]).localeCompare(infoB?.nome || b[0]);
            });
            
            if (itensOrdenados.length === 0) {
                texto += `   🎒 Vazia...\n`;
            } else {
                for (const [id, qtd] of itensOrdenados) {
                    const info = ITENS_BASE[id];
                    const emoji = info?.emoji || '📦';
                    const nome = info?.nome || id;
                    const slotsUsados = Math.ceil(qtd / 32);
                    texto += `   ${emoji} ${nome} x${qtd} (${slotsUsados} slot${slotsUsados > 1 ? 's' : ''})\n`;
                }
            }

            texto += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
            
            const niveis = {
                1: { slots: 10, custo: 500 },
                2: { slots: 15, custo: 1000 },
                3: { slots: 20, custo: 2000 },
                4: { slots: 30, custo: 5000 },
                5: { slots: 40, custo: 10000 },
                6: { slots: 60, custo: 10000 }
            };
            
            const nivelAtual = jogador.mochila.nivel || 1;
            const proximo = niveis[nivelAtual + 1];
            if (proximo) {
                texto += `🔄 Próximo nível: ${proximo.slots} slots\n`;
                texto += `💰 Custo: ${proximo.custo} ouro\n`;
                texto += `📌 Use !upgrademochila`;
            } else {
                texto += `⭐ Mochila no nível máximo!`;
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO mochila:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar mochila: ${err.message}`
            });
        }
    }
};
