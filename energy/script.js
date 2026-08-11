// BuildX Energy — interactions
(function () {
  // Sticky header state
  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.textContent = open ? 'Close' : 'Menu';
    btn.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.textContent = 'Menu';
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = Number(e.target.getAttribute('data-delay') || 0);
        setTimeout(function () { e.target.setAttribute('data-visible', 'true'); }, delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.setAttribute('data-visible', 'true'); });
  }

  // Savings calculator
  var bill = document.getElementById('bill');
  var loc = document.getElementById('loc');
  var typeBtns = document.querySelectorAll('.type-btn');
  var type = 'home';

  function fmt(n) { return n.toLocaleString('en-IN'); }
  function calc() {
    var b = Number(bill.value) || 0;
    var tariff = type === 'home' ? 7 : 9;
    var sunHours = loc.value === 'Salem' ? 4.6 : 4.4;
    var units = b / tariff;
    var sizeKw = Math.max(1, Math.round((units / (sunHours * 30)) * 10) / 10);
    var annualSavings = Math.round(units * tariff * 12 * 0.9);
    var cost = sizeKw * (type === 'home' ? 62000 : 55000);
    var payback = Math.round((cost / Math.max(annualSavings, 1)) * 10) / 10;
    var co2 = Math.round(sizeKw * 1400);
    document.getElementById('outSize').textContent = sizeKw + ' kW';
    document.getElementById('outSavings').textContent = '₹' + fmt(annualSavings);
    document.getElementById('outPayback').textContent = payback + ' yrs';
    document.getElementById('outCo2').textContent = fmt(co2) + ' kg';
  }
  bill.addEventListener('input', calc);
  loc.addEventListener('change', calc);
  typeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      typeBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      type = b.getAttribute('data-type');
      calc();
    });
  });
  calc();

  // Lead form
  var form = document.getElementById('leadForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('formMsg').textContent =
      'Thanks! We received your request and will call you shortly.';
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
