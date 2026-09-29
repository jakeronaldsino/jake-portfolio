/**
 * Jake Ronald Sinon - Portfolio
 */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========== Footer year ==========
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ========== Dark mode toggle ==========
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (e) { /* storage unavailable */ }
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

  function updateThemeIcon() {
    if (!themeToggle) return;
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    themeToggle.innerHTML = isLight ? '<i class="fas fa-moon" aria-hidden="true"></i>' : '<i class="fas fa-sun" aria-hidden="true"></i>';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'light');
      try { localStorage.setItem('theme', isLight ? 'dark' : 'light'); } catch (e) { /* storage unavailable */ }
      updateThemeIcon();
    });
  }

  // ========== Sidebar / mobile drawer ==========
  var navToggle = document.getElementById('navToggle');
  var sidebar = document.getElementById('sidebar');
  var sidebarBackdrop = document.getElementById('sidebarBackdrop');
  var drawerQuery = window.matchMedia('(max-width: 1100px)');

  function setNav(open) {
    if (!sidebar || !navToggle) return;
    sidebar.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (sidebarBackdrop) sidebarBackdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = sidebar.querySelector('.nav-links a');
      if (first) focusDialog(first); // drawer may still be finishing its visibility change
    }
  }
  if (navToggle && sidebar) {
    navToggle.addEventListener('click', function () { setNav(!sidebar.classList.contains('open')); });
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', function () { setNav(false); });
    sidebar.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () { if (drawerQuery.matches) setNav(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) { setNav(false); navToggle.focus(); }
    });
    // Leaving drawer mode (e.g. rotating a tablet) should never leave the page locked
    var onModeChange = function () { if (!drawerQuery.matches && sidebar.classList.contains('open')) setNav(false); };
    if (drawerQuery.addEventListener) drawerQuery.addEventListener('change', onModeChange);
  }

  // ========== Smooth scroll ==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (href === '#main') target.focus({ preventScroll: true });
      }
    });
  });

  // ========== Header scroll ==========
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ========== Active nav ==========
  var sectionIds = ['hero', 'overview', 'portfolio', 'experience', 'services', 'skills', 'about', 'credentials', 'contact'];
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveNav() {
    var scrollY = window.scrollY + window.innerHeight * 0.35;
    var current = 'hero';
    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section && scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        current = id;
      }
    });
    navAnchors.forEach(function (link) {
      var active = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  // ========== Scroll progress ==========
  var progressEl = document.getElementById('scrollProgress');
  if (progressEl) {
    var progressTicking = false;
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressEl.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      progressTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!progressTicking) { progressTicking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ========== Staggered reveal timing ==========
  // Cards that share a parent enter one after another (max ~300ms spread).
  document.querySelectorAll('.reveal').forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 5) * 60 + 'ms');
  });

  // ========== Scroll reveal ==========
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
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

  // ========== Contact form ==========
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var subject = document.getElementById('subject').value.trim();
      var message = document.getElementById('message').value.trim();
      var body = encodeURIComponent(message + '\n\n- ' + name + ' (' + email + ')');
      window.location.href = 'mailto:jakeronaldsinon@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
    });
  }

  // ========== Portfolio projects (case studies) ==========
  // Only facts supported by the work files and resume. Omit a section rather than guess.
  var IMG = 'images/portfolio/';
  var PROJECTS = {
    etsy: {
      title: 'Etsy Product Listing',
      category: 'E-commerce',
      overview: 'Product listing work for an Etsy shop. I sourced products from a supplier, logged them in a product tracker, and built complete listings in Etsy Shop Manager.',
      role: 'Etsy Product Listing Specialist',
      tasks: [
        'Created new Etsy listings with keyword-rich titles, photos, and descriptions',
        'Set up product variations (such as color options) and linked each option to its photo',
        'Completed item attributes (pattern, sleeve length, tags, materials) and shipping and return settings',
        'Sourced product details, sizes, variants, and supplier prices from AliExpress',
        'Prepared and organized edited product photos in Google Drive',
        'Kept a product tracker with date, listing SKU, supplier link, title, tags, listing price, supplier price, and publish status'
      ],
      tools: ['Etsy Shop Manager', 'AliExpress', 'Google Sheets', 'Google Drive', 'Photoroom'],
      process: [
        { t: 'Source', d: 'Open the supplier product and record the title details, variants, sizes, and supplier price.' },
        { t: 'Prepare', d: 'Edit and organize the product photos in Drive.' },
        { t: 'Log', d: 'Add the product to the tracker with its SKU, supplier link, title, tags, and pricing.' },
        { t: 'List', d: 'Build the listing: title, photos, description, variations, attributes, and shipping.' },
        { t: 'Check & publish', d: 'Review the listing against the tracker and mark it as published once approved.' }
      ],
      samples: [
        { src: 'etsy-listing-title.jpg', caption: 'New Etsy listing with a keyword-rich product title' },
        { src: 'etsy-variations.jpg', caption: 'Custom color variation with each option linked to its product photo' },
        { src: 'etsy-details.jpg', caption: 'Completing item attributes in the listing details' },
        { src: 'supplier-sourcing.jpg', caption: 'Supplier product page used to source variants, sizes, and pricing' },
        { src: 'product-tracker.jpg', caption: 'Product tracker: SKU, supplier link, title, tags, pricing, and publish status' }
      ],
      note: 'Shop and client names are redacted. The full screen recording is not published because it shows client details.',
      skills: ['Etsy Product Listing', 'SEO Titles & Tags', 'Product Research', 'Data Entry', 'Quality Control']
    },
    shopify: {
      title: 'Shopify & Chrono24 Catalog Work',
      category: 'E-commerce',
      overview: 'Catalog and order work inside two e-commerce admin panels: a Shopify product catalog, and the Chrono24 dealer portal used by a luxury watch seller.',
      role: 'Product Listing Specialist',
      tasks: [
        'Worked in the Shopify product catalog, including product status, inventory, category, and vendor fields',
        'Worked in the Chrono24 dealer portal on luxury watch listings and incoming order requests'
      ],
      tools: ['Shopify Admin', 'Chrono24 Dealer Portal'],
      samples: [
        { src: 'shopify-products.jpg', caption: 'Shopify product catalog with status, inventory, category, and vendor' },
        { src: 'chrono24-orders.jpg', caption: 'Chrono24 dealer portal order queue (buyer names and order IDs redacted)' }
      ],
      skills: ['Shopify', 'Catalog Management', 'E-commerce Admin', 'Attention to Detail']
    },
    leadgen: {
      title: 'Lead Generation & Business Web Research',
      category: 'Web Research',
      overview: 'Researched lists of local businesses, organized by niche and city. Each record was checked against the company website and business sources, and notes were added for closed, duplicate, or unverifiable entries.',
      role: 'Lead Generation / Web Research Assistant',
      tasks: [
        'Researched local businesses across niches such as legal, moving, orthodontics, handyman, garage door, funeral home, and manufacturing',
        'Recorded business name, address, city, state, ZIP, company phone, website, email, and contact person',
        'Looked up emails and contact names on company websites',
        'Added notes for businesses that were permanently closed, already listed, or could not be found in the target city',
        'Color-coded rows by record status and kept each niche on its own tab'
      ],
      tools: ['Google Sheets', 'Microsoft Excel', 'Google Search', 'RefUSA', 'Company websites'],
      process: [
        { t: 'Define', d: 'Take the target niche and location from the task brief.' },
        { t: 'Search', d: 'Find matching businesses through search and business databases.' },
        { t: 'Capture', d: 'Enter each business into the standard lead template.' },
        { t: 'Verify', d: 'Check the website and contact details, then note closures, duplicates, or missing data.' },
        { t: 'Deliver', d: 'Hand over a color-coded sheet with one tab per niche.' }
      ],
      samples: [
        { src: 'leadgen-research-task.jpg', caption: 'Local business lead list organized by niche tabs (emails and contacts redacted)' },
        { src: 'leadgen-refusa.jpg', caption: 'Manufacturing lead research with status color-coding and notes (contact data redacted)' }
      ],
      skills: ['Lead Generation', 'Web Research', 'Data Verification', 'B2B Prospecting', 'Data Entry']
    },
    webscraping: {
      title: 'Web Scraping & Data Extraction',
      category: 'Web Scraping',
      overview: 'Extracted structured data from online platforms and directories into clean spreadsheets, with output filed by day, week, month, and running total.',
      role: 'Data Extraction Assistant',
      tasks: [
        'Extracted freelancer profile data from Freelancer.com, Fiverr, and PeoplePerHour into a standard template',
        'Captured fields such as profile ID, name, bio summary, category, skills, country, posted date, and account age',
        'Collected home-improvement business data from online directory listings into Google Sheets',
        'Filed output into daily, weekly, monthly, and total folders',
        'Added header filters so the data could be sorted and reviewed easily'
      ],
      tools: ['Google Sheets', 'Google Drive', 'Freelancer.com', 'Fiverr', 'PeoplePerHour', 'HomeAdvisor'],
      process: [
        { t: 'Template', d: 'Start from the required column template for each platform.' },
        { t: 'Extract', d: 'Collect each record from the source platform.' },
        { t: 'Clean', d: 'Standardize formats and check each row for completeness.' },
        { t: 'Organize', d: 'File the output into the daily, weekly, monthly, and total folders.' }
      ],
      samples: [
        { src: 'scrape-dataset.jpg', caption: 'Extracted profile dataset with filterable columns (IDs and names redacted)' },
        { src: 'scrape-folders.jpg', caption: 'Scraped output organized into daily, weekly, monthly, and total folders' },
        { src: 'scrape-homeshow.jpg', caption: 'Business directory data extraction (contact emails redacted)' }
      ],
      skills: ['Web Scraping', 'Data Extraction', 'Data Cleaning', 'Spreadsheet Management', 'Attention to Detail']
    },
    admin: {
      title: 'Application Processing & Credential Verification',
      category: 'Administrative',
      overview: 'Admin support for a healthcare job-matching service. I reviewed applicant submissions against suggested job matches and verified professional credentials through official public registries.',
      role: 'Admin Support Application Specialist',
      tasks: [
        'Reviewed applicant information and resumes',
        'Compared each applicant’s submitted job with the suggested job match (employer, position, location)',
        'Verified nursing licenses through the Nursys QuickConfirm registry',
        'Used the NPPES NPI Registry for provider lookups',
        'Submitted applications on partner job boards',
        'Flagged applications that needed follow-up',
        'Handled applicant personal data confidentially'
      ],
      tools: ['Job-matching platform', 'Nursys QuickConfirm (NCSBN)', 'NPPES NPI Registry', 'Google Chrome', 'PDF resumes'],
      process: [
        { t: 'Review', d: 'Open the applicant record and resume, and read the submitted job.' },
        { t: 'Match', d: 'Compare it with the suggested job match.' },
        { t: 'Verify', d: 'Confirm license status in the official registry.' },
        { t: 'Act', d: 'Apply through the job board, or flag the application for follow-up.' }
      ],
      samples: [
        { src: 'admin-license-verification.jpg', caption: 'Public license verification registry used during application review' },
        { src: 'admin-application-review.jpg', caption: 'Application review panel comparing the suggested and submitted jobs (reference IDs redacted)' }
      ],
      note: 'This work involved applicant personal data, so only these limited, sanitized views are shown.',
      skills: ['Application Processing', 'Credential Verification', 'Healthcare Admin Support', 'Data Privacy', 'Attention to Detail']
    },
    citations: {
      title: 'Local SEO Citations & Backlink Building',
      category: 'Data Entry · Local SEO',
      overview: 'Submitted client businesses to online directories and Web 2.0 platforms to build local citations and backlinks, and kept a detailed log of every submission.',
      role: 'Data Entry Specialist: Citations & Backlinks',
      tasks: [
        'Submitted business listings to state and local online directories',
        'Created business profiles on Web 2.0 platforms such as Flickr, Issuu, Weebly, Medium, Scoop.it, Meetup, and Behance',
        'Prepared client profile data: business descriptions, logos, and website links',
        'Logged each submission with the site, account, public profile URL, indexing status, and notes',
        'Saved screenshot proof for submissions and recorded blockers such as paid-only listings, region limits, or unreachable sites',
        'Tracked working time in Clockify'
      ],
      tools: ['Google Sheets', 'Microsoft Excel', 'Clockify', 'TechSmith Screencast', 'Business directories', 'Web 2.0 platforms'],
      process: [
        { t: 'Prepare', d: 'Gather the business details, description, and logo.' },
        { t: 'Submit', d: 'Create the listing or profile on each directory.' },
        { t: 'Document', d: 'Record the public URL, status, and screenshot proof.' },
        { t: 'Follow up', d: 'Recheck pending listings and note whether they were indexed.' }
      ],
      samples: [
        { src: 'citation-tracker-sanitized.jpg', caption: 'Directory submission log: sanitized recreation with client, logins, and passwords removed' },
        { src: 'citation-clockify.jpg', caption: 'Time tracking in Clockify (workspace and client names redacted)' }
      ],
      note: 'The original trackers contain client login credentials, so they are shown only as a sanitized recreation.',
      skills: ['Local SEO Citations', 'Backlink Building', 'Data Entry', 'Account Setup', 'Record Keeping']
    },
    social: {
      title: 'Social Media Engagement Support',
      category: 'Social Media',
      overview: 'Social media management support as part of an outsourcing team serving international clients. The work included branded post graphics and tracking engagement activity on Facebook.',
      role: 'Social Media Manager (Facebook Engagement)',
      tasks: [
        'Prepared branded quote graphics for social media posts',
        'Engaged on client-related Facebook posts and logged each engagement link',
        'Updated the posted or pending status for every entry in a shared engagement tracker',
        'Worked in my own assigned tab within the team tracker',
        'Coordinated with the team through regular video calls'
      ],
      tools: ['Facebook', 'Google Sheets'],
      process: [
        { t: 'Create', d: 'Prepare the branded post content.' },
        { t: 'Engage', d: 'Engage on the assigned posts.' },
        { t: 'Log', d: 'Record each link and its status in the tracker.' },
        { t: 'Report', d: 'Review progress with the team.' }
      ],
      samples: [
        { src: 'smm-quote-graphic.jpg', caption: 'Branded quote graphic prepared for social media' },
        { src: 'smm-engagement-tracker.jpg', caption: 'Engagement tracker with a posted or pending status for each entry (team names redacted)' }
      ],
      skills: ['Social Media Management', 'Community Engagement', 'Engagement Tracking', 'Team Collaboration']
    }
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function chips(list) {
    return '<div class="case-chips">' + list.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>';
  }

  // --- Filters ---
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.portfolio-card[data-project]');
  var portfolioEmpty = document.getElementById('portfolioEmpty');
  var portfolioStatus = document.getElementById('portfolioStatus');
  var portfolioGrid = document.getElementById('portfolioGrid');

  function applyFilter(filter) {
    var shown = 0;
    projectCards.forEach(function (card) {
      var cats = (card.getAttribute('data-category') || '').split(' ');
      var match = filter === 'all' || cats.indexOf(filter) !== -1;
      card.hidden = !match;
      if (match) { shown++; card.classList.add('visible'); }
    });
    filterBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (portfolioEmpty) portfolioEmpty.hidden = shown !== 0;
    if (portfolioStatus) portfolioStatus.textContent = shown + (shown === 1 ? ' project' : ' projects') + ' shown';
    if (portfolioGrid && !reduceMotion) {
      portfolioGrid.classList.remove('is-filtering');
      void portfolioGrid.offsetWidth; // restart the fade-in
      portfolioGrid.classList.add('is-filtering');
    }
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { applyFilter(btn.getAttribute('data-filter')); });
  });

  // --- Case study modal ---
  var caseModal = document.getElementById('caseModal');
  var caseDialog = caseModal ? caseModal.querySelector('.case-modal-dialog') : null;
  var caseBody = document.getElementById('caseBody');
  var caseTitle = document.getElementById('caseTitle');
  var caseCategory = document.getElementById('caseCategory');
  var caseTrigger = null;
  var currentProject = null;

  // Focus a dialog that was just made visible. If its visibility is still
  // transitioning (e.g. reduced-motion overrides), retry on the next frames.
  function focusDialog(el, tries) {
    el.focus({ preventScroll: true });
    if (document.activeElement !== el && (tries || 0) < 10) {
      requestAnimationFrame(function () { focusDialog(el, (tries || 0) + 1); });
    }
  }

  function renderCase(p) {
    var html = '';
    html += '<section class="case-block"><h3><i class="fas fa-circle-info" aria-hidden="true"></i> Overview</h3><p>' + esc(p.overview) + '</p></section>';
    html += '<div class="case-meta">' +
      '<div><h4>My Role</h4><p>' + esc(p.role) + '</p></div>' +
      '<div><h4>Tools Used</h4>' + chips(p.tools) + '</div></div>';
    html += '<section class="case-block"><h3><i class="fas fa-list-check" aria-hidden="true"></i> Tasks Completed</h3><ul class="case-tasks">' +
      p.tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>';
    if (p.process && p.process.length) {
      html += '<section class="case-block"><h3><i class="fas fa-diagram-project" aria-hidden="true"></i> Workflow / Process</h3><ol class="case-process">' +
        p.process.map(function (s) { return '<li><strong>' + esc(s.t) + '</strong><span>' + esc(s.d) + '</span></li>'; }).join('') + '</ol></section>';
    }
    html += '<section class="case-block"><h3><i class="fas fa-images" aria-hidden="true"></i> Work Samples</h3><div class="case-gallery">' +
      p.samples.map(function (s, i) {
        return '<figure><button type="button" class="case-thumb" data-index="' + i + '" aria-label="Enlarge image: ' + esc(s.caption) + '">' +
          '<img src="' + IMG + esc(s.src) + '" alt="" loading="lazy"><span class="case-zoom" aria-hidden="true"><i class="fas fa-expand"></i></span></button>' +
          '<figcaption>' + esc(s.caption) + '</figcaption></figure>';
      }).join('') + '</div>' +
      '<p class="case-note"><i class="fas fa-shield-halved" aria-hidden="true"></i> ' + esc(p.note || 'Screenshots are cropped and redacted to protect client and customer information.') + '</p></section>';
    html += '<section class="case-block"><h3><i class="fas fa-star" aria-hidden="true"></i> Skills Demonstrated</h3>' + chips(p.skills) + '</section>';
    return html;
  }

  function openCase(id, trigger) {
    var p = PROJECTS[id];
    if (!p || !caseModal) return;
    currentProject = p;
    caseTrigger = trigger || null;
    caseTitle.textContent = p.title;
    caseCategory.textContent = p.category;
    caseBody.innerHTML = renderCase(p);
    caseBody.scrollTop = 0;
    caseModal.classList.add('is-open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    focusDialog(caseDialog);
  }
  function closeCase() {
    if (!caseModal || !caseModal.classList.contains('is-open')) return;
    caseModal.classList.remove('is-open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (caseTrigger) caseTrigger.focus({ preventScroll: true });
  }

  document.querySelectorAll('.case-study-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openCase(btn.getAttribute('data-project'), btn);
    });
  });
  projectCards.forEach(function (card) {
    card.addEventListener('click', function () {
      openCase(card.getAttribute('data-project'), card.querySelector('.case-study-btn'));
    });
  });
  // "See related work" (Services) and "View Related Work" (Experience) buttons
  document.querySelectorAll('[data-open-case]').forEach(function (btn) {
    btn.addEventListener('click', function () { openCase(btn.getAttribute('data-open-case'), btn); });
  });
  if (caseModal) {
    caseModal.querySelectorAll('[data-close-case]').forEach(function (el) { el.addEventListener('click', closeCase); });
    caseBody.addEventListener('click', function (e) {
      var thumb = e.target.closest('.case-thumb');
      if (!thumb) return;
      var items = currentProject.samples.map(function (s) { return { src: IMG + s.src, caption: s.caption }; });
      openLightbox(items, parseInt(thumb.getAttribute('data-index'), 10), thumb);
    });
  }

  // ========== Lightbox (work samples and certificates) ==========
  var lightbox = document.getElementById('lightbox');
  var lightboxDialog = lightbox ? lightbox.querySelector('.lightbox-dialog') : null;
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxItems = [];
  var lightboxIndex = 0;
  var lightboxTrigger = null;

  function showLightboxImage(i) {
    lightboxIndex = (i + lightboxItems.length) % lightboxItems.length;
    var item = lightboxItems[lightboxIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = item.caption;
    var multi = lightboxItems.length > 1;
    lightboxCounter.textContent = multi ? (lightboxIndex + 1) + ' / ' + lightboxItems.length : '';
    lightboxPrev.hidden = !multi;
    lightboxNext.hidden = !multi;
  }
  function openLightbox(items, index, trigger) {
    if (!lightbox || !items.length) return;
    lightboxItems = items;
    lightboxTrigger = trigger || null;
    showLightboxImage(index || 0);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    focusDialog(lightboxDialog);
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    // Keep the page locked if the case study is still open underneath
    if (!(caseModal && caseModal.classList.contains('is-open'))) document.body.style.overflow = '';
    if (lightboxTrigger) lightboxTrigger.focus();
  }
  if (lightbox) {
    lightbox.querySelectorAll('[data-close-lightbox]').forEach(function (el) { el.addEventListener('click', closeLightbox); });
    lightboxPrev.addEventListener('click', function () { showLightboxImage(lightboxIndex - 1); });
    lightboxNext.addEventListener('click', function () { showLightboxImage(lightboxIndex + 1); });
    // Swipe on touch devices
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null || lightboxItems.length < 2) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showLightboxImage(lightboxIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  // ========== Certificates ==========
  document.querySelectorAll('.cert-card[data-cert-type]').forEach(function (card) {
    var img = card.querySelector('.cert-preview img');
    var preview = card.querySelector('.cert-preview');
    if (img) {
      var markLoaded = function () { preview.classList.add('has-image'); };
      if (img.complete && img.naturalWidth > 0) markLoaded();
      else img.addEventListener('load', markLoaded);
    }
    function open() {
      if (!img) return;
      var title = card.querySelector('.cert-body h3').textContent.trim();
      openLightbox([{ src: img.currentSrc || img.src, caption: title }], 0, card);
    }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  // Keep keyboard focus inside the topmost open dialog
  function trapFocus(e, container) {
    var focusables = Array.prototype.filter.call(
      container.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.hidden && el.offsetParent !== null; }
    );
    e.preventDefault();
    if (!focusables.length) return;
    var i = focusables.indexOf(document.activeElement);
    var next = i === -1 ? (e.shiftKey ? focusables.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
    focusables[next].focus();
  }

  document.addEventListener('keydown', function (e) {
    var lbOpen = lightbox && lightbox.classList.contains('is-open');
    var caseOpen = caseModal && caseModal.classList.contains('is-open');
    if (lbOpen) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft' && lightboxItems.length > 1) showLightboxImage(lightboxIndex - 1);
      else if (e.key === 'ArrowRight' && lightboxItems.length > 1) showLightboxImage(lightboxIndex + 1);
      else if (e.key === 'Tab') trapFocus(e, lightboxDialog);
    } else if (caseOpen) {
      if (e.key === 'Escape') closeCase();
      else if (e.key === 'Tab') trapFocus(e, caseDialog);
    }
  });
})();
