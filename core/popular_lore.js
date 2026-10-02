// core/popular_lore.js - Popula a lore de Aetheris no banco Python
const AETHERIS = require("../dados/lore/aetheris");
const { executarPython } = require("../servicos/jogador");

async function popular() {
    console.log("📖 Populando lore de Aetheris no banco...");
    
    const json = JSON.stringify(AETHERIS);
    const result = await executarPython('lore_popular', json);
    
    if (result.erro) {
        console.error("❌ Erro:", result.erro);
        return;
    }
    
    console.log("✅", result.mensagem);
}

popular();
