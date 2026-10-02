// utils/mencoes.js - UTILITÁRIO DE MENÇÕES

// ============================================================
// 🔹 PEGA O DESTINATÁRIO (MENÇÃO OU RESPOSTA)
// ============================================================

function getDestinatario(msg) {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    
    // 1. Tenta por MENÇÃO
    if (contextInfo?.mentionedJid && contextInfo.mentionedJid.length > 0) {
        return {
            id: contextInfo.mentionedJid[0],
            tipo: 'mencao'
        };
    }
    
    // 2. Tenta por RESPOSTA
    if (contextInfo?.participant) {
        return {
            id: contextInfo.participant,
            tipo: 'resposta'
        };
    }
    
    // 3. Nada encontrado
    return null;
}

// ============================================================
// 🔹 REMOVE A MENÇÃO DOS ARGS (SE EXISTIR)
// ============================================================

function limparArgs(args) {
    let argsLimpos = [...args];
    
    // Remove o primeiro arg se for uma menção (@12345)
    if (argsLimpos[0] && argsLimpos[0].startsWith('@')) {
        argsLimpos = argsLimpos.slice(1);
    }
    
    return argsLimpos;
}

// ============================================================
// 🔹 VERIFICA SE TEM DESTINATÁRIO
// ============================================================

function temDestinatario(msg) {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    return (contextInfo?.mentionedJid && contextInfo.mentionedJid.length > 0) ||
           contextInfo?.participant;
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    getDestinatario,
    limparArgs,
    temDestinatario
};
