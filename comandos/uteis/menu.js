// !menu - MENU PRINCIPAL
const path = require('path');
const fs = require('fs');

module.exports = {
    nome: "menu",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const { Jogador } = require("../../servicos/jogador");

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

            const d = jogador.dados;
            const biomaNome = d.bioma === 'eldoria' ? '🌲 Floresta de Eldoria' : d.bioma || 'Desconhecido';
            const areaNome = d.area || 'acampamento';

            const xpPercent = Math.floor((d.xp / d.xp_proximo) * 100);
            const equipamentos = jogador.equipamentos || {};
            const arma = equipamentos.mao_direita ? '✅' : '❌';
            const armadura = equipamentos.peitoral ? '✅' : '❌';

            const totalItens = jogador.inventario.reduce((acc, i) => acc + i.quantidade, 0);

            const texto = `
╔═══════════════════╗
   ⚔️ 𝑨𝑬𝑻𝑯𝑬𝑹𝑰𝑺
   🏰 *RPGBOT* • v1.3
╚═══════════════════╝

╭─「 👤 *${d.nome}* 」
│ ⚔️ ${d.classe || 'Aventureiro'} • ⭐ Nv.${d.nivel}
│ ❤️ ${d.vida}/${d.vida_max}  ⚡ ${d.stamina}/${d.stamina_max}
│ ✨ ${d.xp}/${d.xp_proximo} (${xpPercent}%)
│ 💰 ${d.ouro}  🏦 ${d.banco}  🎒 ${totalItens}
╰──────────────────

╭─「 📍 LOCAL 」
│ 🌍 ${biomaNome}
│ 🗺️ ${areaNome}
╰──────────────────

╭─「 ⚔️ EQUIPS 」
│ 🗡️ ${arma ? '✅' : '❌'}  🛡️ ${armadura ? '✅' : '❌'}
╰──────────────────

╭─「 📜 MENU 」
│ 🌲 !menurpg    💰 !menueco
│ 🎯 !missoes    🧙 !menuia
│ 🎮 !menudiv    🎨 !menumidia
│ 👑 !menuadmin  ⚙️ !menuutils
╰──────────────────

   👑 *Wid Dev*
   📖 !ajuda
`;

            // 🔥 CAMINHO DO VÍDEO (MP4)
            const videoPath = path.join(__dirname, '../../imagens/menu/menu_principal.mp4');

            // 🔥 TENTA ENVIAR O VÍDEO COMO GIF PRIMEIRO
            if (fs.existsSync(videoPath)) {
                try {
                    await sock.sendMessage(remoteJid, {
                        video: fs.readFileSync(videoPath),
                        gifPlayback: true,  // 🔥 TOCA COMO GIF (SEM ÁUDIO)
                        caption: texto
                    });
                    return;
                } catch (err) {
                    console.log('⚠️ Erro ao enviar vídeo, tentando imagem...');
                }
            }

            // 🔥 FALLBACK: IMAGEM ESTÁTICA
            const imagemPath = path.join(__dirname, '../../imagens/menu/menu_principal.png');
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

            // 🔥 FALLBACK FINAL: SÓ TEXTO
            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO menu:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar menu: ${err.message}`
            });
        }
    }
};
