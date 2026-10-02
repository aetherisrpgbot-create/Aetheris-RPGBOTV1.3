// comandos/rpg/desequipar.js - USANDO SQLITE
const { Jogador } = require('../../servicos/jogador');
const ITENS_BASE = require('../../dados/itens_base');
const { converterSlot, listarSlots, SLOTS_NOMES } = require('../../dados/slots');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    nome: "desequipar",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // SE NÃO TIVER ARGUMENTO, MOSTRA EQUIPADOS
            if (!args || args.length === 0) {
                const resultado = await new Promise((resolve) => {
                    const python = path.join(__dirname, '../../core/rpg_db.py');
                    exec(`python3 "${python}" jogador_equipamentos_formatados "${remetenteId}"`, (error, stdout) => {
                        if (error) {
                            resolve({ erro: error.message });
                            return;
                        }
                        try {
                            resolve(JSON.parse(stdout));
                        } catch {
                            resolve({ erro: 'Erro ao processar' });
                        }
                    });
                });

                if (resultado.erro) {
                    return sock.sendMessage(remoteJid, {
                        text: `❌ ${resultado.erro}`
                    });
                }

                return sock.sendMessage(remoteJid, {
                    text: resultado.texto || '❌ Nenhum item equipado!'
                });
            }

            // PEGA O SLOT
            const slotRaw = args.join(' ');
            const slot = converterSlot(slotRaw);

            // DESEQUIPA USANDO SQLITE
            const desequipar = await new Promise((resolve) => {
                const python = path.join(__dirname, '../../core/rpg_db.py');
                exec(`python3 "${python}" jogador_desequipar "${remetenteId}" "${slot}"`, (error, stdout) => {
                    if (error) {
                        resolve({ erro: error.message });
                        return;
                    }
                    try {
                        resolve(JSON.parse(stdout));
                    } catch {
                        resolve({ erro: 'Erro ao processar' });
                    }
                });
            });

            if (desequipar.erro) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ ${desequipar.erro}`
                });
            }

            if (!desequipar.success) {
                return sock.sendMessage(remoteJid, {
                    text: `❌ ${desequipar.erro || 'Erro ao desequipar'}`
                });
            }

            return sock.sendMessage(remoteJid, {
                text: `✅ Item removido de ${SLOTS_NOMES[slot]}!`
            });

        } catch (error) {
            console.error('Erro no desequipar:', error);
            return sock.sendMessage(remoteJid, {
                text: `❌ Erro: ${error.message}`
            });
        }
    }
};
