// comandos/rpg/classe.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "classe",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const classes = [
                { nome: 'Guerreiro', descricao: '⚔️ Poder e Defesa' },
                { nome: 'Mago', descricao: '🧙 Mana e Poder Mágico' },
                { nome: 'Arqueiro', descricao: '🏹 Esquiva e Crítico' },
                { nome: 'Ladino', descricao: '🗡️ Esquiva e Roubo' },
                { nome: 'Paladino', descricao: '🛡️ Defesa e Cura' },
                { nome: 'Druida', descricao: '🌿 Versatilidade' }
            ];
            
            if (!args || args.length === 0) {
                let texto = '⚔️ *CLASSES DISPONÍVEIS*\n\n';
                for (const c of classes) {
                    texto += `   • ${c.nome} - ${c.descricao}\n`;
                }
                texto += '\n📌 Use: !classe <nome>\nExemplo: !classe Guerreiro';
                return sock.sendMessage(remoteJid, { text: texto });
            }

            const classeEscolhida = args.join(' ').toLowerCase();
            const classeEncontrada = classes.find(c => c.nome.toLowerCase() === classeEscolhida);

            if (!classeEncontrada) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Classe "${args.join(' ')}" não encontrada!\n\nUse: !classe para ver as disponíveis.`
                });
            }

            jogador.dados.classe = classeEncontrada.nome;
            await jogador.salvar();

            return sock.sendMessage(remoteJid, {
                text: `✅ Classe alterada para *${classeEncontrada.nome}!*\n\n${classeEncontrada.descricao}`
            });

        } catch (err) {
            console.error("❌ Erro no comando classe:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao escolher classe: ${err.message}`
            });
        }
    }
};
