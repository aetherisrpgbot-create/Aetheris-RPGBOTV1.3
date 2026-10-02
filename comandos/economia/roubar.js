// comandos/economia/roubar.js - ROUBAR OURO DE OUTRO JOGADOR
const { Jogador } = require('../../servicos/jogador');
const { getDestinatario } = require('../../utils/mencoes');

// ============================================================
// 🔹 CONFIGURAÇÕES
// ============================================================

const CONFIG = {
    // Chance de sucesso do roubo (60%)
    CHANCE_SUCESSO: 0.5,
    
    // Porcentagem máxima que pode roubar (20%)
    PORCENTAGEM_MAXIMA: 0.20,
    
    // Ouro mínimo pra roubar
    OURO_MINIMO: 10,
    
    // Custo de stamina
    CUSTO_STAMINA: 20,
    
    // Penalidade se falhar (perde 10% do ouro)
    PENALIDADE_FALHA: 0.10,
    
    // Cooldown em minutos
    COOLDOWN_MINUTOS: 10
};

// ============================================================
// 🔹 COOLDOWN (EM MEMÓRIA)
// ============================================================

const cooldowns = new Map();

function verificarCooldown(usuarioId) {
    const agora = Date.now();
    const ultimoRoubo = cooldowns.get(usuarioId);
    
    if (!ultimoRoubo) return { ok: true };
    
    const tempoPassado = agora - ultimoRoubo;
    const cooldownMs = CONFIG.COOLDOWN_MINUTOS * 60 * 1000;
    
    if (tempoPassado < cooldownMs) {
        const restante = Math.ceil((cooldownMs - tempoPassado) / 1000 / 60);
        return {
            ok: false,
            restante: restante
        };
    }
    
    return { ok: true };
}

// ============================================================
// 🔹 COMANDO
// ============================================================

