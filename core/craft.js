// core/craft.js - SISTEMA DE CRAFTING COMPLETO (COM BUSCA INTELIGENTE)
const RECEITAS = require('../dados/receitas');
const ITENS_BASE = require('../dados/itens_base');
const { Jogador } = require('../servicos/jogador');

class Craft {
    constructor(jogadorId) {
        this.jogadorId = jogadorId;
    }

    // ============================================================
    // 🔹 BUSCAR RECEITA POR NOME (INTELIGENTE)
    // ============================================================
    buscarReceitaPorNome(nome) {
        const nomeLower = nome.toLowerCase().trim();
        const palavras = nomeLower.split(' ').filter(p => p.length > 2);
        
        // 1. Match exato
        for (const [id, receita] of Object.entries(RECEITAS)) {
            if (receita.nome.toLowerCase() === nomeLower) {
                return { id, receita, match: 'exato' };
            }
        }
        
        // 2. Match por ID
        if (RECEITAS[nomeLower]) {
            return { id: nomeLower, receita: RECEITAS[nomeLower], match: 'id' };
        }
        
        // 3. Match parcial (contém)
        for (const [id, receita] of Object.entries(RECEITAS)) {
            if (receita.nome.toLowerCase().includes(nomeLower)) {
                return { id, receita, match: 'parcial' };
            }
        }
        
        // 4. Match por palavras-chave
        if (palavras.length > 0) {
            for (const [id, receita] of Object.entries(RECEITAS)) {
                const nomeReceita = receita.nome.toLowerCase();
                const todasPalavras = palavras.every(p => nomeReceita.includes(p));
                if (todasPalavras) {
                    return { id, receita, match: 'palavras' };
                }
            }
        }
        
        // 5. Match por alias
        for (const [id, receita] of Object.entries(RECEITAS)) {
            if (receita.alias) {
                for (const alias of receita.alias) {
                    if (alias.toLowerCase() === nomeLower) {
                        return { id, receita, match: 'alias' };
                    }
                    if (alias.toLowerCase().includes(nomeLower)) {
                        return { id, receita, match: 'alias_parcial' };
                    }
                }
            }
        }
        
        return null;
    }

    // ============================================================
    // 🔹 LISTAR RECEITAS DISPONÍVEIS
    // ============================================================
    async listarReceitas() {
        const jogador = new Jogador(this.jogadorId);
        await jogador.carregar();

        const nivel = jogador.dados.nivel;
        const disponiveis = [];

        for (const [id, receita] of Object.entries(RECEITAS)) {
            if (receita.nivel_necessario <= nivel) {
                disponiveis.push({
                    id: id,
                    nome: receita.nome,
                    nivel: receita.nivel_necessario,
                    materiais: receita.materiais,
                    resultado: receita.resultado,
                    descricao: receita.descricao || 'Sem descrição',
                    tempo: receita.tempo || '5s'
                });
            }
        }

        return disponiveis;
    }

    // ============================================================
    // 🔹 VERIFICAR SE TEM MATERIAIS
    // ============================================================
    async temMateriais(materiais) {
        const jogador = new Jogador(this.jogadorId);
        await jogador.carregar();

        for (const [itemId, quantidade] of Object.entries(materiais)) {
            const item = jogador.inventario.find(i => i.item_id === itemId);
            if (!item || item.quantidade < quantidade) {
                return false;
            }
        }
        return true;
    }

    // ============================================================
    // 🔹 CONSUMIR MATERIAIS
    // ============================================================
    async consumirMateriais(materiais) {
        const jogador = new Jogador(this.jogadorId);
        await jogador.carregar();

        for (const [itemId, quantidade] of Object.entries(materiais)) {
            await jogador.removerItem(itemId, quantidade);
        }
    }

    // ============================================================
    // 🔹 CRAFTAR ITEM
    // ============================================================
    async craftar(receitaId) {
        const receita = RECEITAS[receitaId];
        if (!receita) {
            return { 
                success: false, 
                message: '❌ Receita não encontrada!\n\n📌 Use !craftar para ver as receitas disponíveis.' 
            };
        }

        const jogador = new Jogador(this.jogadorId);
        await jogador.carregar();

        // Verifica nível
        if (jogador.dados.nivel < receita.nivel_necessario) {
            return {
                success: false,
                message: `❌ Você precisa ser nível ${receita.nivel_necessario} para craftar ${receita.nome}!`
            };
        }

        // Verifica materiais
        const tem = await this.temMateriais(receita.materiais);
        if (!tem) {
            const materiaisFaltando = [];
            for (const [itemId, quantidade] of Object.entries(receita.materiais)) {
                const item = jogador.inventario.find(i => i.item_id === itemId);
                const temQtd = item ? item.quantidade : 0;
                if (temQtd < quantidade) {
                    const nome = ITENS_BASE[itemId]?.nome || itemId;
                    materiaisFaltando.push(`${nome} (${temQtd}/${quantidade})`);
                }
            }
            return {
                success: false,
                message: `❌ Materiais insuficientes!\n\n📦 Faltando:\n${materiaisFaltando.map(m => `   • ${m}`).join('\n')}`
            };
        }

        // Consome materiais
        await this.consumirMateriais(receita.materiais);

        // Adiciona o resultado
        const resultado = receita.resultado;
        await jogador.adicionarItem(resultado.id, resultado.quantidade);

        // Registra ação
        const nomeItem = ITENS_BASE[resultado.id]?.nome || resultado.id;
        try {
            await jogador.registrarAcao('craft', `${nomeItem} x${resultado.quantidade}`);
        } catch (e) {}

        await jogador.salvar();

        return {
            success: true,
            message: `✅ *${receita.nome}* craftado com sucesso!`,
            item: resultado.id,
            quantidade: resultado.quantidade,
            nomeItem: nomeItem,
            tempo: receita.tempo || '5s'
        };
    }

    // ============================================================
    // 🔹 FORMATAR LISTA DE RECEITAS
    // ============================================================
    formatarLista(receitas) {
        if (receitas.length === 0) {
            return '📋 Nenhuma receita disponível para seu nível.\n\n📌 Suba de nível para desbloquear mais receitas!';
        }

        let texto = '╭━━━ 🛠️ *RECEITAS DISPONÍVEIS* ━━━╮\n\n';
        for (const r of receitas) {
            const materiais = Object.entries(r.materiais)
                .map(([id, qtd]) => {
                    const item = ITENS_BASE[id];
                    return `${item?.nome || id} x${qtd}`;
                })
                .join(', ');
            texto += `📌 *${r.nome}*\n`;
            texto += `   🏷️ Nível ${r.nivel}\n`;
            texto += `   📦 ${materiais}\n`;
            if (r.tempo) texto += `   ⏱️ ${r.tempo}\n`;
            texto += `   📝 ${r.descricao}\n`;
            texto += `   🆔 !craftar ${r.id}\n\n`;
        }
        texto += '━━━━━━━━━━━━━━━━━━━━━\n';
        texto += '📌 Use !craftar <nome> para craftar um item!';
        return texto;
    }
}

module.exports = { Craft };
