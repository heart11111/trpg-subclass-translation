const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'source', 'subclass-translation.md');
const backgroundSourcePath = path.join(root, 'source', 'backgrounds.md');
const raceSourcePath = path.join(root, 'source', 'races.md');
const outDir = path.join(root, 'subclasses');
const raceOutDir = path.join(root, 'races');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const backgroundSource = fs.existsSync(backgroundSourcePath)
  ? fs.readFileSync(backgroundSourcePath, 'utf8').replace(/\r\n/g, '\n')
  : '';
const raceSource = fs.existsSync(raceSourcePath)
  ? fs.readFileSync(raceSourcePath, 'utf8').replace(/\r\n/g, '\n')
  : '';
const pandocPath = process.env.PANDOC_PATH
  || (fs.existsSync('C:\\Program Files\\Pandoc\\pandoc.exe') ? 'C:\\Program Files\\Pandoc\\pandoc.exe' : 'pandoc');
const lines = source.split('\n');
const backgroundLines = backgroundSource.split('\n');
const raceLines = raceSource.split('\n');

const classArt = {
  '워록': 'assets/images/homebrew-classes/warlock.jpg',
  '파이터': 'assets/images/homebrew-classes/fighter.jpg',
  '클레릭': 'assets/images/homebrew-tome-v2.jpg',
  '팔라딘': 'assets/images/homebrew-classes/paladin.jpg',
  '레인저': 'assets/images/homebrew-classes/ranger.jpg',
  '드루이드': 'assets/images/homebrew-classes/druid.jpg',
  '몽크': 'assets/images/homebrew-classes/monk.jpg',
  '로그': 'assets/images/homebrew-classes/rogue.jpg',
  '바드': 'assets/images/homebrew-classes/warlock.jpg',
  '바바리안': 'assets/images/homebrew-classes/barbarian.jpg',
  '소서러': 'assets/images/homebrew-tome-v2.jpg',
  '위저드': 'assets/images/homebrew-classes/wizard.jpg',
  '위치': 'assets/images/homebrew-classes/warlock.jpg',
};

const subclassArt = {
  '마녀 집회 후원자 - Coven Patron: Spin the Threads of Fate': 'assets/images/subclasses-v2/coven-patron.jpg',
  '진홍 갈증의 워록 - Warlock of the Crimson Thirst': 'assets/images/subclasses-v2/crimson-thirst-warlock.jpg',
  '크라켄 - Kraken': 'assets/images/subclasses-v2/kraken.jpg',
  '전투 의무병 - Combat Medic': 'assets/images/subclasses-v2/combat-medic.jpg',
  '질풍 - Zephyr': 'assets/images/subclasses-v2/zephyr.jpg',
  '드래곤 권역 - Dragon Domain': 'assets/images/subclasses-v2/dragon-domain.jpg',
  '약탈자 - Marauder': 'assets/images/homebrew-classes/barbarian.jpg',
  '사랑의 맹세 - Oath of Love': 'assets/images/subclasses-v2/oath-of-love.jpg',
  '전승지기의 맹세 - Oath of the Lore-Keeper': 'assets/images/subclasses-v2/oath-of-the-lore-keeper.jpg',
  '슬픔의 맹세 - Oath of Sorrows': 'assets/images/subclasses-v2/oath-of-sorrows.jpg',
  '국경의 맹세 - Oath of Frontiers': 'assets/images/subclasses-v2/oath-of-frontiers.jpg',
  '공허의 파수꾼 - Hollow Warden': 'assets/images/homebrew-classes/ranger.jpg',
  '감시자 - The Sentinel': 'assets/images/subclasses-v2/sentinel.jpg',
  '위치 헌터 - Witch Hunter': 'assets/images/subclasses-v2/witch-hunter.jpg',
  '모기의 회합 - Circle of the Mosquito': 'assets/images/subclasses-v2/circle-of-the-mosquito.jpg',
  '잿더미의 회합 - Circle of Ashes': 'assets/images/subclasses-v2/circle-of-ashes.jpg',
  '장난의 회합 - Circle of Mischief': 'assets/images/homebrew-classes/druid.jpg',
  '파수꾼의 회합 - Circle of the Warden': 'assets/images/subclasses-v2/circle-of-the-warden.jpg',
  '악몽의 회합 - Circle of Nightmares': 'assets/images/homebrew-classes/druid.jpg',
  '브리딩의 회합 - Circle of Breeding': 'assets/images/subclasses-v2/circle-of-breeding.jpg',
  '어린양의 회합 - Circle of the Lamb': 'assets/images/subclasses-v2/circle-of-the-lamb.jpg',
  '내면의 빛의 전사 - Warrior of the Inner Light': 'assets/images/subclasses-v2/warrior-of-the-inner-light.jpg',
  '엑상귀네이터 로그 - Exsanguinator Rogue': 'assets/images/homebrew-classes/rogue.jpg',
  '조디악 아키타입 - Zodiac Archetype': 'assets/images/subclasses-v2/zodiac-archetype.jpg',
  '펜서 - Fencer': 'assets/images/homebrew-classes/rogue.jpg',
  '사보추어 - Saboteur': 'assets/images/subclasses-v2/saboteur.jpg',
  '외과의 - Surgeon': 'assets/images/subclasses-v2/surgeon.jpg',
  '광대 대학 - College of Fools': 'assets/images/homebrew-classes/warlock.jpg',
  '추도사 대학 - College of Eulogies': 'assets/images/subclasses-v2/college-of-eulogies.jpg',
  '스워시버클러 - Swashbuckler': 'assets/images/subclasses-v2/swashbuckler-2024.jpg',
  '야전 의무병 - Field Medic': 'assets/images/homebrew-classes/fighter.jpg',
  '지옥불의 길 - Path of the Inferno': 'assets/images/subclasses-v2/path-of-the-inferno.jpg',
  '라이칸의 길 - Path of the Lycan': 'assets/images/subclasses-v2/path-of-the-lycan.jpg',
  '돌연변이의 길 - Path of the Mutant': 'assets/images/subclasses-v2/path-of-the-mutant.jpg',
  '잉걸심장 - Emberheart': 'assets/images/subclasses-v2/emberheart.jpg',
  '지맥술 학파 - School of Geomancy': 'assets/images/subclasses-v2/school-of-geomancy.jpg',
  '전격술사 - Electromancer': 'assets/images/subclasses-v2/electromancer.jpg',
  '재야 마법 - Hedge Magic': 'assets/images/subclasses-v2/hedge-magic.jpg',
  '위치 - Witch': 'assets/images/subclasses-v2/witch.jpg',
};

