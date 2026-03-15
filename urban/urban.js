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
          '<img src="' + imgSrc + '" alt="' + project.title + '" loading="lazy">' +
          '<div class="card-overlay"><p class="overlay-desc">' + project.category + '</p></div>' +
          '<div class="card-caption"><strong>' + project.title + '</strong>' +
          '<span class="card-tag">' + project.category + '</span></div>';
        card.addEventListener('click', function () {
          window.location.href = '../project.html?id=' + encodeURIComponent(project.id) + '&from=urban';
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
