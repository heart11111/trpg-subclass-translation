# -*- coding: utf-8 -*-
"""heartbackup 양식 변환기.

heartbackup.exe(FVTT 채팅 로그 HTML -> 인라인 스타일 로그 HTML)의 로직을
바이트코드 분석으로 복원해 그대로 재현한다. 입력은 FVTT가 렌더링한
<li class="chat-message ..."> 카드 목록이 담긴 HTML, 출력은 카드별
인라인 스타일 div의 연결(fragment)이다.

원본과 다른 점:
- portraits 매핑을 파일 경로 대신 dict로 받는다.
- PC 이름 치환(원본에 하드코딩돼 있던 '보리밥 PC'->'드라로로' 등)을
  speaker_map 인자로 받는다.
- GM 판정을 'DM' 고정 대신 gm_names 집합으로 받는다.
- css 선택자(select)를 쓰지 않는다(soupsieve 미설치 환경 대응).
"""

import re
from bs4 import BeautifulSoup, NavigableString

# ---------------------------------------------------------------- templates

ERROR_CARD = (
    '\n        <div class="message general you" style="font-family: Pretendard-Regular,'
    ' sans-serif; padding: 5px 10px; margin: 5px 0; border-radius: 4px; background-color:'
    ' #FFABAB; color: #000000; font-size: 16px; max-width: 200px; line-height: 1.25em;">'
    ' ERROR</div>"\n        '
)

INLINE_SPAN_START = (
    '<span style="font-family: Pretendard-Regular, sans-serif; padding: 2px 5px; margin: 0px;'
    ' border: 1px solid #999999; outline: none; background: rgba(255, 255, 255, 0.4);'
    ' font-weight: bolder; cursor: help; font-size: 1.1em;"'
    ' class="inlinerollresult showtip tipsy-n-right">'
)

DM_OPEN = (
    '<div class="message general you" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 45px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; background: #dddddd; color: #404040; font-size: 16px;">'
)

SYSTEM_OPEN = (
    '<div class="message general system" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 45px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; background-color: rgba(45, 45, 45, 0); color: #9b9b9b; font-size: 16px;">'
)

SYSTEM_OPEN_NONAME = (
    '<div class="message general system" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 40px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; background-color: rgba(45, 45, 45, 0); color: #9b9b9b; font-size: 16px;">'
)

GENERAL_OPEN = (
    '<div class="message general" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 45px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; color: #3f3f3f; font-size: 16px;">'
)

WHISPER_OPEN = (
    '<div class="message private whisper" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 45px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; background-color: #f2f5d3; color: #404040; font-size: 16px;">'
)

PORTRAIT_IMG = (
    '<img style="font-family: Pretendard-Regular, sans-serif; padding: 0px; margin: 0px;'
    ' border: none; outline: none; width: 28px; height: 28px; object-fit: cover;'
    ' border-radius: 0%;" src="REPLACEIMG" />'
)

_SPACER = (
    '<div class="spacer" style="font-family: Pretendard-Regular, sans-serif; padding: 0px;'
    ' margin: 0px -5px 8px -45px; border: none; outline: none; background-color: {color};'
    ' height: 1px;">&nbsp;</div>'
)

_AVATAR_OPEN = (
    '<div class="avatar" style="font-family: Pretendard-Regular, sans-serif; padding: 0px;'
    ' margin: 0px; border: none; outline: none; position: absolute; top: 0.2rem; left: 5px;'
    ' width: 28px; height: 28px; align-items: stretch;" aria-hidden="true">'
)

_BY_SPAN = (
    '<span style="font-family: Pretendard-Regular, sans-serif; padding: 0px; margin: 0px;'
    ' border: none; outline: none; font-weight: bold; position: relative; display: inline-block;'
    ' left: -5px; vertical-align: top;" class="by">'
)


def _header(indent, spacer_color='#e1e1e1', with_img=True):
    """spacer + avatar(+img) + name-span 헤더 블록."""
    pad = ' ' * indent
    img = ('\n' + pad + '    ' + PORTRAIT_IMG + '\n' + pad) if with_img else '\n' + pad + '    '
    body = _AVATAR_OPEN + img + '</div>' if with_img else _AVATAR_OPEN + '\n' + pad + '        &nbsp;</div>'
    return ('\n' + pad + _SPACER.format(color=spacer_color)
            + '\n' + pad + body
            + '\n' + pad + _BY_SPAN)


