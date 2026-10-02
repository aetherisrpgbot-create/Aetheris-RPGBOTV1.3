// core/inventario_service.js

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { converterNome } = require('../servicos/ia'); // 🔥 IMPORTA

const SCRIPT_PATH = path.join(__dirname, 'inventario_imagem.py');
const INV_DIR = path.join(__dirname, '../imagens/inventario');
const CLASSES_DIR = path.join(INV_DIR, 'classes');
const TEMP_DIR = path.join(__dirname, '../temp');

// ============================================================
// 🔹 CACHE DE NOMES CONVERTIDOS
// ============================================================

const CACHE_NOMES = path.join(__dirname, '../database/nomes_cache.json');

function carregarCacheNomes() {
    if (fs.existsSync(CACHE_NOMES)) {
        try {
            return JSON.parse(fs.readFileSync(CACHE_NOMES, 'utf8'));
        } catch {
            return {};
        }
    }
    return {};
}

function salvarCacheNomes(cache) {
    const dir = path.dirname(CACHE_NOMES);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_NOMES, JSON.stringify(cache, null, 2));
}

async function converterNomeComCache(nome) {
    const cache = carregarCacheNomes();
    
    // Se já tá no cache, retorna
    if (cache[nome]) {
        return cache[nome];
    }
    
    // Converte com IA
    const nomeConvertido = await converterNome(nome);
    
    // Salva no cache
    cache[nome] = nomeConvertido;
    salvarCacheNomes(cache);
    
    return nomeConvertido;
}

// ============================================================
// 🔹 BAIXAR FOTO DE PERFIL
// ============================================================

async function baixarFotoPerfil(url) {
    return new Promise((resolve, reject) => {
        const tempPath = path.join(TEMP_DIR, `avatar_temp_${Date.now()}.png`);
        
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }
        
        const file = fs.createWriteStream(tempPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Erro HTTP: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(tempPath);
            });
        }).on('error', (err) => {
            fs.unlink(tempPath, () => {});
            reject(err);
        });
    });
}

// ============================================================
// 🔹 OBTER AVATAR
// ============================================================

async function obterAvatar(sock, remetenteId, classe) {
    try {
        const ppUrl = await sock.profilePictureUrl(remetenteId, 'image');
        if (ppUrl && ppUrl !== 'undefined') {
            const avatarPath = await baixarFotoPerfil(ppUrl);
            return avatarPath;
        }
    } catch (err) {}
    
    if (classe) {
        const classeLower = classe.toLowerCase().trim();
        const classePath = path.join(CLASSES_DIR, `avatar_${classeLower}.png`);
        if (fs.existsSync(classePath)) {
            return classePath;
        }
    }
    
    return null;
}

// ============================================================
// 🔹 GERAR IMAGEM DO INVENTÁRIO
// ============================================================

async function gerarImagemInventario(usuarioId, avatarPath, nomeConvertido) {
    return new Promise((resolve, reject) => {
        const avatarArg = avatarPath || 'null';
        const nomeArg = nomeConvertido || 'null';
        
        const cmd = `python3 "${SCRIPT_PATH}" "${usuarioId}" "${avatarArg}" "${nomeArg}"`;
        
        exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            
            try {
                const resultado = JSON.parse(stdout);
                if (resultado.erro) {
                    reject(new Error(resultado.erro));
                    return;
                }
                resolve(resultado.imagem);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

// ============================================================
// 🔹 ENVIAR INVENTÁRIO
// ============================================================

async function enviarInventario(sock, remoteJid, jogador, mensagem = '') {
    try {
        const usuarioId = jogador.id;
        const classe = jogador.dados.classe || 'Aventureiro';
        const nomeOriginal = jogador.dados.nome || 'Aventureiro';
        
        // 🔥 CONVERTE O NOME (com cache)
        const nomeConvertido = await converterNomeComCache(nomeOriginal);
        
        // Obtém o avatar
        const avatarPath = await obterAvatar(sock, usuarioId, classe);
        
        // Gera a imagem (passa o nome convertido)
        const imagemPath = await gerarImagemInventario(usuarioId, avatarPath, nomeConvertido);
        
        if (!fs.existsSync(imagemPath)) {
            throw new Error('Imagem não foi gerada');
        }
        
        const imagemBuffer = fs.readFileSync(imagemPath);
        
        await sock.sendMessage(remoteJid, {
            image: imagemBuffer,
            caption: mensagem || `🎒 *INVENTÁRIO DE ${nomeConvertido}*`
        });
        
        // Limpa temporários
        try {
            fs.unlinkSync(imagemPath);
            if (avatarPath && avatarPath.includes('avatar_temp_')) fs.unlinkSync(avatarPath);
        } catch (e) {}
        
        return true;
    } catch (err) {
        console.error('❌ Erro ao enviar inventário:', err);
        throw err;
    }
}

module.exports = {
    gerarImagemInventario,
    enviarInventario,
    obterAvatar,
    converterNomeComCache
};
