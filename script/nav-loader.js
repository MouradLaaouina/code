(() => {
  // === Chargement nav + initialisation, version robuste et autonome ===
  function ensureThemeSupport() {
    try {
      // Meta color-scheme (light/dark)
      if (!document.querySelector('meta[name="color-scheme"]')) {
        const m = document.createElement('meta');
        m.name = 'color-scheme';
        m.content = 'light dark';
        document.head.appendChild(m);
      }
      // Feuille de style globale du thème (une seule fois)
      const themeHref = 'style/theme.css';
      if (!document.querySelector(`link[rel="stylesheet"][href*="${themeHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = themeHref;
        document.head.appendChild(link);
      }
      if (!document.getElementById('a2s-theme-toggle-style')) {
        const st = document.createElement('style');
        st.id = 'a2s-theme-toggle-style';
        st.textContent = '.a2s-theme-toggle{position:fixed;inset:auto 16px 16px auto;width:44px;height:44px;border-radius:9999px;display:grid;place-items:center;background:var(--cta, #2f6b2f);color:#fff;box-shadow:0 10px 22px rgba(0,0,0,.22);cursor:pointer;z-index:2000;border:none;transition:transform .15s ease, background .2s ease}.a2s-theme-toggle:hover{transform:translateY(-1px);background:var(--accent, #3e8a3e)}.a2s-theme-toggle svg{width:22px;height:22px}.a2s-theme-toggle .sun{display:none}.dark .a2s-theme-toggle .sun{display:block}.dark .a2s-theme-toggle .moon{display:none}';
        document.head.appendChild(st);
      }
    } catch (_) { /* no-op */ }
  }

  function debounce(fn, wait = 150) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
  }

  function updateNavOffset() {
    const nav = document.querySelector('nav.nav');
    if (!nav) return;
    // Mesure la hauteur réelle du nav (sans marge additionnelle)
    const h = Math.ceil(nav.getBoundingClientRect().height || 0);
    // Expose la hauteur via variable CSS
    document.documentElement.style.setProperty('--navH', `${h}px`);
    // Applique un padding-top basé sur la hauteur du nav + offset configurable
    // L'offset par défaut est 8px mais peut être surchargé via CSS: :root { --nav-offset: 12px; }
    document.body.style.paddingTop = `calc(var(--navH, ${h}px) + var(--nav-offset, 8px))`;
  }

  function initTheme() {
    const body = document.body;
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? (saved === 'dark') : prefersDark;
      body.classList.toggle('dark', !!isDark);
    } catch (_) { /* no-op */ }

    // Toggle bouton (si présent)
    const toggle = document.getElementById('dark-toggle-nav');
    if (toggle) {
      toggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        try {
          localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        } catch (_) { /* no-op */ }
      });
    }
  }

  function ensureFloatingThemeToggle() {
    const body = document.body;
    if (document.getElementById('a2s-theme-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'a2s-theme-toggle';
    btn.type = 'button';
    btn.className = 'a2s-theme-toggle';
    btn.setAttribute('aria-label', body.classList.contains('dark') ? 'Basculer en mode clair' : 'Basculer en mode sombre');
    btn.title = 'Mode clair/sombre';
    btn.innerHTML = '<svg class="moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>\
      <svg class="sun" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v2h3v-2h-3zm-2.76-8.16l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM4.84 17.24l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM12 5a7 7 0 100 14 7 7 0 000-14zm7.16 12.24l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79z"/></svg>';
    btn.addEventListener('click', () => {
      body.classList.toggle('dark');
      btn.setAttribute('aria-label', body.classList.contains('dark') ? 'Basculer en mode clair' : 'Basculer en mode sombre');
      try { localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light'); } catch(_){}
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
    document.body.appendChild(btn);
  }

  function initA11yAndMenu() {
    const body = document.body;
    const btn = document.querySelector('.menu-button');
    const navPanel = document.getElementById('primary-nav');
    const openIcon = document.querySelector('.menu-icon-open');
    const closeIcon = document.querySelector('.menu-icon-close');

    if (!navPanel || !btn) return; // Sécurité

    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

    // Focus trap simple lorsque le menu mobile est ouvert
    let lastFocused;
    function trapFocus(e) {
      if (!isMobile() || navPanel.classList.contains('hidden')) return;
      const focusables = navPanel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
      if (e.key === 'Escape') closeMenu();
    }

    function openMenu() {
      lastFocused = document.activeElement;
      navPanel.classList.remove('hidden');
      // laisser le temps à la transition d'opacité
      requestAnimationFrame(() => navPanel.classList.remove('opacity-0', 'translate-y-4'));
      openIcon && openIcon.classList.add('hidden');
      closeIcon && closeIcon.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      body.classList.add('overflow-hidden');
      document.addEventListener('keydown', trapFocus);
      // Focus sur le premier lien du menu
      const firstLink = navPanel.querySelector('a, button');
      firstLink && firstLink.focus();
    }

    function closeMenu() {
      navPanel.classList.add('opacity-0', 'translate-y-4');
      setTimeout(() => navPanel.classList.add('hidden'), 250);
      openIcon && openIcon.classList.remove('hidden');
      closeIcon && closeIcon.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', trapFocus);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function toggleMenu() {
      navPanel.classList.contains('hidden') ? openMenu() : closeMenu();
    }

    btn.addEventListener('click', toggleMenu);

    // Fermer au clic sur un lien en mode mobile
    navPanel.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && isMobile() && !navPanel.classList.contains('hidden')) closeMenu();
    });

    // Sous-menus (mobile)
    document.querySelectorAll('[data-submenu-toggle]').forEach((btnSub) => {
      const container = btnSub.closest('.has-submenu');
      const submenu = container && container.querySelector('.submenu');
      if (!submenu) return;

      // État fermé par défaut côté mobile
      function setOpen(open) {
        btnSub.setAttribute('aria-expanded', String(open));
        submenu.style.opacity = open ? '1' : '0';
        submenu.style.transform = open ? 'scaleY(1)' : 'scaleY(0)';
      }

      // Sur desktop : laissé à :hover via CSS; sur mobile : toggle au clic
      btnSub.addEventListener('click', (e) => {
        if (!isMobile()) return; // desktop => ne rien faire
        e.preventDefault();
        const expanded = btnSub.getAttribute('aria-expanded') === 'true';
        setOpen(!expanded);
      });

      // Fermer le sous-menu lorsque l'on quitte le mode mobile (resize)
      window.addEventListener('resize', debounce(() => {
        if (!isMobile()) setOpen(false);
      }, 100));
    });

    // Échappe : fermer menu mobile et sous-menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobile() && !navPanel.classList.contains('hidden')) {
        closeMenu();
      }
    });
  }

  async function loadNav() {
    ensureThemeSupport();

    // Placeholder pour y insérer la navigation
    let placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'nav-placeholder';
      document.body.insertBefore(placeholder, document.body.firstChild);
    }

    // Retirer d'anciennes navs s'il y en a
    document.querySelectorAll('nav.nav').forEach((el) => el.remove());

    try {
      const resp = await fetch('navigation.html', { cache: 'reload' });
      const html = await resp.text();

      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();

      // Déplacer les <style> dans le <head>
      tpl.content.querySelectorAll('style').forEach((style) => {
        document.head.appendChild(style.cloneNode(true));
        style.remove();
      });

      // IMPORTANT : on ne ré-exécute PAS les <script> embarqués pour éviter doublons/risques
      tpl.content.querySelectorAll('script').forEach((s) => s.remove());

      // Insérer la nav
      const frag = tpl.content;
      placeholder.replaceWith(frag);

      // Initialisations dépendantes du DOM inséré
      initTheme();
      ensureFloatingThemeToggle();
      initA11yAndMenu();
      updateNavOffset();
      window.addEventListener('resize', debounce(updateNavOffset, 150));
      window.addEventListener('orientationchange', () => setTimeout(updateNavOffset, 150));
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => requestAnimationFrame(updateNavOffset)).catch(() => {});
      }
      window.addEventListener('load', () => requestAnimationFrame(updateNavOffset));

    } catch (err) {
      console.error('Échec du chargement de la navigation:', err);
    }
  }

  // Démarrage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
