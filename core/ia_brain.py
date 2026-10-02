# core/ia_brain.py - IA VIVA DO RPGBOT (AETHERIS)
import sys
import os
import json
import sqlite3
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'database/ia_conhecimento.db')

# ============================================================
# 🔑 GROQ API
# ============================================================
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODELO = "openai/gpt-oss-120b"


def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # ← IMPORTANTE
    return conn


# ============================================================
# 📖 CARREGA A LORE COMPLETA DO BANCO
# ============================================================
def carregar_lore():
    conn = conectar()
    try:
        lore = {}

        # Mundo
        row = conn.execute("SELECT valor FROM ia_knowledge WHERE chave = 'mundo'").fetchone()
        lore['mundo'] = row['valor'] if row else ''

        # Regiões
        lore['regioes'] = [dict(r) for r in conn.execute("SELECT * FROM lore_regioes").fetchall()]

        # Capítulos
        lore['capitulos'] = [dict(r) for r in conn.execute(
            "SELECT titulo, conteudo FROM lore_aetheris WHERE categoria = 'capitulo' ORDER BY ordem"
        ).fetchall()]

        # NPCs
        lore['npcs'] = [dict(r) for r in conn.execute("SELECT * FROM lore_npcs").fetchall()]

        # Artefatos
        lore['artefatos'] = [dict(r) for r in conn.execute("SELECT * FROM lore_artefatos").fetchall()]

        # Facções
        lore['faccoes'] = [dict(r) for r in conn.execute(
            "SELECT titulo, conteudo, emoji FROM lore_aetheris WHERE categoria = 'faccao'"
        ).fetchall()]

        # Locais
        lore['locais'] = [dict(r) for r in conn.execute(
            "SELECT titulo, conteudo, emoji FROM lore_aetheris WHERE categoria = 'local'"
        ).fetchall()]

        return lore
    finally:
        conn.close()


# ============================================================
# 🧠 MONTA SYSTEM PROMPT
# ============================================================
def montar_system_prompt(lore, npc_id=None):
    mundo = lore.get('mundo', '')

    # Regiões
    regioes_txt = "\n".join([
        f"- {r.get('emoji', '')} {r.get('nome', '')} ({r.get('direcao', '')}): {r.get('descricao', '')}"
        for r in lore.get('regioes', [])
    ])

    # Artefatos
    artefatos_txt = "\n".join([
        f"- {a.get('emoji', '')} {a.get('nome', '')}: {a.get('descricao', '')}"
        for a in lore.get('artefatos', [])
    ])

    # Locais
    locais_txt = "\n".join([
        f"- {l.get('emoji', '')} {l.get('titulo', '')}: {l.get('conteudo', '')}"
        for l in lore.get('locais', [])
    ])

    # Facções
    faccoes_txt = "\n".join([
        f"- {f.get('emoji', '')} {f.get('titulo', '')}: {f.get('conteudo', '')}"
        for f in lore.get('faccoes', [])
    ])

    # NPCs
    npcs_txt = "\n".join([
        f"- {n.get('emoji', '')} {n.get('nome', '')} ({n.get('titulo', '')}): {n.get('descricao', '')}"
        for n in lore.get('npcs', [])
    ])

    # Capítulos
    capitulos_txt = "\n".join([
        f"- Cap. {i+1} - {c.get('titulo', '')}: {c.get('conteudo', '')[:150]}..."
        for i, c in enumerate(lore.get('capitulos', [])[-10:])
    ])

    base = f"""Você é a inteligência ancestral que habita o mundo de AETHERIS, um RPG de fantasia sombria que se passa na TERRA DE TRINITAS.

⚠️ REGRA ABSOLUTA: Você SÓ responde sobre o mundo de Aetheris. 
Se o usuário perguntar qualquer coisa FORA do RPG (matemática, notícias, política, receitas, etc.), 
responda com uma negativa imersiva, tipo:
"Os sussurros de Aetheris não alcançam esse conhecimento, viajante. Fale-me dos três territórios, dos Stuntis, do dragão de Domignia... Apenas sobre isso posso revelar."

═══════════════════════════════════════
🌍 O MUNDO
═══════════════════════════════════════
{mundo}

═══════════════════════════════════════
🗺️ AS 3 REGIÕES
═══════════════════════════════════════
{regioes_txt}

═══════════════════════════════════════
⚔️ ARTEFATOS LENDÁRIOS
═══════════════════════════════════════
{artefatos_txt}

═══════════════════════════════════════
📜 LOCAIS MÍSTICOS
═══════════════════════════════════════
{locais_txt}

═══════════════════════════════════════
🎯 FACÇÕES
═══════════════════════════════════════
{faccoes_txt}

═══════════════════════════════════════
🎭 NPCs DO MUNDO
═══════════════════════════════════════
{npcs_txt}

═══════════════════════════════════════
📖 CAPÍTULOS RECENTES
═══════════════════════════════════════
{capitulos_txt}

═══════════════════════════════════════
🎙️ ESTILO DE RESPOSTA
═══════════════════════════════════════
- Fale de forma imersiva, mística e ancestral
- Use linguagem de fantasia, mas acessível
- Refira-se ao usuário como "viajante", "mortal", "aquele que ousa"
- NUNCA quebre o personagem
- NUNCA fale sobre o mundo real
- Respostas curtas (máx 3 parágrafos)
- Use emojis com moderação (⚔️ 🔮 ❄️ 🔥 🌿)
"""

    if npc_id:
        npc = None
        for n in lore.get('npcs', []):
            if n.get('id') == npc_id:
                npc = n
                break

        if npc:
            base += f"""

═══════════════════════════════════════
🎭 VOCÊ É AGORA: {npc.get('nome', '')}
═══════════════════════════════════════
Título: {npc.get('titulo', '')}
Região: {npc.get('regiao', '')}
Papel: {npc.get('papel', '')}
Descrição: {npc.get('descricao', '')}
Personalidade: {npc.get('personalidade', 'Fiel ao seu papel na lore')}

Fale COMO {npc.get('nome', '')}. Use a voz, o tom e a personalidade dele.
"""
    return base


