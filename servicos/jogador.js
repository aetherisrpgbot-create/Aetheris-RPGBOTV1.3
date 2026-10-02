// servicos/jogador.js - CLIENTE COMPLETO PARA O BANCO DO JOGADOR
const { exec } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, '../core/rpg_db.py');

// ============================================================
// 🔥 EXECUTAR PYTHON
// ============================================================

function executarPython(modo, ...args) {
    return new Promise((resolve, reject) => {
        const argsEscapados = args.map(a => `"${String(a).replace(/"/g, '\\"')}"`).join(' ');
        const cmd = `python3 "${SCRIPT_PATH}" ${modo} ${argsEscapados}`;
        
        console.log(`🐍 [PYTHON] ${cmd}`);
        
        exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
            if (stderr) {
                console.log('⚠️ [PYTHON STDERR]', stderr.trim());
            }
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

// ============================================================
// 🔥 CLASSE JOGADOR
// ============================================================

class Jogador {
    constructor(id) {
        this.id = id;
        this.dados = null;
        this.inventario = [];
        this.equipamentos = {};
        this.mochila = { nivel: 1, slots: 10 };
    }

    // ============================================================
    // 🔹 CARREGAR JOGADOR
    // ============================================================
    async carregar() {
        const result = await executarPython('jogador_carregar', this.id);
        if (result.erro) throw new Error(result.erro);
        this.dados = result.jogador;
        this.inventario = result.inventario || [];
        this.equipamentos = result.equipamentos || {};
        this.mochila = result.mochila || { nivel: 1, slots: 10 };
        return this;
    }

    // ============================================================
    // 🔹 CRIAR JOGADOR
    // ============================================================
    async criar(nome) {
        const result = await executarPython('jogador_criar', this.id, nome);
        if (result.erro) throw new Error(result.erro);
        return this;
    }

    // ============================================================
    // 🔹 SALVAR JOGADOR
    // ============================================================
    async salvar() {
        const result = await executarPython('jogador_salvar', this.id, JSON.stringify(this.dados));
        if (result.erro) throw new Error(result.erro);
        return this;
    }

    // ============================================================
    // 🔹 ADICIONAR XP
    // ============================================================
    async adicionarXp(quantidade) {
        const result = await executarPython('jogador_xp', this.id, quantidade);
        if (result.erro) throw new Error(result.erro);
        this.dados = result.jogador;
        return { novoNivel: result.novoNivel, upou: result.upou };
    }

    // ============================================================
    // 🔹 ADICIONAR OURO
    // ============================================================
    async adicionarOuro(quantidade) {
        const result = await executarPython('jogador_ouro', this.id, quantidade);
        if (result.erro) throw new Error(result.erro);
        this.dados.ouro = result.ouro;
        return result.ouro;
    }

    // ============================================================
    // 🔹 GASTAR OURO
    // ============================================================
    async gastarOuro(quantidade) {
        const result = await executarPython('jogador_ouro_gastar', this.id, quantidade);
        if (result.erro) throw new Error(result.erro);
        if (!result.success) return false;
        this.dados.ouro = result.ouro;
        return true;
    }

    // ============================================================
    // 🔹 ADICIONAR ITEM (COM VERIFICAÇÃO DE ESPAÇO)
    // ============================================================
    async adicionarItem(itemId, quantidade = 1) {
        // 🔥 VERIFICA ESPAÇO NA MOCHILA
        const pode = await this.temEspacoParaItem(itemId);
        if (!pode.ok) {
            throw new Error(pode.message);
        }
        
        const result = await executarPython('jogador_item_adicionar', this.id, itemId, quantidade);
        if (result.erro) throw new Error(result.erro);
        this.inventario = result.inventario;
        return this;
    }

    // ============================================================
    // 🔹 REMOVER ITEM
    // ============================================================
    async removerItem(itemId, quantidade = 1) {
        const result = await executarPython('jogador_item_remover', this.id, itemId, quantidade);
        if (result.erro) throw new Error(result.erro);
        this.inventario = result.inventario;
        return this;
    }

    // ============================================================
    // 🔹 EQUIPAR ITEM
    // ============================================================
    async equipar(itemId, slot) {
        const result = await executarPython('jogador_equipar', this.id, itemId, slot);
        if (result.erro) throw new Error(result.erro);
        this.equipamentos = result.equipamentos;
        this.inventario = result.inventario;
        return result;
    }

    // ============================================================
    // 🔹 DESEQUIPAR ITEM
    // ============================================================
    async desequipar(slot) {
        const result = await executarPython('jogador_desequipar', this.id, slot);
        if (result.erro) throw new Error(result.erro);
        this.equipamentos = result.equipamentos;
        this.inventario = result.inventario;
        return result;
    }

    // ============================================================
    // 🔹 UPGRADE MOCHILA
    // ============================================================
    async upgradeMochila() {
        const result = await executarPython('jogador_mochila_upgrade', this.id);
        if (result.erro) throw new Error(result.erro);
        this.mochila = result.mochila;
        this.dados.ouro = result.ouro;
        return result;
    }

    // ============================================================
    // 🔹 DESCANSAR
    // ============================================================
    async descansar() {
        const result = await executarPython('jogador_descansar', this.id);
        if (result.erro) throw new Error(result.erro);
        this.dados.vida = result.vida;
        this.dados.mana = result.mana;
        this.dados.stamina = result.stamina;
        return this;
    }

    // ============================================================
    // 🔹 ATRIBUTOS TOTAIS
    // ============================================================
    async atributosTotais() {
        const result = await executarPython('jogador_atributos', this.id);
        if (result.erro) throw new Error(result.erro);
        return result.atributos;
    }

    // ============================================================
    // 🔹 VERIFICAR ESPAÇO NA MOCHILA
    // ============================================================
    async verificarEspaco() {
        const result = await executarPython('jogador_espaco_mochila', this.id);
        if (result.erro) throw new Error(result.erro);
        return result;
    }

    // ============================================================
    // 🔹 VERIFICAR SE TEM ESPAÇO PARA UM ITEM
    // ============================================================
    async temEspacoParaItem(itemId) {
        const espaco = await this.verificarEspaco();
        
        // Se tem slot disponível, pode adicionar
        if (espaco.disponivel > 0) {
            return { ok: true, disponivel: espaco.disponivel };
        }
        
        // Verifica se já tem o item no inventário (pode stackar até 32)
        const itemExistente = this.inventario.find(i => i.item_id === itemId);
        if (itemExistente && itemExistente.quantidade < 32) {
            return { ok: true, disponivel: 0, stack: true };
        }
        
        return { 
            ok: false, 
            message: `🎒 Mochila cheia! (${espaco.usados}/${espaco.slots} slots usados)\n📌 Use !upgrademochila para aumentar.` 
        };
    }

    // ============================================================
    // 🔹 PERFIL (FORMATADO)
    // ============================================================
    async perfil() {
        const d = this.dados;
        if (!d) throw new Error('Jogador não carregado');
        
        const espaco = await this.verificarEspaco();
        
        return `
╭━━━ 🎮 *${d.nome}* ━━━╮
🏷️ Classe: ${d.classe}
🎯 Nível: ${d.nivel}
⭐ XP: ${d.xp}/${d.xp_proximo}
📦 Inv: ${espaco.usados}/${espaco.slots} slots

❤️ Vida: ${d.vida}/${d.vida_max}
💧 Mana: ${d.mana}/${d.mana_max}
⚡ Stamina: ${d.stamina}/${d.stamina_max}

🗡️ Poder: ${d.poder}
🛡️ Defesa: ${d.defesa}
💀 Crítico: ${d.critico}%
💨 Esquiva: ${d.esquiva}%

💰 Ouro: ${d.ouro}
🏦 Banco: ${d.banco}
🌍 Bioma: ${d.bioma || 'Floresta'}
━━━━━━━━━━━━━━━━━━━━━
`;
    }

    // ============================================================
    // 🔹 EQUIPAMENTOS FORMATADOS
    // ============================================================
    async equipamentosFormatados() {
        const result = await executarPython('jogador_equipamentos_formatados', this.id);
        if (result.erro) throw new Error(result.erro);
        return result.texto;
    }

    // ============================================================
    // 🔹 INVENTÁRIO FORMATADO
    // ============================================================
    async inventarioFormatado() {
        const result = await executarPython('jogador_inventario_formatado', this.id);
        if (result.erro) throw new Error(result.erro);
        return result.texto;
    }

    // ============================================================
    // 🔹 MOCHILA FORMATADA
    // ============================================================
    async mochilaFormatada() {
        const result = await executarPython('jogador_mochila_formatada', this.id);
        if (result.erro) throw new Error(result.erro);
        return result.texto;
    }

    // ============================================================
    // 🔹 HISTÓRICO DE AÇÕES
    // ============================================================
    async historico(limite = 10) {
        const result = await executarPython('jogador_historico', this.id, limite);
        if (result.erro) throw new Error(result.erro);
        return result.historico || [];
    }

    // ============================================================
    // 🔹 REGISTRAR AÇÃO
    // ============================================================
    async registrarAcao(acao, detalhes = '') {
        const result = await executarPython('jogador_acao', this.id, acao, detalhes);
        if (result.erro) throw new Error(result.erro);
        return this;
    }

// ============================================================
// 🔹 CONQUISTAS
// ============================================================

async desbloquearConquista(conquistaId) {
    const result = await executarPython('jogador_conquista_desbloquear', this.id, conquistaId);
    if (result.erro) throw new Error(result.erro);
    return result;
}

async verificarConquista(conquistaId) {
    try {
        console.log(`🔍 Verificando conquista: ${conquistaId} para ${this.id}`);
        const result = await executarPython('jogador_conquista_verificar', this.id, conquistaId);
        console.log(`📊 Resultado da verificação:`, result);
        if (result.erro) {
            console.error('Erro no Python:', result.erro);
            return false;
        }
        // 🔥 GARANTE QUE RETORNA BOOLEANO
        return result.desbloqueada === true || result.desbloqueada === 1;
    } catch (err) {
        console.error('Erro ao verificar conquista:', err);
        return false;
    }
}

async listarConquistas() {
    const result = await executarPython('jogador_conquistas_listar', this.id);
    if (result.erro) throw new Error(result.erro);
    return result.conquistas || [];
}

// ============================================================
// 🔹 MISSÕES
// ============================================================

async aceitarMissao(missaoId) {
    const result = await executarPython('jogador_missao_aceitar', this.id, missaoId);
    if (result.erro) throw new Error(result.erro);
    return result;
}

async getProgressoMissao(missaoId) {
    const result = await executarPython('jogador_missao_progresso', this.id, missaoId);
    if (result.erro) throw new Error(result.erro);
    return result;
}

async atualizarProgressoMissao(missaoId, progresso) {
    const result = await executarPython('jogador_missao_progresso_atualizar', this.id, missaoId, progresso);
    if (result.erro) throw new Error(result.erro);
    return result;
}

async concluirMissao(missaoId) {
    const result = await executarPython('jogador_missao_concluir', this.id, missaoId);
    if (result.erro) throw new Error(result.erro);
    return result;
}

async listarMissoes() {
    const result = await executarPython('jogador_missoes_listar', this.id);
    if (result.erro) throw new Error(result.erro);
    return result.missoes || [];
}


    // ============================================================
    // 🔹 STATUS RÁPIDO
    // ============================================================
    async status() {
        const d = this.dados;
        if (!d) throw new Error('Jogador não carregado');
        return {
            nome: d.nome,
            nivel: d.nivel,
            vida: `${d.vida}/${d.vida_max}`,
            mana: `${d.mana}/${d.mana_max}`,
            stamina: `${d.stamina}/${d.stamina_max}`,
            ouro: d.ouro,
            classe: d.classe,
            vivo: d.vida > 0
        };
    }

    // ============================================================
    // 🔹 VIDA
    // ============================================================
    get vivo() {
        return this.dados?.vida > 0;
    }
}

// ============================================================
// 🔥 EXPORTAÇÕES
// ============================================================

module.exports = {
    Jogador,
    executarPython
};
