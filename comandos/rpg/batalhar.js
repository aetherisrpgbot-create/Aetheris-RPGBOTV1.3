// comandos/rpg/batalhar.js
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');

module.exports = {
    nome: "batalhar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🔥 VERIFICA SE ESTÁ EM UM ENCONTRO
            // ============================================================
            if (!batalhasAtivas.has(remetenteId)) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você não está em um encontro! Use !cacar para caçar.'
                });
            }

            const encontro = batalhasAtivas.get(remetenteId);

            if (encontro.tipo === 'pacifica') {
                return sock.sendMessage(remoteJid, {
                    text: `🌿 ${encontro.criatura.nome} é uma criatura pacífica! Use !matar se quiser abater.`
                });
            }

            // ============================================================
            // 🔥 SE JÁ ESTIVER EM BATALHA (turno > 0)
            // ============================================================
            if (encontro.turno > 0) {
                return sock.sendMessage(remoteJid, {
                    text: `⚔️ Você já está em batalha contra ${encontro.criatura.nome}! Use !atacar, !defender ou !fugir.`
                });
            }

            // ============================================================
            // 🔥 CARREGA JOGADOR
            // ============================================================
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            if (jogador.dados.vida <= 0) {
                batalhasAtivas.delete(remetenteId);
                return sock.sendMessage(remoteJid, {
                    text: '💀 Você está morto! Use !descansar para se recuperar.'
                });
            }

            // ============================================================
            // 🔥 MARCA QUE A BATALHA COMEÇOU
            // ============================================================
            encontro.turno = 1;
            batalhasAtivas.set(remetenteId, encontro);

            const criatura = encontro.criatura;

            let texto = `⚔️ *BATALHA INICIADA!*\n\n`;
            texto += `👾 **${criatura.nome}**\n`;
            texto += `❤️ Vida: ${criatura.vida}\n`;
            texto += `⚔️ Poder: ${criatura.poder}\n`;
            texto += `🛡️ Defesa: ${criatura.defesa}\n`;
            texto += `⭐ XP: ${criatura.xp}\n`;
            texto += `💰 Ouro: ${criatura.ouro}\n\n`;
            texto += `📌 *Ações:*\n`;
            texto += `!atacar - Ataque básico\n`;
            texto += `!golpe - Golpe especial (+50% dano, 10 stamina)\n`;
            texto += `!combo - Combo de 3 golpes (+150% dano, 15 stamina)\n`;
            texto += `!defender - Se defender\n`;
            texto += `!fugir - Tentar fugir`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO batalhar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao iniciar batalha: ${err.message}`
            });
        }
    }
};
