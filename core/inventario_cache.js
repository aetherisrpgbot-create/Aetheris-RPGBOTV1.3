// core/inventario_cache.js - CACHE DO INVENTÁRIO

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '../database/cache_inventario');
const HASHES_FILE = path.join(CACHE_DIR, 'hashes.json');

// ============================================================
// 🔹 GARANTE QUE A PASTA EXISTE
// ============================================================

function garantirPasta() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

// ============================================================
// 🔹 CARREGAR/SALVAR HASHES
// ============================================================

function carregarHashes() {
    garantirPasta();
    if (fs.existsSync(HASHES_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(HASHES_FILE, 'utf8'));
        } catch {
            return {};
        }
    }
    return {};
}

function salvarHashes(hashes) {
    garantirPasta();
    fs.writeFileSync(HASHES_FILE, JSON.stringify(hashes, null, 2));
}

// ============================================================
// 🔹 GERAR HASH DO INVENTÁRIO
// ============================================================

function gerarHashInventario(jogador, nomeConvertido) {
    // Junta os dados que importam pra imagem
    const dados = {
        nome: nomeConvertido,
        classe: jogador.dados.classe,
        nivel: jogador.dados.nivel,
        itens: [...jogador.inventario].sort((a, b) => 
            a.item_id.localeCompare(b.item_id)
        ),
        slots: jogador.mochila?.slots || 10
    };
    
    const json = JSON.stringify(dados);
    return crypto.createHash('md5').update(json).digest('hex');
}

// ============================================================
// 🔹 VERIFICAR SE A IMAGEM ESTÁ EM CACHE
// ============================================================

function getImagemCache(usuarioId, hashAtual) {
    garantirPasta();
    
    const hashes = carregarHashes();
    const imagemPath = path.join(CACHE_DIR, `${usuarioId}.png`);
    
    // Se não tem hash salvo ou a imagem não existe, precisa gerar
    if (!hashes[usuarioId] || !fs.existsSync(imagemPath)) {
        return null;
    }
    
    // Se o hash mudou, precisa gerar
    if (hashes[usuarioId].hash !== hashAtual) {
        return null;
    }
    
    // Tudo ok, retorna a imagem
    return imagemPath;
}

// ============================================================
// 🔹 SALVAR IMAGEM NO CACHE
// ============================================================

function salvarImagemCache(usuarioId, hashAtual, imagemPathOrigem) {
    garantirPasta();
    
    const imagemPathDestino = path.join(CACHE_DIR, `${usuarioId}.png`);
    
    // Copia a imagem pro cache
    fs.copyFileSync(imagemPathOrigem, imagemPathDestino);
    
    // Salva o hash
    const hashes = carregarHashes();
    hashes[usuarioId] = {
        hash: hashAtual,
        data: new Date().toISOString()
    };
    salvarHashes(hashes);
    
    return imagemPathDestino;
}

// ============================================================
// 🔹 LIMPAR CACHE DE UM JOGADOR
// ============================================================

function limparCacheJogador(usuarioId) {
    garantirPasta();
    
    const imagemPath = path.join(CACHE_DIR, `${usuarioId}.png`);
    if (fs.existsSync(imagemPath)) {
        fs.unlinkSync(imagemPath);
    }
    
    const hashes = carregarHashes();
    delete hashes[usuarioId];
    salvarHashes(hashes);
}

// ============================================================
// 🔹 EXPORTA
// ============================================================

module.exports = {
    gerarHashInventario,
    getImagemCache,
    salvarImagemCache,
    limparCacheJogador
};
