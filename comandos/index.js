// comandos/index.js
const fs = require('fs');
const path = require('path');

const comandos = new Map();

// ============================================================
// 🔹 CARREGAR TODOS OS COMANDOS
// ============================================================

function carregarComandos() {
    const pastas = ['admin', 'diversao', 'economia', 'ia', 'midia', 'rpg', 'uteis','utils'];
    
    let totalComandos = 0;
    let totalNomes = 0;
    
    for (const pasta of pastas) {
        const pastaPath = path.join(__dirname, pasta);
        if (!fs.existsSync(pastaPath)) continue;
        
        const arquivos = fs.readdirSync(pastaPath).filter(f => f.endsWith('.js'));
        
        for (const arquivo of arquivos) {
            try {
                const caminho = path.join(pastaPath, arquivo);
                const cmd = require(caminho);
                
                if (!cmd || !cmd.executar) continue;
                
                // 🔥 PEGA A LISTA DE NOMES
                // Aceita "nomes" (novo) ou "nome" + "alias" (antigo) pra compatibilidade
                let listaNomes = [];
                
                if (cmd.nomes && Array.isArray(cmd.nomes)) {
                    // 🔥 NOVO FORMATO: { nomes: ["pagar", "pay"], executar }
                    listaNomes = cmd.nomes;
                } else if (cmd.nome) {
                    // 🔹 FORMATO ANTIGO: { nome: "pagar", alias: [...], executar }
                    listaNomes = [cmd.nome];
                    if (cmd.alias && Array.isArray(cmd.alias)) {
                        listaNomes = listaNomes.concat(cmd.alias);
                    }
                }
                
                if (listaNomes.length === 0) {
                    console.log(`⚠️ Comando sem nome: ${arquivo}`);
                    continue;
                }
                
                // 🔥 REGISTRA TODOS OS NOMES
                const nomePrincipal = listaNomes[0];
                
                for (const nome of listaNomes) {
                    comandos.set(nome.toLowerCase(), {
                        executar: cmd.executar,
                        nomePrincipal: nomePrincipal,
                        arquivo: arquivo
                    });
                    totalNomes++;
                }
                
                totalComandos++;
                
            } catch (err) {
                console.error(`❌ Erro ao carregar ${arquivo}:`, err.message);
            }
        }
    }
    
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   📦 COMANDOS CARREGADOS!                 ║');
    console.log(`║   ✅ Comandos: ${String(totalComandos).padEnd(28)}║`);
    console.log(`║   🔤 Nomes totais: ${String(totalNomes).padEnd(24)}║`);
    console.log('╚═══════════════════════════════════════════╝');
}

carregarComandos();

module.exports = comandos;
