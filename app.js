(function () {
  'use strict';
  /* ---- CONFIG ----
     CHECKOUT_URL: paste a Stripe Payment Link (or any checkout URL) to enable the Checkout button.
     Leave empty to show a demo message instead. */
  var CONFIG = { CHECKOUT_URL: '', FREE_SHIPPING: 35, CURRENCY: '$' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return CONFIG.CURRENCY + n.toFixed(2); };

  var PRODUCTS = [
    { id: 'huila', name: 'Huila Washed', origin: 'Colombia', roast: 'Light', notes: 'Red apple, panela, a clean orange finish.', price: 18, size: '250 g', c: '#E8442E', a: '#FFE7A0' },
    { id: 'guji', name: 'Guji Natural', origin: 'Ethiopia', roast: 'Light', notes: 'Blueberry jam, jasmine, long honey sweetness.', price: 21, size: '250 g', c: '#7B5CFF', a: '#FFC6D0' },
    { id: 'cerrado', name: 'Cerrado House', origin: 'Brazil', roast: 'Medium', notes: 'Hazelnut, milk chocolate, very easy to love.', price: 16, size: '250 g', c: '#F29D38', a: '#2B1710' },
    { id: 'nyeri', name: 'Nyeri AA', origin: 'Kenya', roast: 'Medium', notes: 'Blackcurrant, grapefruit zest, syrupy body.', price: 22, size: '250 g', c: '#1E8F6B', a: '#BFE5D0' },
    { id: 'sumatra', name: 'Gayo Dark', origin: 'Indonesia', roast: 'Dark', notes: 'Cocoa nibs, cedar, a hint of dark caramel.', price: 17, size: '250 g', c: '#2B1710', a: '#F29D38' },
    { id: 'night', name: 'Night Shift Blend', origin: 'Brazil and Uganda', roast: 'Dark', notes: 'Roasted almond, brown sugar. Made for espresso.', price: 15, size: '250 g', c: '#2F6FED', a: '#FFE7A0' }
  ];

  /* hand-drawn style bag */
  function bagSVG(p) {
    var name = p.name.toUpperCase().split(' ');
    var t = name.map(function (w, i) {
      return '<text x="60" y="' + (112 + i * 17) + '" text-anchor="middle" font-family="Young Serif,Georgia,serif" font-size="' + (w.length > 7 ? 13 : 16) + '" fill="' + p.c + '">' + w + '</text>';
    }).join('');
    return '<svg viewBox="0 0 120 170" aria-hidden="true">' +
      '<path d="M16 22 L104 22 L110 156 Q110 162 104 162 L16 162 Q10 162 10 156 Z" fill="' + p.c + '" stroke="#2B1710" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M16 22 L104 22 L103 36 L17 36 Z" fill="#2B1710" opacity=".18"/>' +
      '<path d="M16 22 L104 22" stroke="#2B1710" stroke-width="3"/>' +
      '<rect x="24" y="52" width="72" height="84" rx="10" fill="' + p.a + '" stroke="#2B1710" stroke-width="2.5"/>' +
      '<circle cx="60" cy="76" r="14" fill="none" stroke="' + p.c + '" stroke-width="3"/><path d="M49 80 Q60 66 71 72 Q64 86 49 80Z" fill="' + p.c + '"/>' + t +
      '<path d="M22 150h76" stroke="#2B1710" stroke-width="2" stroke-dasharray="3 5" opacity=".5"/></svg>';
  }
  $$('[data-bag="hero"]').forEach(function (el) { el.innerHTML = bagSVG({ name: 'Huila Washed', c: '#2B1710', a: '#FFE7A0' }); });

  /* ---- state ---- */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('pilon-cart') || '{}') || {}; } catch (e) { cart = {}; }
  var save = function () { try { localStorage.setItem('pilon-cart', JSON.stringify(cart)); } catch (e) {} };
  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };

  /* ---- products ---- */
  var grid = $('#grid');
  function renderGrid(f) {
    grid.innerHTML = PRODUCTS.filter(function (p) { return f === 'all' || p.roast === f; }).map(function (p) {
      return '<article class="card"><div class="stage" style="background:' + p.a + '33"><div class="bag">' + bagSVG(p) + '</div></div>' +
        '<div class="info"><span class="tag">' + p.roast + ' roast</span><h3>' + p.name + '</h3><p class="origin">' + p.origin + '</p><p class="notes">' + p.notes + '</p>' +
        '<div class="buy"><div><b>' + money(p.price) + '</b> <small>' + p.size + '</small></div><button class="add" data-id="' + p.id + '">Add to cart</button></div></div></article>';
    }).join('');
  }
  renderGrid('all');
  $('#chips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#chips button').forEach(function (x) { x.classList.toggle('on', x === b); });
    renderGrid(b.dataset.f);
  });
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.add'); if (!b) return;
    cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1;
    update(true);
    toast(byId(b.dataset.id).name + ' added to your cart');
  });

  /* ---- cart ---- */
  var drawer = $('#drawer'), scrim = $('#scrim'), openBtn = $('#cartOpen');
  function openCart(o) {
    drawer.classList.toggle('open', o);
    drawer.setAttribute('aria-hidden', !o);
    if (o) { scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add('show'); }); $('#cartClose').focus(); }
    else { scrim.classList.remove('show'); setTimeout(function () { scrim.hidden = true; }, 300); openBtn.focus(); }
  }
  openBtn.addEventListener('click', function () { openCart(true); });
  $('#cartClose').addEventListener('click', function () { openCart(false); });
  scrim.addEventListener('click', function () { openCart(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) openCart(false); });

  function update(bump) {
    var ids = Object.keys(cart).filter(function (id) { return cart[id] > 0 && byId(id); });
    var n = 0, sub = 0;
    $('#lines').innerHTML = ids.length ? ids.map(function (id) {
      var p = byId(id), q = cart[id]; n += q; sub += q * p.price;
      return '<li class="line"><div class="bag">' + bagSVG(p) + '</div><div><h4>' + p.name + '</h4><small>' + p.size + '</small>' +
        '<div class="qty"><button data-d="-1" data-id="' + id + '" aria-label="Remove one">&minus;</button><span>' + q + '</span><button data-d="1" data-id="' + id + '" aria-label="Add one">+</button></div></div><b>' + money(q * p.price) + '</b></li>';
    }).join('') : '<li class="empty">Your cart is empty.<br>Pick a bag, we will roast it fresh.</li>';
    $('#count').textContent = n;
    $('#subtotal').textContent = money(sub);
    var left = CONFIG.FREE_SHIPPING - sub;
    $('#shipTxt').textContent = !n ? 'Free shipping over ' + money(CONFIG.FREE_SHIPPING) : left > 0 ? 'Add ' + money(left) + ' more for free shipping' : 'You have free shipping';
    $('#shipBar').style.width = Math.min(100, sub / CONFIG.FREE_SHIPPING * 100) + '%';
    $('#checkout').disabled = !n;
    $('#checkout').style.opacity = n ? 1 : .5;
    if (bump) { openBtn.classList.remove('pop'); void openBtn.offsetWidth; openBtn.classList.add('pop'); }
    save();
  }
  $('#lines').addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]'); if (!b) return;
    cart[b.dataset.id] = Math.max(0, (cart[b.dataset.id] || 0) + Number(b.dataset.d));
    update();
  });
  $('#checkout').addEventListener('click', function () {
    if (CONFIG.CHECKOUT_URL) { window.location.href = CONFIG.CHECKOUT_URL; }
    else toast('Demo store: connect a Stripe Payment Link to take real orders.');
  });
  update();

  /* ---- toast ---- */
  var tt, tEl = $('#toast');
  function toast(m) { tEl.textContent = m; tEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { tEl.classList.remove('show'); }, 2600); }

  /* ---- mobile menu ---- */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(o) { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---- roast curve draws when seen ---- */
  var curve = $('.curve');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en, ob) { if (en[0].isIntersecting) { curve.classList.add('in'); ob.disconnect(); } }, { threshold: .4 }).observe(curve);
  } else curve.classList.add('in');

  /* ---- subscription builder: 10% off ---- */
  var PER_BAG = 19;
  function calc() {
    var bags = Number($('input[name=bags]:checked').value);
    $('#subPrice').textContent = money(bags * PER_BAG * 0.9);
  }
  $$('#builder input').forEach(function (i) { i.addEventListener('change', calc); });
  calc();
  $('#subGo').addEventListener('click', function () {
    if (CONFIG.CHECKOUT_URL) window.location.href = CONFIG.CHECKOUT_URL;
    else toast('Demo store: link a Stripe subscription Payment Link to go live.');
  });

  /* ---- newsletter: set data-endpoint on the form (Formspree, Web3Forms, Mailchimp proxy...) ---- */
  var nf = $('#newsForm'), msg = $('.msg', nf);
  nf.addEventListener('submit', function (e) {
    e.preventDefault();
    var mail = nf.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(mail)) { msg.textContent = 'Please enter a valid email address.'; return; }
    if (nf.botcheck.value) return;
    var ok = function () { msg.textContent = 'You are in. See you next month.'; nf.reset(); };
    if (!nf.dataset.endpoint) { ok(); return; }
    fetch(nf.dataset.endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(nf) })
      .then(function (r) { if (!r.ok) throw 0; ok(); })
      .catch(function () { msg.textContent = 'Something went wrong. Please try again.'; });
  });
})();
