/* John Choi 개인 홈페이지 - 인터랙션
   creatorlink.net 메인에서 관찰된 동작(카운트업, 기능 탭, FAQ 아코디언,
   반투명 고정 헤더)을 외부 라이브러리 없이 바닐라 JS로 구현 */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 연도 ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 상단 배너 닫기 ---------- */
  var banner = $('#topBanner');
  var closeBtn = $('[data-close-banner]');
  if (banner && closeBtn) {
    try { if (sessionStorage.getItem('bannerClosed') === '1') banner.classList.add('is-hidden'); } catch (e) {}
    closeBtn.addEventListener('click', function () {
      banner.classList.add('is-hidden');
      try { sessionStorage.setItem('bannerClosed', '1'); } catch (e) {}
    });
  }

  /* ---------- 헤더 스크롤 상태 / 맨 위로 ---------- */
  var header = $('#header');
  var toTop = $('[data-to-top]');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- 모바일 내비 ---------- */
  var navToggle = $('[data-nav-toggle]');
  var nav = $('#nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 카운트업 (뷰포트 진입 시 1회) ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 1500;
    var start = null;
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * easeOut(p)).toLocaleString('ko-KR');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 스크롤 등장 + 카운트업 트리거 ---------- */
  var revealTargets = $$('.section__title, .section__lead, .card, .tile-card, .feature, .video-frame, .faq');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains('reveal')) el.classList.add('is-visible');
        if (el.classList.contains('countup') && !el.dataset.done) {
          el.dataset.done = '1';
          countUp(el);
        }
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });
    $$('.countup').forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    $$('.countup').forEach(countUp);
  }

  /* ---------- 역량 탭 ---------- */
  var tabs = $$('.chip[data-tab]');
  var panels = $$('.feature__panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var id = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === id);
      });
    });
  });

  /* ---------- 글 필터 ---------- */
  var filters = $$('.chip[data-filter]');
  var items = $$('.tile-card[data-cat]');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      items.forEach(function (it) {
        it.classList.toggle('is-hidden', f !== 'all' && it.getAttribute('data-cat') !== f);
      });
    });
  });

  /* ---------- FAQ: 하나만 열리게 ---------- */
  var faqItems = $$('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });
})();
