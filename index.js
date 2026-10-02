// ============================================================
// BOT RPG - INDEX PRINCIPAL (COM 27 PREFIXOS + OBSERVER + LIMPEZA)
// ============================================================
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const comandos = require("./comandos/index.js");
const { getTexto } = require("./utils/helpers.js");
const { setupAutomatico } = require("./handlers/automatico.js");
const { isAutorizado } = require("./config/auth.js");
const { logComando, atualizarEstatisticas, atualizarPerfilAvancado } = require("./servicos/database");
const { iniciarLimpezaAutomatica } = require('./core/limpeza_temp');

// ============================================================
// 🔥 27 PREFIXOS DO RPGBOT
// ============================================================

const PREFIXOS = [
    '!', '/', '.', ',', ';', ':',           // 6 básicos
    '+', '-', '*', '=', '%', '#', '&',       // 7 matemáticos
    '?', '¡', '¿',                          // 3 interrogação
    '$', '^', '~', '|', '\\',           // 6 especiais
    '<', '>', '[', ']', '_'                  // 5 caracteres
];

const PASTA_AUTH = './auth_info';
const NUMERO_BOT = process.env.PHONE_NUMBER || "558195892386";

const processedMessages = new Set();

// ============================================================
// 🔹 DETECTAR PREFIXO
// ============================================================

function detectarPrefixo(texto) {
    for (const prefixo of PREFIXOS) {
        if (texto.startsWith(prefixo)) {
            return prefixo;
        }
    }
    return null;
}

// ============================================================
// 🔹 EXTRAIR COMANDO (COM SUPORTE A PREFIXOS DUPLICADOS)
// ============================================================

function extrairComando(texto) {
    const prefixo = detectarPrefixo(texto);
    
    if (!prefixo) {
        return null;
    }
    
    // Remove o prefixo inicial
    let semPrefixo = texto.slice(prefixo.length).trim();
    
    // 🔥 REMOVE PREFIXOS DUPLICADOS (ex: "!!perfil", "!/perfil", "!.!perfil")
    let tentativas = 0;
    while (semPrefixo.length > 0 && tentativas < 10) {
        const prefixoDuplicado = detectarPrefixo(semPrefixo);
        if (!prefixoDuplicado) break;
        semPrefixo = semPrefixo.slice(prefixoDuplicado.length).trim();
        tentativas++;
    }
    
    // Separa comando e argumentos
    const partes = semPrefixo.split(/\s+/);
    const cmdNome = partes[0].toLowerCase();
    const args = partes.slice(1);
    
    if (!cmdNome) {
        return null;
    }
    
    return { cmdNome, args, prefixo };
}

// ============================================================
// 🔹 FUNÇÃO PRINCIPAL
// ============================================================

