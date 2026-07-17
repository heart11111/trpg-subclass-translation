# -*- coding: utf-8 -*-
"""df-chat-enhance 채팅 아카이브 JSON -> 렌더링된 log.html 합성.

아카이브 JSON은 ChatMessage 원본 배열이라 렌더링 HTML이 없다. FVTT가
렌더링했을 형태(li.chat-message + h4.message-sender + message-content)로
합성해 heartformat 변환기에 넣을 수 있게 한다.

- 초상화: world_actors.json(월드별 actorId -> img/token)에서 해석,
  df-chat-enhance처럼 h4 안에 <a class="avatar"><img>> 삽입
- 굴림: rolls 배열에서 formula/total을 꺼내 dice-roll 블록 합성
- 귓속말: whisper 유저 id -> 이름(world_users.json), li에 whisper 클래스
- mrkb type description/turn -> name-box(중앙 묘사 카드로 변환됨)
"""

import html as html_mod
import io
import json
import os

MYSTERY = 'icons/svg/mystery-man.svg'


def load_maps(actors_path, users_path):
    with io.open(actors_path, encoding='utf-8') as f:
        actors = json.load(f)
    with io.open(users_path, encoding='utf-8') as f:
        users = json.load(f)
    return actors, users


def _portrait(actors, speaker):
    aid = (speaker or {}).get('actor')
    if not aid or aid not in actors:
        return None
    a = actors[aid]
    img = a.get('img')
    if not img or img == MYSTERY:
        img = a.get('token')
    if not img or img == MYSTERY:
        return None
    return img


def _roll_blocks(msg):
    blocks = []
    for r in msg.get('rolls') or []:
        try:
            data = json.loads(r) if isinstance(r, str) else r
        except (ValueError, TypeError):
            continue
        formula = data.get('formula') or ''
        total = data.get('total')
        if total is None:
            continue
        total = int(total) if float(total).is_integer() else total
        blocks.append(
            f'<div class="dice-roll"><div class="dice-result">'
            f'<div class="dice-formula">{html_mod.escape(str(formula))}</div>'
            f'<h4 class="dice-total">{total}</h4></div></div>')
    return blocks


def message_to_li(msg, actors, users):
    speaker = msg.get('speaker') or {}
    author_id = msg.get('author') or msg.get('user')
    if isinstance(author_id, dict):
        author_id = author_id.get('_id')
    user = users.get(author_id) or {}
    alias = speaker.get('alias') or user.get('name') or 'Unknown'

    whisper = msg.get('whisper') or []
    classes = 'chat-message message'
    if whisper:
        classes += ' whisper'

    # mrkb 묘사/턴 메시지 -> name-box (변환기에서 중앙 묘사 카드)
    mrkb = (msg.get('flags') or {}).get('mrkb-chat-enhancements') or {}
    mrkb_type = mrkb.get('type')

    portrait = _portrait(actors, speaker)
    avatar = (f'<a class="avatar"><img src="{html_mod.escape(portrait)}"'
              f' alt="{html_mod.escape(alias)}"></a>') if portrait else ''

    whisper_to = ''
    if whisper:
        names = [users.get(w, {}).get('name', '???') for w in whisper]
        whisper_to = f'<span class="whisper-to">To: {html_mod.escape(", ".join(names))}</span>'

    flavor = msg.get('flavor') or ''
    flavor_span = f'<span class="flavor-text">{flavor}</span>' if flavor else ''

    content = msg.get('content') or ''
    rolls = _roll_blocks(msg)
    if rolls:
        # 굴림 메시지: content가 총합 숫자만 담는 경우가 많아 dice 블록으로 대체
        if content.strip().isdigit() or not content.strip():
            content = '\n'.join(rolls)
        else:
            content = content + '\n' + '\n'.join(rolls)

    if mrkb_type in ('description', 'turn'):
        content = f'<span class="name-box">{content}</span>'

    return (f'<li class="{classes}">\n'
            f'  <header class="message-header">\n'
            f'    <h4 class="message-sender">{avatar}{html_mod.escape(alias)}</h4>\n'
            f'    {whisper_to}{flavor_span}\n'
            f'  </header>\n'
            f'  <div class="message-content">{content}</div>\n'
            f'</li>')


def archive_to_html(json_path, actors, users):
    with io.open(json_path, encoding='utf-8') as f:
        messages = json.load(f)
    if isinstance(messages, dict):
        messages = messages.get('messages') or []
    messages = sorted(messages, key=lambda m: m.get('timestamp') or 0)
    messages = [m for m in messages
                if (m.get('content') or '').strip() or m.get('rolls')]
    lis = [message_to_li(m, actors, users) for m in messages]
    return ('<ol class="chat-log" id="df-chat-log">\n' + '\n'.join(lis) + '\n</ol>'), len(lis)
