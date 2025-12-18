(function() {
  'use strict';

  window.__app = window.__app || {};

  const utils = {
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => { inThrottle = false; }, limit);
        }
      };
    },

    debounce: function(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },

    getHeaderHeight: function() {
      const header = document.querySelector('.navbar, .l-header');
      return header ? header.offsetHeight : 72;
    },

    isHomePage: function() {
      const path = window.location.pathname;
      return path === '/' || path === '/index.html' || path.endsWith('/index.html');
    }
  };

  function initBurgerMenu() {
    if (window.__app.burgerInit) return;
    window.__app.burgerInit = true;

    const toggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const body = document.body;
    const headerHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72px';

    if (!toggler || !navbarCollapse) return;

    let isOpen = false;

    toggler.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      isOpen = !isOpen;
      
      if (isOpen) {
        navbarCollapse.classList.add('show');
        toggler.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
        navbarCollapse.style.height = `calc(100vh - ${headerHeight})`;
      } else {
        navbarCollapse.classList.remove('show');
        toggler.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        navbarCollapse.style.height = '0';
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !toggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
        navbarCollapse.classList.remove('show');
        toggler.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        navbarCollapse.style.height = '0';
        isOpen = false;
      }
    });

    const navLinks = navbarCollapse.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) {
          navbarCollapse.classList.remove('show');
          toggler.setAttribute('aria-expanded', 'false');
          body.style.overflow = '';
          navbarCollapse.style.height = '0';
          isOpen = false;
        }
      });
    });

    window.addEventListener('resize', utils.throttle(() => {
      if (window.innerWidth >= 768 && isOpen) {
        navbarCollapse.classList.remove('show');
        toggler.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        navbarCollapse.style.height = '';
        isOpen = false;
      }
    }, 250));
  }

  function initScrollEffects() {
    if (window.__app.scrollInit) return;
    window.__app.scrollInit = true;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.card, .c-card, img, .hero-section, .c-hero-section, .c-button, .btn');
    
    animatedElements.forEach(el => {
      if (!el.classList.contains('no-animate')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
      }
    });

    const style = document.createElement('style');
    style.textContent = `
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function initMicroInteractions() {
    if (window.__app.microInit) return;
    window.__app.microInit = true;

    const buttons = document.querySelectorAll('.btn, .c-button, a.nav-link');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function(e) {
        this.style.transition = 'all 0.3s ease-in-out';
        
        if (this.classList.contains('btn-primary') || this.classList.contains('c-button--primary')) {
          this.style.transform = 'translateY(-2px) scale(1.02)';
          this.style.boxShadow = '0 10px 20px rgba(74, 144, 164, 0.3)';
        } else if (this.classList.contains('btn-secondary') || this.classList.contains('c-button--secondary')) {
          this.style.transform = 'translateY(-2px) scale(1.02)';
          this.style.boxShadow = '0 10px 20px rgba(143, 188, 143, 0.3)';
        } else {
          this.style.transform = 'scale(1.05)';
        }
      });

      button.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });

      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(rippleStyle);
  }

  function initCardAnimations() {
    if (window.__app.cardInit) return;
    window.__app.cardInit = true;

    const cards = document.querySelectorAll('.card, .c-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.4s ease-in-out';
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  function initScrollSpy() {
    if (window.__app.scrollSpyInit) return;
    window.__app.scrollSpyInit = true;

    if (!utils.isHomePage()) return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: `-${utils.getHeaderHeight()}px 0px -60% 0px`
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  function initSmoothScroll() {
    if (window.__app.smoothScrollInit) return;
    window.__app.smoothScrollInit = true;

    document.addEventListener('click', function(e) {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href === '#' || href === '#!') return;

      if (utils.isHomePage()) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = utils.getHeaderHeight();
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initCountUp() {
    if (window.__app.countUpInit) return;
    window.__app.countUpInit = true;

    const stats = document.querySelectorAll('[data-count]');
    
    if (stats.length === 0) return;

    const animateCount = (element) => {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCount = () => {
        current += step;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCount);
        } else {
          element.textContent = target;
        }
      };

      updateCount();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  }

  function initFormValidation() {
    if (window.__app.formValidationInit) return;
    window.__app.formValidationInit = true;

    const forms = document.querySelectorAll('form');
    
    const validators = {
      firstName: {
        pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
        message: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen)'
      },
      lastName: {
        pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
        message: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen)'
      },
      email: {
        pattern: /^[^s@]+@[^s@]+.[^s@]+$/,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      phone: {
        pattern: /^[ds+-()[]]{10,20}$/,
        message: 'Bitte geben Sie eine gültige Telefonnummer ein'
      },
      message: {
        minLength: 10,
        message: 'Bitte geben Sie mindestens 10 Zeichen ein'
      }
    };

    const showError = (input, message) => {
      input.classList.add('has-error');
      let errorDiv = input.parentElement.querySelector('.invalid-feedback');
      
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        input.parentElement.appendChild(errorDiv);
      }
      
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    };

    const clearError = (input) => {
      input.classList.remove('has-error');
      const errorDiv = input.parentElement.querySelector('.invalid-feedback');
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    };

    const validateField = (input) => {
      const id = input.id;
      const value = input.value.trim();
      
      if (input.hasAttribute('required') && !value) {
        showError(input, 'Dieses Feld ist erforderlich');
        return false;
      }

      if (validators[id]) {
        const validator = validators[id];
        
        if (validator.pattern && !validator.pattern.test(value)) {
          showError(input, validator.message);
          return false;
        }
        
        if (validator.minLength && value.length < validator.minLength) {
          showError(input, validator.message);
          return false;
        }
      }

      if (input.type === 'checkbox' && input.hasAttribute('required') && !input.checked) {
        showError(input, 'Bitte akzeptieren Sie die Bedingungen');
        return false;
      }

      clearError(input);
      return true;
    };

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('has-error')) {
            validateField(input);
          }
        });
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        inputs.forEach(input => {
          if (!validateField(input)) {
            isValid = false;
          }
        });

        if (!isValid) {
          const firstError = form.querySelector('.has-error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          }
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';
        }

        const spinKeyframes = document.createElement('style');
        spinKeyframes.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(spinKeyframes);

        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, 1500);
      });
    });
  }

  function initLazyLoading() {
    if (window.__app.lazyLoadInit) return;
    window.__app.lazyLoadInit = true;

    const images = document.querySelectorAll('img:not([loading])');
    const videos = document.querySelectorAll('video:not([loading])');

    images.forEach(img => {
      if (!img.classList.contains('no-lazy')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    videos.forEach(video => {
      if (!video.classList.contains('no-lazy')) {
        video.setAttribute('loading', 'lazy');
      }
    });
  }

  function initScrollToTop() {
    if (window.__app.scrollTopInit) return;
    window.__app.scrollTopInit = true;

    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', utils.throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 200));

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1) translateY(-3px)';
      this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });

    scrollBtn.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    });
  }

  function initPortfolioFilter() {
    if (window.__app.filterInit) return;
    window.__app.filterInit = true;

    const filterButtons = document.querySelectorAll('[data-filter]');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length === 0 || portfolioItems.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        portfolioItems.forEach(item => {
          item.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
          
          if (filter === 'all' || item.classList.contains(filter)) {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
            item.style.display = 'block';
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 400);
          }
        });
      });
    });
  }

  function initCarousel() {
    if (window.__app.carouselInit) return;
    window.__app.carouselInit = true;

    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
      const items = carousel.querySelectorAll('.carousel-item');
      const prevBtn = carousel.querySelector('.carousel-control-prev');
      const nextBtn = carousel.querySelector('.carousel-control-next');
      
      if (items.length === 0) return;

      let currentIndex = 0;

      const showSlide = (index) => {
        items.forEach((item, i) => {
          item.classList.remove('active');
          if (i === index) {
            item.classList.add('active');
          }
        });
      };

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          showSlide(currentIndex);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % items.length;
          showSlide(currentIndex);
        });
      }
    });
  }

  function initPrivacyModal() {
    if (window.__app.privacyModalInit) return;
    window.__app.privacyModalInit = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('http')) {
          return;
        }
        
        if (href === '#') {
          e.preventDefault();
          
          const modal = document.createElement('div');
          modal.className = 'privacy-modal';
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          `;

          const content = document.createElement('div');
          content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease-in-out;
          `;
          content.innerHTML = `
            <h2>Datenschutzerklärung</h2>
            <p>Hier steht Ihre Datenschutzerklärung...</p>
            <button class="btn btn-primary" style="margin-top: 20px;">Schließen</button>
          `;

          modal.appendChild(content);
          document.body.appendChild(modal);

          setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
          }, 10);

          const closeBtn = content.querySelector('button');
          closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => modal.remove(), 300);
          });

          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              modal.style.opacity = '0';
              content.style.transform = 'scale(0.8)';
              setTimeout(() => modal.remove(), 300);
            }
          });
        }
      });
    });
  }

  function initActiveMenu() {
    if (window.__app.activeMenuInit) return;
    window.__app.activeMenuInit = true;

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      link.classList.remove('active');
      link.removeAttribute('aria-current');

      let isMatch = false;
      
      if (href === '/' || href === '/index.html') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html')) {
          isMatch = true;
        }
      } else if (href && currentPath.includes(href)) {
        isMatch = true;
      }

      if (isMatch) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  window.__app.init = function() {
    if (window.__app.initialized) return;
    window.__app.initialized = true;

    initBurgerMenu();
    initScrollEffects();
    initMicroInteractions();
    initCardAnimations();
    initScrollSpy();
    initSmoothScroll();
    initCountUp();
    initFormValidation();
    initLazyLoading();
    initScrollToTop();
    initPortfolioFilter();
    initCarousel();
    initPrivacyModal();
    initActiveMenu();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__app.init);
  } else {
    window.__app.init();
  }

})();
# Enhanced CSS Animations

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.navbar-collapse {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-collapse.show {
  animation: slideInLeft 0.4s ease-out;
}

.card, .c-card {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }

.btn, .c-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn::before, .c-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before, .c-button:hover::before {
  width: 300px;
  height: 300px;
}

.hero-section {
  animation: fadeIn 1s ease-out;
}

.hero-section h1 {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-section p {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-section .btn {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

img {
  transition: transform 0.4s ease-in-out, filter 0.4s ease-in-out;
}

img:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.form-control:focus,
.form-select:focus {
  animation: pulse 0.5s ease-in-out;
}

.navbar {
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: all 0.3s ease-in-out;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 80%;
}

.portfolio-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.portfolio-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.breadcrumb-item {
  animation: slideInLeft 0.5s ease-out;
}

.breadcrumb-item:nth-child(1) { animation-delay: 0s; }
.breadcrumb-item:nth-child(2) { animation-delay: 0.1s; }
.breadcrumb-item:nth-child(3) { animation-delay: 0.2s; }

.alert {
  animation: slideInRight 0.5s ease-out;
}

footer {
  animation: fadeIn 0.8s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.scroll-to-top {
  animation: fadeInUp 0.5s ease-out;
}

.form-control.has-error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

[data-aos="fade-up"] {
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
}

[data-aos="fade-up"].aos-animate {
  transform: translateY(0);
  opacity: 1;
}

.bg-primary,
.bg-dark {
  position: relative;
  overflow: hidden;
}

.bg-primary::before,
.bg-dark::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