async function startBot() {
    const logger = pino({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState(PASTA_AUTH);

    const sock = makeWASocket({
        logger,
        auth: state,
        printQRInTerminal: false,
        browser: ['Linux', 'Chrome', '120.0.0']
    });

    // ============================================================
    // 🔹 CONEXÃO
    // ============================================================
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 QR Code gerado (use o código de pareamento)');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log(`🔴 Desconectado. Código: ${code}`);
            if (code !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconectando em 5 segundos...');
                setTimeout(startBot, 5000);
            } else {
                console.log('❌ Sessão expirada. Delete a pasta "auth_info" e reinicie.');
            }
        } else if (connection === 'open') {
            console.log('');
            console.log('╔═══════════════════════════════════════════╗');
            console.log('║   ✅ BOT CONECTADO COM SUCESSO!           ║');
            console.log('║   👑 Criado por Widnes Santos             ║');
            console.log('║   📦 Sistema RPG carregado!               ║');
            console.log(`║   🔥 ${PREFIXOS.length} PREFIXOS ATIVOS!                    ║`);
            console.log('╚═══════════════════════════════════════════╝');
            console.log('');
            
            // Inicia a limpeza automática
            iniciarLimpezaAutomatica();
            
            setupAutomatico(sock);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ============================================================
    // 🔹 PAIRING CODE
    // ============================================================
    
    if (!fs.existsSync(path.join(PASTA_AUTH, 'creds.json'))) {
        console.log('📱 Gerando código de pareamento...');
        console.log(`📱 Número: ${NUMERO_BOT}`);
        console.log('📌 Abra o WhatsApp → Configurações → Dispositivos vinculados → Vincular com código');
        
        try {
            console.log('⏳ Aguardando 5 segundos...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const codigo = await sock.requestPairingCode(NUMERO_BOT);
            console.log('');
            console.log('╔═══════════════════════════════════════════╗');
            console.log(`║   🔑 CÓDIGO: ${codigo}              ║`);
            console.log('╚═══════════════════════════════════════════╝');
            console.log('');
        } catch (err) {
            console.log('❌ Erro ao gerar código:', err.message);
        }
    }

    // ============================================================
    // 🔹 EVENTO DE MENSAGEM
    // ============================================================
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message || msg.key?.fromMe) return;

        const msgId = msg.key.id;
        if (processedMessages.has(msgId)) return;
        processedMessages.add(msgId);

        setTimeout(() => {
            processedMessages.delete(msgId);
        }, 5000);

        const remoteJid = msg.key.remoteJid;
        const remetenteId = msg.key.participant || remoteJid;
        const texto = getTexto(msg);
        const isGroup = remoteJid?.endsWith('@g.us');

        if (!isAutorizado(remetenteId, remoteJid)) {
            return;
        }

        if (isGroup) {
            try {
                const { handleAntiViewOnce } = require("./handlers/anti_viewonce");
                await handleAntiViewOnce(sock, msg, remoteJid);
            } catch (err) {
                console.log("⚠️ Erro no anti-viewonce:", err.message);
            }
        }

        // 🔥 USA A FUNÇÃO NOVA (27 PREFIXOS)
        const comandoInfo = extrairComando(texto);

        if (comandoInfo) {
            const { cmdNome, args, prefixo } = comandoInfo;

            console.log(`👉 Comando: ${cmdNome} (prefixo: "${prefixo}")`);

            logComando(remetenteId, cmdNome, args, remoteJid);
            atualizarEstatisticas(cmdNome, remetenteId);
            atualizarPerfilAvancado(remetenteId);

            const comando = comandos.get(cmdNome);
            if (comando) {
                try {
                    const resultado = await comando.executar(sock, msg, args, remetenteId, remoteJid, isGroup);

                    // 🔥 OBSERVER (SISTEMA DE MISSÕES)
                    const { 
                        eventoComando, 
                        eventoTreinar, 
                        eventoTrabalhar, 
                        eventoColetar, 
                        eventoMatar, 
                        eventoExplorar 
                    } = require('./core/observer');
                    
                    const mapaEventos = {
                        'perfil': () => eventoComando(remetenteId, 'perfil'),
                        'treino': () => eventoTreinar(remetenteId),
                        'trabalhar': () => eventoTrabalhar(remetenteId),
                        'coletar': () => {
                            const item = args[0] || 'aleatorio';
                            return eventoColetar(remetenteId, item);
                        },
                        'matar': () => {
                            const criatura = args[0] || 'desconhecido';
                            return eventoMatar(remetenteId, criatura);
                        },
                        'explorar': () => {
                            const area = args[0] || 'desconhecida';
                            return eventoExplorar(remetenteId, area);
                        },
                        'batalhar': () => {
                            if (resultado && resultado.venceu) {
                                const criatura = resultado.criatura || 'desconhecido';
                                return eventoMatar(remetenteId, criatura);
                            }
                            return null;
                        }
                    };

                    const evento = mapaEventos[cmdNome];
                    if (evento) {
                        try {
                            const resultadoEvento = await evento();
                            if (resultadoEvento && (resultadoEvento.concluida || resultadoEvento.progresso)) {
                                if (resultadoEvento.mensagem) {
                                    await sock.sendMessage(remoteJid, { 
                                        text: resultadoEvento.mensagem 
                                    });
                                }
                            }
                        } catch (err) {
                            console.error('❌ Erro no observer:', err);
                        }
                    }

                } catch (err) {
                    console.error(`❌ Erro no comando ${cmdNome}:`, err);
                    await sock.sendMessage(remoteJid, {
                        text: '❌ Ocorreu um erro ao executar esse comando.'
                    });
                }
            } else {
                await sock.sendMessage(remoteJid, {
                    text: `❌ Comando *${cmdNome}* não encontrado.\nUse !menu para ver os comandos disponíveis.`
                });
            }
        }
    });
}

// ============================================================
// 🔹 START
// ============================================================

startBot().catch(console.error);
