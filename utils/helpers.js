// ============================================================
// UTILITÁRIOS - FUNÇÕES REUTILIZÁVEIS
// ============================================================
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");

// ========== CONVERTER BUFFER PARA FIGURINHA (IMAGEM OU VÍDEO) ==========
async function bufferToSticker(buffer, isVideo = false) {

    // ===== EXTENSÃO CORRETA =====
    const ext = isVideo ? ".mp4" : ".webp";
    const input = path.join(os.tmpdir(), `in_${Date.now()}${ext}`);
    const output = path.join(os.tmpdir(), `out_${Date.now()}.webp`);

    try {
        fs.writeFileSync(input, buffer);

        // ===== SE FOR WEBP (FIGURINHA), NÃO PRECISA CONVERTER =====
        let cmd;
        if (isVideo) {
            cmd =
                `ffmpeg -y -i "${input}" ` +
                `-vf "fps=15,scale=512:512:flags=lanczos" ` +
                `-vcodec libwebp ` +
                `-lossless 0 ` +
                `-compression_level 6 ` +
                `-q:v 60 ` +
                `-loop 0 ` +
                `-preset picture ` +
                `-an ` +
                `-vsync 0 ` +
                `-t 6 ` +
                `"${output}"`;
        } else {
            // ===== SE FOR IMAGEM, USA O MESMO MAS SEM FPS =====
            cmd =
                `ffmpeg -y -i "${input}" ` +
                `-vf "scale=512:512:flags=lanczos" ` +
                `-vcodec libwebp ` +
                `-lossless 0 ` +
                `-compression_level 6 ` +
                `-q:v 60 ` +
                `-loop 0 ` +
                `-preset picture ` +
                `-an ` +
                `-vsync 0 ` +
                `"${output}"`;
        }

        await new Promise((resolve, reject) => {
            exec(cmd, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        if (!fs.existsSync(output)) throw new Error("Sticker não gerado");

        return fs.readFileSync(output);
    } finally {
        if (fs.existsSync(input)) fs.unlinkSync(input);
        if (fs.existsSync(output)) fs.unlinkSync(output);
    }
}

// ========== LIMPAR TEXTO PARA COMPARAÇÃO ==========
function limparTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s]/g, "")     // Remove caracteres especiais
        .replace(/\s+/g, " ")            // Remove espaços extras
        .trim();
}

// ========== ADICIONAR EXIF EM FIGURINHAS ==========
async function adicionarExif(webpBuffer, packname, author = "🗡️ 𝕿𝖍𝖊 𝕽𝖕𝖌 𝕭𝖔𝖙 🗡️") {
    const webp = require("node-webpmux");

    const img = new webp.Image();

    const input = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
    const output = path.join(os.tmpdir(), `sticker_out_${Date.now()}.webp`);

    fs.writeFileSync(input, webpBuffer);

    await img.load(input);

    const json = {
        "sticker-pack-id": "rpgbot",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": [""]
    };

    // ===== CABEÇALHO EXIF CORRETO DO WHATSAPP =====
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00
    ]);

    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([
        exifAttr,
        Buffer.from([
            jsonBuffer.length & 0xff,
            (jsonBuffer.length >> 8) & 0xff,
            (jsonBuffer.length >> 16) & 0xff,
            (jsonBuffer.length >> 24) & 0xff
        ]),
        Buffer.from([0x16, 0x00, 0x00, 0x00]),
        jsonBuffer
    ]);

    img.exif = exif;

    await img.save(output);

    const buffer = fs.readFileSync(output);

    fs.unlinkSync(input);
    fs.unlinkSync(output);

    return buffer;
}

// ========== CRIAR IMAGEM DE TEXTO (ANTIGA) ==========
async function criarConverter(texto) {
    function quebrarTexto(texto, limite = 18) {
        const palavras = texto.split(" ");
        let linhas = [];
        let linhaAtual = "";

        for (const palavra of palavras) {
            if ((linhaAtual + palavra).length > limite) {
                linhas.push(linhaAtual.trim());
                linhaAtual = palavra + " ";
            } else {
                linhaAtual += palavra + " ";
            }
        }
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
        return linhas.join("\n");
    }

    texto = quebrarTexto(texto, 18);
    const png = path.join(os.tmpdir(), `converter_${Date.now()}.png`);
    texto = texto.replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/%/g, "\\%");

    const cmd =
        `ffmpeg -y ` +
        `-f lavfi -i color=c=white:s=512x512 ` +
        `-vf "drawtext=text='${texto}':fontcolor=black:fontsize=32:line_spacing=15:x=(w-text_w)/2:y=(h-text_h)/2" ` +
        `-frames:v 1 ` +
        `"${png}"`;

    await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    const buffer = fs.readFileSync(png);
    if (fs.existsSync(png)) fs.unlinkSync(png);
    return buffer;
}

