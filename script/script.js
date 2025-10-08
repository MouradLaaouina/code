/*
  Script principal du site A2S
  - Navigation (mobile + sous-menus)
  - Révélations au scroll
  - Historique (timeline + onglets)
  - Lightbox de galerie
  - Animations GSAP (hero, intro, galerie, partenaires, KPI, footer)
  Respecte prefers-reduced-motion et évite les erreurs si un bloc est absent.
*/

// ============================================
// MODULE: Navigation
// ============================================
const Navigation = (function() {
  function init() {
    const nav = document.querySelector('.nav');
    const btn = document.querySelector('.menu-button');
    
    if (!btn || !nav) return;

    // Toggle menu mobile
    btn.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen) closeAllSubmenus();
    });

    // Sous-menus
    document.querySelectorAll('.has-submenu > button.nav-link').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        const li = trigger.parentElement;
        const expanded = li.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(expanded));
      });
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        closeAllSubmenus();
      }
    });

    // Réinitialiser en mode desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && nav) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        closeAllSubmenus();
      }
    });
  }

  function closeAllSubmenus() {
    document.querySelectorAll('.has-submenu.open').forEach(function(li) {
      li.classList.remove('open');
      const btn = li.querySelector('button.nav-link');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  return { init };
})();

// ============================================
// MODULE: Reveal on Scroll
// ============================================
const RevealOnScroll = (function() {
  function init() {
    const toReveal = Array.from(document.querySelectorAll('.reveal'));
    if (!toReveal.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      });
      
      toReveal.forEach(el => io.observe(el));
    } else {
      // Fallback
      toReveal.forEach(el => el.classList.add('is-visible'));
    }
  }

  return { init };
})();

// ============================================
// MODULE: Timeline Pro (Historique)
// ============================================
const TimelinePro = (function() {
  function init() {
    const years = Array.from(document.querySelectorAll('.timeline-pro .tp-year'));
    if (!years.length) return;

    const details = document.querySelector('.timeline-pro .tp-details');
    if (!details) return;

    function showDetails(yearBtn) {
      const year = (yearBtn.dataset.year || yearBtn.textContent || '').trim();
      const x = yearBtn.style.getPropertyValue('--x') || 
                getComputedStyle(yearBtn).getPropertyValue('--x') || '50%';
      
      let iconHTML = '';
      let textHTML = year;
      
      const badge = Array.from(document.querySelectorAll('.timeline-pro .tp-event .tp-badge'))
        .find(b => b.textContent.trim() === year);
      
      if (badge) {
        const title = badge.parentElement;
        textHTML = title.textContent.trim();
        const icon = title.parentElement.querySelector('.icon');
        if (icon) iconHTML = icon.innerHTML;
      }

      details.style.setProperty('--x', x);
      const iconBox = details.querySelector('.tp-details-card .icon');
      const textBox = details.querySelector('.tp-details-card .text');
      
      if (iconBox) {
        iconBox.innerHTML = iconHTML || '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>';
      }
      if (textBox) textBox.textContent = textHTML;
      
      details.hidden = false;
      years.forEach(b => b.classList.toggle('active', b === yearBtn));
    }

    years.forEach(btn => {
      btn.addEventListener('click', () => showDetails(btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDetails(btn);
        }
      });
    });
  }

  return { init };
})();

// ============================================
// MODULE: History (onglets)
// ============================================
const History = (function() {
  function init() {
    const wrap = document.querySelector('.history-pro');
    if (!wrap) return;

    const chips = Array.from(wrap.querySelectorAll('.year-chip'));
    const panels = Array.from(wrap.querySelectorAll('.year-panel'));

    function activate(year) {
      chips.forEach(c => {
        const on = c.dataset.year === year;
        c.classList.toggle('active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      panels.forEach(p => {
        const on = p.dataset.year === year;
        const wasActive = p.classList.contains('active');
        p.classList.toggle('active', on);
        p.setAttribute('aria-hidden', on ? 'false' : 'true');
        
        if (on && !wasActive) {
          void p.offsetWidth;
          p.classList.add('animating');
          p.addEventListener('animationend', function handler() {
            p.classList.remove('animating');
            p.removeEventListener('animationend', handler);
          });
        }
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => activate(chip.dataset.year));
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(chip.dataset.year);
        }
      });
    });

    const current = chips.find(c => c.classList.contains('active')) || chips[0];
    if (current) activate(current.dataset.year);
  }

  return { init };
})();

