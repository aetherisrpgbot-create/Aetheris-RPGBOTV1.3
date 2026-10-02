// !stickertext - CRIA FIGURINHA COM TEXTO
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { criarStickerLegenda } = require("../../utils/helpers");

module.exports = {
    nome: "stickertext",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mediaMsg = quoted?.imageMessage || 
                           quoted?.stickerMessage || 
                           msg.message?.imageMessage ||
                           msg.message?.stickerMessage;

            if (!mediaMsg) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Responda uma *IMAGEM* ou *FIGURINHA*.\n\n📌 !stickertext <texto>\n📌 !stickertext <cor> <texto>"
                });
            }

            const texto = args.join(" ").trim();
            if (!texto) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Digite o texto!\n\nExemplo: !stickertext Olá mundo!"
                });
            }

            let cor = "preto";
            let textoLimpo = texto;
            const cores = ["preto", "branco", "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "cinza", "marrom", "dourado", "ciano", "magenta"];
            const primeiraPalavra = args[0].toLowerCase();
            
            if (cores.includes(primeiraPalavra)) {
                cor = primeiraPalavra;
                textoLimpo = args.slice(1).join(" ").trim();
                if (!textoLimpo) {
                    return sock.sendMessage(remoteJid, {
                        text: "❌ Digite o texto após a cor.\n\nExemplo: !stickertext vermelho Fogo!"
                    });
                }
            }

            const buffer = await downloadMediaMessage(
                { message: quoted || msg.message },
                "buffer",
                {},
                { logger: console }
            );

            if (!buffer) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não consegui baixar a imagem/figurinha."
                });
            }

            const stickerBuffer = await criarStickerLegenda(buffer, textoLimpo, cor);

            await sock.sendMessage(remoteJid, {
                sticker: stickerBuffer
            });

        } catch (err) {
            // 🔥 SILENCIA O ERRO NO CONSOLE E MANDA MENSAGEM GENÉRICA
            console.error("❌ ERRO stickertext:", err);
            
            let mensagemErro = "Erro ao criar figurinha. Tente novamente com outra imagem.";
            
            // Tenta pegar a mensagem do erro sem quebrar
            try {
                if (err && typeof err === 'object' && err.message) {
                    mensagemErro = err.message;
                }
            } catch (e) {
                // Ignora
            }
            
            await sock.sendMessage(remoteJid, {
                text: `❌ ${mensagemErro}`
            });
        }
    }
};
