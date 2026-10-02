// comandos/rpg/biomas.js
const { ELDORIA } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "biomas",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const bioma = ELDORIA;

            let texto = `🌍 *BIOMAS DISPONÍVEIS*\n\n`;
            texto += `${bioma.nome}\n`;
            texto += `📝 ${bioma.descricao}\n`;
            texto += `📊 ✅ Disponível\n`;
            texto += `🏷️ ID: !viajar ${bioma.id}\n\n`;
            
            texto += `🗺️ *Áreas:*\n`;
            for (const area of bioma.areas) {
                texto += `   • ${area.nome} (Nv.${area.nivel_necessario})\n`;
            }

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO biomas:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao listar biomas: ${err.message}`
            });
        }
    }
};