// ============================================
// MODULE: History Cards (grid)
// ============================================
const HistoryCards = (function() {
  function init() {
    const cards = Array.from(document.querySelectorAll('.history-grid .history-card'));
    if (!cards.length) return;

    const titlesByYear = {
      '2009': 'Création',
      '2012': 'Expansion',
      '2017': 'Innovation',
      '2025': 'Transformation'
    };

    const headerTone = document.querySelector('.hist-title .tone');
    const headerStrong = document.querySelector('.hist-title .strong');

    cards.forEach(card => {
      const year = (card.querySelector('.year-badge')?.textContent || '').trim();
      const existingP = card.querySelector('p');
      const text = existingP ? existingP.textContent.trim() : '';
      if (existingP) existingP.remove();

      const title = document.createElement('h3');
      title.className = 'hc-title';
      title.textContent = titlesByYear[year] || 'Histoire';

      const svgNS = 'http://www.w3.org/2000/svg';
      const chevron = document.createElementNS(svgNS, 'svg');
      chevron.setAttribute('viewBox', '0 0 24 24');
      chevron.classList.add('hc-chevron');
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M6 9l6 6 6-6');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      chevron.appendChild(path);
      title.appendChild(chevron);

      const details = document.createElement('div');
      details.className = 'hc-details';
      const para = document.createElement('p');
      para.textContent = text;
      details.appendChild(para);

      card.appendChild(title);
      card.appendChild(details);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      const openExclusive = () => {
        cards.forEach(c => { if (c !== card) c.classList.remove('open'); });
        card.classList.add('open');
        
        if (headerTone) {
          headerTone.textContent = title.textContent.trim();
        }
        if (headerStrong && /entreprise/i.test(title.textContent)) {
          headerStrong.textContent = '';
        }
      };

      card.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('a')) return;
        openExclusive();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openExclusive();
        }
      });
    });

    const defaultCard = cards[cards.length - 1];
    if (defaultCard) {
      defaultCard.classList.add('open');
      const t = defaultCard.querySelector('.hc-title');
      if (headerTone && t) {
        headerTone.textContent = t.textContent.trim();
        if (headerStrong && /entreprise/i.test(t.textContent)) {
          headerStrong.textContent = '';
        }
      }
    }
  }

  return { init };
})();

