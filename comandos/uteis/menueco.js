// comandos/uteis/menueco.js - MENU DE ECONOMIA COM VÍDEO
const path = require('path');
const fs = require('fs');

module.exports = {
    nome: "menueco",
    alias: ["menueconomia", "menudinheiro"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╔═══════════════════╗
   💰 *MENU ECONOMIA*
   🏰 *AETHERIS* • v1.3
╚═══════════════════╝

╭─「 💰 SEU DINHEIRO 」
│ !saldo       → Ver seu ouro
│ !banco       → Ver seu banco
│ !depositar   → Depositar no banco
│ !sacar       → Sacar do banco
╰──────────────────

╭─「 💼 GANHAR OURO 」
│ !trabalhar   → Trabalhar
│ !vender      → Vender itens
│ !vender tudo → Vender TUDO
│ !precos      → Ver preços
│ !roubar      → Roubar jogador
╰──────────────────

╭─「 💸 TRANSFERIR 」
│ !pagar @user <qtd> → Pagar alguém
│ !pix @user <qtd>   → Atalho de pagar
╰──────────────────

╭─「 ⚡ ENERGIA 」
│ !descansar   → Recuperar stamina
╰──────────────────

   👑 *Wid Dev*
   📖 !menu → Menu Principal
`;

        try {
            // 🔥 CAMINHO DO VÍDEO
            const videoPath = path.join(__dirname, '../../imagens/menu/menueco.mp4');

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

            // Fallback: imagem
            const imagemPath = path.join(__dirname, '../../imagens/menu/menueco.png');
            if (fs.existsSync(imagemPath)) {
                try {
                    await sock.sendMessage(remoteJid, {
                        image: fs.readFileSync(imagemPath),
                        caption: texto
                    });
                    return;
                } catch (err) {}
            }

            // Fallback final: texto
            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO menueco:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar menu: ${err.message}`
            });
        }
    }
};