HEADER_GENERAL = _header(16)                       # DM/일반/시스템(이름 있음) 카드
HEADER_SYSTEM = _header(20, with_img=False)        # 시스템 카드 (아바타 자리 비움)
HEADER_WHISPER = _header(12, spacer_color='#f0f092')

DESC_CARD = (
    '\n            <div class="message desc" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px 5px 6px 15px; margin: 0px; border: none; outline: none; position: relative;'
    ' line-height: 1.25em; font-style: italic; font-weight: bold; text-align: center;'
    ' background-color: rgba(241, 241, 241, 0); color: #404040; font-size: 16px;">'
    '\n            <div class="spacer" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 0px; margin: 0px -5px 8px -15px; border: none; outline: none; background-color:'
    ' #ddd; height: 1px;">&nbsp;</div>\n            {text}\n            </div>\n            '
)

SHEET_DESC = (
    '<div class="sheet-desc" style="font-family: Pretendard-Regular, sans-serif;'
    ' padding: 5px 0px 2px; margin: 0px; border: none; outline: none; color: #b2b2b2;'
    ' font-size: 11px;">{text}</div>'
)

SHEET_RESULT = (
    '<div class="sheet-result" style="font-family: Pretendard-Regular, sans-serif; padding: 0px;'
    ' margin: 0px; border: none; outline: none;"><span style="font-family: Fraunces, serif;'
    ' padding: 2px 5px; margin: 0px; border: 0px; outline: none; background: transparent;'
    ' font-weight: bold; cursor: help; font-size: 24px; text-align: center; {color}"'
    ' class="inlinerollresult showtip tipsy-n-right">{roll}</span></div>'
)

SHEET_DMG_SPAN = (
    '<span style="font-family: Pretendard-Regular, sans-serif; padding: 0px; margin: 0px;'
    ' border: 0px; outline: none; background: transparent; font-weight: bold; cursor: help;'
    ' text-align: center;" class="inlinerollresult showtip tipsy-n-right">{damage}</span></div>'
)

SHEET_DMG_OPEN = (
    '<div class="sheet-dmg" style="font-family: Pretendard-Regular, sans-serif; padding: 3px;'
    ' margin: 2px 0px 0px; border: none; outline: none; font-size: 14px; background-color:'
    ' #eeeeee;"> 피해:&nbsp;{damage_text}'
)

TAG_DARK = (
    '<span style="font-family: Pretendard-Regular, sans-serif; padding: 1px 5px; margin: 4px 0px'
    ' 0px; border: none; outline: none; display: inline-block; background-color: #333333;'
    ' border-radius: 2px; font-size: 11px; color: white;" class="sheet-tag">{text}</span>'
)

TAG_DARK_HL = (
    '<span style="font-family: Pretendard-Regular, sans-serif; padding: 1px 5px; margin: 4px 0px'
    ' 0px; border: none; outline: none; display: inline-block; background-color: #333333;'
    ' border-radius: 2px; font-size: 11px; color: white;" class="sheet-tag sheet-hl">{text}</span>'
)

TAG_LIGHT = (
    '&nbsp;<span style="font-family: Pretendard-Regular, sans-serif; padding: 1px 5px; margin:'
    ' 4px 0px 0px; border: none; outline: none; display: inline-block; background-color:'
    ' #dbdbdb; border-radius: 2px; font-size: 11px;" class="sheet-tag">{text}</span>'
)

ROLL_HEADER = _header(8)  # roll 카드 화자 헤더 (원본은 by 스팬 뒤 ZWSP 포함)

