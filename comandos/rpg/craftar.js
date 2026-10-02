// comandos/rpg/craftar.js - VERSÃO ATUALIZADA (POR NOME)
const { Craft } = require('../../core/craft');
const { Jogador } = require('../../servicos/jogador');

module.exports = {
    nome: "craftar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            if (args.length < 1) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Use: !craftar <nome do item>

📌 *Exemplos:*
!craftar espada de madeira
!craftar poção de vida
!craftar picareta de ferro

📌 *Para ver as receitas disponíveis:*
!craft`
                });
            }

            const nomeItem = args.join(" ").trim();
            
            // Verifica se o jogador existe
            const jogador = new Jogador(remetenteId);
            try {
                await jogador.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    const nome = msg.pushName || 'Aventureiro';
                    await jogador.criar(nome);
                    await jogador.carregar();
                } else {
                    throw err;
                }
            }

            // Cria instância do craft
            const craft = new Craft(remetenteId);
            
            // 🔥 BUSCA A RECEITA POR NOME
            const resultadoBusca = craft.buscarReceitaPorNome(nomeItem);
            
            if (!resultadoBusca) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Nenhuma receita encontrada para "${nomeItem}".\n\n📌 Use !craft para ver as receitas disponíveis.`
                });
            }

            const { id: receitaId, receita } = resultadoBusca;
            
            // Verifica se o jogador tem nível suficiente
            if (jogador.dados.nivel < receita.nivel_necessario) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você precisa ser nível ${receita.nivel_necessario} para craftar ${receita.nome}!`
                });
            }

            // Verifica se tem materiais
            const tem = await craft.temMateriais(receita.materiais);
            if (!tem) {
                const materiaisFaltando = [];
                for (const [itemId, quantidade] of Object.entries(receita.materiais)) {
                    const item = jogador.inventario.find(i => i.item_id === itemId);
                    const temQtd = item ? item.quantidade : 0;
                    if (temQtd < quantidade) {
                        const nomeMat = require('../../dados/itens_base')[itemId]?.nome || itemId;
                        materiaisFaltando.push(`${nomeMat} (${temQtd}/${quantidade})`);
                    }
                }
                return sock.sendMessage(remoteJid, {
                    text: `❌ Materiais insuficientes!\n\n📦 Faltando:\n${materiaisFaltando.map(m => `   • ${m}`).join('\n')}`
                });
            }

            // 🔥 CRAFTA
            const resultado = await craft.craftar(receitaId);

            if (resultado.success) {
                // Mostra o item craftado
                const itemCraftado = require('../../dados/itens_base')[resultado.item];
                
                let mensagem = `✅ *${receita.nome}* craftado com sucesso!\n\n`;
                mensagem += `📦 *Item craftado:*\n`;
                mensagem += `${itemCraftado?.nome || resultado.item} x${resultado.quantidade}\n`;
                if (itemCraftado?.descricao) {
                    mensagem += `📝 ${itemCraftado.descricao}\n`;
                }
                mensagem += `\n📌 Use !inventario para ver seus itens.`;

                await sock.sendMessage(remoteJid, { text: mensagem });
            } else {
                await sock.sendMessage(remoteJid, { text: resultado.message });
            }

        } catch (err) {
            console.error("❌ ERRO craftar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao craftar item.\n\n${err.message?.substring(0, 100) || 'Tente novamente.'}`
            });
        }
    }
};
