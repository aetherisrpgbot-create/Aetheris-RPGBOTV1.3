// core/mensagens.js - CENTRALIZADOR DE MENSAGENS DE MISSÃO/CONQUISTA

const { getNPC } = require('../dados/npcs');
const ITENS_BASE = require('../dados/itens_base');

// ============================================================
// 🔹 GERAR MENSAGEM DE PROGRESSO
// ============================================================

function gerarMensagemProgresso(missao, progressoAtual) {
    const npc = getNPC(missao.npc);
    const total = missao.objetivos?.length || 1;
    const dialogos = missao.dialogos || {};
    
    let texto = `📜 *${missao.nome}*\n\n`;
    texto += `👤 ${npc?.nome || missao.npc}:\n`;
    texto += `${dialogos.progresso || '"Continue assim!"'}\n\n`;
    texto += `📊 Progresso: ${progressoAtual}/${total}`;
    
    return texto;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE CONCLUSÃO
// ============================================================

function gerarMensagemConclusao(missao) {
    const npc = getNPC(missao.npc);
    const dialogos = missao.dialogos || {};
    const recompensas = missao.recompensas;
    
    let texto = `🎉 *MISSÃO CONCLUÍDA!*\n\n`;
    texto += `📌 ${missao.nome}\n\n`;
    texto += `👤 ${npc?.nome || missao.npc}:\n`;
    texto += `${dialogos.conclusao || '"Excelente trabalho, aventureiro!"'}\n\n`;
    texto += `📦 *Recompensas:*\n`;
    
    if (recompensas.xp) texto += `   ⭐ +${recompensas.xp} XP\n`;
    if (recompensas.ouro) texto += `   💰 +${recompensas.ouro} Ouro\n`;
    if (recompensas.item) {
        const info = ITENS_BASE[recompensas.item];
        texto += `   📦 ${info?.nome || recompensas.item}\n`;
    }
    if (recompensas.titulo) texto += `   🏷️ Título: ${recompensas.titulo}\n`;
    
    return texto;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE OFERTA DE MISSÃO
// ============================================================

function gerarMensagemOferta(missao) {
    const npc = getNPC(missao.npc);
    const dialogos = missao.dialogos || {};
    
    let texto = `📜 *${npc?.nome || missao.npc}*\n\n`;
    texto += `${dialogos.inicio || '"Tenho uma missão para você."'}\n\n`;
    texto += `📌 *${missao.nome}*\n`;
    texto += `📝 ${missao.descricao}\n\n`;
    texto += `🎯 *Objetivos:*\n`;
    for (const obj of missao.objetivos) {
        texto += `   • ${obj.descricao}\n`;
    }
    texto += `\n📦 *Recompensas:*\n`;
    if (missao.recompensas.xp) texto += `   ⭐ +${missao.recompensas.xp} XP\n`;
    if (missao.recompensas.ouro) texto += `   💰 +${missao.recompensas.ouro} Ouro\n`;
    if (missao.recompensas.item) {
        const info = ITENS_BASE[missao.recompensas.item];
        texto += `   📦 ${info?.nome || missao.recompensas.item}\n`;
    }
    texto += `\n📌 *Aceitar missão?* Basta começar a fazer os objetivos!`;
    
    return texto;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE MISSÃO EM ANDAMENTO
// ============================================================

function gerarMensagemAndamento(missao, progressoAtual) {
    const npc = getNPC(missao.npc);
    const total = missao.objetivos?.length || 1;
    const percentual = Math.floor((progressoAtual / total) * 100);
    
    let texto = `⏳ *${npc?.nome || missao.npc}*\n\n`;
    texto += `"Você ainda não completou sua missão atual."\n\n`;
    texto += `📌 ${missao.nome}\n`;
    texto += `   📊 ${progressoAtual}/${total} (${percentual}%)\n`;
    texto += `   📝 ${missao.descricao}\n\n`;
    
    // Mostra os objetivos
    texto += `🎯 *Objetivos:*\n`;
    for (const obj of missao.objetivos) {
        // Verifica se este objetivo já foi concluído (simplificado)
        const jaFeito = progressoAtual > 0;
        texto += `   ${jaFeito ? '✅' : '⬜'} ${obj.descricao}\n`;
    }
    
    return texto;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE CONQUISTA
// ============================================================

function gerarMensagemConquista(conquista) {
    let texto = `🏆 *CONQUISTA DESBLOQUEADA!*\n\n`;
    texto += `🌟 ${conquista.nome}\n`;
    texto += `📝 ${conquista.descricao}\n\n`;
    
    if (conquista.recompensas) {
        texto += `📦 *Recompensas:*\n`;
        if (conquista.recompensas.xp) texto += `   ⭐ +${conquista.recompensas.xp} XP\n`;
        if (conquista.recompensas.titulo) texto += `   🏷️ Título: ${conquista.recompensas.titulo}\n`;
    }
    
    return texto;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE NENHUMA MISSÃO
// ============================================================

function gerarMensagemSemMissoes(npcNome) {
    return `✅ *${npcNome}*\n\n"Você já completou todas as missões que eu tinha para você, jovem. Volte quando estiver mais forte."`;
}

// ============================================================
// 🔹 GERAR MENSAGEM DE ERRO
// ============================================================

function gerarMensagemErro(mensagem) {
    return `❌ ${mensagem}`;
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    gerarMensagemProgresso,
    gerarMensagemConclusao,
    gerarMensagemOferta,
    gerarMensagemAndamento,
    gerarMensagemConquista,
    gerarMensagemSemMissoes,
    gerarMensagemErro
};
