// fizzwizzledazzle - pixel portfolio

interface ProjectLinks {
  site: string | null;
  repo: string | null;
}

interface Project {
  name: string;
  kind: string;
  tagline: string;
  description: string;
  stack: string[];
  links: ProjectLinks;
}

interface PaletteItem {
  label: string;
  hint: string;
  kind?: string;
  keywords: string;
  run: () => void;
}

const ROLE = 'systems & tools developer';

const TICKER = [
  'rust', 'c', 'c++', 'typescript', 'webassembly', 'bevy', 'ecs', 'gpu',
  'wgpu', 'cuda', 'rayon', 'sdl3', 'flecs', 'box2d', 'nnue', 'uci',
  'pytorch', 'java', 'html', 'css', 'ufbx',
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- small dom helper ----

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function anchor(href: string, className: string, text: string): HTMLAnchorElement {
  const a = el('a', className, text);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
}

function openUrl(url: string): void {
  window.open(url, '_blank', 'noopener');
}

// ---- toast ----

let toastTimer = 0;
function toast(message: string): void {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  node.setAttribute('aria-hidden', 'false');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    node.classList.remove('show');
    node.setAttribute('aria-hidden', 'true');
  }, 2600);
}

// ---- hero bits ----

function typewriter(target: HTMLElement, text: string, done?: () => void): void {
  if (reduceMotion) {
    target.textContent = text;
    done?.();
    return;
  }
  let i = 0;
  const tick = (): void => {
    target.textContent = text.slice(0, i);
    if (i <= text.length) {
      i += 1;
      setTimeout(tick, 45);
    } else {
      done?.();
    }
  };
  tick();
}

function startClock(): void {
  const clock = document.getElementById('clock');
  if (!clock) return;
  const pad = (n: number): string => String(n).padStart(2, '0');
  const tick = (): void => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

function buildTicker(): void {
  const track = document.getElementById('ticker');
  if (!track) return;
  const tokens = [...TICKER, ...TICKER];
  for (const t of tokens) track.append(el('span', undefined, t));
}

// ---- boot sequence ----

const BOOT_LINES = [
  'booting fwd-os v4.8 ...',
  'mounting /projects ......... [ok]',
  'loading rust toolchain ..... [ok]',
  'linking c++ runtime ........ [ok]',
  'spawning pixels ............ [ok]',
  'ready.',
];

function runBoot(after: () => void): void {
  const boot = document.getElementById('boot');
  const log = document.getElementById('bootlog');
  const seen = sessionStorage.getItem('booted') === '1';

  if (!boot || !log || reduceMotion || seen) {
    boot?.setAttribute('hidden', '');
    after();
    return;
  }

  let finished = false;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('booted', '1');
    boot.classList.add('done');
    setTimeout(() => boot.setAttribute('hidden', ''), 400);
    after();
  };

  // Let the user skip the boot.
  boot.addEventListener('click', finish);
  const skip = (e: KeyboardEvent): void => {
    e.preventDefault();
    finish();
    document.removeEventListener('keydown', skip);
  };
  document.addEventListener('keydown', skip);

  let line = 0;
  let col = 0;
  const type = (): void => {
    if (finished) return;
    if (line >= BOOT_LINES.length) {
      setTimeout(finish, 350);
      return;
    }
    const text = BOOT_LINES[line];
    log.textContent = BOOT_LINES.slice(0, line).join('\n') + (line ? '\n' : '') + text.slice(0, col);
    if (col < text.length) {
      col += 1;
      setTimeout(type, 14);
    } else {
      line += 1;
      col = 0;
      setTimeout(type, 120);
    }
  };
  type();
}

// ---- pixel rain (konami) ----

const RAIN_GLYPHS = '01<>/{}[]#*+=';
function pixelRain(): void {
  if (reduceMotion) return;
  const count = 44;
  for (let i = 0; i < count; i++) {
    const drop = el('span', 'rain', RAIN_GLYPHS[i % RAIN_GLYPHS.length]);
    drop.style.left = `${(i / count) * 100}%`;
    const dur = 2 + (i % 7) * 0.4;
    drop.style.animationDuration = `${dur}s`;
    drop.style.animationDelay = `${(i % 11) * 0.12}s`;
    document.body.append(drop);
    setTimeout(() => drop.remove(), (dur + 1.5) * 1000);
  }
}

function toggleAmber(): void {
  const on = document.documentElement.classList.toggle('amber');
  toast(on ? 'konami accepted :: amber crt' : 'back to cool');
}

function setupKonami(): void {
  const seq = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
  ];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === seq[pos] ? pos + 1 : (key === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      toggleAmber();
      pixelRain();
    }
  });
}

// ---- project modal ----

let lastFocus: HTMLElement | null = null;

function stackEls(p: Project): HTMLElement {
  const stack = el('div', 'stack');
  for (const tech of p.stack) stack.append(el('span', 'chip', tech));
  return stack;
}

function linkEls(p: Project): HTMLAnchorElement[] {
  const out: HTMLAnchorElement[] = [];
  if (p.links.repo) out.push(anchor(p.links.repo, 'plink primary', 'code >'));
  if (p.links.site) out.push(anchor(p.links.site, 'plink', 'live >'));
  return out;
}

