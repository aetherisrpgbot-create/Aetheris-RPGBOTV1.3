// !resposta - Responde uma pergunta do quiz (match inteligente)
const { Jogador, executarPython } = require("../../servicos/jogador");
const { registrarJogo } = require("./utils/pontos");

// ============================================================
// 🔹 IMPORTA DO pergunta.js
// ============================================================
const {
    getPerguntaAtiva,
    removerPergunta,
    incrementarPergunta,
    incrementarErro,
    getControle,
    LIMITE_DIARIO
} = require("./pergunta");

// ============================================================
// 🔹 PALAVRAS IGNORADAS NO MATCH
// ============================================================
const PALAVRAS_IGNORADAS = new Set([
    'de', 'da', 'do', 'das', 'dos', 'o', 'a', 'os', 'as',
    'e', 'é', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma',
    'uns', 'umas', 'para', 'pra', 'por', 'com', 'sem',
    'foi', 'sao', 'ser', 'estar', 'tem', 'ter',
    'que', 'qual', 'quais', 'como', 'onde', 'quando', 'quem'
]);

// ============================================================
// 🔹 NORMALIZA TEXTO
// ============================================================
function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ============================================================
// 🔹 EXTRAI PALAVRAS-CHAVE
// ============================================================
function extrairPalavrasChave(resposta) {
    const normalizada = normalizar(resposta);
    const palavras = normalizada.split(' ').filter(p =>
        p.length >= 3 && !PALAVRAS_IGNORADAS.has(p)
    );
    return [...new Set(palavras)];
}

// ============================================================
// 🔹 VERIFICA RESPOSTA (MATCH INTELIGENTE)
// ============================================================
function verificarResposta(respostaUsuario, respostaCorreta) {
    const userNorm = normalizar(respostaUsuario);
    const corretaNorm = normalizar(respostaCorreta);

    // 1️⃣ Match exato
    if (userNorm === corretaNorm) {
        return { ok: true, motivo: 'exato' };
    }

    // 2️⃣ Match direto (um contém o outro)
    if (userNorm.includes(corretaNorm) || corretaNorm.includes(userNorm)) {
        if (userNorm.length >= 3) {
            return { ok: true, motivo: 'contains' };
        }
    }

    // 3️⃣ Palavras-chave
    const keywords = extrairPalavrasChave(respostaCorreta);
    if (keywords.length === 0) {
        return { ok: false };
    }

    const palavrasUser = userNorm.split(' ').filter(p => p.length >= 3);
    const keywordsEncontradas = keywords.filter(kw =>
        userNorm.includes(kw) || palavrasUser.includes(kw)
    );

    // Todas as keywords
    if (keywordsEncontradas.length === keywords.length) {
        return { ok: true, motivo: 'keywords_todas' };
    }

    // Pelo menos 1 keyword forte (4+ letras)
    const keywordsFortes = keywordsEncontradas.filter(kw => kw.length >= 4);
    if (keywordsFortes.length >= 1) {
        return { ok: true, motivo: 'keyword_forte', matched: keywordsFortes };
    }

    // Resposta de 1 palavra só
    if (keywords.length === 1 && keywordsEncontradas.length === 1) {
        return { ok: true, motivo: 'unica_palavra' };
    }

    return { ok: false, keywords, keywordsEncontradas };
}

// ============================================================
// 🔥 COMANDO
// ============================================================
module.exports = {
    nome: "resposta",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // 🔍 Verifica se tem pergunta ativa
            const pergunta = getPerguntaAtiva(remoteJid);
            if (!pergunta) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Não há pergunta ativa no momento.\n\n" +
                          "Digite *!pergunta* para uma nova."
                });
            }

            // 📝 Verifica se o usuário digitou algo
            const respostaUsuario = args.join(" ").trim();
            if (!respostaUsuario) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Digite sua resposta!\n\n" +
                          "Exemplo: *!resposta 42*"
                });
            }

            // 🧙 Carrega o jogador
            const jogador = new Jogador(remetenteId);
            try {
                await jogador.carregar();
            } catch (e) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Você precisa usar *!perfil* primeiro para se registrar!"
                });
            }

            // 📊 Verifica limite diário
            const controle = getControle(remetenteId);
            if (controle.perguntas >= LIMITE_DIARIO) {
                return sock.sendMessage(remoteJid, {
                    text: `🚫 *LIMITE DIÁRIO ATINGIDO!*\n\n` +
                          `📊 Você já respondeu ${controle.perguntas} perguntas hoje.\n` +
                          `🔄 Volte amanhã!`
                });
            }

            // 🎯 Verifica a resposta
            const resultado = verificarResposta(respostaUsuario, pergunta.resposta);

            // ============================================================
            // ✅ RESPOSTA CORRETA
            // ============================================================
            if (resultado.ok) {
                removerPergunta(remoteJid);

                // Conta acerto em memória
                incrementarPergunta(remetenteId);

                // Recompensas
                let upou = false;
                let novoNivel = jogador.dados?.nivel || 1;

                try {
                    const resultXP = await jogador.adicionarXp(15);
                    upou = resultXP.upou;
                    novoNivel = resultXP.novoNivel;
                } catch (err) {
                    console.error('❌ Erro ao adicionar XP:', err.message);
                }

                try {
                    await jogador.adicionarOuro(100);
                } catch (err) {
                    console.error('❌ Erro ao adicionar ouro:', err.message);
                }

                // 🎮 Registra no ranking de jogos
                await registrarJogo(
                    remetenteId,
                    "quiz",
                    "vitoria",
                    5,
                    `[${pergunta.categoriaAtiva || 'geral'}] ${pergunta.pergunta.substring(0, 50)}`
                );

                const controleAtualizado = getControle(remetenteId);

                let extra = "";
                if (resultado.motivo === 'keyword_forte' || resultado.motivo === 'keywords_todas') {
                    extra = `\n💡 _Match inteligente aceito!_`;
                }

                await sock.sendMessage(remoteJid, {
                    text: `✅ *RESPOSTA CORRETA!*\n\n` +
                          `🎉 Parabéns, você acertou!\n\n` +
                          `💰 +R$100\n` +
                          `⭐ +15 XP\n` +
                          `🎮 +5 pontos no ranking\n` +
                          (upou ? `🎊 *UP!* Você subiu para o nível ${novoNivel}!\n` : "") +
                          `📊 Perguntas hoje: ${controleAtualizado.perguntas}/${LIMITE_DIARIO}\n\n` +
                          `🔍 Resposta correta: *${pergunta.resposta}*` +
                          extra
                });
                return;
            }

            // ============================================================
            // ❌ RESPOSTA ERRADA
            // ============================================================
            incrementarErro(remetenteId);

            // 🎮 Registra derrota
            await registrarJogo(
                remetenteId,
                "quiz",
                "derrota",
                -1,
                `[${pergunta.categoriaAtiva || 'geral'}] Errou: "${respostaUsuario.substring(0, 30)}" | Correta: "${pergunta.resposta}"`
            );

            await sock.sendMessage(remoteJid, {
                text: `❌ *RESPOSTA ERRADA!*\n\n` +
                      `😅 Que pena, tente novamente!\n\n` +
                      `💡 Dica: ${pergunta.dica || "Leia atentamente a pergunta."}\n\n` +
                      `🎮 -1 ponto no ranking`
            });

        } catch (err) {
            console.error("❌ Erro no comando resposta:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao processar resposta: ${err.message}`
            });
        }
    },

    // ============================================================
    // 🔹 EXPORTAÇÕES ÚTEIS
    // ============================================================
    verificarResposta,
    normalizar,
    extrairPalavrasChave
};
