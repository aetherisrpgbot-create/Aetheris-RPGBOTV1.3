// !lore - Mostra a lore de Aetheris v1.1
const AETHERIS = require("../../dados/lore/aetheris");

module.exports = {
    nome: "lore",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const sub = args[0]?.toLowerCase();

            // ============================================================
            // 📖 !lore <numero> — Capítulo
            // ============================================================
            if (sub && !isNaN(sub)) {
                const num = parseInt(sub);
                const cap = AETHERIS.capitulos.find(c => c.numero === num);
                
                if (!cap) {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ Capítulo ${num} não existe!\n\n` +
                              `📖 Total: ${AETHERIS.capitulos.length} capítulos`
                    });
                }

                const temProximo = AETHERIS.capitulos.find(c => c.numero === num + 1);

                return sock.sendMessage(remoteJid, {
                    text: `📖 *CAPÍTULO ${cap.numero}*\n` +
                          `_${cap.titulo}_\n\n` +
                          `${cap.texto}\n\n` +
                          `━━━━━━━━━━━━━━━━━━━\n` +
                          (temProximo ? `📚 Próximo: *!lore ${num + 1}*` : `🏁 *FIM DA LORE*`)
                });
            }

            // ============================================================
            // 🌍 !lore regioes
            // ============================================================
            if (sub === "regioes" || sub === "regiões" || sub === "mapa") {
                let texto = `🌍 *TERRA DE TRINITAS*\n\n`;
                texto += `_${AETHERIS.mundo.descricao}_\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━\n\n`;
                
                for (const r of AETHERIS.mundo.regioes) {
                    texto += `${r.emoji} *${r.nome}*\n`;
                    texto += `   📍 ${r.direcao}\n`;
                    texto += `   ⚔️ Facção: ${r.faccao}\n`;
                    texto += `   💎 Artefato: ${r.artefato}\n`;
                    texto += `   ⚠️ Perigo: ${r.perigo}\n`;
                    texto += `   🌟 Evento: ${r.evento}\n\n`;
                }
                texto += `💡 Use *!lore <numero>* para ler capítulos`;
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🎭 !lore npcs
            // ============================================================
            if (sub === "npcs") {
                let texto = `🎭 *NPCs DE AETHERIS*\n\n`;
                for (const [id, npc] of Object.entries(AETHERIS.npcs)) {
                    texto += `${npc.emoji} *${npc.nome}*\n`;
                    texto += `   _${npc.titulo}_\n`;
                    texto += `   📍 ${npc.regiao}\n`;
                    texto += `   💬 ${npc.descricao}\n\n`;
                }
                texto += `💡 Use *!lore npc <nome>* para detalhes`;
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // ⚔️ !lore artefatos
            // ============================================================
            if (sub === "artefatos") {
                let texto = `⚔️ *ARTEFATOS LENDÁRIOS*\n\n`;
                for (const [id, art] of Object.entries(AETHERIS.artefatos)) {
                    texto += `${art.emoji} *${art.nome}*\n`;
                    if (art.titulo) texto += `   _${art.titulo}_\n`;
                    texto += `   📍 ${art.regiao}\n`;
                    texto += `   💬 ${art.descricao}\n\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 📜 !lore locais
            // ============================================================
            if (sub === "locais" || sub === "lugares") {
                let texto = `📜 *LOCAIS MÍSTICOS*\n\n`;
                for (const [id, local] of Object.entries(AETHERIS.locais)) {
                    texto += `${local.emoji} *${local.nome}*\n`;
                    texto += `   📍 ${local.regiao}\n`;
                    texto += `   💬 ${local.descricao}\n\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🎯 !lore faccoes
            // ============================================================
            if (sub === "faccoes" || sub === "facções") {
                let texto = `🎯 *FACÇÕES*\n\n`;
                for (const [id, fac] of Object.entries(AETHERIS.faccoes)) {
                    texto += `${fac.emoji} *${fac.nome}*\n`;
                    texto += `   📍 ${fac.regiao}\n`;
                    texto += `   💬 ${fac.descricao}\n`;
                    if (fac.divididos) texto += `   ⚡ ${fac.divididos}\n`;
                    texto += `\n`;
                }
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 📖 !lore — MENU PRINCIPAL
            // ============================================================
            const totalCaps = AETHERIS.capitulos.length;

            await sock.sendMessage(remoteJid, {
                text: `⚔️ *O ENIGMA DE AETHERIS* ⚔️\n` +
                      `_v${AETHERIS.versao}_\n\n` +
                      `_"${AETHERIS.mundo.descricao}"_\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `📚 *${totalCaps} capítulos* disponíveis\n\n` +
                      `🌍 *!lore regioes* — As 3 regiões\n` +
                      `🎭 *!lore npcs* — Os NPCs\n` +
                      `⚔️ *!lore artefatos* — Armas lendárias\n` +
                      `📜 *!lore locais* — Locais místicos\n` +
                      `🎯 *!lore faccoes* — Facções\n` +
                      `📖 *!lore 1* — Ler capítulo 1\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `_Quem será capaz de decifrar o Enigma de Aetheris?_`
            });

        } catch (err) {
            console.error("❌ Erro no comando lore:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar lore: ${err.message}`
            });
        }
    }
};