const classNotes = {
  '워록': '후원자, 피의 계약, 운명의 실처럼 초자연적 대가를 중심으로 한 서브클래스입니다.',
  '파이터': '전장 역할을 명확히 바꾸는 전술형 무술 원형입니다.',
  '클레릭': '신성 권역을 통해 신의 힘과 교리를 전투와 주문 운용으로 확장하는 선택지입니다.',
  '팔라딘': '맹세와 신조가 플레이 방향을 강하게 정하는 서약형 서브클래스입니다.',
  '레인저': '감시, 추적, 비전 위협 대응처럼 탐사와 전투 사이를 오가는 선택지입니다.',
  '드루이드': '자연의 형태를 괴수성, 계절, 생체 정수 같은 테마로 비트는 회합입니다.',
  '몽크': '빛과 생명력을 무술 자원으로 다루는 고기동 영적 전투가 핵심입니다.',
  '로그': '피, 별자리, 의무병처럼 전문 기술의 성격이 강한 아키타입입니다.',
  '바드': '공연, 풍자, 애도, 감정 조작을 마법과 결합하는 바드 대학입니다.',
  '바바리안': '피와 폭풍을 전투 지속력으로 바꾸는 공격적 길입니다.',
  '소서러': '타고난 비전 기원을 통해 주문과 몸 자체를 변화시키는 선택지입니다.',
  '위저드': '학파 자체의 계산과 환경 조작이 강한 주문 사용자 선택지입니다.',
  '위치': '사역마, 주술, 포션, 달의 코븐을 중심으로 움직이는 자연 비전 계열 완전 클래스입니다.',
};

const slugOverrides = new Map([
  ['워록', 'warlock'],
  ['파이터', 'fighter'],
  ['클레릭', 'cleric'],
  ['팔라딘', 'paladin'],
  ['레인저', 'ranger'],
  ['드루이드', 'druid'],
  ['몽크', 'monk'],
  ['로그', 'rogue'],
  ['바드', 'bard'],
  ['바바리안', 'barbarian'],
  ['소서러', 'sorcerer'],
  ['위저드', 'wizard'],
  ['위치', 'witch'],
  ['독사과', 'poison-apple'],
  ['아타메 반사', 'athame-reflection'],
  ['마녀 집회 후원자 - Coven Patron: Spin the Threads of Fate', 'coven-patron'],
  ['진홍 갈증의 워록 - Warlock of the Crimson Thirst', 'crimson-thirst-warlock'],
  ['크라켄 - Kraken', 'kraken'],
  ['전투 의무병 - Combat Medic', 'combat-medic'],
  ['질풍 - Zephyr', 'zephyr'],
  ['드래곤 권역 - Dragon Domain', 'dragon-domain'],
  ['약탈자 - Marauder', 'marauder'],
  ['사랑의 맹세 - Oath of Love', 'oath-of-love'],
  ['전승지기의 맹세 - Oath of the Lore-Keeper', 'oath-of-the-lore-keeper'],
  ['슬픔의 맹세 - Oath of Sorrows', 'oath-of-sorrows'],
  ['국경의 맹세 - Oath of Frontiers', 'oath-of-frontiers'],
  ['공허의 파수꾼 - Hollow Warden', 'hollow-warden'],
  ['감시자 - The Sentinel', 'sentinel'],
  ['위치 헌터 - Witch Hunter', 'witch-hunter'],
  ['잿더미의 회합 - Circle of Ashes', 'circle-of-ashes'],
  ['모기의 회합 - Circle of the Mosquito', 'circle-of-the-mosquito'],
  ['장난의 회합 - Circle of Mischief', 'circle-of-mischief'],
  ['파수꾼의 회합 - Circle of the Warden', 'circle-of-the-warden'],
  ['악몽의 회합 - Circle of Nightmares', 'circle-of-nightmares'],
  ['브리딩의 회합 - Circle of Breeding', 'circle-of-breeding'],
  ['어린양의 회합 - Circle of the Lamb', 'circle-of-the-lamb'],
  ['내면의 빛의 전사 - Warrior of the Inner Light', 'warrior-of-the-inner-light'],
  ['엑상귀네이터 로그 - Exsanguinator Rogue', 'exsanguinator-rogue'],
  ['조디악 아키타입 - Zodiac Archetype', 'zodiac-archetype'],
  ['펜서 - Fencer', 'fencer'],
  ['사보추어 - Saboteur', 'saboteur'],
  ['외과의 - Surgeon', 'surgeon'],
  ['광대 대학 - College of Fools', 'college-of-fools'],
  ['추도사 대학 - College of Eulogies', 'college-of-eulogies'],
  ['스워시버클러 - Swashbuckler', 'swashbuckler-2024'],
  ['야전 의무병 - Field Medic', 'field-medic'],
  ['지옥불의 길 - Path of the Inferno', 'path-of-the-inferno'],
  ['라이칸의 길 - Path of the Lycan', 'path-of-the-lycan'],
  ['돌연변이의 길 - Path of the Mutant', 'path-of-the-mutant'],
  ['잉걸심장 - Emberheart', 'emberheart'],
  ['지맥술 학파 - School of Geomancy', 'school-of-geomancy'],
  ['전격술사 - Electromancer', 'electromancer'],
  ['재야 마법 - Hedge Magic', 'hedge-magic'],
  ['위치 - Witch', 'witch'],
  ['마우스포크 - Mousefolk', 'mousefolk'],
  ['라크샤사 - Rakshasa', 'rakshasa-tiefling'],
  ['타나루크 - Tanarukk', 'tanarukk'],
  ['와이번본 - Wyvernborn', 'wyvernborn'],
]);

