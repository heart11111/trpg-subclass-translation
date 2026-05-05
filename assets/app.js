(() => {
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
      setTimeout(() => window.scrollTo(0, 0), 0);
    }
  }
})();
