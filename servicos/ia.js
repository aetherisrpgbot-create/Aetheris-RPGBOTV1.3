// servicos/ia.js - IA SEM THINK (USANDO GPT-OSS-120B)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Groq = require('groq-sdk');
const { exec } = require('child_process');

// 🔥 VERIFICA A CHAVE
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY não encontrada no .env');
    process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SCRIPT_PATH = path.join(__dirname, '../ia_brain.py');

// ============================================================
// 🔥 FUNÇÕES DO BANCO (VIA PYTHON)
// ============================================================

function executarPython(modo, ...args) {
    return new Promise((resolve, reject) => {
        const argsEscapados = args.map(a => `"${String(a).replace(/"/g, '\\"')}"`).join(' ');
        const cmd = `python3 "${SCRIPT_PATH}" ${modo} ${argsEscapados}`;

        exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                reject(new Error(`Erro ao parsear JSON: ${stdout}`));
            }
        });
    });
}

async function buscarConhecimento(usuarioId, personagem, pergunta) {
    try {
        const result = await executarPython('buscar', usuarioId, personagem, pergunta);
        return result.resposta || null;
    } catch (e) {
        return null;
    }
}

async function salvarConhecimento(usuarioId, personagem, pergunta, resposta) {
    try {
        await executarPython('salvar', usuarioId, personagem, pergunta, resposta);
    } catch (e) {}
}

async function salvarHistorico(usuarioId, personagem, pergunta, resposta, contexto = '') {
    try {
        await executarPython('historico', usuarioId, personagem, pergunta, resposta, contexto);
    } catch (e) {}
}

async function buscarHistorico(usuarioId, personagem, limite = 5) {
    try {
        const result = await executarPython('historico_buscar', usuarioId, personagem, limite);
        return result.historico || [];
    } catch (e) {
        return [];
    }
}

// ============================================================
// 🔥 LORE DE AETHERIS (RESUMIDA)
// ============================================================

const LORE_AETHERIS = `
🌍 AETHERIS - O mundo onde sua aventura começa.
O equilíbrio do mundo era mantido pelo Coração do Mundo.
O Devorador surgiu e quebrou o Coração em fragmentos.
A Ordem do RPGBOT foi criada para recuperar os fragmentos.
Você é um aventureiro da Ordem. Sua jornada começa agora.
`;

// ============================================================
// 🔥 TUTORIAL DO BOT
// ============================================================

const TUTORIAL_RPGBOT = `
⚔️ COMBATE: !treino, !atacar, !golpe, !combo, !usarskill
📊 STATUS: !perfil, !ranking, !rankrico
🏰 DUNGEON: !dungeon, !dungeon entrar, !datacar
🎯 JOGADOR: !classe, !skills, !inventario, !loja, !comprar
💰 ECONOMIA: !trabalhar, !descansar, !saldo, !depositar, !sacar
🎨 MÍDIA: !sticker, !play, !imgeditar, !baixar
`;

// ============================================================
// 🔥 PERSONAGENS
// ============================================================

const PERSONAGENS = {
    oraculo: {
        id: 'oraculo',
        nome: '🔮 ORÁCULO DE AETHERIS',
        descricao: 'Sábio que vê passado, presente e futuro.',
        contexto: `Você é o ORÁCULO DE AETHERIS.
Fale com sabedoria, mistério e drama.
Use metáforas e enigmas.
NUNCA use tags como <think> ou <thinking>.
Responda APENAS a resposta final.`
    },
    armeiro: {
        id: 'armeiro',
        nome: '⚔️ MESTRE ARMEIRO GORM',
        descricao: 'Ferreiro lendário da Ordem.',
        contexto: `Você é GORM, o Mestre Armeiro.
Fale de forma rústica, direta e experiente.
NUNCA use tags como <think> ou <thinking>.
Responda APENAS a resposta final.`
    },
    clerigo: {
        id: 'clerigo',
        nome: '🙏 CLÉRIGO ALDRIC',
        descricao: 'Guardião das poções e curas.',
        contexto: `Você é ALDRIC, um clérigo sábio.
Fale com serenidade e compaixão.
NUNCA use tags como <think> ou <thinking>.
Responda APENAS a resposta final.`
    },
    mestre: {
        id: 'mestre',
        nome: '📜 MESTRE SÁBIO THEODORO',
        descricao: 'Erudito dos Fragmentos do Coração.',
        contexto: `Você é THEODORO, o Mestre da Biblioteca.
Fale com sabedoria e entusiasmo.
NUNCA use tags como <think> ou <thinking>.
Responda APENAS a resposta final.`
    },
    criador: {
        id: 'criador',
        nome: '👑 WIDNES, O ARCANJO',
        descricao: 'Fundador lendário da Ordem.',
        contexto: `Você é WIDNES, o Arcanjo de Aetheris.
Fale com autoridade e imponência.
NUNCA use tags como <think> ou <thinking>.
Responda APENAS a resposta final.`
    }
};

