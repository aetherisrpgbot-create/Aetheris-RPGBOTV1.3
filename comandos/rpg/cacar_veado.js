// comandos/rpg/cacar_veado.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('./cacar');
const { getDrop } = require('../../dados/biomas/eldoria');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "cacar_veado",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.criatura.id !== 'veado') {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você só pode caçar veados!'
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // Verifica se tem arma equipada
            const armaEquipada = jogador.equipamentos?.mao_direita;
            const temArma = armaEquipada && ['espada_madeira', 'espada_ferro', 'arco', 'faca'].some(a => 
                armaEquipada.includes(a)
            );

            if (!temArma) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você precisa de uma arma para caçar o veado!\nEquipe uma faca, arco ou espada.'
                });
            }

            // Chance de acertar (70%)
            if (Math.random() < 0.7) {
                const drop = getDrop(encontro.criatura);
                if (drop) {
                    await jogador.adicionarItem(drop.item, drop.quantidade);
                    const info = ITENS_BASE[drop.item];
                    
                    // Ganha XP
                    await jogador.adicionarXp(15);
                    
                    batalhasAtivas.delete(remetenteId);
                    await jogador.salvar();
                    
                    return sock.sendMessage(remoteJid, {
                        text: `🏹 *CAÇOU O VEADO!*\n\n✅ Você abateu o veado!\n📦 ${info?.nome || drop.item} x${drop.quantidade}\n⭐ +15 XP`
                    });
                }
            }

            batalhasAtivas.delete(remetenteId);
            await jogador.salvar();

            return sock.sendMessage(remoteJid, {
                text: '🦌 O veado escapou! Foi muito rápido...'
            });

        } catch (err) {
            console.error("❌ ERRO cacar_veado:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao caçar veado: ${err.message}`
            });
        }
    }
};