ROLLTEMPLATE_OPEN = (
    '\n    <div class="sheet-rolltemplate-custom" style="font-family: Pretendard-Regular,'
    ' sans-serif; padding: 0px; margin: 0px; border-width: 10px 0px; border-image: initial;'
    ' outline: none; position: relative; width: 100%; max-width: 500px; box-sizing: border-box;'
    ' border-color: transparent initial transparent initial; border-style: solid initial solid'
    ' initial;">\n        <div class="sheet-rtw" style="font-family: Pretendard-Regular,'
    ' sans-serif; padding: 12px; margin: 0px; border: none; outline: none; background-color:'
    ' white; border-radius: 0px 20px;">\n            <div class="sheet-rth" style="font-family:'
    ' Pretendard-Regular, sans-serif; padding: 0px; margin: 0px; border: none; outline: none;">'
    '\n                <span style="font-family: Pretendard-Regular, sans-serif; padding: 0px;'
    ' margin: 0px; border: none; outline: none; display: block; font-size: 16px; font-weight:'
    ' 800; line-height: 1.6;">'
)

ROLLTEMPLATE_BODY = (
    '\n            </div>\n            <div class="sheet-rtb" style="font-family:'
    ' Pretendard-Regular, sans-serif; padding: 0px; margin: 4px 0px 0px; border-top: 1px solid'
    ' #dbdbdb; border-right: none; border-bottom: none; border-left: none; border-image:'
    ' initial; outline: none;">\n                '
)

ROLLTEMPLATE_CLOSE = '\n            </div>\n        </div>\n    </div>\n    '

# ---------------------------------------------------------------- parsing


def harvest_portraits(log_html):
    """df-chat-enhance가 .message-sender 안에 심은 아바타에서 화자→초상화 src를 수확."""
    soup = BeautifulSoup(log_html, 'html.parser')
    portraits = {}
    for sender in soup.find_all('h4', class_='message-sender'):
        img = sender.find('img')
        if not img:
            # mrkb-chat-enhancements는 초상화를 h4 밖 header에 붙인다
            header = sender.find_parent('header')
            if header:
                img = header.find('img', class_='message-portrait') or header.find('img')
        if not img or not img.get('src'):
            continue
        name = sender.get_text(strip=True)
        if name and name not in portraits:
            portraits[name] = img['src']
    return portraits


def harvest_image_srcs(log_html):
    """로그 안의 모든 <img> src 목록 (중복 제거, 순서 유지)."""
    soup = BeautifulSoup(log_html, 'html.parser')
    seen = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and src not in seen:
            seen.append(src)
    return seen


def parse_file(log_html):
    """최상위 <li> 카드들을 문자열 목록으로 반환."""
    soup = BeautifulSoup(log_html, 'html.parser')
    all_lis = soup.find_all('li')
    outer = [li for li in all_lis if li.find_parent('li') is None]
    return [str(li) for li in outer]


def card_type(card_item):
    soup = BeautifulSoup(card_item, 'html.parser')
    if 'HP 업데이트 되지 않음' in soup.text or 'HP 업데이트 됨' in soup.text:
        return 'Damage Application Card'
    if soup.find(class_='monks-tokenbar savingthrow chat-card'):
        return 'Duplicate Saving Throw Card'
    # 원본 pyc에도 'x' 접두어로 비활성화돼 있던 분기(그대로 유지)
    if soup.find(class_='xmidi-qol-flex-container midi-qol-player-damage-card'):
        return 'Target Card'
    if soup.find(lambda t: t.has_attr('class') and 'dnd5e2' in t['class'] and 'chat-card' in t['class']):
        return 'Midi Roll Card'
    if soup.find(class_='dice-roll'):
        return 'Regular Roll Card'
    return 'Chat Card'


# ---------------------------------------------------------------- chat cards


