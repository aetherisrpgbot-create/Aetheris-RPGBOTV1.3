// comandos/rpg/capturar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');
const { getDrop } = require('../../dados/biomas/eldoria');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "capturar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.criatura.id !== 'coelho') {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você só pode capturar coelhos!'
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // Chance de capturar (60%)
            if (Math.random() < 0.6) {
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
                        text: `🐇 *CAPTUROU O COELHO!*\n\n✅ Você obteve:\n📦 ${info?.nome || drop.item} x${drop.quantidade}`
                    });
                }
            }

            batalhasAtivas.delete(remetenteId);
            return sock.sendMessage(remoteJid, {
                text: '🐇 O coelho escapou! Foi rápido demais...'
            });

        } catch (err) {
            console.error("❌ ERRO capturar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao capturar: ${err.message}`
            });
        }
    }
};
