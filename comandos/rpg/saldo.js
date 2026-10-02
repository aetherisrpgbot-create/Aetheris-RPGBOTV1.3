// comandos/rpg/saldo.js
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "saldo",
    alias: ["money", "ouro"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            const d = jogador.dados;

            let texto = `💰 *SALDO DE ${d.nome}*\n\n`;
            texto += `💰 Ouro: ${d.ouro}\n`;
            texto += `🏦 Banco: ${d.banco}\n`;
            texto += `📊 Total: ${d.ouro + d.banco}\n\n`;
            texto += `📌 Use !trabalhar para ganhar ouro\n`;
            texto += `📌 Use !depositar <quantia> para guardar no banco\n`;
            texto += `📌 Use !sacar <quantia> para retirar do banco`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO saldo:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao consultar saldo: ${err.message}`
            });
        }
    }
};
