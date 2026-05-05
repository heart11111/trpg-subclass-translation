const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'source', 'subclass-translation.md');
const backgroundSourcePath = path.join(root, 'source', 'backgrounds.md');
const outDir = path.join(root, 'subclasses');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const backgroundSource = fs.existsSync(backgroundSourcePath)
  ? fs.readFileSync(backgroundSourcePath, 'utf8').replace(/\r\n/g, '\n')
  : '';
const lines = source.split('\n');
const backgroundLines = backgroundSource.split('\n');

const classArt = {
  '워록': 'assets/images/homebrew-classes/warlock.jpg',
  '파이터': 'assets/images/homebrew-classes/fighter.jpg',
  '팔라딘': 'assets/images/homebrew-classes/paladin.jpg',
  '레인저': 'assets/images/homebrew-classes/ranger.jpg',
  '드루이드': 'assets/images/homebrew-classes/druid.jpg',
  '몽크': 'assets/images/homebrew-classes/monk.jpg',
  '로그': 'assets/images/homebrew-classes/rogue.jpg',
  '바드': 'assets/images/homebrew-classes/warlock.jpg',
  '바바리안': 'assets/images/homebrew-classes/barbarian.jpg',
  '위저드': 'assets/images/homebrew-classes/wizard.jpg',
  '위치': 'assets/images/homebrew-classes/warlock.jpg',
};

const subclassArt = {
  '마녀 집회 후원자 - Coven Patron: Spin the Threads of Fate': 'assets/images/homebrew-classes/warlock.jpg',
  '진홍 갈증의 워록 - Warlock of the Crimson Thirst': 'assets/images/homebrew-classes/warlock.jpg',
  '전투 의무병 - Combat Medic': 'assets/images/homebrew-classes/fighter.jpg',
  '질풍 - Zephyr': 'assets/images/homebrew-classes/fighter.jpg',
  '약탈자 - Marauder': 'assets/images/homebrew-classes/barbarian.jpg',
  '사랑의 맹세 - Oath of Love': 'assets/images/homebrew-classes/paladin.jpg',
  '전승지기의 맹세 - Oath of the Lore-Keeper': 'assets/images/homebrew-classes/paladin.jpg',
  '슬픔의 맹세 - Oath of Sorrows': 'assets/images/homebrew-classes/paladin.jpg',
  '공허의 파수꾼 - Hollow Warden': 'assets/images/homebrew-classes/ranger.jpg',
  '감시자 - The Sentinel': 'assets/images/homebrew-classes/ranger.jpg',
  '마녀사냥꾼 - Witch-Hunter': 'assets/images/homebrew-classes/ranger.jpg',
  '괴물성의 회합 - Circle of Monstrosity': 'assets/images/homebrew-classes/druid.jpg',
  '모기의 서클 - Circle of the Mosquito': 'assets/images/homebrew-classes/druid.jpg',
  '장난의 회합 - Circle of Mischief': 'assets/images/homebrew-classes/druid.jpg',
  '파수꾼의 회합 - Circle of the Warden': 'assets/images/homebrew-classes/druid.jpg',
  '악몽의 회합 - Circle of Nightmares': 'assets/images/homebrew-classes/druid.jpg',
  '봄의 회합 - Circle of Spring': 'assets/images/homebrew-classes/druid.jpg',
  '내면의 빛의 전사 - Warrior of the Inner Light': 'assets/images/homebrew-classes/monk.jpg',
  '엑상귀네이터 로그 - Exsanguinator Rogue': 'assets/images/homebrew-classes/rogue.jpg',
  '조디악 아키타입 - Zodiac Archetype': 'assets/images/homebrew-classes/rogue.jpg',
  '펜서 - Fencer': 'assets/images/homebrew-classes/rogue.jpg',
  '사보추어 - Saboteur': 'assets/images/homebrew-classes/rogue.jpg',
  '서전 - Surgeon': 'assets/images/homebrew-classes/rogue.jpg',
  '광대 대학 - College of Fools': 'assets/images/homebrew-classes/warlock.jpg',
  '추도사 대학 - College of Eulogies': 'assets/images/homebrew-classes/warlock.jpg',
  '야전 의무병 - Field Medic': 'assets/images/homebrew-classes/fighter.jpg',
  '피로 물든 폭풍의 길 - Path of the Bloodstained Hurricane': 'assets/images/homebrew-classes/barbarian.jpg',
  '지맥술 학파 - School of Geomancy': 'assets/images/homebrew-classes/wizard.jpg',
  '전격술사 - Electromancer': 'assets/images/homebrew-classes/wizard.jpg',
  '위치 - Witch': 'assets/images/homebrew-classes/warlock.jpg',
};

