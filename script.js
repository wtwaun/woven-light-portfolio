// ============================================
// GALLERY - JSON MANIFEST (with fallback)
// ============================================
// Primary: gallery-data.json (run node generate-gallery-data.js). Serve site over HTTP for fetch.
// Fallback: hardcoded list below when JSON unavailable (e.g. file://).
// ============================================

const GALLERY_IMAGES_FALLBACK = [
    // Abstract – order: 4, 7, 2, 1, 3, 6, 5
    { src: 'images-optimized/abstract/Abstract-4.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-7.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-2.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-1.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-3.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-6.webp', category: 'abstract', alt: 'Abstract Photography' },
    { src: 'images-optimized/abstract/Abstract-5.webp', category: 'abstract', alt: 'Abstract Photography' },

    // Cityscape – order: 6, 4, 1, 3, 5, 2, 7
    { src: 'images-optimized/cityscape/Cityscape-6.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-4.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-1.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-3.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-5.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-2.webp', category: 'cityscape', alt: 'Cityscape Photography' },
    { src: 'images-optimized/cityscape/Cityscape-7.webp', category: 'cityscape', alt: 'Cityscape Photography' },

    // Landscape – order: 11, 8, 4, 6, 2, 12, 7, 1, 3, 9, 5, 10
    { src: 'images-optimized/landscape/Landscape-11.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-8.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-4.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-6.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-2.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-12.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-7.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-1.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-3.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-9.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-5.webp', category: 'landscape', alt: 'Landscape Photography' },
    { src: 'images-optimized/landscape/Landscape-10.webp', category: 'landscape', alt: 'Landscape Photography' },

    // Plants – order: 9, 4, 2, 3, 5, 8, 1, 6, 7
    { src: 'images-optimized/plants/Plants-9.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-4.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-2.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-3.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-5.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-8.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-1.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-6.webp', category: 'plants', alt: 'Plant Photography' },
    { src: 'images-optimized/plants/Plants-7.webp', category: 'plants', alt: 'Plant Photography' },

    // Stars – order: 2, 3, 6, 4, 1, 5, 7
    { src: 'images-optimized/stars/Stars-2.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-3.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-6.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-4.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-1.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-5.webp', category: 'stars', alt: 'Astrophotography' },
    { src: 'images-optimized/stars/Stars-7.webp', category: 'stars', alt: 'Astrophotography' },

    // Wildlife – order: 3, 16, 13, 9, 1, 2, 4, 6, 5, 7, 11, 19, 18, 8, 15, 11, 12, 14, 20, 17, 10
    { src: 'images-optimized/wildlife/Wildlife-3.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-16.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-13.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-9.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-1.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-2.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-4.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-6.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-5.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-7.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-19.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-18.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-8.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-15.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-11.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-12.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-14.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-20.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-17.webp', category: 'wildlife', alt: 'Wildlife Photography' },
    { src: 'images-optimized/wildlife/Wildlife-10.webp', category: 'wildlife', alt: 'Wildlife Photography' },
];

let galleryDataCache = null;
// Holds the ordered list of images for the current category (View 2)
let currentCategoryImages = [];

async function loadGalleryData() {
    if (galleryDataCache) return galleryDataCache;
    try {
        const res = await fetch('gallery-data.json');
        if (!res.ok) return null;
        galleryDataCache = await res.json();
        return galleryDataCache;
    } catch (e) {
        return null;
    }
}

function manifestToImage(entry) {
    return {
        src: entry.filename,
        category: entry.category,
        alt: entry.title || 'Photography',
        title: entry.title,
        year: '2024',
        gear: entry.gear || '',
        technical_specs: entry.technical_specs || '',
        print_info: entry.print_info || '',
        location: entry.location || '',
        field_notes: entry.field_notes || '',
        unique_id: entry.unique_id || '',
    };
}

// Master metadata update for View 2: data is slaved to the current photo index
function updateMetadata(index) {
    const data = currentCategoryImages[index];
    if (!data) return;

    const titleElem = document.getElementById('photo-title');
    const notesTitleElem = document.getElementById('field-notes-title');
    const notesElem = document.getElementById('field-notes-text');
    const locationElem = document.getElementById('photo-location');
    const gearElem = document.getElementById('photo-gear');
    const technicalElem = document.getElementById('photo-technical');
    const printElem = document.getElementById('photo-print');

    if (titleElem) {
        titleElem.textContent = data.title || '';
    }

    if (notesTitleElem) {
        notesTitleElem.textContent = data.title || '';
    }

    if (notesElem) {
        const notes = Array.isArray(data.field_notes)
            ? data.field_notes.join(' ')
            : (data.field_notes || '');
        notesElem.textContent = notes || 'No notes available.';
    }

    if (locationElem) {
        locationElem.textContent = data.location || '';
    }
    if (gearElem) {
        gearElem.textContent = data.gear || '';
    }
    if (technicalElem) {
        technicalElem.textContent = data.technical_specs || '';
    }
    if (printElem) {
        printElem.textContent = data.print_info || '';
    }
}