def chatcard(card_item):
    soup = BeautifulSoup(card_item, 'html.parser')
    card_data = ['Chat Card']

    # 휴식 카드
    target_phrases = ['긴 휴식 (새로운 하루)', '짧은 휴식 (1 시간)']
    flavor_text_span = soup.find('span', class_='flavor-text')
    if flavor_text_span and any(p in flavor_text_span.get_text() for p in target_phrases):
        card_data.append('시스템')
        message_content = soup.find('div', class_='message-content')
        if message_content:
            card_data.append(message_content.get_text(strip=True))

    # HP 변동 메시지 (hm-message)
    hm_message_div = soup.find('div', class_=lambda c: c and 'hm-message' in c)
    if hm_message_div:
        card_data.append('시스템')
        span = hm_message_div.find('span')
        if span:
            original_text = span.get_text(strip=True)
            patterns = [
                (r'(.+) takes (\d+) damage', r'\1 HP -\2'),
                (r'(.+) gains (\d+) temp HP', r'\1 임시HP +\2'),
                (r'(.+) heals (\d+) HP', r'\1 HP +\2'),
                (r'(.+) gains (\d+) max HP', r'\1 최대HP +\2'),
            ]
            for pattern, replacement in patterns:
                modified_text = re.sub(pattern, replacement, original_text)
                if modified_text != original_text:
                    card_data.append(modified_text)
                    break

    # 죽음 내성 3회 성공/실패 안내
    div_span = soup.find('div', class_='message-content')
    if div_span and '3회의 죽음 내성 굴림에' in div_span.get_text():
        card_data.append('시스템')
        message_content = soup.find('div', class_='message-content')
        if message_content:
            card_data.append(message_content.get_text(strip=True))

    # CGMP 묘사 (name-box)
    name_box = soup.find('span', class_='name-box')
    if name_box:
        turn_content = name_box.get_text(strip=True)
        card_data.append('#CGMP_DESCRIPTION')
        if turn_content:
            card_data.append(turn_content)

    # 라운드 안내
    round_class = soup.find('h3', class_='round-message')
    if round_class:
        card_data.append('#CGMP_DESCRIPTION')
        message_content = round_class.get_text(strip=True)
        if message_content:
            card_data.append(message_content)

    # 귓속말
    whisper_li = soup.find('li', class_=lambda c: c and 'whisper' in c)
    if whisper_li:
        sender = whisper_li.find('h4', class_='message-sender')
        sender_text = sender.get_text(strip=True) if sender else 'Unknown'
        recipient = whisper_li.find('span', class_='whisper-to')
        if recipient:
            text = recipient.get_text(strip=True).replace('To: ', '')
            recipient_text = text.split(',')[0].strip()
        else:
            recipient_text = '???'
        whisper_person = f'{sender_text} > {recipient_text}'
        message_content = whisper_li.find('div', class_='message-content')
        if message_content:
            for roll in message_content.find_all('a', class_='inline-roll inline-result'):
                roll.replace_with(NavigableString(f'[[{roll.get_text(strip=True)}]]'))
        whisper_text = message_content.get_text(strip=True) if message_content else ''
        card_data.append(whisper_person)
        card_data.append(whisper_text)
        card_data[0] = 'Whisper Card'
        return card_data

    # 일반 채팅
    title_span = soup.find('h4', class_='message-sender')
    title_text = title_span.get_text(strip=True) if title_span else ''
    message_div = soup.find('div', class_='message-content')
    if message_div:
        for roll in message_div.find_all('a', class_='inline-roll inline-result'):
            roll.replace_with(NavigableString(f'[[{roll.get_text(strip=True)}]]'))

        # 턴 알림
        turn_div = soup.find('div', class_='turn-announcer flexrow')
        if turn_div:
            h2_tag = turn_div.find('h2', class_='actor')
            turn_text = h2_tag.get_text(strip=True) if h2_tag else ''
            card_data.append(title_text)
            card_data.append(turn_text)
            return card_data

        # 이미지 메시지 — 이미지에 딸린 설명 텍스트(장면 묘사, 등장 캐릭터 등)를
        # 버리지 않고 함께 보존한다. "새 창에서 이미지 열기" 같은 중복 링크
        # 문단(created-gallery-image-open)은 제외. 이미지를 위에, 캡션을
        # 아래에 두는 카드 형태로 감싼다(scene-card, CSS는 publish.py).
        # 특성/아이템 카드의 작은 뱃지 아이콘(class에 icon 포함, 또는
        # <header> 안에 있는 이미지)은 장면 이미지가 아니므로 제외한다.
        def _is_badge_icon(img):
            classes = ' '.join(img.get('class') or [])
            if 'icon' in classes.lower():
                return True
            return img.find_parent('header') is not None

        imgs = [img.get('src') for img in message_div.find_all('img')
                if img.get('src') and not _is_badge_icon(img)]
        if imgs:
            paragraphs = []
            for p in message_div.find_all('p'):
                classes = p.get('class') or []
                if 'created-gallery-image-open' in classes:
                    continue
                text = p.get_text(strip=True)
                if text:
                    paragraphs.append(text)
            img_part = ''.join(f'<img class="scene-img" src="{src}">' for src in imgs)
            caption = (f'<div class="scene-caption">{"<br>".join(paragraphs)}</div>'
                       if paragraphs else '')
            combined = f'<div class="scene-card">{img_part}{caption}</div>'
            card_data.append(title_text)
            card_data.append(combined)
            return card_data

    message_text = message_div.get_text(strip=True, separator=' ') if message_div else ''
    if title_text and message_text:
        card_data.append(title_text)
        card_data.append(message_text)
    else:
        card_data.append('ERROR SPEAKER')
        card_data.append('ERROR MESSAGE')
    return card_data


