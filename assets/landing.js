/* Arrowkeep cinematic landing — deterministic scroll timeline.
   Local scroll progress p (0..1) over the pinned stage drives CSS
   custom properties; CSS owns the final transforms. Static fallback
   (html.lp-static / no lp-js) keeps every beat readable in flow. */
(() => {
  const root = document.documentElement;
  const section = document.querySelector('.cinema');
  const stage = section && section.querySelector('.stage');
  if (!section || !stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');

  if (reduced.matches) {
    root.classList.add('lp-static');
    initCatalog();
    return;
  }

  root.classList.add('lp-js');

  /* ---------- timeline configuration ---------- */
  const BEAT = {
    introExit: [0.03, 0.16],
    pushIn: [0.10, 0.40],
    fgSplit: [0.15, 0.42],
    fgFade: [0.34, 0.43],
    narA: { in: [0.21, 0.27], out: [0.35, 0.42] },
    reveal: [0.36, 0.44],
    refocus: [0.38, 0.455],
    narB: { in: [0.48, 0.56], out: [0.69, 0.74] },
    catalog: [0.75, 0.93],
    controls: [0.91, 1.0],
  };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = t => t * t * (3 - 2 * t);
  // eased 0..1 progress across a [start, end] range
  const seg = (p, [a, b]) => smoothstep(clamp((p - a) / (b - a), 0, 1));

  /* ---------- state ---------- */
  let sectionTop = 0;
  let travel = 1;
  let target = 0;      // where the scrollbar says we are
  let playhead = -1;   // smoothed visual position (-1 forces first paint)
  let mxT = 0, myT = 0; // pointer target
  let mx = 0, my = 0;   // smoothed pointer
  let frameQueued = false;

  const measure = () => {
    const vh = window.innerHeight;
    travel = clamp(Math.round(vh * 4.2), 2600, 4600);
    section.style.setProperty('--travel', travel + 'px');
    sectionTop = section.getBoundingClientRect().top + window.scrollY;
    readScroll();
  };

  const readScroll = () => {
    target = clamp((window.scrollY - sectionTop) / travel, 0, 1);
    queueFrame();
  };

  const queueFrame = () => {
    if (!frameQueued) {
      frameQueued = true;
      requestAnimationFrame(tick);
    }
  };

  const setProps = p => {
    const introOut = seg(p, BEAT.introExit);
    const push = seg(p, BEAT.pushIn);
    const split = seg(p, BEAT.fgSplit);
    const fgGone = seg(p, BEAT.fgFade);
    const naOp = seg(p, BEAT.narA.in) - seg(p, BEAT.narA.out);
    const reveal = seg(p, BEAT.reveal);
    const refocus = seg(p, BEAT.refocus);
    const nbFocus = seg(p, BEAT.narB.in) - seg(p, BEAT.narB.out);
    const catIn = seg(p, BEAT.catalog);
    const ctl = seg(p, BEAT.controls);

    const s = stage.style;
    s.setProperty('--intro-op', (1 - introOut).toFixed(3));
    s.setProperty('--intro-y', (introOut * -56).toFixed(1) + 'px');

    s.setProperty('--sky-scale', (1 + push * 0.16).toFixed(4));
    s.setProperty('--sky-y', (push * -3.5).toFixed(2) + 'vh');
    s.setProperty('--sky-op', (1 - reveal).toFixed(3));

    s.setProperty('--fg-split', split.toFixed(4));
    s.setProperty('--fg-op', (1 - fgGone).toFixed(3));

    s.setProperty('--na-op', naOp.toFixed(3));
    s.setProperty('--na-y', ((1 - seg(p, BEAT.narA.in)) * 26 - seg(p, BEAT.narA.out) * 26).toFixed(1) + 'px');

    s.setProperty('--pano-op', reveal.toFixed(3));
    s.setProperty('--pano-scale', (1.08 - refocus * 0.06 + catIn * 0.03).toFixed(4));
    s.setProperty('--pano-blur', (8 * (1 - refocus) + 3.5 * nbFocus + 2.5 * catIn).toFixed(2) + 'px');

    s.setProperty('--nb-op', nbFocus.toFixed(3));
    s.setProperty('--nb-y', ((1 - seg(p, BEAT.narB.in)) * 26 - seg(p, BEAT.narB.out) * 26).toFixed(1) + 'px');

    s.setProperty('--dim', (0.12 * push * (1 - reveal) + 0.28 * nbFocus + 0.42 * catIn).toFixed(3));

    s.setProperty('--cat-x', ((1 - catIn) * 110).toFixed(2) + '%');
    s.setProperty('--cat-op', seg(p, [BEAT.catalog[0], BEAT.catalog[0] + 0.08]).toFixed(3));
    s.setProperty('--ctl-op', ctl.toFixed(3));

    s.setProperty('--mx', mx.toFixed(3));
    s.setProperty('--my', my.toFixed(3));

    // keep hidden beats out of the accessibility tree / hit-testing
    toggleBeat('.intro', 1 - introOut > 0.02);
    toggleBeat('.nar-a', naOp > 0.02);
    toggleBeat('.nar-b', nbFocus > 0.02);
    toggleBeat('.catalog', catIn > 0.02);
  };

  const beatCache = {};
  const toggleBeat = (sel, visible) => {
    const el = beatCache[sel] || (beatCache[sel] = stage.querySelector(sel));
    if (!el) return;
    if (visible) {
      el.removeAttribute('hidden-beat');
      el.removeAttribute('inert');
    } else {
      el.setAttribute('hidden-beat', '');
      el.setAttribute('inert', '');
    }
  };

  const tick = () => {
    frameQueued = false;
    playhead = playhead < 0 ? target : playhead + (target - playhead) * 0.16;
    mx += (mxT - mx) * 0.08;
    my += (myT - my) * 0.08;

    setProps(playhead);

    const settled =
      Math.abs(target - playhead) < 0.0006 &&
      Math.abs(mxT - mx) < 0.002 && Math.abs(myT - my) < 0.002;
    if (!settled) queueFrame();
    else playhead = target;
  };

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });

  if (!coarse.matches) {
    window.addEventListener('pointermove', e => {
      mxT = (e.clientX / window.innerWidth - 0.5) * 2;
      myT = (e.clientY / window.innerHeight - 0.5) * 2;
      queueFrame();
    }, { passive: true });
  }

  measure();
  initCatalog();

  /* ---------- catalog rail ---------- */
  function initCatalog() {
    const rail = document.querySelector('.cat-rail');
    if (!rail) return;
    const status = document.querySelector('.cat-status');
    const items = rail.querySelectorAll('li');

    const step = () => {
      const first = items[0];
      if (!first) return rail.clientWidth;
      return first.getBoundingClientRect().width + 14;
    };

    const move = dir => {
      rail.scrollBy({ left: dir * step(), behavior: reduced.matches ? 'auto' : 'smooth' });
    };

    document.querySelector('.cat-prev')?.addEventListener('click', () => move(-1));
    document.querySelector('.cat-next')?.addEventListener('click', () => move(1));

    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
    });

    if (status) {
      let t;
      rail.addEventListener('scroll', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const i = Math.round(rail.scrollLeft / step()) + 1;
          status.textContent = Math.min(i, items.length) + ' / ' + items.length;
        }, 140);
      }, { passive: true });
    }
  }
})();
