(function () {

  const isMobile = window.innerWidth <= 760;

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── Nav scroll state & hamburger ───────────────── */

  const nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    function openMenu() {
      navLinks.classList.add('is-open');
      navToggle.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) closeMenu();
    });
  }

  /* ── Starfield canvas ─────────────────────────────── */

  if (!isMobile) {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      buildStars();
    }

    function buildStars() {
      const count = Math.floor((canvas.width * canvas.height) / 5000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.2,
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const pulse = Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 220, 180, ${s.alpha + pulse * 0.10})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
  }

  /* ── Orb parallax ─────────────────────────────────── */

  if (!isMobile) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const orbs = [
      { el: document.querySelector('.orb-1'), factorX:  0.022, factorY:  0.018 },
      { el: document.querySelector('.orb-2'), factorX: -0.015, factorY: -0.013 },
      { el: document.querySelector('.orb-3'), factorX:  0.009, factorY:  0.011 },
    ];
    const orbTarget  = { x: 0, y: 0 };
    const orbCurrent = { x: 0, y: 0 };

    function animateOrbs() {
      orbCurrent.x = lerp(orbCurrent.x, orbTarget.x, 0.06);
      orbCurrent.y = lerp(orbCurrent.y, orbTarget.y, 0.06);
      orbs.forEach(({ el, factorX, factorY }) => {
        if (!el) return;
        el.style.transform = `translate(${orbCurrent.x * factorX * 100}px, ${orbCurrent.y * factorY * 100}px)`;
      });
      requestAnimationFrame(animateOrbs);
    }

    window.addEventListener('mousemove', e => {
      orbTarget.x = (e.clientX - cx) / cx;
      orbTarget.y = (e.clientY - cy) / cy;
    });

    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      orbTarget.x = Math.max(-1, Math.min(1, e.gamma / 20));
      orbTarget.y = Math.max(-1, Math.min(1, (e.beta - 30) / 30));
    });

    animateOrbs();
  }

  /* ── Cursor glow ──────────────────────────────────── */

  if (window.matchMedia('(hover: hover)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let glowX = -500, glowY = -500;
    let glowCX = -500, glowCY = -500;

    window.addEventListener('mousemove', e => { glowX = e.clientX; glowY = e.clientY; });

    function animateGlow() {
      glowCX = lerp(glowCX, glowX, 0.11);
      glowCY = lerp(glowCY, glowY, 0.11);
      glow.style.left = glowCX + 'px';
      glow.style.top  = glowCY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  /* ── Logo burst + coin-flip ───────────────────────── */

  const logoWrap = document.querySelector('.hero-logo-wrap');
  if (logoWrap) {
    const COLORS = ['#c8953a', '#f0ece0', '#b47bff', '#7ec8e3', '#ff6ecb'];
    let isSpinning = false;

    function burst() {
      const rect = logoWrap.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top  + rect.height / 2;
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const dist  = 55 + Math.random() * 65;
        const size  = 3 + Math.random() * 5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const p = document.createElement('span');
        p.className = 'particle';
        p.style.cssText = `left:${bx}px;top:${by}px;width:${size}px;height:${size}px;background:${color};`;
        document.body.appendChild(p);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const anim = p.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`, opacity: 0 },
        ], { duration: 580 + Math.random() * 200, easing: 'cubic-bezier(0.2,0.8,0.4,1)', fill: 'forwards' });
        anim.onfinish = () => p.remove();
      }
    }

    function triggerSpin() {
      if (isSpinning) return;
      isSpinning = true;
      const anim = logoWrap.animate([
        { transform: 'perspective(500px) rotateY(0deg)' },
        { transform: 'perspective(500px) rotateY(90deg) scaleX(0.08)',   offset: 0.15 },
        { transform: 'perspective(500px) rotateY(180deg)',               offset: 0.30 },
        { transform: 'perspective(500px) rotateY(270deg) scaleX(0.08)',  offset: 0.45 },
        { transform: 'perspective(500px) rotateY(360deg)',               offset: 0.60 },
        { transform: 'perspective(500px) rotateY(450deg) scaleX(0.08)',  offset: 0.75 },
        { transform: 'perspective(500px) rotateY(540deg)',               offset: 0.90 },
        { transform: 'perspective(500px) rotateY(720deg)' },
      ], { duration: 900, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'none' });
      burst();
      anim.onfinish = () => { isSpinning = false; };
    }

    logoWrap.addEventListener('click', triggerSpin);
    logoWrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') triggerSpin(); });
  }

  /* ── Lightbox ─────────────────────────────────────── */

  const artWraps = Array.from(document.querySelectorAll('.art-img-wrap'));
  if (artWraps.length) {
    function initLightbox() {
      let current = 0;

      const lb      = document.createElement('div');
      const lbImg   = document.createElement('img');
      const lbTitle = document.createElement('p');
      const lbClose = document.createElement('button');
      const lbPrev  = document.createElement('button');
      const lbNext  = document.createElement('button');

      lb.className      = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Artwork viewer');

      lbImg.className   = 'lightbox-img';
      lbImg.alt         = '';

      lbTitle.className = 'lightbox-title';

      lbClose.className = 'lightbox-close';
      lbClose.type      = 'button';
      lbClose.setAttribute('aria-label', 'Close');
      lbClose.textContent = '✕';

      lbPrev.className  = 'lightbox-prev';
      lbPrev.type       = 'button';
      lbPrev.setAttribute('aria-label', 'Previous artwork');
      lbPrev.textContent = '‹';

      lbNext.className  = 'lightbox-next';
      lbNext.type       = 'button';
      lbNext.setAttribute('aria-label', 'Next artwork');
      lbNext.textContent = '›';

      lb.append(lbImg, lbTitle, lbClose, lbPrev, lbNext);
      document.body.appendChild(lb);

      function show(index) {
        current = (index + artWraps.length) % artWraps.length;
        const sourceImg = artWraps[current].querySelector('img');
        lbImg.src = sourceImg.currentSrc || sourceImg.src;
        lbImg.alt = sourceImg.alt;
        const piece   = artWraps[current].closest('.art-piece');
        const nameEl  = piece ? piece.querySelector('.art-name') : null;
        lbTitle.textContent = nameEl ? nameEl.textContent : '';
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
      }

      function close() {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      artWraps.forEach((wrap, i) => wrap.addEventListener('click', () => show(i)));
      lbClose.addEventListener('click', close);
      lbPrev.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
      lbNext.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
      lb.addEventListener('click', e => { if (e.target === lb) close(); });

      document.addEventListener('keydown', e => {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
      });
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initLightbox);
    } else {
      setTimeout(initLightbox, 200);
    }
  }

  /* ── Scroll reveal ────────────────────────────────── */

  const revealEls = document.querySelectorAll('.statement, .art-piece, .about, .drifters, .site-footer, .bio-section, .artist-statement');
  revealEls.forEach(el => el.classList.add('will-reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

})();