# ============================================================
# 🤖 CHAMA A GROQ
# ============================================================
def chamar_groq(system_prompt, pergunta, historico=None):
    if not GROQ_API_KEY:
        return {"erro": "GROQ_API_KEY não configurada"}

    messages = [{"role": "system", "content": system_prompt}]

    if historico:
        for h in historico[-5:]:
            messages.append({"role": "user", "content": h.get('pergunta', '')})
            messages.append({"role": "assistant", "content": h.get('resposta', '')})

    messages.append({"role": "user", "content": pergunta})

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODELO,
                "messages": messages,
                "temperature": 0.8,
                "max_tokens": 500
            },
            timeout=30
        )

        if response.status_code != 200:
            return {"erro": f"Groq API erro {response.status_code}: {response.text[:200]}"}

        data = response.json()
        return {"resposta": data['choices'][0]['message']['content']}

    except Exception as e:
        return {"erro": str(e)}


# ============================================================
# 💬 FUNÇÃO PRINCIPAL
# ============================================================
def responder(jogador_id, pergunta, npc_id=None):
    try:
        lore = carregar_lore()

        if not lore.get('mundo'):
            return {"erro": "Lore não populada no banco."}

        system_prompt = montar_system_prompt(lore, npc_id)

        historico = []
        if jogador_id:
            conn = conectar()
            if npc_id:
                rows = conn.execute(
                    "SELECT pergunta, resposta FROM ia_conversas WHERE jogador_id = ? AND npc_id = ? ORDER BY data DESC LIMIT 5",
                    (jogador_id, npc_id)
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT pergunta, resposta FROM ia_conversas WHERE jogador_id = ? ORDER BY data DESC LIMIT 5",
                    (jogador_id,)
                ).fetchall()
            conn.close()
            historico = [dict(r) for r in rows][::-1]

        result = chamar_groq(system_prompt, pergunta, historico)

        if "erro" in result:
            return result

        resposta = result['resposta']

        if jogador_id:
            conn = conectar()
            conn.execute(
                "INSERT INTO ia_conversas (jogador_id, npc_id, pergunta, resposta) VALUES (?, ?, ?, ?)",
                (jogador_id, npc_id or 'geral', pergunta, resposta)
            )
            conn.commit()
            conn.close()

        return {"resposta": resposta}

    except Exception as e:
        return {"erro": str(e)}


# ============================================================
# 🔥 MAIN
# ============================================================
if __name__ == '__main__':
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"erro": "Uso: ia_brain.py <modo> <args>"}))
            sys.exit(1)

        modo = sys.argv[1]

        if modo == 'responder':
            jogador_id = sys.argv[2]
            pergunta = sys.argv[3]
            npc_id = sys.argv[4] if len(sys.argv) > 4 else None
            print(json.dumps(responder(jogador_id, pergunta, npc_id), ensure_ascii=False))

        elif modo == 'lore_completa':
            print(json.dumps(carregar_lore(), ensure_ascii=False))

        elif modo == 'montar_prompt':
            lore = carregar_lore()
            npc_id = sys.argv[2] if len(sys.argv) > 2 else None
            print(json.dumps({"prompt": montar_system_prompt(lore, npc_id)}, ensure_ascii=False))

        else:
            print(json.dumps({"erro": f"Modo desconhecido: {modo}"}))

    except Exception as e:
        print(json.dumps({"erro": str(e)}))
