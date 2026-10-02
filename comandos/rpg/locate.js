// comandos/rpg/locate.js
const { Jogador } = require('../../servicos/jogador');
const { ELDORIA, getArea, getCriaturasPorArea } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "locate",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const bioma = ELDORIA;
            const areaId = jogador.dados.area || 'acampamento';
            const area = getArea(areaId);
            const areaNome = area ? area.nome : areaId;

            const criaturas = getCriaturasPorArea(areaId);
            const pacificas = criaturas.filter(c => c.tipo === 'pacifica');
            const hostis = criaturas.filter(c => c.tipo === 'hostil');

            const d = jogador.dados;
            const xpPercent = Math.floor((d.xp / d.xp_proximo) * 100);

            let texto = `📍 *LOCALIZAÇÃO EXATA*\n\n`;
            texto += `🌍 **Bioma:** ${bioma.nome}\n`;
            texto += `🗺️ **Área:** ${areaNome}\n`;
            texto += `📌 **ID da Área:** ${areaId}\n\n`;
            texto += `📊 **Status do Jogador:**\n`;
            texto += `   👤 Nome: ${d.nome}\n`;
            texto += `   ⭐ Nível: ${d.nivel}\n`;
            texto += `   📈 XP: ${d.xp}/${d.xp_proximo} (${xpPercent}%)\n`;
            texto += `   ❤️ Vida: ${d.vida}/${d.vida_max}\n`;
            texto += `   ⚡ Stamina: ${d.stamina}/${d.stamina_max}\n`;
            texto += `   💰 Ouro: ${d.ouro}\n\n`;
            texto += `🐾 **Criaturas na área:**\n`;
            if (pacificas.length > 0) {
                texto += `   🌿 Pacificas: ${pacificas.map(c => c.nome).join(', ')}\n`;
            }
            if (hostis.length > 0) {
                texto += `   ⚔️ Hostis: ${hostis.map(c => c.nome).join(', ')}\n`;
            }
            if (pacificas.length === 0 && hostis.length === 0) {
                texto += `   • Nenhuma criatura nesta área.\n`;
            }

            texto += `\n📌 *Comandos úteis:*\n`;
            texto += `   • !explorar - Explorar áreas\n`;
            texto += `   • !cacar - Caçar criaturas\n`;
            texto += `   • !bioma - Ver informações do bioma`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO locate:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao buscar localização: ${err.message}`
            });
        }
    }
};
