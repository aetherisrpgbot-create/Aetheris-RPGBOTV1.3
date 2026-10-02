// comandos/rpg/cacar.js - ACEITA "cacar" E "caçar"
const { Jogador } = require('../../servicos/jogador');
const { batalhasAtivas } = require('../../core/batalha');
const { getAreaNome, getCriaturasPorArea } = require('../../dados/biomas/eldoria');
const ITENS_BASE = require('../../dados/itens_base');

module.exports = {
    nome: "cacar",
    alias: ["caçar"],  // ← ADICIONA O ALIAS COM CEDILHA!
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🔥 CARREGA JOGADOR
            // ============================================================
            const jogador = new Jogador(remetenteId);
            await jogador.carregar();

            // ============================================================
            // 🔥 VERIFICA SE JÁ ESTÁ EM UM ENCONTRO OU BATALHA
            // ============================================================
            if (batalhasAtivas.has(remetenteId)) {
                const encontro = batalhasAtivas.get(remetenteId);
                if (encontro.turno > 0) {
                    return sock.sendMessage(remoteJid, {
                        text: `⚔️ Você já está em batalha contra ${encontro.criatura.nome}! Use !atacar, !defender ou !fugir.`
                    });
                }
                return sock.sendMessage(remoteJid, {
                    text: `🔄 Você já está em um encontro! Use as ações disponíveis ou !passar para sair.`
                });
            }

            // ============================================================
            // 🔥 VERIFICA STAMINA
            // ============================================================
            if (jogador.dados.stamina < 10) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você está muito cansado! (${jogador.dados.stamina}/100)\nDescanse com !descansar`
                });
            }

            // ============================================================
            // 🔥 PEGA A ÁREA ATUAL
            // ============================================================
            const areaId = jogador.dados.area || 'acampamento';
            const areaNome = getAreaNome(areaId);

            // ============================================================
            // 🔥 BUSCA CRIATURAS DA ÁREA
            // ============================================================
            const todasCriaturas = getCriaturasPorArea(areaId);
            
            const hostis = todasCriaturas.filter(c => c.tipo === 'hostil');
            const pacificas = todasCriaturas.filter(c => c.tipo === 'pacifica');

            let criatura = null;
            let tipo = 'hostil';

            if (hostis.length > 0) {
                criatura = hostis[Math.floor(Math.random() * hostis.length)];
                tipo = 'hostil';
            } else if (pacificas.length > 0) {
                criatura = pacificas[Math.floor(Math.random() * pacificas.length)];
                tipo = 'pacifica';
            }

            if (!criatura) {
                return sock.sendMessage(remoteJid, {
                    text: `🔍 Você explorou ${areaNome} mas não encontrou nenhuma criatura...\n\n📌 Tente outra área com !explorar`
                });
            }

            // ============================================================
            // 🔥 CONSOLE STAMINA
            // ============================================================
            jogador.dados.stamina = Math.max(0, jogador.dados.stamina - 10);
            await jogador.salvar();

            // ============================================================
            // 🔥 INICIA O ENCONTRO
            // ============================================================
            batalhasAtivas.set(remetenteId, {
                tipo: tipo,
                criatura: criatura,
                criaturaVida: criatura.vida || 0,
                criaturaVidaMax: criatura.vida || 0,
                area: areaId,
                turno: 0
            });

            // ============================================================
            // 🔥 ENCONTRO PACÍFICO
            // ============================================================
            if (tipo === 'pacifica') {
                let texto = `🌿 *ENCONTRO PACÍFICO!*\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `${criatura.nome}\n`;
                if (criatura.descricao) texto += `📝 ${criatura.descricao}\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                texto += `📍 Área: ${areaNome}\n`;
                texto += `📌 *Ações disponíveis:*\n`;
                
                if (criatura.acoes && criatura.acoes.length > 0) {
                    for (const acao of criatura.acoes) {
                        texto += `   • !${acao} - ${acao}\n`;
                    }
                }
                
                texto += `   • !matar - Abater a criatura (violento!)\n`;
                texto += `   • !passar - Seguir em frente\n\n`;
                texto += `⚡ Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🔥 ENCONTRO HOSTIL
            // ============================================================
            let texto = `⚔️ *ENCONTRO HOSTIL!*\n\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `${criatura.nome}\n`;
            if (criatura.descricao) texto += `📝 ${criatura.descricao}\n`;
            texto += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
            texto += `❤️ Vida: ${criatura.vida}\n`;
            texto += `⚔️ Poder: ${criatura.poder}\n`;
            texto += `🛡️ Defesa: ${criatura.defesa}\n`;
            texto += `⭐ XP: ${criatura.xp}\n`;
            texto += `💰 Ouro: ${criatura.ouro}\n\n`;
            
            if (criatura.drop && criatura.drop.length > 0) {
                texto += `📦 *Possíveis drops:*\n`;
                for (const drop of criatura.drop) {
                    const info = ITENS_BASE[drop.item];
                    const chance = Math.round(drop.chance * 100);
                    const nome = info?.nome || drop.item;
                    texto += `   • ${nome} (${chance}%)\n`;
                }
                texto += `\n`;
            }

            texto += `📍 Área: ${areaNome}\n`;
            texto += `📌 *Ações:*\n`;
            texto += `   • !batalhar - Iniciar combate\n`;
            texto += `   • !passar - Seguir em frente (⚠️ não funciona para hostis!)\n\n`;
            texto += `⚡ Stamina: ${jogador.dados.stamina}/${jogador.dados.stamina_max}`;

            return sock.sendMessage(remoteJid, { text: texto });

        } catch (err) {
            console.error("❌ ERRO cacar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao caçar: ${err.message}`
            });
        }
    }
};
