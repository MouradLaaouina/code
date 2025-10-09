/*
  Charge dynamiquement le pied de page et applique quelques ajustements:
  - Déplace les balises <style> du fragment vers <head> (sans doublons)
  - Supprime les <script> embarqués pour éviter les ré‑exécutions
  - Met à jour l’année courante automatiquement
  - Ajoute l’icône Instagram si absente (idempotent)
*/
(() => {
  function loadFooter() {
    // Ensure a placeholder exists near the end of body
    let placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'footer-placeholder';
      document.body.appendChild(placeholder);
    }

    // Remove any existing injected footer to avoid duplicates
    document.querySelectorAll('footer.footer-a2s').forEach(el => el.remove());

    fetch('pied-de-page.html', { cache: 'no-cache' })
      .then(r => r.text())
      .then(html => {
        const tpl = document.createElement('template');
        tpl.innerHTML = html.trim();

        // Move <style> blocks to <head> once
        tpl.content.querySelectorAll('style').forEach(style => {
          // Avoid duplicating the exact same style block if already present
          const signature = style.textContent?.trim().slice(0, 80) || '';
          const exists = Array.from(document.head.querySelectorAll('style'))
            .some(s => s.textContent && s.textContent.includes(signature));
          if (!exists) document.head.appendChild(style.cloneNode(true));
          style.remove();
        });

        // Remove inline scripts from the template (we'll handle logic below)
        tpl.content.querySelectorAll('script').forEach(s => s.remove());

        // Insert the footer
        const frag = tpl.content;
        placeholder.replaceWith(frag);

        // After insertion, ensure year is current
        const yearEl = document.getElementById('a2s-year');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        // Ensure Instagram icon exists in social block (idempotent)
        try {
          const social = document.querySelector('.a2s-social');
          const hasInsta = social && social.querySelector('[aria-label="Instagram"]');
          if (social && !hasInsta) {
            const a = document.createElement('a');
            a.className = 'a2s-ico';
            a.href = 'https://www.instagram.com/alliancesynergiesante';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('aria-label', 'Instagram');
            a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\
            <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9zm0 7.5a3 3 0 1 1 0-6a3 3 0 0 1 0 6zm5.5-7.75a1.25 1.25 0 1 1 0-2.5a1.25 1.25 0 0 1 0 2.5z"/>\
            </svg>';
            social.appendChild(a);
          }
        } catch (e) { /* no-op */ }
      })
      .catch(err => console.error('Failed to load footer:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
  } else {
    loadFooter();
  }
})();