// ============================================================
// 🔥 EXECUTAR COMANDOS
// ============================================================

const comandos = require('../comandos/index.js');

async function executarComando(comando, args, sock, msg, remetenteId, remoteJid, isGroup) {
    const cmd = comandos.get(comando);
    if (!cmd) return null;
    try {
        return await cmd(sock, msg, args, remetenteId, remoteJid, isGroup);
    } catch (err) {
        return null;
    }
}

// ============================================================
// 🔥 ORGANIZAR RESPOSTA
// ============================================================

function organizarResposta(texto, tipo = 'geral') {
    if (!texto) return '🤔 Não consegui pensar em uma resposta agora.';
    const emojis = { perfil: '👤', batalhar: '⚔️', loja: '🏪', craft: '🛠️', dungeon: '🏰', classe: '🎯', ranking: '🏆', geral: '🧠' };
    const emoji = emojis[tipo] || emojis.geral;
    let resposta = texto;
    if (!resposta.includes('*')) resposta = `*${emoji} RESPOSTA*\n\n${resposta}`;
    resposta = resposta.replace(/^\s*-\s*/gm, '• ');
    return resposta;
}

function gerarComentarioNPC(personagemId) {
    const comentarios = {
        oraculo: ['🔮 O destino te observa.', '🔮 O futuro ainda não está escrito.'],
        armeiro: ['⚔️ Ferro e fogo!', '⚔️ Boa escolha, aventureiro!'],
        clerigo: ['🙏 Que os deuses te guiem.', '🙏 Sua fé te fortalece.'],
        mestre: ['📜 Cada ação escreve sua história.', '📜 Conhecimento é poder.'],
        criador: ['👑 A Ordem se orgulha de você.', '👑 Não me faça repetir.']
    };
    const lista = comentarios[personagemId] || comentarios.oraculo;
    return lista[Math.floor(Math.random() * lista.length)];
}

// ============================================================
// 🔹 CONVERTER NOME (UNICODE → TEXTO NORMAL)
// ============================================================

async function converterNome(nome) {
    try {
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                {
                    role: 'system',
                    content: `Você é um conversor de nomes.
Sua tarefa é converter nomes com caracteres Unicode especiais (como 𝖂𝖎𝖉𝖓𝖊𝖘, 𝕾𝖆𝖓𝖙𝖔𝖘) para texto normal (Widnes Santos).

REGRAS:
- Converta APENAS o nome
- NÃO adicione explicações
- NÃO use tags como <think>
- Devolva APENAS o nome convertido
- Se não souber converter, devolva o nome original`
                },
                {
                    role: 'user',
                    content: nome
                }
            ],
            temperature: 0.1,
            max_tokens: 50,
        });

        let resposta = completion.choices[0].message.content;
        resposta = resposta.replace(/<think>.*?<\/think>/gs, '');
        resposta = resposta.replace(/<thinking>.*?<\/thinking>/gs, '');
        resposta = resposta.trim();

        return resposta || nome;
    } catch (err) {
        console.error('Erro ao converter nome:', err.message);
        return nome;
    }
}

