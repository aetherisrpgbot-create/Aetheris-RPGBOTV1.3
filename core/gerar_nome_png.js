// core/gerar_nome_png.js - GERA PNG DO NOME

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEMP_DIR = path.join(__dirname, '../temp');

// ============================================================
// 🔹 GERAR PNG DO NOME
// ============================================================

async function gerarNomePNG(nome, tamanhoFonte = 70, cor = '#F5E6C8') {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    const outputPath = path.join(TEMP_DIR, `nome_${Date.now()}.png`);
    
    // 🔥 Cria um SVG com o nome
    // O SVG usa a fonte do sistema (que tem os glifos especiais)
    const svg = `
        <svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg">
            <style>
                .nome {
                    font-family: 'Noto Sans', 'Noto Sans Math', 'Noto Sans Symbols 2', 'DejaVu Sans', 'Symbola', sans-serif;
                    font-size: ${tamanhoFonte}px;
                    font-weight: bold;
                    fill: ${cor};
                    stroke: black;
                    stroke-width: 3;
                    paint-order: stroke;
                }
            </style>
            <text x="500" y="140" text-anchor="middle" class="nome">${escapeXml(nome)}</text>
        </svg>
    `;
    
    try {
        await sharp(Buffer.from(svg))
            .png()
            .toFile(outputPath);
        
        console.log(`✅ PNG do nome gerado: ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.error('❌ Erro ao gerar PNG do nome:', err);
        return null;
    }
}

// ============================================================
// 🔹 ESCAPAR XML
// ============================================================

function escapeXml(texto) {
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = { gerarNomePNG };
