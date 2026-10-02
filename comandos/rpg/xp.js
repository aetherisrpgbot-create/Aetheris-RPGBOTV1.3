// comandos/rpg/xp.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "xp",
    alias: ["experiencia", "nivel"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const d = jogador.dados;
            const xpPercent = Math.floor((d.xp / d.xp_proximo) * 100);
            const barra = gerarBarraProgresso(xpPercent, 20);

            let texto = `⭐ *STATUS DE ${d.nome}*\n\n`;
            texto += `🎯 Nível: ${d.nivel}\n`;
            texto += `📊 XP: ${d.xp}/${d.xp_proximo}\n`;
            texto += `${barra} ${xpPercent}%\n\n`;
            texto += `📌 Use !treino para ganhar XP\n`;
            texto += `📌 Use !perfil para ver todos os atributos`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO xp:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao consultar XP: ${err.message}`
            });
        }
    }
};

function gerarBarraProgresso(percentual, tamanho = 20) {
    const preenchido = Math.floor((percentual / 100) * tamanho);
    const vazio = tamanho - preenchido;
    return `[${'█'.repeat(preenchido)}${'░'.repeat(vazio)}]`;
}
