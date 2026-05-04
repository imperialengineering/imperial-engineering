/* ============================================================
   IMPERIAL ENGINEERING — carousel.js
   1. Hero full-screen carousel (auto-advancing, with progress bar)
   2. Services card carousel (prev/next, responsive visible count)
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. HERO CAROUSEL
  ══════════════════════════════════════════════════════════ */
  const slides    = document.querySelectorAll('.hc-slide');
  const dots      = document.querySelectorAll('.hc-dot');
  const prevBtn   = document.getElementById('hcPrev');
  const nextBtn   = document.getElementById('hcNext');
  const progressBar = document.getElementById('hcProgress');

  if (!slides.length) return; // not on this page

  const INTERVAL    = 5000;   // ms per slide
  const TRANSITION  = 900;    // ms (matches CSS)
  let   current     = 0;
  let   timer       = null;
  let   progTimer   = null;
  let   isAnimating = false;

  function goTo(idx) {
    if (isAnimating || idx === current) return;
    isAnimating = true;

    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');

    current = (idx + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');

    // Scroll to top of carousel on mobile so user sees new slide
    if (window.innerWidth <= 768) {
      const carousel = document.querySelector('.hero-carousel');
      if (carousel) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
        window.scrollTo({ top: carousel.offsetTop - navH, behavior: 'smooth' });
      }
    }

    setTimeout(() => { isAnimating = false; }, TRANSITION);
    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Auto-advance
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }
  function stopTimer() { clearInterval(timer); }

  // Progress bar
  function resetProgress() {
    if (!progressBar) return;
    clearInterval(progTimer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${INTERVAL}ms linear`;
        progressBar.style.width = '100%';
      });
    });
  }

  // Init
  if (progressBar) {
    progressBar.style.transition = `width ${INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }
  startTimer();

  nextBtn && nextBtn.addEventListener('click', () => { next(); startTimer(); });
  prevBtn && prevBtn.addEventListener('click', () => { prev(); startTimer(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.idx, 10));
      startTimer();
    });
  });

  // Pause on hover
  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', () => { startTimer(); resetProgress(); });
  }

  // Touch/swipe support
  let touchStartX = 0;
  if (carousel) {
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); startTimer(); }
    }, { passive: true });
  }

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); startTimer(); }
    if (e.key === 'ArrowRight') { next(); startTimer(); }
  });


  /* ══════════════════════════════════════════════════════════
     2. SERVICES CARD CAROUSEL
  ══════════════════════════════════════════════════════════ */
  const track     = document.getElementById('srvTrack');
  const dotsWrap  = document.getElementById('srvDots');
  const srvPrev   = document.querySelector('.srv-prev');
  const srvNext   = document.querySelector('.srv-next');

  if (!track) return;

  const cards    = track.querySelectorAll('.srv-card');
  const total    = cards.length;
  let srvCurrent = 0;

  // How many cards visible depends on viewport
  function visibleCount() {
    const w = window.innerWidth;
    if (w >= 1100) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function maxIndex() { return total - visibleCount(); }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === srvCurrent ? ' active' : '');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => srvGoTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === srvCurrent);
    });
  }

  function srvGoTo(idx) {
    srvCurrent = Math.max(0, Math.min(idx, maxIndex()));
    // Card width + gap
    const cardEl  = cards[0];
    const gap     = 24;
    const cardW   = cardEl.offsetWidth + gap;
    track.style.transform = `translateX(-${srvCurrent * cardW}px)`;
    updateDots();
    if (srvPrev) srvPrev.disabled = srvCurrent === 0;
    if (srvNext) srvNext.disabled = srvCurrent >= maxIndex();
  }

  srvPrev && srvPrev.addEventListener('click', () => srvGoTo(srvCurrent - 1));
  srvNext && srvNext.addEventListener('click', () => srvGoTo(srvCurrent + 1));

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      srvCurrent = Math.min(srvCurrent, maxIndex());
      buildDots();
      srvGoTo(srvCurrent);
    }, 150);
  });

  // Touch swipe on service carousel
  let srvTouchX = 0;
  track.addEventListener('touchstart', e => { srvTouchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - srvTouchX;
    if (Math.abs(dx) > 40) { dx < 0 ? srvGoTo(srvCurrent + 1) : srvGoTo(srvCurrent - 1); }
  }, { passive: true });

  // Init service carousel
  buildDots();
  srvGoTo(0);

})();