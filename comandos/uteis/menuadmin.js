// comandos/admin/menuadmin.js - MENU ADMIN COM VÍDEO
const path = require('path');
const fs = require('fs');

module.exports = {
    nomes: [ "menuadmin", "menuadm"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {

const texto = `
╔═══════════════════╗
   ⚙️ *MENU ADMIN*
   🛡️ *MODERAÇÃO* • v1.3
╚═══════════════════╝

╭─「 🗑️ MENSAGENS 」
│ !apagar        → Apagar mensagem
│ !limpargrupo   → Limpar mensagens
╰──────────────────

╭─「 👥 GRUPO 」
│ !abrir         → Abrir grupo
│ !fechar        → Fechar grupo
│ !idgrupo       → Ver ID do grupo
│ !marcar        → Marcar todos
╰──────────────────

╭─「 🎯 USUÁRIOS 」
│ !ban           → Banir usuário
│ !promover      → Tornar admin
│ !rebaixar      → Remover admin
│ !mute          → Silenciar
│ !unmute        → Dessilenciar
│ !addgrupo      → Adicionar ao grupo
│ !remgrupo      → Remover do grupo
╰──────────────────

╭─「 ⚠️ ADVERTÊNCIAS 」
│ !adv           → Dar advertência
│ !consultadv    → Consultar adv
│ !rankadv       → Ranking de adv
│ !limparadv     → Limpar advertências
╰──────────────────

╭─「 👑 ADMINS DO BOT 」
│ !addadmin      → Adicionar admin
│ !rmadmin       → Remover admin
╰──────────────────

╭─「 🔧 SISTEMA 」
│ !statusbot     → Status do bot
│ !backup        → Backup do banco
│ !manutencao    → Modo manutenção
│ !resetmissoes  → Resetar missões
│ !antiviewonce  → Anti view-once
╰──────────────────

   👑 *Wid Dev*
   📖 !menu → Menu Principal
`;


        try {
            // 🔥 CAMINHO DO VÍDEO
            const videoPath = path.join(__dirname, '../../imagens/menu/menuadmin.mp4');

            // 🔥 TENTA ENVIAR O VÍDEO COMO GIF
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

            // 🔥 FALLBACK: IMAGEM
            const imagemPath = path.join(__dirname, '../../imagens/menu/menuadmin.png');
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
            console.error("❌ ERRO menuadmin:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar menu: ${err.message}`
            });
        }
    }
};
