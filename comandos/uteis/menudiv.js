// comandos/diversao/menudiv.js - MENU DIVERSÃO COM VÍDEO
const path = require('path');
const fs = require('fs');

module.exports = {
    nome: "menudiv",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╔═══════════════════╗
   🎮 *MENU DIVERSÃO*
   🎲 *ENTRETENIMENTO*
╚═══════════════════╝

╭─「 🎲 SORTE E AZAR 」
│ !dado        → Rolar dado 🎲
│ !moeda       → Cara ou coroa 🪙
│ !8ball       → Pergunta ao destino 🔮
│ !sorteio     → Número ou pessoa 🎯
╰──────────────────

╭─「 🧠 QUIZ 」
│ !pergunta    → Quiz (aceita categoria)
│ !pergunta categorias → Ver categorias
│ !resposta    → Responder quiz
│ !rankquiz    → Ranking do quiz
╰──────────────────

╭─「 🏆 RANKING 」
│ !rankgame    → Ranking geral
│ !rankgame eu → Suas estatísticas
╰──────────────────

╭─「 👥 SOCIAL 」
│ !marcar      → Mencionar todos
╰──────────────────

   👑 *Wid Dev*
   📖 !menu → Menu Principal
`;

        try {
            const videoPath = path.join(__dirname, '../../imagens/menu/menudiv.mp4');

            if (fs.existsSync(videoPath)) {
                try {
                    await sock.sendMessage(remoteJid, {
                        video: fs.readFileSync(videoPath),
                        gifPlayback: true,
                        caption: texto
                    });
                    return;
                } catch (err) {
                    console.log('⚠️ Erro ao enviar vídeo, tentando imagem...');
                }
            }

            const imagemPath = path.join(__dirname, '../../imagens/menu/menudiv.png');
            if (fs.existsSync(imagemPath)) {
                try {
                    await sock.sendMessage(remoteJid, {
                        image: fs.readFileSync(imagemPath),
                        caption: texto
                    });
                    return;
                } catch (err) {
                    console.log('⚠️ Erro ao enviar imagem');
                }
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO menudiv:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar menu: ${err.message}`
            });
        }
    }
};
