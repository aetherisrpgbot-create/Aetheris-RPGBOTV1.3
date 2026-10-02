// comandos/rpg/inventario.js
const { Jogador } = require('../../servicos/jogador');
const { gerarImagemInventario, obterAvatar, converterNomeComCache } = require('../../core/inventario_service');
const { gerarHashInventario, getImagemCache, salvarImagemCache } = require('../../core/inventario_cache');
const ITENS_BASE = require('../../dados/itens_base');
const fs = require('fs');

module.exports = {
    nome: "inventario",
    alias: ["inv", "mochila", "mochilas"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // 1. Carrega o jogador
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // 2. Verifica se tá vazio
            if (!jogador.inventario || jogador.inventario.length === 0) {
                return sock.sendMessage(remoteJid, {
                    text: '🎒 *INVENTÁRIO VAZIO!*\n\n📌 Use !coletar para conseguir itens.'
                });
            }

            // 3. Monta a lista de itens (sempre atualizada)
            let listaItens = '🎒 *INVENTÁRIO*\n\n';
            
            const itensOrdenados = [...jogador.inventario].sort((a, b) => {
                const infoA = ITENS_BASE[a.item_id];
                const infoB = ITENS_BASE[b.item_id];
                return (infoA?.nome || a.item_id).localeCompare(infoB?.nome || b.item_id);
            });
            
            for (const item of itensOrdenados) {
                const info = ITENS_BASE[item.item_id];
                const emoji = info?.emoji || '📦';
                const nome = info?.nome || item.item_id;
                listaItens += `   ${emoji} ${nome} x${item.quantidade}\n`;
            }
            
            const totalItens = jogador.inventario.reduce((acc, i) => acc + i.quantidade, 0);
            const slotsTotais = jogador.mochila?.slots || 10;
            
            listaItens += `\n━━━━━━━━━━━━━━━━━━━━━`;
            listaItens += `\n📦 Total: ${totalItens} itens`;
            listaItens += `\n🎒 Mochila: ${jogador.inventario.length}/${slotsTotais} slots`;

            // 4. Dados pra imagem
            const usuarioId = jogador.id;
            const classe = jogador.dados.classe || 'Aventureiro';
            const nomeOriginal = jogador.dados.nome || 'Aventureiro';
            
            // 5. Converte o nome
            const nomeConvertido = await converterNomeComCache(nomeOriginal);
            
            // 6. Gera hash do inventário
            const hashAtual = gerarHashInventario(jogador, nomeConvertido);
            
            // 7. Verifica se tem cache
            let imagemPath = getImagemCache(usuarioId, hashAtual);
            
            if (imagemPath) {
                console.log('⚡ [INVENTÁRIO] Usando cache!');
            } else {
                console.log('🎨 [INVENTÁRIO] Gerando nova imagem...');
                
                // Pega o avatar
                const avatarPath = await obterAvatar(sock, usuarioId, classe);
                
                // Gera a imagem
                const imagemTemp = await gerarImagemInventario(usuarioId, avatarPath, nomeConvertido);
                
                // Salva no cache
                imagemPath = salvarImagemCache(usuarioId, hashAtual, imagemTemp);
                
                // Limpa temporários
                try {
                    fs.unlinkSync(imagemTemp);
                    if (avatarPath && avatarPath.includes('avatar_temp_')) fs.unlinkSync(avatarPath);
                } catch (e) {}
            }
            
            // 8. Lê a imagem do cache
            const imagemBuffer = fs.readFileSync(imagemPath);
            
            // 9. Envia
            await sock.sendMessage(remoteJid, {
                image: imagemBuffer,
                caption: listaItens
            });

        } catch (err) {
            console.error("❌ ERRO inventario:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar inventário: ${err.message}`
            });
        }
    }
};