module.exports = {
    nomes: ["roubar", "steal", "assaltar", "furtar", "rouba", "roube"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // 🔥 PEGA O DESTINATÁRIO (MENÇÃO OU RESPOSTA)
            // ============================================================
            
            const destinatario = getDestinatario(msg);
            
            if (!destinatario) {
                return sock.sendMessage(remoteJid, {
                    text: `🗡️ *SISTEMA DE ROUBO*\n\n` +
                          `📌 *Como usar:*\n` +
                          `   !roubar @usuario\n` +
                          `   (ou responda a mensagem de alguém)\n\n` +
                          `📌 *Regras:*\n` +
                          `   • Chance de sucesso: 60%\n` +
                          `   • Pode roubar até 20% do ouro\n` +
                          `   • Se falhar, perde 10% do seu ouro\n` +
                          `   • Custa 20 de stamina\n` +
                          `   • Cooldown: ${CONFIG.COOLDOWN_MINUTOS} minutos`
                });
            }

            const destinatarioId = destinatario.id;

            // Não pode roubar a si mesmo
            if (destinatarioId === remetenteId) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ Você não pode roubar a si mesmo!`
                });
            }

            // ============================================================
            // 🔥 VERIFICA COOLDOWN
            // ============================================================
            
            const cooldown = verificarCooldown(remetenteId);
            if (!cooldown.ok) {
                return sock.sendMessage(remoteJid, {
                    text: `⏳ *Aguarde!*\n\nVocê precisa esperar ${cooldown.restante} minuto(s) antes de roubar novamente.`
                });
            }

            // ============================================================
            // 🔥 CARREGA OS JOGADORES
            // ============================================================
            
            const ladrao = new Jogador(remetenteId);
            try {
                await ladrao.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Você ainda não tem um perfil!\n📌 Use !perfil para criar.'
                    });
                }
                throw err;
            }

            const vitima = new Jogador(destinatarioId);
            try {
                await vitima.carregar();
            } catch (err) {
                if (err.message === 'Jogador não encontrado') {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ O jogador mencionado ainda não tem um perfil!'
                    });
                }
                throw err;
            }

            // ============================================================
            // 🔥 VERIFICA STAMINA
            // ============================================================
            
            if (ladrao.dados.stamina < CONFIG.CUSTO_STAMINA) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *Stamina insuficiente!*\n\n` +
                          `⚡ Sua stamina: ${ladrao.dados.stamina}/${ladrao.dados.stamina_max}\n` +
                          `⚡ Você precisa: ${CONFIG.CUSTO_STAMINA}\n\n` +
                          `💤 Descanse com !descansar`
                });
            }

            // ============================================================
            // 🔥 VERIFICA SE A VÍTIMA TEM OURO
            // ============================================================
            
            if (vitima.dados.ouro < CONFIG.OURO_MINIMO) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ *${vitima.dados.nome} não tem ouro suficiente!*\n\n` +
                          `💰 Ouro dele(a): ${vitima.dados.ouro}\n` +
                          `💰 Mínimo para roubar: ${CONFIG.OURO_MINIMO}`
                });
            }

            // ============================================================
            // 🔥 CONSOME STAMINA
            // ============================================================
            
            ladrao.dados.stamina = Math.max(0, ladrao.dados.stamina - CONFIG.CUSTO_STAMINA);

            // ============================================================
            // 🔥 TENTA ROUBAR
            // ============================================================
            
            const chance = Math.random();
            const nomeLadrao = ladrao.dados.nome || 'Ladrão';
            const nomeVitima = vitima.dados.nome || 'Vítima';

            // ============================================================
            // 🔥 CASO 1: SUCESSO
            // ============================================================
            
            if (chance < CONFIG.CHANCE_SUCESSO) {
                // Calcula o quanto roubar (até 20% do ouro da vítima)
                const maxRoubar = Math.floor(vitima.dados.ouro * CONFIG.PORCENTAGEM_MAXIMA);
                const minimoRoubar = Math.max(1, Math.floor(maxRoubar * 0.3));
                const roubado = Math.floor(Math.random() * (maxRoubar - minimoRoubar + 1)) + minimoRoubar;
                
                // Transfere o ouro
                vitima.dados.ouro -= roubado;
                ladrao.dados.ouro += roubado;
                
                await vitima.salvar();
                await ladrao.salvar();
                
                // Registra no histórico
                try {
                    await ladrao.registrarAcao('roubo_sucesso', `Roubou ${roubado} ouro de ${nomeVitima}`);
                    await vitima.registrarAcao('roubo_sofrido', `Perdeu ${roubado} ouro para ${nomeLadrao}`);
                } catch (e) {}
                
                // Atualiza cooldown
                cooldowns.set(remetenteId, Date.now());
                
                // Envia confirmação
                let texto = `🗡️ *ROUBO BEM-SUCEDIDO!*\n\n`;
                texto += `💸 Você roubou **${roubado} ouro** de ${nomeVitima}!\n\n`;
                texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `💰 Seu ouro: ${ladrao.dados.ouro}\n`;
                texto += `⚡ Stamina: ${ladrao.dados.stamina}/${ladrao.dados.stamina_max}\n`;
                texto += `⏳ Cooldown: ${CONFIG.COOLDOWN_MINUTOS} minutos`;
                
                await sock.sendMessage(remoteJid, { text: texto });
                
                // Notifica a vítima
                try {
                    await sock.sendMessage(destinatarioId, {
                        text: `🚨 *VOCÊ FOI ROUBADO!*\n\n` +
                              `🗡️ *Ladrão:* ${nomeLadrao}\n` +
                              `💸 *Ouro roubado:* ${roubado}\n\n` +
                              `💰 Seu ouro: ${vitima.dados.ouro}`
                    });
                } catch (e) {}
                
                return;
            }

            // ============================================================
            // 🔥 CASO 2: FALHA
            // ============================================================
            
            // Penalidade: perde 10% do próprio ouro
            const ouroPerdido = Math.max(1, Math.floor(ladrao.dados.ouro * CONFIG.PENALIDADE_FALHA));
            
            if (ladrao.dados.ouro >= ouroPerdido) {
                ladrao.dados.ouro -= ouroPerdido;
                vitima.dados.ouro += ouroPerdido; // A vítima ganha o ouro perdido
                
                await ladrao.salvar();
                await vitima.salvar();
                
                try {
                    await ladrao.registrarAcao('roubo_falha', `Falhou em roubar ${nomeVitima} - Perdeu ${ouroPerdido} ouro`);
                    await vitima.registrarAcao('roubo_defendido', `Se defendeu de ${nomeLadrao} e ganhou ${ouroPerdido} ouro`);
                } catch (e) {}
            } else {
                await ladrao.salvar();
            }
            
            // Atualiza cooldown mesmo falhando
            cooldowns.set(remetenteId, Date.now());
            
            // Envia confirmação
            let texto = `❌ *ROUBO FALHOU!*\n\n`;
            texto += `🚨 ${nomeVitima} te pegou tentando roubar!\n\n`;
            if (ladrao.dados.ouro >= ouroPerdido) {
                texto += `💸 *Você perdeu:* ${ouroPerdido} ouro\n`;
                texto += `💸 *A vítima ganhou:* ${ouroPerdido} ouro\n\n`;
            }
            texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
            texto += `💰 Seu ouro: ${ladrao.dados.ouro}\n`;
            texto += `⚡ Stamina: ${ladrao.dados.stamina}/${ladrao.dados.stamina_max}\n`;
            texto += `⏳ Cooldown: ${CONFIG.COOLDOWN_MINUTOS} minutos`;
            
            await sock.sendMessage(remoteJid, { text: texto });
            
            // Notifica a vítima
            try {
                await sock.sendMessage(destinatarioId, {
                    text: `🛡️ *VOCÊ SE DEFENDEU!*\n\n` +
                          `🗡️ *Tentativa de roubo:* ${nomeLadrao}\n` +
                          `💰 *Você ganhou:* ${ouroPerdido} ouro!\n\n` +
                          `💰 Seu ouro: ${vitima.dados.ouro}`
                });
            } catch (e) {}

        } catch (err) {
            console.error("❌ ERRO roubar:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao roubar: ${err.message}`
            });
        }
    }
};