def chatcard_reformat(card_data, previous_card, portraits, speaker_map=None, gm_names=None):
    card_html = ERROR_CARD
    samespeaker = (previous_card[0] == card_data[0]
                   and len(previous_card) > 1 and previous_card[1] == card_data[1])

    card_data[2] = re.sub(
        r'\[\[(.*?)\]\]',
        lambda m: f'{INLINE_SPAN_START}{m.group(1)}</span>',
        card_data[2])

    gm_names = gm_names or {'DM'}

    if card_data[0] == 'Chat Card':
        if card_data[1] in gm_names:
            card_html = DM_OPEN
            if not samespeaker:
                card_html += f'{HEADER_GENERAL}{_mapname(card_data[1], speaker_map)}:</span>\n                '
            card_html += f'{card_data[2]}</div>'
        elif card_data[1] == '시스템':
            if ':' in card_data[2]:
                temp1 = card_data[2].split(':')[0].strip()
                temp2 = card_data[2].split(':')[1].strip()
                card_html = SYSTEM_OPEN
                if not samespeaker:
                    card_html += f'{HEADER_SYSTEM}{temp1}:</span>\n                    '
                card_html += f'{temp2}</div>'
            else:
                card_html = SYSTEM_OPEN_NONAME
                if not samespeaker:
                    card_html += ('\n                    '
                                  + _SPACER.format(color='#e1e1e1')
                                  + '\n                    ' + _AVATAR_OPEN
                                  + '\n                        &nbsp;</div>\n                    ')
                card_html += f'{card_data[2]}</div>'
        elif card_data[1] == '#CGMP_DESCRIPTION':
            card_html = DESC_CARD.format(text=card_data[2])
        else:
            card_html = GENERAL_OPEN
            if not samespeaker:
                card_html += f'{HEADER_GENERAL}{_mapname(card_data[1], speaker_map)}:</span>\n                '
            card_html += f'{card_data[2]}</div>'
    elif card_data[0] == 'Whisper Card':
        card_html = WHISPER_OPEN
        if not samespeaker:
            card_html += f'{HEADER_WHISPER}{_mapname(card_data[1], speaker_map)}:</span>\n            '
        card_html += f'{card_data[2]}</div>'

    card_html = insertportrait(card_data[1], card_html, portraits)
    return _apply_map(card_html, speaker_map)


# ---------------------------------------------------------------- roll cards

REMOVE_WORDS = {
    '(Intelligence)', '(건강)', '(Dexterity)', 'Check', '(민첩)', '기술', '(Strength)',
    'Ability', '(매력)', '(지혜)', 'Skill', '(Wisdom)', '판정', '(Charisma)', '(지능)',
    '(Constitution)', '(근력)', '굴림',
}


def regrollcard(card_item):
    card_data = ['Regular Roll Card']
    soup = BeautifulSoup(card_item, 'html.parser')
    sender = soup.find('h4', class_='message-sender')
    speaker = sender.get_text(strip=True) if sender else ''
    title = soup.find('span', class_='flavor-text')
    if title:
        title = title.get_text(strip=True)
        title = ' '.join(w for w in title.split() if w not in REMOVE_WORDS)
    else:
        formula = soup.find('div', class_='dice-formula')
        title = formula.get_text(strip=True) if formula else ''
    total = soup.find('h4', class_='dice-total')
    roll = total.get_text(strip=True) if total else ''
    if title and isinstance(title, str):
        title = title.replace('캐릭터가 우선권을 굴립니다!', '우선권')
        title = title.replace('rolls for Initiative!', '우선권')
    card_data.append(speaker)
    card_data.append(title)
    card_data.append(None)
    card_data.append([roll, 'success'])
    if title and '죽음 내성' in title:
        try:
            if int(roll) < 10:
                card_data[4][1] = 'fail'
        except ValueError:
            pass
    return card_data