// ============================================================
// 🔥 GERAR RESPOSTA (SEM THINK!)
// ============================================================

async function gerarResposta(personagemId, pergunta, nomeUsuario = 'Aventureiro', usuarioId = null, sock = null, msg = null, remoteJid = null, isGroup = false) {
    const personagem = PERSONAGENS[personagemId];
    if (!personagem) return '❌ Personagem não encontrado!';

    // 🔥 VERIFICA SE É UM COMANDO
    if (pergunta.startsWith('!')) {
        const partes = pergunta.slice(1).trim().split(/\s+/);
        const comando = partes[0].toLowerCase();
        const args = partes.slice(1);
        const resultado = await executarComando(comando, args, sock, msg, usuarioId, remoteJid, isGroup);
        if (resultado) {
            const comentario = gerarComentarioNPC(personagemId);
            return organizarResposta(`${comentario}\n\n${resultado}`, comando);
        }
    }

    // 🔥 BUSCA NO BANCO
    if (usuarioId) {
        const conhecimento = await buscarConhecimento(usuarioId, personagemId, pergunta);
        if (conhecimento) return organizarResposta(conhecimento, 'geral');
    }

    // 🔥 BUSCA HISTÓRICO
    let historico = '';
    if (usuarioId) {
        const conversas = await buscarHistorico(usuarioId, personagemId, 3);
        if (conversas.length > 0) {
            historico = '\n📜 HISTÓRICO:\n';
            for (const conv of conversas) {
                historico += `- ${nomeUsuario}: "${conv.pergunta}"\n`;
                historico += `- ${personagem.nome}: "${conv.resposta?.slice(0, 80)}..."\n\n`;
            }
        }
    }

    // 🔥 MONTA PROMPT (SEM THINK!)
    const systemPrompt = `
${LORE_AETHERIS}

${personagem.contexto}

📚 TUTORIAL: ${TUTORIAL_RPGBOT}

${historico}

⚠️ REGRA ABSOLUTA: NUNCA use tags como <think> ou <thinking>.
NUNCA mostre seu processo de pensamento.
Responda APENAS a resposta final, em português brasileiro, de forma direta e imersiva.

VOCÊ É ${personagem.nome}. Responda como seu personagem.
`;

    // 🔥 CHAMA GROQ (MODELO SEM THINK)
    try {
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',  // ← NÃO GERA THINK!
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${nomeUsuario} pergunta: "${pergunta}"` }
            ],
            temperature: 0.8,
            max_tokens: 400,
        });

        let resposta = completion.choices[0].message.content;
        resposta = resposta.replace(/^["']|["']$/g, '');
        resposta = resposta.trim();

        // 🔥 SALVA NO BANCO
        if (usuarioId && resposta && resposta.length > 10) {
            await salvarConhecimento(usuarioId, personagemId, pergunta, resposta);
            await salvarHistorico(usuarioId, personagemId, pergunta, resposta);
        }

        return organizarResposta(resposta, 'geral');

    } catch (err) {
        console.error('❌ Erro na IA:', err.message);
        return '🌙 O personagem está em silêncio... Tente novamente mais tarde.';
    }
}

// ============================================================
// 🔥 LISTAR PERSONAGENS
// ============================================================

function listarPersonagens() {
    let msg = `🧙 *PERSONAGENS DE AETHERIS*\n\n`;
    for (const [id, p] of Object.entries(PERSONAGENS)) {
        msg += `${p.nome}\n📝 ${p.descricao}\n🆔 !${id} <pergunta>\n\n`;
    }
    msg += `\n📌 Exemplo: !oraculo Qual é o meu destino?`;
    return msg;
}

function getLore() {
    return LORE_AETHERIS;
}

// ============================================================
// 🔥 EXPORTAÇÕES
// ============================================================

module.exports = {
    converterNome,
    PERSONAGENS,
    gerarResposta,
    organizarResposta,
    executarComando,
    listarPersonagens,
    getLore,
    LORE_AETHERIS,
    buscarConhecimento,
    salvarConhecimento,
    salvarHistorico,
    buscarHistorico
};
