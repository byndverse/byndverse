(function () {
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
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.15,
      speed: Math.random() * 0.35 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const pulse = Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 255, ${s.alpha + pulse * 0.12})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  document.querySelectorAll('.link-card').forEach((card, i) => {
    card.style.animation = `fadeUp 0.6s ${0.35 + i * 0.1}s ease both`;
  });

  const orbs = [
    { el: document.querySelector('.orb-1'), factorX: 0.025, factorY: 0.020 },
    { el: document.querySelector('.orb-2'), factorX: -0.018, factorY: -0.015 },
    { el: document.querySelector('.orb-3'), factorX: 0.010, factorY: 0.012 },
  ];
  const orbTarget = { x: 0, y: 0 };
  const orbCurrent = { x: 0, y: 0 };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateOrbs() {
    orbCurrent.x = lerp(orbCurrent.x, orbTarget.x, 0.06);
    orbCurrent.y = lerp(orbCurrent.y, orbTarget.y, 0.06);
    orbs.forEach(({ el, factorX, factorY }) => {
      if (!el) return;
      const dx = orbCurrent.x * factorX * 100;
      const dy = orbCurrent.y * factorY * 100;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
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

  const hasHover = window.matchMedia('(hover: hover)').matches;
  if (hasHover) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let glowX = -500, glowY = -500;
    let glowCX = -500, glowCY = -500;

    window.addEventListener('mousemove', e => {
      glowX = e.clientX;
      glowY = e.clientY;
    });

    function animateGlow() {
      glowCX = lerp(glowCX, glowX, 0.12);
      glowCY = lerp(glowCY, glowY, 0.12);
      glow.style.left = glowCX + 'px';
      glow.style.top  = glowCY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  const thumbs = Array.from(document.querySelectorAll('.art-thumb'));
  if (thumbs.length) {
    let current = 0;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Artwork viewer');

    const lbImg = document.createElement('img');
    lbImg.className = 'lightbox-img';
    lbImg.alt = '';

    const lbTitle = document.createElement('p');
    lbTitle.className = 'lightbox-title';

    const lbClose = document.createElement('button');
    lbClose.className = 'lightbox-close';
    lbClose.type = 'button';
    lbClose.setAttribute('aria-label', 'Close');
    lbClose.textContent = '✕';

    const lbPrev = document.createElement('button');
    lbPrev.className = 'lightbox-prev';
    lbPrev.type = 'button';
    lbPrev.setAttribute('aria-label', 'Previous artwork');
    lbPrev.textContent = '‹';

    const lbNext = document.createElement('button');
    lbNext.className = 'lightbox-next';
    lbNext.type = 'button';
    lbNext.setAttribute('aria-label', 'Next artwork');
    lbNext.textContent = '›';

    lb.append(lbImg, lbTitle, lbClose, lbPrev, lbNext);
    document.body.appendChild(lb);

    function show(index) {
      current = (index + thumbs.length) % thumbs.length;
      const sourceImg = thumbs[current].querySelector('img');
      lbImg.src = sourceImg.currentSrc || sourceImg.src;
      lbImg.alt = sourceImg.alt;
      const titleEl = thumbs[current].querySelector('.art-title');
      lbTitle.textContent = titleEl ? titleEl.textContent : '';
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => show(i));
    });

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

  const logoWrap = document.querySelector('.logo-wrap');
  if (logoWrap) {
    const COLORS = ['#b47bff', '#7ec8e3', '#ff6ecb', '#c8853a', '#ffffff'];
    let isSpinning = false;

    function burst() {
      const rect = logoWrap.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const count = 14;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist  = 55 + Math.random() * 65;
        const size  = 3 + Math.random() * 5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        const p = document.createElement('span');
        p.className = 'particle';
        p.style.cssText = `
          left:${bx}px; top:${by}px;
          width:${size}px; height:${size}px;
          background:${color};
        `;
        document.body.appendChild(p);

        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        const anim = p.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 },
        ], { duration: 580 + Math.random() * 200, easing: 'cubic-bezier(0.2,0.8,0.4,1)', fill: 'forwards' });

        anim.onfinish = () => p.remove();
      }
    }

    logoWrap.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;

      const anim = logoWrap.animate([
        { transform: 'perspective(500px) rotateY(0deg)' },
        { transform: 'perspective(500px) rotateY(90deg) scaleX(0.08)',  offset: 0.15 },
        { transform: 'perspective(500px) rotateY(180deg)',              offset: 0.30 },
        { transform: 'perspective(500px) rotateY(270deg) scaleX(0.08)', offset: 0.45 },
        { transform: 'perspective(500px) rotateY(360deg)',              offset: 0.60 },
        { transform: 'perspective(500px) rotateY(450deg) scaleX(0.08)', offset: 0.75 },
        { transform: 'perspective(500px) rotateY(540deg)',              offset: 0.90 },
        { transform: 'perspective(500px) rotateY(720deg)' },
      ], { duration: 900, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'none' });

      burst();
      anim.onfinish = () => { isSpinning = false; };
    });
  }
})();
