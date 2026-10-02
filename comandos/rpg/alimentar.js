// comandos/rpg/alimentar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');

module.exports = {
    nome: "alimentar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);
            const criatura = encontro.criatura;

            if (!criatura.acoes || !criatura.acoes.includes('alimentar')) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode alimentar ${criatura.nome}.`
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // Verifica se tem comida no inventário
            const temComida = jogador.inventario.some(item => 
                item.item_id === 'carne' || item.item_id === 'ovo' || item.item_id === 'leite'
            );

            if (!temComida) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não tem comida para oferecer! (carne, ovos ou leite)'
                });
            }

            // Remove uma comida
            const comida = jogador.inventario.find(item => 
                item.item_id === 'carne' || item.item_id === 'ovo' || item.item_id === 'leite'
            );
            await jogador.removerItem(comida.item_id, 1);

            batalhasAtivas.delete(remetenteId);

            await jogador.adicionarXp(5);
            await jogador.salvar();

            const mensagens = [
                `${criatura.nome} comeu sua comida e parece feliz!`,
                `${criatura.nome} agradeceu com um olhar.`,
                `${criatura.nome} comeu e ficou por perto.`
            ];

            const msg = mensagens[Math.floor(Math.random() * mensagens.length)];

            return sock.sendMessage(remoteJid, {
                text: `🍽️ *ALIMENTOU!*\n\n${msg}\n⭐ +5 XP`
            });

        } catch (err) {
            console.error("❌ ERRO alimentar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao alimentar: ${err.message}`
            });
        }
    }
};
