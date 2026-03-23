/* ============================================
   Angsana Oceanview Residences
   Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Header scroll effect ---
  const header = document.getElementById('header');
  let lastScrollY = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // --- Burger menu ---
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', function () {
      burgerBtn.classList.toggle('header__burger--active');
      mobileNav.classList.toggle('mobile-nav--open');
      document.body.style.overflow = mobileNav.classList.contains('mobile-nav--open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        burgerBtn.classList.remove('header__burger--active');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Scroll reveal animations ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Enable reveal animations via CSS (progressive enhancement)
    document.documentElement.classList.add('js-reveal-ready');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
      });

      reveals.forEach(function (el) {
        observer.observe(el);
      });

      // Safety fallback: if after 4 seconds some reveals haven't triggered, show them
      setTimeout(function () {
        reveals.forEach(function (el) {
          if (!el.classList.contains('reveal--visible')) {
            el.classList.add('reveal--visible');
          }
        });
      }, 4000);
    } else {
      // No IntersectionObserver support — show everything immediately
      reveals.forEach(function (el) {
        el.classList.add('reveal--visible');
      });
    }
  }

  initScrollReveal();

  // --- Floor plan tabs ---
  const tabs = document.querySelectorAll('.floorplans__tab');
  const contents = document.querySelectorAll('.floorplans__content');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = this.dataset.tab;

      tabs.forEach(function (t) { t.classList.remove('floorplans__tab--active'); });
      contents.forEach(function (c) { c.classList.remove('floorplans__content--active'); });

      this.classList.add('floorplans__tab--active');
      var targetContent = document.querySelector('[data-content="' + target + '"]');
      if (targetContent) {
        targetContent.classList.add('floorplans__content--active');
      }
    });
  });

  // --- FAQ accordion ---
  document.querySelectorAll('.faq__question').forEach(function (question) {
    question.addEventListener('click', function () {
      const item = this.closest('.faq__item');
      const isOpen = item.classList.contains('faq__item--open');

      // Close all
      document.querySelectorAll('.faq__item--open').forEach(function (openItem) {
        openItem.classList.remove('faq__item--open');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('faq__item--open');
      }
    });
  });

  // --- Modals ---
  function openModal(modalId) {
    var modal = document.getElementById('modal-' + modalId);
    if (modal) {
      modal.classList.add('modal--open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
    // Reset form after close
    setTimeout(function () {
      var form = modal.querySelector('form');
      if (form) {
        resetForm(form);
      }
    }, 350);
  }

  // Open modal buttons
  document.querySelectorAll('[data-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var modalName = this.dataset.modal;
      var unitType = this.dataset.unit;

      if (modalName === 'floorplan' && unitType) {
        var hiddenInput = document.getElementById('fpUnitType');
        if (hiddenInput) hiddenInput.value = unitType;
      }

      // Close mobile nav if open
      if (mobileNav && mobileNav.classList.contains('mobile-nav--open')) {
        burgerBtn.classList.remove('header__burger--active');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
      }

      openModal(modalName);
    });
  });

  // Close modal buttons
  document.querySelectorAll('.modal__close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(this.closest('.modal'));
    });
  });

  // Close modal on backdrop click
  document.querySelectorAll('.modal__backdrop').forEach(function (backdrop) {
    backdrop.addEventListener('click', function () {
      closeModal(this.closest('.modal'));
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openModal = document.querySelector('.modal--open');
      if (openModal) {
        closeModal(openModal);
      }
    }
  });

  // --- Form validation & submission ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    // At least 7 digits
    var digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  }

  function showError(input) {
    input.classList.add('form__input--error');
    var errorEl = input.parentElement.querySelector('.form__error');
    if (errorEl) errorEl.classList.add('form__error--visible');
  }

  function clearError(input) {
    input.classList.remove('form__input--error');
    var errorEl = input.parentElement.querySelector('.form__error');
    if (errorEl) errorEl.classList.remove('form__error--visible');
  }

  function resetForm(form) {
    form.reset();
    form.querySelectorAll('.form__input--error').forEach(function (input) {
      clearError(input);
    });
    form.querySelectorAll('.form__error--visible').forEach(function (err) {
      err.classList.remove('form__error--visible');
    });
    // Hide success, show form fields
    var success = form.querySelector('.form__success');
    if (success) success.classList.remove('form__success--visible');
    form.querySelectorAll('.form__group, .form__consent, [type="submit"]').forEach(function (el) {
      el.style.display = '';
    });
  }

  function validateForm(form) {
    var isValid = true;
    var inputs = form.querySelectorAll('.form__input[required]');

    inputs.forEach(function (input) {
      clearError(input);
      var value = input.value.trim();

      if (!value) {
        showError(input);
        isValid = false;
        return;
      }

      if (input.type === 'email' && !validateEmail(value)) {
        showError(input);
        isValid = false;
      }

      if (input.type === 'tel' && !validatePhone(value)) {
        showError(input);
        isValid = false;
      }
    });

    // Check consent checkbox
    var consent = form.querySelector('input[type="checkbox"][required]');
    if (consent && !consent.checked) {
      isValid = false;
      consent.parentElement.style.color = 'var(--color-error)';
      setTimeout(function () {
        consent.parentElement.style.color = '';
      }, 2000);
    }

    return isValid;
  }

  function handleFormSubmit(form) {
    if (!validateForm(form)) return;

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
    }

    // Simulate form submission
    setTimeout(function () {
      // Hide form fields
      form.querySelectorAll('.form__group, .form__consent, [type="submit"]').forEach(function (el) {
        el.style.display = 'none';
      });
      // Show success
      var success = form.querySelector('.form__success');
      if (success) success.classList.add('form__success--visible');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
      }
    }, 800);
  }

  // Store original button text and attach submit handlers
  document.querySelectorAll('form').forEach(function (form) {
    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(this);
    });
  });

  // Clear error on input
  document.querySelectorAll('.form__input').forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(this);
    });
  });

  // --- Counter animation for stats ---
  function animateCounters() {
    var counters = document.querySelectorAll('.stats__number');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var text = el.textContent.trim();
          // Only animate if contains a clear number
          var match = text.match(/^([\d,.\s]+)/);
          if (match) {
            var numStr = match[1].replace(/[\s,]/g, '');
            var target = parseInt(numStr);
            if (isNaN(target)) return;
            var suffix = text.replace(match[1], '');
            var separator = text.includes(',') ? ',' : (text.includes(' ') ? ' ' : '');
            var duration = 1500;
            var start = 0;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              var current = Math.floor(eased * target);
              var formatted = current.toLocaleString().replace(/,/g, separator);
              el.textContent = formatted + suffix;
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                el.textContent = text;
              }
            }

            requestAnimationFrame(step);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  animateCounters();

  // --- Gallery Lightbox ---
  (function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var lightboxImg = lightbox.querySelector('.lightbox__img');
    var lightboxCounter = lightbox.querySelector('.lightbox__counter');
    var btnClose = lightbox.querySelector('.lightbox__close');
    var btnPrev = lightbox.querySelector('.lightbox__nav--prev');
    var btnNext = lightbox.querySelector('.lightbox__nav--next');
    var backdrop = lightbox.querySelector('.lightbox__backdrop');

    var galleryItems = document.querySelectorAll('.gallery__item');
    var images = [];
    var currentIndex = 0;

    // Extract background-image URLs from gallery items
    galleryItems.forEach(function (item) {
      var style = getComputedStyle(item);
      var bg = style.backgroundImage;
      var match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (match && match[1]) {
        // Use higher resolution for lightbox
        var url = match[1].replace(/w=\d+/, 'w=1600');
        images.push({ url: url, label: '' });
        var label = item.querySelector('.gallery__item-label');
        if (label) images[images.length - 1].label = label.textContent;
      }
    });

    function openLightbox(index) {
      if (!images.length) return;
      currentIndex = index;
      updateImage();
      lightbox.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    }

    function updateImage() {
      var data = images[currentIndex];
      lightboxImg.src = data.url;
      lightboxImg.alt = data.label;
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateImage();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      updateImage();
    }

    // Click on gallery items
    galleryItems.forEach(function (item, i) {
      item.addEventListener('click', function () {
        openLightbox(i);
      });
    });

    btnClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', showPrev);
    btnNext.addEventListener('click', showNext);

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  })();

  // --- Parallax-like subtle movement on hero ---
  var heroContent = document.querySelector('.hero__content');
  if (heroContent && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
        heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 0.5;
      }
    }, { passive: true });
  }

})();
