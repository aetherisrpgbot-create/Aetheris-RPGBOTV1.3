// core/conquista_system.js - SISTEMA DE CONQUISTAS

const { Jogador } = require('../servicos/jogador');

// ============================================================
// 🔹 DEFINIÇÃO DAS CONQUISTAS
// ============================================================

const CONQUISTAS = {
    'primeiro_passo': {
        id: 'primeiro_passo',
        nome: '🌟 Primeiro Passo',
        descricao: 'Complete sua primeira missão.',
        icone: '🌟',
        condicao: { tipo: 'missao', alvo: 'conheca_voce_mesmo' },
        recompensas: { xp: 20, titulo: null }
    },
    'aprendiz_de_arven': {
        id: 'aprendiz_de_arven',
        nome: '📚 Aprendiz de Arven',
        descricao: 'Treine com Arven pela primeira vez.',
        icone: '📚',
        condicao: { tipo: 'treinar', alvo: '*' },
        recompensas: { xp: 10, titulo: null }
    },
    'disciplina_em_dia': {
        id: 'disciplina_em_dia',
        nome: '💪 Disciplina em Dia',
        descricao: 'Treine 3 vezes com Arven.',
        icone: '💪',
        condicao: { tipo: 'treinar_vezes', alvo: '*', quantidade: 3 },
        recompensas: { xp: 25, titulo: null }
    },
    'coletor_iniciante': {
        id: 'coletor_iniciante',
        nome: '🌿 Coletor Iniciante',
        descricao: 'Colete 10 recursos na floresta.',
        icone: '🌿',
        condicao: { tipo: 'coletar_total', alvo: '*', quantidade: 10 },
        recompensas: { xp: 15, titulo: null }
    },
    'artesao_iniciante': {
        id: 'artesao_iniciante',
        nome: '🛠️ Artesão Iniciante',
        descricao: 'Crafte seu primeiro item.',
        icone: '🛠️',
        condicao: { tipo: 'craftar', alvo: '*' },
        recompensas: { xp: 15, titulo: null }
    },
    'equipado': {
        id: 'equipado',
        nome: '⚔️ Equipado',
        descricao: 'Equipe sua primeira ferramenta.',
        icone: '⚔️',
        condicao: { tipo: 'equipar', alvo: '*' },
        recompensas: { xp: 10, titulo: null }
    },
    'explorador_nato': {
        id: 'explorador_nato',
        nome: '🗺️ Explorador Nato',
        descricao: 'Explore 3 áreas diferentes.',
        icone: '🗺️',
        condicao: { tipo: 'explorar_total', alvo: '*', quantidade: 3 },
        recompensas: { xp: 25, titulo: '🌲 Explorador de Eldoria' }
    },
    'protetor_da_floresta': {
        id: 'protetor_da_floresta',
        nome: '🌲 Protetor da Floresta',
        descricao: 'Derrote 5 goblins e 3 trepadeiras.',
        icone: '🌲',
        condicao: { tipo: 'matar_total', alvo: 'goblin_batedor', quantidade: 5 },
        recompensas: { xp: 40, titulo: '🌱 Defensor de Eldoria' }
    },
    'a_queda_do_guardião': {
        id: 'a_queda_do_guardião',
        nome: '⚔️ A Queda do Guardião',
        descricao: 'Derrote Tharion, o Guardião Verde.',
        icone: '⚔️',
        condicao: { tipo: 'matar', alvo: 'tharion_guardiao_verde' },
        recompensas: { xp: 80, titulo: '🌳 Guardião de Eldoria' }
    }
};

// ============================================================
// 🔹 CLASSE CONQUISTA_SYSTEM
// ============================================================