// ============================================
// MODULE: Lightbox
// ============================================
const Lightbox = (function() {
  let overlay;

  function ensureOverlay() {
    if (overlay) return overlay;
    
    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.innerHTML = `
      <button class="lb-close" aria-label="Fermer">&times;</button>
      <div class="lb-content">
        <div class="lb-media"><img alt="" /></div>
        <div class="lb-caption" role="note"></div>
      </div>`;
    
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    overlay.querySelector('.lb-close').addEventListener('click', close);
    return overlay;
  }

  function open(src, caption) {
    const ov = ensureOverlay();
    const img = ov.querySelector('img');
    const cap = ov.querySelector('.lb-caption');
    
    img.src = src;
    img.alt = caption || '';
    cap.textContent = caption || '';
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function init() {
    const links = Array.from(document.querySelectorAll('[data-lightbox]'));
    if (!links.length) return;

    links.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const src = a.getAttribute('href');
        const caption = a.getAttribute('data-caption') || 
                       a.querySelector('img')?.alt || '';
        open(src, caption);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  return { init };
})();

// ============================================
// MODULE: GSAP Animations
// ============================================
const Animations = (function() {
  function init() {
    // Désactivation globale des animations au scroll pour un affichage immédiat
    return;
  }

  function initHeroAnimations() {
    const hero = document.querySelector('.hero-home');
    if (!hero) return;

    gsap.from('.hero-home .headline', {
      autoAlpha: 0,
      y: 30,
      scale: 0.95,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.hero-home', start: 'top 80%' }
    });

    gsap.from('.hero-home .sub', {
      autoAlpha: 0,
      y: 30,
      scale: 0.95,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.hero-home', start: 'top 80%' }
    });

    gsap.from('.hero-home .cta', {
      autoAlpha: 0,
      y: 30,
      scale: 0.95,
      duration: 0.8,
      delay: 0.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.hero-home', start: 'top 80%' }
    });

    gsap.from('.hero-home .visual img', {
      autoAlpha: 0,
      scale: 0.8,
      rotation: -5,
      duration: 1,
      ease: 'elastic.out(1, 0.75)',
      scrollTrigger: { trigger: '.hero-home', start: 'top 80%' }
    });

    // Parallax background
    gsap.to('.hero-home', {
      backgroundPosition: 'center 60%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-home',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  function initIntroAnimations() {
    const intro = document.querySelector('.intro');
    if (!intro) return;

    gsap.from('.intro .intro-block', {
      autoAlpha: 0,
      y: 20,
      scale: 0.9,
      rotation: 2,
      duration: 0.8,
      stagger: 0.3,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.intro', start: 'top 80%' }
    });
  }

  function initGalleryAnimations() {
    const gallery = document.querySelector('#galerie');
    if (!gallery) return;

    gsap.from('#galerie figure', {
      autoAlpha: 0,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#galerie', start: 'top 80%' }
    });
  }

  function initPartnersAnimations() {
    const partnersTrack = document.querySelector('.partners-track');
    if (!partnersTrack) return;

    // Animation en boucle avec pause hors viewport
    const tl = gsap.to('.partners-track', {
      x: () => -partnersTrack.scrollWidth / 2,
      ease: 'none',
      repeat: -1,
      duration: 12,
      paused: true
    });

    ScrollTrigger.create({
      trigger: '.partners',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => tl.play(),
      onLeave: () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause()
    });

    gsap.from('.partners-track img', {
      autoAlpha: 0,
      y: 10,
      scale: 0.95,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.partners', start: 'top 80%' }
    });

    // Pause au survol
    partnersTrack.addEventListener('mouseenter', () => tl.pause());
    partnersTrack.addEventListener('mouseleave', () => tl.play());
  }

  function initKPIAnimations() {
    const kpiGrid = document.querySelector('.kpi-grid');
    if (!kpiGrid) return;

    gsap.from('.kpi-grid .kpi', {
      autoAlpha: 0,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.kpi-grid', start: 'top 80%' }
    });

    gsap.from('.kpi-grid .kpi-value', {
      scale: 1.2,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      scrollTrigger: { trigger: '.kpi-grid', start: 'top 80%' }
    });
  }
  /**
 * Script d'optimisation des images pour A2S
 * Convertit automatiquement les PNG/JPG en WebP
 * Usage: npm run optimize-images
 */

/*
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const SOURCE_DIR = './';
const OUTPUT_DIR = './optimized';
const QUALITY = 85;
const FORMATS_TO_CONVERT = ['.png', '.jpg', '.jpeg'];

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function convertToWebP(filePath, outputPath) {
  try {
    const info = await sharp(filePath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    return info;
  } catch (error) {
    throw new Error(`Erreur lors de la conversion: ${error.message}`);
  }
}

async function optimizeImages() {
  console.log(`${colors.blue}🚀 Démarrage de l'optimisation des images...${colors.reset}\n`);
  
  await ensureDir(OUTPUT_DIR);
  
  const files = await readdir(SOURCE_DIR);
  const imageFiles = files.filter(file => 
    FORMATS_TO_CONVERT.includes(extname(file).toLowerCase())
  );
  
  if (imageFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  Aucune image à optimiser trouvée${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}📦 ${imageFiles.length} image(s) trouvée(s)${colors.reset}\n`);
  
  let converted = 0;
  let failed = 0;
  let totalSaved = 0;
  
  for (const file of imageFiles) {
    const inputPath = join(SOURCE_DIR, file);
    const outputFilename = basename(file, extname(file)) + '.webp';
    const outputPath = join(OUTPUT_DIR, outputFilename);
    
    try {
      const originalStats = await sharp(inputPath).metadata();
      const originalSize = originalStats.size || 0;
      
      const info = await convertToWebP(inputPath, outputPath);
      const savedBytes = originalSize - info.size;
      const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
      
      totalSaved += savedBytes;
      converted++;
      
      console.log(
        `${colors.green}✓${colors.reset} ${file} → ${outputFilename}`,
        `(${(originalSize / 1024).toFixed(1)}KB → ${(info.size / 1024).toFixed(1)}KB)`,
        `${colors.green}-${savedPercent}%${colors.reset}`
      );
    } catch (error) {
      failed++;
      console.log(`${colors.red}✗${colors.reset} ${file} - ${error.message}`);
    }
  }
  
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Converties:${colors.reset} ${converted}`);
  if (failed > 0) {
    console.log(`${colors.red}✗ Échouées:${colors.reset} ${failed}`);
  }
  console.log(`${colors.green}💾 Espace économisé:${colors.reset} ${(totalSaved / 1024).toFixed(1)}KB`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.yellow}📌 Prochaines étapes:${colors.reset}`);
  console.log(`   1. Copiez les fichiers .webp dans votre dossier d'images`);
  console.log(`   2. Utilisez <picture> avec fallback dans votre HTML`);
  console.log(`   Exemple:`);
  console.log(`   <picture>`);
  console.log(`     <source srcset="image.webp" type="image/webp">`);
  console.log(`     <img src="image.png" alt="...">`);
  console.log(`   </picture>\n`);
}

// Exécution
optimizeImages().catch(error => {
  console.error(`${colors.red}❌ Erreur fatale:${colors.reset}`, error);
process.exit(1);
});
*/

  function initFooterAnimations() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    gsap.from('footer .gsap-anim', {
      autoAlpha: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: 'footer', start: 'top 80%' }
    });

    gsap.utils.toArray('.gsap-social').forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link.querySelector('svg'), {
          scale: 1.2,
          rotation: 15,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(link.querySelector('svg'), {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  return { init };
})();

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  RevealOnScroll.init();
  TimelinePro.init();
  History.init();
  HistoryCards.init();
  Lightbox.init();
  Animations.init();
});