def midirollcard(card_item):
    card_data = ['Midi Roll Card']
    soup = BeautifulSoup(card_item, 'html.parser')

    speaker_data = soup.find('h4', class_='message-sender')
    card_data.append(speaker_data.get_text(strip=True) if speaker_data else '')

    title_data = soup.find('span', class_='title')
    title = title_data.get_text(strip=True) if title_data else ''
    attack_roll_div = soup.find('div', class_='midi-qol-attack-roll')
    rollbonus = ''
    if attack_roll_div:
        center_text = attack_roll_div.find(
            'div', style=lambda s: s and 'text-align:center' in s)
        if center_text:
            rollbonus = center_text.get_text(strip=True)
    if rollbonus:
        title = title + ' (' + rollbonus + ')'
    card_data.append(title)

    description_data = soup.find('div', class_='wrapper')
    if description_data:
        description = ''.join(
            str(c) for c in description_data.contents if isinstance(c, NavigableString))
    else:
        description = ''
    card_data.append(description.strip('\n'))

    success_pattern = r'<h4 class="dice-total success">(.*?)</h4>'
    fail_pattern = r'<h4 class="dice-total failure">(.*?)</h4>'
    crit_pattern = r'<h4 class="dice-total critical success">(.*?)</h4>'
    fumble_pattern = r'<h4 class="dice-total fumble failure">(.*?)</h4>'
    extracted = None
    if attack_roll_div is None:
        attack_roll_div = soup.find('div', class_='midi-qol-attack-roll')
    if attack_roll_div:
        for p, state in ((success_pattern, 'success'), (fail_pattern, 'fail'),
                         (crit_pattern, 'crit'), (fumble_pattern, 'fumble')):
            match = re.search(p, str(attack_roll_div))
            if match:
                extracted = [match.group(1), state]
                break
    if extracted is not None and extracted[0].isdigit():
        card_data.append(extracted)
    else:
        card_data.append(None)

    damage_roll_div = soup.find('div', class_='midi-qol-damage-roll')
    if damage_roll_div:
        totals = [t.get_text(strip=True)
                  for t in damage_roll_div.find_all('h4', class_='dice-total')]
        damage = ' + '.join(totals)
        card_data.append(damage if damage != '' else None)
    else:
        card_data.append(None)

    hits_display = soup.find('div', class_='midi-qol-hits-display')
    targets = []
    if hits_display:
        names = hits_display.find_all('div', class_='name-stacked')
        acs = hits_display.find_all('div', class_='midi-qol-ac')
        for name_div, ac_div in zip(names, acs):
            targets.append((name_div.get_text(strip=True), ac_div.get_text(strip=True)))
        card_data.append(targets if targets else None)
    else:
        card_data.append(None)

    saves_display = soup.find('div', class_='midi-qol-saves-display')
    if saves_display:
        save_results = []
        save_dc_target = saves_display.find('label', class_='midi-qol-saveDC')
        save_dc = save_dc_target.get_text(strip=True) if save_dc_target else ''
        if save_dc:
            save_results.append(save_dc)
        save_targets = saves_display.find_all(
            'div', class_=lambda c: c and 'midi-qol' in c and 'target' in c)
        for target in save_targets:
            name_tag = target.find('div', class_='midi-qol-gmTokenName')
            name = name_tag.get_text(strip=True) if name_tag else ''
            roll_tag = target.find('h4', class_='dice-total')
            roll = roll_tag.get_text(strip=True) if roll_tag else ''
            save_results.append((name, roll))
        card_data.append(save_results if save_results else None)
    else:
        card_data.append(None)

    return card_data