// helpers.js - ADICIONAR ESTA FUNÇÃO

// ========== PROCESSAR FIGURINHA UNIVERSAL ==========
async function processarFigurinha(buffer, nome = "Figurinha") {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `fig_${Date.now()}`);
    const outputPath = path.join(tempDir, `fig_out_${Date.now()}.webp`);

    try {
        fs.writeFileSync(inputPath, buffer);

        // 🔥 DETECTA O TIPO
        const hex = buffer.toString('hex', 0, 100);
        const isAnimated = hex.includes('414e494d'); // 'ANIM'
        const isWebP = hex.startsWith('52494646') && hex.includes('57454250');
        const isPNG = hex.startsWith('89504e47');
        const isJPG = hex.startsWith('ffd8ffe0') || hex.startsWith('ffd8ffe1');
        const isGIF = hex.startsWith('47494638');
        const isMP4 = hex.startsWith('0000001c66747970') || hex.includes('6d703476');

        const isVideo = isMP4 || isAnimated || isGIF;

        console.log(`📸 Processando: ${isVideo ? 'VÍDEO' : 'IMAGEM'} | ${isWebP ? 'WebP' : isMP4 ? 'MP4' : isPNG ? 'PNG' : isJPG ? 'JPG' : isGIF ? 'GIF' : 'Desconhecido'}`);

        // 🔥 MONTA O COMANDO FFMPEG
        let cmd;

        if (isVideo) {
            cmd = `ffmpeg -y -i "${inputPath}" ` +
                  `-vf "fps=15,scale=512:512:flags=lanczos" ` +
                  `-vcodec libwebp ` +
                  `-lossless 0 ` +
                  `-compression_level 6 ` +
                  `-q:v 60 ` +
                  `-loop 0 ` +
                  `-preset picture ` +
                  `-an ` +
                  `-t 6 ` +
                  `"${outputPath}" 2>/dev/null`;
        } else {
            cmd = `ffmpeg -y -i "${inputPath}" ` +
                  `-vf "scale=512:512:flags=lanczos" ` +
                  `-vcodec libwebp ` +
                  `-lossless 0 ` +
                  `-compression_level 6 ` +
                  `-q:v 60 ` +
                  `-loop 0 ` +
                  `-preset picture ` +
                  `-an ` +
                  `"${outputPath}" 2>/dev/null`;
        }

        await new Promise((resolve, reject) => {
            exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (fs.existsSync(outputPath)) {
            return fs.readFileSync(outputPath);
        }

        // Fallback: retorna o buffer original
        console.log('⚠️ FFmpeg falhou, usando buffer original');
        return buffer;

    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

// ========== RENOMEAR FIGURINHA (COM NOME) ==========
async function renomearFigurinha(buffer, novoNome, autor = "👑 𝕿𝖍𝖊 ℝℙ𝔾 𝕭𝖔𝖙 👑") {
    try {
        // Processa a figurinha
        const stickerProcessada = await processarFigurinha(buffer);
        
        // Adiciona o EXIF com o nome
        return await adicionarExif(stickerProcessada, novoNome, autor);
    } catch (err) {
        console.error('❌ Erro ao renomear figurinha:', err);
        // Fallback: retorna a figurinha sem EXIF
        return await processarFigurinha(buffer);
    }
}

// ========== CRIAR IMAGEM DE TEXTO COM CORES (FFMPEG) ==========
async function criarConverterColorido(texto, cor = "preto") {
    function quebrarTexto(texto, limite = 20) {
        const palavras = texto.split(" ");
        let linhas = [];
        let linhaAtual = "";

        for (const palavra of palavras) {
            if ((linhaAtual + " " + palavra).length > limite) {
                linhas.push(linhaAtual.trim());
                linhaAtual = palavra + " ";
            } else {
                linhaAtual += palavra + " ";
            }
        }
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
        return linhas;
    }

    const linhas = quebrarTexto(texto, 20);
    const textoQuebrado = linhas.join("\n");

    const textoEscapado = textoQuebrado
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:")
        .replace(/%/g, "\\%")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`");

    const png = path.join(os.tmpdir(), `converter_${Date.now()}.png`);

    const cores = {
        preto: { fundo: "white", texto: "black" },
        branco: { fundo: "black", texto: "white" },
        vermelho: { fundo: "white", texto: "red" },
        azul: { fundo: "white", texto: "blue" },
        verde: { fundo: "white", texto: "green" },
        amarelo: { fundo: "white", texto: "yellow" },
        roxo: { fundo: "white", texto: "purple" },
        rosa: { fundo: "white", texto: "pink" },
        laranja: { fundo: "white", texto: "orange" },
        cinza: { fundo: "white", texto: "gray" }
    };

    const corSelecionada = cores[cor.toLowerCase()] || cores.preto;

    let fontSize = 40;
    const numLinhas = linhas.length;
    if (numLinhas > 4) fontSize = 24;
    else if (numLinhas > 3) fontSize = 28;
    else if (numLinhas > 2) fontSize = 34;
    else if (numLinhas > 1) fontSize = 40;
    else fontSize = 48;

    const altura = Math.max(512, numLinhas * 80 + 40);

    const cmd = 
        `ffmpeg -y ` +
        `-f lavfi -i color=c=${corSelecionada.fundo}:s=512x${altura} ` +
        `-vf "drawtext=` +
        `text='${textoEscapado}':` +
        `fontcolor=${corSelecionada.texto}:` +
        `fontsize=${fontSize}:` +
        `line_spacing=25:` +
        `x=(w-text_w)/2:` +
        `y=(h-text_h)/2` +
        `" ` +
        `-frames:v 1 ` +
        `"${png}"`;

    console.log(`🎨 Gerando imagem | Cor: ${cor} | Fundo: ${corSelecionada.fundo}`);

    await new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) {
                const cmdFallback = 
                    `ffmpeg -y ` +
                    `-f lavfi -i color=c=${corSelecionada.fundo}:s=512x${altura} ` +
                    `-vf "drawtext=` +
                    `text='${textoEscapado}':` +
                    `fontcolor=${corSelecionada.texto}:` +
                    `fontsize=${fontSize}:` +
                    `line_spacing=25:` +
                    `x=(w-text_w)/2:` +
                    `y=(h-text_h)/2` +
                    `" ` +
                    `-frames:v 1 ` +
                    `"${png}"`;

                exec(cmdFallback, (err2) => {
                    if (err2) reject(err2);
                    else resolve();
                });
            } else {
                resolve();
            }
        });
    });

    if (!fs.existsSync(png)) {
        throw new Error("Imagem não foi gerada");
    }

    const buffer = fs.readFileSync(png);
    if (fs.existsSync(png)) fs.unlinkSync(png);

    return buffer;
}    

