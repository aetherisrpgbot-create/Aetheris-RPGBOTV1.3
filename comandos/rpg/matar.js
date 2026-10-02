// comandos/rpg/matar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');
const { getDrop } = require('../../dados/biomas/eldoria');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "matar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.tipo !== 'pacifica') {
                return sock.sendMessage(remoteJid, {
                    text: '⚔️ Esta criatura já é hostil! Use !batalhar para lutar.'
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            if (jogador.dados.vida <= 0) {
                batalhasAtivas.delete(remetenteId);
                return sock.sendMessage(remoteJid, {
                    text: '💀 Você está morto! Use !descansar para se recuperar.'
                });
            }

            const criatura = encontro.criatura;

            // Verifica se tem arma equipada
            const armaEquipada = jogador.equipamentos?.mao_direita;
            const temArma = armaEquipada && ['espada_madeira', 'espada_ferro', 'arco', 'faca', 'machado_madeira', 'machado_ferro'].some(a => 
                armaEquipada.includes(a)
            );

            if (!temArma) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você precisa de uma arma para matar!\nEquipe uma faca, arco, machado ou espada.'
                });
            }

            // Confirmação
            if (!args || args[0]?.toLowerCase() !== 'confirmar') {
                let texto = `⚠️ *ATENÇÃO!*\n\n`;
                texto += `Você está prestes a matar ${criatura.nome}.\n`;
                texto += `📝 ${criatura.descricao}\n\n`;
                texto += `❗ *Consequências:*\n`;
                texto += `   • Ganhará pouca experiência\n`;
                texto += `   • Pode dropar itens\n`;
                texto += `   • Criaturas pacíficas podem começar a te evitar\n\n`;
                texto += `📌 *Para confirmar:*\n`;
                texto += `!matar confirmar\n\n`;
                texto += `📌 *Para desistir:*\n`;
                texto += `!passar`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            // Executa o abate
            batalhasAtivas.delete(remetenteId);

            const xpGanho = Math.floor((criatura.drop?.length || 1) * 3) + 2;
            await jogador.adicionarXp(xpGanho);

            let dropTexto = '';
            const drop = getDrop(criatura);
            if (drop) {
                try {
                    await jogador.adicionarItem(drop.item, drop.quantidade);
                } catch (err) {
                    if (err.message.includes('Mochila cheia')) {
                        dropTexto = `\n🎒 ${err.message}`;
                    }
                }
                const info = ITENS_BASE[drop.item];
                if (!dropTexto.includes('Mochila cheia')) {
                    dropTexto = `\n📦 Drop: ${info?.nome || drop.item} x${drop.quantidade}`;
                }
            }

            jogador.dados.stamina = Math.max(0, jogador.dados.stamina - 5);
            await jogador.salvar();

            let texto = `🔪 *ABATE REALIZADO!*\n\n`;
            texto += `✅ Você matou ${criatura.nome}!\n`;
            texto += `⭐ +${xpGanho} XP${dropTexto}\n`;
            texto += `⚡ -5 Stamina\n\n`;
            texto += `🌿 A natureza sente sua falta...`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO matar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao matar: ${err.message}`
            });
        }
    }
};
