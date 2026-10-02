// core/coleta.js - SISTEMA DE COLETA DE RECURSOS
const { Jogador } = require('../servicos/jogador');
const ITENS_BASE = require('../dados/itens_base');
const { ELDORIA } = require('../dados/biomas/eldoria');

// ============================================================
// 🔹 FERRAMENTAS E SUAS EFICIÊNCIAS
// ============================================================

const FERRAMENTAS = {
    // MACHADOS (para madeira)
    'machado_madeira': {
        id: 'machado_madeira',
        nome: '🪓 Machado de Madeira',
        tipo: 'machado',
        eficiencia: 1,
        recurso: 'madeira',
        bonus: 1.2
    },
    'machado_ferro': {
        id: 'machado_ferro',
        nome: '🪓 Machado de Ferro',
        tipo: 'machado',
        eficiencia: 2,
        recurso: 'madeira',
        bonus: 1.5
    },
    'machado_ouro': {
        id: 'machado_ouro',
        nome: '🪓 Machado de Ouro',
        tipo: 'machado',
        eficiencia: 3,
        recurso: 'madeira',
        bonus: 2.0
    },

    // PICARETAS (para pedra/minérios)
    'picareta_madeira': {
        id: 'picareta_madeira',
        nome: '⛏️ Picareta de Madeira',
        tipo: 'picareta',
        eficiencia: 1,
        recurso: 'pedra',
        bonus: 1.2
    },
    'picareta_ferro': {
        id: 'picareta_ferro',
        nome: '⛏️ Picareta de Ferro',
        tipo: 'picareta',
        eficiencia: 2,
        recurso: 'pedra',
        bonus: 1.5
    },
    'picareta_ouro': {
        id: 'picareta_ouro',
        nome: '⛏️ Picareta de Ouro',
        tipo: 'picareta',
        eficiencia: 3,
        recurso: 'pedra',
        bonus: 2.0
    },

    // FOICES (para ervas)
    'foice_madeira': {
        id: 'foice_madeira',
        nome: '🌿 Foice de Madeira',
        tipo: 'foice',
        eficiencia: 1,
        recurso: 'erva',
        bonus: 1.2
    },
    'foice_ferro': {
        id: 'foice_ferro',
        nome: '🌿 Foice de Ferro',
        tipo: 'foice',
        eficiencia: 2,
        recurso: 'erva',
        bonus: 1.5
    },

    // FACAS (para couro)
    'faca_couro': {
        id: 'faca_couro',
        nome: '🔪 Faca de Couro',
        tipo: 'faca',
        eficiencia: 1,
        recurso: 'couro',
        bonus: 1.2
    },
    'faca_ferro': {
        id: 'faca_ferro',
        nome: '🔪 Faca de Ferro',
        tipo: 'faca',
        eficiencia: 2,
        recurso: 'couro',
        bonus: 1.5
    }
};

// ============================================================
// 🔹 CLASSE COLETA
// ============================================================

