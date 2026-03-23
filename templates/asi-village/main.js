/* ============================================================
   ASI VILLAGE — Main JavaScript
   Vanilla JS | No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     HEADER SCROLL EFFECT
     ------------------------------------------------------- */
  const header = document.querySelector('.header');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* -------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      closeMobileNav();

      const headerHeight = header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  /* -------------------------------------------------------
     MOBILE NAVIGATION (burger toggles to X)
     ------------------------------------------------------- */
  const burger = document.querySelector('.header__burger');
  const mobileNav = document.querySelector('.mobile-nav');

  function openMobileNav() {
    if (mobileNav && burger) {
      mobileNav.classList.add('mobile-nav--active');
      burger.classList.add('header__burger--active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileNav && burger) {
      mobileNav.classList.remove('mobile-nav--active');
      burger.classList.remove('header__burger--active');
      document.body.style.overflow = '';
    }
  }

  function toggleMobileNav() {
    if (mobileNav && mobileNav.classList.contains('mobile-nav--active')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (burger) burger.addEventListener('click', toggleMobileNav);

  const mobileNavClose = document.querySelector('.mobile-nav__close');
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* -------------------------------------------------------
     MODAL SYSTEM
     ------------------------------------------------------- */
  const modals = document.querySelectorAll('.modal');

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';

    // Reset form if exists
    const form = modal.querySelector('.modal__form');
    const success = modal.querySelector('.modal__success');
    if (form) {
      form.style.display = '';
      form.reset();
    }
    if (success) success.classList.remove('modal__success--visible');

    // Reset consent error state
    const consent = modal.querySelector('.modal__consent');
    if (consent) consent.classList.remove('modal__consent--error');

    // Disable submit button (consent unchecked by default)
    updateSubmitState(modal);
  }

  function closeModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    if (!modal) return;

    modal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }

  // Open modal buttons (both desktop and mobile)
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      openModal(btn.dataset.modal);
    });
  });

  // Close modal — backdrop click
  modals.forEach(modal => {
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => closeModal(modal));
    }
  });

  // Close modal — close button
  document.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  // Close modal — Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('modal--active')) {
          closeModal(modal);
        }
      });
      closeMobileNav();
    }
  });

  /* -------------------------------------------------------
     CONSENT CHECKBOX VALIDATION
     ------------------------------------------------------- */
  function updateSubmitState(modal) {
    const checkbox = modal.querySelector('.modal__checkbox');
    const submit = modal.querySelector('.modal__submit');
    if (checkbox && submit) {
      submit.disabled = !checkbox.checked;
    }
  }

  document.querySelectorAll('.modal__checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const modal = checkbox.closest('.modal');
      const consent = checkbox.closest('.modal__consent');

      if (checkbox.checked) {
        consent.classList.remove('modal__consent--error');
      }

      updateSubmitState(modal);
    });
  });

  /* -------------------------------------------------------
     FORM HANDLING
     ------------------------------------------------------- */
  document.querySelectorAll('.modal__form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate consent checkbox
      const checkbox = form.querySelector('.modal__checkbox');
      const consent = form.querySelector('.modal__consent');
      if (checkbox && !checkbox.checked) {
        consent.classList.add('modal__consent--error');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log('Form submitted:', data);

      // Show success state
      form.style.display = 'none';
      const success = form.closest('.modal__container').querySelector('.modal__success');
      if (success) {
        success.classList.add('modal__success--visible');
      }

      // Auto-close after delay
      setTimeout(() => {
        closeModal(form.closest('.modal'));
      }, 3000);
    });
  });

  /* -------------------------------------------------------
     CTA INLINE FORM
     ------------------------------------------------------- */
  const ctaForm = document.getElementById('cta-form');
  const ctaCheckbox = document.querySelector('.cta__checkbox');
  const ctaSubmit = ctaForm ? ctaForm.querySelector('.cta__submit') : null;

  if (ctaCheckbox && ctaSubmit) {
    ctaCheckbox.addEventListener('change', () => {
      ctaSubmit.disabled = !ctaCheckbox.checked;
      if (ctaCheckbox.checked) {
        ctaCheckbox.closest('.cta__consent').classList.remove('cta__consent--error');
      }
    });
  }

  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const checkbox = ctaForm.querySelector('.cta__checkbox');
      const consent = ctaForm.querySelector('.cta__consent');
      if (checkbox && !checkbox.checked) {
        consent.classList.add('cta__consent--error');
        return;
      }

      const formData = new FormData(ctaForm);
      const data = Object.fromEntries(formData.entries());
      console.log('CTA form submitted:', data);

      ctaForm.style.display = 'none';
      const success = ctaForm.closest('.cta__form-wrapper').querySelector('.cta__success');
      if (success) {
        success.classList.add('cta__success--visible');
      }
    });
  }

  /* -------------------------------------------------------
     SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* -------------------------------------------------------
     PHONE INPUT FORMATTING
     ------------------------------------------------------- */
  document.querySelectorAll('.modal__input[type="tel"], .cta__input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^\d+\-\s()]/g, '');
    });
  });

  /* -------------------------------------------------------
     LIGHTBOX (Gallery)
     ------------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (galleryItems.length > 0) {
    // Collect image sources and alts
    const slides = [];
    galleryItems.forEach(item => {
      const img = item.querySelector('.gallery__item-image');
      if (img) {
        slides.push({
          src: img.src.replace(/w=\d+/, 'w=1600'),
          alt: img.alt
        });
      }
    });

    // Build lightbox DOM
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox__close" aria-label="Close">&times;</button>
      <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Previous">&#8249;</button>
      <button class="lightbox__arrow lightbox__arrow--next" aria-label="Next">&#8250;</button>
      <div class="lightbox__viewport">
        <div class="lightbox__track">
          ${slides.map((s) => `
            <div class="lightbox__slide">
              <img src="${s.src}" alt="${s.alt}" draggable="false">
            </div>
          `).join('')}
        </div>
      </div>
      <div class="lightbox__dots">
        ${slides.map((_, i) => `<button class="lightbox__dot" data-index="${i}"></button>`).join('')}
      </div>
      <div class="lightbox__counter">
        <span class="lightbox__current">1</span> / ${slides.length}
      </div>
    `;
    document.body.appendChild(lightbox);

    const track = lightbox.querySelector('.lightbox__track');
    const dots = lightbox.querySelectorAll('.lightbox__dot');
    const counter = lightbox.querySelector('.lightbox__current');
    let currentIndex = 0;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}vw)`;
      dots.forEach((d, i) => d.classList.toggle('lightbox__dot--active', i === currentIndex));
      counter.textContent = currentIndex + 1;
    }

    function openLightbox(index) {
      goToSlide(index);
      lightbox.classList.add('lightbox--active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--active');
      document.body.style.overflow = '';
    }

    // Open on gallery item click
    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    // Close
    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox__slide') || e.target.classList.contains('lightbox__viewport')) {
        closeLightbox();
      }
    });

    // Arrows
    lightbox.querySelector('.lightbox__arrow--prev').addEventListener('click', () => goToSlide(currentIndex - 1));
    lightbox.querySelector('.lightbox__arrow--next').addEventListener('click', () => goToSlide(currentIndex + 1));

    // Dots
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index, 10)));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('lightbox--active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const baseOffset = -currentIndex * window.innerWidth;
      track.style.transform = `translateX(${baseOffset + diff}px)`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      track.style.transition = '';
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const threshold = window.innerWidth * 0.2;

      if (Math.abs(diff) > threshold) {
        if (diff < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      } else {
        goToSlide(currentIndex); // snap back
      }
    });
  }

});
