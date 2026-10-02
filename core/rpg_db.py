# core/rpg_db.py - BANCO DE DADOS COMPLETO DO RPG
import sys
import json
import sqlite3
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'database/ia_conhecimento.db')

sys.stderr = open(os.devnull, 'w')


def conectar_banco():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)

    # ============================================================
    # 🔹 TABELA JOGADORES
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS jogadores (
            id TEXT PRIMARY KEY,
            nome TEXT,
            nivel INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            xp_proximo INTEGER DEFAULT 100,
            vida INTEGER DEFAULT 100,
            vida_max INTEGER DEFAULT 100,
            mana INTEGER DEFAULT 50,
            mana_max INTEGER DEFAULT 50,
            stamina INTEGER DEFAULT 100,
            stamina_max INTEGER DEFAULT 100,
            ouro INTEGER DEFAULT 0,
            banco INTEGER DEFAULT 0,
            classe TEXT DEFAULT 'Aventureiro',
            poder INTEGER DEFAULT 10,
            defesa INTEGER DEFAULT 5,
            critico INTEGER DEFAULT 5,
            esquiva INTEGER DEFAULT 3,
            forca INTEGER DEFAULT 5,
            destreza INTEGER DEFAULT 5,
            constituicao INTEGER DEFAULT 5,
            inteligencia INTEGER DEFAULT 5,
            sabedoria INTEGER DEFAULT 5,
            carisma INTEGER DEFAULT 5,
            x INTEGER DEFAULT 0,
            y INTEGER DEFAULT 0,
            bioma TEXT DEFAULT 'eldoria',
            area TEXT DEFAULT 'acampamento',
            conquistas TEXT DEFAULT '[]',
            morreu_em INTEGER DEFAULT 0,
            criado DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ============================================================
    # 🔹 TABELA INVENTÁRIO
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS inventario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            item_id TEXT,
            quantidade INTEGER DEFAULT 1,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE,
            UNIQUE(jogador_id, item_id)
        )
    ''')

    # ============================================================
    # 🔹 TABELA EQUIPAMENTOS
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS equipamentos (
            jogador_id TEXT PRIMARY KEY,
            mao_direita TEXT,
            mao_esquerda TEXT,
            capacete TEXT,
            peitoral TEXT,
            pernas TEXT,
            pes TEXT,
            acessorio1 TEXT,
            acessorio2 TEXT,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
        )
    ''')

    # ============================================================
    # 🔹 TABELA MOCHILA
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS mochila (
            jogador_id TEXT PRIMARY KEY,
            nivel INTEGER DEFAULT 1,
            slots INTEGER DEFAULT 10,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
        )
    ''')

    # ============================================================
    # 🔹 TABELA CONQUISTAS DESBLOQUEADAS
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS conquistas_desbloqueadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            conquista_id TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE,
            UNIQUE(jogador_id, conquista_id)
        )
    ''')

    # ============================================================
    # 🔹 TABELA CONQUISTAS DO JOGADOR
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS conquistas_jogador (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            conquista_id TEXT,
            data_desbloqueio DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE,
            UNIQUE(jogador_id, conquista_id)
        )
    ''')

    # ============================================================
    # 🔹 TABELA HISTÓRICO DE AÇÕES
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS historico_acoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            acao TEXT,
            detalhes TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
        )
    ''')

    # ============================================================
    # 📖 TABELA DE LORE (AETHERIS)
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS lore_aetheris (
            id TEXT PRIMARY KEY,
            categoria TEXT,
            titulo TEXT,
            conteudo TEXT,
            emoji TEXT,
            ordem INTEGER DEFAULT 0
        )
    ''')

    # ============================================================
    # 🎭 TABELA DE NPCs DA LORE
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS lore_npcs (
            id TEXT PRIMARY KEY,
            nome TEXT,
            titulo TEXT,
            emoji TEXT,
            regiao TEXT,
            descricao TEXT,
            papel TEXT,
            personalidade TEXT,
            fala_exemplo TEXT
        )
    ''')

    # ============================================================
    # ⚔️ TABELA DE ARTEFATOS DA LORE
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS lore_artefatos (
            id TEXT PRIMARY KEY,
            nome TEXT,
            titulo TEXT,
            emoji TEXT,
            regiao TEXT,
            descricao TEXT
        )
    ''')

    # ============================================================
    # 🌍 TABELA DE REGIÕES
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS lore_regioes (
            id TEXT PRIMARY KEY,
            nome TEXT,
            direcao TEXT,
            emoji TEXT,
            descricao TEXT,
            faccao TEXT,
            artefato TEXT,
            perigo TEXT,
            evento TEXT
        )
    ''')

    # ============================================================
    # 💬 TABELA DE HISTÓRICO DE CONVERSAS COM IA
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ia_conversas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            npc_id TEXT,
            pergunta TEXT,
            resposta TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ============================================================
    # 📚 TABELA DE CONHECIMENTO GERAL DA IA
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ia_knowledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT,
            chave TEXT UNIQUE,
            valor TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ============================================================
    # 🔹 TABELA HISTÓRICO DE BATALHAS
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS historico_batalhas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            inimigo TEXT,
            nivel_inimigo INTEGER,
            venceu BOOLEAN,
            xp_ganho INTEGER,
            ouro_ganho INTEGER,
            dano_causado INTEGER,
            dano_recebido INTEGER,
            turnos INTEGER,
            data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ============================================================
    # 🔹 TABELA MISSÕES DO JOGADOR
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS missoes_jogador (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            missao_id TEXT,
            status TEXT DEFAULT 'em_andamento',
            progresso INTEGER DEFAULT 0,
            data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_conclusao DATETIME,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE,
            UNIQUE(jogador_id, missao_id)
        )
    ''')

    # ============================================================
    # 🔹 TABELA JOGOS (RANKING DE JOGOS)
    # ============================================================
    conn.execute('''
        CREATE TABLE IF NOT EXISTS jogos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogador_id TEXT,
            jogo TEXT,
            resultado TEXT,
            pontos INTEGER DEFAULT 0,
            detalhes TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    return conn


