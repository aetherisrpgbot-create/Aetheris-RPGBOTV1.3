// core/limpeza_temp.js - LIMPA A PASTA TEMP A CADA 30 MIN

const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../temp');
const INTERVALO = 30 * 60 * 1000; // 30 minutos em ms
const IDADE_MAXIMA = 30 * 60 * 1000; // 30 minutos

// ============================================================
// 🔹 LIMPAR PASTA TEMP
// ============================================================

function limparTemp() {
    try {
        if (!fs.existsSync(TEMP_DIR)) {
            return;
        }
        
        const agora = Date.now();
        const arquivos = fs.readdirSync(TEMP_DIR);
        let apagados = 0;
        let espacoLiberado = 0;
        
        for (const arquivo of arquivos) {
            const caminho = path.join(TEMP_DIR, arquivo);
            
            try {
                const stat = fs.statSync(caminho);
                
                // Se for arquivo e for mais velho que a idade máxima
                if (stat.isFile()) {
                    const idade = agora - stat.mtimeMs;
                    
                    if (idade > IDADE_MAXIMA) {
                        espacoLiberado += stat.size;
                        fs.unlinkSync(caminho);
                        apagados++;
                    }
                }
            } catch (err) {
                // Ignora erros individuais
            }
        }
        
        if (apagados > 0) {
            const tamanhoMB = (espacoLiberado / 1024 / 1024).toFixed(2);
            console.log(`🧹 [LIMPEZA] ${apagados} arquivos apagados (${tamanhoMB} MB liberados)`);
        }
        
    } catch (err) {
        console.error('❌ Erro na limpeza do temp:', err);
    }
}

// ============================================================
// 🔹 INICIAR LIMPEZA AUTOMÁTICA
// ============================================================

function iniciarLimpezaAutomatica() {
    // Cria a pasta se não existir
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    console.log('🧹 [LIMPEZA] Limpeza automática iniciada (a cada 30 min)');
    
    // Roda uma vez ao iniciar
    limparTemp();
    
    // Agenda pra rodar a cada 30 minutos
    setInterval(limparTemp, INTERVALO);
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    limparTemp,
    iniciarLimpezaAutomatica
};
