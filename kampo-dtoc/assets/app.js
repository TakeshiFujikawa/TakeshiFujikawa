(() => {
  'use strict';

  /* ---------- header scroll / hamburger ---------- */
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
    toggleStickyCta();
  });

  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  /* ---------- sticky mobile CTA ---------- */
  const stickyCta = document.getElementById('sticky-cta');
  const hero = document.getElementById('hero');
  function toggleStickyCta() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    stickyCta.classList.toggle('show', heroBottom < 0);
  }

  /* ---------- toast ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- cart ---------- */
  const cartCountEl = document.getElementById('cart-count');
  let cartCount = 0;
  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card.querySelector('h3').textContent;
      cartCount += 1;
      cartCountEl.textContent = String(cartCount);
      cartCountEl.classList.remove('bump');
      requestAnimationFrame(() => cartCountEl.classList.add('bump'));
      showToast(`「${name}」をカートに追加しました`);
    });
  });

  /* ---------- countdown ---------- */
  const countdownEl = document.getElementById('countdown');
  function getCampaignDeadline() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return end;
  }
  const campaignEnd = getCampaignDeadline();
  function tickCountdown() {
    const diff = campaignEnd.getTime() - Date.now();
    if (diff <= 0) {
      countdownEl.textContent = '本キャンペーンは終了しました';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    countdownEl.textContent = `${d}日 ${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- health check ---------- */
  const checkGrid = document.getElementById('check-grid');
  const checkCountEl = document.getElementById('check-count');
  const checkMessageEl = document.getElementById('check-message');
  const checkCta = document.getElementById('check-cta');

  const checkMessages = [
    { max: 0, text: '気になる項目をタップして、あなたに合うタイプを見つけましょう。', target: null },
    { max: 2, text: 'まずは軽やかに続けやすい「ドリンクタイプ」から始めるのがおすすめです。', target: 'drink' },
    { max: 4, text: 'いくつかの不調が重なっています。基本となる「粒タイプ」でしっかり整えましょう。', target: 'standard' },
    { max: 6, text: '不調のサインが多く見られます。「粒タイプ」+「ナイト&リカバリー」の組み合わせがおすすめです。', target: 'night' },
    { max: 8, text: 'かなりお疲れのご様子です。日中は粒タイプ、夜はナイト&リカバリーで一日を通してケアしましょう。', target: 'night' },
  ];

  function updateCheckResult() {
    const selected = checkGrid.querySelectorAll('.check-item.selected').length;
    checkCountEl.textContent = String(selected);
    const tier = checkMessages.slice().reverse().find((m) => selected >= m.max) || checkMessages[0];
    checkMessageEl.textContent = tier.text;
    checkCta.href = tier.target ? `#${tier.target}` : '#products';
  }

  checkGrid.querySelectorAll('.check-item').forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      updateCheckResult();
    });
  });

  /* ---------- product filter ---------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      productCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------- plan toggle (single vs subscription price) ---------- */
  document.querySelectorAll('.product-card').forEach((card) => {
    const priceBox = card.querySelector('.product-price');
    const priceValue = priceBox.querySelector('.price-value');
    const planBtns = card.querySelectorAll('.plan-btn');
    const single = Number(priceBox.dataset.single);
    const sub = Number(priceBox.dataset.sub);

    planBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        planBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;
        priceValue.textContent = btn.dataset.plan === 'sub' ? yen(sub) : yen(single);
      });
    });
  });

  /* ---------- testimonial carousel ---------- */
  const track = document.getElementById('testimonial-track');
  const slides = track.children;
  const dotsWrap = document.getElementById('carousel-dots');
  let activeSlide = 0;
  let autoplayTimer = null;

  for (let i = 0; i < slides.length; i += 1) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `${i + 1}番目の声を表示`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }

  function goToSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeSlide * 100}%)`;
    Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === activeSlide));
  }

  document.getElementById('carousel-prev').addEventListener('click', () => { goToSlide(activeSlide - 1); restartAutoplay(); });
  document.getElementById('carousel-next').addEventListener('click', () => { goToSlide(activeSlide + 1); restartAutoplay(); });

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goToSlide(activeSlide + 1), 5000);
  }
  const carousel = document.getElementById('testimonial-carousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  carousel.addEventListener('mouseleave', restartAutoplay);
  restartAutoplay();

  /* ---------- how-to tabs ---------- */
  const howtoTabs = document.querySelectorAll('.howto-tab');
  const howtoPanels = document.querySelectorAll('.howto-panel');
  howtoTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      howtoTabs.forEach((t) => t.classList.remove('active'));
      howtoPanels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-howto-panel="${tab.dataset.howto}"]`).classList.add('active');
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((open) => open.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  toggleStickyCta();
})();