# ============================================================
# 🔹 FUNÇÕES DO JOGADOR
# ============================================================

def jogador_criar(usuario_id, nome):
    conn = conectar_banco()
    try:
        conn.execute('INSERT OR IGNORE INTO jogadores (id, nome, area) VALUES (?, ?, ?)', (usuario_id, nome, 'acampamento'))
        conn.execute('INSERT OR IGNORE INTO equipamentos (jogador_id) VALUES (?)', (usuario_id,))
        conn.execute('INSERT OR IGNORE INTO mochila (jogador_id, slots) VALUES (?, ?)', (usuario_id, 10))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_carregar(usuario_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT * FROM jogadores WHERE id = ?', (usuario_id,))
        row = cursor.fetchone()
        if not row:
            return {'erro': 'Jogador não encontrado'}
        colunas = [desc[0] for desc in cursor.description]
        jogador = dict(zip(colunas, row))

        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        inventario = [{'item_id': i[0], 'quantidade': i[1]} for i in inv]

        eq = conn.execute('SELECT * FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        equipamentos = {}
        if eq:
            colunas_eq = [desc[0] for desc in conn.execute('SELECT * FROM equipamentos LIMIT 0').description]
            equipamentos = dict(zip(colunas_eq, eq))

        mochila = conn.execute('SELECT nivel, slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if mochila:
            mochila = {'nivel': mochila[0], 'slots': mochila[1]}
        else:
            mochila = {'nivel': 1, 'slots': 10}

        missoes = conn.execute('SELECT missao_id, status, progresso FROM missoes_jogador WHERE jogador_id = ?', (usuario_id,)).fetchall()
        lista_missoes = [{'missao_id': m[0], 'status': m[1], 'progresso': m[2]} for m in missoes]

        return {
            'jogador': jogador,
            'inventario': inventario,
            'equipamentos': equipamentos,
            'mochila': mochila,
            'missoes': lista_missoes
        }
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_salvar(usuario_id, dados_json):
    conn = conectar_banco()
    try:
        dados = json.loads(dados_json)
        conn.execute('''
            UPDATE jogadores SET
                nome = ?, nivel = ?, xp = ?, xp_proximo = ?,
                vida = ?, vida_max = ?, mana = ?, mana_max = ?,
                stamina = ?, stamina_max = ?, ouro = ?, banco = ?,
                classe = ?, poder = ?, defesa = ?, critico = ?, esquiva = ?,
                forca = ?, destreza = ?, constituicao = ?,
                inteligencia = ?, sabedoria = ?, carisma = ?,
                x = ?, y = ?, bioma = ?, area = ?, conquistas = ?,
                morreu_em = ?, atualizado = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            dados.get('nome'), dados.get('nivel', 1), dados.get('xp', 0), dados.get('xp_proximo', 100),
            dados.get('vida', 100), dados.get('vida_max', 100), dados.get('mana', 50), dados.get('mana_max', 50),
            dados.get('stamina', 100), dados.get('stamina_max', 100), dados.get('ouro', 0), dados.get('banco', 0),
            dados.get('classe', 'Aventureiro'), dados.get('poder', 10), dados.get('defesa', 5),
            dados.get('critico', 5), dados.get('esquiva', 3),
            dados.get('forca', 5), dados.get('destreza', 5), dados.get('constituicao', 5),
            dados.get('inteligencia', 5), dados.get('sabedoria', 5), dados.get('carisma', 5),
            dados.get('x', 0), dados.get('y', 0), dados.get('bioma', 'eldoria'),
            dados.get('area', 'acampamento'), dados.get('conquistas', '[]'),
            dados.get('morreu_em', 0),
            usuario_id
        ))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_xp(usuario_id, quantidade):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT * FROM jogadores WHERE id = ?', (usuario_id,))
        row = cursor.fetchone()
        if not row:
            return {'erro': 'Jogador não encontrado'}
        colunas = [desc[0] for desc in cursor.description]
        dados = dict(zip(colunas, row))
        dados['xp'] += quantidade
        upou = False
        while dados['xp'] >= dados['xp_proximo']:
            dados['nivel'] += 1
            dados['xp'] -= dados['xp_proximo']
            dados['xp_proximo'] = int(dados['xp_proximo'] * 1.5)
            upou = True
        conn.execute('UPDATE jogadores SET xp = ?, nivel = ?, xp_proximo = ? WHERE id = ?', (dados['xp'], dados['nivel'], dados['xp_proximo'], usuario_id))
        conn.commit()
        return {'jogador': dados, 'novoNivel': dados['nivel'], 'upou': upou}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_ouro(usuario_id, quantidade):
    conn = conectar_banco()
    try:
        conn.execute('UPDATE jogadores SET ouro = ouro + ? WHERE id = ?', (quantidade, usuario_id))
        conn.commit()
        cursor = conn.execute('SELECT ouro FROM jogadores WHERE id = ?', (usuario_id,))
        return {'ouro': cursor.fetchone()[0]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_ouro_gastar(usuario_id, quantidade):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT ouro FROM jogadores WHERE id = ?', (usuario_id,))
        ouro = cursor.fetchone()[0]
        if ouro < quantidade:
            return {'success': False, 'ouro': ouro, 'erro': 'Ouro insuficiente'}
        conn.execute('UPDATE jogadores SET ouro = ouro - ? WHERE id = ?', (quantidade, usuario_id))
        conn.commit()
        cursor = conn.execute('SELECT ouro FROM jogadores WHERE id = ?', (usuario_id,))
        return {'success': True, 'ouro': cursor.fetchone()[0]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_item_adicionar(usuario_id, item_id, quantidade=1):
    conn = conectar_banco()
    try:
        conn.execute('''
            INSERT INTO inventario (jogador_id, item_id, quantidade) 
            VALUES (?, ?, ?) 
            ON CONFLICT(jogador_id, item_id) 
            DO UPDATE SET quantidade = quantidade + excluded.quantidade
        ''', (usuario_id, item_id, quantidade))
        conn.commit()
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        return {'inventario': [{'item_id': i[0], 'quantidade': i[1]} for i in inv]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_item_remover(usuario_id, item_id, quantidade=1):
    conn = conectar_banco()
    try:
        conn.execute('UPDATE inventario SET quantidade = quantidade - ? WHERE jogador_id = ? AND item_id = ?', (quantidade, usuario_id, item_id))
        conn.execute('DELETE FROM inventario WHERE jogador_id = ? AND item_id = ? AND quantidade <= 0', (usuario_id, item_id))
        conn.commit()
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        return {'inventario': [{'item_id': i[0], 'quantidade': i[1]} for i in inv]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_equipar(usuario_id, item_id, slot):
    conn = conectar_banco()
    try:
        inv = conn.execute('SELECT quantidade FROM inventario WHERE jogador_id = ? AND item_id = ?', (usuario_id, item_id)).fetchone()
        if not inv or inv[0] < 1:
            return {'success': False, 'erro': 'Item não encontrado no inventário'}
        conn.execute('UPDATE inventario SET quantidade = quantidade - 1 WHERE jogador_id = ? AND item_id = ?', (usuario_id, item_id))
        conn.execute('DELETE FROM inventario WHERE jogador_id = ? AND item_id = ? AND quantidade <= 0', (usuario_id, item_id))
        eq = conn.execute(f'SELECT {slot} FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if eq and eq[0]:
            conn.execute('INSERT INTO inventario (jogador_id, item_id, quantidade) VALUES (?, ?, 1) ON CONFLICT(jogador_id, item_id) DO UPDATE SET quantidade = quantidade + 1', (usuario_id, eq[0]))
        conn.execute(f'UPDATE equipamentos SET {slot} = ? WHERE jogador_id = ?', (item_id, usuario_id))
        conn.commit()
        eq = conn.execute('SELECT * FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        colunas_eq = [desc[0] for desc in conn.execute('SELECT * FROM equipamentos LIMIT 0').description]
        equipamentos = dict(zip(colunas_eq, eq)) if eq else {}
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        return {'success': True, 'equipamentos': equipamentos, 'inventario': [{'item_id': i[0], 'quantidade': i[1]} for i in inv]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_desequipar(usuario_id, slot):
    conn = conectar_banco()
    try:
        eq = conn.execute(f'SELECT {slot} FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if not eq or not eq[0]:
            return {'success': False, 'erro': 'Nada equipado neste slot'}
        item_id = eq[0]
        conn.execute('INSERT INTO inventario (jogador_id, item_id, quantidade) VALUES (?, ?, 1) ON CONFLICT(jogador_id, item_id) DO UPDATE SET quantidade = quantidade + 1', (usuario_id, item_id))
        conn.execute(f'UPDATE equipamentos SET {slot} = NULL WHERE jogador_id = ?', (usuario_id,))
        conn.commit()
        eq = conn.execute('SELECT * FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        colunas_eq = [desc[0] for desc in conn.execute('SELECT * FROM equipamentos LIMIT 0').description]
        equipamentos = dict(zip(colunas_eq, eq)) if eq else {}
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        return {'success': True, 'equipamentos': equipamentos, 'inventario': [{'item_id': i[0], 'quantidade': i[1]} for i in inv]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_mochila_upgrade(usuario_id):
    niveis = {1: {'custo': 500, 'slots': 15}, 2: {'custo': 1000, 'slots': 20}, 3: {'custo': 2000, 'slots': 30}, 4: {'custo': 5000, 'slots': 40}, 5: {'custo': 10000, 'slots': 60}}
    conn = conectar_banco()
    try:
        mochila = conn.execute('SELECT nivel, slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        nivel_atual = mochila[0] if mochila else 1
        if nivel_atual >= 5:
            return {'success': False, 'message': 'Mochila já está no nível máximo!'}
        proximo = niveis[nivel_atual + 1]
        cursor = conn.execute('SELECT ouro FROM jogadores WHERE id = ?', (usuario_id,))
        ouro = cursor.fetchone()[0]
        if ouro < proximo['custo']:
            return {'success': False, 'message': f'Você precisa de {proximo["custo"]} de ouro!'}
        conn.execute('UPDATE jogadores SET ouro = ouro - ? WHERE id = ?', (proximo['custo'], usuario_id))
        conn.execute('UPDATE mochila SET nivel = ?, slots = ? WHERE jogador_id = ?', (nivel_atual + 1, proximo['slots'], usuario_id))
        conn.commit()
        mochila = conn.execute('SELECT nivel, slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        cursor = conn.execute('SELECT ouro FROM jogadores WHERE id = ?', (usuario_id,))
        return {'success': True, 'message': f'✅ Mochila atualizada! Agora com {proximo["slots"]} slots.', 'mochila': {'nivel': mochila[0], 'slots': mochila[1]}, 'ouro': cursor.fetchone()[0]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_descansar(usuario_id):
    conn = conectar_banco()
    try:
        conn.execute('UPDATE jogadores SET vida = vida_max, mana = mana_max, stamina = stamina_max WHERE id = ?', (usuario_id,))
        conn.commit()
        cursor = conn.execute('SELECT vida, mana, stamina FROM jogadores WHERE id = ?', (usuario_id,))
        vida, mana, stamina = cursor.fetchone()
        return {'vida': vida, 'mana': mana, 'stamina': stamina}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_atributos(usuario_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT * FROM jogadores WHERE id = ?', (usuario_id,))
        row = cursor.fetchone()
        if not row:
            return {'erro': 'Jogador não encontrado'}
        colunas = [desc[0] for desc in cursor.description]
        dados = dict(zip(colunas, row))
        eq = conn.execute('SELECT * FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        equipamentos = {}
        if eq:
            colunas_eq = [desc[0] for desc in conn.execute('SELECT * FROM equipamentos LIMIT 0').description]
            equipamentos = dict(zip(colunas_eq, eq))
        ITENS = {
            'espada_madeira': {'poder': 5},
            'espada_ferro': {'poder': 12},
            'escudo_madeira': {'defesa': 5},
            'capacete_couro': {'defesa': 3},
            'peitoral_couro': {'defesa': 5},
            'botas_couro': {'defesa': 2, 'esquiva': 3},
        }
        bonus = {'poder': 0, 'defesa': 0, 'critico': 0, 'esquiva': 0, 'vidaMax': 0, 'manaMax': 0, 'staminaMax': 0}
        for slot in ['mao_direita', 'mao_esquerda', 'capacete', 'peitoral', 'pernas', 'pes', 'acessorio1', 'acessorio2']:
            item_id = equipamentos.get(slot)
            if item_id and item_id in ITENS:
                item = ITENS[item_id]
                bonus['poder'] += item.get('poder', 0)
                bonus['defesa'] += item.get('defesa', 0)
                bonus['critico'] += item.get('critico', 0)
                bonus['esquiva'] += item.get('esquiva', 0)
                bonus['vidaMax'] += item.get('vidaMax', 0)
                bonus['manaMax'] += item.get('manaMax', 0)
                bonus['staminaMax'] += item.get('staminaMax', 0)
        return {'atributos': {
            'poder': dados['poder'] + bonus['poder'],
            'defesa': dados['defesa'] + bonus['defesa'],
            'critico': dados['critico'] + bonus['critico'],
            'esquiva': dados['esquiva'] + bonus['esquiva'],
            'vidaMax': dados['vida_max'] + bonus['vidaMax'],
            'manaMax': dados['mana_max'] + bonus['manaMax'],
            'staminaMax': dados['stamina_max'] + bonus['staminaMax'],
            'forca': dados['forca'],
            'destreza': dados['destreza'],
            'constituicao': dados['constituicao'],
            'inteligencia': dados['inteligencia'],
            'sabedoria': dados['sabedoria'],
            'carisma': dados['carisma']
        }}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_espaco_mochila(usuario_id):
    conn = conectar_banco()
    try:
        mochila = conn.execute('SELECT slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if not mochila:
            return {'slots': 10, 'usados': 0, 'disponivel': 10, 'max_por_slot': 32}
        total_slots = mochila[0]
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        slots_usados = 0
        for item in inv:
            if item[1] > 0:
                slots_usados += 1
        disponivel = total_slots - slots_usados
        return {
            'slots': total_slots,
            'usados': slots_usados,
            'disponivel': disponivel,
            'max_por_slot': 32
        }
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 FUNÇÕES DE MISSÃO
# ============================================================

def jogador_missao_aceitar(usuario_id, missao_id):
    conn = conectar_banco()
    try:
        conn.execute('''
            INSERT OR IGNORE INTO missoes_jogador (jogador_id, missao_id, status)
            VALUES (?, ?, 'em_andamento')
        ''', (usuario_id, missao_id))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_missao_progresso(usuario_id, missao_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT status, progresso FROM missoes_jogador
            WHERE jogador_id = ? AND missao_id = ?
        ''', (usuario_id, missao_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {'status': 'nao_iniciada', 'progresso': 0}
        return {'status': row[0], 'progresso': row[1]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_missao_progresso_atualizar(usuario_id, missao_id, progresso):
    conn = conectar_banco()
    try:
        conn.execute('''
            UPDATE missoes_jogador SET progresso = ?
            WHERE jogador_id = ? AND missao_id = ?
        ''', (progresso, usuario_id, missao_id))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_missao_concluir(usuario_id, missao_id):
    conn = conectar_banco()
    try:
        conn.execute('''
            UPDATE missoes_jogador SET status = 'concluida', data_conclusao = CURRENT_TIMESTAMP
            WHERE jogador_id = ? AND missao_id = ?
        ''', (usuario_id, missao_id))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_missoes_listar(usuario_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT missao_id, status, progresso, data_inicio, data_conclusao
            FROM missoes_jogador
            WHERE jogador_id = ?
        ''', (usuario_id,))
        rows = cursor.fetchall()
        conn.close()
        missoes = []
        for row in rows:
            missoes.append({
                'missao_id': row[0],
                'status': row[1],
                'progresso': row[2],
                'data_inicio': row[3],
                'data_conclusao': row[4]
            })
        return {'missoes': missoes}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_ranking(limite=10):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT nome, nivel, xp, id 
            FROM jogadores 
            ORDER BY nivel DESC, xp DESC 
            LIMIT ?
        ''', (limite,))
        rows = cursor.fetchall()
        conn.close()
        ranking = []
        for row in rows:
            ranking.append({
                'nome': row[0],
                'nivel': row[1],
                'xp': row[2],
                'id': row[3]
            })
        return {'ranking': ranking}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 CONQUISTAS
# ============================================================

def jogador_conquista_desbloquear(usuario_id, conquista_id):
    conn = conectar_banco()
    try:
        conn.execute('''
            INSERT OR IGNORE INTO conquistas_jogador (jogador_id, conquista_id)
            VALUES (?, ?)
        ''', (usuario_id, conquista_id))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_conquista_verificar(usuario_id, conquista_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT 1 FROM conquistas_jogador
            WHERE jogador_id = ? AND conquista_id = ?
        ''', (usuario_id, conquista_id))
        existe = cursor.fetchone() is not None
        conn.close()
        return {'desbloqueada': existe}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_conquistas_listar(usuario_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT conquista_id, data_desbloqueio
            FROM conquistas_jogador
            WHERE jogador_id = ?
            ORDER BY data_desbloqueio DESC
        ''', (usuario_id,))
        rows = cursor.fetchall()
        conn.close()
        conquistas = []
        for row in rows:
            conquistas.append({
                'conquista_id': row[0],
                'data_desbloqueio': row[1]
            })
        return {'conquistas': conquistas}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 FUNÇÕES DE FORMATAÇÃO
# ============================================================

def jogador_inventario_formatado(usuario_id):
    conn = conectar_banco()
    try:
        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        if not inv:
            return {'texto': '🎒 *Inventário vazio!*'}

        ITENS = {
            'espada_madeira': {'nome': '🗡️ Espada de Madeira'},
            'espada_ferro': {'nome': '🗡️ Espada de Ferro'},
            'escudo_madeira': {'nome': '🛡️ Escudo de Madeira'},
            'capacete_couro': {'nome': '⛑️ Capacete de Couro'},
            'peitoral_couro': {'nome': '🦺 Peitoral de Couro'},
            'botas_couro': {'nome': '👢 Botas de Couro'},
            'pocao_vida': {'nome': '🧪 Poção de Vida'},
            'pocao_mana': {'nome': '🧪 Poção de Mana'},
            'madeira': {'nome': '🪵 Madeira'},
            'ferro': {'nome': '⛏️ Ferro'},
            'erva': {'nome': '🌿 Erva Curativa'},
            'vidro': {'nome': '🧪 Vidro'},
            'couro': {'nome': '🟫 Couro'},
            'picareta_madeira': {'nome': '⛏️ Picareta de Madeira'},
            'picareta_ferro': {'nome': '⛏️ Picareta de Ferro'},
        }

        inv_ordenado = sorted(inv, key=lambda x: ITENS.get(x[0], {}).get('nome', x[0]))

        texto = '╭━━━ 🎒 *INVENTÁRIO* ━━━╮\n\n'
        for item_id, quantidade in inv_ordenado:
            info = ITENS.get(item_id, {})
            nome = info.get('nome', item_id)
            texto += f'   • {nome} x{quantidade}\n'

        texto += '\n━━━━━━━━━━━━━━━━━━━━━'
        return {'texto': texto}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_equipamentos_formatados(usuario_id):
    conn = conectar_banco()
    try:
        eq = conn.execute('SELECT * FROM equipamentos WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if not eq:
            return {'texto': '🛡️ *Nenhum equipamento encontrado!*'}
        colunas = [desc[0] for desc in conn.execute('SELECT * FROM equipamentos LIMIT 0').description]
        equipamentos = dict(zip(colunas, eq))
        ITENS = {
            'espada_madeira': {'nome': '🗡️ Espada de Madeira'},
            'espada_ferro': {'nome': '🗡️ Espada de Ferro'},
            'escudo_madeira': {'nome': '🛡️ Escudo de Madeira'},
            'capacete_couro': {'nome': '⛑️ Capacete de Couro'},
            'peitoral_couro': {'nome': '🦺 Peitoral de Couro'},
            'botas_couro': {'nome': '👢 Botas de Couro'},
        }
        slots = {'mao_direita': '🗡️ Mão Direita', 'mao_esquerda': '🛡️ Mão Esquerda', 'capacete': '⛑️ Capacete', 'peitoral': '🦺 Peitoral', 'pernas': '👖 Pernas', 'pes': '👢 Pés', 'acessorio1': '💍 Acessório 1', 'acessorio2': '💍 Acessório 2'}
        texto = '╭━━━ 🛡️ *EQUIPAMENTOS* ━━━╮\n\n'
        for key, label in slots.items():
            item_id = equipamentos.get(key)
            if item_id and item_id in ITENS:
                nome = ITENS[item_id].get('nome', item_id)
            elif item_id:
                nome = item_id
            else:
                nome = '— Vazio —'
            texto += f'{label}: {nome}\n'
        texto += '\n━━━━━━━━━━━━━━━━━━━━━'
        return {'texto': texto}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_mochila_formatada(usuario_id):
    conn = conectar_banco()
    try:
        mochila = conn.execute('SELECT nivel, slots FROM mochila WHERE jogador_id = ?', (usuario_id,)).fetchone()
        if not mochila:
            return {'texto': '🎒 *Mochila não encontrada!'}
        nivel, slots = mochila

        inv = conn.execute('SELECT item_id, quantidade FROM inventario WHERE jogador_id = ?', (usuario_id,)).fetchall()
        slots_usados = 0
        for item in inv:
            if item[1] > 0:
                slots_usados += 1

        disponivel = slots - slots_usados

        niveis = {1: {'nivel': 1, 'slots': 10, 'custo': 500}, 2: {'nivel': 2, 'slots': 15, 'custo': 1000}, 3: {'nivel': 3, 'slots': 20, 'custo': 2000}, 4: {'nivel': 4, 'slots': 30, 'custo': 5000}, 5: {'nivel': 5, 'slots': 40, 'custo': 10000}}
        texto = f'╭━━━ 🎒 *MOCHILA* ━━━╮\n\n📦 Slots: {slots_usados}/{slots}\n📦 Disponível: {disponivel}\n📦 Máx por slot: 32 itens\n\n'

        texto += '📋 *Itens guardados:*\n'
        ITENS = {
            'espada_madeira': {'nome': '🗡️ Espada de Madeira'},
            'espada_ferro': {'nome': '🗡️ Espada de Ferro'},
            'escudo_madeira': {'nome': '🛡️ Escudo de Madeira'},
            'capacete_couro': {'nome': '⛑️ Capacete de Couro'},
            'peitoral_couro': {'nome': '🦺 Peitoral de Couro'},
            'botas_couro': {'nome': '👢 Botas de Couro'},
            'pocao_vida': {'nome': '🧪 Poção de Vida'},
            'pocao_mana': {'nome': '🧪 Poção de Mana'},
            'madeira': {'nome': '🪵 Madeira'},
            'ferro': {'nome': '⛏️ Ferro'},
            'erva': {'nome': '🌿 Erva Curativa'},
            'vidro': {'nome': '🧪 Vidro'},
            'couro': {'nome': '🟫 Couro'},
            'picareta_madeira': {'nome': '⛏️ Picareta de Madeira'},
            'picareta_ferro': {'nome': '⛏️ Picareta de Ferro'},
        }

        if not inv:
            texto += '   🎒 Vazia...\n'
        else:
            for item_id, quantidade in inv:
                info = ITENS.get(item_id, {})
                nome = info.get('nome', item_id)
                slots_item = (quantidade + 31) // 32
                texto += f'   • {nome} x{quantidade} ({slots_item} slot{"s" if slots_item > 1 else ""})\n'

        texto += '\n━━━━━━━━━━━━━━━━━━━━━\n'
        proximo = niveis.get(nivel + 1)
        if proximo:
            texto += f'🔄 *Próximo nível:* {proximo["slots"]} slots\n💰 Custo: {proximo["custo"]} ouro\n📌 Use !upgrademochila para evoluir\n'
        else:
            texto += '⭐ Mochila no nível máximo!'

        return {'texto': texto}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 FUNÇÕES DE HISTÓRICO
# ============================================================

def jogador_acao(usuario_id, acao, detalhes=''):
    conn = conectar_banco()
    try:
        conn.execute('INSERT INTO historico_acoes (jogador_id, acao, detalhes) VALUES (?, ?, ?)', (usuario_id, acao, detalhes))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogador_historico(usuario_id, limite=10):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT acao, detalhes, data FROM historico_acoes WHERE jogador_id = ? ORDER BY data DESC LIMIT ?', (usuario_id, limite))
        colunas = [desc[0] for desc in cursor.description]
        historico = [dict(zip(colunas, row)) for row in cursor.fetchall()]
        return {'historico': historico}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 FUNÇÕES DE JOGOS (RANKING)
# ============================================================

def jogos_registrar(usuario_id, jogo, resultado, pontos, detalhes=''):
    conn = conectar_banco()
    try:
        conn.execute('''
            INSERT INTO jogos (jogador_id, jogo, resultado, pontos, detalhes)
            VALUES (?, ?, ?, ?, ?)
        ''', (usuario_id, jogo, resultado, pontos, detalhes))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogos_stats(usuario_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT jogo, resultado, pontos FROM jogos
            WHERE jogador_id = ?
        ''', (usuario_id,))
        rows = cursor.fetchall()
        conn.close()

        stats = {
            'total': 0,
            'vitorias': 0,
            'derrotas': 0,
            'pontos': 0,
            'porJogo': {}
        }

        for jogo, resultado, pontos in rows:
            stats['total'] += 1
            if resultado == 'vitoria':
                stats['vitorias'] += 1
            elif resultado == 'derrota':
                stats['derrotas'] += 1

            stats['pontos'] += pontos or 0

            if jogo not in stats['porJogo']:
                stats['porJogo'][jogo] = {'vitorias': 0, 'derrotas': 0, 'pontos': 0, 'total': 0}

            stats['porJogo'][jogo]['total'] += 1
            stats['porJogo'][jogo]['pontos'] += pontos or 0
            if resultado == 'vitoria':
                stats['porJogo'][jogo]['vitorias'] += 1
            elif resultado == 'derrota':
                stats['porJogo'][jogo]['derrotas'] += 1

        return {'stats': stats}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def jogos_ranking(limite=10):
    conn = conectar_banco()
    try:
        cursor = conn.execute('''
            SELECT 
                j.id,
                j.nome,
                COUNT(jo.id) as total_partidas,
                COALESCE(SUM(CASE WHEN jo.resultado = 'vitoria' THEN 1 ELSE 0 END), 0) as vitorias,
                COALESCE(SUM(CASE WHEN jo.resultado = 'derrota' THEN 1 ELSE 0 END), 0) as derrotas,
                COALESCE(SUM(jo.pontos), 0) as pontos
            FROM jogadores j
            INNER JOIN jogos jo ON jo.jogador_id = j.id
            GROUP BY j.id, j.nome
            ORDER BY pontos DESC, vitorias DESC
            LIMIT ?
        ''', (limite,))
        rows = cursor.fetchall()
        conn.close()

        ranking = []
        for row in rows:
            ranking.append({
                'id': row[0],
                'nome': row[1],
                'total': row[2],
                'vitorias': row[3],
                'derrotas': row[4],
                'pontos': row[5]
            })

        return {'ranking': ranking}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 📖 POPULAR LORE NO BANCO
# ============================================================

def lore_popular(lore_json):
    conn = conectar_banco()
    try:
        lore = json.loads(lore_json)

        # 1) Regiões
        for r in lore.get('mundo', {}).get('regioes', []):
            conn.execute('''
                INSERT OR REPLACE INTO lore_regioes 
                (id, nome, direcao, emoji, descricao, faccao, artefato, perigo, evento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                r['id'], r['nome'], r['direcao'], r['emoji'],
                r['descricao'], r['faccao'], r['artefato'],
                r['perigo'], r.get('evento', '')
            ))

        # 2) Capítulos
        for cap in lore.get('capitulos', []):
            conn.execute('''
                INSERT OR REPLACE INTO lore_aetheris 
                (id, categoria, titulo, conteudo, emoji, ordem)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                f"cap_{cap['numero']}", 'capitulo',
                cap['titulo'], cap['texto'], '📖', cap['numero']
            ))

        # 3) NPCs
        for npc_id, npc in lore.get('npcs', {}).items():
            conn.execute('''
                INSERT OR REPLACE INTO lore_npcs 
                (id, nome, titulo, emoji, regiao, descricao, papel, personalidade, fala_exemplo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                npc_id, npc['nome'], npc['titulo'], npc['emoji'],
                npc['regiao'], npc['descricao'], npc['papel'],
                npc.get('personalidade', ''),
                npc.get('fala_exemplo', '')
            ))

        # 4) Artefatos
        for art_id, art in lore.get('artefatos', {}).items():
            conn.execute('''
                INSERT OR REPLACE INTO lore_artefatos 
                (id, nome, titulo, emoji, regiao, descricao)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                art_id, art['nome'], art.get('titulo', ''), art['emoji'],
                art['regiao'], art['descricao']
            ))

        # 5) Facções
        for fac_id, fac in lore.get('faccoes', {}).items():
            conn.execute('''
                INSERT OR REPLACE INTO lore_aetheris 
                (id, categoria, titulo, conteudo, emoji, ordem)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                f"faccao_{fac_id}", 'faccao',
                fac['nome'], fac['descricao'], fac['emoji'], 100
            ))

        # 6) Locais
        for loc_id, loc in lore.get('locais', {}).items():
            conn.execute('''
                INSERT OR REPLACE INTO lore_aetheris 
                (id, categoria, titulo, conteudo, emoji, ordem)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                f"local_{loc_id}", 'local',
                loc['nome'], loc['descricao'], loc['emoji'], 200
            ))

        # 7) Metadados
        conn.execute('''
            INSERT OR REPLACE INTO ia_knowledge (categoria, chave, valor)
            VALUES (?, ?, ?)
        ''', ('lore', 'mundo', lore.get('mundo', {}).get('descricao', '')))

        conn.execute('''
            INSERT OR REPLACE INTO ia_knowledge (categoria, chave, valor)
            VALUES (?, ?, ?)
        ''', ('lore', 'titulo', lore.get('titulo', 'O Enigma de Aetheris')))

        conn.execute('''
            INSERT OR REPLACE INTO ia_knowledge (categoria, chave, valor)
            VALUES (?, ?, ?)
        ''', ('lore', 'versao', lore.get('versao', '1.1')))

        conn.commit()
        return {'status': 'ok', 'mensagem': 'Lore populada com sucesso!'}

    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def lore_completa():
    conn = conectar_banco()
    try:
        regioes = conn.execute('SELECT * FROM lore_regioes').fetchall()
        colunas_r = [d[0] for d in conn.execute('SELECT * FROM lore_regioes LIMIT 0').description]
        regioes_lista = [dict(zip(colunas_r, r)) for r in regioes]

        caps = conn.execute(
            'SELECT titulo, conteudo, ordem FROM lore_aetheris WHERE categoria = ? ORDER BY ordem',
            ('capitulo',)
        ).fetchall()

        npcs = conn.execute('SELECT * FROM lore_npcs').fetchall()
        colunas_n = [d[0] for d in conn.execute('SELECT * FROM lore_npcs LIMIT 0').description]
        npcs_lista = [dict(zip(colunas_n, n)) for n in npcs]

        arts = conn.execute('SELECT * FROM lore_artefatos').fetchall()
        colunas_a = [d[0] for d in conn.execute('SELECT * FROM lore_artefatos LIMIT 0').description]
        arts_lista = [dict(zip(colunas_a, a)) for a in arts]

        faccoes = conn.execute(
            'SELECT titulo, conteudo, emoji FROM lore_aetheris WHERE categoria = ?',
            ('faccao',)
        ).fetchall()

        locais = conn.execute(
            'SELECT titulo, conteudo, emoji FROM lore_aetheris WHERE categoria = ?',
            ('local',)
        ).fetchall()

        mundo = conn.execute(
            'SELECT valor FROM ia_knowledge WHERE chave = ?',
            ('mundo',)
        ).fetchone()

        conn.close()

        return {
            'mundo': mundo[0] if mundo else '',
            'regioes': regioes_lista,
            'capitulos': [{'titulo': c[0], 'texto': c[1]} for c in caps],
            'npcs': npcs_lista,
            'artefatos': arts_lista,
            'faccoes': [{'nome': f[0], 'descricao': f[1], 'emoji': f[2]} for f in faccoes],
            'locais': [{'nome': l[0], 'descricao': l[1], 'emoji': l[2]} for l in locais]
        }

    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def lore_buscar_npc(npc_id):
    conn = conectar_banco()
    try:
        cursor = conn.execute('SELECT * FROM lore_npcs WHERE id = ?', (npc_id,))
        row = cursor.fetchone()
        if not row:
            return {'erro': 'NPC não encontrado'}
        colunas = [d[0] for d in cursor.description]
        return {'npc': dict(zip(colunas, row))}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 💬 CONVERSAS COM IA
# ============================================================

def ia_salvar_conversa(jogador_id, npc_id, pergunta, resposta):
    conn = conectar_banco()
    try:
        conn.execute('''
            INSERT INTO ia_conversas (jogador_id, npc_id, pergunta, resposta)
            VALUES (?, ?, ?, ?)
        ''', (jogador_id, npc_id, pergunta, resposta))
        conn.commit()
        return {'status': 'ok'}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


def ia_historico(jogador_id, npc_id=None, limite=10):
    conn = conectar_banco()
    try:
        if npc_id:
            cursor = conn.execute('''
                SELECT pergunta, resposta, data FROM ia_conversas
                WHERE jogador_id = ? AND npc_id = ?
                ORDER BY data DESC LIMIT ?
            ''', (jogador_id, npc_id, limite))
        else:
            cursor = conn.execute('''
                SELECT pergunta, resposta, data FROM ia_conversas
                WHERE jogador_id = ?
                ORDER BY data DESC LIMIT ?
            ''', (jogador_id, limite))

        rows = cursor.fetchall()
        conn.close()

        return {'historico': [
            {'pergunta': r[0], 'resposta': r[1], 'data': r[2]}
            for r in rows
        ]}
    except Exception as e:
        return {'erro': str(e)}
    finally:
        conn.close()


# ============================================================
# 🔹 MAIN
# ============================================================

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'erro': 'Modo não especificado'}))
        sys.exit(1)

    modo = sys.argv[1]

    try:
        # ============================================================
        # 🧙 JOGADOR
        # ============================================================
        if modo == 'jogador_criar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            nome = sys.argv[3]
            print(json.dumps(jogador_criar(usuario_id, nome)))
        elif modo == 'jogador_carregar' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_carregar(usuario_id)))
        elif modo == 'jogador_salvar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            dados_json = sys.argv[3]
            print(json.dumps(jogador_salvar(usuario_id, dados_json)))
        elif modo == 'jogador_xp' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            quantidade = int(sys.argv[3])
            print(json.dumps(jogador_xp(usuario_id, quantidade)))
        elif modo == 'jogador_ouro' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            quantidade = int(sys.argv[3])
            print(json.dumps(jogador_ouro(usuario_id, quantidade)))
        elif modo == 'jogador_ouro_gastar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            quantidade = int(sys.argv[3])
            print(json.dumps(jogador_ouro_gastar(usuario_id, quantidade)))
        elif modo == 'jogador_item_adicionar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            item_id = sys.argv[3]
            quantidade = int(sys.argv[4]) if len(sys.argv) > 4 else 1
            print(json.dumps(jogador_item_adicionar(usuario_id, item_id, quantidade)))
        elif modo == 'jogador_item_remover' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            item_id = sys.argv[3]
            quantidade = int(sys.argv[4]) if len(sys.argv) > 4 else 1
            print(json.dumps(jogador_item_remover(usuario_id, item_id, quantidade)))
        elif modo == 'jogador_equipar' and len(sys.argv) >= 5:
            usuario_id = sys.argv[2]
            item_id = sys.argv[3]
            slot = sys.argv[4]
            print(json.dumps(jogador_equipar(usuario_id, item_id, slot)))
        elif modo == 'jogador_desequipar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            slot = sys.argv[3]
            print(json.dumps(jogador_desequipar(usuario_id, slot)))
        elif modo == 'jogador_mochila_upgrade' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_mochila_upgrade(usuario_id)))
        elif modo == 'jogador_descansar' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_descansar(usuario_id)))
        elif modo == 'jogador_atributos' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_atributos(usuario_id)))
        elif modo == 'jogador_espaco_mochila' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_espaco_mochila(usuario_id)))
        elif modo == 'jogador_inventario_formatado' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_inventario_formatado(usuario_id)))
        elif modo == 'jogador_equipamentos_formatados' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_equipamentos_formatados(usuario_id)))
        elif modo == 'jogador_mochila_formatada' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_mochila_formatada(usuario_id)))

        # ============================================================
        # 📜 MISSÕES
        # ============================================================
        elif modo == 'jogador_missao_aceitar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            missao_id = sys.argv[3]
            print(json.dumps(jogador_missao_aceitar(usuario_id, missao_id)))
        elif modo == 'jogador_missao_progresso' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            missao_id = sys.argv[3]
            print(json.dumps(jogador_missao_progresso(usuario_id, missao_id)))
        elif modo == 'jogador_missao_progresso_atualizar' and len(sys.argv) >= 5:
            usuario_id = sys.argv[2]
            missao_id = sys.argv[3]
            progresso = int(sys.argv[4])
            print(json.dumps(jogador_missao_progresso_atualizar(usuario_id, missao_id, progresso)))
        elif modo == 'jogador_missao_concluir' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            missao_id = sys.argv[3]
            print(json.dumps(jogador_missao_concluir(usuario_id, missao_id)))
        elif modo == 'jogador_missoes_listar' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_missoes_listar(usuario_id)))

        # ============================================================
        # 🏆 CONQUISTAS
        # ============================================================
        elif modo == 'jogador_conquista_desbloquear' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            conquista_id = sys.argv[3]
            print(json.dumps(jogador_conquista_desbloquear(usuario_id, conquista_id)))
        elif modo == 'jogador_conquista_verificar' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            conquista_id = sys.argv[3]
            print(json.dumps(jogador_conquista_verificar(usuario_id, conquista_id)))
        elif modo == 'jogador_conquistas_listar' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogador_conquistas_listar(usuario_id)))

        # ============================================================
        # 📊 HISTÓRICO
        # ============================================================
        elif modo == 'jogador_acao' and len(sys.argv) >= 4:
            usuario_id = sys.argv[2]
            acao = sys.argv[3]
            detalhes = sys.argv[4] if len(sys.argv) > 4 else ''
            print(json.dumps(jogador_acao(usuario_id, acao, detalhes)))
        elif modo == 'jogador_historico' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            limite = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            print(json.dumps(jogador_historico(usuario_id, limite)))
        elif modo == 'jogador_ranking':
            limite = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            print(json.dumps(jogador_ranking(limite)))

        # ============================================================
        # 📖 LORE
        # ============================================================
        elif modo == 'lore_popular' and len(sys.argv) >= 3:
            lore_json = sys.argv[2]
            print(json.dumps(lore_popular(lore_json)))
        elif modo == 'lore_completa':
            print(json.dumps(lore_completa(), ensure_ascii=False))
        elif modo == 'lore_buscar_npc' and len(sys.argv) >= 3:
            npc_id = sys.argv[2]
            print(json.dumps(lore_buscar_npc(npc_id)))

        # ============================================================
        # 💬 IA
        # ============================================================
        elif modo == 'ia_salvar_conversa' and len(sys.argv) >= 6:
            jogador_id = sys.argv[2]
            npc_id = sys.argv[3]
            pergunta = sys.argv[4]
            resposta = sys.argv[5]
            print(json.dumps(ia_salvar_conversa(jogador_id, npc_id, pergunta, resposta)))
        elif modo == 'ia_historico' and len(sys.argv) >= 3:
            jogador_id = sys.argv[2]
            npc_id = sys.argv[3] if len(sys.argv) > 3 else None
            limite = int(sys.argv[4]) if len(sys.argv) > 4 else 10
            print(json.dumps(ia_historico(jogador_id, npc_id, limite)))

        # ============================================================
        # 🎮 JOGOS
        # ============================================================
        elif modo == 'jogos_registrar' and len(sys.argv) >= 6:
            usuario_id = sys.argv[2]
            jogo = sys.argv[3]
            resultado = sys.argv[4]
            pontos = int(sys.argv[5])
            detalhes = sys.argv[6] if len(sys.argv) > 6 else ''
            print(json.dumps(jogos_registrar(usuario_id, jogo, resultado, pontos, detalhes)))
        elif modo == 'jogos_stats' and len(sys.argv) >= 3:
            usuario_id = sys.argv[2]
            print(json.dumps(jogos_stats(usuario_id)))
        elif modo == 'jogos_ranking':
            limite = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            print(json.dumps(jogos_ranking(limite)))

        # ============================================================
        # ❌ MODO INVÁLIDO
        # ============================================================
        else:
            print(json.dumps({'erro': 'Modo ou argumentos inválidos'}))

    except Exception as e:
        print(json.dumps({'erro': str(e)}))
