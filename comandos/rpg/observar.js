// comandos/rpg/observar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');

module.exports = {
    nome: "observar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);
            const criatura = encontro.criatura;

            if (!criatura.acoes || !criatura.acoes.includes('observar')) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode observar ${criatura.nome}.`
                });
            }

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            batalhasAtivas.delete(remetenteId);

            await jogador.adicionarXp(2);
            await jogador.salvar();

            const mensagens = [
                `${criatura.nome} parece estar em paz.`,
                `${criatura.nome} te observa de volta.`,
                `${criatura.nome} continua sua vida normalmente.`,
                `${criatura.nome} parece confiar em você.`,
                `${criatura.nome} está cuidando de seus afazeres.`
            ];

            const msg = mensagens[Math.floor(Math.random() * mensagens.length)];

            return sock.sendMessage(remoteJid, {
                text: `👀 *OBSERVANDO...*\n\n${msg}\n\n⭐ +2 XP`
            });

        } catch (err) {
            console.error("❌ ERRO observar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao observar: ${err.message}`
            });
        }
    }
};
