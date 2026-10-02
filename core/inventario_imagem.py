# core/inventario_imagem.py - INVENTÁRIO FINAL (COM NOME CONVERTIDO)

import sys
import json
import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INV_DIR = os.path.join(BASE_DIR, 'imagens/inventario')
PECAS_DIR = os.path.join(INV_DIR, 'pecas')
ITENS_DIR = os.path.join(INV_DIR, 'itens')
CLASSES_DIR = os.path.join(INV_DIR, 'classes')
FONTE_PATH = os.path.join(INV_DIR, 'fonte.ttf')
DB_PATH = os.path.join(BASE_DIR, 'database/ia_conhecimento.db')

# ============================================================
# 🔹 CONFIGURAÇÕES
# ============================================================

CANVAS_LARGURA = 1254
CANVAS_ALTURA = 1254

# Banner
BANNER_CENTRO_X = 627
BANNER_CENTRO_Y = 260
BANNER_LARGURA_FINAL = 700
TITULO_TEXTO = "INVENTÁRIO"
TITULO_TAMANHO_FONTE = 55
NOME_TAMANHO_FONTE = 70
ESPACO_TITULO_NOME = 10
COR_TITULO = '#D4AF37'
COR_NOME = '#F5E6C8'

# Slots
SLOTS_CENTRO_X = 627
SLOT_INICIO_Y = 450
SLOT_TAMANHO = 140
SLOT_ESPACO_X = 5
SLOT_ESPACO_Y = 5
SLOTS_POR_LINHA = 5

COR_FUNDO_SLOT = '#3D2817'
COR_BORDA_SLOT = '#8B6914'
COR_BORDA_INTERNA = '#5C3D2E'
TAMANHO_ITEM_RELATIVO = 0.75
TAMANHO_FONTE_QTD = 28
COR_QTD = '#FFD700'

# Área de mensagem
AREA_CENTRO_X = 627
AREA_CENTRO_Y = 915
AREA_LARGURA_FINAL = 900

# Avatar
AVATAR_CENTRO_X = 298
AVATAR_CENTRO_Y = 827
AVATAR_TAMANHO = 122

# Texto
TEXTO_CENTRO_X = 659
TEXTO_CENTRO_Y = 957
TEXTO_LARGURA = 568
TAMANHO_FONTE_MSG = 20
ESPACO_LINHAS = 6
COR_TEXTO = '#3D2817'

# Sombra
SOMBRA_ATIVA = True
SOMBRA_OFFSET = 3
SOMBRA_COR = 'black'

# ============================================================
# 🔹 MAPEAMENTO DE ITENS
# ============================================================

ITENS_IMAGENS = {
    'madeira': 'madeira.png',
    'ferro': 'ferro.png',
    'erva': 'erva_curativa.png',
    'erva_curativa': 'erva_curativa.png',
    'couro': 'couro.png',
    'pedra': 'pedra.png',
    'picareta_madeira': 'picareta_madeira.png',
    'picareta_ferro': 'picareta_ferro.png',
    'espada_madeira': 'espada_madeira.png',
    'espada_ferro': 'espada_ferro.png',
    'capacete_couro': 'capacete_couro.png',
    'peitoral_couro': 'peitoral_couro.png',
    'botas_couro': 'botas_couro.png',
    'pocao_vida': 'pocao_vida.png',
    'pocao_mana': 'pocao_mana.png',
}

# ============================================================
# 🔹 PUXAR DADOS
# ============================================================