// Derive caption (Title | Year) from image data
function getImageCaption(image) {
    const title = image.title || (() => {
        const name = (image.src || '').split('/').pop().replace(/\.[^.]+$/, '');
        return name.replace(/-(\d+)$/, ' $1').replace(/-/g, ' ');
    })();
    const year = image.year || '2024';
    return `${title} | ${year}`;
}

// Get current category from body data attribute
function getCurrentCategory() {
    const body = document.body;
    const category = body.getAttribute('data-category') || 'all';
    return category;
}

// Initialize gallery (loads from gallery-data.json or fallback)
async function initGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    const manifest = await loadGalleryData();
    // Use manifest whenever it loaded (even if images is empty) — avoids fallback after a hard reset
    const allImages =
        manifest && Array.isArray(manifest.images)
            ? manifest.images.map(manifestToImage)
            : GALLERY_IMAGES_FALLBACK;

    const currentCategory = getCurrentCategory();

    let imagesToShow;
    if (currentCategory === 'all') {
        const homeImage = allImages.find(img => img.src && img.src.includes('Wildlife-1.webp')) || allImages.find(img => img.category === 'wildlife');
        imagesToShow = homeImage ? [homeImage] : [];
    } else {
        imagesToShow = allImages.filter(img => img.category === currentCategory);
    }
    
    if (imagesToShow.length === 0) {
        gallery.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1 / -1; padding: 40px;">No images found in this category.</p>';
        return;
    }
    
    // For home page (single image), viewport-frame layout
    if (currentCategory === 'all' && imagesToShow.length === 1) {
        const image = imagesToShow[0];
        const item = document.createElement('div');
        item.className = 'gallery-item gallery-item-home';
        item.setAttribute('data-category', image.category);
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.decoding = 'async';
        img.fetchPriority = 'high';
        img.loading = 'eager';
        
        img.addEventListener('load', function() {
            this.classList.add('loaded');
            if (typeof getAdaptiveColor === 'function') {
                const colors = getAdaptiveColor(this);
                animateUIColors(colors);
                if (typeof animateAccentGlow === 'function') animateAccentGlow(getAccentGlowColor(this));
            }
        });
        
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3Ctext fill="%23888" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
            this.alt = 'Image not found';
            this.classList.add('loaded');
        });

        item.appendChild(img);
        gallery.appendChild(item);
        return;
    }
    
    const shuffledImages = imagesToShow; // Fixed order (no shuffle)
    // Expose to the global metadata updater so View 2 can always map index -> data
    currentCategoryImages = shuffledImages;
    // Buffer: current + next 5 + prev 2 — preload aggressively to avoid blanks
    const PRELOAD_NEXT = 5;
    const PRELOAD_PREV = 2;
    const initialBufferEnd = Math.min(PRELOAD_NEXT + 1, shuffledImages.length);
    
    // Add gallery-horizontal class to main and body for category pages (locks body scroll)
    const main = document.querySelector('.main');
    if (main) main.classList.add('gallery-horizontal');
    document.body.classList.add('gallery-carousel-mode');
    
    // Build full-screen carousel with scroll-snap
    gallery.innerHTML = '';
    const carouselWrap = document.createElement('div');
    carouselWrap.className = 'gallery-carousel-wrap';
    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    viewport.id = 'carouselViewport';
    const track = document.createElement('div');
    track.className = 'carousel-track';
    
    shuffledImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-category', image.category);
        slide.setAttribute('data-index', index);
        
        const inner = document.createElement('div');
        inner.className = 'slide-inner';
        
        const img = document.createElement('img');
        const inInitialBuffer = index < initialBufferEnd;
        const isNext3 = index >= 1 && index <= 3;
        if (inInitialBuffer) {
            img.src = image.src;
            img.fetchPriority = isNext3 ? 'high' : 'auto';
            img.loading = 'eager';
        } else {
            img.dataset.src = image.src;
            img.fetchPriority = 'low';
            img.loading = 'lazy';
        }
        img.alt = image.alt;
        img.decoding = 'async';
        
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23050505" width="400" height="300"/%3E%3Ctext fill="%23888" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
            this.alt = 'Image not found';
            this.classList.add('loaded');
        });
        
        const caption = document.createElement('span');
        caption.className = 'caption';
        caption.textContent = getImageCaption(image);
        
        inner.appendChild(img);
        inner.appendChild(caption);
        slide.appendChild(inner);
        slide.addEventListener('click', function() {
            if (typeof window._hideSpecsPanel === 'function') window._hideSpecsPanel();
            openLightbox(image, shuffledImages, index);
        });
        
        track.appendChild(slide);
    });
    
    viewport.appendChild(track);
    carouselWrap.appendChild(viewport);
    gallery.appendChild(carouselWrap);
    
    // Grid view
    const gridWrap = document.createElement('div');
    gridWrap.className = 'gallery-grid-wrap';
    gridWrap.style.display = 'none';
    gridWrap.style.opacity = '0';
    const gridEl = document.createElement('div');
    gridEl.className = 'gallery-grid';
    shuffledImages.forEach((image, index) => {
        const cell = document.createElement('div');
        cell.className = 'gallery-grid-cell';
        cell.dataset.index = String(index);
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('load', function() { this.classList.add('loaded'); });
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23050505" width="400" height="300"/%3E%3Ctext fill="%23888" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
        });
        cell.appendChild(img);
        cell.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index, 10);
            if (typeof carouselAPI?.goToIndex === 'function') carouselAPI.goToIndex(idx);
            closeGrid();
        });
        gridEl.appendChild(cell);
    });
    gridWrap.appendChild(gridEl);
    gallery.appendChild(gridWrap);
    
    // Grid toggle button
    const gridToggle = document.createElement('button');
    gridToggle.type = 'button';
    gridToggle.className = 'gallery-grid-toggle';
    gridToggle.setAttribute('aria-label', 'Toggle grid view');
    gridToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
    gridToggle.style.display = 'none';
    main?.appendChild(gridToggle);
    
    let isGridOpen = false;
    const VIEW_MODE_KEY = 'gallery_view_mode';
    function openGrid() {
        if (isGridOpen) return;
        isGridOpen = true;
        gridToggle.classList.add('active');
        gridWrap.style.display = 'block';
        document.body.classList.add('gallery-grid-mode');
        try { localStorage.setItem(VIEW_MODE_KEY, 'grid'); } catch (e) {}
        if (typeof gsap !== 'undefined') {
            gsap.to(carouselWrap, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
            gsap.fromTo(gridWrap, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.inOut' });
        } else {
            carouselWrap.style.opacity = '0';
            gridWrap.style.opacity = '1';
        }
    }
    function closeGrid() {
        if (!isGridOpen) return;
        isGridOpen = false;
        gridToggle.classList.remove('active');
        document.body.classList.remove('gallery-grid-mode');
        try { localStorage.setItem(VIEW_MODE_KEY, 'scroll'); } catch (e) {}
        if (typeof gsap !== 'undefined') {
            gsap.to(gridWrap, { opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => {
                gridWrap.style.display = 'none';
                gsap.to(carouselWrap, { opacity: 1, duration: 0.35, ease: 'power2.inOut' });
            } });
        } else {
            gridWrap.style.display = 'none';
            gridWrap.style.opacity = '0';
            carouselWrap.style.opacity = '1';
        }
    }
    gridToggle.addEventListener('click', () => isGridOpen ? closeGrid() : openGrid());
    
    const carouselAPI = initCarouselSnapSync(viewport, { preloadNext: PRELOAD_NEXT, preloadPrev: PRELOAD_PREV, images: shuffledImages });

    // Force Specs + Field Notes triggers into View 2 (single-photo, non-enlarged)
    let specsTrigger = document.getElementById('specs-trigger');
    let fieldNotesTrigger = document.getElementById('field-notes-trigger');
    let specsPanel = document.getElementById('specs-panel');
    let fieldNotesPanel = document.getElementById('field-notes-panel');
    let specsContent = document.getElementById('specs-panel-content');
    let fieldNotesContent = document.getElementById('field-notes-panel-content');

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function ensureButton(button, createFn) {
        if (!button) {
            button = createFn();
        }
        return button;
    }

    specsTrigger = ensureButton(specsTrigger, () => {
        const btn = document.createElement('button');
        btn.id = 'specs-trigger';
        btn.textContent = 'Specs';
        document.body.appendChild(btn);
        return btn;
    });

    fieldNotesTrigger = ensureButton(fieldNotesTrigger, () => {
        const btn = document.createElement('button');
        btn.id = 'field-notes-trigger';
        btn.textContent = 'Field Notes';
        document.body.appendChild(btn);
        return btn;
    });

    specsPanel = ensureButton(specsPanel, () => {
        const panel = document.createElement('div');
        panel.id = 'specs-panel';
        panel.innerHTML = `
          <div id="specs-panel-content">
            <div id="specs-content">
              <div id="photo-title" class="specs-title"></div>
              <div class="specs-break"></div>
              <div class="specs-row"><span class="specs-label">Location:</span> <span id="photo-location"></span></div>
              <div class="specs-row"><span class="specs-label">Gear:</span> <span id="photo-gear"></span></div>
              <div class="specs-row"><span class="specs-label">Technical:</span> <span id="photo-technical"></span></div>
              <div class="specs-row"><span class="specs-label">Print on:</span> <span id="photo-print"></span></div>
            </div>
          </div>`;
        document.body.appendChild(panel);
        return panel;
    });

    fieldNotesPanel = ensureButton(fieldNotesPanel, () => {
        const panel = document.createElement('div');
        panel.id = 'field-notes-panel';
        panel.innerHTML = `
          <div id="field-notes-panel-content">
            <div id="field-notes-title" class="field-notes-title"></div>
            <div class="field-notes-break"></div>
            <div id="field-notes-text" class="field-notes-body"></div>
          </div>`;
        document.body.appendChild(panel);
        return panel;
    });

    specsContent = document.getElementById('specs-panel-content');
    fieldNotesContent = document.getElementById('field-notes-panel-content');

    // Initial metadata sync for current photo when entering View 2 (index 0)
    if (typeof updateMetadata === 'function') {
        updateMetadata(0);
    }

    // Ensure any interaction inside the buttons/panels does NOT bubble to the slide/image
    [specsTrigger, specsPanel, fieldNotesTrigger, fieldNotesPanel].forEach((el) => {
        if (!el) return;
        ['click', 'mousedown', 'mouseup'].forEach((evt) => {
            el.addEventListener(evt, function (e) {
                e.stopPropagation();
            });
        });
    });

    // Buttons now ONLY toggle visibility; data is kept in sync by updateMetadata()
    specsTrigger.addEventListener('click', function () {
        fieldNotesPanel?.classList.remove('is-visible');
        specsPanel?.classList.toggle('is-visible');
    });

    fieldNotesTrigger.addEventListener('click', function () {
        specsPanel?.classList.remove('is-visible');
        fieldNotesPanel?.classList.toggle('is-visible');
    });

    // Hide View 2 controls when entering immersive view (View 3)
    window._hideSpecsPanel = function () {
        specsPanel?.classList.remove('is-visible');
        fieldNotesPanel?.classList.remove('is-visible');
        specsTrigger.style.opacity = '0';
        specsTrigger.style.pointerEvents = 'none';
        fieldNotesTrigger.style.opacity = '0';
        fieldNotesTrigger.style.pointerEvents = 'none';
    };
    window._hideFieldNotesPanel = window._hideSpecsPanel;

    const enableStage2Buttons = () => {
        specsTrigger.style.opacity = '1';
        specsTrigger.style.pointerEvents = 'auto';
        fieldNotesTrigger.style.opacity = '1';
        fieldNotesTrigger.style.pointerEvents = 'auto';
    };

    enableStage2Buttons();
    
    // If user prefers grid view, open it immediately to avoid flash of horizontal scroll
    let initialViewMode = 'scroll';
    try {
        const stored = localStorage.getItem(VIEW_MODE_KEY);
        if (stored === 'grid' || stored === 'scroll') initialViewMode = stored;
    } catch (e) {}

    if (initialViewMode === 'grid') {
        // Open grid without animation to avoid flicker
        isGridOpen = true;
        gridToggle.classList.add('active');
        gridWrap.style.display = 'block';
        gridWrap.style.opacity = '1';
        carouselWrap.style.opacity = '0';
        document.body.classList.add('gallery-grid-mode');
    } else {
        // Default horizontal scroll
        document.body.classList.remove('gallery-grid-mode');
    }

    // Document-level wheel/touch handler: ensures vertical input drives horizontal scroll
    // (body overflow:hidden can block default scroll; this captures all wheel events)
    initCarouselInputHandler(viewport);
    
    // Keyboard navigation: Arrow keys snap to next/previous slide
    initCarouselKeyboardNav(viewport);
    
    gridToggle.style.display = 'flex';
}

// Handle wheel events to drive horizontal scroll (body overflow:hidden blocks default vertical scroll)
function initCarouselInputHandler(viewport) {
    let wheelAccumulator = 0;
    const wheelThreshold = 60;
    
    document.addEventListener('wheel', function(e) {
        if (document.body.classList.contains('gallery-grid-mode')) return;
        if (!viewport?.isConnected) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        wheelAccumulator += e.deltaY;
        if (Math.abs(wheelAccumulator) >= wheelThreshold) {
            viewport.scrollLeft += (wheelAccumulator > 0 ? 1 : -1) * viewport.clientWidth;
            wheelAccumulator = 0;
        }
    }, { passive: false, capture: true });
}

// Keyboard navigation: Left/Right arrows snap to previous/next slide
function initCarouselKeyboardNav(viewport) {
    document.addEventListener('keydown', function onKey(e) {
        if (document.body.classList.contains('gallery-grid-mode')) return;
        if (!viewport?.isConnected) return;
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const vw = viewport.clientWidth;
            const maxScroll = viewport.scrollWidth - vw;
            viewport.scrollLeft = Math.min(viewport.scrollLeft + vw, maxScroll);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const vw = viewport.clientWidth;
            viewport.scrollLeft = Math.max(viewport.scrollLeft - vw, 0);
        }
    });
}