const classNotes = {
  '워록': '후원자, 피의 계약, 운명의 실처럼 초자연적 대가를 중심으로 한 서브클래스입니다.',
  '파이터': '전장 역할을 명확히 바꾸는 전술형 무술 원형입니다.',
  '팔라딘': '맹세와 신조가 플레이 방향을 강하게 정하는 서약형 서브클래스입니다.',
  '레인저': '감시, 추적, 비전 위협 대응처럼 탐사와 전투 사이를 오가는 선택지입니다.',
  '드루이드': '자연의 형태를 괴수성, 계절, 악몽, 장난 같은 테마로 비트는 회합입니다.',
  '몽크': '빛과 생명력을 무술 자원으로 다루는 고기동 영적 전투가 핵심입니다.',
  '로그': '피, 별자리, 의무병처럼 전문 기술의 성격이 강한 아키타입입니다.',
  '바드': '공연, 풍자, 애도, 감정 조작을 마법과 결합하는 바드 대학입니다.',
  '바바리안': '피와 폭풍을 전투 지속력으로 바꾸는 공격적 길입니다.',
  '위저드': '학파 자체의 계산과 환경 조작이 강한 주문 사용자 선택지입니다.',
  '위치': '사역마, 주술, 포션, 달의 코븐을 중심으로 움직이는 자연 비전 계열 완전 클래스입니다.',
};

const slugOverrides = new Map([
  ['워록', 'warlock'],
  ['파이터', 'fighter'],
  ['팔라딘', 'paladin'],
  ['레인저', 'ranger'],
  ['드루이드', 'druid'],
  ['몽크', 'monk'],
  ['로그', 'rogue'],
  ['바드', 'bard'],
  ['바바리안', 'barbarian'],
  ['위저드', 'wizard'],
  ['위치', 'witch'],
  ['독사과', 'poison-apple'],
  ['아타메 반사', 'athame-reflection'],
  ['마녀 집회 후원자 - Coven Patron: Spin the Threads of Fate', 'coven-patron'],
  ['진홍 갈증의 워록 - Warlock of the Crimson Thirst', 'crimson-thirst-warlock'],
  ['전투 의무병 - Combat Medic', 'combat-medic'],
  ['질풍 - Zephyr', 'zephyr'],
  ['약탈자 - Marauder', 'marauder'],
  ['사랑의 맹세 - Oath of Love', 'oath-of-love'],
  ['전승지기의 맹세 - Oath of the Lore-Keeper', 'oath-of-the-lore-keeper'],
  ['슬픔의 맹세 - Oath of Sorrows', 'oath-of-sorrows'],
  ['공허의 파수꾼 - Hollow Warden', 'hollow-warden'],
  ['감시자 - The Sentinel', 'sentinel'],
  ['마녀사냥꾼 - Witch-Hunter', 'witch-hunter'],
  ['괴물성의 회합 - Circle of Monstrosity', 'circle-of-monstrosity'],
  ['모기의 서클 - Circle of the Mosquito', 'circle-of-the-mosquito'],
  ['장난의 회합 - Circle of Mischief', 'circle-of-mischief'],
  ['파수꾼의 회합 - Circle of the Warden', 'circle-of-the-warden'],
  ['악몽의 회합 - Circle of Nightmares', 'circle-of-nightmares'],
  ['봄의 회합 - Circle of Spring', 'circle-of-spring'],
  ['내면의 빛의 전사 - Warrior of the Inner Light', 'warrior-of-the-inner-light'],
  ['엑상귀네이터 로그 - Exsanguinator Rogue', 'exsanguinator-rogue'],
  ['조디악 아키타입 - Zodiac Archetype', 'zodiac-archetype'],
  ['펜서 - Fencer', 'fencer'],
  ['사보추어 - Saboteur', 'saboteur'],
  ['서전 - Surgeon', 'surgeon'],
  ['광대 대학 - College of Fools', 'college-of-fools'],
  ['추도사 대학 - College of Eulogies', 'college-of-eulogies'],
  ['스워시버클러 - Swashbuckler (2024)', 'swashbuckler-2024'],
  ['야전 의무병 - Field Medic', 'field-medic'],
  ['피로 물든 폭풍의 길 - Path of the Bloodstained Hurricane', 'path-of-the-bloodstained-hurricane'],
  ['지옥불의 길 - Path of the Inferno', 'path-of-the-inferno'],
  ['라이칸의 길 - Path of the Lycan', 'path-of-the-lycan'],
  ['돌연변이의 길 - Path of the Mutant', 'path-of-the-mutant'],
  ['지맥술 학파 - School of Geomancy', 'school-of-geomancy'],
  ['전격술사 - Electromancer', 'electromancer'],
  ['위치 - Witch', 'witch'],
]);

