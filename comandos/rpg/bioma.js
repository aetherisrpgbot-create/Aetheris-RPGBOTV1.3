// comandos/rpg/bioma.js
const { Jogador } = require('../../servicos/jogador');
const { ELDORIA, getArea, getAreaNome } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "bioma",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const areaId = jogador.dados.area || 'acampamento';
            const area = getArea(areaId);
            const bioma = ELDORIA;

            let texto = `📍 *${bioma.nome}*\n\n`;
            texto += `📝 ${bioma.descricao}\n\n`;
            texto += `📍 *Área atual:* ${area ? area.nome : areaId}\n`;
            texto += `🎯 Nível necessário: ${bioma.nivel_necessario}\n\n`;
            
            texto += `🗺️ *Áreas disponíveis:*\n`;
            for (const a of bioma.areas) {
                const disponivel = jogador.dados.nivel >= a.nivel_necessario ? '✅' : `🔒 (Nv.${a.nivel_necessario})`;
                const atual = a.id === areaId ? ' 👈' : '';
                texto += `   ${disponivel} ${a.nome}${atual}\n`;
            }

            texto += `\n📌 *Comandos:*\n`;
            texto += `   • !explorar - Explorar áreas\n`;
            texto += `   • !cacar - Caçar criaturas\n`;
            texto += `   • !coletar - Coletar recursos`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO bioma:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar bioma: ${err.message}`
            });
        }
    }
};
