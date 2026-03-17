(function () {
  // ── HERO SLIDESHOW — random sliding renders ──
  function initSlideshow(projects) {
    var covers = projects
      .filter(function (p) {
        return p.category === 'Architecture' && p.coverImage;
      })
      .map(function (p) { return '../' + p.coverImage; });

    // Shuffle
    for (var i = covers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = covers[i]; covers[i] = covers[j]; covers[j] = tmp;
    }

    var container = document.getElementById('hero-slideshow');
    if (!container || covers.length === 0) return;

    // Create slide elements
    var slides = [];
    covers.forEach(function (src) {
      var div = document.createElement('div');
      div.className = 'hero-slide';
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      div.appendChild(img);
      container.appendChild(div);
      slides.push(div);
    });

    var current = 0;
    slides[0].classList.add('active');

    setInterval(function () {
      slides[current].classList.remove('active');
      // Reset transform for smooth restart
      slides[current].style.transform = 'scale(1)';
      current = (current + 1) % slides.length;
      // Force reflow before re-adding class
      void slides[current].offsetWidth;
      slides[current].style.transform = '';
      slides[current].classList.add('active');
    }, 4000);
  }

  fetch('../projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      initSlideshow(projects);
      var arch = projects
        .filter(function (p) { return p.category === 'Architecture'; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var fab = projects
        .filter(function (p) { return p.category === 'Fabrication'; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var all = arch.concat(fab);
      var gallery = document.getElementById('arch-gallery');
      all.forEach(function (project) {
        var card = document.createElement('div');
        card.className = 'project-card reveal';
        var imgSrc = project.coverImage ? '../' + project.coverImage : '';
        card.innerHTML =
          '<div class="img-wrapper"><img src="' + imgSrc + '" alt="' + project.title + '" loading="lazy"></div>' +
          '<div class="card-overlay"><p class="overlay-desc">' + project.category + '</p></div>' +
          '<div class="card-caption"><strong>' + project.title + '</strong>' +
          '<span class="card-tag">' + project.category + '</span></div>';
        var wrapper = card.querySelector('.img-wrapper');
        var img = wrapper.querySelector('img');
        img.onload = function () { wrapper.classList.add('loaded'); };
        if (img.complete) wrapper.classList.add('loaded');
        card.addEventListener('click', function () {
          window.location.href = '../project.html?id=' + encodeURIComponent(project.id) + '&from=architecture';
        });
        gallery.appendChild(card);
      });
      initReveal();
      initSkillBars();
    })
    .catch(function (e) { console.error('projects.json load error', e); });

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ── TIMELINE AREA CLICK TOOLTIPS ──
  function initTimelineAreas() {
    var areas = document.querySelectorAll('[data-tip]');
    areas.forEach(function (area) {
      area.addEventListener('click', function (e) {
        var tipId = 'tip-' + area.getAttribute('data-tip');
        var tip = document.getElementById(tipId);
        if (!tip) return;
        // Close any other open tip
        document.querySelectorAll('.tl-area-tip.visible').forEach(function (t) {
          if (t.id !== tipId) t.classList.remove('visible');
        });
        tip.classList.toggle('visible');
        e.stopPropagation();
      });
    });
    // Close tips when clicking outside
    document.addEventListener('click', function () {
      document.querySelectorAll('.tl-area-tip.visible').forEach(function (t) {
        t.classList.remove('visible');
      });
    });
  }
  initTimelineAreas();

  function initSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-fill');
    if (!('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = (b.dataset.fill || '80') + '%'; });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = (entry.target.dataset.fill || '80') + '%';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(function (b) { obs.observe(b); });
  }
})();
