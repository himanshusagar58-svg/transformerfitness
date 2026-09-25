(() => {
const $ = id => document.getElementById(id), body = document.body;
const G = window.GYM || {};
const N = +body.dataset.frames || 40;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const digits = s => (s || '').replace(/\D/g, '');
const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

$('yr').textContent = new Date().getFullYear();

/* fill every [data-t="path.to.value"] from the GYM config */
document.querySelectorAll('[data-t]').forEach(el => {
  const v = get(G, el.dataset.t);
  if (v) el.textContent = v;
});

/* "tel:" links: set the href, leave whatever text/markup is already inside alone */
document.querySelectorAll('[data-tel]').forEach(a => { a.href = 'tel:+' + digits(G.phone); });

/* Instagram / YouTube / Maps links, wherever they appear */
document.querySelectorAll('[data-link]').forEach(a => { a.href = (G.links || {})[a.dataset.link] || '#'; });

/* header + form "book a trial / contact us" links open WhatsApp directly, no in-page scroll */
document.querySelectorAll('[data-wa]').forEach(a => {
  a.href = `https://wa.me/${digits(G.phone)}?text=${encodeURIComponent(`Hi ${G.name}, ${a.dataset.wa}.`)}`;
});

/* reviews: only show the section if real numbers were filled in */
if (G.rating && G.rating.value) {
  $('reviews').hidden = false;
  $('quotes').innerHTML = (G.reviews || []).map(r =>
    `<blockquote><p>&ldquo;${r.text}&rdquo;</p><cite>${r.name}</cite></blockquote>`
  ).join('');
}

/* demo bar for the gym owner, dismissible for this browser */
if (G.demo && !sessionStorage.getItem('demoDismissed')) {
  $('demo').hidden = false;
  $('demoWa').href = `https://wa.me/${digits(G.demo.whatsapp)}?text=${encodeURIComponent(`Hi ${G.demo.by}, I saw the demo you built for ${G.name}. Let's talk.`)}`;
}
$('demoX')?.addEventListener('click', () => { $('demo').hidden = true; sessionStorage.setItem('demoDismissed', '1'); });

/* preloader: every hero frame, the "why us" photo and the gallery, then the curtain lifts */
const srcs = Array.from({ length: N }, (_, i) => `img/f${String(i + 1).padStart(2, '0')}.webp`)
  .concat('img/why.webp', G.gallery || []);
let done = 0;
const load = s => new Promise(res => {
  const im = new Image();
  im.onload = im.onerror = () => {
    const p = Math.round(++done / srcs.length * 100);
    $('pct').textContent = p; $('bar').style.transform = `scaleX(${p / 100})`;
    res(im);
  };
  im.src = s;
});
Promise.all([
  Promise.all(srcs.map(load)),
  Promise.race([
    Promise.all(['800 1em Big Shoulders Display', '900 1em Big Shoulders Display', '400 1em Barlow', '500 1em Barlow'].map(f => document.fonts.load(f))),
    new Promise(r => setTimeout(r, 2500))
  ])
]).then(([imgs]) => { start(imgs.slice(0, N)); setTimeout(() => body.classList.add('ready'), 300); });

function start(frames) { scrub(frames); }

/* frames follow scroll through the hero */
function scrub(frames) {
  const c = $('seq'), ctx = c.getContext('2d'), hero = $('hero');
  c.width = frames[0].naturalWidth; c.height = frames[0].naturalHeight;
  let cur = 0, tgt = 0, shown = -1;
  const read = () => {
    const r = hero.getBoundingClientRect();
    tgt = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))) * (N - 1);
  };
  const tick = () => {
    cur += (tgt - cur) * .16;
    if (Math.abs(tgt - cur) < .02) cur = tgt;
    const i = Math.round(cur);
    if (i !== shown) { ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(frames[i], 0, 0); shown = i; }
    requestAnimationFrame(tick);
  };
  addEventListener('scroll', read, { passive: true }); addEventListener('resize', read);
  read(); if (still) cur = tgt;
  tick();
}

/* header menu (mobile dropdown only — desktop shows the links inline, see style.css) */
const bg = $('burger'), mn = $('menu');
const setMenu = o => { mn.classList.toggle('open', o); bg.setAttribute('aria-expanded', o); };
bg.addEventListener('click', () => setMenu(!mn.classList.contains('open')));
mn.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('.top')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* enquiry form -> WhatsApp */
$('f').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, name = f.n.value.trim();
  let ph = f.p.value.replace(/\D/g, '');
  if (ph.length > 10 && /^(91|0)/.test(ph)) ph = ph.slice(-10);
  const fail = (m, el) => { $('err').textContent = m; el.focus(); };
  if (name.length < 2) return fail('Add your name so we know who to reply to.', f.n);
  if (ph.length !== 10) return fail('Enter a 10-digit mobile number.', f.p);
  $('err').textContent = '';
  const text = `Hi ${G.name}, I'm ${name}. ${f.r.value}. You can reach me on ${ph}.`;
  window.open(`https://wa.me/${digits(G.phone)}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
})();
