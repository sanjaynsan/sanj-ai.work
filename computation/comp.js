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
          '<img src="' + imgSrc + '" alt="' + project.title + '" loading="lazy">' +
          '<div class="card-overlay"><p class="overlay-desc">' + project.category + '</p></div>' +
          '<div class="card-caption"><strong>' + project.title + '</strong>' +
          '<span class="card-tag">' + project.category + '</span></div>';
        card.addEventListener('click', function () {
          window.location.href = '../project.html?id=' + encodeURIComponent(project.id) + '&from=computation';
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
