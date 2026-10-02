# -*- coding: utf-8 -*-
"""created-gallery '맵포함' 자체완결 HTML -> logs/ 페이지 (새 로그 방식: 장면 맵 표기 + 전투 요약/리플레이).

data URI 이미지/폰트를 logs/assets/<hash>.<ext> 파일로 빼고(250KB 초과 webp는 1400px/q80 재압축),
사이트 상단바를 입힌 뒤 logs.json/index.html을 갱신한다.

사용:
    python from_export.py '<JSON 배열>'
    JSON 배열 항목: {"src": 내보낸.html 경로, "slug": ..., "title": ..., "date": ..., "season": ..., "arc": ...}
"""
import base64
import hashlib
import io
import json
import os
import re
import sys

from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOGS = os.path.join(REPO, 'logs')
ASSETS = os.path.join(LOGS, 'assets')
sys.path.insert(0, os.path.join(REPO, 'tools', 'rplog'))
import publish  # noqa: E402  (render_index/load_db/save_db 재사용)

RECOMPRESS_OVER = 250_000
MAX_PX = 1400
QUALITY = 80
EXT = {'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif',
       'image/avif': '.avif', 'image/svg+xml': '.svg', 'font/woff': '.woff', 'font/woff2': '.woff2'}
REMOTE_IMG = re.compile(r'''(?:src=["']|url\(["']?|"(?:img|image|portrait)":")(https?://(?!fonts\.googleapis|cdn\.jsdelivr|fonts\.gstatic)[^"')\s>]+)''')
DATA_URI = re.compile(r'data:((?:image/[a-z+]+)|(?:font/[a-z0-9]+));base64,([A-Za-z0-9+/=]+)')

TOPBAR_CSS = """
  .log-topbar { background: #0f0d0b; padding: 10px 20px; display: flex; align-items: baseline; gap: 16px; position: relative; z-index: 10; }
  .log-topbar a { color: #c9a84c; text-decoration: none; font-family: 'Cinzel', serif; font-size: 14px; }
  .log-topbar .t { color: #f8f3e8; font-size: 14px; }
  body.scene-panel-on #scene-panel { top: 41px; }
"""


def make_asset_writer():
    cache = {}
    stats = {'files': 0, 'new': 0, 'bytes_new': 0, 'recompressed': 0}

    def convert(match):
        typ, b64 = match.group(1), match.group(2)
        key = hashlib.sha1(b64.encode()).hexdigest()
        if key in cache:
            return cache[key]
        data = base64.b64decode(b64)
        ext = EXT.get(typ, '.bin')
        if typ == 'image/webp' and len(data) > RECOMPRESS_OVER:
            try:
                im = Image.open(io.BytesIO(data))
                im.load()
                if max(im.size) > MAX_PX:
                    im.thumbnail((MAX_PX, MAX_PX))
                out = io.BytesIO()
                im.save(out, 'WEBP', quality=QUALITY, method=4)
                if len(out.getvalue()) < len(data):
                    data = out.getvalue()
                    stats['recompressed'] += 1
            except Exception:
                pass
        name = hashlib.sha1(data).hexdigest()[:12] + ext
        path = os.path.join(ASSETS, name)
        stats['files'] += 1
        if not os.path.exists(path):
            with open(path, 'wb') as f:
                f.write(data)
            stats['new'] += 1
            stats['bytes_new'] += len(data)
        cache[key] = 'assets/' + name
        return cache[key]

    return convert, stats


def convert_page(src, slug, title, date, season, arc):
    with io.open(src, encoding='utf-8') as f:
        html = f.read()
    convert, stats = make_asset_writer()
    html = DATA_URI.sub(convert, html)

    # 내보내기 때 못 받아온 외부 이미지(사설 이미지 서버 등)는 사이트에서 깨지므로 받아서 로컬화
    remote = {}
    for url in set(REMOTE_IMG.findall(html)):
        data = publish._fetch_url(url)
        if not data:
            print('WARN: 못 받은 외부 이미지:', url)
            continue
        ext = os.path.splitext(url.split('?')[0])[1] or '.webp'
        remote[url] = publish.store_asset(data, ext, 1600)
    for url, local in remote.items():
        html = html.replace(url, local)
    stats['remote_localized'] = len(remote)

    # <title>, 폰트(Cinzel 추가), 상단바 CSS
    html = re.sub(r'<title>.*?</title>', f'<title>{title} - 화살성채 RP 로그</title>', html, count=1, flags=re.S)
    html = html.replace('family=Fraunces:wght@700&display=swap',
                        'family=Fraunces:wght@700&family=Cinzel:wght@400;600&display=swap', 1)
    html = html.replace('</style>', TOPBAR_CSS + '</style>', 1)

    # 제목/날짜 헤더 + 사이트 상단바
    meta = ' · '.join(b for b in (date, season) if b)
    html, n = re.subn(r'<header class="log-head">.*?</header>',
                      f'<header class="log-head"><h1>{title}</h1><p>{meta}</p></header>',
                      html, count=1, flags=re.S)
    assert n == 1, 'log-head not found'
    topbar = (f'<nav class="log-topbar"><a href="../index.html">화살성채</a>'
              f'<a href="index.html">RP 로그</a><span class="t">{title}</span></nav>\n')
    html = html.replace('<body>\n', '<body>\n' + topbar, 1)
    assert 'log-topbar"' in html

    # 장면 마커 이미지는 지연 로딩 (수백 장)
    html = html.replace('<img class="log-scene-img"', '<img class="log-scene-img" loading="lazy" decoding="async"')

    assert 'data:image' not in html and 'data:font' not in html, 'data URI left'
    out = os.path.join(LOGS, slug + '.html')
    with io.open(out, 'w', encoding='utf-8') as f:
        f.write(html)

    cards = html.count('<div class="message ')
    db = publish.load_db()
    db['sessions'] = [s for s in db['sessions'] if s['slug'] != slug]
    db['sessions'].append({'slug': slug, 'title': title, 'date': date,
                           'season': season, 'arc': arc, 'cards': cards})
    publish.save_db(db)
    publish.render_index(db)
    return out, len(html), cards, stats


if __name__ == '__main__':
    jobs = json.loads(sys.argv[1])
    for j in jobs:
        out, size, cards, st = convert_page(j['src'], j['slug'], j['title'], j['date'], j['season'], j['arc'])
        print(f"{j['slug']}: html {size/1e6:.1f}MB, cards {cards}, assets {st}")
