/* ===================================================
   ANCHAN INDIGO — Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Header Scroll Effect --- */
  const header = document.getElementById('header');

  function handleHeaderScroll() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* --- Burger Menu --- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  function closeMobileMenu() {
    burger.classList.remove('header__burger--active');
    nav.classList.remove('header__nav--active');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.contains('header__nav--active');
    if (isOpen) {
      closeMobileMenu();
    } else {
      burger.classList.add('header__burger--active');
      nav.classList.add('header__nav--active');
      document.body.style.overflow = 'hidden';
    }
  });

  nav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('header__nav--active')) closeMobileMenu();
    }
  });

  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --- Scroll Reveal Animation --- */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const cls = el.classList.contains('reveal-up') ? 'reveal-up--visible'
                  : el.classList.contains('reveal-left') ? 'reveal-left--visible'
                  : 'reveal-right--visible';
        el.classList.add(cls);
        revealObserver.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* --- Counter Animation --- */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + '+';
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* --- Floor Plans Tabs --- */
  const tabs = document.querySelectorAll('.floorplans__tab');
  const plans = document.querySelectorAll('.floorplans__plan');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('floorplans__tab--active'));
      tab.classList.add('floorplans__tab--active');
      plans.forEach(plan => {
        plan.classList.remove('floorplans__plan--active');
        if (plan.id === `plan-${targetTab}`) {
          plan.classList.add('floorplans__plan--active');
        }
      });
    });
  });

  /* --- Form Validation Helpers --- */
  const isRu = document.documentElement.lang === 'ru';

  const messages = {
    nameRequired: isRu ? 'Введите ваше имя' : 'Enter your name',
    nameShort: isRu ? 'Имя слишком короткое' : 'Name is too short',
    emailRequired: isRu ? 'Введите email' : 'Enter your email',
    emailInvalid: isRu ? 'Введите корректный email' : 'Enter a valid email',
    phoneRequired: isRu ? 'Введите телефон' : 'Enter your phone',
    phoneInvalid: isRu ? 'Введите корректный номер телефона' : 'Enter a valid phone number',
    interestRequired: isRu ? 'Выберите тип виллы' : 'Select a villa type',
    consentRequired: isRu ? 'Необходимо согласие на обработку данных' : 'You must agree to data processing'
  };

  const validators = {
    name: (value) => {
      if (!value.trim()) return messages.nameRequired;
      if (value.trim().length < 2) return messages.nameShort;
      return '';
    },
    email: (value) => {
      if (!value.trim()) return messages.emailRequired;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return messages.emailInvalid;
      return '';
    },
    phone: (value) => {
      if (!value.trim()) return messages.phoneRequired;
      const cleaned = value.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(cleaned)) return messages.phoneInvalid;
      return '';
    },
    interest: (value) => {
      if (!value) return messages.interestRequired;
      return '';
    },
    consent: (value, input) => {
      if (!input.checked) return messages.consentRequired;
      return '';
    }
  };

  function validateField(input) {
    const name = input.name;
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(input.value, input);
    const errorEl = input.closest('.contact__form-group').querySelector('.contact__form-error');
    const consentLabel = input.closest('.contact__consent');

    if (error) {
      if (input.type === 'checkbox') {
        if (consentLabel) consentLabel.classList.add('contact__consent--error');
      } else {
        input.classList.add('contact__form-input--error');
      }
      if (errorEl) {
        errorEl.textContent = error;
        errorEl.classList.add('contact__form-error--visible');
      }
      return false;
    } else {
      if (input.type === 'checkbox') {
        if (consentLabel) consentLabel.classList.remove('contact__consent--error');
      } else {
        input.classList.remove('contact__form-input--error');
      }
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('contact__form-error--visible');
      }
      return true;
    }
  }

  function setupFormValidation(form, onSuccess) {
    form.querySelectorAll('.contact__form-input').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('contact__form-input--error')) validateField(input);
      });
    });

    form.querySelectorAll('.contact__consent-input').forEach(input => {
      input.addEventListener('change', () => validateField(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredInputs = form.querySelectorAll('[required]');
      let isValid = true;

      requiredInputs.forEach(input => {
        if (!validateField(input)) isValid = false;
      });

      if (!isValid) {
        const firstError = form.querySelector('.contact__form-input--error, .contact__consent--error .contact__consent-input');
        if (firstError) firstError.focus();
        return;
      }

      form.reset();
      if (onSuccess) onSuccess();
    });
  }

  /* --- Dynamic Lead Modal --- */
  const leadModal = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalForm = document.getElementById('modalForm');
  const successModal = document.getElementById('successModal');

  function openLeadModal(title, text) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.textContent = text;
    leadModal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('modal--active'));
    document.body.style.overflow = '';
  }

  function showSuccessModal() {
    leadModal.classList.remove('modal--active');
    successModal.classList.add('modal--active');
  }

  // Attach click to all buttons/links with data-modal-title
  document.querySelectorAll('[data-modal-title]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.dataset.modalTitle;
      const text = btn.dataset.modalText || '';
      openLeadModal(title, text);
    });
  });

  // Setup modal form validation
  if (modalForm) {
    setupFormValidation(modalForm, showSuccessModal);
  }

  // Close modal handlers
  document.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal__overlay').forEach(overlay => {
    overlay.addEventListener('click', closeAllModals);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  /* --- Contact Section Form --- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    setupFormValidation(contactForm, () => {
      successModal.classList.add('modal--active');
      document.body.style.overflow = 'hidden';
    });
  }

  /* --- Parallax Effect on Hero --- */
  const heroBg = document.querySelector('.hero__bg');

  function handleParallax() {
    if (window.innerWidth < 768) return;
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;
    if (scrollY < heroHeight) {
      heroBg.style.transform = `scale(${1.05 + scrollY * 0.0001}) translateY(${scrollY * 0.3}px)`;
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  /* --- Gallery Lightbox --- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const galleryItems = document.querySelectorAll('.gallery__item');
  let lightboxImages = [];
  let lightboxIndex = 0;

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      lightboxImages.push(img.src.replace(/w=\d+/, 'w=1600'));
      item.addEventListener('click', () => {
        lightboxIndex = index;
        openLightbox();
      });
    }
  });

  function openLightbox() {
    lightboxImage.src = lightboxImages[lightboxIndex];
    lightboxImage.alt = galleryItems[lightboxIndex].querySelector('img').alt;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    lightbox.classList.add('lightbox--active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--active');
    document.body.style.overflow = '';
  }

  function lightboxPrev() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    openLightbox();
  }

  function lightboxNext() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    openLightbox();
  }

  if (lightbox) {
    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', lightboxPrev);
    lightbox.querySelector('.lightbox__next').addEventListener('click', lightboxNext);

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('lightbox--active')) return;
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* --- FAQ Accordion --- */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('faq__item--active');

      faqItems.forEach(other => {
        other.classList.remove('faq__item--active');
        other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq__answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('faq__item--active');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* --- Active Nav Link Highlighting --- */
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link[href^="#"]');

  function highlightNav() {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.id;
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('header__nav-link--active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('header__nav-link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

});
