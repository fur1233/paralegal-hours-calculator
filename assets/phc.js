/* Paralegal Hours Calculator (Test) */
(function () {
  'use strict';

  const WEEKS_PER_MONTH = 4.35;
  const HOURS_DECIMALS = 2;
  const MONEY_DECIMALS = 2;

  const TASKS = [
    { id: 'intake',    label: 'Client Intake',              icon: '📞', hint: 'phone/email/chat' },
    { id: 'calendar',  label: 'Calendar Management',         icon: '📅', hint: 'scheduling & reminders' },
    { id: 'drafting',  label: 'Drafting Documents',          icon: '📝', hint: 'motions, letters, agreements' },
    { id: 'discovery', label: 'Discovery / Evidence Review', icon: '🔍', hint: 'reviewing & organizing' },
    { id: 'filing',    label: 'Court Filing / E-Filing',     icon: '⚖️', hint: 'e-filing & submissions' },
    { id: 'crm',       label: 'CRM Updates / Case Notes',    icon: '💼', hint: 'logging & data entry' },
    { id: 'followup',  label: 'Client Follow-Ups',           icon: '✉️', hint: 'communications' },
    { id: 'research',  label: 'Legal Research',              icon: '📚', hint: 'case law & precedents' },
    { id: 'billing',   label: 'Billing & Invoicing',         icon: '💰', hint: 'time tracking & invoices' },
    { id: 'archiving', label: 'Organizing / Archiving Docs', icon: '🗂️', hint: 'file management' },
    { id: 'other',     label: 'Other Tasks',                 icon: '➕', hint: 'anything else' },
  ];

  let currentMode = 'weekly';
  let currentStep = 0;
  let storedRate = 0;

  const $ = (sel) => document.querySelector(sel);
  const safeNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const roundTo = (n, decimals) => {
    const p = Math.pow(10, decimals);
    return Math.round(n * p) / p;
  };
  const fmtHours = (n) => roundTo(n, HOURS_DECIMALS).toFixed(HOURS_DECIMALS);
  const fmtMoney = (n) => n.toLocaleString('en-US', { minimumFractionDigits: MONEY_DECIMALS, maximumFractionDigits: MONEY_DECIMALS });

  function buildTaskCards() {
    const grid = $('#task-grid');
    if (!grid) return;

    grid.innerHTML = '';
    TASKS.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.id = 'card-' + task.id;

      card.innerHTML = `
        <div class="task-card-header">
          <div class="task-icon">${task.icon}</div>
          <div>
            <div class="task-label">${task.label}</div>
            <div style="font-size:12px;color:var(--text-light);margin-top:1px">${task.hint}</div>
          </div>
          <div class="task-total-badge empty" id="badge-${task.id}">0 min/wk</div>
        </div>

        <div class="task-fields">
          <div class="field-group field-time">
            <label class="field-label" for="time-${task.id}">Minutes / Occurrence</label>
            <input class="field-input" type="number" id="time-${task.id}" placeholder="e.g. 30" min="0" inputmode="decimal"/>
          </div>

          <div class="field-group" id="wrap-weekly-${task.id}">
            <label class="field-label" for="occ-weekly-${task.id}">Times / Week</label>
            <input class="field-input" type="number" id="occ-weekly-${task.id}" placeholder="e.g. 5" min="0" inputmode="decimal"/>
          </div>

          <div class="field-group" id="wrap-monthly-${task.id}">
            <label class="field-label" for="occ-monthly-${task.id}">Times / Month</label>
            <input class="field-input" type="number" id="occ-monthly-${task.id}" placeholder="e.g. 20" min="0" inputmode="decimal"/>
          </div>
        </div>
      `;

      grid.appendChild(card);

      ['time', 'occ-weekly', 'occ-monthly'].forEach(prefix => {
        const el = document.getElementById(prefix + '-' + task.id);
        if (el) el.addEventListener('input', () => calcTask(task.id));
      });
    });

    syncModeVisibility();
    recalcAll();
  }

  function setMode(mode) {
    currentMode = mode;
    $('#mode-weekly')?.classList.toggle('active', mode === 'weekly');
    $('#mode-monthly')?.classList.toggle('active', mode === 'monthly');
    syncModeVisibility();
    recalcAll();
  }

  function syncModeVisibility() {
    TASKS.forEach(task => {
      const wrapW = document.getElementById('wrap-weekly-' + task.id);
      const wrapM = document.getElementById('wrap-monthly-' + task.id);
      const inputW = document.getElementById('occ-weekly-' + task.id);
      const inputM = document.getElementById('occ-monthly-' + task.id);
      if (!wrapW || !wrapM || !inputW || !inputM) return;

      const weeklyActive = currentMode === 'weekly';

      wrapW.style.opacity = weeklyActive ? '1' : '0.35';
      wrapM.style.opacity = weeklyActive ? '0.35' : '1';
      wrapW.style.pointerEvents = weeklyActive ? 'auto' : 'none';
      wrapM.style.pointerEvents = weeklyActive ? 'none' : 'auto';

      inputW.disabled = !weeklyActive;
      inputM.disabled = weeklyActive;
      inputW.setAttribute('aria-disabled', String(!weeklyActive));
      inputM.setAttribute('aria-disabled', String(weeklyActive));
    });
  }

  function getTaskMinutesPerWeek(taskId) {
    const timeVal = safeNum(document.getElementById('time-' + taskId)?.value);
    const weekOcc = safeNum(document.getElementById('occ-weekly-' + taskId)?.value);
    const monthOcc = safeNum(document.getElementById('occ-monthly-' + taskId)?.value);
    if (currentMode === 'weekly') return timeVal * weekOcc;
    return (timeVal * monthOcc) / WEEKS_PER_MONTH;
  }

  function calcTask(taskId) {
    const minsPerWeek = getTaskMinutesPerWeek(taskId);
    const badge = document.getElementById('badge-' + taskId);
    const card = document.getElementById('card-' + taskId);

    if (badge && card) {
      if (minsPerWeek > 0) {
        const display = minsPerWeek >= 60
          ? (minsPerWeek / 60).toFixed(1) + ' hrs/wk'
          : Math.round(minsPerWeek) + ' min/wk';
        badge.textContent = display;
        badge.classList.remove('empty');
        card.classList.add('has-value');
      } else {
        badge.textContent = '0 min/wk';
        badge.classList.add('empty');
        card.classList.remove('has-value');
      }
    }

    recalcAll();
  }

  function computeTotals() {
    let totalMinsWeek = 0;
    let taskCount = 0;
    TASKS.forEach(t => {
      const m = getTaskMinutesPerWeek(t.id);
      totalMinsWeek += m;
      if (m > 0) taskCount++;
    });

    const hrsWeekExact = totalMinsWeek / 60;
    const hrsMonthExact = hrsWeekExact * WEEKS_PER_MONTH;

    const hrsWeek = roundTo(hrsWeekExact, HOURS_DECIMALS);
    const hrsMonth = roundTo(hrsMonthExact, HOURS_DECIMALS);

    return { taskCount, hrsWeek, hrsMonth };
  }

  function recalcAll() {
    const totals = computeTotals();

    const totalWeekly = $('#total-weekly');
    const totalMonthly = $('#total-monthly');
    const totalTasks = $('#total-tasks');

    if (totalWeekly) totalWeekly.innerHTML = fmtHours(totals.hrsWeek) + '<span class="total-item-unit">hrs</span>';
    if (totalMonthly) totalMonthly.innerHTML = fmtHours(totals.hrsMonth) + '<span class="total-item-unit">hrs</span>';
    if (totalTasks) totalTasks.innerHTML = totals.taskCount + '<span class="total-item-unit">tasks</span>';

    updateSavings();
    updateResults();
  }

  function updateSavings() {
    storedRate = safeNum($('#hourly-rate')?.value);
    const totals = computeTotals();

    const valWeek = totals.hrsWeek * storedRate;
    const valMonth = totals.hrsMonth * storedRate;

    $('#s-weekly-hrs') && ($('#s-weekly-hrs').textContent = fmtHours(totals.hrsWeek));
    $('#s-monthly-hrs') && ($('#s-monthly-hrs').textContent = fmtHours(totals.hrsMonth));

    $('#s-weekly-val') && ($('#s-weekly-val').textContent = storedRate > 0 ? '$' + fmtMoney(valWeek) : '—');
    $('#s-monthly-val') && ($('#s-monthly-val').textContent = storedRate > 0 ? '$' + fmtMoney(valMonth) : '—');
  }

  function updateResults() {
    const rate = storedRate;
    const totals = computeTotals();

    const valWeek = totals.hrsWeek * rate;
    const valMonth = totals.hrsMonth * rate;

    $('#r-weekly-hrs') && ($('#r-weekly-hrs').textContent = fmtHours(totals.hrsWeek));
    $('#r-monthly-hrs') && ($('#r-monthly-hrs').textContent = fmtHours(totals.hrsMonth));

    $('#r-weekly-val') && ($('#r-weekly-val').textContent = rate > 0 ? '$' + fmtMoney(valWeek) : '$—');
    $('#r-monthly-val') && ($('#r-monthly-val').textContent = rate > 0 ? '$' + fmtMoney(valMonth) : '$—');

    $('#r-w2') && ($('#r-w2').textContent = fmtHours(totals.hrsWeek));
    $('#r-m2') && ($('#r-m2').textContent = fmtHours(totals.hrsMonth));

    const summary = $('#r-summary-text');
    if (summary) {
      summary.innerHTML = `That's <span id="r-monthly-hrs">${fmtHours(totals.hrsMonth)}</span> hours per month of high-value work you could delegate — giving you back the time to focus on what only you can do.`;
    }
  }

  const STEP_LABELS = ['', 'Tasks & Time', 'Hourly Rate', 'Your Results'];

  function goToStep(n) {
    if (currentStep >= 1) $('#step-' + currentStep)?.classList.remove('active');
    currentStep = n;
    $('#step-' + n)?.classList.add('active');

    for (let i = 1; i <= 3; i++) {
      const dot = $('#dot-' + i);
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < n) dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
    }

    $('#progress-label') && ($('#progress-label').textContent = 'Step ' + n + ' of 3');
    $('#step-name-label') && ($('#step-name-label').textContent = STEP_LABELS[n]);

    recalcAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startCalc() {
    $('#hero-section')?.classList.add('hidden');
    $('#progress-bar')?.classList.remove('hidden');
    $('#calc-wrap')?.classList.remove('hidden');

    buildTaskCards();
    goToStep(1);
  }

  function resetCalc() {
    currentMode = 'weekly';
    storedRate = 0;
    currentStep = 0;

    TASKS.forEach(t => {
      const a = document.getElementById('time-' + t.id); if (a) a.value = '';
      const b = document.getElementById('occ-weekly-' + t.id); if (b) b.value = '';
      const c = document.getElementById('occ-monthly-' + t.id); if (c) c.value = '';
    });
    const r = $('#hourly-rate'); if (r) r.value = '';

    $('#calc-wrap')?.classList.add('hidden');
    $('#progress-bar')?.classList.add('hidden');
    $('#hero-section')?.classList.remove('hidden');

    $('#mode-weekly')?.classList.add('active');
    $('#mode-monthly')?.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function wireEvents() {
    if (!$('#start-btn') || !$('#hero-section') || !$('#calc-wrap')) return;

    $('#start-btn')?.addEventListener('click', startCalc);

    $('#mode-weekly')?.addEventListener('click', () => setMode('weekly'));
    $('#mode-monthly')?.addEventListener('click', () => setMode('monthly'));

    $('#to-step-2')?.addEventListener('click', () => goToStep(2));
    $('#to-step-3')?.addEventListener('click', () => goToStep(3));
    $('#back-to-1')?.addEventListener('click', () => goToStep(1));
    $('#back-to-2')?.addEventListener('click', () => goToStep(2));

    $('#reset')?.addEventListener('click', resetCalc);
    $('#hourly-rate')?.addEventListener('input', updateSavings);
  }

  document.addEventListener('DOMContentLoaded', wireEvents);
})();