// ========== NORMALIZAR TEXTO ==========
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ========== EXTRAIR TEXTO DA MENSAGEM ==========
function getTexto(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        ""
    );
}

// ========== CRIAR FIGURINHA COM LEGENDA (IMAGEM + TEXTO EMBAIXO) ==========

function execAsync(cmd) {
    return new Promise((resolve) => {  // ← NÃO USA REJECT!
        exec(cmd, (err, stdout, stderr) => {
            // 🔥 IGNORA QUALQUER ERRO DO FFMPEG
            resolve({ stdout, stderr, error: err });
        });
    });
}

async function criarStickerLegenda(buffer, texto, cor = "black") {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}.webp`);
    const framePath = path.join(tempDir, `frame_${Date.now()}.png`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);

    try {
        fs.writeFileSync(inputPath, buffer);

        // 🔥 EXTRAI FRAME (SILENCIOSO - NÃO MOSTRA NADA)
        let imagePath = inputPath;
        try {
            await execAsync(`ffmpeg -y -loglevel quiet -hide_banner -i "${inputPath}" -vframes 1 -f image2 -vcodec png "${framePath}"`);
            if (fs.existsSync(framePath) && fs.statSync(framePath).size > 100) {
                imagePath = framePath;
            }
        } catch (e) {
            // SILENCIOSO — NÃO FAZ NADA
        }

        // ============================================================
        // 🔥 QUEBRA O TEXTO
        // ============================================================
        function quebrarTexto(texto, limite = 22) {
            const palavras = texto.split(" ");
            let linhas = [];
            let linhaAtual = "";
            for (const palavra of palavras) {
                const teste = linhaAtual + (linhaAtual ? " " : "") + palavra;
                if (teste.length > limite) {
                    if (linhaAtual) linhas.push(linhaAtual.trim());
                    linhaAtual = palavra + " ";
                } else {
                    linhaAtual += palavra + " ";
                }
            }
            if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
            const resultado = [];
            for (const linha of linhas) {
                if (linha.length > limite) {
                    let quebrada = '';
                    for (let i = 0; i < linha.length; i++) {
                        quebrada += linha[i];
                        if (quebrada.length >= limite) {
                            resultado.push(quebrada);
                            quebrada = '';
                        }
                    }
                    if (quebrada) resultado.push(quebrada);
                } else {
                    resultado.push(linha);
                }
            }
            return resultado.length > 0 ? resultado : ['...'];
        }

        const linhas = quebrarTexto(texto, 22);
        const textoQuebrado = linhas.join("\\n");
        const numLinhas = linhas.length;

        // Escapa o texto
        const textoEscapado = textoQuebrado
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/:/g, "\\:")
            .replace(/%/g, "\\%")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/\{/g, "\\{")
            .replace(/\}/g, "\\}")
            .replace(/\$/g, "\\$")
            .replace(/`/g, "\\`")
            .replace(/!/g, "\\!");

        // Tamanho da fonte
        let fontSize = 32;
        if (numLinhas > 5) fontSize = 18;
        else if (numLinhas > 4) fontSize = 20;
        else if (numLinhas > 3) fontSize = 22;
        else if (numLinhas > 2) fontSize = 26;
        else if (numLinhas > 1) fontSize = 30;

        // Cores
        const cores = {
            preto: "black", branco: "white", vermelho: "red",
            azul: "blue", verde: "green", amarelo: "yellow",
            roxo: "purple", rosa: "pink", laranja: "orange",
            cinza: "gray", marrom: "brown", dourado: "gold",
            ciano: "cyan", magenta: "magenta"
        };
        const corFinal = cores[cor.toLowerCase()] || "black";
        const sombra = corFinal === 'white' ? 'black' : 'white';
        const alturaLegenda = Math.max(70, numLinhas * 38 + 30);

        // 🔥 COMANDO FFMPEG SILENCIOSO (SUPRIME TUDO)
        const cmd = `ffmpeg -y -loglevel quiet -hide_banner -i "${imagePath}" ` +
            `-vf "scale=512:512:flags=lanczos, ` +
            `pad=512:${512 + alturaLegenda}:0:0:white, ` +
            `drawtext=text='${textoEscapado}':fontcolor=${sombra}:fontsize=${fontSize}:line_spacing=25:x=(w-text_w)/2+2:y=(h-text_h)-${alturaLegenda - 30}+2, ` +
            `drawtext=text='${textoEscapado}':fontcolor=${corFinal}:fontsize=${fontSize}:line_spacing=25:x=(w-text_w)/2:y=(h-text_h)-${alturaLegenda - 30}" ` +
            `-vcodec libwebp -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset picture -an "${outputPath}"`;

        // 🔥 EXECUTA E IGNORA O ERRO
        await execAsync(cmd);

        // 🔥 SE NÃO GEROU, TENTA FALLBACK (SILENCIOSO)
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
            const fallback = `ffmpeg -y -loglevel quiet -hide_banner -i "${imagePath}" ` +
                `-vf "scale=512:512:flags=lanczos, ` +
                `pad=512:${512 + alturaLegenda}:0:0:white, ` +
                `drawtext=text='${textoEscapado}':fontcolor=${corFinal}:fontsize=${fontSize}:line_spacing=25:x=(w-text_w)/2:y=(h-text_h)-${alturaLegenda - 30}" ` +
                `-vcodec libwebp -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset picture -an "${outputPath}"`;
            await execAsync(fallback);
        }

        // 🔥 SE AINDA NÃO GEROU, USA IMAGEM ORIGINAL SEM LEGENDA
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
            const simple = `ffmpeg -y -loglevel quiet -hide_banner -i "${imagePath}" -vf "scale=512:512:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset picture -an "${outputPath}"`;
            await execAsync(simple);
        }

        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
            throw new Error("Figurinha não gerada");
        }

        return fs.readFileSync(outputPath);

    } catch (err) {
        // 🔥 NUNCA MOSTRA O ERRO DO FFMPEG
        console.error("❌ Erro na função criarStickerLegenda:", err.message || "Erro desconhecido");
        throw new Error("Erro ao processar a imagem. Tente com outra imagem.");
    } finally {
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(framePath)) fs.unlinkSync(framePath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (e) {}
    }
}


//=========EXPORTAÇÕES

module.exports = {
    bufferToSticker,
    criarConverter,
    criarConverterColorido,
    normalizarTexto,
    getTexto,
    limparTexto,
    criarStickerLegenda,
    adicionarExif,
    processarFigurinha,      // ← NOVA
    renomearFigurinha        // ← NOVA
};
