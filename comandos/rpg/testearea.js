// comandos/rpg/testarea.js - COMANDO DE TESTE PARA VER ÁREA
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "testarea",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            console.log("🔍 ===== TESTE DE ÁREA ===== 🔍");
            console.log(`📱 ID do jogador: ${remetenteId}`);

            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            console.log("📊 DADOS DO JOGADOR:");
            console.log(`   • Nome: ${jogador.dados.nome}`);
            console.log(`   • Nível: ${jogador.dados.nivel}`);
            console.log(`   • Bioma: ${jogador.dados.bioma}`);
            console.log(`   • Área: ${jogador.dados.area}`);
            console.log(`   • Stamina: ${jogador.dados.stamina}`);
            console.log(`   • XP: ${jogador.dados.xp}`);
            console.log(`   • Ouro: ${jogador.dados.ouro}`);
            console.log(`   • Vida: ${jogador.dados.vida}`);
            console.log(`   • Classe: ${jogador.dados.classe}`);
            
            console.log("🔍 TODOS OS DADOS:");
            console.log(JSON.stringify(jogador.dados, null, 2));

            let texto = `🔍 *TESTE DE ÁREA*\n\n`;
            texto += `📍 **Área atual:** ${jogador.dados.area || 'NÃO DEFINIDA!'}\n`;
            texto += `🌍 **Bioma:** ${jogador.dados.bioma || 'NÃO DEFINIDO!'}\n\n`;
            texto += `📊 **Dados completos:**\n`;
            texto += `   • Nome: ${jogador.dados.nome}\n`;
            texto += `   • Nível: ${jogador.dados.nivel}\n`;
            texto += `   • XP: ${jogador.dados.xp}/${jogador.dados.xp_proximo}\n`;
            texto += `   • Vida: ${jogador.dados.vida}/${jogador.dados.vida_max}\n`;
            texto += `   • Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}\n`;
            texto += `   • Ouro: ${jogador.dados.ouro}\n`;
            texto += `   • Bioma: ${jogador.dados.bioma}\n`;
            texto += `   • Área: ${jogador.dados.area || '❌ NÃO DEFINIDA!'}\n\n`;
            
            texto += `📌 *Comandos para testar:*\n`;
            texto += `   • !explorar trilha_cacadores\n`;
            texto += `   • !testarea (ver novamente)`;

            await sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO testarea:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro no teste: ${err.message}`
            });
        }
    }
};
