// dados/biomas/index.js
const ELDORIA = require('./eldoria');

const BIOMAS = {
    'eldoria': ELDORIA
};

const BIOMA_INICIAL = 'eldoria';

function listarBiomas() {
    let texto = '🌍 *BIOMAS DISPONÍVEIS*\n\n';
    
    for (const [id, bioma] of Object.entries(BIOMAS)) {
        const bloqueado = bioma.nivel_necessario > 1 ? `🔒 Nível ${bioma.nivel_necessario}` : '✅ Disponível';
        texto += `${bioma.nome}\n`;
        texto += `📝 ${bioma.descricao}\n`;
        texto += `📊 ${bloqueado}\n`;
        texto += `🏷️ ID: !viajar ${id}\n\n`;
    }
    
    return texto;
}

function getBioma(id) {
    return BIOMAS[id] || null;
}

function getBiomaInicial() {
    return BIOMAS[BIOMA_INICIAL];
}

function getBiomaInfo(id) {
    const bioma = getBioma(id);
    if (!bioma) return null;
    
    let texto = `🌍 *${bioma.nome}*\n\n`;
    texto += `📝 ${bioma.descricao}\n\n`;
    texto += `🎯 Nível necessário: ${bioma.nivel_necessario}\n\n`;
    
    texto += `🗺️ *Áreas:*\n`;
    for (const area of bioma.areas || []) {
        texto += `   • ${area.nome} (Nv.${area.nivel_necessario})\n`;
    }
    
    return texto;
}

module.exports = {
    BIOMAS,
    BIOMA_INICIAL,
    listarBiomas,
    getBioma,
    getBiomaInicial,
    getBiomaInfo
};
