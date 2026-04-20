/* ═══════════════════════════════════════════
   MUAKHIR 開発 — Portfolio Interactions
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── LOADING SCREEN ───
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('done');
      setTimeout(() => loadingScreen.remove(), 600);
    }, 2400);
  }

  // ─── INK CURSOR TRAIL ───
  let lastDot = 0;
  let lastX = 0;
  let lastY = 0;

  function isOnDarkBg(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return false;
    const section = el.closest('section, nav, footer, .loading-screen');
    if (!section) return false;
    const bg = getComputedStyle(section).backgroundColor;
    if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
      return section.classList.contains('bg-ink') || section.id === 'hero';
    }
    const match = bg.match(/\d+/g);
    if (!match) return false;
    const luminance = (parseInt(match[0]) * 299 + parseInt(match[1]) * 587 + parseInt(match[2]) * 114) / 1000;
    return luminance < 80;
  }

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Only spawn dots when moving fast enough and with throttle
    if (now - lastDot < 40 || speed < 8) return;
    lastDot = now;
    lastX = e.clientX;
    lastY = e.clientY;

    const onDark = isOnDarkBg(e.clientX, e.clientY);

    const dot = document.createElement('div');
    dot.className = 'ink-dot' + (onDark ? ' on-dark' : '');
    const size = Math.min(3 + speed * 0.06, 8);
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.left = (e.clientX - size / 2) + 'px';
    dot.style.top = (e.clientY - size / 2) + 'px';
    document.body.appendChild(dot);

    dot.addEventListener('animationend', () => dot.remove());

    // Random splatter on fast movement
    if (speed > 60 && Math.random() > 0.6) {
      const splat = document.createElement('div');
      splat.className = 'ink-splatter' + (onDark ? ' on-dark' : '');
      const splatSize = 10 + Math.random() * 15;
      splat.style.width = splatSize + 'px';
      splat.style.height = splatSize + 'px';
      splat.style.left = (e.clientX - splatSize / 2 + (Math.random() - 0.5) * 20) + 'px';
      splat.style.top = (e.clientY - splatSize / 2 + (Math.random() - 0.5) * 20) + 'px';
      document.body.appendChild(splat);
      splat.addEventListener('animationend', () => splat.remove());
    }
  });

  // ─── LENIS SMOOTH SCROLL ───
  const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.7,
    touchMultiplier: 1.2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Anchor links work with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      // Longer, more cinematic scroll for the hero Enter button
      const isHeroEnter = anchor.closest('#hero');
      lenis.scrollTo(target, {
        offset: -60,
        duration: isHeroEnter ? 3.0 : 1.8,
      });
    });
  });

  // ─── MOBILE NAV ───
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  navToggle?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  // ─── HIDE/SHOW NAV ON SCROLL + BACK TO TOP ───
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');
  let lastScroll = 0;

  lenis.on('scroll', ({ scroll, direction }) => {
    if (direction === 1 && scroll > 80) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = scroll;

    // Show/hide back to top button
    if (scroll > window.innerHeight) {
      backToTop.style.opacity = '1';
      backToTop.style.transform = 'translateY(0)';
      backToTop.style.pointerEvents = 'auto';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.transform = 'translateY(1rem)';
      backToTop.style.pointerEvents = 'none';
    }
  });

  // Back to top click — cinematic scroll
  backToTop?.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 3.0 });
  });

  // ─── SCROLL REVEAL ───
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── STAT BAR ANIMATION ───
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const level = entry.target.dataset.level;
        entry.target.style.width = level + '%';
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-fill').forEach(bar => statObserver.observe(bar));

  // ─── ACTIVE NAV HIGHLIGHT ───
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navHighlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === '#' + id;
          link.style.color = isActive ? '#f5f0e8' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => navHighlightObserver.observe(section));

  // ─── SUBTLE PANEL TILT ───
  document.querySelectorAll('.manga-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      panel.style.transform = `perspective(800px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
    });

    panel.addEventListener('mouseleave', () => {
      panel.style.transform = '';
    });
  });

  // ─── KANJI AUTO-FLIP ANIMATION ───
  const kanjiElements = document.querySelectorAll('.kanji-flip');

  // Auto-cycle: flip a random kanji every 3 seconds
  let flipIndex = 0;
  const kanjiArray = Array.from(kanjiElements);

  function autoFlipKanji() {
    if (kanjiArray.length === 0) return;

    // Remove previous flip
    kanjiArray.forEach(el => el.classList.remove('is-flipped'));

    // Flip current one
    kanjiArray[flipIndex].classList.add('is-flipped');

    // Revert after 2 seconds
    const current = flipIndex;
    setTimeout(() => {
      kanjiArray[current].classList.remove('is-flipped');
    }, 2000);

    // Move to next
    flipIndex = (flipIndex + 1) % kanjiArray.length;
  }

  // Start auto-flip after 2 seconds, repeat every 3.5 seconds
  setTimeout(() => {
    autoFlipKanji();
    setInterval(autoFlipKanji, 3500);
  }, 2000);

  // ─── SVG KANJI FLIP ON HOVER ───
  document.querySelectorAll('[data-art]').forEach(artItem => {
    const svgKanji = artItem.querySelector('.svg-kanji');
    const svgEnglish = artItem.querySelector('.svg-english');
    if (!svgKanji || !svgEnglish) return;

    artItem.addEventListener('mouseenter', () => {
      svgKanji.style.transition = 'opacity 0.4s ease';
      svgEnglish.style.transition = 'opacity 0.4s ease 0.2s';
      svgKanji.setAttribute('opacity', '0');
      svgEnglish.setAttribute('opacity', '0.7');
    });

    artItem.addEventListener('mouseleave', () => {
      svgKanji.style.transition = 'opacity 0.4s ease 0.2s';
      svgEnglish.style.transition = 'opacity 0.4s ease';
      svgEnglish.setAttribute('opacity', '0');
      svgKanji.setAttribute('opacity', '0.4');
    });
  });

  // ─── CONTACT FORM HANDLER ───
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      // Client validation
      if (!name || !email || !subject || !message) return;
      if (message.length < 10) {
        showContactError('Message must be at least 10 characters.');
        return;
      }

      const btn = document.getElementById('contactSubmit');
      const statusEl = document.getElementById('contactStatus');

      // Set loading state
      btn.classList.add('is-sending');
      statusEl.classList.add('hidden');
      statusEl.querySelector('.contact-success').classList.add('hidden');
      statusEl.querySelector('.contact-error').classList.add('hidden');

      try {
        const res = await fetch('send.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });

        const data = await res.json();

        if (data.success) {
          showContactSuccess();
          contactForm.reset();
        } else {
          showContactError(data.message || 'Something went wrong.');
        }
      } catch (err) {
        showContactError('Network error. Please try again.');
      } finally {
        btn.classList.remove('is-sending');
      }
    });
  }

  function showContactSuccess() {
    const statusEl = document.getElementById('contactStatus');
    statusEl.classList.remove('hidden');
    statusEl.querySelector('.contact-success').classList.remove('hidden');
    statusEl.querySelector('.contact-error').classList.add('hidden');
  }

  function showContactError(msg) {
    const statusEl = document.getElementById('contactStatus');
    statusEl.classList.remove('hidden');
    statusEl.querySelector('.contact-error').classList.remove('hidden');
    statusEl.querySelector('.contact-success').classList.add('hidden');
    statusEl.querySelector('.error-detail').textContent = msg;
  }

  // ─── SMOOTH PARALLAX ON HERO ───
  const hero = document.getElementById('hero');
  if (hero) {
    lenis.on('scroll', ({ scroll }) => {
      if (scroll < window.innerHeight) {
        hero.style.setProperty('--parallax', `${scroll * 0.3}px`);
        const heroContent = hero.querySelector('.relative.z-10');
        if (heroContent) {
          heroContent.style.transform = `translateY(${scroll * 0.15}px)`;
          heroContent.style.opacity = 1 - (scroll / window.innerHeight) * 0.6;
        }
      }
    });
  }

});
