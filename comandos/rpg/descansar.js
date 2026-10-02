// comandos/rpg/descansar.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "descansar",
    executar: async (sock, msg, args, remetenteId, remoteJid, isGroup) => {
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

            await jogador.descansar();

            const vida = jogador.dados.vida;
            const mana = jogador.dados.mana;
            const stamina = jogador.dados.stamina;

            await sock.sendMessage(remoteJid, {
                text: `⛺ *Você descansou!*

❤️ Vida: ${vida}/${jogador.dados.vida_max}
💧 Mana: ${mana}/${jogador.dados.mana_max}
⚡ Stamina: ${stamina}/${jogador.dados.stamina_max}

💤 Continue sua jornada, aventureiro!`
            });

        } catch (err) {
            console.error("❌ ERRO descansar:", err);
            await sock.sendMessage(remoteJid, {
                text: "❌ Erro ao descansar."
            });
        }
    }
};
