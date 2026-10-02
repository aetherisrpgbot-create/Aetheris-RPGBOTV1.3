// core/batalha.js - SISTEMA DE BATALHA COMPLETO (COM MAPA COMPARTILHADO)
const { Jogador } = require('../servicos/jogador');
const { getDrop } = require('../dados/biomas/eldoria');
const ITENS_BASE = require('../dados/itens_base');

// ============================================================
// 🔥 MAPA COMPARTILHADO (USADO POR TODOS OS COMANDOS)
// ============================================================

const batalhasAtivas = new Map();

// ============================================================
// 🔹 CLASSE BATALHA
// ============================================================

class Batalha {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.jogador = null;
        this.encontro = null;
    }

    // ============================================================
    // 🔹 CARREGAR JOGADOR E ENCONTRO
    // ============================================================

    async carregar() {
        this.jogador = new Jogador(this.usuarioId);
        await this.jogador.carregar();
        
        if (batalhasAtivas.has(this.usuarioId)) {
            this.encontro = batalhasAtivas.get(this.usuarioId);
        }
        
        return this;
    }

    // ============================================================
    // 🔹 INICIAR ENCONTRO
    // ============================================================

    iniciarEncontro(criatura, tipo, areaId) {
        this.encontro = {
            tipo: tipo, // 'pacifica' ou 'hostil'
            criatura: criatura,
            criaturaVida: criatura.vida || 0,
            criaturaVidaMax: criatura.vida || 0,
            area: areaId,
            turno: 0
        };
        
        batalhasAtivas.set(this.usuarioId, this.encontro);
        return this.encontro;
    }

    // ============================================================
    // 🔹 FINALIZAR ENCONTRO
    // ============================================================

    finalizarEncontro() {
        batalhasAtivas.delete(this.usuarioId);
        this.encontro = null;
    }

    // ============================================================
    // 🔹 VERIFICAR SE ESTÁ EM BATALHA
    // ============================================================

    estaEmBatalha() {
        return batalhasAtivas.has(this.usuarioId);
    }

    // ============================================================
    // 🔹 VERIFICAR SE ESTÁ EM BATALHA ATIVA (turno > 0)
    // ============================================================

    estaEmBatalhaAtiva() {
        if (!this.estaEmBatalha()) return false;
        return this.encontro.turno > 0;
    }

    // ============================================================
    // 🔹 PEGAR ENCONTRO ATUAL
    // ============================================================

    getEncontro() {
        return this.encontro;
    }

    // ============================================================
    // 🔹 VERIFICAR STAMINA PARA AÇÃO
    // ============================================================

    verificarStamina(custo) {
        if (this.jogador.dados.stamina < custo) {
            return { 
                ok: false, 
                message: `❌ Stamina insuficiente! (${this.jogador.dados.stamina}/${custo})\n💤 Descanse com !descansar` 
            };
        }
        return { ok: true };
    }

    // ============================================================
    // 🔹 CONSUMIR STAMINA
    // ============================================================

    consumirStamina(custo) {
        this.jogador.dados.stamina = Math.max(0, this.jogador.dados.stamina - custo);
        return this.jogador.dados.stamina;
    }

    // ============================================================
    // 🔹 EXECUTAR AÇÃO DE ATAQUE
    // ============================================================

    async atacar(tipo = 'atacar', multiplicador = 1) {
        if (!this.estaEmBatalha()) {
            return { error: '❌ Você não está em batalha!' };
        }

        if (this.encontro.tipo === 'pacifica') {
            return { error: `🌿 ${this.encontro.criatura.nome} é pacífica! Use !matar se quiser abater.` };
        }

        if (this.jogador.dados.vida <= 0) {
            this.finalizarEncontro();
            return { error: '💀 Você está morto! Use !descansar para se recuperar.' };
        }

        const criatura = this.encontro.criatura;
        const atributos = await this.jogador.atributosTotais();
        const poder = atributos.poder || this.jogador.dados.poder;
        const defesa = atributos.defesa || this.jogador.dados.defesa;

        // Calcula dano do jogador
        let danoBase = Math.floor(poder * (0.8 + Math.random() * 0.4));
        let danoJogador = Math.max(1, danoBase - Math.floor(criatura.defesa * 0.3));
        danoJogador = Math.floor(danoJogador * multiplicador);

        // Crítico (15%)
        let critico = false;
        if (Math.random() < 0.15) {
            danoJogador = Math.floor(danoJogador * 1.8);
            critico = true;
        }

        const novaVida = Math.max(0, this.encontro.criaturaVida - danoJogador);
        this.encontro.criaturaVida = novaVida;

        let texto = `⚔️ *BATALHA*\n\n`;
        
        const nomesAcao = {
            'atacar': '💥 Ataque',
            'golpe': '⚡ Golpe Especial',
            'combo': '🌀 Combo'
        };
        
        texto += `${nomesAcao[tipo] || '💥 Ataque'}: ${danoJogador} de dano!\n`;
        if (critico) texto += `💀 *CRÍTICO!*\n`;
        texto += `❤️ ${criatura.nome}: ${novaVida}/${criatura.vida}\n\n`;

        // ============================================================
        // 🔥 INIMIGO MORREU
        // ============================================================
        if (novaVida <= 0) {
            const resultado = await this.finalizarBatalha(true);
            texto += resultado.texto;
            return { success: true, texto, resultado };
        }

        // ============================================================
        // 🔥 INIMIGO CONTRA-ATACA
        // ============================================================
        const danoInimigo = Math.max(1, Math.floor(criatura.poder * (0.8 + Math.random() * 0.4)) - Math.floor(defesa * 0.3));
        this.jogador.dados.vida = Math.max(0, this.jogador.dados.vida - danoInimigo);

        texto += `💢 ${criatura.nome} causou ${danoInimigo} de dano em você!\n`;
        texto += `❤️ Você: ${this.jogador.dados.vida}/${this.jogador.dados.vida_max}\n\n`;

        // ============================================================
        // 🔥 JOGADOR MORREU
        // ============================================================
        if (this.jogador.dados.vida <= 0) {
            const resultado = await this.finalizarBatalha(false);
            texto += resultado.texto;
            return { success: false, texto, resultado };
        }

        await this.jogador.salvar();
        batalhasAtivas.set(this.usuarioId, this.encontro);

        texto += `📌 *Ações:*\n`;
        texto += `!atacar - Ataque básico\n`;
        texto += `!golpe - Golpe especial (+50% dano, 10 stamina)\n`;
        texto += `!combo - Combo de 3 golpes (+150% dano, 15 stamina)\n`;
        texto += `!defender - Se defender\n`;
        texto += `!fugir - Tentar fugir`;

        return { success: true, texto };
    }

    // ============================================================
    // 🔹 EXECUTAR AÇÃO DE DEFESA
    // ============================================================

    async defender() {
        if (!this.estaEmBatalha()) {
            return { error: '❌ Você não está em batalha!' };
        }

        if (this.encontro.tipo === 'pacifica') {
            return { error: `🌿 ${this.encontro.criatura.nome} é pacífica! Não precisa se defender.` };
        }

        if (this.jogador.dados.vida <= 0) {
            this.finalizarEncontro();
            return { error: '💀 Você está morto! Use !descansar para se recuperar.' };
        }

        const criatura = this.encontro.criatura;
        const atributos = await this.jogador.atributosTotais();
        const defesa = atributos.defesa || this.jogador.dados.defesa;

        // Defesa reduz dano em 70%
        const danoInimigo = Math.max(1, Math.floor(criatura.poder * 0.3) - Math.floor(defesa * 0.3));
        this.jogador.dados.vida = Math.max(0, this.jogador.dados.vida - danoInimigo);

        let texto = `🛡️ *DEFENDEU!*\n\n`;
        texto += `💢 ${criatura.nome} causou ${danoInimigo} de dano em você!\n`;
        texto += `❤️ Você: ${this.jogador.dados.vida}/${this.jogador.dados.vida_max}\n`;
        texto += `❤️ ${criatura.nome}: ${this.encontro.criaturaVida}/${criatura.vida}\n\n`;

        // ============================================================
        // 🔥 JOGADOR MORREU DEFENDENDO
        // ============================================================
        if (this.jogador.dados.vida <= 0) {
            const resultado = await this.finalizarBatalha(false);
            texto += resultado.texto;
            return { success: false, texto, resultado };
        }

        await this.jogador.salvar();
        batalhasAtivas.set(this.usuarioId, this.encontro);

        texto += `📌 *Ações:*\n`;
        texto += `!atacar - Ataque básico\n`;
        texto += `!golpe - Golpe especial (+50% dano, 10 stamina)\n`;
        texto += `!combo - Combo de 3 golpes (+150% dano, 15 stamina)\n`;
        texto += `!defender - Se defender\n`;
        texto += `!fugir - Tentar fugir`;

        return { success: true, texto };
    }

    // ============================================================
    // 🔹 EXECUTAR AÇÃO DE FUGA
    // ============================================================

    async fugir() {
        if (!this.estaEmBatalha()) {
            return { error: '❌ Você não está em batalha!' };
        }

        if (this.encontro.tipo === 'pacifica') {
            this.finalizarEncontro();
            return { success: true, texto: `🌿 Você deixou ${this.encontro.criatura.nome} para trás.` };
        }

        const chance = Math.random();
        const criatura = this.encontro.criatura;
        
        if (chance < 0.5) {
            this.finalizarEncontro();
            await this.jogador.salvar();
            return { success: true, texto: `🏃‍♂️ Você fugiu da batalha contra ${criatura.nome}!` };
        } else {
            const dano = Math.max(1, Math.floor(criatura.poder * 0.6));
            this.jogador.dados.vida = Math.max(0, this.jogador.dados.vida - dano);

            let texto = `❌ *Não conseguiu fugir!*\n\n`;
            texto += `💢 ${criatura.nome} causou ${dano} de dano!\n`;
            texto += `❤️ Você: ${this.jogador.dados.vida}/${this.jogador.dados.vida_max}\n\n`;

            if (this.jogador.dados.vida <= 0) {
                const resultado = await this.finalizarBatalha(false);
                texto += resultado.texto;
                return { success: false, texto, resultado };
            }

            await this.jogador.salvar();
            batalhasAtivas.set(this.usuarioId, this.encontro);

            texto += `📌 *Ações:*\n`;
            texto += `!atacar - Ataque básico\n`;
            texto += `!golpe - Golpe especial (+50% dano, 10 stamina)\n`;
            texto += `!combo - Combo de 3 golpes (+150% dano, 15 stamina)\n`;
            texto += `!defender - Se defender\n`;
            texto += `!fugir - Tentar fugir`;

            return { success: false, texto };
        }
    }

    // ============================================================
    // 🔹 FINALIZAR BATALHA (COM PENALIDADES)
    // ============================================================

    async finalizarBatalha(venceu) {
        const criatura = this.encontro.criatura;
        this.finalizarEncontro();

        let texto = '';
        
        if (venceu) {
            const xpGanho = criatura.xp || 10;
            const ouroGanho = criatura.ouro || 3;
            
            await this.jogador.adicionarXp(xpGanho);
            await this.jogador.adicionarOuro(ouroGanho);
            
            let dropTexto = '';
            const drop = getDrop(criatura);
            if (drop) {
                try {
                    await this.jogador.adicionarItem(drop.item, drop.quantidade);
                    const info = ITENS_BASE[drop.item];
                    dropTexto = `\n📦 Drop: ${info?.nome || drop.item} x${drop.quantidade}`;
                } catch (err) {
                    if (err.message.includes('Mochila cheia')) {
                        dropTexto = `\n🎒 ${err.message}`;
                    }
                }
            }
            
            this.jogador.dados.stamina = Math.min(this.jogador.dados.stamina_max, this.jogador.dados.stamina + 10);
            await this.jogador.salvar();
            
            texto = `🎉 *VITÓRIA!*\n\n`;
            texto += `✅ Você derrotou ${criatura.nome}!\n`;
            texto += `⭐ +${xpGanho} XP\n`;
            texto += `💰 +${ouroGanho} Ouro${dropTexto}\n`;
            texto += `⚡ +10 Stamina`;
        } else {
            // PENALIDADES
            const ouroPerdido = Math.max(1, Math.floor(this.jogador.dados.ouro * 0.2));
            this.jogador.dados.ouro = Math.max(0, this.jogador.dados.ouro - ouroPerdido);
            
            const xpPerdido = Math.max(1, Math.floor(this.jogador.dados.xp * 0.1));
            this.jogador.dados.xp = Math.max(0, this.jogador.dados.xp - xpPerdido);
            
            this.jogador.dados.stamina = 0;
            
            if (this.jogador.dados.vida_max > 20) {
                this.jogador.dados.vida_max = Math.max(20, this.jogador.dados.vida_max - 1);
            }
            this.jogador.dados.vida = Math.floor(this.jogador.dados.vida_max * 0.2);
            this.jogador.dados.morreu_em = Date.now();
            
            try {
                await this.jogador.registrarAcao('morte', `Derrotado por ${criatura.nome} - Perdeu ${ouroPerdido} ouro e ${xpPerdido} XP`);
            } catch (e) {}
            
            await this.jogador.salvar();
            
            texto = `💀 *MORTE!*\n\n`;
            texto += `❌ Você foi derrotado por ${criatura.nome}!\n\n`;
            texto += `💰 Perdeu ${ouroPerdido} ouro\n`;
            texto += `⭐ Perdeu ${xpPerdido} XP\n`;
            texto += `💔 Vida máxima reduzida para ${this.jogador.dados.vida_max}\n`;
            texto += `⚡ Stamina zerada!\n\n`;
            texto += `💤 Descanse para se recuperar: !descansar\n`;
            texto += `⏳ Tempo de recuperação: 5 minutos`;
        }

        return { texto };
    }
}

// ============================================================
// 🔥 EXPORTA
// ============================================================

module.exports = { Batalha, batalhasAtivas };