// ============================================
// ADAPTIVE UI COLOR SYSTEM
// ============================================

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getSaturation(r, g, b) {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    return max === 0 ? 0 : (max - min) / max;
}

/** Extract vibrant glow color from image; boost dark colors for visibility on black */
function getAccentGlowColor(img) {
    const fallback = '#e8e8e8';
    if (typeof ColorThief === 'undefined' || !img?.complete || !img.naturalWidth) return fallback;
    try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 8);
        if (!palette?.length) return fallback;
        let best = palette[0];
        let bestScore = 0;
        palette.forEach(([r, g, b]) => {
            const lum = getLuminance(r, g, b);
            const sat = getSaturation(r, g, b);
            const score = sat * 0.6 + (lum > 0.15 ? lum * 0.4 : 0);
            if (score > bestScore) {
                bestScore = score;
                best = [r, g, b];
            }
        });
        let [r, g, b] = best;
        const lum = getLuminance(r, g, b);
        if (lum < 0.2) {
            const boost = 0.7;
            r = Math.round(r + (255 - r) * boost);
            g = Math.round(g + (255 - g) * boost);
            b = Math.round(b + (255 - b) * boost);
        }
        return `rgb(${r}, ${g}, ${b})`;
    } catch (err) {
        return fallback;
    }
}

