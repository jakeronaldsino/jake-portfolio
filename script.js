/**
 * Jake Ronald Sinon — Premium Portfolio
 */

(function () {
  'use strict';

  // ========== Loader ==========
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('hidden');
      }, 600);
    }
  });

  // ========== Footer year ==========
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ========== Dark mode toggle ==========
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  function updateThemeIcon() {
    if (!themeToggle) return;
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    themeToggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      updateThemeIcon();
    });
  }

  // ========== Mobile nav ==========
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========== Smooth scroll ==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========== Header scroll ==========
  var header = document.getElementById('header');
  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ========== Active nav ==========
  var sectionIds = ['hero', 'about', 'skills', 'services', 'experience', 'portfolio', 'testimonials', 'contact'];
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveNav() {
    var scrollY = window.scrollY + 120;
    var current = 'hero';
    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section && scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        current = id;
      }
    });
    navAnchors.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  // ========== Scroll reveal ==========
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ========== Animated counters ==========
  function animateCounter(el, target, suffix) {
    suffix = suffix || '';
    var duration = 1800;
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var value = Math.floor(progress * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counterEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, suffix);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObs.observe(el); });
  }

  // ========== Skill progress bars ==========
  var skillCards = document.querySelectorAll('.skill-card');
  if ('IntersectionObserver' in window) {
    var skillObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target;
          var percent = card.getAttribute('data-percent') || '0';
          var fill = card.querySelector('.skill-fill');
          if (fill) fill.style.width = percent + '%';
          skillObs.unobserve(card);
        }
      });
    }, { threshold: 0.3 });
    skillCards.forEach(function (card) { skillObs.observe(card); });
  }

  // ========== Testimonial slider ==========
  var testimonialCards = document.querySelectorAll('.testimonial-card');
  var testimonialPrev = document.getElementById('testimonialPrev');
  var testimonialNext = document.getElementById('testimonialNext');
  var testimonialDots = document.getElementById('testimonialDots');
  var testimonialIndex = 0;
  var testimonialTimer;

  function showTestimonial(index) {
    if (!testimonialCards.length) return;
    testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
    testimonialCards.forEach(function (card, i) {
      card.classList.toggle('active', i === testimonialIndex);
    });
    if (testimonialDots) {
      testimonialDots.querySelectorAll('button').forEach(function (dot, i) {
        dot.classList.toggle('active', i === testimonialIndex);
      });
    }
  }

  if (testimonialDots && testimonialCards.length) {
    testimonialCards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () {
        showTestimonial(i);
        resetTestimonialTimer();
      });
      testimonialDots.appendChild(dot);
    });
  }

  function resetTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(function () {
      showTestimonial(testimonialIndex + 1);
    }, 6000);
  }

  if (testimonialPrev) testimonialPrev.addEventListener('click', function () { showTestimonial(testimonialIndex - 1); resetTestimonialTimer(); });
  if (testimonialNext) testimonialNext.addEventListener('click', function () { showTestimonial(testimonialIndex + 1); resetTestimonialTimer(); });
  if (testimonialCards.length) resetTestimonialTimer();

  // ========== Contact form ==========
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var subject = document.getElementById('subject').value.trim();
      var message = document.getElementById('message').value.trim();
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:jakeronaldsinon@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
    });
  }


  // ========== Parallax hero ==========
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      if (window.innerWidth > 768) {
        heroBg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)';
      }
    }, { passive: true });
  }

  // ========== Gallery modal ==========
  var SAMPLE_IMAGES = {
    leadgen: ['images/leadgen1.png', 'images/leadgen2.png', 'images/leadgen3.png'],
    productlisting: ['images/product1.png', 'images/product2.png'],
    dataentry: ['images/data1.png', 'images/data2.png']
  };
  var SAMPLE_TITLES = {
    leadgen: 'Lead Generation Campaigns',
    productlisting: 'Shopify Product Listings',
    dataentry: 'Data Entry Projects'
  };

  var sampleModal = document.getElementById('sampleModal');
  var sampleModalTrack = document.getElementById('sampleModalTrack');
  var sampleModalViewport = document.getElementById('sampleModalViewport');
  var sampleModalTitle = document.getElementById('sampleModalTitle');
  var sampleModalClose = document.getElementById('sampleModalClose');
  var sampleModalBackdrop = document.getElementById('sampleModalBackdrop');
  var sampleModalPrev = document.getElementById('sampleModalPrev');
  var sampleModalNext = document.getElementById('sampleModalNext');
  var sampleModalCurrentIndex = 0;
  var sampleModalTotalSlides = 0;

  function goToSampleSlide(index) {
    if (sampleModalTotalSlides <= 0 || !sampleModalViewport) return;
    sampleModalCurrentIndex = Math.max(0, Math.min(index, sampleModalTotalSlides - 1));
    sampleModalViewport.scrollTo({
      left: sampleModalCurrentIndex * sampleModalViewport.clientWidth,
      behavior: 'smooth'
    });
    if (sampleModalPrev) sampleModalPrev.style.visibility = sampleModalCurrentIndex === 0 || sampleModalTotalSlides <= 1 ? 'hidden' : 'visible';
    if (sampleModalNext) sampleModalNext.style.visibility = sampleModalCurrentIndex === sampleModalTotalSlides - 1 || sampleModalTotalSlides <= 1 ? 'hidden' : 'visible';
  }

  function openGalleryModal(title, imagePaths) {
    if (!sampleModal || !sampleModalTrack || !imagePaths.length) return;
    sampleModalTitle.textContent = title;
    sampleModalTrack.innerHTML = '';
    sampleModalTotalSlides = imagePaths.length;
    sampleModalCurrentIndex = 0;

    imagePaths.forEach(function (src) {
      var slide = document.createElement('div');
      slide.className = 'sample-modal-slide';
      var img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = 'lazy';
      slide.appendChild(img);
      sampleModalTrack.appendChild(slide);
    });

    sampleModalTrack.style.width = (sampleModalTotalSlides * 100) + '%';
    sampleModalTrack.querySelectorAll('.sample-modal-slide').forEach(function (slide) {
      slide.style.flex = '0 0 ' + (100 / sampleModalTotalSlides) + '%';
    });

    sampleModalViewport.scrollLeft = 0;
    goToSampleSlide(0);
    sampleModal.classList.add('is-open');
    sampleModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSampleModal() {
    if (!sampleModal) return;
    sampleModal.classList.remove('is-open');
    sampleModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openModal(type) {
    var paths = SAMPLE_IMAGES[type];
    var title = SAMPLE_TITLES[type] || 'Portfolio';
    if (paths && paths.length) openGalleryModal(title, paths);
  }

  if (sampleModalClose) sampleModalClose.addEventListener('click', closeSampleModal);
  if (sampleModalBackdrop) sampleModalBackdrop.addEventListener('click', closeSampleModal);
  if (sampleModalPrev) sampleModalPrev.addEventListener('click', function (e) { e.stopPropagation(); goToSampleSlide(sampleModalCurrentIndex - 1); });
  if (sampleModalNext) sampleModalNext.addEventListener('click', function (e) { e.stopPropagation(); goToSampleSlide(sampleModalCurrentIndex + 1); });

  document.querySelectorAll('.portfolio-card[data-sample-type]').forEach(function (card) {
    card.addEventListener('click', function () {
      var type = card.getAttribute('data-sample-type');
      if (type) openModal(type);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var type = card.getAttribute('data-sample-type');
        if (type) openModal(type);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!sampleModal || !sampleModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeSampleModal();
    if (e.key === 'ArrowLeft') goToSampleSlide(sampleModalCurrentIndex - 1);
    if (e.key === 'ArrowRight') goToSampleSlide(sampleModalCurrentIndex + 1);
  });

  window.openModal = openModal;
})();