class ConquistaSystem {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.jogador = null;
        this.conquistasDesbloqueadas = [];
    }

    async carregar() {
        this.jogador = new Jogador(this.usuarioId);
        await this.jogador.carregar();
        
        // Carrega conquistas já desbloqueadas
        const conquistas = await this.jogador.listarConquistas();
        this.conquistasDesbloqueadas = conquistas.map(c => c.conquista_id);
        
        return this;
    }

    // ============================================================
    // 🔹 VERIFICAR E DESBLOQUEAR CONQUISTAS
    // ============================================================

    async verificar(tipo, alvo, quantidade = 1, dados = {}) {
        const desbloqueadas = [];
        
        for (const [id, conquista] of Object.entries(CONQUISTAS)) {
            // Pula se já foi desbloqueada
            if (this.conquistasDesbloqueadas.includes(id)) continue;
            
            const condicao = conquista.condicao;
            let desbloquear = false;
            
            // Verifica cada tipo de condição
            if (condicao.tipo === 'missao' && tipo === 'missao') {
                const missoes = await this.jogador.listarMissoes();
                const concluida = missoes.some(m => m.missao_id === condicao.alvo && m.status === 'concluida');
                if (concluida) desbloquear = true;
            }
            else if (condicao.tipo === 'treinar' && tipo === 'treinar') {
                desbloquear = true;
            }
            else if (condicao.tipo === 'treinar_vezes' && tipo === 'treinar') {
                // Verifica quantas vezes treinou (usando dados passados)
                const totalTreinos = dados.totalTreinos || 0;
                if (totalTreinos >= condicao.quantidade) desbloquear = true;
            }
            else if (condicao.tipo === 'coletar_total' && tipo === 'coletar') {
                const totalColetas = dados.totalColetas || 0;
                if (totalColetas >= condicao.quantidade) desbloquear = true;
            }
            else if (condicao.tipo === 'craftar' && tipo === 'craftar') {
                desbloquear = true;
            }
            else if (condicao.tipo === 'equipar' && tipo === 'equipar') {
                desbloquear = true;
            }
            else if (condicao.tipo === 'explorar_total' && tipo === 'explorar') {
                const areasExploradas = dados.areasExploradas || new Set();
                if (areasExploradas.size >= condicao.quantidade) desbloquear = true;
            }
            else if (condicao.tipo === 'matar' && tipo === 'matar') {
                if (condicao.alvo === alvo) desbloquear = true;
            }
            else if (condicao.tipo === 'matar_total' && tipo === 'matar') {
                const totalMortes = dados.totalMortes || {};
                const mortes = totalMortes[condicao.alvo] || 0;
                if (mortes >= condicao.quantidade) desbloquear = true;
            }
            
            if (desbloquear) {
                // Desbloqueia a conquista
                await this.jogador.desbloquearConquista(id);
                this.conquistasDesbloqueadas.push(id);
                
                // Aplica recompensas
                if (conquista.recompensas.xp) {
                    await this.jogador.adicionarXp(conquista.recompensas.xp);
                }
                await this.jogador.salvar();
                
                desbloqueadas.push(conquista);
            }
        }
        
        return desbloqueadas;
    }

    // ============================================================
    // 🔹 LISTAR CONQUISTAS
    // ============================================================

    async listarConquistas() {
        const todas = [];
        const desbloqueadas = this.conquistasDesbloqueadas;
        
        for (const [id, conquista] of Object.entries(CONQUISTAS)) {
            todas.push({
                ...conquista,
                desbloqueada: desbloqueadas.includes(id)
            });
        }
        
        return todas;
    }

    // ============================================================
    // 🔹 FORMATAR CONQUISTAS
    // ============================================================

    async formatarConquistas() {
        const conquistas = await this.listarConquistas();
        const desbloqueadas = conquistas.filter(c => c.desbloqueada);
        const bloqueadas = conquistas.filter(c => !c.desbloqueada);
        
        let texto = `🏆 *MINHAS CONQUISTAS*\n\n`;
        
        if (desbloqueadas.length === 0) {
            texto += 'Você ainda não desbloqueou nenhuma conquista.\n';
            texto += '\n📌 Complete missões e desafios para desbloquear!';
        } else {
            texto += `✅ *DESBLOQUEADAS (${desbloqueadas.length})*\n\n`;
            for (const c of desbloqueadas) {
                texto += `${c.icone} ${c.nome}\n`;
                texto += `   📝 ${c.descricao}\n\n`;
            }
            
            if (bloqueadas.length > 0) {
                texto += `\n🔒 *BLOQUEADAS (${bloqueadas.length})*\n\n`;
                for (const c of bloqueadas) {
                    texto += `${c.icone} ${c.nome}\n`;
                    texto += `   📝 ${c.descricao}\n\n`;
                }
            }
        }
        
        return texto;
    }
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = { ConquistaSystem, CONQUISTAS };
