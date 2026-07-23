# -*- coding: utf-8 -*-
"""FVTT 로그 zip -> heartbackup 양식 페이지 생성 + logs/ 색인 갱신.

사용:
    python publish.py <로그.zip> [--slug NAME] [--season 시즌명] [--no-whispers]
                      [--title 제목] [--date YYYY-MM-DD] [--dry-run]

zip 구조 (heart-log-export 모듈이 생성):
    log.html        렌더링된 채팅 카드(<li>) 목록
    messages.json   원본 ChatMessage 데이터(재가공용, 게시에는 미사용)
    manifest.json   {title, date, world, system, speakers:[{name, portrait}], images:{}}
    images/         초상화·본문 삽입 이미지

결과:
    logs/<slug>.html            세션 로그 페이지
    logs/assets/<hash>.<ext>    해시 중복제거된 이미지
    logs/logs.json              세션 메타 목록(색인 데이터)
    logs/index.html             로그 목록 페이지(재생성)
"""

import argparse
import hashlib
import html as html_mod
import io
import json
import os
import re
import shutil
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import heartformat

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOGS_DIR = os.path.join(REPO, 'logs')
ASSETS_DIR = os.path.join(LOGS_DIR, 'assets')
DB_PATH = os.path.join(LOGS_DIR, 'logs.json')
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def load_config():
    with io.open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def slugify(text):
    text = re.sub(r'[^\w가-힣-]+', '-', text.strip()).strip('-')
    return text or 'log'


KEEP_AS_IS = {'.gif', '.svg', '.webp'}  # 애니메이션/벡터는 원본 유지, webp는 이미 목표 포맷


def process_image(data, ext, max_px):
    """리사이즈 + webp 변환. (data, ext) 반환."""
    ext = ext.lower()
    if not HAS_PIL or ext in KEEP_AS_IS:
        if ext == '.webp' and HAS_PIL:
            # webp는 포맷 변환 없이 리사이즈만
            try:
                img = Image.open(io.BytesIO(data))
                if max(img.size) > max_px:
                    img.thumbnail((max_px, max_px))
                    out = io.BytesIO()
                    img.save(out, 'WEBP', quality=90)
                    return out.getvalue(), '.webp'
            except Exception:
                pass
        return data, ext
    try:
        img = Image.open(io.BytesIO(data))
        if img.mode == 'P':
            img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
        if max(img.size) > max_px:
            img.thumbnail((max_px, max_px))
        out = io.BytesIO()
        img.save(out, 'WEBP', quality=90)
        return out.getvalue(), '.webp'
    except Exception:
        return data, ext


def store_asset(data, ext, max_px):
    """이미지 바이트를 logs/assets/<hash>.<ext>로 저장하고 상대경로 반환."""
    os.makedirs(ASSETS_DIR, exist_ok=True)
    data, ext = process_image(data, ext, max_px)
    digest = hashlib.sha1(data).hexdigest()[:12]
    fname = digest + ext.lower()
    path = os.path.join(ASSETS_DIR, fname)
    if not os.path.exists(path):
        with open(path, 'wb') as f:
            f.write(data)
    return 'assets/' + fname


def ingest_images(zf, names, max_px):
    """zip 내 images/* -> logs/assets/, {zip경로: assets 상대경로} 반환."""
    mapping = {}
    for name in names:
        if not name.startswith('images/') or name.endswith('/'):
            continue
        data = zf.read(name)
        if not data:
            continue
        ext = os.path.splitext(name)[1] or '.bin'
        mapping[name] = store_asset(data, ext, max_px)
    return mapping


def _fetch_url(url, timeout=8):
    import urllib.request
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                      ' (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': url,
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception:
        return None


