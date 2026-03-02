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

// Register custom icons
Iconify.addCollection({
    "prefix": "custom",
    "icons": {
        "jellyfin": {
            "body": "<g fill=\"currentColor\" fill-rule=\"evenodd\"><path id=\"inner-shape\" d=\"M12.0012713844 9.45471264461C11.0464630524 9.45471264461 7.96673813844 15.0384692136 8.43478143844 15.9792362466C8.90282473844 16.92000342 15.1043984634 16.910642554 15.5677613304 15.9792362466C16.0311241974 15.0478300796 12.9607601494 9.45471264461 12.0012713844 9.45471264461C12.0012713844 9.45471264461 12.0012713844 9.45471264461 12.0012713844 9.45471264461\"/><path id=\"outer-shape\" d=\"M12.0012713844 1.10950074602C9.11812465644 1.10950074602 -0.158493409151 17.930976948 1.25499735685 20.771999779C2.66848812285 23.61302261 21.3480960854 23.580259579 22.7475455524 20.771999779C24.1469950194 17.963739979 14.8844181124 1.10950074602 12.0012713844 1.10950074602C12.0012713844 1.10950074602 12.0012713844 1.10950074602 12.0012713844 1.10950074602M19.0453230494 18.310092021C18.1279581814 20.14950219 5.88862588644 20.172904355 4.96190015244 18.310092021C4.03517441844 16.447279687 10.1150568854 5.42485997202 12.0012713844 5.42485997202C13.8874858834 5.42485997202 19.9626879174 16.466001419 19.0453230494 18.310092021C19.0453230494 18.310092021 19.0453230494 18.310092021 19.0453230494 18.310092021\"/></g>"
        },
    },
    "width": 24,
    "height": 24
});
