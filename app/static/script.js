const searchInput = document.getElementById('search-input');

// Filter apps on search input
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.category').forEach(section => {
        const cards = section.querySelectorAll('.app-card');
        let visible = 0;
        cards.forEach(card => {
            const name = card.dataset.name || '';
            const desc = card.dataset.desc || '';
            const match = !q || name.includes(q) || desc.includes(q);
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });
        // Hide category if no visible cards
        section.classList.toggle('hidden', visible === 0);
    });
});

// Clear search on escape keypress
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); }
});

// Focus search on '/' keypress
document.addEventListener('keydown', (e) => {
    if (e.key !== '/') return;
    // Don't hijack if already focused on input
    if (document.activeElement === searchInput) return;
    e.preventDefault();
    searchInput.focus();
});

// Clear search when navigating back to the page
window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
});
