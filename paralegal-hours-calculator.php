<?php
/**
 * Plugin Name: Paralegal Hours Calculator (Test)
 * Description: A 3-step paralegal hours calculator as a shortcode. Use shortcode: [paralegal_hours_calculator]
 * Version: 1.0.1
 * Author: Farjad ur Rehman
 * Author URI: https://github.com/fur1233/
 * License: GPLv2 or later
 * Text Domain: paralegal-hours-calculator
 */

if (!defined('ABSPATH')) { exit; }

define('PHC_VER', '1.0.1');
define('PHC_URL', plugin_dir_url(__FILE__));
define('PHC_PATH', plugin_dir_path(__FILE__));

function phc_register_assets() {
  wp_register_style('phc-styles', PHC_URL . 'assets/phc.css', array(), PHC_VER);
  wp_register_script('phc-script', PHC_URL . 'assets/phc.js', array(), PHC_VER, true);
}
add_action('wp_enqueue_scripts', 'phc_register_assets');

function phc_shortcode() {
  wp_enqueue_style('phc-styles');
  wp_enqueue_script('phc-script');

  ob_start();
  ?>
  <div class="phc-root">
    <section class="hero" id="hero-section">
      <span class="logo">DocketWorks by Speakeasy Authority</span>
      <h1>Discover how many hours you could <em>reclaim</em> every week</h1>
      <p>This 3-step calculator shows you exactly what an International Licensed Attorney could take off your plate — at half the cost.</p>

      <button class="start-btn" id="start-btn" type="button">
        Begin the 4-minute calculator
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <p class="hero-meta">No forms · No spam · Just clarity</p>
    </section>

    <div class="progress-wrap hidden" id="progress-bar">
      <div class="progress-inner">
        <div class="step-dots">
          <div class="step-dot active" id="dot-1"></div>
          <div class="step-dot" id="dot-2"></div>
          <div class="step-dot" id="dot-3"></div>
        </div>
        <span class="progress-label" id="progress-label">Step 1 of 3</span>
        <span class="step-name" id="step-name-label">Tasks &amp; Time</span>
      </div>
    </div>

    <div class="calc-wrap hidden" id="calc-wrap">
      <div class="step-panel active" id="step-1">
        <div class="step-header">
          <p class="step-number">Step 1 of 3</p>
          <h2>What tasks fill your week?</h2>
          <p>Enter minutes per occurrence and frequency. Weekly/Monthly disables the inactive column (mouse + keyboard) and uses 4.35 weeks/month for conversion.</p>
        </div>

        <div class="mode-toggle">
          <button class="mode-btn active" id="mode-weekly" type="button">Weekly</button>
          <button class="mode-btn" id="mode-monthly" type="button">Monthly</button>
        </div>

        <div class="task-grid" id="task-grid"></div>

        <div class="totals-bar">
          <div class="total-item">
            <div class="total-item-label">Hours / Week</div>
            <div class="total-item-value" id="total-weekly">0.00<span class="total-item-unit">hrs</span></div>
          </div>
          <div class="total-item">
            <div class="total-item-label">Hours / Month</div>
            <div class="total-item-value" id="total-monthly">0.00<span class="total-item-unit">hrs</span></div>
          </div>
          <div class="total-item">
            <div class="total-item-label">Tasks Entered</div>
            <div class="total-item-value" id="total-tasks">0<span class="total-item-unit">tasks</span></div>
          </div>
        </div>

        <p class="helper-text"><span class="helper-icon">💡</span> Only fill in tasks relevant to your practice.</p>

        <div class="nav-buttons">
          <button class="btn-next" id="to-step-2" type="button">
            Continue to Hourly Rate
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div class="step-panel" id="step-2">
        <div class="step-header">
          <p class="step-number">Step 2 of 3</p>
          <h2>What is your time worth?</h2>
          <p>Enter your hourly rate. Savings are computed using the rounded hours shown (2 decimals) to match the original calculator behavior.</p>
        </div>

        <div class="rate-card">
          <h3>Your Effective Hourly Rate</h3>
          <p>If you charge flat fees, divide typical monthly revenue by total hours worked to estimate this.</p>
          <div class="rate-input-wrap">
            <span class="rate-symbol">$</span>
            <input type="number" class="rate-input" id="hourly-rate" placeholder="300" min="0" inputmode="decimal"/>
          </div>
        </div>

        <div class="savings-preview">
          <h3>Your Potential Savings</h3>
          <div class="savings-grid">
            <div>
              <div class="savings-item-label">Hours Delegated / Week</div>
              <div class="savings-item-value" id="s-weekly-hrs">0.00</div>
              <div class="savings-item-sub">hours / week</div>
            </div>
            <div>
              <div class="savings-item-label">Value of Weekly Time</div>
              <div class="savings-item-value" id="s-weekly-val">—</div>
              <div class="savings-item-sub">weekly savings</div>
            </div>
            <div>
              <div class="savings-item-label">Hours Delegated / Month</div>
              <div class="savings-item-value" id="s-monthly-hrs">0.00</div>
              <div class="savings-item-sub">hours / month</div>
            </div>
            <div>
              <div class="savings-item-label">Value of Monthly Time</div>
              <div class="savings-item-value" id="s-monthly-val">—</div>
              <div class="savings-item-sub">monthly savings</div>
            </div>
          </div>
        </div>

        <div class="nav-buttons">
          <button class="btn-back" id="back-to-1" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </button>
          <button class="btn-next" id="to-step-3" type="button">
            See Results
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div class="step-panel" id="step-3">
        <div class="step-header">
          <p class="step-number">Step 3 of 3</p>
          <h2>Your personalized results</h2>
        </div>

        <div class="results-hero">
          <p class="results-hero-label">Your Time Opportunity</p>
          <h2>You could reclaim <span id="r-weekly-hrs">0.00</span> hours<br/>every single week</h2>
          <p id="r-summary-text">That's <span id="r-monthly-hrs">0.00</span> hours per month of high-value work you could delegate — giving you back the time to focus on what only you can do.</p>
        </div>

        <div class="results-grid">
          <div class="result-card accent">
            <div class="result-card-label">Weekly Value Reclaimed</div>
            <div class="result-card-value" id="r-weekly-val">$—</div>
            <div class="result-card-sub">at your hourly rate</div>
          </div>
          <div class="result-card accent">
            <div class="result-card-label">Monthly Value Reclaimed</div>
            <div class="result-card-value" id="r-monthly-val">$—</div>
            <div class="result-card-sub">at your hourly rate</div>
          </div>
          <div class="result-card">
            <div class="result-card-label">Total Weekly Hours</div>
            <div class="result-card-value" id="r-w2">0.00</div>
            <div class="result-card-sub">hours of paralegal work / week</div>
          </div>
          <div class="result-card">
            <div class="result-card-label">Total Monthly Hours</div>
            <div class="result-card-value" id="r-m2">0.00</div>
            <div class="result-card-sub">hours of paralegal work / month</div>
          </div>
        </div>

        <div class="nav-buttons">
          <button class="btn-back" id="back-to-2" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </button>
          <button class="btn-back" id="reset" type="button" style="margin-left:auto;">Start Over</button>
        </div>
      </div>
    </div>
  </div>
  <?php
  return ob_get_clean();
}
add_shortcode('paralegal_hours_calculator', 'phc_shortcode');
