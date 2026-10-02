// comandos/rpg/perfil.js
const { Jogador } = require('../../servicos/jogador');
const { getAreaNome } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "perfil",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const d = jogador.dados;
            const areaNome = getAreaNome(d.area || 'acampamento');
            const xpPercent = Math.floor((d.xp / d.xp_proximo) * 100);
            const totalItens = jogador.inventario.reduce((acc, i) => acc + i.quantidade, 0);

            let texto = `╭━━━ 👤 *PERFIL* ━━━╮\n\n`;
            texto += `👤 **${d.nome}**\n`;
            texto += `🏷️ Classe: ${d.classe || 'Aventureiro'}\n`;
            texto += `⭐ Nível: ${d.nivel}\n`;
            texto += `📊 XP: ${d.xp}/${d.xp_proximo} (${xpPercent}%)\n`;
            texto += `❤️ Vida: ${d.vida}/${d.vida_max}\n`;
            texto += `💙 Mana: ${d.mana}/${d.mana_max}\n`;
            texto += `⚡ Stamina: ${d.stamina}/${d.stamina_max}\n`;
            texto += `💰 Ouro: ${d.ouro}\n`;
            texto += `🏦 Banco: ${d.banco}\n`;
            texto += `📦 Itens: ${totalItens}\n\n`;
            texto += `📍 Localização: ${areaNome}\n`;
            texto += `🌍 Bioma: ${d.bioma || 'eldoria'}\n\n`;
            texto += `⚔️ Poder: ${d.poder}\n`;
            texto += `🛡️ Defesa: ${d.defesa}\n`;
            texto += `💀 Crítico: ${d.critico}%\n`;
            texto += `💨 Esquiva: ${d.esquiva}%\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO perfil:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar perfil: ${err.message}`
            });
        }
    }
};