def ingest_local_images(log_html, max_px, data_dirs):
    """맨 .html 입력용: img src를 로컬 Foundry Data 폴더 또는 http(s) URL에서 가져와 assets로 복사.

    사설 IP(로컬 이미지 생성 서버 등)나 외부 URL을 그대로 두면 GitHub Pages
    등 외부에서 볼 때 이미지가 깨지므로(액박), 항상 다운로드해 로컬 asset으로 박아넣는다.
    """
    from urllib.parse import unquote
    mapping = {}
    missing = []
    for src in heartformat.harvest_image_srcs(log_html):
        if src.startswith('data:'):
            continue
        if src.startswith(('http://', 'https://')):
            data = _fetch_url(src)
            if not data:
                missing.append(src)
                continue
            ext = os.path.splitext(src.split('?')[0])[1] or '.webp'
            mapping[src] = store_asset(data, ext, max_px)
            continue
        rel = unquote(src.split('?')[0]).lstrip('/')
        found = None
        if os.path.isabs(unquote(src.split('?')[0])) and os.path.isfile(unquote(src.split('?')[0])):
            found = unquote(src.split('?')[0])
        for base in (data_dirs if not found else []):
            cand = os.path.join(base, rel.replace('/', os.sep))
            if os.path.isfile(cand):
                found = cand
                break
        if not found:
            missing.append(src)
            continue
        with open(found, 'rb') as f:
            data = f.read()
        ext = os.path.splitext(found)[1] or '.bin'
        mapping[src] = store_asset(data, ext, max_px)
    return mapping, missing


