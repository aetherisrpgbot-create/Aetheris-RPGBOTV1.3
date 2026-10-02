// comandos/rpg/ordenhar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');
const { getDrop } = require('../../dados/biomas/eldoria');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "ordenhar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.criatura.id !== 'vaca') {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você só pode ordenhar vacas!'
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const drop = getDrop(encontro.criatura);
            if (drop) {
                try {
                    await jogador.adicionarItem(drop.item, drop.quantidade);
                } catch (err) {
                    if (err.message.includes('Mochila cheia')) {
                        return sock.sendMessage(remoteJid, {
                            text: `🎒 ${err.message}`
                        });
                    }
                    throw err;
                }
                const info = ITENS_BASE[drop.item];
                
                batalhasAtivas.delete(remetenteId);
                
                return sock.sendMessage(remoteJid, {
                    text: `🐄 *ORDENHOU A VACA!*\n\n✅ Você obteve:\n📦 ${info?.nome || drop.item} x${drop.quantidade}`
                });
            }

            return sock.sendMessage(remoteJid, {
                text: '🐄 A vaca não deu leite agora... Tente novamente mais tarde.'
            });

        } catch (err) {
            console.error("❌ ERRO ordenhar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao ordenhar: ${err.message}`
            });
        }
    }
};
