// VitaOne mockup — lightweight interaction layer for the "撮ったら、ぜんぶ出てくる" demo.
// Pure vanilla JS, no build step: keeps the prototype easy to open directly in a browser.
(function () {
  'use strict';

  function animateNumber(el, to, duration) {
    if (!el) return;
    var from = 0;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString('ja-JP');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initMealAnalysisDemo() {
    var frame = document.getElementById('meal-photo-frame');
    var flow = document.querySelector('.auto-flow');
    if (!frame || !flow) return;

    var steps = Array.prototype.slice.call(flow.querySelectorAll('.step'));
    var sequenced = Array.prototype.slice.call(document.querySelectorAll('[data-seq]'))
      .sort(function (a, b) { return (+a.dataset.seq) - (+b.dataset.seq); });
    var fillBars = Array.prototype.slice.call(document.querySelectorAll('[data-fill]'));
    var kcalEl = document.querySelector('[data-count-kcal]');
    var gramEl = document.querySelector('[data-count-gram]');
    var shutter = frame.querySelector('.shutter');

    var flash = document.createElement('div');
    flash.className = 'shutter-flash';
    frame.appendChild(flash);

    var STEP_GAP = 620;
    var FIRST_STEP_DELAY = 500;
    var SEQ_GAP = 230;
    var playing = false;
    var timers = [];

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function reset() {
      clearTimers();
      steps.forEach(function (step) {
        var dot = step.querySelector('.dot');
        dot.classList.remove('is-active');
        dot.classList.add('is-pending');
      });
      sequenced.forEach(function (el) { el.classList.remove('is-shown'); });
      fillBars.forEach(function (bar) { bar.style.width = '0%'; });
      if (kcalEl) kcalEl.textContent = '0';
      if (gramEl) gramEl.textContent = '0';
    }

    function play() {
      if (playing) return;
      playing = true;
      reset();

      flash.classList.remove('is-flashing');
      shutter.classList.remove('is-snapping');
      void flash.offsetWidth; // restart CSS animations
      flash.classList.add('is-flashing');
      shutter.classList.add('is-snapping');

      steps.forEach(function (step, i) {
        later(function () {
          var dot = step.querySelector('.dot');
          dot.classList.remove('is-pending');
          dot.classList.add('is-active');
        }, FIRST_STEP_DELAY + i * STEP_GAP);
      });

      var afterSteps = FIRST_STEP_DELAY + steps.length * STEP_GAP + 200;

      later(function () {
        animateNumber(kcalEl, 720, 900);
        animateNumber(gramEl, 410, 900);
        fillBars.forEach(function (bar) {
          bar.style.width = bar.getAttribute('data-fill') + '%';
        });
      }, afterSteps);

      sequenced.forEach(function (el, i) {
        later(function () { el.classList.add('is-shown'); }, afterSteps + 300 + i * SEQ_GAP);
      });

      var totalDuration = afterSteps + 300 + sequenced.length * SEQ_GAP + 700;
      later(function () { playing = false; }, totalDuration);
    }

    frame.addEventListener('click', play);

    // Start from the "pending" state immediately, then auto-play shortly
    // after arriving on the screen — the core "magic moment" should be
    // visible without requiring an explicit tap during a live demo.
    reset();
    later(play, 700);
  }

  function initScoreRingAnimation() {
    var ring = document.querySelector('.ring-fg');
    if (!ring) return;
    var finalOffset = ring.getAttribute('stroke-dashoffset');
    var dasharray = parseFloat(ring.getAttribute('stroke-dasharray'));
    ring.style.transition = 'none';
    ring.setAttribute('stroke-dashoffset', String(dasharray));
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ring.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.22,.7,.2,1)';
        ring.setAttribute('stroke-dashoffset', finalOffset);
      });
    });

    var scoreNum = document.querySelector('.ring-center .num');
    if (scoreNum) {
      var target = parseInt(scoreNum.textContent, 10);
      if (!isNaN(target)) animateNumber(scoreNum, target, 1000);
    }

    var bars = document.querySelectorAll('.subscore .bar i');
    bars.forEach(function (bar) {
      var width = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.transition = 'width 1s cubic-bezier(.22,.7,.2,1)';
          bar.style.width = width;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMealAnalysisDemo();
    initScoreRingAnimation();
  });
})();
