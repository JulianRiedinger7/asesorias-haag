/* ============================================
   SCRIPT — Agustín Haag Landing Page
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initFAQ();
  initForm();
  initScrollAnimations();
});

/* --- Navbar --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });
}

/* --- FAQ Accordion --- */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');

  items.forEach(item => {
    const question = item.querySelector('.faq__question');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      items.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it wasn't active
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --- Form Validation & Google Sheets --- */
function initForm() {
  const form = document.getElementById('quoteForm');
  const submitBtn = document.getElementById('submitBtn');

  // Real-time: clear error when user interacts with a field
  form.querySelectorAll('input, select, textarea').forEach(field => {
    const event = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(event, () => {
      field.closest('.form-group').classList.remove('error');
    });
  });

  // Prevent non-numeric input in phone field
  const whatsappInput = document.getElementById('whatsapp');
  whatsappInput.addEventListener('input', () => {
    whatsappInput.value = whatsappInput.value.replace(/[^0-9]/g, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    // Gather values
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validate required fields
    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = whatsapp.replace(/[^0-9]/g, '');

    if (!nombre || nombre.length < 2) {
      document.getElementById('nombre').closest('.form-group').classList.add('error');
      hasError = true;
    }
    if (!email || !emailRegex.test(email)) {
      document.getElementById('email').closest('.form-group').classList.add('error');
      hasError = true;
    }
    if (!whatsapp || phoneDigits.length < 8) {
      document.getElementById('whatsapp').closest('.form-group').classList.add('error');
      hasError = true;
    }

    if (hasError) {
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // --- Show loading state on button ---
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="btn-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20" />
      </svg>
      Enviando...
    `;

    // --- Send data to Google Sheets ---
    const formData = { nombre, email, whatsapp, mensaje };
    await sendToGoogleSheets(formData);

    // --- Show success state ---
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      ¡Consulta enviada!
    `;
    submitBtn.classList.add('btn--success');

    // Clear form fields immediately
    form.reset();

    // Reset button after a delay
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--success');
      submitBtn.innerHTML = originalBtnHTML;
    }, 4000);
  });
}

/**
 * Sends form data to a Google Sheets via Google Apps Script Web App.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste the Apps Script code
 * 4. Click Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it below
 */
function sendToGoogleSheets(data) {
  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbySLxJUXzlemtbg3wrM4BO6poQAFYawlRvI1JeH-TAw0z3t9dw0FSBdHhlcL4FKVl-m/exec';

  if (!GOOGLE_SHEETS_ENDPOINT) {
    console.log('[INFO] Google Sheets endpoint not configured. Data:', data);
    return Promise.resolve();
  }

  return fetch(GOOGLE_SHEETS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: data.nombre,
      email: data.email,
      whatsapp: data.whatsapp,
      mensaje: data.mensaje || '',
      fecha: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    }),
  }).catch(err => {
    console.warn('[WARN] Error sending to Google Sheets:', err);
  });
}


/* --- Scroll Animations (Intersection Observer) --- */
function initScrollAnimations() {
  // General scroll-reveal observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));

  // --- Animated Number Counters ---
  const counters = document.querySelectorAll('[data-count-target]');
  if (counters.length === 0) return;

  let countersAnimated = false;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counters.forEach(counter => animateCounter(counter));
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe the stats container
  const statsContainer = document.querySelector('.hero__stats');
  if (statsContainer) {
    counterObserver.observe(statsContainer);
  }
}

/**
 * Animates a number from 0 to data-count-target value.
 * Supports data-count-prefix (e.g. "+") and data-count-suffix (e.g. "%").
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.countTarget, 10);
  const prefix = el.dataset.countPrefix || '';
  const suffix = el.dataset.countSuffix || '';

  // Longer duration for bigger numbers, shorter for small ones
  let duration;
  if (target >= 500) {
    duration = 2800;
  } else if (target >= 100) {
    duration = 2200;
  } else {
    duration = 1800;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Small delay so the user sees "0" before counting starts
  setTimeout(() => {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = Math.round(easedProgress * target);

      el.textContent = `${prefix}${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
        el.classList.add('counted');
      }
    }

    requestAnimationFrame(update);
  }, 800);
}
