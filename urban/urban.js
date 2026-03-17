// ── URBAN HERO — PARTICLE NETWORK ──
(function () {
  var canvas = document.getElementById('urban-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, particles = [];
  var mouse = { x: -9999, y: -9999, active: false };

  var CONNECTION_DIST = 120;
  var MOUSE_RADIUS = 180;
  var COLORS = [
    { r: 0, g: 201, b: 167 },    // teal accent
    { r: 126, g: 206, b: 193 },  // sage
    { r: 167, g: 210, b: 240 },  // sky
    { r: 100, g: 220, b: 180 },  // mint
  ];

  function resize() {
    var hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    initParticles();
  }

  function initParticles() {
    var count = Math.min(80, Math.floor((w * h) / 8000));
    if (w < 768) count = Math.floor(count * 0.5);
    particles = [];
    for (var i = 0; i < count; i++) {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2,
        color: col,
        alpha: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    var time = Date.now() * 0.001;

    // Connections
    for (var i = 0; i < particles.length; i++) {
      var p1 = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var opacity = (1 - dist / CONNECTION_DIST) * 0.2;
          var mr = (p1.color.r + p2.color.r) >> 1;
          var mg = (p1.color.g + p2.color.g) >> 1;
          var mb = (p1.color.b + p2.color.b) >> 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + mr + ',' + mg + ',' + mb + ',' + opacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Mouse lines
    if (mouse.active) {
      for (var m = 0; m < particles.length; m++) {
        var pm = particles[m];
        var mdx = pm.x - mouse.x, mdy = pm.y - mouse.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < MOUSE_RADIUS) {
          var lo = (1 - mDist / MOUSE_RADIUS) * 0.3;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(pm.x, pm.y);
          ctx.strokeStyle = 'rgba(' + pm.color.r + ',' + pm.color.g + ',' + pm.color.b + ',' + lo + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Particles
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      p.x += p.vx + Math.sin(time * 0.5 + p.phase) * 0.05;
      p.y += p.vy + Math.cos(time * 0.3 + p.phase) * 0.05;

      // Mouse attraction
      if (mouse.active) {
        var ax = mouse.x - p.x, ay = mouse.y - p.y;
        var ad = Math.sqrt(ax * ax + ay * ay);
        if (ad < MOUSE_RADIUS && ad > 0) {
          var f = (1 - ad / MOUSE_RADIUS) * 0.03;
          p.vx += (ax / ad) * f;
          p.vy += (ay / ad) * f;
        }
      }

      p.vx *= 0.99; p.vy *= 0.99;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      var breathe = 0.5 + 0.5 * Math.sin(time * 0.8 + p.phase);
      var drawAlpha = p.alpha * (0.6 + breathe * 0.4);

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + drawAlpha + ')';
      ctx.shadowColor = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',0.4)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (drawAlpha * 0.5) + ')';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  canvas.parentElement.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.parentElement.addEventListener('mouseleave', function () { mouse.active = false; });

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

// ── URBAN PROJECTS ──
(function () {
  fetch('../projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      var urban = projects
        .filter(function (p) { return p.category === 'Urban Computation'; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var planetary = projects
        .filter(function (p) { return p.category === 'Planetary Computation'; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var all = urban.concat(planetary);
      var gallery = document.getElementById('urban-gallery');
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
          window.location.href = '../project.html?id=' + encodeURIComponent(project.id) + '&from=urban';
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