def puxar_dados_jogador(usuario_id):
    if not os.path.exists(DB_PATH):
        return {'erro': 'Banco não encontrado'}
    
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.execute('SELECT * FROM jogadores WHERE id = ?', (usuario_id,))
        row = cursor.fetchone()
        
        if not row:
            return {'erro': 'Jogador não encontrado'}
        
        colunas = [desc[0] for desc in cursor.description]
        jogador = dict(zip(colunas, row))
        
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        inventario = [{'item_id': i[0], 'quantidade': i[1]} for i in inv]
        
        mochila = conn.execute('SELECT nivel, slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if mochila:
            nivel_mochila = mochila[0]
            slots = mochila[1]
        else:
            nivel_mochila = 1
            slots = 10
        
        return {
            'jogador': jogador,
            'inventario': inventario,
            'slots': slots,
            'nivel_mochila': nivel_mochila
        }
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()

# ============================================================
# 🔹 FUNÇÕES AUXILIARES
# ============================================================

def carregar_imagem(caminho):
    if os.path.exists(caminho):
        try:
            return Image.open(caminho).convert('RGBA')
        except:
            return None
    return None

def quebrar_texto(texto, fonte, draw, max_largura):
    palavras = texto.split(' ')
    linhas = []
    linha_atual = ''
    for palavra in palavras:
        teste = linha_atual + (' ' if linha_atual else '') + palavra
        bbox = draw.textbbox((0, 0), teste, font=fonte)
        largura = bbox[2] - bbox[0]
        if largura <= max_largura:
            linha_atual = teste
        else:
            if linha_atual:
                linhas.append(linha_atual)
            linha_atual = palavra
    if linha_atual:
        linhas.append(linha_atual)
    return linhas

def desenhar_slot_fundo(draw, x, y, tamanho, cor_fundo, cor_borda, cor_interna):
    draw.rectangle([x, y, x + tamanho, y + tamanho], fill=cor_fundo, outline=cor_borda, width=3)
    draw.rectangle([x + 5, y + 5, x + tamanho - 5, y + tamanho - 5], outline=cor_interna, width=1)

def desenhar_interrogacao(draw, centro_x, centro_y, tamanho):
    x = centro_x - (tamanho // 2)
    y = centro_y - (tamanho // 2)
    draw.ellipse([x, y, x + tamanho, y + tamanho], fill='#2C1810', outline='#8B6914', width=3)
    try:
        fonte = ImageFont.truetype(FONTE_PATH, int(tamanho * 0.6))
    except:
        fonte = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), '?', font=fonte)
    txt_largura = bbox[2] - bbox[0]
    txt_altura = bbox[3] - bbox[1]
    txt_x = x + (tamanho - txt_largura) // 2
    txt_y = y + (tamanho - txt_altura) // 2
    draw.text((txt_x, txt_y), '?', fill='#F5E6C8', font=fonte)

def desenhar_texto_com_sombra(draw, posicao, texto, fonte, cor):
    x, y = posicao
    if SOMBRA_ATIVA:
        draw.text((x + SOMBRA_OFFSET, y + SOMBRA_OFFSET), texto, fill=SOMBRA_COR, font=fonte)
    draw.text((x, y), texto, fill=cor, font=fonte)

# ============================================================
# 🔹 FUNÇÃO PRINCIPAL
# ============================================================

def gerar_inventario(usuario_id, avatar_path=None, nome_convertido=None):
    # 1. Puxa os dados
    dados = puxar_dados_jogador(usuario_id)
    
    if 'erro' in dados:
        return dados
    
    jogador = dados['jogador']
    itens = dados['inventario']
    total_slots = dados['slots']
    
    # 🔥 USA O NOME CONVERTIDO SE TIVER, SENÃO O ORIGINAL
    nome = nome_convertido if nome_convertido else jogador.get('nome', 'Aventureiro')
    classe = jogador.get('classe', 'Aventureiro')
    nivel = jogador.get('nivel', 1)
    ouro = jogador.get('ouro', 0)
    
    # 2. Avatar
    if not avatar_path:
        classe_lower = classe.lower().strip()
        avatar_classe = os.path.join(CLASSES_DIR, f'avatar_{classe_lower}.png')
        if os.path.exists(avatar_classe):
            avatar_path = avatar_classe
        else:
            avatar_path = os.path.join(CLASSES_DIR, 'avatar_aventureiro.png')
    
    # 3. Mensagem
    if len(itens) == 0:
        mensagem = "Seu inventário está vazio!"
    else:
        total_itens = sum(i.get('quantidade', 1) for i in itens)
        mensagem = f"Você tem {total_itens} itens. Nível {nivel} com {ouro} de ouro."
    
    # 4. Fundo base
    fundo = carregar_imagem(os.path.join(PECAS_DIR, 'fundo_base.png'))
    if not fundo:
        return {'erro': 'Fundo base não encontrado'}
    fundo = fundo.resize((CANVAS_LARGURA, CANVAS_ALTURA), Image.LANCZOS)
    
    draw = ImageDraw.Draw(fundo)
    
    # 5. Fontes
    try:
        font_titulo = ImageFont.truetype(FONTE_PATH, TITULO_TAMANHO_FONTE)
        font_nome = ImageFont.truetype(FONTE_PATH, NOME_TAMANHO_FONTE)
        font_qtd = ImageFont.truetype(FONTE_PATH, TAMANHO_FONTE_QTD)
        font_msg = ImageFont.truetype(FONTE_PATH, TAMANHO_FONTE_MSG)
    except:
        font_titulo = font_nome = font_qtd = font_msg = ImageFont.load_default()
    
    # ============================================================
    # 6. BANNER + TÍTULO + NOME
    # ============================================================
    
    banner = carregar_imagem(os.path.join(PECAS_DIR, 'banner.png'))
    if banner:
        proporcao = banner.width / banner.height
        nova_altura = int(BANNER_LARGURA_FINAL / proporcao)
        banner = banner.resize((BANNER_LARGURA_FINAL, nova_altura), Image.LANCZOS)
        
        banner_x = BANNER_CENTRO_X - (banner.width // 2)
        banner_y = BANNER_CENTRO_Y - (banner.height // 2)
        
        fundo.paste(banner, (banner_x, banner_y), banner)
        
        centro_banner_x = banner_x + (banner.width // 2)
        centro_banner_y = banner_y + (banner.height // 2)
        
        bbox_titulo = draw.textbbox((0, 0), TITULO_TEXTO, font=font_titulo)
        titulo_largura = bbox_titulo[2] - bbox_titulo[0]
        titulo_altura = bbox_titulo[3] - bbox_titulo[1]
        
        bbox_nome = draw.textbbox((0, 0), nome, font=font_nome)
        nome_largura = bbox_nome[2] - bbox_nome[0]
        nome_altura = bbox_nome[3] - bbox_nome[1]
        
        altura_total = titulo_altura + ESPACO_TITULO_NOME + nome_altura
        y_inicial = centro_banner_y - (altura_total // 2)
        
        titulo_x = centro_banner_x - (titulo_largura // 2)
        desenhar_texto_com_sombra(draw, (titulo_x, y_inicial), TITULO_TEXTO, font_titulo, COR_TITULO)
        
        nome_x = centro_banner_x - (nome_largura // 2)
        nome_y = y_inicial + titulo_altura + ESPACO_TITULO_NOME
        desenhar_texto_com_sombra(draw, (nome_x, nome_y), nome, font_nome, COR_NOME)
    
    # ============================================================
    # 7. SLOTS + ITENS + MOLDURA
    # ============================================================
    
    slot_moldura = carregar_imagem(os.path.join(PECAS_DIR, 'slot.png'))
    if slot_moldura:
        slot_moldura = slot_moldura.resize((SLOT_TAMANHO, SLOT_TAMANHO), Image.LANCZOS)
    
    LARGURA_TOTAL = (SLOTS_POR_LINHA * SLOT_TAMANHO) + ((SLOTS_POR_LINHA - 1) * SLOT_ESPACO_X)
    SLOT_INICIO_X = SLOTS_CENTRO_X - (LARGURA_TOTAL // 2)
    
    for i, item in enumerate(itens[:total_slots]):
        linha = i // SLOTS_POR_LINHA
        coluna = i % SLOTS_POR_LINHA
        
        x = SLOT_INICIO_X + (coluna * (SLOT_TAMANHO + SLOT_ESPACO_X))
        y = SLOT_INICIO_Y + (linha * (SLOT_TAMANHO + SLOT_ESPACO_Y))
        
        # Fundo marrom
        desenhar_slot_fundo(draw, x, y, SLOT_TAMANHO, COR_FUNDO_SLOT, COR_BORDA_SLOT, COR_BORDA_INTERNA)
        
        # Moldura
        if slot_moldura:
            fundo.paste(slot_moldura, (x, y), slot_moldura)
        
        # Item
        item_id = item.get('item_id')
        quantidade = item.get('quantidade', 1)
        
        arquivo_item = ITENS_IMAGENS.get(item_id)
        item_path = os.path.join(ITENS_DIR, arquivo_item) if arquivo_item else None
        item_img = carregar_imagem(item_path) if item_path else None
        
        item_tamanho = int(SLOT_TAMANHO * TAMANHO_ITEM_RELATIVO)
        item_x = x + (SLOT_TAMANHO - item_tamanho) // 2
        item_y = y + (SLOT_TAMANHO - item_tamanho) // 2
        
        if item_img:
            item_img = item_img.resize((item_tamanho, item_tamanho), Image.LANCZOS)
            fundo.paste(item_img, (item_x, item_y), item_img)
        else:
            desenhar_interrogacao(draw, item_x + item_tamanho // 2, item_y + item_tamanho // 2, item_tamanho)
        
        # Quantidade
        if quantidade > 1:
            qtd_texto = f'x{quantidade}'
            bbox = draw.textbbox((0, 0), qtd_texto, font=font_qtd)
            qtd_largura = bbox[2] - bbox[0]
            qtd_altura = bbox[3] - bbox[1]
            qtd_x = x + SLOT_TAMANHO - qtd_largura - 8
            qtd_y = y + SLOT_TAMANHO - qtd_altura - 8
            draw.text((qtd_x + 2, qtd_y + 2), qtd_texto, fill='black', font=font_qtd)
            draw.text((qtd_x, qtd_y), qtd_texto, fill=COR_QTD, font=font_qtd)
    
    # ============================================================
    # 8. ÁREA DE MENSAGEM
    # ============================================================
    
    area = carregar_imagem(os.path.join(PECAS_DIR, 'area_mensagem.png'))
    if area:
        proporcao = area.width / area.height
        nova_altura = int(AREA_LARGURA_FINAL / proporcao)
        area = area.resize((AREA_LARGURA_FINAL, nova_altura), Image.LANCZOS)
        
        area_x = AREA_CENTRO_X - (area.width // 2)
        area_y = AREA_CENTRO_Y - (area.height // 2)
        
        fundo.paste(area, (area_x, area_y), area)
    
    # ============================================================
    # 9. AVATAR
    # ============================================================
    
    avatar_img = carregar_imagem(avatar_path) if avatar_path else None
    if avatar_img:
        avatar_img = avatar_img.resize((AVATAR_TAMANHO, AVATAR_TAMANHO), Image.LANCZOS)
        
        mask = Image.new('L', (AVATAR_TAMANHO, AVATAR_TAMANHO), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, AVATAR_TAMANHO, AVATAR_TAMANHO), fill=255)
        
        avatar_x = AVATAR_CENTRO_X - (AVATAR_TAMANHO // 2)
        avatar_y = AVATAR_CENTRO_Y - (AVATAR_TAMANHO // 2)
        
        fundo.paste(avatar_img, (avatar_x, avatar_y), mask)
    else:
        desenhar_interrogacao(draw, AVATAR_CENTRO_X, AVATAR_CENTRO_Y, AVATAR_TAMANHO)
    
    # ============================================================
    # 10. TEXTO DA MENSAGEM
    # ============================================================
    
    linhas = quebrar_texto(mensagem, font_msg, draw, TEXTO_LARGURA)
    
    altura_linha = TAMANHO_FONTE_MSG + ESPACO_LINHAS
    altura_total = len(linhas) * altura_linha
    y_inicial = TEXTO_CENTRO_Y - (altura_total // 2)
    
    y_atual = y_inicial
    for linha in linhas:
        bbox = draw.textbbox((0, 0), linha, font=font_msg)
        linha_largura = bbox[2] - bbox[0]
        linha_x = TEXTO_CENTRO_X - (linha_largura // 2)
        
        draw.text((linha_x, y_atual), linha, fill=COR_TEXTO, font=font_msg)
        y_atual += altura_linha
    
    # ============================================================
    # 11. SALVA
    # ============================================================
    
    temp_dir = os.path.join(BASE_DIR, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    
    nome_limpo = ''.join(c for c in nome if c.isalnum() or c in '_-')
    output_path = os.path.join(temp_dir, f'inventario_{nome_limpo}_{os.getpid()}.png')
    
    fundo.save(output_path, 'PNG')
    
    return {'imagem': output_path}

# ============================================================
# 🔹 MAIN
# ============================================================

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'erro': 'Uso: python3 inventario_imagem.py <usuario_id> [avatar_path] [nome_convertido]'}))
        sys.exit(1)
    
    usuario_id = sys.argv[1]
    avatar_path = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != 'null' else None
    nome_convertido = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != 'null' else None
    
    try:
        resultado = gerar_inventario(usuario_id, avatar_path, nome_convertido)
        print(json.dumps(resultado))
    except Exception as e:
        print(json.dumps({'erro': str(e)}))
