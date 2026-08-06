(function () {
  'use strict';

  const cfg = window.JVTECHY_CONFIG || {};

  function normalizePhoneDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatWhatsAppMask(value) {
    const digits = normalizePhoneDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function waLink(message) {
    const phone = normalizePhoneDigits(cfg.whatsapp || '');
    const text = encodeURIComponent(message || 'Olá! Gostaria de falar com a JVTechy.');
    return phone ? `https://wa.me/${phone}?text=${text}` : '#contato';
  }

  document.querySelectorAll('[data-wa-link]').forEach((el) => {
    const msg = el.getAttribute('data-wa-message') || 'Olá! Gostaria de falar com a JVTechy.';
    el.setAttribute('href', waLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  document.querySelectorAll('[data-product-link]').forEach((el) => {
    const key = el.getAttribute('data-product-link');
    const url = cfg.produtos && cfg.produtos[key];
    if (url) {
      el.setAttribute('href', url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const telEls = document.querySelectorAll('[data-phone-display]');
  telEls.forEach((el) => {
    if (cfg.telefoneExibicao) el.textContent = cfg.telefoneExibicao;
  });

  const emailEls = document.querySelectorAll('[data-email-display]');
  emailEls.forEach((el) => {
    if (cfg.emailContato) {
      el.textContent = cfg.emailContato;
      if (el.tagName === 'A') el.setAttribute('href', `mailto:${cfg.emailContato}`);
    }
  });

  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  function closeMenu() {
    mobileNav?.classList.remove('nav-open');
    document.body.classList.remove('overflow-hidden');
  }

  menuBtn?.addEventListener('click', () => {
    mobileNav?.classList.add('nav-open');
    document.body.classList.add('overflow-hidden');
  });
  closeBtn?.addEventListener('click', closeMenu);
  mobileBackdrop?.addEventListener('click', closeMenu);
  mobileNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('shadow-lg', window.scrollY > 12);
    header.classList.toggle('shadow-black/40', window.scrollY > 12);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  document.querySelectorAll('.faq-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item?.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      if (!open) item?.classList.add('open');
    });
  });

  const whatsappInput = document.getElementById('lead-whatsapp');
  whatsappInput?.addEventListener('input', () => {
    whatsappInput.value = formatWhatsAppMask(whatsappInput.value);
  });

  const toast = document.getElementById('toast');
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  const form = document.getElementById('lead-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = String(data.get('nome') || '').trim();
    const empresa = String(data.get('empresa') || '').trim();
    const email = String(data.get('email') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const interesse = String(data.get('interesse') || '').trim();
    const mensagem = String(data.get('mensagem') || '').trim();

    if (!nome || !email || !whatsapp || !interesse) {
      showToast('Preencha os campos obrigatórios.');
      return;
    }

    const body = [
      '*Pré-cadastro JVTechy*',
      `Nome: ${nome}`,
      empresa ? `Empresa: ${empresa}` : null,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
      `Interesse: ${interesse}`,
      mensagem ? `Mensagem: ${mensagem}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const phone = normalizePhoneDigits(cfg.whatsapp || '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
      showToast('Abrindo WhatsApp com seu pré-cadastro...');
    } else if (cfg.emailContato) {
      const subject = encodeURIComponent(`Pré-cadastro JVTechy — ${nome}`);
      window.location.href = `mailto:${cfg.emailContato}?subject=${subject}&body=${encodeURIComponent(body)}`;
      showToast('Abrindo seu e-mail...');
    }

    form.reset();
  });

  // Prefill interesse from hash/query
  const params = new URLSearchParams(window.location.search);
  const interesseParam = params.get('interesse');
  const interesseSelect = document.getElementById('lead-interesse');
  if (interesseParam && interesseSelect) {
    const option = [...interesseSelect.options].find((o) =>
      o.value.toLowerCase().includes(interesseParam.toLowerCase())
    );
    if (option) interesseSelect.value = option.value;
  }

  document.querySelectorAll('[data-interesse]').forEach((el) => {
    el.addEventListener('click', () => {
      const value = el.getAttribute('data-interesse');
      if (interesseSelect && value) interesseSelect.value = value;
    });
  });
})();
