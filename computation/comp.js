// ── COMPUTATION HERO — STICKY PINS ──
(function () {
  var canvas = document.getElementById('pins-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, units, pointer;
  var area = { distance: 20, padding: 30 };

  // Accent color for computation: #A78BFA (wisteria purple)
  var ACCENT = { r: 167, g: 139, b: 250 };

  function resize() {
    var hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;

    area.cols = Math.floor((w - area.padding * 2) / area.distance);
    area.rows = Math.floor((h - area.padding * 2) / area.distance);

    pointer = {
      x: area.distance * (area.cols / 2) + area.padding,
      y: area.distance * (area.rows / 2) + area.padding
    };

    units = [];
    for (var i = 0; i < area.rows; i++) {
      for (var j = 0; j < area.cols; j++) {
        units.push(new Unit(j, i));
      }
    }
  }

  function Unit(col, row) {
    this.x = area.distance * (col + 0.5) + area.padding;
    this.y = area.distance * (row + 0.5) + area.padding;
    this.w = 14;
    this.h = 2.5;
    this.spins = false;
    this.angle = 0;
    this.distance = 0;
    this.alpha = 0.2;
    this.scale = 0.5;
  }

  Unit.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    // Blend white toward accent based on proximity
    var blend = Math.max(0, 1 - this.distance / (w * 0.3));
    var r = Math.round(255 + (ACCENT.r - 255) * blend);
    var g = Math.round(255 + (ACCENT.g - 255) * blend);
    var b = Math.round(255 + (ACCENT.b - 255) * blend);
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + this.alpha + ')';
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  };

  Unit.prototype.update = function () {
    if (!this.spins) {
      this.angle = Math.atan2(pointer.y - this.y, pointer.x - this.x);
      this.distance = Math.sqrt(Math.pow(this.x - pointer.x, 2) + Math.pow(this.y - pointer.y, 2));
      this.alpha = Math.max(0.15, 0.8 - this.distance / (w * 0.5));
      this.scale = Math.max(0.4, 1 - this.distance / (w * 0.5));
    } else {
      this.angle += 0.3;
    }
  };

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < units.length; i++) {
      units[i].update();
      units[i].draw();
    }
    requestAnimationFrame(animate);
  }

  canvas.parentElement.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });

  canvas.addEventListener('click', function (e) {
    var rect = canvas.getBoundingClientRect();
    var ex = e.clientX - rect.left;
    var ey = e.clientY - rect.top;
    var idxa = area.cols * Math.floor((ey - area.padding) / area.distance);
    var idxb = Math.ceil((ex - area.padding) / area.distance);
    var targetIdx = idxa + idxb - 1;
    if (targetIdx >= 0 && targetIdx < units.length) {
      units[targetIdx].spins = !units[targetIdx].spins;
    }
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

// ── COMPUTATION PROJECTS ──
(function () {
  var EXCLUDE_ID = 'aecai_01_ai_code_compliance';

  fetch('../projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      var automation = projects
        .filter(function (p) { return p.category === 'AEC Automation'; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var ai = projects
        .filter(function (p) {
          return p.category === 'AEC AI' && p.id !== EXCLUDE_ID;
        })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var all = automation.concat(ai);
      var gallery = document.getElementById('comp-gallery');
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
          window.location.href = '../project.html?id=' + encodeURIComponent(project.id) + '&from=computation';
        });
        gallery.appendChild(card);
      });
      initReveal();
      initSkillBars();
    })
    .catch(function (e) { console.error('projects.json load error', e); });

  // ── TIMELINE AREA CLICK TOOLTIPS ──
  function initTimelineAreas() {
    var areas = document.querySelectorAll('[data-tip]');
    areas.forEach(function (area) {
      area.addEventListener('click', function (e) {
        var tipId = 'tip-' + area.getAttribute('data-tip');
        var tip = document.getElementById(tipId);
        if (!tip) return;
        document.querySelectorAll('.tl-area-tip.visible').forEach(function (t) {
          if (t.id !== tipId) t.classList.remove('visible');
        });
        tip.classList.toggle('visible');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.tl-area-tip.visible').forEach(function (t) {
        t.classList.remove('visible');
      });
    });
  }
  initTimelineAreas();

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
