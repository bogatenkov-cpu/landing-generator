/* =========================================
   Annara — Vanilla JS
   ========================================= */

(function () {
  'use strict';

  /* -----------------------------------------
     i18n — detect language
     ----------------------------------------- */
  var isRu = document.documentElement.lang === 'ru';

  var msg = isRu ? {
    name: 'Пожалуйста, введите ваше имя',
    email: 'Пожалуйста, введите корректный email',
    phone: 'Пожалуйста, введите корректный номер телефона',
    catalogOk: 'Спасибо! Каталог будет отправлен в ближайшее время.',
    contactOk: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
    modalOk: 'Спасибо! Мы свяжемся с вами в ближайшее время.'
  } : {
    name: 'Please enter your name',
    email: 'Please enter a valid email',
    phone: 'Please enter a valid phone number',
    catalogOk: 'Thank you! The catalog will be sent shortly.',
    contactOk: 'Thank you! We will contact you soon.',
    modalOk: 'Thank you! We will contact you soon.'
  };

  /* -----------------------------------------
     Mobile Menu
     ----------------------------------------- */
  var burgerBtn = document.getElementById('burger-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileClose = document.getElementById('mobile-close');
  var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

  function openMenu() {
    mobileMenu.classList.add('mobile-menu--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* -----------------------------------------
     Modal — Dynamic Form
     ----------------------------------------- */
  var modal = document.getElementById('modal');
  var modalOverlay = document.getElementById('modal-overlay');
  var modalClose = document.getElementById('modal-close');
  var modalTitle = document.getElementById('modal-title');
  var modalDesc = document.getElementById('modal-desc');
  var modalForm = document.getElementById('modal-form');

  function openModal(title, desc) {
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }

  function closeModalFn() {
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
    modalForm.reset();
    var errors = modalForm.querySelectorAll('.modal__error');
    errors.forEach(function (el) { el.textContent = ''; });
    var inputs = modalForm.querySelectorAll('.modal__input');
    inputs.forEach(function (el) { el.classList.remove('modal__input--invalid'); });
  }

  // Attach modal open to all [data-modal] buttons
  var modalTriggers = document.querySelectorAll('[data-modal]');
  modalTriggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var title = this.getAttribute('data-modal-title') || '';
      var desc = this.getAttribute('data-modal-desc') || '';
      closeMenu();
      openModal(title, desc);
    });
  });

  modalOverlay.addEventListener('click', closeModalFn);
  modalClose.addEventListener('click', closeModalFn);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
      closeModalFn();
    }
  });

  /* -----------------------------------------
     Amenities Slider — Infinite Loop
     ----------------------------------------- */
  var slider = document.getElementById('amenities-slider');
  var prevArrow = document.getElementById('amenities-prev');
  var nextArrow = document.getElementById('amenities-next');
  var originalSlides = slider.querySelectorAll('.amenities__slide');
  var slideCount = originalSlides.length;

  // Clone all slides and append for seamless looping
  originalSlides.forEach(function (slide) {
    var clone = slide.cloneNode(true);
    slider.appendChild(clone);
  });

  var slideWidth = 364;

  function updateSlideWidth() {
    var firstSlide = slider.querySelector('.amenities__slide');
    if (firstSlide) {
      slideWidth = firstSlide.offsetWidth + 24;
    }
  }

  // Seamless loop: jump when reaching cloned zone
  var scrollTimeout;
  slider.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      updateSlideWidth();
      var maxOriginalScroll = slideWidth * slideCount;
      if (slider.scrollLeft >= maxOriginalScroll) {
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = slider.scrollLeft - maxOriginalScroll;
        slider.style.scrollBehavior = '';
      }
    }, 100);
  });

  prevArrow.addEventListener('click', function () {
    updateSlideWidth();
    if (slider.scrollLeft <= 0) {
      // Jump to end of originals (seamless)
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = slideWidth * slideCount;
      slider.style.scrollBehavior = '';
      // Small delay then scroll back
      setTimeout(function () {
        slider.scrollBy({ left: -slideWidth, behavior: 'smooth' });
      }, 20);
    } else {
      slider.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    }
  });

  nextArrow.addEventListener('click', function () {
    updateSlideWidth();
    slider.scrollBy({ left: slideWidth, behavior: 'smooth' });
  });

  /* -----------------------------------------
     Floor Plans Tabs
     ----------------------------------------- */
  var tabs = document.querySelectorAll('.floorplans__tab');
  var panels = document.querySelectorAll('.floorplans__panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      tabs.forEach(function (t) { t.classList.remove('floorplans__tab--active'); });
      panels.forEach(function (p) { p.classList.remove('floorplans__panel--active'); });

      this.classList.add('floorplans__tab--active');
      document.getElementById('panel-' + target).classList.add('floorplans__panel--active');
    });
  });

  /* -----------------------------------------
     Scroll Reveal Animation
     ----------------------------------------- */
  var revealElements = document.querySelectorAll(
    '.concept__header, .concept__card, .concept__image,' +
    '.amenities__container > *,' +
    '.floorplans__container > *,' +
    '.investment__container > *,' +
    '.leadmagnet__content, .leadmagnet__form,' +
    '.gallery__row,' +
    '.developer__image, .developer__info,' +
    '.location__info, .location__map,' +
    '.footer__left, .footer__right'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* -----------------------------------------
     Staggered reveal for grid children
     ----------------------------------------- */
  var staggerContainers = document.querySelectorAll(
    '.concept__grid, .gallery__justified'
  );

  staggerContainers.forEach(function (container) {
    var children = container.children;
    for (var i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = (i * 0.1) + 's';
    }
  });

  /* -----------------------------------------
     Header background on scroll
     ----------------------------------------- */
  var header = document.getElementById('header');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.85)';
    }
  }, { passive: true });

  /* -----------------------------------------
     Form Validation Helpers
     ----------------------------------------- */
  function validateName(value) {
    return value.trim().length >= 2;
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validatePhone(value) {
    var cleaned = value.replace(/[\s\-\(\)]/g, '');
    return /^\+?\d{7,15}$/.test(cleaned);
  }

  function showError(input, errorEl, message) {
    input.classList.add(
      input.closest('.modal__form') ? 'modal__input--invalid' :
      input.closest('.leadmagnet__form') ? 'leadmagnet__input--invalid' : 'footer__input--invalid'
    );
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.classList.remove('modal__input--invalid', 'leadmagnet__input--invalid', 'footer__input--invalid');
    errorEl.textContent = '';
  }

  /* -----------------------------------------
     Modal Form Validation
     ----------------------------------------- */
  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var nameInput = document.getElementById('modal-name');
    var nameError = document.getElementById('modal-name-error');
    var emailInput = document.getElementById('modal-email');
    var emailError = document.getElementById('modal-email-error');
    var phoneInput = document.getElementById('modal-phone');
    var phoneError = document.getElementById('modal-phone-error');

    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(phoneInput, phoneError);

    if (!validateName(nameInput.value)) {
      showError(nameInput, nameError, msg.name);
      valid = false;
    }
    if (!validateEmail(emailInput.value)) {
      showError(emailInput, emailError, msg.email);
      valid = false;
    }
    if (!validatePhone(phoneInput.value)) {
      showError(phoneInput, phoneError, msg.phone);
      valid = false;
    }

    if (valid) {
      modalForm.reset();
      closeModalFn();
      alert(msg.modalOk);
    }
  });

  /* -----------------------------------------
     Catalog Form Validation
     ----------------------------------------- */
  var catalogForm = document.getElementById('catalog-form');
  catalogForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var nameInput = document.getElementById('catalog-name');
    var nameError = document.getElementById('catalog-name-error');
    var phoneInput = document.getElementById('catalog-phone');
    var phoneError = document.getElementById('catalog-phone-error');

    clearError(nameInput, nameError);
    clearError(phoneInput, phoneError);

    if (!validateName(nameInput.value)) {
      showError(nameInput, nameError, msg.name);
      valid = false;
    }

    if (!validatePhone(phoneInput.value)) {
      showError(phoneInput, phoneError, msg.phone);
      valid = false;
    }

    if (valid) {
      catalogForm.reset();
      alert(msg.catalogOk);
    }
  });

  /* -----------------------------------------
     Contact Form Validation
     ----------------------------------------- */
  var contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var nameInput = document.getElementById('contact-name');
    var nameError = document.getElementById('contact-name-error');
    var emailInput = document.getElementById('contact-email');
    var emailError = document.getElementById('contact-email-error');
    var phoneInput = document.getElementById('contact-phone');
    var phoneError = document.getElementById('contact-phone-error');

    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(phoneInput, phoneError);

    if (!validateName(nameInput.value)) {
      showError(nameInput, nameError, msg.name);
      valid = false;
    }

    if (!validateEmail(emailInput.value)) {
      showError(emailInput, emailError, msg.email);
      valid = false;
    }

    if (!validatePhone(phoneInput.value)) {
      showError(phoneInput, phoneError, msg.phone);
      valid = false;
    }

    if (valid) {
      contactForm.reset();
      alert(msg.contactOk);
    }
  });

})();
