// Simple JS for mobile nav and year injection
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const headerActions = document.querySelector('.header-actions');

if (toggle){
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.style.display = open ? 'none' : 'block';
    if (headerActions) headerActions.style.display = open ? 'none' : 'flex';
  });
}

const yearEl = document.getElementById('year');
if (yearEl){
  yearEl.textContent = new Date().getFullYear();
}

// Smooth scroll for internal anchors and CTAs
function smoothScrollTo(id){
  const el = document.querySelector(id);
  if (el){
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#') && href.length > 1){
    e.preventDefault();
    smoothScrollTo(href);
  }
});

// Wire primary banner buttons
document.querySelectorAll('.btn.btn-primary').forEach(btn => {
  if (btn.textContent.toLowerCase().includes('schedule')){
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('#doctors');
    });
  }
});
document.querySelectorAll('.btn.btn-ghost').forEach(btn => {
  if (btn.textContent.toLowerCase().includes('learn')){
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('#about');
    });
  }
});

// Doctors drag-to-scroll (mouse/touch)
(function(){
  const track = document.querySelector('.doctors-grid');
  if (!track) return;
  const dotsWrap = document.getElementById('doctor-dots');
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  const start = (x) => {
    isDown = true;
    startX = x;
    scrollStart = track.scrollLeft;
    track.classList.add('grabbing');
  };
  const move = (x) => {
    if (!isDown) return;
    const dx = x - startX;
    track.scrollLeft = scrollStart - dx;
  };
  const end = () => { isDown = false; track.classList.remove('grabbing'); };

  // Mouse
  track.addEventListener('mousedown', (e) => start(e.pageX));
  window.addEventListener('mousemove', (e) => move(e.pageX));
  window.addEventListener('mouseup', end);
  // Touch
  track.addEventListener('touchstart', (e) => start(e.touches[0].pageX), { passive: true });
  track.addEventListener('touchmove', (e) => move(e.touches[0].pageX), { passive: true });
  window.addEventListener('touchend', end);

  // Pagination dots based on pages (number of full views)
  function pageSize(){
    const first = track.querySelector('.doctor-card');
    if (!first) return 1;
    const style = getComputedStyle(track);
    const gap = parseInt(style.columnGap || style.gap || '0', 10) || 0;
    const container = track.parentElement.clientWidth;
    const card = first.offsetWidth;
    const perView = Math.max(1, Math.floor((container + gap) / (card + gap)));
    return perView;
  }
  function pageCount(){
    const total = track.querySelectorAll('.doctor-card').length;
    return Math.max(1, Math.ceil(total / pageSize()));
  }
  function activeIndex(){
    const p = pageSize();
    const style = getComputedStyle(track);
    const gap = parseInt(style.columnGap || style.gap || '0', 10) || 0;
    const first = track.querySelector('.doctor-card');
    const step = (first ? first.offsetWidth : 0) + gap;
    const index = Math.round(track.scrollLeft / (p * step));
    return index;
  }
  function buildDots(){
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const pages = pageCount();
    for (let i=0;i<pages;i++){
      const dot = document.createElement('span');
      dot.className = 'dot' + (i===0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }
  function updateDots(){
    if (!dotsWrap) return;
    const i = activeIndex();
    dotsWrap.querySelectorAll('.dot').forEach((d,idx)=>{
      d.classList.toggle('active', idx===i);
    });
  }
  function goTo(page){
    const p = pageSize();
    const style = getComputedStyle(track);
    const gap = parseInt(style.columnGap || style.gap || '0', 10) || 0;
    const first = track.querySelector('.doctor-card');
    const step = (first ? first.offsetWidth : 0) + gap;
    track.scrollTo({ left: page * p * step, behavior: 'smooth' });
  }
  track.addEventListener('scroll', () => updateDots());
  window.addEventListener('resize', () => { buildDots(); updateDots(); });
  // init
  buildDots();
  updateDots();
})();

// Testimonials arrows keep stepper behavior
function makeStepper(trackSelector, prevSelector, nextSelector, itemSelector){
  const track = document.querySelector(trackSelector);
  if (!track) return;
  const prev = document.querySelector(prevSelector);
  const next = document.querySelector(nextSelector);
  let index = 0;
  function step(){
    const first = track.querySelector(itemSelector);
    if (!first) return first?.offsetWidth || 0;
    const style = getComputedStyle(track);
    const gap = parseInt(style.columnGap || style.gap || '0', 10) || 0;
    return first.offsetWidth + gap;
  }
  function clamp(){
    const items = track.querySelectorAll(itemSelector).length;
    const visible = Math.max(1, Math.round(track.parentElement.clientWidth / step()));
    const maxIndex = Math.max(0, items - visible);
    if (index < 0) index = 0; if (index > maxIndex) index = maxIndex;
  }
  function update(){ track.style.transform = `translateX(${-index * step()}px)`; }
  function go(d){ index += d; clamp(); update(); }
  if (prev) prev.addEventListener('click', () => go(-1));
  if (next) next.addEventListener('click', () => go(1));
  window.addEventListener('resize', () => { clamp(); update(); });
  clamp(); update();
}
makeStepper('.t-grid', '.testimonials .prev', '.testimonials .next', '.t-card');

// Wire doctor card buttons
document.querySelectorAll('#doctors .doctor-actions .btn-primary').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollTo('#how');
  });
});
document.querySelectorAll('#doctors .doctor-actions .btn-ghost').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Doctor details coming soon.');
  });
});
