// ── TYPEWRITER EFFECT ──
(function () {
  var words = [
    "Computational Designer",
    "Urban Intelligence",
    "Generative AI",
    "AEC Automation"
  ];
  var el = document.getElementById('typewriter');
  var wordIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function tick() {
    var current = words[wordIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.substring(0, charIndex);
      if (charIndex === current.length) {
        setTimeout(function () { deleting = true; tick(); }, 2500);
        return;
      }
      setTimeout(tick, 60);
    } else {
      charIndex--;
      el.textContent = current.substring(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  tick();
})();

// ── NEON PASTEL PARTICLE CANVAS ──
(function () {
  var canvas = document.getElementById('particle-canvas');
  var ctx = canvas.getContext('2d');
  var w, h;
  var particles = [];
  var mouse = { x: -9999, y: -9999 };
  var MOUSE_RADIUS = 180;
  var CONNECTION_DIST = 140;

  // Pastel palette — soft Japanese minimalism
  var COLORS = [
    { r: 126, g: 206, b: 193 },  // sage teal
    { r: 242, g: 167, b: 167 },  // sakura pink
    { r: 196, g: 181, b: 253 },  // wisteria
    { r: 253, g: 224, b: 151 },  // warm gold
    { r: 167, g: 210, b: 240 },  // sky blue
  ];

  function resizeCanvas() {
    w = canvas.width = canvas.parentElement.clientWidth;
    h = canvas.height = canvas.parentElement.clientHeight;
    initParticles();
  }

  function initParticles() {
    var count = Math.min(120, Math.floor((w * h) / 8000));
    if (w < 768) count = Math.floor(count * 0.5);
    particles = [];
    for (var i = 0; i < count; i++) {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseVx: (Math.random() - 0.5) * 0.4,
        baseVy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2,
        color: col,
        alpha: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function animate() {
    // Soft fade trail instead of hard clear
    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, w, h);

    var time = Date.now() * 0.001;

    // Draw connections first (behind particles)
    for (var i = 0; i < particles.length; i++) {
      var p1 = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var opacity = (1 - dist / CONNECTION_DIST) * 0.12;
          // Blend colors of both particles
          var mr = (p1.color.r + p2.color.r) >> 1;
          var mg = (p1.color.g + p2.color.g) >> 1;
          var mb = (p1.color.b + p2.color.b) >> 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + mr + ',' + mg + ',' + mb + ',' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];

      // Gentle floating oscillation
      var floatX = Math.sin(time * 0.5 + p.phase) * 0.08;
      var floatY = Math.cos(time * 0.3 + p.phase * 1.3) * 0.08;

      // Mouse attraction — soft pull toward cursor
      var mdx = mouse.x - p.x;
      var mdy = mouse.y - p.y;
      var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      var attractX = 0;
      var attractY = 0;
      if (mDist < MOUSE_RADIUS && mDist > 0) {
        var force = (1 - mDist / MOUSE_RADIUS) * 0.015;
        attractX = (mdx / mDist) * force;
        attractY = (mdy / mDist) * force;
      }

      p.vx += floatX + attractX;
      p.vy += floatY + attractY;

      // Gentle return to base speed
      p.vx += (p.baseVx - p.vx) * 0.01;
      p.vy += (p.baseVy - p.vy) * 0.01;

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Clamp
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.5) {
        p.vx = (p.vx / speed) * 1.5;
        p.vy = (p.vy / speed) * 1.5;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Breathing alpha
      var breathe = 0.5 + 0.5 * Math.sin(time * 0.8 + p.phase);
      var drawAlpha = p.alpha * (0.6 + breathe * 0.4);

      // Glow near mouse
      var glowBoost = 0;
      if (mDist < MOUSE_RADIUS) {
        glowBoost = (1 - mDist / MOUSE_RADIUS);
      }

      // Draw glow (soft shadow)
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + glowBoost * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + (drawAlpha * 0.9) + ')';
      ctx.shadowColor = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + (0.4 + glowBoost * 0.6) + ')';
      ctx.shadowBlur = 8 + glowBoost * 20;
      ctx.fill();
      ctx.restore();

      // Inner bright core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (drawAlpha * 0.5 + glowBoost * 0.3) + ')';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // Mouse tracking
  window.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }
  });

  canvas.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Initial clear
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);

  animate();
})();

// ── CARD REVEAL ON SCROLL + ACCENT COLORS ──
document.addEventListener('DOMContentLoaded', function () {
  var cards = document.querySelectorAll('.audience-card');
  var viewAllLink = document.querySelector('.view-all-link');

  // Set accent colors
  cards.forEach(function (card) {
    var accent = card.dataset.accent;
    card.style.setProperty('--card-accent', accent);
    var icon = card.querySelector('.card-icon');
    if (icon) icon.style.color = accent;
    var arrow = card.querySelector('.card-arrow');
    if (arrow) arrow.style.color = accent;
  });

  // IntersectionObserver for scroll reveal
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(function (card) { obs.observe(card); });
    if (viewAllLink) obs.observe(viewAllLink);
  } else {
    // Fallback
    cards.forEach(function (card) { card.classList.add('visible'); });
    if (viewAllLink) viewAllLink.classList.add('visible');
  }
});