class Coleta {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.jogador = null;
        this.bioma = null;
        this.ferramenta = null;
    }

    async carregar() {
        this.jogador = new Jogador(this.usuarioId);
        await this.jogador.carregar();

        // Pega o bioma atual (só temos Eldoria por enquanto)
        this.bioma = ELDORIA;

        // Verifica ferramenta na mão direita
        const ferramentaId = this.jogador.equipamentos?.mao_direita;
        if (ferramentaId && FERRAMENTAS[ferramentaId]) {
            this.ferramenta = FERRAMENTAS[ferramentaId];
        }

        return this;
    }

    // ============================================================
    // 🔹 VERIFICA SE PODE COLETAR
    // ============================================================

    podeColetar() {
        if (!this.jogador || !this.jogador.dados) {
            return { ok: false, message: '❌ Jogador não carregado!' };
        }

        if (this.jogador.dados.stamina < 5) {
            return { ok: false, message: '⚡ Você está exausto! Descanse com !descansar.' };
        }

        return { ok: true };
    }

    // ============================================================
    // 🔹 COLETA ALEATÓRIA
    // ============================================================

    async coletarAleatorio() {
        const pode = this.podeColetar();
        if (!pode.ok) return pode;

        if (!this.bioma || !this.bioma.recursos || this.bioma.recursos.length === 0) {
            return { message: '🌍 Nenhum recurso disponível neste bioma!' };
        }

        // Seleciona baseado na chance
        const rand = Math.random();
        let acumulado = 0;
        let recurso = this.bioma.recursos[0];
        for (const r of this.bioma.recursos) {
            acumulado += r.chance;
            if (rand <= acumulado) {
                recurso = r;
                break;
            }
        }

        const quantidade = this.calcularQuantidade(recurso);

        // 🔥 TENTA ADICIONAR O ITEM (COM VERIFICAÇÃO DE ESPAÇO)
        try {
            await this.jogador.adicionarItem(recurso.item, quantidade);
        } catch (err) {
            if (err.message.includes('Mochila cheia')) {
                return { message: `🎒 ${err.message}\n\n📌 Use !upgrademochila para aumentar sua mochila.` };
            }
            throw err;
        }

        const xpGanho = Math.floor(quantidade * 2);
        await this.jogador.adicionarXp(xpGanho);

        this.jogador.dados.stamina = Math.max(0, this.jogador.dados.stamina - 5);
        await this.jogador.salvar();

        const info = ITENS_BASE[recurso.item];
        const emoji = info?.emoji || '📦';
        const ferramentaNome = this.ferramenta ? ` (${this.ferramenta.nome} ⭐+${this.ferramenta.eficiencia})` : ' (mãos vazias)';

        let texto = `🌿 *COLETA REALIZADA!*\n\n`;
        texto += `📍 Bioma: ${this.bioma.nome}\n`;
        texto += `🔧 Ferramenta: ${ferramentaNome}\n\n`;
        texto += `✅ Encontrou: ${emoji} **${info?.nome || recurso.item}** x${quantidade}\n`;
        texto += `⭐ +${xpGanho} XP\n`;
        texto += `⚡ Stamina: ${this.jogador.dados.stamina}/${this.jogador.dados.stamina_max}`;

        return { message: texto };
    }

    // ============================================================
    // 🔹 COLETA ESPECÍFICA
    // ============================================================

    async coletarEspecifico(itemId) {
        const pode = this.podeColetar();
        if (!pode.ok) return pode;

        if (!this.bioma || !this.bioma.recursos) {
            return { message: '🌍 Nenhum recurso disponível neste bioma!' };
        }

        const recurso = this.bioma.recursos.find(r => r.item === itemId);
        if (!recurso) {
            const disponiveis = this.bioma.recursos.map(r => {
                const info = ITENS_BASE[r.item];
                return info?.nome || r.item;
            }).join(', ');
            return { message: `❌ Recurso "${itemId}" não encontrado!\n\n📌 Disponíveis: ${disponiveis}` };
        }

        const quantidade = this.calcularQuantidade(recurso);

        // 🔥 TENTA ADICIONAR O ITEM (COM VERIFICAÇÃO DE ESPAÇO)
        try {
            await this.jogador.adicionarItem(recurso.item, quantidade);
        } catch (err) {
            if (err.message.includes('Mochila cheia')) {
                return { message: `🎒 ${err.message}\n\n📌 Use !upgrademochila para aumentar sua mochila.` };
            }
            throw err;
        }

        const xpGanho = Math.floor(quantidade * 2);
        await this.jogador.adicionarXp(xpGanho);

        this.jogador.dados.stamina = Math.max(0, this.jogador.dados.stamina - 5);
        await this.jogador.salvar();

        const info = ITENS_BASE[recurso.item];
        const emoji = info?.emoji || '📦';
        const ferramentaNome = this.ferramenta ? ` (${this.ferramenta.nome} ⭐+${this.ferramenta.eficiencia})` : ' (mãos vazias)';

        let texto = `🌿 *COLETA REALIZADA!*\n\n`;
        texto += `📍 Bioma: ${this.bioma.nome}\n`;
        texto += `🔧 Ferramenta: ${ferramentaNome}\n\n`;
        texto += `✅ Encontrou: ${emoji} **${info?.nome || recurso.item}** x${quantidade}\n`;
        texto += `⭐ +${xpGanho} XP\n`;
        texto += `⚡ Stamina: ${this.jogador.dados.stamina}/${this.jogador.dados.stamina_max}`;

        return { message: texto };
    }

    // ============================================================
    // 🔹 CÁLCULO DE QUANTIDADE COM EFICIÊNCIA
    // ============================================================

	calcularQuantidade(recurso) {
    let [min, max] = [1, 1];
    if (recurso.quantidade) {
        const parts = recurso.quantidade.split('-');
        min = parseInt(parts[0]) || 1;
        max = parseInt(parts[1]) || 1;
    }

    let quantidade = Math.floor(Math.random() * (max - min + 1)) + min;

    if (this.ferramenta) {
        // Bônus específico do recurso (ex: machado para madeira)
        if (this.ferramenta.recurso === recurso.item) {
            quantidade = Math.floor(quantidade * this.ferramenta.bonus);
        }
        
        // Bônus geral de eficiência (mais forte)
        const bonusEficiencia = 1 + (this.ferramenta.eficiencia - 1) * 0.5;
        quantidade = Math.floor(quantidade * bonusEficiencia);
        
        // Bônus extra garantido por nível
        quantidade += this.ferramenta.eficiencia - 1;
    }

    return Math.max(1, quantidade);
}

    // ============================================================
    // 🔹 LISTAR RECURSOS DISPONÍVEIS
    // ============================================================

    listarRecursos() {
        if (!this.bioma || !this.bioma.recursos) {
            return '🌍 Nenhum recurso disponível!';
        }

        let texto = `📦 *Recursos disponíveis em ${this.bioma.nome}:*\n\n`;
        for (const recurso of this.bioma.recursos) {
            const info = ITENS_BASE[recurso.item];
            const chance = Math.round(recurso.chance * 100);
            const emoji = info?.emoji || '📦';
            texto += `   ${emoji} **${info?.nome || recurso.item}**\n`;
            texto += `      📊 Chance: ${chance}% | 📦 Quantidade: ${recurso.quantidade}\n`;
        }

        if (this.ferramenta) {
            texto += `\n🔧 *Ferramenta equipada:* ${this.ferramenta.nome}\n`;
            texto += `   ⭐ Eficiência: +${this.ferramenta.eficiencia}\n`;
        } else {
            texto += `\n⚠️ *Sem ferramenta!* Equipe uma para coletar mais.\n`;
            texto += `📌 Use !equipar <ferramenta> direita`;
        }

        return texto;
    }
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = { Coleta, FERRAMENTAS };
