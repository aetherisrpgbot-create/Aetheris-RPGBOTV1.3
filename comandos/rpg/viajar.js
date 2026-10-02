// comandos/rpg/viajar.js
const { Jogador } = require('../../servicos/jogador');
const { ELDORIA, getArea } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "viajar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            if (!args || args.length === 0) {
                const areaId = jogador.dados.area || 'acampamento';
                const area = getArea(areaId);
                const bioma = ELDORIA;

                let texto = `📍 *Você está em:*\n\n`;
                texto += `${bioma.nome}\n`;
                texto += `📍 Área: ${area ? area.nome : areaId}\n`;
                texto += `📝 ${bioma.descricao}\n\n`;
                texto += `📌 *Use:* !viajar <bioma> para viajar\n\n`;
                texto += `🌍 *Biomas disponíveis:*\n`;
                texto += `   • ${bioma.nome} (${bioma.id})`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            const destinoId = args[0].toLowerCase();

            if (destinoId !== 'eldoria') {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Bioma "${destinoId}" não encontrado!\n\n🌍 *Biomas disponíveis:*\n   • 🌲 Floresta de Eldoria (eldoria)`
                });
            }

            const bioma = ELDORIA;
            const areaId = jogador.dados.area || 'acampamento';
            const areaAnterior = getArea(areaId);

            if (jogador.dados.stamina < 10) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você está muito cansado para viajar! Descanse com !descansar'
                });
            }

            jogador.dados.bioma = destinoId;
            jogador.dados.stamina = Math.max(0, jogador.dados.stamina - 10);
            await jogador.salvar();

            let texto = `🧳 *VIAJANDO...*\n\n`;
            texto += `🌍 Saindo de: ${bioma.nome}\n`;
            texto += `📍 Área: ${areaAnterior ? areaAnterior.nome : areaId}\n`;
            texto += `🌲 Chegando em: ${bioma.nome}\n\n`;
            texto += `📝 ${bioma.descricao}\n\n`;
            texto += `⚡ Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}\n\n`;
            texto += `📌 *Use:* !bioma para explorar!`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO viajar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao viajar: ${err.message}`
            });
        }
    }
};
