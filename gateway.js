// ── TYPEWRITER EFFECT ──
(function () {
  var words = [
    "Computational Designer",
    "Urban AI",
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

// ── NEON PASTEL PARTICLE CANVAS — INTERACTIVE ──
(function () {
  var canvas = document.getElementById('particle-canvas');
  var ctx = canvas.getContext('2d');
  var w, h;
  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var mouseDown = false;

  var MOUSE_RADIUS = 250;
  var CONNECTION_DIST = 150;
  var MOUSE_LINE_DIST = 200;

  // Pastel palette — soft Japanese minimalism
  var COLORS = [
    { r: 126, g: 206, b: 193 },  // sage teal
    { r: 242, g: 167, b: 167 },  // sakura pink
    { r: 196, g: 181, b: 253 },  // wisteria
    { r: 253, g: 224, b: 151 },  // warm gold
    { r: 167, g: 210, b: 240 },  // sky blue
  ];

  // Scroll-based fade: 0 = full particles, 1 = cards zone
  // Never goes fully to 0 — keeps a minimal ambient twinkle
  var scrollFade = 0;
  var MIN_FADE = 0.08; // minimum particle visibility in cards zone
  window.addEventListener('scroll', function () {
    var vh = window.innerHeight;
    scrollFade = Math.min(1, Math.max(0, (window.scrollY - vh * 0.3) / (vh * 0.5)));
  });

  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    var count = Math.min(140, Math.floor((w * h) / 7000));
    if (w < 768) count = Math.floor(count * 0.5);
    particles = [];
    for (var i = 0; i < count; i++) {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        // Store original position for elastic return
        ox: 0, oy: 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        baseVx: (Math.random() - 0.5) * 0.4,
        baseVy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2.5,
        color: col,
        alpha: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
      // Set original positions
      particles[i].ox = particles[i].x;
      particles[i].oy = particles[i].y;
    }
  }

  function animate() {
    // fadeMult: 1.0 at hero, drops to MIN_FADE in cards zone (never 0)
    var fadeMult = Math.max(MIN_FADE, 1 - scrollFade);
    var inCardsZone = scrollFade > 0.8;

    // Background fill — stronger erase when faded, keeps trails when full
    var bgAlpha = inCardsZone ? 0.35 : (0.18 + scrollFade * 0.5);
    ctx.fillStyle = 'rgba(10, 10, 15, ' + bgAlpha + ')';
    ctx.fillRect(0, 0, w, h);

    var time = Date.now() * 0.001;

    // ── Mouse cursor glow aura ──
    if (mouse.active && fadeMult > 0.03) {
      var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 0.7);
      grad.addColorStop(0, 'rgba(196, 181, 253, 0.06)');
      grad.addColorStop(0.5, 'rgba(126, 206, 193, 0.03)');
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Hold mode amplifier (click and hold = stronger pull)
    var holdForce = mouseDown ? 3.0 : 1.0;

    // ── Draw connections between particles ──
    for (var i = 0; i < particles.length; i++) {
      var p1 = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var opacity = (1 - dist / CONNECTION_DIST) * 0.15 * fadeMult;
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

    // ── Draw lines from cursor to nearby particles ──
    if (mouse.active) {
      for (var m = 0; m < particles.length; m++) {
        var pm = particles[m];
        var mdx2 = pm.x - mouse.x;
        var mdy2 = pm.y - mouse.y;
        var mDist2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
        if (mDist2 < MOUSE_LINE_DIST) {
          var lineOp = (1 - mDist2 / MOUSE_LINE_DIST) * 0.25 * fadeMult;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(pm.x, pm.y);
          ctx.strokeStyle = 'rgba(' + pm.color.r + ',' + pm.color.g + ',' + pm.color.b + ',' + lineOp + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // ── Update and draw particles ──
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];

      // Gentle floating oscillation
      var floatX = Math.sin(time * 0.5 + p.phase) * 0.08;
      var floatY = Math.cos(time * 0.3 + p.phase * 1.3) * 0.08;

      // Mouse interaction — strong attraction with orbit feel
      var mdx = mouse.x - p.x;
      var mdy = mouse.y - p.y;
      var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      var attractX = 0;
      var attractY = 0;

      if (mouse.active && mDist < MOUSE_RADIUS && mDist > 0) {
        // Attraction force — ramps up close to cursor
        var rawForce = (1 - mDist / MOUSE_RADIUS);
        var force = rawForce * rawForce * 0.08 * holdForce;
        attractX = (mdx / mDist) * force;
        attractY = (mdy / mDist) * force;

        // Add slight orbital tangent for swirl feel
        var tangentX = -mdy / mDist * rawForce * 0.02;
        var tangentY =  mdx / mDist * rawForce * 0.02;
        attractX += tangentX;
        attractY += tangentY;
      }

      p.vx += floatX + attractX;
      p.vy += floatY + attractY;

      // Return to base drift
      p.vx += (p.baseVx - p.vx) * 0.008;
      p.vy += (p.baseVy - p.vy) * 0.008;

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Clamp speed
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var maxSpeed = mouseDown ? 4.0 : 2.5;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // Breathing alpha
      var breathe = 0.5 + 0.5 * Math.sin(time * 0.8 + p.phase);
      var drawAlpha = p.alpha * (0.6 + breathe * 0.4);

      // Twinkle effect — random sparkle pulses, stronger when in cards zone
      var twinkle = 1.0;
      if (inCardsZone) {
        // Each particle twinkles at its own rate using phase offset
        var twinkleWave = Math.sin(time * 1.5 + p.phase * 7.3) * Math.sin(time * 0.7 + p.phase * 3.1);
        twinkle = 0.3 + Math.max(0, twinkleWave) * 2.5; // spiky bright flashes
      }

      // Glow boost near mouse
      var glowBoost = 0;
      if (mouse.active && mDist < MOUSE_RADIUS) {
        glowBoost = (1 - mDist / MOUSE_RADIUS);
        // Particles near cursor get brighter and larger
        drawAlpha = Math.min(1, drawAlpha + glowBoost * 0.5);
      }

      // In cards zone: mouse creates a soft spotlight that brightens nearby twinkles
      var cursorLift = 0;
      if (inCardsZone && mouse.active && mDist < MOUSE_RADIUS * 1.5) {
        cursorLift = (1 - mDist / (MOUSE_RADIUS * 1.5)) * 0.4;
      }

      var drawRadius = (p.radius + glowBoost * 5) * (0.3 + fadeMult * 0.7);
      drawAlpha *= fadeMult * twinkle;
      drawAlpha = Math.min(0.9, drawAlpha + cursorLift);

      // Draw outer glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + (drawAlpha * 0.9) + ')';
      ctx.shadowColor = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + ((0.3 + glowBoost * 0.5) * fadeMult * twinkle) + ')';
      ctx.shadowBlur = (6 + glowBoost * 30) * fadeMult * twinkle;
      ctx.fill();
      ctx.restore();

      // Inner bright core — twinkle makes some flash white
      var coreAlpha = (drawAlpha * 0.6 + glowBoost * 0.4) * fadeMult;
      if (inCardsZone && twinkle > 1.5) coreAlpha = Math.min(0.7, coreAlpha * 2);
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + coreAlpha + ')';
      ctx.fill();
    }

    // ── Cursor dot ──
    if (mouse.active && fadeMult > 0.05) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouseDown ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.3 * fadeMult) + ')';
      ctx.shadowColor = 'rgba(196, 181, 253, ' + (0.6 * fadeMult) + ')';
      ctx.shadowBlur = (mouseDown ? 25 : 12) * fadeMult;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  // ── Click burst: push particles outward from cursor ──
  function burstFromCursor() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS * 1.2 && dist > 0) {
        var power = (1 - dist / (MOUSE_RADIUS * 1.2)) * 3.5;
        p.vx += (dx / dist) * power;
        p.vy += (dy / dist) * power;
      }
    }
  }

  // ── Project preview on click ──
  var projectCovers = [];
  var previewContainer = null;
  var activePreview = null;

  // Fetch project covers for particle previews
  fetch('projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      projects.forEach(function (p) {
        if (p.coverImage) {
          projectCovers.push({ title: p.title, cover: p.coverImage, id: p.id });
        }
      });
      // Preload a few images
      projectCovers.slice(0, 10).forEach(function (pc) {
        var img = new Image();
        img.src = pc.cover;
      });
    })
    .catch(function () { /* silently ignore */ });

  // Create preview overlay container
  previewContainer = document.createElement('div');
  previewContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
  document.body.appendChild(previewContainer);

  function isNearInteractiveElement(x, y) {
    var padding = 60;
    var els = document.querySelectorAll('.hero-content, .audience-card, .view-all-link, .scroll-hint');
    for (var i = 0; i < els.length; i++) {
      var rect = els[i].getBoundingClientRect();
      if (x > rect.left - padding && x < rect.right + padding &&
          y > rect.top - padding && y < rect.bottom + padding) {
        return true;
      }
    }
    return false;
  }

  function findNearestParticle(x, y, maxDist) {
    var best = null;
    var bestDist = maxDist;
    for (var i = 0; i < particles.length; i++) {
      var dx = particles[i].x - x;
      var dy = particles[i].y - y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) {
        bestDist = d;
        best = particles[i];
      }
    }
    return best;
  }

  function showProjectPreview(x, y) {
    if (projectCovers.length === 0) return;
    if (isNearInteractiveElement(x, y)) return;
    if (activePreview) return; // one at a time

    var proj = projectCovers[Math.floor(Math.random() * projectCovers.length)];
    var particle = findNearestParticle(x, y, 80);
    if (!particle) return;

    var el = document.createElement('div');
    var px = particle.x;
    var py = particle.y;

    // Offset so it doesn't cover the particle
    var offX = (px > w * 0.5) ? -110 : 20;
    var offY = (py > h * 0.5) ? -90 : 20;

    el.style.cssText = 'position:absolute;pointer-events:none;' +
      'left:' + (px + offX) + 'px;top:' + (py + offY) + 'px;' +
      'width:90px;height:70px;border-radius:6px;overflow:hidden;' +
      'opacity:0;transition:opacity 0.5s ease;' +
      'border:1px solid rgba(255,255,255,0.08);' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.5);';

    var img = document.createElement('img');
    img.src = proj.cover;
    img.alt = proj.title;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.7) saturate(0.6);';
    el.appendChild(img);

    previewContainer.appendChild(el);
    activePreview = el;

    // Fade in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '0.45';
      });
    });

    // Fade out and remove
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (activePreview === el) activePreview = null;
      }, 600);
    }, 1800);
  }

  // ── Event listeners ──
  // Canvas is fixed at 0,0 so clientX/Y maps directly
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  });

  window.addEventListener('touchstart', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
      burstFromCursor();
      showProjectPreview(e.touches[0].clientX, e.touches[0].clientY);
    }
  });

  window.addEventListener('touchend', function () {
    mouse.active = false;
  });

  document.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  window.addEventListener('mousedown', function (e) {
    mouseDown = true;
    burstFromCursor();
    showProjectPreview(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', function () {
    mouseDown = false;
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
