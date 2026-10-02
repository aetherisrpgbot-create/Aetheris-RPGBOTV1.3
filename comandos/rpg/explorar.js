// comandos/rpg/explorar.js
const { Jogador } = require('../../servicos/jogador');
const { ELDORIA, getArea } = require('../../dados/biomas/eldoria');

module.exports = {
    nome: "explorar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const bioma = ELDORIA;

            if (!args || args.length === 0) {
                let texto = `📍 *${bioma.nome}*\n\n`;
                texto += `📝 ${bioma.descricao}\n\n`;
                texto += `🗺️ *Áreas disponíveis:*\n`;

                for (const area of bioma.areas) {
                    const nivelOk = jogador.dados.nivel >= area.nivel_necessario;
                    const status = nivelOk ? '✅' : `🔒 (Nv.${area.nivel_necessario})`;
                    const atual = area.id === jogador.dados.area ? ' 👈' : '';
                    texto += `   ${status} ${area.nome}${atual}\n`;
                }

                texto += `\n\n📌 *Use:* !explorar <área>`;
                texto += `\n📌 *Exemplo:* !explorar trilha_cacadores`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            const nomeArea = args.join(' ').toLowerCase();
            const areaEncontrada = bioma.areas.find(a => 
                a.id === nomeArea || 
                a.nome.toLowerCase().includes(nomeArea)
            );

            if (!areaEncontrada) {
                let texto = `❌ Área "${args.join(' ')}" não encontrada!\n\n`;
                texto += `🗺️ *Áreas disponíveis:*\n`;
                for (const area of bioma.areas) {
                    texto += `   • ${area.nome} (ID: ${area.id})\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            if (jogador.dados.nivel < areaEncontrada.nivel_necessario) {
                return sock.sendMessage(remoteJid, {
                    text: `🔒 Você precisa ser nível ${areaEncontrada.nivel_necessario} para explorar ${areaEncontrada.nome}!`
                });
            }

            if (jogador.dados.stamina < 10) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Você está muito cansado! Descanse com !descansar'
                });
            }

            jogador.dados.area = areaEncontrada.id;
            jogador.dados.stamina = Math.max(0, jogador.dados.stamina - 10);
            await jogador.salvar();
            await jogador.carregar();

            let texto = `🗺️ *${areaEncontrada.nome}*\n\n`;
            texto += `📝 ${areaEncontrada.descricao}\n\n`;
            texto += `⚡ Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}\n\n`;
            texto += `📌 *Ações:*\n`;
            texto += `   • !cacar - Caçar criaturas\n`;
            texto += `   • !coletar - Coletar recursos`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO explorar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao explorar: ${err.message}`
            });
        }
    }
};
