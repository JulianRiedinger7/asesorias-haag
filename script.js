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

/* --- Form Validation & WhatsApp --- */
function initForm() {
  const form = document.getElementById('quoteForm');

  // Real-time: clear error when user interacts with a field
  form.querySelectorAll('input, select').forEach(field => {
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

  // Prevent negative and decimal in age field
  const edadInput = document.getElementById('edad');
  edadInput.addEventListener('input', () => {
    let val = edadInput.value.replace(/[^0-9]/g, '');
    if (val && parseInt(val) > 120) val = '120';
    edadInput.value = val;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    // Gather values
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const cobertura = document.getElementById('cobertura').value;
    const condicion = document.getElementById('condicion').value;
    const interes = document.getElementById('interes').value;

    // Validate
    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = whatsapp.replace(/[^0-9]/g, '');
    const edadNum = parseInt(edad, 10);

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
    if (!edad || isNaN(edadNum) || edadNum < 1 || edadNum > 120) {
      document.getElementById('edad').closest('.form-group').classList.add('error');
      hasError = true;
    }
    if (!cobertura) {
      document.getElementById('cobertura').closest('.form-group').classList.add('error');
      hasError = true;
    }
    if (!condicion) {
      document.getElementById('condicion').closest('.form-group').classList.add('error');
      hasError = true;
    }
    if (!interes) {
      document.getElementById('interes').closest('.form-group').classList.add('error');
      hasError = true;
    }

    if (hasError) {
      // Scroll to first error
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // --- Send data to Google Sheets silently (placeholder) ---
    sendToGoogleSheets({ nombre, email, whatsapp, edad, cobertura, condicion, interes });

    // --- Open WhatsApp with pre-filled message ---
    const message = encodeURIComponent(
      `¡Hola Agustín! 👋\n\n` +
      `Me gustaría cotizar una cobertura. Estos son mis datos:\n\n` +
      `📋 *Nombre:* ${nombre}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Celular:* ${whatsapp}\n` +
      `🎂 *Edad:* ${edad} años\n` +
      `👥 *Cobertura para:* ${cobertura}\n` +
      `💼 *Condición laboral:* ${condicion}\n` +
      `🔍 *Servicio de interés:* ${interes}\n\n` +
      `¡Espero tu respuesta! 😊`
    );

    // Agustín's WhatsApp number
    const agustinWhatsApp = '542916453357';
    const whatsappURL = `https://api.whatsapp.com/send?phone=${agustinWhatsApp}&text=${message}`;

    window.open(whatsappURL, '_blank');
  });
}

/**
 * Sends form data to a Google Sheets endpoint silently.
 * Replace GOOGLE_SHEETS_ENDPOINT with your actual Apps Script Web App URL.
 */
function sendToGoogleSheets(data) {
  const GOOGLE_SHEETS_ENDPOINT = ''; // TODO: Add Google Apps Script URL

  if (!GOOGLE_SHEETS_ENDPOINT) {
    console.log('[INFO] Google Sheets endpoint not configured. Data:', data);
    return;
  }

  fetch(GOOGLE_SHEETS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: data.nombre,
      email: data.email,
      whatsapp: data.whatsapp,
      edad: data.edad,
      cobertura: data.cobertura,
      condicion: data.condicion,
      interes: data.interes,
      fecha: new Date().toISOString(),
    }),
  }).catch(err => {
    console.warn('[WARN] Error sending to Google Sheets:', err);
  });
}


/* --- Scroll Animations (Intersection Observer) --- */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}
