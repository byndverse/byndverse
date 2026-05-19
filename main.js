(function () {
  'use strict';
  const nav = document.querySelector('.site-nav');
  if (nav) { window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 20); }, { passive: true }); }
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => { const open = hamburger.classList.toggle('open'); mobileMenu.classList.toggle('open', open); hamburger.setAttribute('aria-expanded', open); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); } });
    mobileMenu.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }); });
  }
  const reveals = document.querySelectorAll('.will-reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else { reveals.forEach(el => el.classList.add('revealed')); }
  const form = document.querySelector('.contact-form');
  if (form) { const submitBtn = form.querySelector('button[type="submit"]'); form.addEventListener('submit', () => { if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; } }); }
})();
