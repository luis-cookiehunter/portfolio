// =========================================================
// Portfolio-Webseite — main.js
// Mobile-Nav-Toggle, Scroll-Reveal, dynamisches Alter
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initScrollReveal();
  initDynamicAge();
  initTimelineFilter();
  initConfetti();
  initJourneyCarousels();
});

/* ---------- Mobile-Navigation ---------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Menü schließen, wenn ein Link geklickt wird (mobil)
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ---------- Scroll-Reveal (fade-in beim Scrollen) ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------- Dynamische Altersberechnung ----------
   WICHTIG: Trage hier dein echtes Geburtsdatum ein
   (Format: 'YYYY-MM-DD'). Aktuell nur ein Platzhalter! */
function initDynamicAge() {
  const el = document.querySelector('[data-age]');
  if (!el) return;

  const BIRTHDATE = '2003-01-01'; // <-- HIER dein echtes Geburtsdatum eintragen

  const birth = new Date(BIRTHDATE);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  el.textContent = age;
}

/* ---------- Konfetti-Spielerei (Startseite) ----------
   Reines Canvas, kein externes Paket. Partikel starten am
   linken und rechten Bildschirmrand und schießen schräg nach
   innen, Schwerkraft zieht sie wieder runter, dann Fade-out. */
function initConfetti() {
  const btn = document.getElementById('confetti-trigger');
  const canvas = document.getElementById('confetti-canvas');
  if (!btn || !canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#6fc3ff', '#8fd4ff', '#e7edf3', '#9fb0c0', '#ffffff'];
  let particles = [];
  let animating = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawnParticle(fromLeft) {
    const x = fromLeft ? -10 : canvas.width + 10;
    const directionSign = fromLeft ? 1 : -1;
    return {
      x,
      y: canvas.height * (0.15 + Math.random() * 0.5),
      vx: directionSign * (4 + Math.random() * 5),
      vy: -(6 + Math.random() * 6),
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.22 + Math.random() * 0.08,
      life: 1,
      decay: 0.006 + Math.random() * 0.006,
    };
  }

  function launchConfetti() {
    const batch = 70;
    for (let i = 0; i < batch; i++) {
      particles.push(spawnParticle(true));
      particles.push(spawnParticle(false));
    }
    if (!animating) {
      animating = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 40);

    if (particles.length > 0) {
      requestAnimationFrame(tick);
    } else {
      animating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  btn.addEventListener('click', launchConfetti);
}

/* ---------- Bilder-Karussell (Horizonte-Seite) ----------
   Pro Station mehrere Bilder, es wird aber nur eins gezeigt;
   mit Pfeilen lässt sich durchblättern. */
function initJourneyCarousels() {
  const carousels = document.querySelectorAll('.journey-carousel');
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!slides.length) return;

    let current = 0;

    // Dots dynamisch erzeugen, passend zur Bilderanzahl
    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Bild ${i + 1}`);
        dot.addEventListener('click', () => show(i));
        dotsWrap.appendChild(dot);
      });
      dots = dotsWrap.querySelectorAll('button');
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

    show(0);
  });
}

/* ---------- Timeline-Filter (optional, für Lebenslauf: Theorie/Praxis) ---------- */
function initTimelineFilter() {
  const buttons = document.querySelectorAll('.timeline-track button');
  const items = document.querySelectorAll('.tl-item');
  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });
}