function setupModal(): (p: Project) => void {
  const modal = document.getElementById('modal');
  const box = document.getElementById('modalBox');
  const file = document.getElementById('modalFile');
  const body = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalClose');

  const close = (): void => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  const open = (p: Project): void => {
    if (!modal || !box || !file || !body) return;
    lastFocus = document.activeElement as HTMLElement;
    box.className = `modal-box k-${p.kind}`;
    file.textContent = `${p.name.toLowerCase()}.md`;

    body.replaceChildren();
    const head = el('div', 'm-head');
    head.append(el('h3', undefined, p.name), el('span', 'badge', p.kind));
    body.append(head);
    body.append(el('p', 'modal-desc', p.description));
    body.append(stackEls(p));

    const links = el('div', 'card-links');
    for (const a of linkEls(p)) links.append(a);
    body.append(links);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) close();
  });

  return open;
}

// ---- cards ----

function projectCard(p: Project, index: number, open: (p: Project) => void): HTMLElement {
  const card = el('article', `card k-${p.kind}`);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${p.name} - details`);
  if (!reduceMotion) card.classList.add('pre');

  const head = el('div', 'card-head');
  head.append(el('h3', undefined, p.name), el('span', 'badge', p.kind));
  card.append(head);

  card.append(el('p', 'tagline', p.tagline));
  card.append(stackEls(p));

  const links = el('div', 'card-links');
  for (const a of linkEls(p)) {
    a.addEventListener('click', (e) => e.stopPropagation());
    links.append(a);
  }
  card.append(links);

  card.addEventListener('click', () => open(p));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(p);
    }
  });

  if (!reduceMotion) {
    setTimeout(() => card.classList.remove('pre'), 90 * index + 120);
  }

  return card;
}

// ---- command palette ----

function setupPalette(projects: Project[], open: (p: Project) => void): void {
  const palette = document.getElementById('palette');
  const input = document.getElementById('paletteInput') as HTMLInputElement | null;
  const list = document.getElementById('paletteList');
  const trigger = document.getElementById('paletteTrigger');
  if (!palette || !input || !list) return;

  const items: PaletteItem[] = [];
  for (const p of projects) {
    items.push({
      label: `open ${p.name}`,
      hint: p.kind,
      kind: p.kind,
      keywords: `${p.name} ${p.kind} ${p.tagline} ${p.stack.join(' ')}`.toLowerCase(),
      run: () => open(p),
    });
  }
  items.push(
    { label: 'github profile', hint: 'link', keywords: 'github profile code', run: () => openUrl('https://github.com/FizzWizZleDazzle') },
    { label: 'email me', hint: 'contact', keywords: 'email contact hello mail', run: () => { window.location.href = 'mailto:hello@fizzwizzledazzle.dev'; } },
    { label: 'view source', hint: 'link', keywords: 'source repo site code', run: () => openUrl('https://github.com/FizzWizZleDazzle/FizzWizZleDazzle') },
    { label: 'toggle amber crt', hint: 'theme', keywords: 'amber theme crt color konami', run: () => toggleAmber() },
  );

  let filtered: PaletteItem[] = items;
  let active = 0;

  const render = (): void => {
    list.replaceChildren();
    if (filtered.length === 0) {
      list.append(el('li', 'palette-empty', 'no matches'));
      return;
    }
    filtered.forEach((it, i) => {
      const li = el('li', `palette-item${i === active ? ' active' : ''}`);
      if (it.kind) li.classList.add(`k-${it.kind}`);
      if (it.kind) li.append(el('span', 'p-kind', it.kind));
      li.append(el('span', 'p-name', it.label), el('span', 'p-desc', it.hint));
      li.addEventListener('click', () => { run(it); });
      li.addEventListener('mousemove', () => { active = i; paint(); });
      list.append(li);
    });
  };

  const paint = (): void => {
    [...list.children].forEach((c, i) => c.classList.toggle('active', i === active));
  };

  const filter = (q: string): void => {
    const query = q.trim().toLowerCase();
    filtered = query
      ? items.filter((it) => it.keywords.includes(query) || it.label.toLowerCase().includes(query))
      : items;
    active = 0;
    render();
  };

  const close = (): void => {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openPalette = (): void => {
    input.value = '';
    filter('');
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 0);
  };

  const run = (it: PaletteItem): void => {
    close();
    it.run();
  };

  input.addEventListener('input', () => filter(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = Math.min(active + 1, filtered.length - 1);
      paint();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      paint();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === 'Escape') {
      close();
    }
  });

  palette.addEventListener('click', (e) => {
    if (e.target === palette) close();
  });
  trigger?.addEventListener('click', openPalette);

  document.addEventListener('keydown', (e) => {
    const typing = document.activeElement instanceof HTMLInputElement;
    const isOpen = palette.classList.contains('open');
    if (!isOpen && !typing && e.key === '/') {
      e.preventDefault();
      openPalette();
    } else if (!isOpen && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
  });
}

// ---- data + boot ----

async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch('projects.json');
    return (await res.json()) as Project[];
  } catch (err) {
    console.error('Failed to load projects:', err);
    return [];
  }
}

async function main(): Promise<void> {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  startClock();
  buildTicker();
  setupKonami();

  const open = setupModal();
  const projects = await loadProjects();

  const grid = document.getElementById('grid');
  if (grid) projects.forEach((p, i) => grid.append(projectCard(p, i, open)));

  setupPalette(projects, open);

  runBoot(() => {
    const role = document.getElementById('role');
    if (role) typewriter(role, ROLE);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  void main();
});