const removedSubclassTitles = new Set([
  '공허의 파수꾼 - Hollow Warden',
  '마녀사냥꾼 - Witch-Hunter',
  '악몽의 회합 - Circle of Nightmares',
  '장난의 회합 - Circle of Mischief',
  '야전 의무병 - Field Medic',
  '약탈자 - Marauder',
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
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

function mdToHtml(markdown) {
  const result = spawnSync('pandoc', ['-f', 'gfm', '-t', 'html', '--section-divs'], {
    input: markdown,
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || 'pandoc failed');
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
    ['credits.html', '크레딧', 'credits'],
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
`;
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
  return `<article id="${spell.slug}" class="dndb-spell spell-dndb-card">
    <header class="dndb-spell-head spell-dndb-head">
      <p class="spell-source">${escapeHtml(spell.className)} · <a href="subclasses/${spell.sourceSlug}.html">${escapeHtml(sourceName)}</a></p>
      <h2>${escapeHtml(displayName(parsed.title))}</h2>
    </header>
    <dl class="spell-stats spell-dndb-stats">
      <div><dt>LEVEL</dt><dd>${escapeHtml(parsed.level)}</dd></div>
      <div><dt>CASTING TIME</dt><dd>${escapeHtml(parsed.meta['시전 시간'] || '-')}</dd></div>
      <div><dt>RANGE/AREA</dt><dd>${escapeHtml(parsed.meta['사거리'] || '-')}</dd></div>
      <div><dt>COMPONENTS</dt><dd>${escapeHtml(parsed.meta['구성요소'] || '-')}</dd></div>
      <div><dt>DURATION</dt><dd>${escapeHtml(parsed.meta['지속시간'] || '-')}</dd></div>
      <div><dt>SCHOOL</dt><dd>${escapeHtml(parsed.school)}</dd></div>
      <div><dt>ATTACK/SAVE</dt><dd>${escapeHtml(parsed.attackSave)}</dd></div>
      <div><dt>DAMAGE/EFFECT</dt><dd>${escapeHtml(parsed.damageEffect)}</dd></div>
    </dl>
    <div class="spell-body doc-content">${bodyHtml}</div>
    <footer class="spell-available"><span>사용 가능 클래스</span>${availableFor.split(/,\s*/).map(item => `<strong>${escapeHtml(item)}</strong>`).join('')}</footer>
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

function backgroundCardHtml(background) {
  const parsed = parseBackground(background);
  const { ko, en } = titleParts(background.title);
  const bodyHtml = enhanceRuleHtml(mdToHtml(parsed.body || ''));
  const stats = ['능력치', '재주', '기술 숙련', '도구 숙련', '장비'];
  return `<article id="${escapeHtml(background.slug)}" class="dndb-spell background-entry">
    <header class="dndb-spell-head background-head">
      <div>
        <p class="spell-source">BACKGROUND · 2024 구조</p>
        <h2>${escapeHtml(ko)}</h2>
        ${en ? `<p class="spell-subtitle">${escapeHtml(en)}</p>` : ''}
      </div>
    </header>
    <dl class="spell-stats background-stats">
      ${stats.map(label => `<div><dt>${label}</dt><dd>${escapeHtml(parsed.meta[label] || '-')}</dd></div>`).join('')}
    </dl>
    <div class="spell-body doc-content background-body">${bodyHtml}</div>
  </article>`;
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
    .replace(/<section id="([^"]+)" class="level4">\s*<h4>([\s\S]*?)<\/h4>/g, '<section id="$1" class="level4 feature-block"><h4>$2</h4>');
}

function synopsis(markdownLines) {
  const paragraph = markdownLines
    .filter(line => line && !/^#|^\||^-|^---/.test(line))
    .find(line => /[가-힣]/.test(line));
  return paragraph ? paragraph.replace(/\*\*/g, '').slice(0, 115) : '번역문과 플레이용 룰 검토를 함께 정리한 서브클래스입니다.';
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
  return `<a class="brew-card" href="subclasses/${subclass.slug}.html">
    <span class="brew-card-kicker">${escapeHtml(subclass.className)} · ${escapeHtml(badgeFor(subclass))}</span>
    <strong>${escapeHtml(ko)}</strong>
    ${en ? `<em>${escapeHtml(en)}</em>` : ''}
    <p>${escapeHtml(synopsis(subclass.lines))}</p>
  </a>`;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const byClass = new Map();
for (const subclass of subclasses) {
  if (!byClass.has(subclass.className)) byClass.set(subclass.className, []);
  byClass.get(subclass.className).push(subclass);
}
const backgroundSections = parseBackgroundSections();
const classDocuments = subclasses.filter(item => documentKind(item) === 'CLASS');
const subclassDocuments = subclasses.filter(item => documentKind(item) === 'SUBCLASS');
const originFeats = new Set(backgroundSections.map(item => parseBackground(item).meta['재주']).filter(Boolean));

const homebrewCategoryLinks = [
  ['#classes', '클래스', classDocuments.length],
  ['#subclasses', '서브클래스', subclassDocuments.length],
  ['#races', '종족', 0],
  ['#feats', '피트', originFeats.size],
  ['backgrounds.html', '백그라운드', backgroundSections.length],
  ['spells.html', '주문', spellSections.length],
];

function homebrewSubnav(active = '서브클래스', inHomebrewIndex = false) {
  return `<nav class="homebrew-subnav" aria-label="홈브류 분류">
    ${homebrewCategoryLinks.map(([href, label, count]) => {
      const resolvedHref = inHomebrewIndex || !href.startsWith('#') ? href : `homebrew.html${href}`;
      return `<a${label === active ? ' class="active"' : ''} href="${resolvedHref}"><span>${label}</span><strong>${count}</strong></a>`;
    }).join('')}
  </nav>`;
}

for (const subclass of subclasses) {
  const { ko, en } = titleParts(subclass.title);
  const kind = documentKind(subclass);
  const related = byClass.get(subclass.className).filter(item => item.slug !== subclass.slug).slice(0, 5);
  const bodyHtml = enhanceRuleHtml(mdToHtml(subclass.lines.join('\n')));
  const headings = extractHtmlHeadings(bodyHtml);
  const content = `<main id="top" class="brew-detail">
  <header class="brew-detail-hero">
    <div class="brew-hero-copy">
      <a class="crumb-link" href="../homebrew.html">홈브류 목록</a>
      <p class="eyebrow">${escapeHtml(subclass.className)} ${kind}</p>
      <h1>${escapeHtml(ko)}</h1>
      ${en ? `<p class="brew-en">${escapeHtml(en)}</p>` : ''}
      <p class="brew-lede">${escapeHtml(synopsis(subclass.lines))}</p>
      <div class="brew-meta-row">
        <span>${escapeHtml(badgeFor(subclass))}</span>
        <span>2024 구조</span>
        <span>번역 본문</span>
      </div>
    </div>
    <figure class="brew-art-frame">
      <img src="../${artPathFor(subclass.className, '', subclass.title)}" alt="${escapeHtml(ko)} 분위기 이미지">
    </figure>
  </header>
  <div class="brew-reading-grid">
    <aside class="brew-side">
      <div class="brew-side-box">
        <p class="side-label">빠른 목차</p>
        ${headings.length ? `<ol>${headings.map(item => `<li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.title)}</a></li>`).join('')}</ol>` : '<p>본문 기능을 순서대로 읽으면 됩니다.</p>'}
      </div>
      ${spellSections.some(spell => spell.sourceSlug === subclass.slug) ? `<a class="side-action" href="../spells.html">관련 주문 보기</a>` : ''}
      ${related.length ? `<div class="brew-side-box">
        <p class="side-label">같은 클래스</p>
        ${related.map(item => `<a class="side-link" href="${item.slug}.html">${escapeHtml(titleParts(item.title).ko)}</a>`).join('')}
      </div>` : ''}
    </aside>
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

const classSectionsHtml = [...byClass.entries()].map(([className, items], index) => {
  return `<section id="${slugify(className)}" class="brew-class-section" style="--i:${index}">
    <div class="brew-class-head">
      <div>
        <span class="section-number">${String(index + 1).padStart(2, '0')}</span>
        <h2>${escapeHtml(className)}</h2>
        <p>${escapeHtml(classNotes[className] || '클래스별 서브클래스 번역과 운용 메모입니다.')}</p>
      </div>
      <img src="${artPathFor(className)}" alt="${escapeHtml(className)} 분위기 이미지">
    </div>
    <div class="brew-card-grid">${items.map(subclassCard).join('\n')}</div>
  </section>`;
}).join('\n');

const homeContent = `<main id="top" class="brew-index">
  <header class="brew-index-hero">
    <div>
      <p class="eyebrow">DUNGEONS & DRAGONS 2024</p>
      <h1>홈브류 자료실</h1>
      <p class="brew-lede">홈브류는 클래스, 서브클래스, 종족, 피트, 백그라운드, 주문으로 나눠 관리합니다. 각 문서는 플레이 중 바로 읽을 수 있도록 규칙 표와 본문을 분리했습니다.</p>
    </div>
    <div class="brew-index-panel">
      <span>${classDocuments.length}</span>
      <strong>클래스</strong>
      <span>${subclassDocuments.length}</span>
      <strong>서브클래스</strong>
      <span>${spellSections.length}</span>
      <strong>주문</strong>
      <span>${backgroundSections.length}</span>
      <strong>백그라운드</strong>
      <a href="spells.html">주문 보기</a>
    </div>
  </header>
  ${homebrewSubnav('서브클래스', true)}
  <nav class="brew-toc" aria-label="홈브류 목차">
    <a href="#classes">클래스</a>
    <a href="#subclasses">서브클래스 전체</a>
    ${[...byClass.keys()].map(className => `<a href="#${slugify(className)}">${escapeHtml(className)}</a>`).join('')}
    <a href="backgrounds.html">백그라운드</a>
    <a href="spells.html">주문</a>
    <a href="credits.html">크레딧</a>
  </nav>
  <section id="classes" class="brew-directory">
    <section class="brew-class-section">
      <div class="brew-class-head">
        <div>
          <span class="section-number">00</span>
          <h2>클래스</h2>
          <p>완전 클래스 문서입니다. 현재는 위치 - Witch를 별도 클래스 문서로 관리합니다.</p>
        </div>
        <img src="${artPathFor('위치')}" alt="클래스 분위기 이미지">
      </div>
      <div class="brew-card-grid">${classDocuments.map(subclassCard).join('\n') || '<p class="empty-note">등록된 클래스가 없습니다.</p>'}</div>
    </section>
  </section>
  <section id="races" class="brew-directory">
    <section class="brew-class-section compact-section">
      <div class="brew-class-head">
        <div>
          <span class="section-number">R</span>
          <h2>종족</h2>
          <p>현재 등록된 홈브류 종족은 없습니다. 추가되면 이 분류에 모읍니다.</p>
        </div>
      </div>
    </section>
  </section>
  <section id="feats" class="brew-directory">
    <section class="brew-class-section compact-section">
      <div class="brew-class-head">
        <div>
          <span class="section-number">F</span>
          <h2>피트</h2>
          <p>백그라운드에 포함된 출신 재주입니다. 세부 규칙은 백그라운드 페이지의 해당 항목에 함께 정리했습니다.</p>
        </div>
      </div>
      <div class="brew-mini-list">${[...originFeats].map(feat => `<span>${escapeHtml(feat)}</span>`).join('')}</div>
    </section>
  </section>
  <section id="subclasses" class="brew-directory">
    ${classSectionsHtml}
  </section>
  <section class="credits-teaser">
    <p>제작자, 제작 도구, 원문 링크, 고지 문구는 본문에서 분리했습니다.</p>
    <a href="credits.html">크레딧 보기</a>
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
  ${homebrewSubnav('주문')}
  <nav class="brew-toc" aria-label="주문 목차">
    ${spellSections.map(spell => `<a href="#${spell.slug}">${escapeHtml(displayName(spell.title))}</a>`).join('')}
  </nav>
  <section class="spell-list">
    ${spellCards || '<p class="empty-note">분리된 신규 주문이 없습니다.</p>'}
  </section>
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
      <span>${new Set(backgroundSections.map(item => parseBackground(item).meta['재주']).filter(Boolean)).size}</span>
      <strong>출신 재주</strong>
      <a href="homebrew.html">홈브류로 돌아가기</a>
    </div>
  </header>
  ${homebrewSubnav('백그라운드')}
  <nav class="brew-toc" aria-label="백그라운드 목차">
    ${backgroundSections.map(background => `<a href="#${background.slug}">${escapeHtml(displayName(background.title))}</a>`).join('')}
  </nav>
  <section class="background-list">
    ${backgroundCards || '<p class="empty-note">등록된 백그라운드가 없습니다.</p>'}
  </section>
  ${backgroundCreditHtml ? `<section class="background-credits credit-card source-card">
    <header><span>Attribution</span><h2>백그라운드 크레딧</h2></header>
    <div class="doc-content">${backgroundCreditHtml}</div>
  </section>` : ''}
</main>`;

fs.writeFileSync(path.join(root, 'backgrounds.html'), pageShell({
  title: '화살성채 - 백그라운드',
  bodyClass: 'brew-page backgrounds-page',
  active: 'homebrew',
  description: '화살성채 캠페인 홈브류 백그라운드 모음',
  content: backgroundsContent,
}));

const creditCards = creditSections.map(section => {
  const html = mdToHtml(section.lines.join('\n'));
  return `<article class="credit-card">
    <header>
      <span>${escapeHtml(section.className)}</span>
      <h2><a href="subclasses/${section.slug}.html">${escapeHtml(titleParts(section.title).ko)}</a></h2>
    </header>
    <div class="doc-content">${html}</div>
  </article>`;
}).join('\n');

const creditsContent = `<main id="top" class="credits-index">
  <header class="brew-index-hero">
    <div>
      <p class="eyebrow">ATTRIBUTION</p>
      <h1>크레딧</h1>
      <p class="brew-lede">개별 서브클래스 본문에 흩어져 있던 제작자, 제작 도구, 고지, 원문 출처를 한곳으로 모았습니다. 플레이 중 읽기 흐름을 끊는 정보는 이 페이지에서만 확인하면 됩니다.</p>
    </div>
    <div class="brew-index-panel">
      <span>${creditSections.length}</span>
      <strong>크레딧 항목</strong>
      <span>${sourceLines.length ? 1 : 0}</span>
      <strong>출처 묶음</strong>
      <a href="homebrew.html">홈브류로 돌아가기</a>
    </div>
  </header>
  <section class="credit-list">
    ${creditCards}
    <article class="credit-card source-card">
      <header><span>Source</span><h2>출처</h2></header>
      <div class="doc-content">${sourceHtml}</div>
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

console.log(`Built ${subclasses.length} subclass pages, ${spellSections.length} spell entries, and ${creditSections.length} credit entries.`);
