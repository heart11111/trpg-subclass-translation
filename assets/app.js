(() => {
  const translatedHomebrewSpells = new Map([
    ['감시 토템 - Watch Totem', 'watch-totem'],
    ['머리카락 조종 - Animate Hair', 'animate-hair'],
    ['움직이는 오두막 - Animate Hut', 'animate-hut'],
    ['사악한 웃음 - Cackle', 'cackle'],
    ['포션 결합 - Combine Potions', 'combine-potions'],
    ['허수아비 소환 - Conjure Effigy', 'conjure-effigy'],
    ['갈망의 저주 - Curse of Craving', 'curse-of-craving'],
    ['사역마 확대 - Enlarge Familiar', 'enlarge-familiar'],
    ['불운의 문양 - Glyph of Misfortune', 'glyph-of-misfortune'],
    ['인도하는 빛 - Guiding Light', 'guiding-light'],
    ['의식 - Rite', 'rite'],
    ['고통 공유 - Share Pain', 'share-pain'],
  ]);

  const spellReferenceHref = id => {
    const path = window.location.pathname.replace(/\\/g, '/');
    const prefix = path.includes('/subclasses/') || path.includes('/races/') ? '../' : '';
    return `${prefix}spells.html#${id}`;
  };

  const splitSpellItems = text => text
    .replace(/^[\s.:。]+/, '')
    .replace(/[.。]\s*$/, '')
    .split(/\s*,\s*/)
    .map(item => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const buildSpellChips = items => {
    const list = document.createElement('div');
    list.className = 'spell-chip-list';
    items.forEach(item => {
      const linkedSpell = translatedHomebrewSpells.get(item);
      const chip = document.createElement(linkedSpell ? 'a' : 'span');
      chip.className = linkedSpell ? 'spell-chip spell-chip-homebrew' : 'spell-chip';
      if (linkedSpell) {
        chip.href = spellReferenceHref(linkedSpell);
        chip.title = '번역된 홈브류 주문 보기';
      }
      chip.textContent = item;
      list.append(chip);
    });
    return list;
  };

  const enhanceWitchSpellList = () => {
    const section = document.getElementById('위치-주문-목록---witch-spells');
    if (!section) return;
    section.classList.add('enhanced-spell-list');

    [...section.querySelectorAll(':scope > p')].forEach(paragraph => {
      const label = paragraph.querySelector(':scope > strong');
      if (!label) return;

      const itemText = [...paragraph.childNodes]
        .filter(node => node !== label)
        .map(node => node.textContent)
        .join('')
        .trim();
      const items = splitSpellItems(itemText);
      if (!items.length) return;

      const group = document.createElement('section');
      group.className = 'spell-chip-group';

      const heading = document.createElement('h5');
      heading.textContent = label.textContent.replace(/[.。]\s*$/, '');
      group.append(heading, buildSpellChips(items));
      paragraph.replaceWith(group);
    });
  };

  const enhancePsionSpellList = () => {
    const table = document.querySelector('#psion-spell-list > table');
    if (!table) return;

    table.classList.add('spell-level-table');
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      const spellCell = cells[1];
      if (!spellCell) return;

      const items = [...spellCell.querySelectorAll('code')]
        .map(code => code.textContent.trim())
        .filter(Boolean);
      if (!items.length) return;

      spellCell.replaceChildren(buildSpellChips(items));
    });
  };

  enhanceWitchSpellList();
  enhancePsionSpellList();

  const backTop = document.querySelector('#back-top');
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const tabShell = document.querySelector('.homebrew-shell[data-tabs="true"]');
  if (tabShell) {
    const tabs = [...tabShell.querySelectorAll('[data-tab]')];
    const panes = [...tabShell.querySelectorAll('[data-pane]')];
    const defaultTab = tabShell.dataset.defaultTab || tabs[0]?.dataset.tab;

    const activate = (key, updateHash = true) => {
      if (!key || !panes.some(pane => pane.dataset.pane === key)) return;
      tabShell.classList.add('tabs-ready');
      tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === key));
      panes.forEach(pane => pane.classList.toggle('active', pane.dataset.pane === key));
      if (updateHash) history.replaceState(null, '', `#${key}`);
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', event => {
        event.preventDefault();
        activate(tab.dataset.tab);
      });
    });

    const initialHash = location.hash.replace('#', '');
    const hashedPane = initialHash && document.getElementById(initialHash)?.closest('[data-pane]');
    activate(hashedPane?.dataset.pane || initialHash || defaultTab, false);
    if (initialHash && panes.some(pane => pane.dataset.pane === initialHash)) {
      const resetPaneScroll = () => window.scrollTo(0, 0);
      setTimeout(resetPaneScroll, 0);
      window.addEventListener('load', () => requestAnimationFrame(resetPaneScroll), { once: true });
    }
  }
})();