PAGE_TEMPLATE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%%TITLE%% - 화살성채 RP 로그</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Cinzel:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #efece4; font-family: 'Pretendard', sans-serif; }
  .log-topbar { background: #0f0d0b; padding: 10px 20px; display: flex; align-items: baseline; gap: 16px; }
  .log-topbar a { color: #c9a84c; text-decoration: none; font-family: 'Cinzel', serif; font-size: 14px; }
  .log-topbar .t { color: #f8f3e8; font-size: 14px; }
  .log-head { max-width: 820px; margin: 28px auto 0; padding: 0 16px; }
  .log-head h1 { font-size: 24px; color: #2a2015; margin: 0 0 4px; }
  .log-head p { margin: 0; color: #6a5c47; font-size: 13px; }
  .log-body { max-width: 820px; margin: 18px auto 60px; padding: 18px 14px 30px;
               background: #ffffff; border-radius: 6px; box-shadow: 0 1px 6px rgba(0,0,0,.08);
               overflow-wrap: break-word; }
  .log-body img { max-width: 100%; height: auto; }
  .log-body .message-content img { max-width: min(100%, 260px); }
  .log-body .scene-card { margin: 6px 0 2px; max-width: 340px; border-radius: 10px;
                           overflow: hidden; background: #f7f5ef; border: 1px solid #e6e0d2;
                           box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .log-body .scene-card .scene-img { display: block; width: 100%; max-width: 100%;
                                      margin: 0; border-radius: 0; }
  .log-body .scene-caption { padding: 10px 14px 12px; font-size: 13.5px; line-height: 1.65;
                              color: #4a4438; }
  @font-face { font-family: 'Pretendard-Regular'; src: local('Pretendard Regular'), local('Pretendard'); }
  .log-body * { font-family: 'Pretendard', 'Pretendard-Regular', sans-serif !important; }
  .log-body .sheet-result span, .log-body .sheet-result * { font-family: 'Fraunces', serif !important; }
  #img-zoom { position: fixed; top: 64px; left: 12px; width: min(240px, calc(50vw - 430px));
              z-index: 99; display: none; pointer-events: none; text-align: center; }
  #img-zoom img { max-width: 100%; max-height: 320px; border-radius: 8px;
                  box-shadow: 0 4px 24px rgba(0,0,0,.35); background: #fff; }
  @media (max-width: 1150px) { #img-zoom { display: none !important; } }
</style>
</head>
<body>
<nav class="log-topbar"><a href="../index.html">화살성채</a><a href="index.html">RP 로그</a><span class="t">%%TITLE%%</span></nav>
<header class="log-head"><h1>%%TITLE%%</h1><p>%%META%%</p></header>
<main class="log-body">
%%CONTENT%%
</main>
<div id="img-zoom" aria-hidden="true"></div>
<script>
(function () {
  var zoom = document.getElementById('img-zoom');
  var body = document.querySelector('.log-body');
  body.addEventListener('mouseover', function (e) {
    if (e.target.tagName !== 'IMG') return;
    if (window.innerWidth < 1150) return;
    var src = e.target.getAttribute('src');
    if (!src) return;
    zoom.innerHTML = '<img src="' + src + '" alt="">';
    zoom.style.display = 'block';
  });
  body.addEventListener('mouseout', function (e) {
    if (e.target.tagName !== 'IMG') return;
    zoom.style.display = 'none';
    zoom.innerHTML = '';
  });
})();
</script>
</body>
</html>
"""

INDEX_TEMPLATE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RP 로그 - 화살성채</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css">
<style>
  .loglist-wrap {{ max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }}
  .loglist-wrap > .eyebrow {{ text-align: center; }}
  .loglist-wrap > h1 {{ font-family: 'Cinzel', serif; text-align: center; color: var(--astro-paper);
                        letter-spacing: 2px; margin-bottom: 40px; }}
  .log-season {{ font-family: 'Cinzel', serif; color: var(--gold-light); font-size: 15px;
                 letter-spacing: 2px; margin: 36px 0 12px; border-bottom: 1px solid var(--gold-dim);
                 padding-bottom: 6px; }}
  .log-arc {{ font-family: 'Cinzel', serif; color: var(--muted); font-size: 12.5px;
              letter-spacing: 1px; margin: 20px 0 8px 4px; }}
  .log-item {{ display: flex; align-items: baseline; gap: 14px; padding: 12px 14px; margin: 6px 0;
               background: rgba(248,243,232,.05); border: 1px solid rgba(201,168,76,.18);
               border-radius: 4px; text-decoration: none; }}
  .log-item:hover {{ background: rgba(248,243,232,.1); }}
  .log-item .d {{ color: #8d7735; font-size: 12px; font-family: 'Cinzel', serif; min-width: 92px; }}
  .log-item .n {{ color: var(--cream); font-size: 15px; }}
  .log-item .s {{ color: var(--muted); font-size: 12px; margin-left: auto; }}
</style>
</head>
<body>
<nav class="site-nav" aria-label="주요 문서">
  <a class="brand" href="../index.html">화살성채</a>
  <div class="nav-links">
    <a href="../player-guide.html">플레이어 가이드</a>
    <a href="../crossroads-guide.html">크로스로드</a>
    <a href="../world.html">세계관 자료</a>
    <a href="../setting.html">설정 정리</a>
    <a href="../homebrew.html">홈브류</a>
    <a href="index.html">RP 로그</a>
  </div>
</nav>
<div class="loglist-wrap">
  <p class="eyebrow">ARROWKEEP CAMPAIGN ARCHIVE</p>
  <h1>RP 로그</h1>
{sections}
</div>
</body>
</html>
"""


def load_db():
    if os.path.exists(DB_PATH):
        with io.open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'sessions': []}


def save_db(db):
    with io.open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


def render_index(db):
    seasons = {}
    order = []
    for s in db['sessions']:
        season = s.get('season') or '기타'
        if season not in seasons:
            seasons[season] = []
            order.append(season)
        seasons[season].append(s)
    parts = []
    for season in order:
        items = sorted(seasons[season], key=lambda x: (x.get('date') or '', x['slug']))
        arcs = {}
        arc_order = []
        for s in items:
            arc = s.get('arc') or ''
            if arc not in arcs:
                arcs[arc] = []
                arc_order.append(arc)
            arcs[arc].append(s)
        rows = []
        for arc in arc_order:
            if arc:
                rows.append(f'  <div class="log-arc">{html_mod.escape(arc)}</div>')
            for s in arcs[arc]:
                esc = html_mod.escape
                count = f"메시지 {s['cards']}" if s.get('cards') else ''
                rows.append(
                    f'  <a class="log-item" href="{esc(s["slug"])}.html">'
                    f'<span class="d">{esc(s.get("date") or "")}</span>'
                    f'<span class="n">{esc(s["title"])}</span>'
                    f'<span class="s">{count}</span></a>')
        parts.append(f'  <div class="log-season">{html_mod.escape(season)}</div>\n'
                     + '\n'.join(rows))
    index_html = INDEX_TEMPLATE.format(sections='\n'.join(parts))
    with io.open(os.path.join(LOGS_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)


def publish(zip_path, slug=None, season=None, arc=None, title=None, date=None,
            keep_whispers=None, dry_run=False):
    cfg = load_config()
    if keep_whispers is None:
        keep_whispers = cfg.get('keep_whispers', True)

    manifest = {}
    missing = []
    os.makedirs(LOGS_DIR, exist_ok=True)

    if zip_path.lower().endswith('.zip'):
        zf = zipfile.ZipFile(zip_path)
        names = zf.namelist()
        if 'manifest.json' in names:
            manifest = json.loads(zf.read('manifest.json').decode('utf-8'))
        log_name = 'log.html' if 'log.html' in names else next(
            (n for n in names if n.endswith('.html')), None)
        if not log_name:
            raise SystemExit('ERROR: zip 안에 log.html이 없습니다.')
        log_html = zf.read(log_name).decode('utf-8')
        mapping = ingest_images(zf, names, cfg.get('max_image_px', 1600))
    else:
        # df-chat-enhance가 저장한 맨 .html — 이미지를 로컬 Foundry Data에서 해석
        with io.open(zip_path, 'r', encoding='utf-8') as f:
            log_html = f.read()
        data_dirs = cfg.get('foundry_data_dirs') or [
            os.path.expandvars(r'%LOCALAPPDATA%\FoundryVTT\Data')]
        mapping, missing = ingest_local_images(
            log_html, cfg.get('max_image_px', 1600), data_dirs)

    title = title or manifest.get('title') or os.path.splitext(os.path.basename(zip_path))[0]
    date = date or manifest.get('date') or ''
    slug = slug or slugify(f"{date}-{title}" if date else title)

    # 초상화: 로그 안의 아바타(df-chat-enhance 형식)에서 수확, manifest가 있으면 덮어씀
    portraits = heartformat.harvest_portraits(log_html)
    for sp in manifest.get('speakers', []):
        if sp.get('portrait'):
            portraits[sp['name']] = sp['portrait']
        else:
            portraits.setdefault(sp['name'], 'noimg')
    portraits = {name: (mapping.get(p, p) if p != 'noimg' else p)
                 for name, p in portraits.items()}

    # GM 화자 전용 아이콘 (config gm_portrait: 로컬 파일 경로)
    gm_icon_path = cfg.get('gm_portrait')
    if gm_icon_path and os.path.isfile(gm_icon_path):
        with open(gm_icon_path, 'rb') as f:
            icon_asset = store_asset(f.read(), os.path.splitext(gm_icon_path)[1],
                                     cfg.get('max_image_px', 1600))
        for gm in cfg.get('gm_names', []):
            portraits[gm] = icon_asset

    fragment, stats = heartformat.convert(
        log_html,
        portraits=portraits,
        speaker_map=cfg.get('speaker_map') or None,
        gm_names=set(cfg.get('gm_names', ['DM'])),
        keep_whispers=keep_whispers,
    )

    # 본문 삽입 이미지 경로 재작성
    for orig, new in mapping.items():
        fragment = fragment.replace(f'src="{orig}"', f'src="{new}"')

    meta_bits = [b for b in (date, manifest.get('world'), season) if b]
    page = (PAGE_TEMPLATE
            .replace('%%TITLE%%', html_mod.escape(title))
            .replace('%%META%%', ' · '.join(meta_bits))
            .replace('%%CONTENT%%', fragment))

    out_path = os.path.join(LOGS_DIR, slug + '.html')
    if dry_run:
        out_path = os.path.join(LOGS_DIR, '_preview_' + slug + '.html')

    with io.open(out_path, 'w', encoding='utf-8') as f:
        f.write(page)

    if not dry_run:
        db = load_db()
        db['sessions'] = [s for s in db['sessions'] if s['slug'] != slug]
        db['sessions'].append({
            'slug': slug, 'title': title, 'date': date,
            'season': season or manifest.get('season') or '',
            'arc': arc or '',
            'cards': stats['total'] - stats['removed'],
        })
        save_db(db)
        render_index(db)

    print(f"OK: {out_path}")
    print(f"   카드 {stats['total']}개, 제거 {stats['removed']}, 오류 {stats['errors']},"
          f" 이미지 {len(mapping)}개 (Pillow {'사용' if HAS_PIL else '미설치·원본유지'})")
    if missing:
        print(f"   경고: 로컬에서 못 찾은 이미지 {len(missing)}개: {missing[:5]}")
    return out_path


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('zip')
    ap.add_argument('--slug')
    ap.add_argument('--season')
    ap.add_argument('--arc')
    ap.add_argument('--title')
    ap.add_argument('--date')
    ap.add_argument('--no-whispers', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    publish(a.zip, slug=a.slug, season=a.season, arc=a.arc, title=a.title, date=a.date,
            keep_whispers=(False if a.no_whispers else None), dry_run=a.dry_run)
