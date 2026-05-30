/* ═══════════════════════════════════════════════════
   NEXGEN WORLD — script.js
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── 1. Navbar scroll state ─────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ── 2. Mobile hamburger menu ───────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});


/* ── 3. Animated counter (stats bar) ────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out-expo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Trigger counters when stats bar enters viewport
const statsBar = document.querySelector('.stats-bar');
let countersRan = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersRan) {
    countersRan = true;
    document.querySelectorAll('.stat-num').forEach(animateCounter);
  }
}, { threshold: 0.5 });

statsObserver.observe(statsBar);


/* ── 4. Scroll-reveal for sections ─────────────── */
const revealEls = document.querySelectorAll(
  '.section-label, .section-title, .about-lead, .about-body, ' +
  '.pillar, .service-card, .contact-desc, .cd-item, .cform, ' +
  '.stats-bar .stat'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = Array.from(entry.target.parentElement.children)
        .filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(entry.target);
      const delay = idx * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));


/* ── 5. Active nav link on scroll ───────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('nav a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.style.color = '');
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.style.color = 'var(--text)';
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));


/* ── 6. Contact form validation & submit ─────────── */
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const formSuccess = document.getElementById('formSuccess');

const validators = {
  fname:   v => v.trim().length >= 2  ? '' : 'Please enter your first name.',
  lname:   v => v.trim().length >= 2  ? '' : 'Please enter your last name.',
  email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
  message: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
};

function showError(fieldId, msg) {
  const errEl = document.getElementById(`err-${fieldId}`);
  const input  = document.getElementById(fieldId);
  if (errEl) errEl.textContent = msg;
  if (input)  input.style.borderColor = msg ? 'var(--accent2)' : '';
}

// Inline validation on blur
Object.keys(validators).forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('blur', () => {
      const err = validators[id](input.value);
      showError(id, err);
    });
    input.addEventListener('input', () => {
      if (input.style.borderColor === 'var(--accent2)') {
        const err = validators[id](input.value);
        showError(id, err);
      }
    });
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all fields
  let valid = true;
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    const err = validators[id](input.value);
    showError(id, err);
    if (err) valid = false;
  });

  if (!valid) return;

  // Simulate async submit
  btnText.hidden    = true;
  btnLoading.hidden = false;
  submitBtn.disabled = true;

  await new Promise(r => setTimeout(r, 1600));

  btnText.hidden    = false;
  btnLoading.hidden = true;
  submitBtn.disabled = false;

  form.reset();
  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-hide success message
  setTimeout(() => { formSuccess.hidden = true; }, 6000);
});


/* ── 7. Service card tilt effect (desktop only) ─── */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ── 8. Smooth-scroll for all anchor links ───────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
