// Styles
import './style.css';
import 'iconify-icon';

import Fuse from 'fuse.js';

// Build search index from the server-rendered DOM
const buildItems = () =>
    [...document.querySelectorAll<HTMLElement>('.app-card')].map(el => ({
        el,
        name:     el.dataset.name ?? '',
        desc:     el.dataset.desc ?? '',
        category: el.closest<HTMLElement>('.category')?.dataset.category ?? '',
    }));

const items = buildItems();

const fuse = new Fuse(items, {
    keys: [
        { name: 'name',     weight: 3   },
        { name: 'category', weight: 1.5 },
        { name: 'desc',     weight: 1   },
    ],
    threshold:          0.15, // 0 = exact, 1 = match anything
    ignoreDiacritics:   true,
    ignoreLocation:     false,
    minMatchCharLength: 1,
});

const searchInput    = document.getElementById('search-input') as HTMLInputElement;
const searchError    = document.getElementById('search-error') as HTMLElement;
const categorySections = [...document.querySelectorAll<HTMLElement>('.category')];

const showAll = () => {
    items.forEach(({ el }) => (el.style.display = ''));
    categorySections.forEach(s => s.classList.remove('hidden'));
    searchError.hidden = true;
};

const applySearch = (q: string) => {
    if (!q) { showAll(); return; }

    const matched = new Set(fuse.search(q).map(r => r.item.el));

    items.forEach(({ el }) => {
        el.style.display = matched.has(el) ? '' : 'none';
    });

    let anyVisible = false;
    categorySections.forEach(section => {
        const hasVisible = [...section.querySelectorAll<HTMLElement>('.app-card')]
            .some(c => c.style.display !== 'none');
        section.classList.toggle('hidden', !hasVisible);
        if (hasVisible) anyVisible = true;
    });

    searchError.hidden = anyVisible;
};

searchInput.addEventListener('input', () => applySearch(searchInput.value.trim()));

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        showAll();
    }
});

document.addEventListener('keydown', e => {
    if (e.key !== '/') return;
    if (document.activeElement === searchInput) return;
    e.preventDefault();
    searchInput.focus();
});

window.addEventListener('pageshow', e => {
    if (e.persisted) {
        searchInput.value = '';
        showAll();
    }
});
