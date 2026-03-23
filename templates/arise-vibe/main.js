/* ============================================
   Arise Vibe — Main JavaScript
   Vanilla JS — No frameworks
   ============================================ */

(function () {
    'use strict';

    // ---- DOM Elements ----
    const header = document.getElementById('header');
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuOverlay = mobileMenu ? mobileMenu.querySelector('.mobile-menu__overlay') : null;
    const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('.mobile-menu__link') : [];
    const contactForm = document.getElementById('contact-form');
    const modalForm = document.getElementById('modal-form');

    // ---- Sticky Header ----
    function handleScroll() {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile Menu ----
    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('mobile-menu--open');
        document.body.classList.add('no-scroll');
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('mobile-menu--open');
        document.body.classList.remove('no-scroll');
    }

    if (burgerBtn) burgerBtn.addEventListener('click', openMobileMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    mobileMenuLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            var headerHeight = header ? header.offsetHeight : 0;
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    // ---- Modal ----
    function openModal(modalId) {
        var modal = document.getElementById('modal-' + modalId);
        if (!modal) return;
        modal.classList.add('modal--open');
        document.body.classList.add('no-scroll');
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('modal--open');
        document.body.classList.remove('no-scroll');
    }

    window.closeAllModals = function () {
        document.querySelectorAll('.modal--open').forEach(function (modal) {
            closeModal(modal);
        });
    };

    // CTA buttons open modal
    document.querySelectorAll('[data-modal]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Close modal via close button
    document.querySelectorAll('.modal__close').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal via overlay click
    document.querySelectorAll('.modal__overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function () {
            var modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            window.closeAllModals();
            closeMobileMenu();
        }
    });

    // ---- Localization ----
    var isRu = document.documentElement.lang === 'ru';
    var messages = isRu ? {
        nameRequired: 'Пожалуйста, введите ваше имя',
        nameMin: 'Имя должно содержать минимум 2 символа',
        emailRequired: 'Пожалуйста, введите ваш email',
        emailInvalid: 'Пожалуйста, введите корректный email',
        phoneRequired: 'Пожалуйста, введите номер телефона',
        phoneInvalid: 'Пожалуйста, введите корректный номер телефона'
    } : {
        nameRequired: 'Please enter your name',
        nameMin: 'Name must be at least 2 characters',
        emailRequired: 'Please enter your email',
        emailInvalid: 'Please enter a valid email',
        phoneRequired: 'Please enter your phone number',
        phoneInvalid: 'Please enter a valid phone number'
    };

    // ---- Form Validation ----
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Allow +, digits, spaces, hyphens, parentheses; minimum 7 digits
        var cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.length >= 7 && cleaned.length <= 15;
    }

    function showError(inputEl, errorEl, message) {
        if (inputEl) inputEl.classList.add(
            inputEl.classList.contains('contact__form-input')
                ? 'contact__form-input--error'
                : 'modal__form-input--error'
        );
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(inputEl, errorEl) {
        if (inputEl) {
            inputEl.classList.remove('contact__form-input--error');
            inputEl.classList.remove('modal__form-input--error');
        }
        if (errorEl) errorEl.textContent = '';
    }

    function validateForm(form, prefix) {
        var isValid = true;

        // Name
        var nameInput = form.querySelector('[name="name"]');
        var nameError = document.getElementById(prefix + '-name');
        if (nameInput) {
            clearError(nameInput, nameError);
            if (!nameInput.value.trim()) {
                showError(nameInput, nameError, messages.nameRequired);
                isValid = false;
            } else if (nameInput.value.trim().length < 2) {
                showError(nameInput, nameError, messages.nameMin);
                isValid = false;
            }
        }

        // Email
        var emailInput = form.querySelector('[name="email"]');
        var emailError = document.getElementById(prefix + '-email');
        if (emailInput) {
            clearError(emailInput, emailError);
            if (!emailInput.value.trim()) {
                showError(emailInput, emailError, messages.emailRequired);
                isValid = false;
            } else if (!validateEmail(emailInput.value.trim())) {
                showError(emailInput, emailError, messages.emailInvalid);
                isValid = false;
            }
        }

        // Phone
        var phoneInput = form.querySelector('[name="phone"]');
        var phoneError = document.getElementById(prefix + '-phone');
        if (phoneInput) {
            clearError(phoneInput, phoneError);
            if (!phoneInput.value.trim()) {
                showError(phoneInput, phoneError, messages.phoneRequired);
                isValid = false;
            } else if (!validatePhone(phoneInput.value.trim())) {
                showError(phoneInput, phoneError, messages.phoneInvalid);
                isValid = false;
            }
        }

        return isValid;
    }

    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateForm(contactForm, 'error')) {
                contactForm.reset();
                openModal('success');
            }
        });
    }

    // Modal form
    if (modalForm) {
        modalForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateForm(modalForm, 'modal-error')) {
                modalForm.reset();
                closeModal(document.getElementById('modal-presentation'));
                openModal('success');
            }
        });
    }

    // Clear errors on input
    document.querySelectorAll('.contact__form-input, .modal__form-input').forEach(function (input) {
        input.addEventListener('input', function () {
            var errorId;
            var form = this.closest('form');
            if (form && form.id === 'modal-form') {
                errorId = 'modal-error-' + this.name;
            } else {
                errorId = 'error-' + this.name;
            }
            var errorEl = document.getElementById(errorId);
            clearError(this, errorEl);
        });
    });

    // ---- Lightbox ----
    function initLightbox() {
        var lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        var lightboxImg = lightbox.querySelector('.lightbox__img');
        var lightboxCounter = lightbox.querySelector('.lightbox__counter');
        var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
        var nextBtn = lightbox.querySelector('.lightbox__nav--next');
        var closeBtn = lightbox.querySelector('.lightbox__close');
        var overlay = lightbox.querySelector('.lightbox__overlay');

        var galleryItems = document.querySelectorAll('.gallery__item');
        var images = [];
        var currentIndex = 0;

        galleryItems.forEach(function (item, index) {
            var img = item.querySelector('.gallery__img');
            if (img) {
                images.push({
                    src: img.src.replace(/w=\d+/, 'w=1600').replace(/h=\d+/, 'h=1200'),
                    alt: img.alt
                });
                item.addEventListener('click', function () {
                    openLightbox(index);
                });
            }
        });

        function openLightbox(index) {
            currentIndex = index;
            updateImage();
            lightbox.classList.add('lightbox--open');
            document.body.classList.add('no-scroll');
        }

        function closeLightbox() {
            lightbox.classList.remove('lightbox--open');
            document.body.classList.remove('no-scroll');
        }

        function updateImage() {
            lightboxImg.style.opacity = '0';
            setTimeout(function () {
                lightboxImg.src = images[currentIndex].src;
                lightboxImg.alt = images[currentIndex].alt;
                lightboxImg.style.opacity = '1';
            }, 150);
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

        if (prevBtn) prevBtn.addEventListener('click', showPrev);
        if (nextBtn) nextBtn.addEventListener('click', showNext);
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (overlay) overlay.addEventListener('click', closeLightbox);

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('lightbox--open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        // Touch swipe support
        var touchStartX = 0;
        var touchStartY = 0;
        var touchEndX = 0;
        var touchEndY = 0;

        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            var diffX = touchStartX - touchEndX;
            var diffY = touchStartY - touchEndY;

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    showNext();
                } else {
                    showPrev();
                }
            }
        }, { passive: true });
    }

    // ---- Scroll Reveal Animation ----
    function initReveal() {
        var revealElements = document.querySelectorAll('.section__header, .concept__card, .amenities__item, .gallery__item, .floor-plan__card, .investment__table-wrap, .investment__cta, .location__distance, .location__map, .contact__form, .contact__info');

        revealElements.forEach(function (el) {
            el.classList.add('reveal');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ---- Active Navigation Highlight ----
    function initActiveNav() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.header__nav-link');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.classList.remove('header__nav-link--active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('header__nav-link--active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    // ---- Initialize ----
    document.addEventListener('DOMContentLoaded', function () {
        initReveal();
        initActiveNav();
        initLightbox();
    });

})();
