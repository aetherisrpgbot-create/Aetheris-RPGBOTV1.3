// !pergunta - Inicia um quiz (com filtro por categoria)
const perguntas = require("../../dados/perguntas");
const { Jogador, executarPython } = require("../../servicos/jogador");

// ============================================================
// 🔹 CONSTANTES
// ============================================================
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
const LIMITE_DIARIO = 20;

// Cache de perguntas embaralhadas por categoria
const cachePerguntas = {};
const perguntasAtivas = {};

// ============================================================
// 🔹 CONTROLE DIÁRIO EM MEMÓRIA (COMPARTILHADO VIA GLOBAL)
// ============================================================
if (!global.__controleDiarioQuiz) {
    global.__controleDiarioQuiz = {};
}
const controleDiario = global.__controleDiarioQuiz;

// ============================================================
// 🔹 CONTROLE DIÁRIO
// ============================================================
function getHoje() {
    return new Date().toISOString().split('T')[0];
}

function getControle(userId) {
    const hoje = getHoje();
    if (!controleDiario[userId] || controleDiario[userId].data !== hoje) {
        controleDiario[userId] = { 
            data: hoje, 
            perguntas: 0, 
            erros: 0,
            nome: controleDiario[userId]?.nome || "Jogador"
        };
    }
    return controleDiario[userId];
}

function incrementarPergunta(userId) {
    const c = getControle(userId);
    c.perguntas++;
    return c.perguntas;
}

function incrementarErro(userId) {
    const c = getControle(userId);
    c.erros++;
    return c.erros;
}

// ============================================================
// 🔹 UTILITÁRIOS
// ============================================================
function getCategorias() {
    const set = new Set();
    for (const p of perguntas) {
        if (p.categoria) set.add(p.categoria.toLowerCase());
    }
    return Array.from(set).sort();
}

function embaralharArray(arr) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function getPerguntasCategoria(categoria) {
    const cat = categoria.toLowerCase();

    let listaBase;
    if (cat === "geral") {
        listaBase = [...perguntas];
    } else {
        listaBase = perguntas.filter(p => (p.categoria || "").toLowerCase() === cat);
    }

    if (!cachePerguntas[cat] || cachePerguntas[cat].length === 0) {
        cachePerguntas[cat] = embaralharArray(listaBase);
        console.log(`📚 Cache recarregado para categoria "${cat}" (${cachePerguntas[cat].length} perguntas)`);
    }

    return cachePerguntas[cat];
}

function pegarPergunta(categoria = "geral") {
    const cat = categoria.toLowerCase();
    const lista = getPerguntasCategoria(cat);

    if (lista.length === 0) {
        delete cachePerguntas[cat];
        const novaLista = getPerguntasCategoria(cat);
        return novaLista.splice(0, 1)[0];
    }

    const index = Math.floor(Math.random() * lista.length);
    return lista.splice(index, 1)[0];
}

