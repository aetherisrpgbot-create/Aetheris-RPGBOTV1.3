// comandos/rpg/espantar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');

module.exports = {
    nome: "espantar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);
            const criatura = encontro.criatura;

            if (!criatura.acoes || !criatura.acoes.includes('espantar')) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode espantar ${criatura.nome}.`
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            batalhasAtivas.delete(remetenteId);

            let dropTexto = '';
            if (Math.random() < 0.3) {
                try {
                    await jogador.adicionarItem('pena', 1);
                    dropTexto = '\n📦 Drop: 🪶 Pena x1';
                } catch (err) {
                    if (err.message.includes('Mochila cheia')) {
                        dropTexto = `\n🎒 ${err.message}`;
                    }
                }
            }

            await jogador.salvar();

            return sock.sendMessage(remoteJid, {
                text: `🕊️ *ESPANTOU!*\n\n${criatura.nome} voou para longe!${dropTexto}`
            });

        } catch (err) {
            console.error("❌ ERRO espantar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao espantar: ${err.message}`
            });
        }
    }
};
