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

    var microRings = document.querySelectorAll('.micro-ring');
    microRings.forEach(function (mr) {
      var target = mr.style.getPropertyValue('--pct');
      mr.style.setProperty('--pct', '0');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          mr.style.setProperty('--pct', target);
        });
      });
    });
  }

  function initInputTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.input-tab'));
    if (!tabs.length) return;
    var panels = Array.prototype.slice.call(document.querySelectorAll('.input-panel'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.getAttribute('data-panel');
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== target;
        });
      });
    });
  }

  function initFoodChips() {
    Array.prototype.slice.call(document.querySelectorAll('.food-chip')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('is-added');
      });
    });
  }

  function initFavButtons() {
    Array.prototype.slice.call(document.querySelectorAll('.fav-btn')).forEach(function (btn) {
      var defaultLabel = btn.textContent;
      var activeLabel = '♥ お気に入りに保存しました';
      btn.addEventListener('click', function () {
        var isFav = btn.classList.toggle('is-fav');
        btn.textContent = isFav ? activeLabel : defaultLabel;
      });
    });
  }

  function initMealEdit() {
    var toggle = document.getElementById('meal-edit-toggle');
    var panel = document.getElementById('meal-edit');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });

    var kcalEl = document.querySelector('[data-count-kcal]');
    var gramEl = document.querySelector('[data-count-gram]');

    function recalc() {
      var totalKcal = 0, totalGram = 0;
      Array.prototype.slice.call(panel.querySelectorAll('.food-item-row')).forEach(function (row) {
        totalKcal += +row.dataset.kcal;
        totalGram += +row.dataset.grams;
      });
      if (kcalEl) kcalEl.textContent = totalKcal.toLocaleString('ja-JP');
      if (gramEl) gramEl.textContent = totalGram.toLocaleString('ja-JP');
    }

    panel.addEventListener('click', function (e) {
      var row = e.target.closest('.food-item-row');
      if (row) {
        var step = +row.dataset.step || 10;
        var kcalStep = +row.dataset.kcalPerStep || 0;
        if (e.target.classList.contains('qty-plus')) {
          row.dataset.grams = String(+row.dataset.grams + step);
          row.dataset.kcal = String(+row.dataset.kcal + kcalStep);
        } else if (e.target.classList.contains('qty-minus')) {
          if (+row.dataset.grams - step <= 0) return;
          row.dataset.grams = String(+row.dataset.grams - step);
          row.dataset.kcal = String(Math.max(0, +row.dataset.kcal - kcalStep));
        } else if (e.target.classList.contains('remove-btn')) {
          row.remove();
          recalc();
          return;
        } else {
          return;
        }
        row.querySelector('.qty-val').textContent = row.dataset.grams + 'g';
        row.querySelector('.food-kcal').textContent = row.dataset.kcal + 'kcal';
        recalc();
        return;
      }

      var chip = e.target.closest('.add-item-chip');
      if (chip) {
        var grams = +chip.dataset.grams;
        var kcal = +chip.dataset.kcal;
        var newRow = document.createElement('div');
        newRow.className = 'food-item-row';
        newRow.dataset.grams = String(grams);
        newRow.dataset.kcal = String(kcal);
        newRow.dataset.step = '10';
        newRow.dataset.kcalPerStep = String(Math.max(1, Math.round(kcal / grams * 10)));
        newRow.innerHTML =
          '<span class="food-name">' + chip.dataset.name + '</span>' +
          '<span class="food-kcal">' + kcal + 'kcal</span>' +
          '<div class="qty-stepper"><button class="qty-minus">−</button><span class="qty-val">' + grams + 'g</span><button class="qty-plus">+</button></div>' +
          '<button class="remove-btn">×</button>';
        var addRow = chip.closest('.add-item-row');
        addRow.parentNode.insertBefore(newRow, addRow);
        chip.remove();
        recalc();
      }
    });
  }

  function initMealSuggestions() {
    var card = document.getElementById('meal-suggestions');
    if (!card) return;
    var items = Array.prototype.slice.call(card.querySelectorAll('.suggestion-item'));
    var advice = card.querySelector('.advice-box');

    function resetSelection() {
      items.forEach(function (it) {
        it.classList.remove('is-selected', 'is-collapsed');
      });
      if (advice) advice.classList.remove('is-collapsed');
    }

    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (item.classList.contains('is-selected')) return;
        if (e.target.closest('.suggestion-cta')) return;
        items.forEach(function (it) {
          it.classList.toggle('is-collapsed', it !== item);
          it.classList.toggle('is-selected', it === item);
        });
        if (advice) advice.classList.add('is-collapsed');
      });
    });

    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-suggestion-action="back"]')) {
        e.stopPropagation();
        resetSelection();
      } else if (e.target.closest('[data-suggestion-action="plan"]')) {
        e.stopPropagation();
        window.location.href = 'mealplan.html';
      }
    });
  }

  function initWaterTracker() {
    Array.prototype.slice.call(document.querySelectorAll('.water-add-btn')).forEach(function (btn) {
      var card = btn.closest('.water-card');
      if (!card) return;
      var mlEl = card.querySelector('.water-ml');
      var barFill = card.querySelector('.water-bar-fill');
      var goal = 2000;
      var amount = parseInt(mlEl.textContent.replace(/,/g, ''), 10) || 0;
      btn.addEventListener('click', function () {
        amount += 200;
        mlEl.textContent = amount.toLocaleString('ja-JP');
        if (barFill) barFill.style.width = Math.min(100, Math.round(amount / goal * 100)) + '%';
      });
    });
  }

  function initRoutineChecklist() {
    Array.prototype.slice.call(document.querySelectorAll('.routine-card')).forEach(function (card) {
      var items = Array.prototype.slice.call(card.querySelectorAll('[data-routine-item]'));
      var hint = card.querySelector('[data-routine-hint]');
      var completeBtn = card.querySelector('[data-routine-complete]');
      if (!items.length) return;

      function nowLabel() {
        var d = new Date();
        return d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
      }

      function markDone(item) {
        if (item.classList.contains('done')) return;
        item.classList.add('done');
        item.querySelector('.routine-check').textContent = '✓';
        item.querySelector('.routine-meta').textContent = nowLabel();
      }

      function refresh() {
        var remaining = items.filter(function (it) { return !it.classList.contains('done'); }).length;
        if (hint) {
          if (remaining === 0) {
            hint.textContent = '朝のルーティンが完了しました！🎉';
            hint.classList.add('all-done');
          } else {
            hint.textContent = '残り' + remaining + '項目を済ませたら朝のルーティンが完了します！🎉';
            hint.classList.remove('all-done');
          }
        }
        if (completeBtn) {
          if (remaining === 0) {
            completeBtn.textContent = '完了しました ✓';
            completeBtn.disabled = true;
          } else {
            completeBtn.textContent = '朝のルーティンを完了する';
            completeBtn.disabled = false;
          }
        }
      }

      items.forEach(function (item) {
        item.addEventListener('click', function () {
          markDone(item);
          refresh();
        });
      });

      if (completeBtn) {
        completeBtn.addEventListener('click', function () {
          items.forEach(markDone);
          refresh();
        });
      }

      refresh();
    });
  }

  function initMealPlanStrip() {
    var days = Array.prototype.slice.call(document.querySelectorAll('.plan-day'));
    var label = document.getElementById('plan-date-label');
    if (!days.length || !label) return;
    days.forEach(function (day) {
      day.addEventListener('click', function () {
        days.forEach(function (d) { d.classList.remove('active'); });
        day.classList.add('active');
        label.textContent = day.dataset.label + 'の献立（AI自動生成）';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMealAnalysisDemo();
    initScoreRingAnimation();
    initInputTabs();
    initFoodChips();
    initFavButtons();
    initMealEdit();
    initMealPlanStrip();
    initMealSuggestions();
    initWaterTracker();
    initRoutineChecklist();
  });
})();
