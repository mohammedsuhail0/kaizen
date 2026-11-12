gsap.registerPlugin(ScrollTrigger);
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 200) navbar.classList.add('hidden');
    else navbar.classList.remove('hidden');
    lastScroll = current;
  }, { passive: true });
}
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuBtn.classList.toggle('active');
  });
}
gsap.utils.toArray('.hero .reveal').forEach((el, i) => {
  gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 + i * 0.12, ease: 'power3.out' });
});
const hero = document.querySelector('.hero');
const shapes = document.querySelectorAll('.hero-bg-3d .shape');
if (hero && shapes.length) {
  hero.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    shapes.forEach((s, i) => {
      const factor = 0.5 + i * 0.2;
      gsap.to(s, { x: x * factor, y: y * factor, duration: 0.8, ease: 'power2.out' });
    });
  });
}
gsap.utils.toArray('.reveal').forEach(el => {
  if (el.closest('.hero')) return;
  gsap.fromTo(el, { opacity: 0, y: 60 }, {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
  });
});
const statCards = document.querySelectorAll('.stat-card[data-stat]');
statCards.forEach(card => {
  const target = parseInt(card.getAttribute('data-stat'), 10);
  const numEl = card.querySelector('.stat-number');
  if (!numEl) return;
  ScrollTrigger.create({
    trigger: card, start: 'top 85%', once: true,
    onEnter: () => {
      gsap.fromTo(numEl, { textContent: 0 }, { textContent: target, duration: 2, ease: 'power2.out', snap: { textContent: 1 } });
    },
  });
});
statCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.3, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' }));
});
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('form-status');
    if (!statusEl) return;
    statusEl.textContent = 'Sending...';
    statusEl.className = 'form-status sending';
    const formData = new FormData(contactForm);
    const action = contactForm.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID')) {
      statusEl.textContent = 'Please set your Formspree form ID in contact.html (see README).';
      statusEl.className = 'form-status error';
      return;
    }
    try {
      const res = await fetch(action, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (data.ok) {
        statusEl.textContent = "Message sent! We'll get back to you soon.";
        statusEl.className = 'form-status success';
        contactForm.reset();
      } else {
        statusEl.textContent = 'Something went wrong. Please try again or call us.';
        statusEl.className = 'form-status error';
      }
    } catch {
      statusEl.textContent = 'Network error. Please check your connection and try again.';
      statusEl.className = 'form-status error';
    }
  });
}
