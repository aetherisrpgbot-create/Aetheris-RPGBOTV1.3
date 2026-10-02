// comandos/rpg/menurpg.js - MENU RPG COM VÍDEO
const path = require('path');
const fs = require('fs');

module.exports = {
    nome: "menurpg",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        const texto = `
╔═══════════════════╗
   ⚔️ *MENU RPG*
   🏰 *AETHERIS* • v1.3
╚═══════════════════╝

╭─「 🌍 EXPLORAÇÃO 」
│ !explorar    → Explorar áreas
│ !bioma       → Ver bioma atual
│ !biomas      → Listar biomas
│ !locate      → Localização exata
│ !viajar      → Viajar entre biomas
╰──────────────────

╭─「 ⚔️ COMBATE 」
│ !cacar       → Caçar criaturas
│ !batalhar    → Iniciar batalha
│ !atacar      → Ataque básico
│ !golpe       → Golpe especial (+50%)
│ !combo       → Combo (+150%)
│ !defender    → Se defender
│ !fugir       → Tentar fugir
│ !passar      → Passar reto
╰──────────────────

╭─「 🌿 COLETA E CRAFT 」
│ !coletar     → Coletar recursos
│ !coletar lista → Ver recursos
│ !craftar     → Ver receitas
│ !craftar <item> → Craftar item
╰──────────────────

╭─「 🎒 INVENTÁRIO 」
│ !perfil      → Ver perfil
│ !inventario  → Ver inventário
│ !equipamentos → Ver equipamentos
│ !equipar     → Equipar item
│ !desequipar  → Desequipar item
╰──────────────────

╭─「 🐾 CRIATURAS 」
│ !ordenhar    → Ordenhar vaca
│ !coletarovos → Coletar ovos
│ !capturar    → Capturar coelho
│ !matar       → Abater criatura
╰──────────────────

╭─「 📜 PROGRESSO 」
│ !missoes     → Ver missões
│ !conquistas  → Ver conquistas
│ !falar       → Falar com NPC
╰──────────────────

   👑 *Wid Dev*
   📖 !menu → Menu Principal
`;

        try {
            // 🔥 CAMINHO DO VÍDEO
            const videoPath = path.join(__dirname, '../../imagens/menu/menurpg.mp4');

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
            const imagemPath = path.join(__dirname, '../../imagens/menu/menurpg.png');
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
            console.error("❌ ERRO menurpg:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar menu: ${err.message}`
            });
        }
    }
};
