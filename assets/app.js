(() => {
  const search = document.querySelector('#search');
  const sections = [...document.querySelectorAll('.document section.level2')];
  const navLinks = [...document.querySelectorAll('.nav-list a')];
  const noResults = document.querySelector('#no-results');
  const normalize = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

  function filterDocument() {
    const query = normalize(search.value || '');
    let visible = 0;
    sections.forEach(section => {
      const match = !query || normalize(section.textContent).includes(query);
      section.classList.toggle('hidden-by-search', !match);
      if (match) visible += 1;
    });
    navLinks.forEach(link => {
      const target = document.querySelector(link.getAttribute('href'));
      const show = !query || (target && normalize(target.textContent).includes(query));
      link.parentElement.classList.toggle('hidden-by-search', !show);
    });
    noResults.classList.toggle('visible', query && visible === 0);
  }

  search.addEventListener('input', filterDocument);
  document.querySelector('#back-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