const removedSubclassTitles = new Set([
  '공허의 파수꾼 - Hollow Warden',
  '악몽의 회합 - Circle of Nightmares',
  '장난의 회합 - Circle of Mischief',
  '야전 의무병 - Field Medic',
  '약탈자 - Marauder',
  '엑상귀네이터 로그 - Exsanguinator Rogue',
  '펜서 - Fencer',
  '광대 대학 - College of Fools',
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function cardArtHtml(src, alt) {
  const safeSrc = escapeHtml(src);
  return `<span class="brew-card-art" style="--brew-card-image: url('${safeSrc}')"><img src="${safeSrc}" alt="${escapeHtml(alt)}"></span>`;
}

function slugify(value) {
  const fromMap = slugOverrides.get(value);
  if (fromMap) return fromMap;
  return value.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleParts(title) {
  const [ko, ...rest] = title.split(' - ');
  return { ko: ko.trim(), en: rest.join(' - ').trim() };
}

function displayName(title) {
  const { ko, en } = titleParts(title);
  return en ? `${ko} - ${en}` : ko;
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function fallbackHeadingId(title, index) {
  return slugify(title) || `section-${index}`;
}

function simpleMarkdownToHtml(markdown) {
  const src = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const openSections = [];
  let headingIndex = 0;

  function closeSections(level = 0) {
    while (openSections.length && openSections.at(-1) >= level) {
      html.push('</section>');
      openSections.pop();
    }
  }

  function readParagraph(start) {
    const parts = [];
    let i = start;
    while (
      i < src.length
      && src[i].trim()
      && !/^#{1,6}\s+/.test(src[i])
      && !/^\|/.test(src[i].trim())
      && !/^\s*[-*]\s+/.test(src[i])
      && !/^>\s?/.test(src[i])
    ) {
      parts.push(src[i].trim());
      i += 1;
    }
    html.push(`<p>${inlineMarkdown(parts.join(' '))}</p>`);
    return i;
  }

  function readList(start) {
    const items = [];
    let i = start;
    while (i < src.length && /^\s*[-*]\s+/.test(src[i])) {
      items.push(src[i].replace(/^\s*[-*]\s+/, '').trim());
      i += 1;
    }
    html.push(`<ul>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    return i;
  }

  function readBlockquote(start) {
    const parts = [];
    let i = start;
    while (i < src.length && /^>\s?/.test(src[i])) {
      parts.push(src[i].replace(/^>\s?/, '').trim());
      i += 1;
    }
    html.push(`<blockquote>${parts.map(part => `<p>${inlineMarkdown(part)}</p>`).join('')}</blockquote>`);
    return i;
  }

  function readTable(start) {
    const rows = [];
    let i = start;
    while (i < src.length && /^\|/.test(src[i].trim())) {
      rows.push(src[i].trim());
      i += 1;
    }
    const parsedRows = rows
      .filter((row, idx) => idx !== 1 || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(row))
      .map(row => row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
    if (!parsedRows.length) return i;
    const [head, ...body] = parsedRows;
    html.push(`<table><thead><tr>${head.map(cell => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    return i;
  }

  for (let i = 0; i < src.length;) {
    const line = src[i];
    if (!line.trim() || /^---$/.test(line.trim())) {
      i += 1;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();
      closeSections(level);
      headingIndex += 1;
      html.push(`<section id="${escapeHtml(fallbackHeadingId(title, headingIndex))}" class="level${level}"><h${level}>${inlineMarkdown(title)}</h${level}>`);
      openSections.push(level);
      i += 1;
      continue;
    }
    if (/^\|/.test(line.trim())) {
      i = readTable(i);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      i = readList(i);
      continue;
    }
    if (/^>\s?/.test(line)) {
      i = readBlockquote(i);
      continue;
    }
    i = readParagraph(i);
  }

  closeSections(0);
  return html.join('\n');
}

function mdToHtml(markdown) {
  const result = spawnSync(pandocPath, ['-f', 'gfm', '-t', 'html', '--section-divs'], {
    input: markdown,
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });
  if (result.error) {
    return simpleMarkdownToHtml(markdown);
  }
  if (result.status !== 0) {
    if (!result.stderr) return simpleMarkdownToHtml(markdown);
    throw new Error(result.stderr);
  }
  return result.stdout;
}

function makeNav(prefix = '', active = 'homebrew') {
  const items = [
    ['index.html', '홈', 'home'],
    ['player-guide.html', '플레이어 가이드', 'guide'],
    ['world.html', '세계관 자료', 'world'],
    ['setting.html', '설정 정리', 'setting'],
    ['homebrew.html', '홈브류', 'homebrew'],
  ['credits.html', '출처', 'credits'],
  ];
  return `<nav class="site-nav" aria-label="주요 문서">
  <a class="brand" href="${prefix}index.html">화살성채</a>
  <div class="nav-links">
    ${items.map(([href, label, key]) => `<a${key === active ? ' class="active"' : ''} href="${prefix}${href}">${label}</a>`).join('\n    ')}
  </div>
</nav>`;
}

function pageShell({ title, bodyClass, active, prefix = '', content, description }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description || title)}">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}assets/style.css">
</head>
<body class="${bodyClass}">
${makeNav(prefix, active)}
${content}
<button id="back-top" class="back-top" type="button" aria-label="맨 위로">↑</button>
<script src="${prefix}assets/app.js"></script>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

function findHeadingIndex(pattern, start = 0) {
  for (let i = start; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) return i;
  }
  return -1;
}

const firstClassIndex = findHeadingIndex(/^## 워록$/);
const sourceIndex = findHeadingIndex(/^## 출처$/);
const bodyLines = lines.slice(firstClassIndex, sourceIndex);
const unusableSourcePattern = /- .+ - (기존 번역본|사용자 제공 원본 자료)$/;
function isRemovedSourceLine(line) {
  return [...removedSubclassTitles].some(title => line.includes(title));
}
const sourceLines = sourceIndex >= 0 ? lines.slice(sourceIndex).filter(line => !unusableSourcePattern.test(line) && !isRemovedSourceLine(line)) : [];
const sourceHtml = sourceLines.length ? mdToHtml(sourceLines.join('\n')) : '';

const classSections = [];
for (let i = 0; i < bodyLines.length; i += 1) {
  const match = bodyLines[i].match(/^## (.+)$/);
  if (!match) continue;
  const start = i;
  let end = bodyLines.length;
  for (let j = i + 1; j < bodyLines.length; j += 1) {
    if (/^## /.test(bodyLines[j])) {
      end = j;
      break;
    }
  }
  classSections.push({ className: match[1], lines: bodyLines.slice(start, end) });
  i = end - 1;
}

const subclasses = [];
for (const classSection of classSections) {
  const sectionLines = classSection.lines;
  for (let i = 0; i < sectionLines.length; i += 1) {
    const match = sectionLines[i].match(/^### (.+)$/);
    if (!match) continue;
    const start = i;
    let end = sectionLines.length;
    for (let j = i + 1; j < sectionLines.length; j += 1) {
      if (/^### /.test(sectionLines[j])) {
        end = j;
        break;
      }
    }
    subclasses.push({
      className: classSection.className,
      title: match[1],
      slug: slugify(match[1]),
      lines: sectionLines.slice(start, end),
    });
    i = end - 1;
  }
}

for (let i = subclasses.length - 1; i >= 0; i -= 1) {
  if (removedSubclassTitles.has(subclasses[i].title)) {
    subclasses.splice(i, 1);
  }
}

const spellSections = [];
const creditSections = [];
const creditHeadingPattern = /^#### (제작 및 고지|크레딧|제작 정보|면책 고지 및 제작 정보)$/;
const creditLinePattern = /^(분류:|서브클래스 제작:|기능 제작:|원문 중간 표기:|>\s*분류:)/;

function captureTable(lines, start) {
  let end = start;
  while (end < lines.length && (lines[end].trim() === '' || /^\|/.test(lines[end]))) {
    end += 1;
  }
  return end;
}

function cleanCredits(subclass) {
  const content = [];
  const credits = [];
  for (let i = 0; i < subclass.lines.length; i += 1) {
    const line = subclass.lines[i];
    if (creditHeadingPattern.test(line)) {
      let end = subclass.lines.length;
      for (let j = i + 1; j < subclass.lines.length; j += 1) {
        if (/^#### /.test(subclass.lines[j])) {
          end = j;
          break;
        }
      }
      credits.push(...subclass.lines.slice(i, end));
      i = end - 1;
      continue;
    }
    if (creditLinePattern.test(line)) {
      credits.push(line);
      if (i + 1 < subclass.lines.length && creditLinePattern.test(subclass.lines[i + 1])) continue;
      continue;
    }
    if (/^\|.*(제작|홈브루 제작|제작 도구|Homebrewery|GM Binder|GMBinder).*\|/.test(line)) {
      const end = captureTable(subclass.lines, i);
      credits.push(...subclass.lines.slice(i, end));
      i = end - 1;
      continue;
    }
    content.push(line);
  }
  if (credits.some(item => item.trim())) {
    creditSections.push({
      className: subclass.className,
      title: subclass.title,
      slug: subclass.slug,
      lines: credits,
    });
  }
  subclass.lines = content;
}

for (const subclass of subclasses) {
  cleanCredits(subclass);
  const out = [];
  for (let i = 0; i < subclass.lines.length; i += 1) {
    if (/^#### 신규 주문 - New Spells/.test(subclass.lines[i])) {
      let end = subclass.lines.length;
      for (let j = i + 1; j < subclass.lines.length; j += 1) {
        if (/^#### /.test(subclass.lines[j])) {
          end = j;
          break;
        }
      }
      const spellBlock = subclass.lines.slice(i + 1, end);
      let k = 0;
      while (k < spellBlock.length) {
        const m = spellBlock[k].match(/^##### (.+)$/);
        if (!m) {
          k += 1;
          continue;
        }
        let sEnd = spellBlock.length;
        for (let x = k + 1; x < spellBlock.length; x += 1) {
          if (/^##### /.test(spellBlock[x])) {
            sEnd = x;
            break;
          }
        }
        const originalNames = {
          '독사과': 'Poison Apple',
          '아타메 반사': 'Athame Reflection',
        };
        const spellTitle = originalNames[m[1]] ? `${m[1]} - ${originalNames[m[1]]}` : m[1];
        spellSections.push({
          title: spellTitle,
          slug: slugify(m[1]),
          className: subclass.className,
          sourceTitle: subclass.title,
          sourceSlug: subclass.slug,
          lines: spellBlock.slice(k, sEnd).map((line, idx) => idx === 0 ? line.replace(/^##### /, '### ') : line),
        });
        k = sEnd;
      }
      out.push('#### 신규 주문');
      out.push('');
      out.push(`이 서브클래스에 포함된 신규 주문은 [주문 문서](../spells.html#${spellSections.at(-2)?.slug || spellSections.at(-1)?.slug || 'spells'})로 분리했습니다.`);
      out.push('');
      i = end - 1;
    } else {
      out.push(subclass.lines[i]);
    }
  }
  subclass.lines = out;
}

function parseSpell(spell) {
  const title = spell.title;
  const rest = spell.lines.slice(1).filter(line => line.trim());
  const subtitle = rest[0] || '';
  const meta = {};
  const body = [];
  for (const line of rest.slice(1)) {
    const m = line.match(/^(시전 시간|사거리|구성요소|지속시간):\s*(.+)$/);
    if (m) meta[m[1]] = m[2];
    else if (!/^---$/.test(line.trim()) && !creditLinePattern.test(line.trim())) body.push(line);
  }
  const sub = subtitle.match(/^(.+?) 주문(?: \((.+)\))?$/);
  const levelSchool = sub ? sub[1] : subtitle;
  const schoolMatch = levelSchool.match(/(방호계|조형계|예지계|환혹계|소환계|환영계|사령계|변환계)/);
  const levelMatch = levelSchool.match(/(소마법|\d+레벨)/);
  const bodyText = body.join('\n');
  return {
    title,
    levelSchool,
    level: levelMatch ? levelMatch[1] : levelSchool,
    school: schoolMatch ? schoolMatch[1] : '-',
    classes: sub && sub[2] && sub[2] !== '의식' ? sub[2] : '',
    meta,
    attackSave: inferAttackSave(bodyText),
    damageEffect: inferDamageEffect(bodyText),
    body: body.join('\n'),
  };
}

function inferAttackSave(text) {
  const saves = [...text.matchAll(/(근력|민첩|건강|지능|지혜|매력) 내성/g)].map(match => `${match[1]} 내성`);
  if (saves.length) return [...new Set(saves)].join(', ');
  if (/근접 주문 공격|원거리 주문 공격/.test(text)) return '주문 공격';
  if (/공격/.test(text)) return '공격';
  return '-';
}

function inferDamageEffect(text) {
  const damageTypes = ['산성', '냉기', '화염', '역장', '번개', '사령', '독', '정신', '광휘', '천둥', '타격', '관통', '참격'];
  const conditions = ['매혹', '공포', '중독', '실명', '청각상실', '마비', '넘어짐', '행동불능'];
  const foundDamage = damageTypes.filter(type => text.includes(`${type} 피해`));
  const foundConditions = conditions.filter(condition => text.includes(`${condition} 상태`) || text.includes(`${condition}됩니다`));
  return [...new Set([...foundDamage, ...foundConditions])].join(', ') || '-';
}

function spellCardHtml(spell) {
  const parsed = parseSpell(spell);
  const bodyHtml = mdToHtml(parsed.body || '');
  const sourceName = titleParts(spell.sourceTitle).ko;
  const availableFor = parsed.classes || spell.className;
  return `<article id="${spell.slug}" class="dndb-spell spell-card spell-dndb-card">
    <header class="dndb-spell-head spell-dndb-head">
      <p class="spell-source">${escapeHtml(spell.className)} · <a href="subclasses/${spell.sourceSlug}.html">${escapeHtml(sourceName)}</a></p>
      <h2>${escapeHtml(displayName(parsed.title))}</h2>
      <p class="spell-subtitle">${escapeHtml(parsed.level)} · ${escapeHtml(parsed.school)}</p>
    </header>
    <div class="spell-classes">
      <span>사용 가능 클래스</span>${availableFor.split(/,\s*/).map(item => `<strong>${escapeHtml(item)}</strong>`).join('')}
    </div>
    <dl class="spell-stats spell-dndb-stats">
      <div class="spell-stat-item"><dt>LEVEL</dt><dd>${escapeHtml(parsed.level)}</dd></div>
      <div class="spell-stat-item"><dt>CASTING TIME</dt><dd>${escapeHtml(parsed.meta['시전 시간'] || '-')}</dd></div>
      <div class="spell-stat-item"><dt>RANGE/AREA</dt><dd>${escapeHtml(parsed.meta['사거리'] || '-')}</dd></div>
      <div class="spell-stat-item"><dt>COMPONENTS</dt><dd>${escapeHtml(parsed.meta['구성요소'] || '-')}</dd></div>
      <div class="spell-stat-item"><dt>DURATION</dt><dd>${escapeHtml(parsed.meta['지속시간'] || '-')}</dd></div>
      <div class="spell-stat-item"><dt>SCHOOL</dt><dd>${escapeHtml(parsed.school)}</dd></div>
      <div class="spell-stat-item"><dt>ATTACK/SAVE</dt><dd>${escapeHtml(parsed.attackSave)}</dd></div>
      <div class="spell-stat-item"><dt>DAMAGE/EFFECT</dt><dd>${escapeHtml(parsed.damageEffect)}</dd></div>
    </dl>
    <div class="spell-body doc-content">${bodyHtml}</div>
  </article>`;
}

function parseBackgroundSections() {
  const entries = [];
  for (let i = 0; i < backgroundLines.length; i += 1) {
    const match = backgroundLines[i].match(/^### (.+)$/);
    if (!match) continue;
    const start = i;
    let end = backgroundLines.length;
    for (let j = i + 1; j < backgroundLines.length; j += 1) {
      if (/^### /.test(backgroundLines[j]) || /^## 크레딧$/.test(backgroundLines[j])) {
        end = j;
        break;
      }
    }
    entries.push({
      title: match[1],
      slug: slugify(match[1]),
      lines: backgroundLines.slice(start, end),
    });
    i = end - 1;
  }
  return entries;
}

function parseBackground(background) {
  const meta = {};
  const body = [];
  for (const line of background.lines.slice(1)) {
    const match = line.match(/^\*\*(능력치|재주|기술 숙련|도구 숙련|장비):\*\*\s*(.+)$/);
    if (match) meta[match[1]] = match[2];
    else body.push(line);
  }
  return {
    title: background.title,
    meta,
    body: body.join('\n').trim(),
  };
}

function extractOriginFeat(background) {
  const parsed = parseBackground(background);
  const start = background.lines.findIndex(line => /^#### 재주:/.test(line));
  if (start < 0) {
    return parsed.meta['재주'] ? { title: parsed.meta['재주'], lines: [] } : null;
  }
  const headingTitle = background.lines[start].replace(/^#### 재주:\s*/, '').trim();
  let end = background.lines.length;
  for (let i = start + 1; i < background.lines.length; i += 1) {
    if (/^#### /.test(background.lines[i])) {
      end = i;
      break;
    }
  }
  return {
    title: headingTitle || parsed.meta['재주'],
    lines: background.lines.slice(start + 1, end).filter(line => line.trim() !== '---'),
  };
}

function collectOriginFeats(backgrounds) {
  const byTitle = new Map();
  for (const background of backgrounds) {
    const feat = extractOriginFeat(background);
    if (!feat?.title) continue;
    const backgroundName = displayName(background.title);
    if (!byTitle.has(feat.title)) {
      byTitle.set(feat.title, {
        ...feat,
        slug: slugify(feat.title),
        backgrounds: [backgroundName],
      });
    } else {
      const existing = byTitle.get(feat.title);
      existing.backgrounds.push(backgroundName);
      if (!existing.lines.length && feat.lines.length) existing.lines = feat.lines;
    }
  }
  return [...byTitle.values()];
}

function backgroundCardHtml(background) {
  const parsed = parseBackground(background);
  const { ko, en } = titleParts(background.title);
  const bodyHtml = enhanceRuleHtml(mdToHtml(parsed.body || ''));
  const stats = ['능력치', '재주', '기술 숙련', '도구 숙련', '장비'];
  return `<article id="${escapeHtml(background.slug)}" class="dndb-spell bg-card background-entry">
    <header class="dndb-spell-head background-head">
      <div>
        <p class="spell-source">BACKGROUND · 백그라운드</p>
        <h2>${escapeHtml(ko)}</h2>
        ${en ? `<p class="spell-subtitle">${escapeHtml(en)}</p>` : ''}
      </div>
    </header>
    <dl class="spell-stats background-stats">
      ${stats.map(label => `<div class="bg-stat-item"><dt>${label}</dt><dd>${escapeHtml(parsed.meta[label] || '-')}</dd></div>`).join('')}
    </dl>
    <div class="spell-body doc-content background-body">${bodyHtml}</div>
  </article>`;
}

function featCardHtml(feat) {
  const { ko, en } = titleParts(feat.title);
  const body = feat.lines.length
    ? feat.lines.join('\n')
    : '이 피트의 규칙 본문은 연결된 백그라운드 항목에 포함되어 있습니다.';
  const bodyHtml = enhanceRuleHtml(mdToHtml(body));
  return `<article id="${escapeHtml(feat.slug)}" class="dndb-spell origin-feat-card">
    <header class="dndb-spell-head background-head">
      <p class="spell-source">ORIGIN FEAT · 출신 재주</p>
      <h2>${escapeHtml(ko)}</h2>
      ${en ? `<p class="spell-subtitle">${escapeHtml(en)}</p>` : ''}
    </header>
    <div class="feat-used-by">
      <span>포함 백그라운드</span>
      ${feat.backgrounds.map(item => `<strong>${escapeHtml(item)}</strong>`).join('')}
    </div>
    <div class="spell-body doc-content feat-body">${bodyHtml}</div>
  </article>`;
}

function parseRaceSections() {
  const entries = [];
  let currentCategory = '';
  for (let i = 0; i < raceLines.length; i += 1) {
    const categoryMatch = raceLines[i].match(/^## (.+)$/);
    if (categoryMatch && categoryMatch[1] !== '목차') {
      currentCategory = categoryMatch[1];
      continue;
    }
    const match = raceLines[i].match(/^### (.+)$/);
    if (!match) continue;
    const start = i;
    let end = raceLines.length;
    for (let j = i + 1; j < raceLines.length; j += 1) {
      if (/^### /.test(raceLines[j]) || /^## /.test(raceLines[j])) {
        end = j;
        break;
      }
    }
    entries.push({
      category: currentCategory || '종족 옵션',
      title: match[1],
      slug: slugify(match[1]),
      lines: raceLines.slice(start, end),
    });
    i = end - 1;
  }
  return entries;
}

const raceArt = {
  '마우스포크 - Mousefolk': 'assets/images/races-v2/mousefolk.jpg',
  '라크샤사 - Rakshasa': 'assets/images/races-v2/rakshasa.jpg',
  '타나루크 - Tanarukk': 'assets/images/races-v2/tanarukk.jpg',
  '와이번본 - Wyvernborn': 'assets/images/races-v2/wyvernborn.jpg',
};

const cardSynopsisOverrides = {
  '내면의 빛의 전사 - Warrior of the Inner Light': '빛과 생명력을 무술 에너지로 다루는 몽크 서브클래스입니다.',
  '재야 마법 - Hedge Magic': '정규 학파 밖에서 낮은 마법을 실전으로 익힌 위저드 서브클래스입니다.',
  '브리딩의 회합 - Circle of Breeding': '생체 정수를 수집해 정수 영혼으로 투사하는 드루이드 회합입니다.',
  '어린양의 회합 - Circle of the Lamb': '포근한 안식과 생명력 공유로 동료를 지키는 드루이드 회합입니다.',
  '외과의 - Surgeon': '해부학적 평가와 빠른 처치로 아군을 살리고 적을 정밀하게 무너뜨리는 로그 아키타입입니다.',
  '위치 헌터 - Witch Hunter': '사냥꾼의 표식을 심판의 낙인으로 바꾸어 주문시전자와 이단자를 추적하는 레인저 서브클래스입니다.',
  '와이번본 - Wyvernborn': '비행과 독침 꼬리를 얻는 와이번 혈통 드래곤본 변형 옵션입니다.',
};

function raceArtPath(race, prefix = '') {
  return `${prefix}${raceArt[race.title] || 'assets/images/races-v2/race-card.jpg'}`;
}

function raceKindLabel(race) {
  if (/유산/.test(race.category)) return '유산';
  if (/서브레이스/.test(race.category)) return '서브레이스';
  return '종족';
}

function raceEyebrow(race) {
  if (/티플링/.test(race.category)) return '티플링 LEGACY';
  if (/오크/.test(race.category)) return '오크 SUBRACE';
  if (/드래곤본/.test(race.category)) return '드래곤본 SUBRACE';
  return 'SPECIES';
}

function raceIntro(race) {
  const paragraph = race.lines
    .slice(1)
    .filter(line => line.trim() && !/^#|^\||^-|^---|^>|\*\*/.test(line))
    .find(line => /[가-힣]/.test(line));
  return paragraph ? paragraph.replace(/\*\*/g, '').trim() : '플레이에 사용할 수 있도록 정리한 종족 옵션입니다.';
}

function raceFeatureNames(race) {
  return race.lines
    .map(line => {
      const match = line.match(/^#{4,6}\s+(.+)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .filter(name => !/(털북숭이|집과 난로|장인과 모험가|고결하고|이름|특성|혈통 선택|총평)/.test(name))
    .slice(0, 8);
}

function raceSummaryHtml(race) {
  const features = raceFeatureNames(race);
  const rows = [
    ['분류', race.category],
    ['유형', raceKindLabel(race)],
    ['핵심 특성', features.length ? features.map(displayName).join(', ') : '본문 참고'],
  ];
  return `<section class="level-summary" aria-label="종족 특성 요약">
        <div class="summary-head">
          <span>RACE TRAITS</span>
          <h2>특성 요약</h2>
        </div>
        <table>
          <thead><tr><th>구분</th><th>내용</th></tr></thead>
          <tbody>${rows.map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody>
        </table>
      </section>`;
}

function raceCardHtml(race) {
  const { ko, en } = titleParts(race.title);
  const art = raceArtPath(race);
  return `<a class="brew-card" href="races/${race.slug}.html">
    ${cardArtHtml(art, `${ko} 분위기 이미지`)}
    <strong>${escapeHtml(ko)}</strong>
    ${en ? `<em>${escapeHtml(en)}</em>` : ''}
    <p>${escapeHtml(cardSynopsis(race.lines, race.title))}</p>
  </a>`;
}

function extractHeadings(markdownLines) {
  return markdownLines
    .filter(line => /^#### /.test(line))
    .map(line => line.replace(/^#### /, '').trim())
    .filter(title => !/^총평/.test(title))
    .slice(0, 8);
}

function extractHtmlHeadings(html) {
  const matches = [
    ...html.matchAll(/<section id="([^"]+)" class="level4">\s*<h4>([\s\S]*?)<\/h4>/g),
    ...html.matchAll(/<h4 id="([^"]+)">([\s\S]*?)<\/h4>/g),
  ];
  return matches.map(([, id, raw]) => ({
    id,
    title: raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  })).filter(item => !/^총평/.test(item.title)).slice(0, 8);
}

function extractLevelSummary(markdownLines) {
  const rows = [];
  for (const line of markdownLines) {
    const match = line.match(/^####\s+(\d+)레벨:\s+(.+)$/);
    if (!match || /^(신규 주문|총평|개요)/.test(match[2])) continue;
    rows.push({ level: `${match[1]}레벨`, title: match[2].trim() });
  }
  const seen = new Set();
  return rows.filter(row => {
    const key = `${row.level}:${row.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

function levelSummaryHtml(markdownLines) {
  const rows = extractLevelSummary(markdownLines);
  if (!rows.length) return '';
  return `<section class="level-summary" aria-label="레벨 요약">
    <div class="summary-head">
      <span>LEVEL PROGRESSION</span>
      <h2>레벨 요약</h2>
    </div>
    <table>
      <thead><tr><th>레벨</th><th>기능</th></tr></thead>
      <tbody>${rows.map(row => `<tr><td>${escapeHtml(row.level)}</td><td>${escapeHtml(row.title)}</td></tr>`).join('')}</tbody>
    </table>
  </section>`;
}

function enhanceRuleHtml(html) {
  return html
    .replace(/<p>((?:쉽게 말해|다만|원문상|보통은|즉,|주의:)[\s\S]*?)<\/p>/g, '<p class="rule-note">$1</p>')
    .replace(/<section\s+id="([^"]+)"\s+class="level4">\s*<h4>([\s\S]*?)<\/h4>/g, '<section id="$1" class="level4 feature-block"><h4>$2</h4>');
}

function synopsis(markdownLines) {
  const paragraph = markdownLines
    .filter(line => line && !/^#|^\||^-|^---/.test(line))
    .find(line => /[가-힣]/.test(line));
  return paragraph ? paragraph.replace(/\*\*/g, '').trim() : '번역문과 플레이용 룰 검토를 함께 정리한 서브클래스입니다.';
}

function cardSynopsis(markdownLines, title = '') {
  if (cardSynopsisOverrides[title]) return cardSynopsisOverrides[title];
  const text = synopsis(markdownLines);
  if (text.length <= 105) return text;
  const sentence = text.match(/^(.+?[.!?。]|.+?다\.|.+?요\.)/);
  if (sentence && sentence[1].length <= 120) return sentence[1].trim();
  return `${text.slice(0, 104).trim()}...`;
}

function badgeFor(subclass) {
  const headings = extractHeadings(subclass.lines).join(' ');
  if (/주문|Spells|Magic/.test(headings)) return '주문 확장';
  if (/치료|의무|Medic|Healing|회복/.test(subclass.title + headings)) return '지원';
  if (/피|Blood|폭풍|약탈|Crimson|Hurricane|Marauder/.test(subclass.title + headings)) return '공격';
  if (/감시|Sentinel|Warden|파수|추적|Hunt/.test(subclass.title + headings)) return '추적';
  if (/사랑|전승|Lore|Love/.test(subclass.title + headings)) return '서약';
  return '테마형';
}

function artPathFor(className, prefix = '', title = '') {
  return `${prefix}${subclassArt[title] || classArt[className] || 'assets/images/homebrew-tome-v2.jpg'}`;
}

function documentKind(subclass) {
  return subclass.title === '위치 - Witch' ? 'CLASS' : 'SUBCLASS';
}

function subclassCard(subclass) {
  const { ko, en } = titleParts(subclass.title);
  const art = artPathFor(subclass.className, '', subclass.title);
  return `<a class="brew-card" href="subclasses/${subclass.slug}.html">
    ${cardArtHtml(art, `${ko} 분위기 이미지`)}
    <strong>${escapeHtml(ko)}</strong>
    ${en ? `<em>${escapeHtml(en)}</em>` : ''}
    <p>${escapeHtml(cardSynopsis(subclass.lines, subclass.title))}</p>
  </a>`;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'path-of-the-bloodstained-hurricane.html'), `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="0; url=../homebrew.html#subclasses">
<title>삭제된 홈브류 항목</title>
<link rel="canonical" href="../homebrew.html#subclasses">
</head>
<body>
<p>삭제된 홈브류 항목입니다. <a href="../homebrew.html#subclasses">홈브류 목록으로 이동</a></p>
</body>
</html>
`);

const byClass = new Map();
for (const subclass of subclasses) {
  if (!byClass.has(subclass.className)) byClass.set(subclass.className, []);
  byClass.get(subclass.className).push(subclass);
}
const backgroundSections = parseBackgroundSections();
const raceSections = parseRaceSections();
const classDocuments = subclasses.filter(item => documentKind(item) === 'CLASS');
const subclassDocuments = subclasses.filter(item => documentKind(item) === 'SUBCLASS');
const originFeats = collectOriginFeats(backgroundSections);

const homebrewTabItems = [
  ['classes', '클래스', classDocuments.length, '#classes'],
  ['subclasses', '서브클래스', subclassDocuments.length, '#subclasses'],
  ['feats', '피트', originFeats.length, '#feats'],
  ['races', '종족', raceSections.length, '#races'],
  ['backgrounds', '백그라운드', backgroundSections.length, 'backgrounds.html'],
  ['spells', '주문', spellSections.length, 'spells.html'],
  ['credits', '출처', creditSections.length, 'credits.html'],
];

function homebrewSideTabs(active = 'subclasses', { prefix = '', switchLocal = false } = {}) {
  return `<aside class="homebrew-side-tabs" aria-label="홈브류 분류">
    <p class="homebrew-side-title">Homebrew</p>
    ${homebrewTabItems.map(([key, label, count, href]) => {
      const localPane = ['classes', 'subclasses', 'feats', 'races'].includes(key);
      const localHref = localPane ? `homebrew.html${href}` : href;
      const resolvedHref = switchLocal && localPane ? href : `${prefix}${localHref}`;
      const attrs = [
        key === active ? 'class="active"' : '',
        switchLocal && localPane ? `data-tab="${key}"` : '',
      ].filter(Boolean).join(' ');
      return `<a ${attrs} href="${resolvedHref}"><span>${label}</span><strong>${count}</strong></a>`;
    }).join('')}
  </aside>`;
}

for (const subclass of subclasses) {
  const { ko, en } = titleParts(subclass.title);
  const kind = documentKind(subclass);
  const related = byClass.get(subclass.className).filter(item => item.slug !== subclass.slug).slice(0, 5);
  const bodyHtml = enhanceRuleHtml(mdToHtml(subclass.lines.slice(1).join('\n')));
  const hasRelatedSpells = spellSections.some(spell => spell.sourceSlug === subclass.slug);
  const sideContent = [
    hasRelatedSpells ? `<a class="side-action" href="../spells.html">관련 주문 보기</a>` : '',
    related.length ? `<div class="brew-side-box">
        <p class="side-label">같은 클래스</p>
        ${related.map(item => `<a class="side-link" href="${item.slug}.html">${escapeHtml(titleParts(item.title).ko)}</a>`).join('')}
      </div>` : '',
  ].filter(Boolean).join('\n      ');
  const content = `<main id="top" class="brew-detail">
  <header class="brew-detail-hero">
    <div class="brew-hero-copy">
      <a class="crumb-link" href="../homebrew.html">홈브류 목록</a>
      <p class="eyebrow">${escapeHtml(subclass.className)} ${kind}</p>
      <h1>${escapeHtml(ko)}</h1>
      ${en ? `<p class="brew-en">${escapeHtml(en)}</p>` : ''}
      <p class="brew-lede">${escapeHtml(synopsis(subclass.lines))}</p>
      <div class="brew-meta-row">
        <span>${escapeHtml(subclass.className)}</span>
        <span>2024 구조</span>
        <span>번역 본문</span>
      </div>
    </div>
    <figure class="brew-art-frame">
      <img src="../${artPathFor(subclass.className, '', subclass.title)}" alt="${escapeHtml(ko)} 분위기 이미지">
    </figure>
  </header>
  <div class="brew-reading-grid${sideContent ? '' : ' no-side'}">
    ${sideContent ? `<aside class="brew-side">
      ${sideContent}
    </aside>` : ''}
    <article class="content doc-content brew-article">
      ${levelSummaryHtml(subclass.lines)}
      ${bodyHtml}
    </article>
  </div>
</main>`;
  fs.writeFileSync(path.join(outDir, `${subclass.slug}.html`), pageShell({
    title: `${ko} - 화살성채 홈브류`,
    bodyClass: 'brew-page subclass-page',
    active: 'homebrew',
    prefix: '../',
    description: `${subclass.className} ${kind === 'CLASS' ? '클래스' : '서브클래스'} ${ko} 번역`,
    content,
  }));
}

fs.rmSync(raceOutDir, { recursive: true, force: true });
fs.mkdirSync(raceOutDir, { recursive: true });

for (const race of raceSections) {
  const { ko, en } = titleParts(race.title);
  const related = raceSections.filter(item => item.slug !== race.slug).slice(0, 5);
  const bodyHtml = enhanceRuleHtml(mdToHtml(race.lines.slice(1).join('\n')));
  const content = `<main id="top" class="brew-detail">
  <header class="brew-detail-hero">
    <div class="brew-hero-copy">
      <a class="crumb-link" href="../homebrew.html#races">종족 목록</a>
      <p class="eyebrow">${escapeHtml(raceEyebrow(race))}</p>
      <h1>${escapeHtml(ko)}</h1>
      ${en ? `<p class="brew-en">${escapeHtml(en)}</p>` : ''}
      <p class="brew-lede">${escapeHtml(raceIntro(race))}</p>
      <div class="brew-meta-row">
        <span>${escapeHtml(race.category)}</span>
        <span>${escapeHtml(raceKindLabel(race))}</span>
        <span>2024 구조</span>
      </div>
    </div>
    <figure class="brew-art-frame compact">
      <img src="../${raceArtPath(race)}" alt="${escapeHtml(ko)} 분위기 이미지">
    </figure>
  </header>
  <div class="brew-reading-grid${related.length ? '' : ' no-side'}">
    ${related.length ? `<aside class="brew-side">
      <div class="brew-side-box">
        <p class="side-label">다른 종족 옵션</p>
        ${related.map(item => `<a class="side-link" href="${item.slug}.html">${escapeHtml(titleParts(item.title).ko)}</a>`).join('')}
      </div>
    </aside>` : ''}
    <article class="content doc-content brew-article">
      ${raceSummaryHtml(race)}
      ${bodyHtml}
    </article>
  </div>
</main>`;
  fs.writeFileSync(path.join(raceOutDir, `${race.slug}.html`), pageShell({
    title: `${ko} - 화살성채 홈브류`,
    bodyClass: 'brew-page subclass-page',
    active: 'homebrew',
    prefix: '../',
    description: `${race.category} ${ko} 번역`,
    content,
  }));
}

const classSectionsHtml = [...byClass.entries()].map(([className, items], index) => {
  return `<section id="${slugify(className)}" class="brew-class-section" style="--i:${index}">
    <div class="brew-class-head no-art">
      <div>
        <span class="section-number">${String(index + 1).padStart(2, '0')}</span>
        <h2>${escapeHtml(className)}</h2>
        <p>${escapeHtml(classNotes[className] || '클래스별 서브클래스 번역과 운용 메모입니다.')}</p>
      </div>
    </div>
    <div class="brew-card-grid">${items.map(subclassCard).join('\n')}</div>
  </section>`;
}).join('\n');

const homeContent = `<main id="top" class="brew-index">
  <header class="brew-index-hero">
    <div>
      <p class="eyebrow">DUNGEONS & DRAGONS 2024</p>
      <h1>홈브류 자료실</h1>
      <p class="brew-lede">홈브류는 좌측 탭에서 클래스, 서브클래스, 피트, 종족, 백그라운드, 주문을 바로 오가며 읽도록 정리했습니다. 플레이 중 필요한 항목을 빠르게 찾을 수 있게 목록과 규칙 카드를 분리했습니다.</p>
    </div>
    <div class="brew-index-panel">
      <span>${classDocuments.length}</span>
      <strong>클래스</strong>
      <span>${subclassDocuments.length}</span>
      <strong>서브클래스</strong>
      <span>${originFeats.length}</span>
      <strong>피트</strong>
      <span>${raceSections.length}</span>
      <strong>종족</strong>
      <span>${spellSections.length}</span>
      <strong>주문</strong>
      <span>${backgroundSections.length}</span>
      <strong>백그라운드</strong>
      <a href="spells.html">주문 보기</a>
    </div>
  </header>
  <div class="homebrew-shell tabs-ready" data-tabs="true" data-default-tab="subclasses">
    ${homebrewSideTabs('subclasses', { switchLocal: true })}
    <div class="homebrew-tab-content">
      <section id="classes" class="homebrew-pane" data-pane="classes">
        <section class="brew-class-section">
          <div class="brew-class-head no-art">
            <div>
              <span class="section-number">CLASS</span>
              <h2>클래스</h2>
              <p>완전 클래스 문서입니다. 현재는 위치 - Witch를 별도 클래스 문서로 관리합니다.</p>
            </div>
          </div>
          <div class="brew-card-grid">${classDocuments.map(subclassCard).join('\n') || '<p class="empty-note">등록된 클래스가 없습니다.</p>'}</div>
        </section>
      </section>
      <section id="subclasses" class="homebrew-pane active" data-pane="subclasses">
        <nav class="brew-toc compact-toc" aria-label="클래스별 서브클래스 목차">
          ${[...byClass.keys()].map(className => `<a href="#${slugify(className)}">${escapeHtml(className)}</a>`).join('')}
        </nav>
        ${classSectionsHtml}
      </section>
      <section id="feats" class="homebrew-pane" data-pane="feats">
        <section class="brew-class-section compact-section">
          <div class="brew-class-head">
            <div>
              <span class="section-number">FEAT</span>
              <h2>피트</h2>
              <p>백그라운드에 포함된 출신 재주도 플레이 중 바로 찾을 수 있도록 별도 규칙 카드로 분리했습니다.</p>
            </div>
          </div>
          <div class="feat-list">${originFeats.map(featCardHtml).join('\n') || '<p class="empty-note">등록된 피트가 없습니다.</p>'}</div>
        </section>
      </section>
      <section id="races" class="homebrew-pane" data-pane="races">
        <section class="brew-class-section compact-section">
          <div class="brew-class-head no-art">
            <div>
              <span class="section-number">RACE</span>
              <h2>종족</h2>
              <p>2024 캐릭터 작성에 맞춰 정리한 종족, 유산, 서브레이스 옵션입니다.</p>
            </div>
          </div>
          <div class="brew-card-grid">${raceSections.map(raceCardHtml).join('\n') || '<p class="empty-note">등록된 종족 옵션이 없습니다.</p>'}</div>
        </section>
      </section>
    </div>
  </div>
  <section class="credits-teaser">
    <p>제작자, 제작 도구, 원문 링크, 고지 문구는 본문에서 분리했습니다.</p>
  <a href="credits.html">출처 보기</a>
  </section>
</main>`;

fs.writeFileSync(path.join(root, 'homebrew.html'), pageShell({
  title: '화살성채 - 홈브류 자료실',
  bodyClass: 'brew-page',
  active: 'homebrew',
  description: '화살성채 캠페인 홈브류 서브클래스와 주문 자료실',
  content: homeContent,
}));

const spellCards = spellSections.map(spellCardHtml).join('\n');

const spellsContent = `<main id="top" class="spell-index">
  <header class="brew-index-hero spell-hero">
    <div>
      <p class="eyebrow">SPELL REFERENCE</p>
      <h1>주문</h1>
      <p class="brew-lede">서브클래스 본문에 섞여 있던 신규 주문을 따로 모았습니다. 플레이 중에는 이 페이지에서 주문 이름만 바로 찾으면 됩니다.</p>
    </div>
  </header>
  <div class="homebrew-shell">
    ${homebrewSideTabs('spells')}
    <div class="homebrew-tab-content">
      <nav class="brew-toc compact-toc" aria-label="주문 목차">
        ${spellSections.map(spell => `<a href="#${spell.slug}">${escapeHtml(displayName(spell.title))}</a>`).join('')}
      </nav>
      <section class="spell-list">
        ${spellCards || '<p class="empty-note">분리된 신규 주문이 없습니다.</p>'}
      </section>
    </div>
  </div>
</main>`;

fs.writeFileSync(path.join(root, 'spells.html'), pageShell({
  title: '화살성채 - 주문',
  bodyClass: 'brew-page spells-page',
  active: 'homebrew',
  description: '화살성채 캠페인 홈브류 신규 주문 모음',
  content: spellsContent,
}));

const backgroundCards = backgroundSections.map(backgroundCardHtml).join('\n');
const backgroundCreditIndex = backgroundLines.findIndex(line => /^## 크레딧$/.test(line));
const backgroundCreditHtml = backgroundCreditIndex >= 0
  ? mdToHtml(backgroundLines.slice(backgroundCreditIndex).join('\n'))
  : '';

const backgroundsContent = `<main id="top" class="background-index">
  <header class="brew-index-hero background-hero">
    <div>
      <p class="eyebrow">CHARACTER ORIGINS</p>
      <h1>백그라운드</h1>
      <p class="brew-lede">The Inspired Arcana의 D&D 5.5용 백그라운드를 2024 구조에 맞춰 번역했습니다. 각 항목은 능력치, 출신 재주, 기술 숙련, 도구 숙련, 장비 선택지를 바로 확인할 수 있게 정리했습니다.</p>
    </div>
    <div class="brew-index-panel">
      <span>${backgroundSections.length}</span>
      <strong>백그라운드</strong>
      <span>${originFeats.length}</span>
      <strong>출신 재주</strong>
      <a href="homebrew.html">홈브류로 돌아가기</a>
    </div>
  </header>
  <div class="homebrew-shell">
    ${homebrewSideTabs('backgrounds')}
    <div class="homebrew-tab-content">
      <nav class="brew-toc compact-toc" aria-label="백그라운드 목차">
        ${backgroundSections.map(background => `<a href="#${background.slug}">${escapeHtml(displayName(background.title))}</a>`).join('')}
      </nav>
      <section class="background-list">
        ${backgroundCards || '<p class="empty-note">등록된 백그라운드가 없습니다.</p>'}
      </section>
      ${backgroundCreditHtml ? `<section class="background-credits credit-card source-card">
        <header><span>Attribution</span><h2>백그라운드 크레딧</h2></header>
        <div class="doc-content">${backgroundCreditHtml}</div>
      </section>` : ''}
    </div>
  </div>
</main>`;

fs.writeFileSync(path.join(root, 'backgrounds.html'), pageShell({
  title: '화살성채 - 백그라운드',
  bodyClass: 'brew-page backgrounds-page',
  active: 'homebrew',
  description: '화살성채 캠페인 홈브류 백그라운드 모음',
  content: backgroundsContent,
}));

const creditBlocks = creditSections.map(section => {
  const html = mdToHtml(section.lines.join('\n'));
  return `<section class="credit-source-block">
    <h3><a href="subclasses/${section.slug}.html">${escapeHtml(titleParts(section.title).ko)}</a></h3>
    ${html}
  </section>`;
}).join('\n');

const creditsContent = `<main id="top" class="credits-index">
  <header class="brew-index-hero">
    <div>
      <p class="eyebrow">ATTRIBUTION</p>
      <h1>출처</h1>
      <p class="brew-lede">제작 정보, 고지, 원문 출처를 한곳에 정리했습니다.</p>
    </div>
    <div class="brew-index-panel">
      <a href="homebrew.html">홈브류로 돌아가기</a>
    </div>
  </header>
  <section class="credit-list single-source">
    <article class="credit-card source-card">
      <header><span>Source</span><h2>출처</h2></header>
      <div class="doc-content">
        ${creditBlocks}
        ${sourceHtml}
      </div>
    </article>
  </section>
</main>`;

fs.writeFileSync(path.join(root, 'credits.html'), pageShell({
  title: '화살성채 - 크레딧',
  bodyClass: 'brew-page credits-page',
  active: 'credits',
  description: '화살성채 홈브류 제작자, 고지, 출처 모음',
  content: creditsContent,
}));

console.log(`Built ${subclasses.length} subclass pages, ${raceSections.length} race pages, ${spellSections.length} spell entries, and ${creditSections.length} credit entries.`);
