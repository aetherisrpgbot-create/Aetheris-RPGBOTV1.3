// !falar / !conversar / !npc - Conversa com NPCs do RPG (IA imersiva)
const { executarPython } = require("../../servicos/jogador");
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    nomes: ["falar", "conversar", "perguntar", "npc", "dialogo", "dialogar"],

    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🎭 ALIASES DOS NPCs
            // ============================================================
            const NPC_ALIASES = {
                'cassia': 'cassia_lisandra',
                'cassia lisandra': 'cassia_lisandra',
                'anciã': 'cassia_lisandra',
                'ancia': 'cassia_lisandra',
                'velha': 'cassia_lisandra',
                'bruxa': 'cassia_lisandra',
                'maga': 'cassia_lisandra',
                'sabia': 'cassia_lisandra',

                'octavius': 'octavius_alexios',
                'octavius alexios': 'octavius_alexios',
                'caçador': 'octavius_alexios',
                'cacador': 'octavius_alexios',
                'arqueiro': 'octavius_alexios',
                'alexios': 'octavius_alexios',

                'ignatius': 'ignatius_flavianus',
                'ignatius flavianus': 'ignatius_flavianus',
                'xamã': 'ignatius_flavianus',
                'xama': 'ignatius_flavianus',
                'feiticeiro': 'ignatius_flavianus',
                'bruxo': 'ignatius_flavianus',
                'flavianus': 'ignatius_flavianus',

                'tiberio': 'gregorius_tiberius',
                'tibério': 'gregorius_tiberius',
                'gregorius': 'gregorius_tiberius',
                'gregorius tiberius': 'gregorius_tiberius',
                'guerreiro': 'gregorius_tiberius',
                'heroi': 'gregorius_tiberius',
                'herói': 'gregorius_tiberius',

                'dominus': 'dominus_magnus',
                'dominus magnus': 'dominus_magnus',
                'senhor dos orcs': 'dominus_magnus',
                'chefe dos orcs': 'dominus_magnus',
                'lider': 'dominus_magnus',
                'líder': 'dominus_magnus',
                'orc': 'dominus_magnus',
                'orcs': 'dominus_magnus',
                'magnus': 'dominus_magnus'
            };

            const NPC_INFO = {
                'cassia_lisandra': { emoji: '🧙‍♀️', nome: 'Cassia Lisandra' },
                'octavius_alexios': { emoji: '🏹', nome: 'Octavius Alexios' },
                'ignatius_flavianus': { emoji: '🔮', nome: 'Ignatius Flavianus' },
                'gregorius_tiberius': { emoji: '⚔️', nome: 'Gregorius Tiberius' },
                'dominus_magnus': { emoji: '👹', nome: 'Dominus Magnus' }
            };

            // ============================================================
            // ❓ SEM ARGUMENTO — MOSTRA AJUDA
            // ============================================================
            if (!args || args.length === 0) {
                const result = await executarPython('lore_completa');

                let texto = `🎭 *FALAR COM NPCS*\n\n`;

                if (result && result.npcs && result.npcs.length > 0) {
                    texto += `*NPCs disponíveis:*\n\n`;
                    for (const npc of result.npcs) {
                        texto += `${npc.emoji} *${npc.nome}* — _${npc.titulo}_\n`;
                        texto += `   📍 ${npc.regiao}\n\n`;
                    }
                } else {
                    texto += `_Lore ainda não populada._\n\n`;
                }

                texto += `━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `💡 *Como usar:*\n\n`;
                texto += `• !falar cassia O que é Aetheris?\n`;
                texto += `• !falar com tiberio fale dos Stuntis\n`;
                texto += `• !conversar com ignatius sobre o Altar\n\n`;
                texto += `📖 Use *!lore npcs* pra ver detalhes`;

                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // 🎯 MONTA O TEXTO COMPLETO
            // ============================================================
            const textoCompleto = String(args.join(" ")).trim();
            const textoLower = textoCompleto.toLowerCase();

            let npcId = null;
            let pergunta = textoCompleto;

            // 🔍 DETECTA NPC NO INÍCIO
            const preposicoes = ['com', 'pra', 'para', 'o', 'a', 'ao', 'à'];
            const aliasesOrdenados = Object.keys(NPC_ALIASES).sort((a, b) => b.length - a.length);

            for (const alias of aliasesOrdenados) {
                let textoLimpo = textoLower;

                for (const prep of preposicoes) {
                    if (textoLimpo.startsWith(prep + ' ')) {
                        textoLimpo = textoLimpo.slice(prep.length + 1).trim();
                        break;
                    }
                }

                if (textoLimpo === alias || textoLimpo.startsWith(alias + ' ')) {
                    npcId = NPC_ALIASES[alias];

                    const palavrasOriginais = textoCompleto.split(/\s+/);
                    const palavrasLower = textoLower.split(/\s+/);
                    const indexAlias = palavrasLower.findIndex(p => alias.split(' ').includes(p));

                    if (indexAlias >= 0) {
                        pergunta = palavrasOriginais.slice(indexAlias + alias.split(' ').length).join(' ').trim();
                    }

                    if (!pergunta) {
                        pergunta = textoCompleto;
                    }
                    break;
                }
            }

            // ============================================================
            // 📝 VERIFICA SE TEM PERGUNTA
            // ============================================================
            if (!pergunta || pergunta.length < 2) {
                return sock.sendMessage(remoteJid, {
                    text: `❓ Você precisa fazer uma pergunta!\n\nEx: *!falar cassia O que é Aetheris?*`
                });
            }

            // ============================================================
            // 🧙 GARANTE QUE O JOGADOR EXISTE
            // ============================================================
            const nomeUsuario = msg.pushName || "Viajante";

            let jogadorExiste = false;
            try {
                const check = await executarPython('jogador_carregar', remetenteId);
                if (check && check.jogador) {
                    jogadorExiste = true;
                }
            } catch (e) {
                jogadorExiste = false;
            }

            if (!jogadorExiste) {
                try {
                    await executarPython('jogador_criar', remetenteId, nomeUsuario);
                } catch (e) {
                    console.error(`⚠️ Erro ao criar jogador:`, e.message);
                }
            }

            // ============================================================
            // 🤔 AVISA QUE ESTÁ PENSANDO
            // ============================================================
            const enviada = await sock.sendMessage(remoteJid, {
                text: `🔮 _Consultando os sussurros de Aetheris..._`
            });

            // ============================================================
            // 🤖 CHAMA A IA PYTHON
            // ============================================================
            const IA_BRAIN_PATH = path.join(__dirname, '../../core/ia_brain.py');
            const perguntaEscapada = String(pergunta).replace(/"/g, '\\"');
            const argsPython = npcId
                ? `"${remetenteId}" "${perguntaEscapada}" "${npcId}"`
                : `"${remetenteId}" "${perguntaEscapada}"`;

            const cmd = `python3 "${IA_BRAIN_PATH}" responder ${argsPython}`;

            const result = await new Promise((resolve, reject) => {
                exec(cmd, { maxBuffer: 1024 * 1024 * 2 }, (err, stdout, stderr) => {
                    if (err) return reject(err);
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (e) {
                        reject(new Error(`Erro ao parsear: ${stdout}`));
                    }
                });
            });

            if (result.erro) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Erro: ${result.erro}`
                });
            }

            // ============================================================
            // 💬 MONTA RESPOSTA
            // ============================================================
            let cabecalho = "";
            if (npcId && NPC_INFO[npcId]) {
                cabecalho = `${NPC_INFO[npcId].emoji} *${NPC_INFO[npcId].nome}*\n\n`;
            } else if (npcId) {
                cabecalho = `🎭 *NPC*\n\n`;
            } else {
                cabecalho = `📜 *Os Sussurros de Aetheris*\n\n`;
            }

            try {
                await sock.sendMessage(remoteJid, {
                    text: `${cabecalho}${result.resposta}`,
                    edit: enviada.key
                });
            } catch (editErr) {
                await sock.sendMessage(remoteJid, {
                    text: `${cabecalho}${result.resposta}`
                });
            }

        } catch (err) {
            console.error("❌ Erro no comando falar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao falar com NPC: ${err.message}`
            });
        }
    }
};