// ============================================================
// 🔥 COMANDO
// ============================================================
module.exports = {
    nome: "pergunta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            const categoriaArg = args[0]?.toLowerCase().trim();

            // ============================================================
            // 📋 LISTAR CATEGORIAS
            // ============================================================
            if (categoriaArg === "categorias" || categoriaArg === "lista") {
                const cats = getCategorias();
                let texto = `📚 *CATEGORIAS DISPONÍVEIS*\n\n`;
                for (const c of cats) {
                    const total = perguntas.filter(p => (p.categoria || "").toLowerCase() === c).length;
                    texto += `• *${c}* (${total} perguntas)\n`;
                }
                texto += `\n💡 Use: *!pergunta <categoria>*`;
                texto += `\n💡 Ex: *!pergunta geografia*`;
                texto += `\n💡 Ou sem categoria para uma aleatória!`;
                return sock.sendMessage(remoteJid, { text: texto });
            }

            // ============================================================
            // ✅ VALIDA CATEGORIA
            // ============================================================
            let categoria = "geral";
            if (categoriaArg) {
                const cats = getCategorias();
                if (!cats.includes(categoriaArg)) {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ Categoria *${categoriaArg}* não existe!\n\n` +
                              `📚 *Disponíveis:* ${cats.join(", ")}\n\n` +
                              `💡 Use *!pergunta categorias* para ver detalhes.`
                    });
                }
                categoria = categoriaArg;
            }

            // ============================================================
            // 🚫 JÁ TEM PERGUNTA ATIVA?
            // ============================================================
            if (perguntasAtivas[remoteJid]) {
                return sock.sendMessage(remoteJid, {
                    text: "⚠️ Já existe uma pergunta ativa neste grupo!\n\n" +
                          "Use *!resposta <sua resposta>* ou aguarde 5 minutos."
                });
            }

            // ============================================================
            // 🧙 GARANTE QUE O JOGADOR EXISTE
            // ============================================================
            const jogador = new Jogador(remetenteId);
            try {
                await jogador.carregar();
            } catch (e) {
                try {
                    await jogador.criar(msg.pushName || "Jogador");
                    await jogador.carregar();
                } catch (err) {
                    console.error('❌ Erro ao criar jogador:', err.message);
                    return sock.sendMessage(remoteJid, {
                        text: "❌ Erro ao carregar seu perfil. Tente novamente."
                    });
                }
            }

            // ============================================================
            // 📊 LIMITE DIÁRIO
            // ============================================================
            const controle = getControle(remetenteId);
            controle.nome = msg.pushName || "Jogador"; // salva nome pro ranking

            if (controle.perguntas >= LIMITE_DIARIO) {
                return sock.sendMessage(remoteJid, {
                    text: `🚫 *LIMITE DIÁRIO ATINGIDO!*\n\n` +
                          `📊 Você já respondeu ${controle.perguntas} perguntas hoje.\n` +
                          `🔄 Volte amanhã para mais!\n\n` +
                          `⏰ Reset: meia-noite`
                });
            }

            // ============================================================
            // 🎯 SORTEIA PERGUNTA
            // ============================================================
            const pergunta = pegarPergunta(categoria);
            pergunta.id = Date.now();
            pergunta.categoriaAtiva = categoria;
            perguntasAtivas[remoteJid] = pergunta;

            // ⏰ Timeout
            setTimeout(() => {
                if (perguntasAtivas[remoteJid]?.id === pergunta.id) {
                    delete perguntasAtivas[remoteJid];
                    sock.sendMessage(remoteJid, {
                        text: "⏰ A pergunta expirou! Use !pergunta para uma nova."
                    }).catch(() => {});
                }
            }, TIMEOUT_MS);

            const restantes = LIMITE_DIARIO - controle.perguntas;
            const emojiCat = {
                geografia: "🌎", ciencias: "🔬", historia: "📜",
                matematica: "🔢", cultura: "🎭", animais: "🐾",
                esportes: "⚽", biblia: "✝️", personalizadas: "💖",
                geral: "🎲"
            }[categoria] || "📚";

            await sock.sendMessage(remoteJid, {
                text: `🧠 *QUIZ DO CONHECIMENTO* 🧠\n\n` +
                      `${emojiCat} Categoria: *${categoria.toUpperCase()}*\n\n` +
                      `❓ *${pergunta.pergunta}*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `📝 *Como responder:*\n\n` +
                      `!resposta sua_resposta\n\n` +
                      `💰 Prêmio: R$100 + 15 XP + 5 pts\n` +
                      `❌ Errar: -1 ponto no ranking\n` +
                      `📊 Hoje: ${controle.perguntas}/${LIMITE_DIARIO} perguntas\n` +
                      `🎯 Restam: ${restantes} perguntas hoje\n` +
                      `⏰ Expira em 5 minutos`
            });

        } catch (err) {
            console.error("❌ Erro no comando pergunta:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao carregar pergunta: ${err.message}`
            });
        }
    },

    // ============================================================
    // 🔹 EXPORTAÇÕES
    // ============================================================
    getPerguntaAtiva: (remoteJid) => perguntasAtivas[remoteJid],
    removerPergunta: (remoteJid) => delete perguntasAtivas[remoteJid],
    getCategorias,
    incrementarPergunta,
    incrementarErro,
    getControle,
    LIMITE_DIARIO
};