def rollcard_reformat(card_data, previous_card, portraits, speaker_map=None, gm_names=None):
    description_html = ''
    roll_html = ''
    damage_html = ''
    ac_html = ''
    save_html = ''
    card_html = ERROR_CARD

    samespeaker = (previous_card[0] == card_data[0]
                   and len(previous_card) > 1 and previous_card[1] == card_data[1])

    card_data = card_data + [None] * (8 - len(card_data))
    speaker = card_data[1]
    title = card_data[2]
    description = card_data[3]
    roll = card_data[4]
    damage = card_data[5]
    ac = card_data[6]
    savedc = card_data[7]

    if description:
        description_html = SHEET_DESC.format(text=description)

    if roll:
        color = ''
        if card_data[4][1] in ('fail', 'fumble'):
            color = 'color: #830101;'
        elif card_data[4][1] == 'crit':
            color = 'color: #3fb315;'
        roll_html = SHEET_RESULT.format(color=color, roll=card_data[4][0])

    if damage:
        damage_text = SHEET_DMG_SPAN.format(damage=damage)
        damage_html = SHEET_DMG_OPEN.format(damage_text=damage_text)

    if ac:
        ac_html = '&nbsp;'.join(
            TAG_DARK.format(text=f'{target} AC: {a}') for target, a in card_data[6])

    if savedc:
        temphtml1 = TAG_DARK_HL.format(text=savedc[0])
        temphtml2 = ''.join(
            TAG_LIGHT.format(text=f'{target}: 내성 굴림 {value}')
            for target, value in savedc[1:])
        save_html = temphtml1 + temphtml2

    card_html = GENERAL_OPEN
    if not samespeaker:
        card_html += f'{ROLL_HEADER}​{_mapname(speaker, speaker_map)}</span>\n        '
    card_html += (f'{ROLLTEMPLATE_OPEN}{title}</span>\n                {ac_html}'
                  f'\n                {save_html}{ROLLTEMPLATE_BODY}{roll_html}'
                  f'\n                {damage_html}\n                {description_html}'
                  f'{ROLLTEMPLATE_CLOSE}')
    card_html += '</div>'

    card_html = insertportrait(speaker, card_html, portraits)
    return _apply_map(card_html, speaker_map)


# ---------------------------------------------------------------- helpers


def insertportrait(speaker, card_html, portraits):
    """portraits: {화자이름: 이미지경로 또는 'noimg'}"""
    portrait = portraits.get(speaker, 'noimg') if portraits else 'noimg'
    if portrait == 'noimg':
        return card_html.replace(PORTRAIT_IMG, '&nbsp;')
    return card_html.replace('REPLACEIMG', portrait)


def _mapname(name, speaker_map):
    if speaker_map and name in speaker_map:
        return speaker_map[name]
    return name


def _apply_map(html, speaker_map):
    if speaker_map:
        for src, dst in speaker_map.items():
            html = html.replace(src, dst)
    return html


# ---------------------------------------------------------------- driver


def convert(log_html, portraits=None, speaker_map=None, gm_names=None, keep_whispers=True):
    """FVTT 채팅 로그 HTML -> heartbackup 양식 fragment.

    portraits: {화자: 이미지경로}, speaker_map: {유저명: PC명},
    gm_names: GM으로 취급할 화자 이름 집합.
    """
    portraits = portraits or {}
    content = parse_file(log_html)
    temp = []
    previous_card = ['No item']
    stats = {'total': len(content), 'removed': 0, 'errors': 0}

    for card_item in content:
        item_type = card_type(card_item)
        card_data = None
        if item_type in ('Damage Application Card', 'Duplicate Saving Throw Card', 'Target Card'):
            stats['removed'] += 1
            continue
        try:
            if item_type == 'Chat Card':
                card_data = chatcard(card_item)
                if not keep_whispers and card_data[0] == 'Whisper Card':
                    stats['removed'] += 1
                    continue
                card_item = chatcard_reformat(card_data, previous_card, portraits,
                                              speaker_map, gm_names)
            elif item_type == 'Regular Roll Card':
                card_data = regrollcard(card_item)
                card_item = rollcard_reformat(card_data, previous_card, portraits,
                                              speaker_map, gm_names)
            elif item_type == 'Midi Roll Card':
                card_data = midirollcard(card_item)
                card_item = rollcard_reformat(card_data, previous_card, portraits,
                                              speaker_map, gm_names)
        except Exception:
            stats['errors'] += 1
            card_item = ERROR_CARD
        if card_data is not None:
            previous_card = card_data
        temp.append(card_item)

    return ''.join(temp), stats