function animateAccentGlow(newColor) {
    const root = document.documentElement;
    if (typeof gsap === 'undefined') {
        root.style.setProperty('--accent-glow-color', newColor);
        return;
    }
    gsap.to(root, {
        '--accent-glow-color': newColor,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true
    });
}

function getAdaptiveColor(img) {
    if (typeof ColorThief === 'undefined') return { primary: '#e8e8e8', text: '#e8e8e8', border: 'rgba(232,232,232,0.3)', accent: '#e8e8e8' };
    try {
        const colorThief = new ColorThief();
        const palette = img.complete && img.naturalWidth > 0 ? colorThief.getPalette(img, 5) : null;
        if (!palette || !palette[0]) return { primary: '#e8e8e8', text: '#e8e8e8', border: 'rgba(232,232,232,0.3)', accent: '#e8e8e8' };
        const [r, g, b] = palette[0];
        const luminance = getLuminance(r, g, b);
        let primary, text;
        if (luminance < 0.3) {
            primary = '#ffffff';
            text = '#ffffff';
        } else if (luminance > 0.7) {
            const darken = (c) => Math.round(c * 0.4);
            primary = `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
            text = primary;
        } else {
            primary = `rgb(${r}, ${g}, ${b})`;
            text = primary;
        }
        const border = `rgba(${r}, ${g}, ${b}, 0.5)`;
        return { primary, text, border, accent: primary };
    } catch (err) {
        return { primary: '#e8e8e8', text: '#e8e8e8', border: 'rgba(232,232,232,0.3)', accent: '#e8e8e8' };
    }
}

function parseColor(str) {
    const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    const hex = str.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hex) return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16) };
    return { r: 232, g: 232, b: 232 };
}

function animateUIColors(colors) {
    const root = document.documentElement;
    const target = parseColor(colors.primary);
    
    if (typeof gsap === 'undefined') {
        root.style.setProperty('--ui-primary', colors.primary);
        root.style.setProperty('--ui-text', colors.text);
        root.style.setProperty('--ui-border', colors.border);
        root.style.setProperty('--accent-color', colors.accent || colors.primary);
        return;
    }
    
    const current = parseColor(getComputedStyle(root).getPropertyValue('--ui-primary').trim());
    
    gsap.to(current, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: function() {
            const rgb = `rgb(${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)})`;
            const rgba = `rgba(${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)}, 0.5)`;
            root.style.setProperty('--ui-primary', rgb);
            root.style.setProperty('--ui-text', rgb);
            root.style.setProperty('--ui-border', rgba);
            root.style.setProperty('--accent-color', rgb);
        }
    });
}

// Sync accent colors with active slide (ColorThief), set active state for captions, preload queue
// No focus-pull/snapping: images always 100% sharp, bright, scale. UI stays dimmed (~20%).
function initCarouselSnapSync(viewport, opts = {}) {
    const slides = viewport.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return { goToIndex: () => {} };
    const { preloadNext = 5, preloadPrev = 2, images = [] } = opts;
    const headerContainer = document.querySelector('.header .container');
    const logo = document.querySelector('.header .logo');

    let prevActiveIndex = -1;

    const setActiveSlide = (index) => {
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
    };

    const updateUIFromImage = (img) => {
        // In the horizontal single-image gallery (carousel mode), keep the UI fully black
        // and skip adaptive background/outline changes that can introduce light edges.
        if (document.body.classList.contains('gallery-carousel-mode')) {
            document.documentElement.style.setProperty('--bg-color', '#000000');
            document.documentElement.style.setProperty('--ui-primary', '#e8e8e8');
            document.documentElement.style.setProperty('--ui-text', '#e8e8e8');
            document.documentElement.style.setProperty('--ui-border', 'rgba(232,232,232,0.0)');
            document.documentElement.style.setProperty('--accent-color', '#e8e8e8');
            if (headerContainer) {
                headerContainer.style.backgroundColor = '#000000';
            }
            return;
        }

        const colors = getAdaptiveColor(img);
        animateUIColors(colors);
        animateAccentGlow(getAccentGlowColor(img));
    };

    const getActiveSlideIndex = () => {
        const vw = viewport.clientWidth;
        const scrollLeft = viewport.scrollLeft;
        const index = Math.round(scrollLeft / vw);
        return Math.min(index, slides.length - 1);
    };

    const updatePreloadQueue = (currentIndex) => {
        const next3 = [currentIndex + 1, currentIndex + 2, currentIndex + 3];
        next3.forEach((idx) => {
            if (idx < 0 || idx >= slides.length) return;
            const img = slides[idx]?.querySelector('img');
            const url = img?.dataset?.src;
            if (!url) return;
            const preloader = new Image();
            preloader.src = url;
        });
        const indices = [];
        for (let i = currentIndex - preloadPrev; i <= currentIndex + preloadNext; i++) {
            if (i !== currentIndex && i >= 0 && i < slides.length) indices.push(i);
        }
        indices.forEach((idx) => {
            const slide = slides[idx];
            const img = slide?.querySelector('img');
            if (!img?.dataset?.src) return;
            if (next3.includes(idx)) {
                img.fetchPriority = 'high';
                img.loading = 'eager';
            }
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    };

    const onSnap = () => {
        const index = getActiveSlideIndex();
        setActiveSlide(index);
        updatePreloadQueue(index);
        viewport._currentSlideIndex = index;
        prevActiveIndex = index;

        const activeImg = slides[index]?.querySelector('img');
        if (activeImg && (activeImg.complete && activeImg.naturalWidth > 0)) {
            updateUIFromImage(activeImg);
        } else if (activeImg) {
            activeImg.addEventListener('load', () => updateUIFromImage(activeImg), { once: true });
        }

        // Every time the slide snaps, slave the metadata to the new index
        if (typeof updateMetadata === 'function') {
            updateMetadata(index);
        }
    };

    viewport.addEventListener('scroll', function() {
        clearTimeout(viewport._snapTimeout);
        viewport._snapTimeout = setTimeout(onSnap, 0);
    });
    viewport.addEventListener('scrollend', onSnap);

    const goToIndex = (index) => {
        const i = Math.max(0, Math.min(index, slides.length - 1));
        viewport.scrollLeft = i * viewport.clientWidth;
        requestAnimationFrame(() => { onSnap(); });
    };

    setActiveSlide(0);
    prevActiveIndex = 0;
    updatePreloadQueue(0);

    const firstImg = slides[0]?.querySelector('img');
    if (firstImg && (firstImg.complete && firstImg.naturalWidth > 0)) {
        updateUIFromImage(firstImg);
    } else if (firstImg) {
        firstImg.addEventListener('load', () => updateUIFromImage(firstImg), { once: true });
    }

    return { goToIndex };
}

// Logo glow: static (no breathe effect for instant feel)
function initLogoBreathe() {
    document.documentElement.style.setProperty('--logo-glow-blur', '20px');
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentCategory = getCurrentCategory();
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // On home page (all category), no active link in desktop nav
    if (currentCategory === 'all') {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
    } else {
        // For category pages, set active link
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `${currentCategory}.html`;
            
            if (isActive) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
}

// Initialize navigation
function initNavigation() {
    setActiveNavLink();
    initMobileNavOverlay();
}

// Mobile overlay menu - custom branded full-screen nav
function initMobileNavOverlay() {
    const trigger = document.getElementById('navMenuTrigger');
    const overlay = document.getElementById('navOverlay');
    const closeBtn = document.getElementById('navOverlayClose');
    const backdrop = overlay?.querySelector('.nav-overlay-backdrop');
    const links = overlay?.querySelectorAll('.nav-overlay-link');
    
    if (!trigger || !overlay) return;
    
    function openMenu() {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
        if (typeof gsap !== 'undefined' && links?.length) {
            gsap.set(links, { opacity: 0, y: 20 });
            gsap.to(links, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.05
            });
        }
    }
    
    function closeMenu() {
        if (typeof gsap !== 'undefined' && links?.length) {
            gsap.to(links, {
                opacity: 0,
                y: 20,
                duration: 0.25,
                ease: 'power2.in',
                stagger: 0.02,
                onComplete: () => {
                    overlay.classList.remove('active');
                    overlay.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                }
            });
        } else {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }
    
    trigger.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);
    
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// Aggressive lazy loading for remaining images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const isCarousel = document.body.classList.contains('gallery-carousel-mode');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.fetchPriority = 'low';
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: isCarousel ? '0px 200% 0px 200%' : '600px'
        });
        
        // Observe all images with data-src (lazy loaded images)
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// On the homepage, ignore clicks on "Home" links so only gallery category links navigate
function initHomeClickGuard() {
    const currentCategory = getCurrentCategory();
    if (currentCategory !== 'all') return;

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        // Block only self-home navigations; let category links work normally
        if (href === 'index.html' || href === './' || href === '/' || href === '') {
            e.preventDefault();
        }
    });
}

// Lightbox: expanded immersive view with arrow-key and swipe navigation
let _lightboxState = { categoryImages: [], index: 0 };

function openLightbox(imageOrSrc, categoryImages, indexInCategory) {
    const image = typeof imageOrSrc === 'object' && imageOrSrc !== null && imageOrSrc.src
        ? imageOrSrc
        : { src: imageOrSrc, alt: categoryImages || 'Photo', title: '', gear: '', technical_specs: '', print_info: '', location: '' };
    const list = Array.isArray(categoryImages) ? categoryImages : [image];
    const index = typeof indexInCategory === 'number' ? indexInCategory : 0;

    _lightboxState = { categoryImages: list, index };

    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';

        const content = document.createElement('div');
        content.className = 'lightbox-content';

        const img = document.createElement('img');
        img.className = 'lightbox-img';
        content.appendChild(img);

        const btnInfo = document.createElement('button');
        btnInfo.type = 'button';
        btnInfo.className = 'lightbox-info-btn';
        btnInfo.setAttribute('aria-label', 'Toggle specs');
        btnInfo.textContent = 'Specs';
        content.appendChild(btnInfo);

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-specs-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = '<div class="lightbox-specs-content"></div>';
        overlay.addEventListener('click', function(e) { e.stopPropagation(); });
        content.appendChild(overlay);

        btnInfo.addEventListener('click', function(e) {
            // Only Specs button should not close the lightbox
            e.stopPropagation();
            overlay.classList.toggle('visible');
            overlay.setAttribute('aria-hidden', overlay.classList.contains('visible') ? 'false' : 'true');
        });

        // Clicking anywhere else in the lightbox closes it
        lightbox.addEventListener('click', function() {
            overlay.classList.remove('visible');
            closeLightbox();
        });

        lightbox.appendChild(content);
        document.body.appendChild(lightbox);
    }

    const imgEl = lightbox.querySelector('.lightbox-img');

    function showImage(idx) {
        const list = _lightboxState.categoryImages;
        const i = Math.max(0, Math.min(idx, list.length - 1));
        _lightboxState.index = i;
        const item = list[i];
        imgEl.src = item.src;
        imgEl.alt = item.alt || item.title || '';
    }

    // Attach touch-swipe navigation (left/right, no looping) once
    if (!lightbox._swipeBound) {
        lightbox._swipeBound = true;
        const SWIPE_THRESHOLD_PX = 50;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let isHorizontalSwipe = false;

        const handleTouchStart = function(e) {
            if (!e.touches || e.touches.length === 0) return;
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            touchEndX = touchStartX;
            isHorizontalSwipe = false;
        };

        const handleTouchMove = function(e) {
            if (!e.touches || e.touches.length === 0) return;
            const t = e.touches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            // Decide if this gesture is primarily horizontal
            if (!isHorizontalSwipe && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
                isHorizontalSwipe = true;
            }
            if (isHorizontalSwipe) {
                // Prevent background scroll while swiping horizontally in immersive view
                e.preventDefault();
                touchEndX = t.clientX;
            }
        };

        const handleTouchEnd = function() {
            if (!isHorizontalSwipe) return;
            const dx = touchEndX - touchStartX;
            if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

            const list = _lightboxState.categoryImages;
            if (!list || list.length === 0) return;

            const curr = _lightboxState.index;
            if (dx < 0 && curr < list.length - 1) {
                // swipe left (right-to-left) → next
                showImage(curr + 1);
            } else if (dx > 0 && curr > 0) {
                // swipe right (left-to-right) → previous
                showImage(curr - 1);
            }
        };

        const swipeTarget = lightbox.querySelector('.lightbox-content') || lightbox;
        swipeTarget.addEventListener('touchstart', handleTouchStart, { passive: false });
        swipeTarget.addEventListener('touchmove', handleTouchMove, { passive: false });
        swipeTarget.addEventListener('touchend', handleTouchEnd);
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    showImage(index);

    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');

    const keyHandler = function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', keyHandler);
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const list = _lightboxState.categoryImages;
            if (list.length === 0) return;
            const curr = _lightboxState.index;
            if (e.key === 'ArrowRight' && curr < list.length - 1) {
                showImage(curr + 1);
            } else if (e.key === 'ArrowLeft' && curr > 0) {
                showImage(curr - 1);
            }
        }
    };
    document.addEventListener('keydown', keyHandler);
    lightbox._keyHandler = keyHandler;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        if (lightbox._keyHandler) {
            document.removeEventListener('keydown', lightbox._keyHandler);
        }
    }

    // Re-enable View 2 controls when returning from immersive to single-photo view
    const specsTrigger = document.getElementById('specs-trigger');
    if (specsTrigger) {
        specsTrigger.style.opacity = '1';
        specsTrigger.style.pointerEvents = 'auto';
    }
    const fieldNotesTrigger = document.getElementById('field-notes-trigger');
    if (fieldNotesTrigger) {
        fieldNotesTrigger.style.opacity = '1';
        fieldNotesTrigger.style.pointerEvents = 'auto';
    }
}

// Initialize on DOM load (after splash screen)
// Gallery initialization is handled by splash screen code

// Handle logo loading and error fallback
document.addEventListener('DOMContentLoaded', function() {
    // Handle splash screen logo loading
    const splashLogo = document.querySelector('.splash-logo');
    if (splashLogo) {
        splashLogo.addEventListener('error', function() {
            // Fallback to text if logo doesn't exist
            const splashLogoContainer = document.querySelector('.splash-logo-container');
            if (splashLogoContainer) {
                splashLogoContainer.innerHTML = '<h1 class="logo-text">WILD WAUN</h1>';
            }
        });
    }
    
    // Handle main logo error fallback
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('error', function() {
            // Fallback to text if logo doesn't exist
            const logoContainer = document.querySelector('.logo-container');
            if (logoContainer) {
                logoContainer.innerHTML = '<a href="index.html"><h1 class="logo-text">WILD WAUN</h1></a>';
            }
        });
    }
});

// Function to hide splash screen and initialize content
function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (!splashScreen || !mainContent) {
        // If no splash screen, initialize normally
        initGallery();
        initNavigation();
        initHomeClickGuard();
        initLogoBreathe();
        initLazyLoading();
        return;
    }
    
    // Set flag in sessionStorage to indicate splash has been shown
    sessionStorage.setItem('splashShown', 'true');
    
    // Fade out splash screen
    splashScreen.classList.add('fade-out');
    
    // Initialize gallery and navigation after splash screen starts fading
    setTimeout(function() {
        initGallery();
        initNavigation();
        initHomeClickGuard();
        initLogoBreathe();
        initLazyLoading();
    }, 100);
    
    // Show main content after a short delay
    setTimeout(function() {
        mainContent.classList.add('visible');
        // Remove splash screen from DOM after transition
        setTimeout(function() {
            splashScreen.style.display = 'none';
        }, 800);
    }, 100);
}

function updateFooterYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.footer p').forEach((p) => {
        p.innerHTML = `&copy; ${year} WILD WAUN. All rights reserved.`;
    });
}

// Splash Screen functionality
document.addEventListener('DOMContentLoaded', function() {
    updateFooterYear();
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    
    // Check if splash screen has already been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (splashShown === 'true') {
        // Splash already shown - hide it immediately and show content
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        if (mainContent) {
            mainContent.classList.add('visible');
        }
        // Initialize gallery and navigation immediately
        initGallery();
        initNavigation();
        initHomeClickGuard();
        initLogoBreathe();
        initLazyLoading();
    } else if (splashScreen && mainContent) {
        // First visit - show splash screen
        // Handle click on splash screen
        splashScreen.addEventListener('click', function() {
            hideSplashScreen();
        });
        
        // Auto-hide splash screen after 3 seconds if not clicked
        setTimeout(function() {
            if (!splashScreen.classList.contains('fade-out')) {
                hideSplashScreen();
            }
        }, 3000);
        
        // Also allow keyboard interaction (Enter or Space)
        splashScreen.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hideSplashScreen();
            }
        });
        
        // Make splash screen focusable for accessibility
        splashScreen.setAttribute('tabindex', '0');
    } else {
        // If no splash screen, initialize normally
        initGallery();
        initNavigation();
        initLogoBreathe();
        initLazyLoading();
    }
});

