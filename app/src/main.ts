// Styles
import './style.css';
import '@fontsource-variable/inter';
import 'iconify-icon';

import Fuse from 'fuse.js';

// Two-panel search architecture:
//   #apps-grouped:  the normal category layout; never modified by search
//   #apps-search:   a flat grid shown only during active search
//
// When a query is typed, Fuse returns results sorted by relevance. We clone
// the matching cards (in that order) into #apps-search and hide #apps-grouped.
// On clear, #apps-search is emptied and #apps-grouped is shown again.
// Using clones means the source cards are always in their original position,
// making restore trivial (no tracking of original parents needed).

// Search index — built once from the server-rendered DOM.
// category is read from the nearest ancestor .category[data-category].
interface AppCard {
    el:       HTMLElement;
    name:     string;
    desc:     string;
    category: string;
}

const items: AppCard[] = [...document.querySelectorAll<HTMLElement>('.app-card')].map(el => ({
    el,
    name:     el.dataset.name ?? '',
    desc:     el.dataset.desc ?? '',
    category: el.closest<HTMLElement>('.category')?.dataset.category ?? '',
}));

const fuse = new Fuse(items, {
    keys: [
        { name: 'name',     weight: 3   },
        { name: 'category', weight: 1.5 },
        { name: 'desc',     weight: 1   },
    ],
    threshold:          0.15,
    ignoreDiacritics:   true,
    ignoreLocation:     false,
    minMatchCharLength: 1,
});

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchError = document.getElementById('search-error') as HTMLElement;
const appsGrouped = document.getElementById('apps-grouped') as HTMLElement;
const appsSearch  = document.getElementById('apps-search')  as HTMLElement;

/** Empty the search panel and restore the grouped category layout. */
const clearSearch = () => {
    appsSearch.replaceChildren();
    appsSearch.hidden  = true;
    appsGrouped.hidden = false;
    searchError.hidden = true;
    document.body.classList.remove('is-searching');
};

/** Run a Fuse query and populate #apps-search with relevance-ranked card clones. */
const applySearch = (q: string) => {
    if (!q) { clearSearch(); return; }

    const results = fuse.search(q);

    // cloneNode(true) copies the full subtree (icon, name, desc, badge).
    // body.is-searching makes .cat-badge visible via CSS so users can see
    // which category each result belongs to without category headers.
    appsSearch.replaceChildren(...results.map(r => r.item.el.cloneNode(true)));

    const anyMatched = results.length > 0;
    appsSearch.hidden  = !anyMatched;
    appsGrouped.hidden = true;
    searchError.hidden = anyMatched;
    document.body.classList.add('is-searching');
};

searchInput.addEventListener('input', () => applySearch(searchInput.value.trim()));

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        clearSearch();
        return;
    }
    // Enter opens the top-ranked result directly.
    if (e.key === 'Enter' && document.body.classList.contains('is-searching')) {
        const first = appsSearch.querySelector<HTMLAnchorElement>('.app-card');
        if (first) first.click();
    }
});

// Press / from anywhere on the page to jump to the search box.
document.addEventListener('keydown', e => {
    if (e.key !== '/') return;
    if (document.activeElement === searchInput) return;
    e.preventDefault();
    searchInput.focus();
});

// When running as an installed PWA (standalone display mode), open all app links in a new window 
if (window.matchMedia('(display-mode: standalone)').matches) {
    document.querySelectorAll<HTMLAnchorElement>('.app-card').forEach(a => {
        a.target = '_blank';
    });
}

// Back/forward cache: browsers may restore the page with stale input state.
// Reset search so the displayed cards match what's in the input field.
window.addEventListener('pageshow', e => {
    if (e.persisted) {
        searchInput.value = '';
        clearSearch();
    }
});
