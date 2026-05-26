// ========================================
// MAIN APPLICATION JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function () {

  // ========================================
  // NAVBAR - MOBILE MENU
  // ========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const navLinks = document.querySelectorAll('.mobile-menu a');

  function openMobileMenu() {
    mobileMenuBtn.classList.add('active');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ========================================
  // NAVBAR - SCROLL EFFECT
  // ========================================
  const navbar = document.querySelector('.navbar-main');
  const topbar = document.querySelector('.topbar');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
      if (topbar) topbar.classList.add('hidden-bar');
    } else {
      navbar.classList.remove('scrolled');
      if (topbar) topbar.classList.remove('hidden-bar');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ========================================
  // NAVBAR - DROPDOWN MENUS (Desktop)
  // ========================================
  const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

  dropdownTriggers.forEach(trigger => {
    const parent = trigger.closest('.nav-item-dropdown');
    const dropdown = parent.querySelector('.nav-dropdown-menu');

    let timeout;

    parent.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      dropdown.classList.add('visible');
    });

    parent.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        dropdown.classList.remove('visible');
      }, 200);
    });
  });

  // ========================================
  // HERO SLIDER
  // ========================================
  const heroSlider = {
    currentSlide: 0,
    totalSlides: 4,
    autoPlayInterval: null,
    autoPlayDelay: 6000,
    isAnimating: false,

    init() {
      this.slides = document.querySelectorAll('.hero-slide');
      this.dots = document.querySelectorAll('.slider-dot');
      this.prevBtn = document.getElementById('slider-prev');
      this.nextBtn = document.getElementById('slider-next');
      this.progressBar = document.querySelector('.slider-progress-fill');

      if (!this.slides.length) return;

      this.totalSlides = this.slides.length;

      // Set up navigation
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Set up dots
      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });

      // Touch/Swipe support
      this.setupSwipe();

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      // Start autoplay
      this.startAutoPlay();

      // Pause on hover
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.addEventListener('mouseenter', () => this.stopAutoPlay());
        heroSection.addEventListener('mouseleave', () => this.startAutoPlay());
      }

      // Initial state
      this.showSlide(0);
    },

    showSlide(index) {
      if (this.isAnimating) return;
      this.isAnimating = true;

      // Remove active from current
      this.slides.forEach(slide => {
        slide.classList.remove('active', 'slide-exit');
      });

      // Exit animation for current slide
      if (this.slides[this.currentSlide]) {
        this.slides[this.currentSlide].classList.add('slide-exit');
      }

      this.currentSlide = index;

      // Enter animation for new slide
      setTimeout(() => {
        this.slides.forEach(slide => slide.classList.remove('slide-exit'));
        this.slides[this.currentSlide].classList.add('active');

        // Update dots
        this.dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === this.currentSlide);
        });

        // Reset progress bar
        this.resetProgress();

        this.isAnimating = false;
      }, 100);
    },

    next() {
      const nextIndex = (this.currentSlide + 1) % this.totalSlides;
      this.showSlide(nextIndex);
      this.restartAutoPlay();
    },

    prev() {
      const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
      this.showSlide(prevIndex);
      this.restartAutoPlay();
    },

    goTo(index) {
      if (index !== this.currentSlide) {
        this.showSlide(index);
        this.restartAutoPlay();
      }
    },

    startAutoPlay() {
      this.stopAutoPlay();
      this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
      this.resetProgress();
    },

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
      if (this.progressBar) {
        this.progressBar.style.animation = 'none';
      }
    },

    restartAutoPlay() {
      this.stopAutoPlay();
      this.startAutoPlay();
    },

    resetProgress() {
      if (this.progressBar) {
        this.progressBar.style.animation = 'none';
        // Trigger reflow
        void this.progressBar.offsetWidth;
        this.progressBar.style.animation = `progressFill ${this.autoPlayDelay}ms linear forwards`;
      }
    },

    setupSwipe() {
      const heroSection = document.getElementById('hero');
      if (!heroSection) return;

      let startX = 0;
      let endX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) this.next();
          else this.prev();
        }
      }, { passive: true });
    },

    /**
     * Update slide content when language changes
     */
    updateContent(translations) {
      if (!translations || !translations.hero || !translations.hero.slides) return;

      const slides = translations.hero.slides;
      this.slides.forEach((slideEl, i) => {
        if (!slides[i]) return;
        const subtitle = slideEl.querySelector('.hero-subtitle');
        const title = slideEl.querySelector('.hero-title');
        const desc = slideEl.querySelector('.hero-description');
        const ctaPrimary = slideEl.querySelector('.hero-cta-primary');
        const ctaSecondary = slideEl.querySelector('.hero-cta-secondary');

        if (subtitle) subtitle.textContent = slides[i].subtitle;
        if (title) title.textContent = slides[i].title;
        if (desc) desc.textContent = slides[i].description;
        if (ctaPrimary) ctaPrimary.textContent = slides[i].cta_primary;
        if (ctaSecondary) ctaSecondary.textContent = slides[i].cta_secondary;
      });
    }
  };

  // Initialize slider
  heroSlider.init();

  // ========================================
  // SCROLL REVEAL ANIMATIONS
  // ========================================
  const advantageCards = document.querySelectorAll('.advantage-card');
  
  if ('IntersectionObserver' in window && advantageCards.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    advantageCards.forEach(card => {
      revealObserver.observe(card);
    });
  }

  // ========================================
  // IMMERSION STAY - PILLARS ACCORDION
  // ========================================
  const pillarHeaders = document.querySelectorAll('.pillar-card-header');
  
  pillarHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const currentCard = this.closest('.pillar-card');
      const allCards = document.querySelectorAll('.pillar-card');
      const isActive = currentCard.classList.contains('active');
      
      // Close all cards
      allCards.forEach(card => {
        card.classList.remove('active');
      });
      
      // If the clicked card wasn't active, open it
      if (!isActive) {
        currentCard.classList.add('active');
      }
    });
  });

  // ========================================
  // TRANSLATION SYSTEM INIT
  // ========================================
  if (typeof TranslationManager !== 'undefined') {
    // Register hero slider and potential other handlers for language updates
    TranslationManager.onLanguageChange((translations) => {
      heroSlider.updateContent(translations);
      
      // Update advantages content if dynamically rendered/updated
      if (translations && translations.advantages && translations.advantages.items) {
        const advItems = translations.advantages.items;
        advantageCards.forEach((card, idx) => {
          if (advItems[idx]) {
            const titleEl = card.querySelector('.advantage-title');
            const descEl = card.querySelector('.advantage-desc');
            if (titleEl) titleEl.textContent = advItems[idx].title;
            if (descEl) descEl.textContent = advItems[idx].desc;
          }
        });
      }
    });

    // Initialize translations
    TranslationManager.init();
  }

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
