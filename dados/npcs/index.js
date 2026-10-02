// Gerenciador de NPCs de Aetheris
const cassia = require("./cassia_lisandra");
const octavius = require("./octavius_alexios");
const ignatius = require("./ignatius_flavianus");
const tiberio = require("./gregorius_tiberius");
const dominus = require("./dominus_magnus");

const NPCS = {
    [cassia.id]: cassia,
    [octavius.id]: octavius,
    [ignatius.id]: ignatius,
    [tiberio.id]: tiberio,
    [dominus.id]: dominus
};

// ============================================================
// 🔹 FUNÇÕES AUXILIARES
// ============================================================
function getNpc(id) {
    return NPCS[id] || null;
}

function getNpcPorRegiao(regiao) {
    return Object.values(NPCS).filter(n => n.regiao === regiao);
}

function listarNpcs() {
    return Object.values(NPCS);
}

function getSaudacaoAleatoria(npcId) {
    const npc = getNpc(npcId);
    if (!npc || !npc.saudacoes) return "Olá, viajante.";
    return npc.saudacoes[Math.floor(Math.random() * npc.saudacoes.length)];
}

module.exports = {
    NPCS,
    getNpc,
    getNpcPorRegiao,
    listarNpcs,
    getSaudacaoAleatoria
};
