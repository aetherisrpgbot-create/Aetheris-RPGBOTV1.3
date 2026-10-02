# ia_brain.py - IA COMPLETA (SEM JOGADORES)
import sys
import json
import re
import sqlite3
import os
import random
import subprocess
import urllib.request
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database/ia_conhecimento.db')

# 🔥 SUPRIME TODOS OS LOGS
sys.stderr = open(os.devnull, 'w')

# ============================================================
# 🔥 BANCO DE DADOS
# ============================================================

def conectar_banco():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    
    # 🔹 TABELA IA CONHECIMENTO
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ia_conhecimento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT,
            personagem TEXT,
            pergunta TEXT,
            resposta TEXT,
            usos INTEGER DEFAULT 1,
            criado DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, personagem, pergunta)
        )
    ''')
    
    # 🔹 TABELA HISTÓRICO DE CONVERSAS
    conn.execute('''
        CREATE TABLE IF NOT EXISTS historico_conversas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT,
            personagem TEXT,
            pergunta TEXT,
            resposta TEXT,
            contexto TEXT,
            data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 🔹 TABELA CONTEXTO DO USUÁRIO
    conn.execute('''
        CREATE TABLE IF NOT EXISTS contexto_usuario (
            usuario_id TEXT PRIMARY KEY,
            nome TEXT,
            classe TEXT,
            nivel INTEGER,
            ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    return conn

# ============================================================
# 🔥 FUNÇÕES DO BANCO
# ============================================================

def buscar_resposta(usuario_id, personagem, pergunta):
    conn = conectar_banco()
    cursor = conn.execute(
        'SELECT resposta FROM ia_conhecimento WHERE usuario_id = ? AND personagem = ? AND pergunta = ?',
        (usuario_id, personagem, pergunta)
    )
    resultado = cursor.fetchone()
    conn.close()
    return resultado[0] if resultado else None

def salvar_resposta(usuario_id, personagem, pergunta, resposta):
    conn = conectar_banco()
    try:
        conn.execute(
            'INSERT OR REPLACE INTO ia_conhecimento (usuario_id, personagem, pergunta, resposta) VALUES (?, ?, ?, ?)',
            (usuario_id, personagem, pergunta, resposta)
        )
        conn.commit()
    except Exception as e:
        print(f"Erro ao salvar: {e}", file=sys.stderr)
    conn.close()

def salvar_historico(usuario_id, personagem, pergunta, resposta, contexto=''):
    conn = conectar_banco()
    try:
        conn.execute(
            'INSERT INTO historico_conversas (usuario_id, personagem, pergunta, resposta, contexto) VALUES (?, ?, ?, ?, ?)',
            (usuario_id, personagem, pergunta, resposta, contexto)
        )
        conn.commit()
    except Exception as e:
        print(f"Erro ao salvar histórico: {e}", file=sys.stderr)
    conn.close()

def buscar_historico(usuario_id, personagem, limite=5):
    conn = conectar_banco()
    cursor = conn.execute(
        'SELECT pergunta, resposta FROM historico_conversas WHERE usuario_id = ? AND personagem = ? ORDER BY data DESC LIMIT ?',
        (usuario_id, personagem, limite)
    )
    resultados = cursor.fetchall()
    conn.close()
    return [{'pergunta': r[0], 'resposta': r[1]} for r in resultados]

def buscar_contexto(usuario_id):
    conn = conectar_banco()
    cursor = conn.execute(
        'SELECT * FROM contexto_usuario WHERE usuario_id = ?',
        (usuario_id,)
    )
    resultado = cursor.fetchone()
    conn.close()
    if resultado:
        return {'nome': resultado[1], 'classe': resultado[2], 'nivel': resultado[3]}
    return None

def salvar_contexto(usuario_id, nome, classe, nivel):
    conn = conectar_banco()
    try:
        conn.execute(
            'INSERT OR REPLACE INTO contexto_usuario (usuario_id, nome, classe, nivel) VALUES (?, ?, ?, ?)',
            (usuario_id, nome, classe, nivel)
        )
        conn.commit()
    except Exception as e:
        print(f"Erro ao salvar contexto: {e}", file=sys.stderr)
    conn.close()

# ============================================================
# 🔥 RESPOSTAS FIXAS
# ============================================================

RESPOSTAS_FIXAS = {
    'oi': 'Olá! Como posso ajudar? 👋',
    'olá': 'Olá! Como posso ajudar? 👋',
    'bom dia': 'Bom dia! ☀️',
    'boa tarde': 'Boa tarde! 🌤️',
    'boa noite': 'Boa noite! 🌙',
    'tchau': 'Tchau! Até mais! 👋',
    'obrigado': 'Por nada! 😊',
    'valeu': 'Valeu! 👍',
}

RESPOSTAS_ALEATORIAS = [
    '🤔 Boa pergunta! Deixa eu pensar...',
    '😄 Que legal! Me fala mais!',
    '🧐 Interessante! Nunca pensei nisso.',
    '📚 Posso aprender sobre isso!',
    '🤖 Sou um bot, mas estou sempre aprendendo!',
]

# ============================================================
# 🔥 CHAMAR GROQ (VIA NODE)
# ============================================================

def chamar_groq(pergunta):
    try:
        pergunta_escapada = pergunta.replace('"', '\\"').replace("'", "\\'")
        
        node_script = f'''
        const Groq = require('groq-sdk');
        const groq = new Groq({{ apiKey: process.env.GROQ_API_KEY }});
        groq.chat.completions.create({{
            messages: [
                {{ role: 'system', content: 'Responda em português de forma direta e clara.' }},
                {{ role: 'user', content: '{pergunta_escapada}' }}
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.7,
            max_tokens: 300
        }}).then(r => console.log(JSON.stringify({{ resposta: r.choices[0].message.content }})));
        '''
        
        result = subprocess.run(
            ['node', '-e', node_script],
            capture_output=True,
            text=True,
            env={**os.environ, 'GROQ_API_KEY': os.environ.get('GROQ_API_KEY', '')}
        )
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            resposta = data.get('resposta', '')
            resposta = re.sub(r'<think>.*?</think>', '', resposta, flags=re.DOTALL)
            resposta = re.sub(r'<thinking>.*?</thinking>', '', resposta, flags=re.DOTALL)
            resposta = re.sub(r'\s+', ' ', resposta).strip()
            return resposta
        return None
    except Exception:
        return None

# ============================================================
# 🔥 FUNÇÃO PRINCIPAL
# ============================================================

def responder(usuario_id, mensagem, personagem='geral'):
    mensagem_limpa = mensagem.lower().strip()
    
    # 1. Respostas fixas
    for palavra, resposta in RESPOSTAS_FIXAS.items():
        if palavra in mensagem_limpa:
            return resposta
    
    # 2. Buscar no banco
    resposta = buscar_resposta(usuario_id, personagem, mensagem_limpa)
    if resposta:
        return resposta
    
    # 3. Fallback
    return random.choice(RESPOSTAS_ALEATORIAS)

# ============================================================
# 🔥 MAIN
# ============================================================

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'erro': 'Modo não especificado'}))
        sys.exit(1)
    
    modo = sys.argv[1]
    
    # 🔹 BUSCAR CONHECIMENTO
    if modo == 'buscar' and len(sys.argv) >= 5:
        usuario_id = sys.argv[2]
        personagem = sys.argv[3]
        pergunta = sys.argv[4]
        resposta = buscar_resposta(usuario_id, personagem, pergunta)
        print(json.dumps({'resposta': resposta}))
    
    # 🔹 SALVAR CONHECIMENTO
    elif modo == 'salvar' and len(sys.argv) >= 6:
        usuario_id = sys.argv[2]
        personagem = sys.argv[3]
        pergunta = sys.argv[4]
        resposta = sys.argv[5]
        salvar_resposta(usuario_id, personagem, pergunta, resposta)
        print(json.dumps({'status': 'ok'}))
    
    # 🔹 SALVAR HISTÓRICO
    elif modo == 'historico' and len(sys.argv) >= 6:
        usuario_id = sys.argv[2]
        personagem = sys.argv[3]
        pergunta = sys.argv[4]
        resposta = sys.argv[5]
        contexto = sys.argv[6] if len(sys.argv) > 6 else ''
        salvar_historico(usuario_id, personagem, pergunta, resposta, contexto)
        print(json.dumps({'status': 'ok'}))
    
    # 🔹 BUSCAR HISTÓRICO
    elif modo == 'historico_buscar' and len(sys.argv) >= 4:
        usuario_id = sys.argv[2]
        personagem = sys.argv[3]
        limite = int(sys.argv[4]) if len(sys.argv) > 4 else 5
        historico = buscar_historico(usuario_id, personagem, limite)
        print(json.dumps({'historico': historico}))
    
    # 🔹 BUSCAR CONTEXTO
    elif modo == 'contexto' and len(sys.argv) >= 3:
        usuario_id = sys.argv[2]
        contexto = buscar_contexto(usuario_id)
        print(json.dumps({'contexto': contexto}))
    
    # 🔹 SALVAR CONTEXTO
    elif modo == 'contexto_salvar' and len(sys.argv) >= 6:
        usuario_id = sys.argv[2]
        nome = sys.argv[3]
        classe = sys.argv[4]
        nivel = int(sys.argv[5])
        salvar_contexto(usuario_id, nome, classe, nivel)
        print(json.dumps({'status': 'ok'}))
    
    # 🔹 RESPONDER
    elif modo == 'responder' and len(sys.argv) >= 4:
        usuario_id = sys.argv[2]
        pergunta = sys.argv[3]
        personagem = sys.argv[4] if len(sys.argv) > 4 else 'geral'
        resultado = responder(usuario_id, pergunta, personagem)
        print(json.dumps({'resposta': resultado}))
    
    else:
        print(json.dumps({'erro': 'Modo ou argumentos inválidos'}))
