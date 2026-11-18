/* ==========================================
   PASCAL GLOBAL SOLUTIONS LTD
   Corporate Interactive Script - Phased UI & UX
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initDivisionTabs();
  initFAQAccordion();
  initScrollEffects();
  initScrollReveals(); // hardware-accelerated scroll reveals
  renderCifChips(); // render quick CIF preset chips
  calculateDuty(); // initial calculator run & bar render
  updateReadinessScore(); // initial checklist run
  updateModalDivisionHints(); // initialize modal division context
});

/* ------------------------------------------
   1. Theme Toggle (Light Theme Default)
   ------------------------------------------ */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  } else {
    document.body.classList.remove('light-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    toggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  });
}

/* ------------------------------------------
   2. Mobile Navigation Menu & Drawer
   ------------------------------------------ */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');
  
  if (!mobileBtn || !navMenu) return;

  mobileBtn.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active', isActive);
    if (overlay) overlay.classList.toggle('active', isActive);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

function closeMobileMenu() {
  const mobileBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');
  if (navMenu) navMenu.classList.remove('active');
  if (mobileBtn) mobileBtn.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

/* ------------------------------------------
   3. Scroll Progress Bar & Back to Top (Phase 3)
   ------------------------------------------ */
function initScrollEffects() {
  const scrollBar = document.getElementById('scroll-bar');
  const backToTopBtn = document.getElementById('back-to-top');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    if (scrollBar) scrollBar.style.width = scrolled + '%';

    if (navbar) {
      if (winScroll > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (winScroll > 350) {
        backToTopBtn.classList.add('active');
      } else {
        backToTopBtn.classList.remove('active');
      }
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------
   3.1 Scroll Reveal Animations (IntersectionObserver)
   ------------------------------------------ */
function initScrollReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealSelectors = [
    '.strength-card',
    '.executive-metrics-strip .metric-item',
    '.about-grid',
    '.div-card',
    '.calc-wrapper',
    '.checklist-card',
    '.faq-item',
    '.contact-card-grid > div'
  ];

  // Add stagger container class to parent grids
  const staggerContainers = document.querySelectorAll('.key-strengths-grid, .executive-metrics-strip, .divisions-grid');
  staggerContainers.forEach(c => c.classList.add('reveal-stagger'));

  const elements = document.querySelectorAll(revealSelectors.join(', '));
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.08
    });

    elements.forEach(el => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  } else {
    elements.forEach(el => el.classList.add('is-revealed'));
  }
}

/* ------------------------------------------
   4. Toast Notification System (Phase 3)
   ------------------------------------------ */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Copied to clipboard!');
  }).catch(() => {
    showToast('Hotline: ' + text);
  });
}

/* ------------------------------------------
   5. Division Filtering Tabs
   ------------------------------------------ */
function initDivisionTabs() {
  const tabs = document.querySelectorAll('.div-tab');
  const cards = document.querySelectorAll('.div-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.div;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

/* ------------------------------------------
   6. Duty & Landed Cost Calculator Logic (Enhanced UI/UX)
   ------------------------------------------ */
let currentCurrency = 'KES';
const USD_RATE = 130; // KES per USD reference rate

const CIF_PRESETS = {
  KES: [
    { label: '500K', val: 500000 },
    { label: '1M', val: 1000000 },
    { label: '3M', val: 3000000 },
    { label: '5M', val: 5000000 },
    { label: '10M', val: 10000000 }
  ],
  USD: [
    { label: '$5K', val: 5000 },
    { label: '$10K', val: 10000 },
    { label: '$25K', val: 25000 },
    { label: '$50K', val: 50000 },
    { label: '$100K', val: 100000 }
  ]
};

function renderCifChips() {
  const container = document.getElementById('cif-preset-chips');
  if (!container) return;
  const presets = CIF_PRESETS[currentCurrency] || CIF_PRESETS.KES;
  const currentVal = parseFloat(document.getElementById('cif-amount').value) || 0;

  container.innerHTML = presets.map(p => `
    <button type="button" class="cif-chip ${currentVal === p.val ? 'active' : ''}" onclick="selectCifPreset(${p.val})">
      ${p.label}
    </button>
  `).join('');
}

function selectCifPreset(val) {
  const input = document.getElementById('cif-amount');
  if (input) {
    input.value = val;
    calculateDuty();
    updateActiveChip();
  }
}

function updateActiveChip() {
  const currentVal = parseFloat(document.getElementById('cif-amount').value) || 0;
  const presets = CIF_PRESETS[currentCurrency] || CIF_PRESETS.KES;
  const chips = document.querySelectorAll('.cif-chip');
  chips.forEach((chip, idx) => {
    if (presets[idx] && presets[idx].val === currentVal) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function setCurrency(curr) {
  if (currentCurrency === curr) return;

  const input = document.getElementById('cif-amount');
  const oldVal = parseFloat(input.value) || 0;
  if (oldVal > 0) {
    if (curr === 'USD') {
      input.value = Math.round(oldVal / USD_RATE);
    } else {
      input.value = Math.round(oldVal * USD_RATE);
    }
  }

  currentCurrency = curr;
  document.getElementById('curr-kes').classList.toggle('active', curr === 'KES');
  document.getElementById('curr-usd').classList.toggle('active', curr === 'USD');
  document.getElementById('currency-symbol').textContent = curr;
  renderCifChips();
  calculateDuty();
  updateActiveChip();
}

function calculateDuty() {
  const cifInput = parseFloat(document.getElementById('cif-amount').value) || 0;
  const categoryVal = document.getElementById('goods-category').value;
  const haulageVal = parseFloat(document.getElementById('transport-destination').value) || 0;

  let cifKES = currentCurrency === 'USD' ? cifInput * USD_RATE : cifInput;

  let dutyRate = 0.25;
  let exciseRate = 0;
  let exciseLabel = 'Excise Duty (0% / Exempt):';

  if (categoryVal === '0.25_excise') {
    dutyRate = 0.25;
    exciseRate = 0.20;
    exciseLabel = 'Excise Duty (20% on CIF + Duty):';
  } else if (categoryVal === '0.25_excise15') {
    dutyRate = 0.25;
    exciseRate = 0.15;
    exciseLabel = 'Excise Duty (15% on CIF + Duty):';
  } else {
    dutyRate = parseFloat(categoryVal);
    exciseRate = 0;
    exciseLabel = 'Excise Duty (0% / Exempt):';
  }

  // EAC Tariff Formula
  // 1. Import Duty (ID)
  const importDuty = cifKES * dutyRate;

  // 2. Excise Duty = (CIF + Import Duty) * Excise Rate
  const exciseDuty = (cifKES + importDuty) * exciseRate;

  // 3. Statutory Levies (Rates kept at 2.5% IDF & 2.0% RDL)
  const idfAmount = cifKES * 0.025;
  const rdlAmount = cifKES * 0.020;
  const statutoryFees = idfAmount + rdlAmount;

  // 4. VAT Base = CIF + Import Duty + Excise Duty + Statutory Levies (IDF + RDL)
  const vatBase = cifKES + importDuty + exciseDuty + statutoryFees;
  const vatAmount = vatBase * 0.16;

  // 5. Total Landed Payable
  const totalPayable = importDuty + exciseDuty + statutoryFees + vatAmount + haulageVal;

  // Update Excise Duty row and dynamic label in Estimated Breakdown
  const exciseRow = document.getElementById('row-excise');
  const exciseLabelElem = document.getElementById('label-excise');
  if (exciseLabelElem) {
    exciseLabelElem.textContent = exciseLabel;
  }
  if (exciseRow) {
    if (exciseRate > 0) {
      exciseRow.classList.add('has-excise');
    } else {
      exciseRow.classList.remove('has-excise');
    }
  }

  const fmt = (num) => {
    let val = currentCurrency === 'USD' ? num / USD_RATE : num;
    return `${currentCurrency} ${val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  document.getElementById('res-cif').textContent = fmt(cifKES);
  document.getElementById('res-duty').textContent = fmt(importDuty);
  document.getElementById('res-excise').textContent = fmt(exciseDuty);
  document.getElementById('res-idf').textContent = fmt(idfAmount);
  document.getElementById('res-rdl').textContent = fmt(rdlAmount);
  document.getElementById('res-vat').textContent = fmt(vatAmount);
  document.getElementById('res-haulage').textContent = fmt(haulageVal);
  document.getElementById('res-total').textContent = fmt(totalPayable);

  // Phase 2: Visual Landed Cost Bar Calculation
  const grandTotal = cifKES + totalPayable;
  if (grandTotal > 0) {
    const cifPct = ((cifKES / grandTotal) * 100).toFixed(1);
    const dutyPct = (((importDuty + exciseDuty) / grandTotal) * 100).toFixed(1);
    const vatPct = ((vatAmount / grandTotal) * 100).toFixed(1);
    const otherPct = (((statutoryFees + haulageVal) / grandTotal) * 100).toFixed(1);

    document.getElementById('bar-cif').style.width = cifPct + '%';
    document.getElementById('bar-duty').style.width = dutyPct + '%';
    document.getElementById('bar-vat').style.width = vatPct + '%';
    document.getElementById('bar-other').style.width = otherPct + '%';
  }
}

function sendCalcToWhatsApp() {
  const cif = document.getElementById('cif-amount').value || 0;
  const total = document.getElementById('res-total').textContent;
  const duty = document.getElementById('res-duty').textContent;
  const excise = document.getElementById('res-excise').textContent;
  const idf = document.getElementById('res-idf').textContent;
  const rdl = document.getElementById('res-rdl').textContent;
  const vat = document.getElementById('res-vat').textContent;
  const categoryText = document.getElementById('goods-category').options[document.getElementById('goods-category').selectedIndex].text;
  const routeText = document.getElementById('transport-destination').options[document.getElementById('transport-destination').selectedIndex].text;

  let msg = `Hello Pascal Global Solutions Ltd, I generated a landed cost estimate on your website:\n\n` +
            `📦 Category: ${categoryText}\n` +
            `🛣️ Route: ${routeText}\n` +
            `💰 CIF Value: ${currentCurrency} ${cif}\n` +
            `🔹 Import Duty: ${duty}\n`;

  if (excise && !excise.includes(' 0')) {
    msg += `🔹 Excise Duty: ${excise}\n`;
  }

  msg += `🔹 IDF (2.5%): ${idf}\n` +
         `🔹 RDL (2.0%): ${rdl}\n` +
         `🔹 VAT (16%): ${vat}\n` +
         `📊 Estimated Landed Total: ${total}\n\n` +
         `Please assist me with formal cargo clearance and transportation booking.`;

  showToast('Opening WhatsApp Desk...');
  window.open(`https://wa.me/254799210988?text=${encodeURIComponent(msg)}`, '_blank');
}

function copyDutyBreakdown() {
  const cif = document.getElementById('res-cif').textContent;
  const duty = document.getElementById('res-duty').textContent;
  const excise = document.getElementById('res-excise').textContent;
  const idf = document.getElementById('res-idf').textContent;
  const rdl = document.getElementById('res-rdl').textContent;
  const vat = document.getElementById('res-vat').textContent;
  const haulage = document.getElementById('res-haulage').textContent;
  const total = document.getElementById('res-total').textContent;
  const categoryText = document.getElementById('goods-category').options[document.getElementById('goods-category').selectedIndex].text;
  const routeText = document.getElementById('transport-destination').options[document.getElementById('transport-destination').selectedIndex].text;

  const text = `==============================\n` +
               `PASCAL GLOBAL SOLUTIONS LTD\n` +
               `KRA Duty & Landed Cost Estimate\n` +
               `==============================\n` +
               `Classification: ${categoryText}\n` +
               `Inland Route: ${routeText}\n` +
               `------------------------------\n` +
               `CIF Base Value: ${cif}\n` +
               `Import Duty (ID): ${duty}\n` +
               `Excise Duty: ${excise}\n` +
               `IDF Fee (2.5%): ${idf}\n` +
               `RDL Levy (2.0%): ${rdl}\n` +
               `VAT (16%): ${vat}\n` +
               `Estimated Haulage: ${haulage}\n` +
               `------------------------------\n` +
               `ESTIMATED TOTAL PAYABLE: ${total}\n` +
               `==============================\n` +
               `Direct Hotline: 0799 210 988\n` +
               `Official Email: info@pgsolutions.co.ke | sales@pgsolutions.co.ke\n` +
               `Website: https://pgsolutions.co.ke/`;

  copyToClipboard(text, 'Full duty breakdown copied to clipboard!');
}

function printDutyEstimate() {
  window.print();
}

/* ------------------------------------------
   7. Compliance Checklist Wizard Logic
   ------------------------------------------ */
function switchChecklist(type) {
  document.querySelectorAll('.check-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.checklist-content').forEach(c => c.style.display = 'none');

  if (type === 'customs') {
    document.querySelectorAll('.check-tab')[0].classList.add('active');
    document.getElementById('checklist-customs').style.display = 'block';
  } else {
    document.querySelectorAll('.check-tab')[1].classList.add('active');
    document.getElementById('checklist-tax').style.display = 'block';
  }
  updateReadinessScore();
}

function updateReadinessScore() {
  const activeContainer = document.querySelector('.checklist-content[style*="block"]') || document.getElementById('checklist-customs');
  const checkboxes = activeContainer.querySelectorAll('input[type="checkbox"]');
  const total = checkboxes.length;
  let checkedCount = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) checkedCount++;
  });

  const percentage = Math.round((checkedCount / total) * 100);
  
  const scoreEl = document.getElementById('readiness-score');
  const fillEl = document.getElementById('meter-fill');
  const textEl = document.getElementById('readiness-text');

  if (scoreEl) scoreEl.textContent = `${percentage}%`;
  if (fillEl) fillEl.style.width = `${percentage}%`;

  if (textEl) {
    if (percentage === 0) {
      textEl.textContent = "Select your available documents above to evaluate clearance readiness.";
      textEl.style.color = "var(--text-muted)";
    } else if (percentage < 50) {
      textEl.textContent = "⚠️ High risk of clearance delays or KRA audit queries. Key documents missing.";
      textEl.style.color = "#EF4444";
    } else if (percentage < 100) {
      textEl.textContent = "👍 Good progress! A few critical documents remain before submission.";
      textEl.style.color = "#F59E0B";
    } else {
      textEl.textContent = "🎉 100% Ready! Your documentation is complete for smooth submission.";
      textEl.style.color = "#10B981";
    }
  }
}

function sendChecklistToWhatsApp() {
  const activeContainer = document.querySelector('.checklist-content[style*="block"]') || document.getElementById('checklist-customs');
  const checkboxes = activeContainer.querySelectorAll('.check-item');
  
  let available = [];
  let missing = [];

  checkboxes.forEach(item => {
    const cb = item.querySelector('input');
    const label = item.querySelector('span').textContent;
    if (cb.checked) {
      available.push(label);
    } else {
      missing.push(label);
    }
  });

  const msg = `Hello Pascal Global Solutions Ltd, I ran the Compliance Readiness Checker on your website:\n\n` +
              `✅ Ready Documents (${available.length}):\n${available.map(i => ' - ' + i).join('\n') || 'None'}\n\n` +
              `❌ Missing Documents (${missing.length}):\n${missing.map(i => ' - ' + i).join('\n') || 'None'}\n\n` +
              `Please advise how your team can assist us with preparation and clearance.`;

  showToast('Opening WhatsApp Desk...');
  window.open(`https://wa.me/254799210988?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ------------------------------------------
   8. FAQ Accordion
   ------------------------------------------ */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(other => other.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ------------------------------------------
   9. Quote Modal Handlers (Context-Aware Polish)
   ------------------------------------------ */
const DIVISION_CONFIG = {
  'Inter-Modal Freight Forwarding': {
    badge: 'TRANSPORTATION SOLUTIONS',
    color: '#2563EB',
    icon: 'fa-truck-moving',
    hint: 'Specify container size (20ft/40ft), sea/air route, cargo weight, or origin port...'
  },
  'EAC Transit Cargo Logistics': {
    badge: 'EAC TRANSIT FREIGHT',
    color: '#1E40AF',
    icon: 'fa-route',
    hint: 'Specify destination (Uganda/Rwanda/South Sudan/DRC), heavy lift dimensions, or transit bond...'
  },
  'Import & Export Customs Clearance': {
    badge: 'CUSTOMS & PORT CLEARANCE',
    color: '#D4AF37',
    icon: 'fa-user-shield',
    hint: 'Specify port of entry (Kilindini Mombasa / ICD Embakasi / JKIA), Bill of Lading count, and ETA...'
  },
  'HS Code & Bonded Warehousing': {
    badge: 'BONDED WAREHOUSING & TARIFFS',
    color: '#B45309',
    icon: 'fa-barcode',
    hint: 'Specify target commodity HS code ruling, bonded warehouse location, or customs bond type...'
  },
  'KRA Tax Dispute & Audit Advisory': {
    badge: 'KRA TAX ADVISORY & AUDIT',
    color: '#10B981',
    icon: 'fa-gavel',
    hint: 'Specify KRA assessment letter date, tax head (VAT/Income Tax/PAYE), and objection deadline...'
  },
  'VAT, eTIMS & Statutory Compliance': {
    badge: 'TAX & eTIMS COMPLIANCE',
    color: '#065F46',
    icon: 'fa-file-invoice-dollar',
    hint: 'Specify monthly VAT turnover, eTIMS system integration requirements, or TCC renewal status...'
  },
  'Corporate Bookkeeping & Financials': {
    badge: 'CORPORATE ACCOUNTING',
    color: '#8B5CF6',
    icon: 'fa-calculator',
    hint: 'Specify company turnover bracket, monthly transaction volume, or management accounting needs...'
  },
  'Payroll Administration & Statutory': {
    badge: 'PAYROLL & STATUTORY',
    color: '#7C3AED',
    icon: 'fa-users-gear',
    hint: 'Specify employee headcount, P9 certificate preparation, or statutory deductions filing...'
  },
  'Corporate & Marine Cargo Insurance': {
    badge: 'MARINE & ASSET INSURANCE',
    color: '#0284C7',
    icon: 'fa-shield-halved',
    hint: 'Specify commercial invoice value, transit route (sea/air/road), and coverage type (All Risks)...'
  },
  'Complete Integrated Package': {
    badge: 'INTEGRATED TRADE PACKAGE',
    color: '#C59B27',
    icon: 'fa-cubes',
    hint: 'Specify end-to-end scope: freight haulage, Mombasa customs clearance, and corporate tax compliance...'
  }
};

function updateModalDivisionHints() {
  const select = document.getElementById('modal-topic');
  if (!select) return;
  const val = select.value;
  const chip = document.getElementById('modal-division-chip');
  const hintElem = document.getElementById('modal-notes-hint');
  const textarea = document.getElementById('modal-notes');

  const config = DIVISION_CONFIG[val] || {
    badge: 'CORPORATE PROPOSAL',
    color: 'var(--accent-gold)',
    icon: 'fa-layer-group',
    hint: 'Specify origin/destination, cargo weight, or tax dispute details...'
  };

  if (chip) {
    chip.innerHTML = `<i class="fa-solid ${config.icon}"></i> <span>${config.badge}</span>`;
    chip.style.borderColor = config.color;
    chip.style.color = config.color;
  }

  if (hintElem) {
    hintElem.textContent = config.hint;
  }
  if (textarea && !textarea.value) {
    textarea.placeholder = config.hint;
  }
}

function openQuoteModal(divisionName = 'Complete Integrated Package') {
  const modal = document.getElementById('quote-modal');
  const select = document.getElementById('modal-topic');
  if (select) {
    let matched = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase().includes(divisionName.toLowerCase()) ||
          divisionName.toLowerCase().includes(select.options[i].value.toLowerCase())) {
        select.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const dLower = divisionName.toLowerCase();
      if (dLower.includes('transport') || dLower.includes('freight')) {
        select.value = 'Inter-Modal Freight Forwarding';
      } else if (dLower.includes('transit')) {
        select.value = 'EAC Transit Cargo Logistics';
      } else if (dLower.includes('customs') || dLower.includes('clearance')) {
        select.value = 'Import & Export Customs Clearance';
      } else if (dLower.includes('bonded') || dLower.includes('hs code')) {
        select.value = 'HS Code & Bonded Warehousing';
      } else if (dLower.includes('dispute') || dLower.includes('audit')) {
        select.value = 'KRA Tax Dispute & Audit Advisory';
      } else if (dLower.includes('etims') || dLower.includes('vat')) {
        select.value = 'VAT, eTIMS & Statutory Compliance';
      } else if (dLower.includes('accounting') || dLower.includes('bookkeeping')) {
        select.value = 'Corporate Bookkeeping & Financials';
      } else if (dLower.includes('payroll')) {
        select.value = 'Payroll Administration & Statutory';
      } else if (dLower.includes('insurance')) {
        select.value = 'Corporate & Marine Cargo Insurance';
      } else {
        select.value = 'Complete Integrated Package';
      }
    }
    updateModalDivisionHints();
  }
  if (modal) modal.classList.add('active');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
}

function handleModalSubmit() {
  const name = document.getElementById('modal-name').value;
  const phone = document.getElementById('modal-phone').value;
  const select = document.getElementById('modal-topic');
  const topic = select.options[select.selectedIndex].text;
  const notes = document.getElementById('modal-notes').value;

  const msg = `Hello Pascal Global Solutions Ltd, corporate proposal request:\n\n` +
              `🏢 Client: ${name}\n` +
              `📞 Phone: ${phone}\n` +
              `💼 Division/Service: ${topic}\n` +
              `📝 Overview: ${notes || 'N/A'}`;

  showToast('Opening WhatsApp Desk...');
  window.open(`https://wa.me/254799210988?text=${encodeURIComponent(msg)}`, '_blank');
  closeQuoteModal();
}

function handleModalEmail() {
  const name = document.getElementById('modal-name').value.trim();
  const phone = document.getElementById('modal-phone').value.trim();
  const select = document.getElementById('modal-topic');
  const topic = select.options[select.selectedIndex].text;
  const notes = document.getElementById('modal-notes').value.trim();

  if (!name || !phone) {
    showToast('Please provide your name/company and phone number.');
    return;
  }

  const subject = `Proposal Request: ${select.value} - ${name}`;
  const body = `Dear Pascal Global Solutions Ltd Team,\n\n` +
               `I am requesting a formal commercial proposal for:\n` +
               `Service Division: ${topic}\n\n` +
               `Client / Enterprise: ${name}\n` +
               `Phone: ${phone}\n\n` +
               `Project / Cargo Scope:\n${notes || 'N/A'}\n\n` +
               `Please send your quotation and documentation checklist to this email.\n\n` +
               `Regards,\n${name}`;

  const mailtoUrl = `mailto:sales@pgsolutions.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('Opening email to sales@pgsolutions.co.ke...');
  window.location.href = mailtoUrl;
  closeQuoteModal();
}

/* ------------------------------------------
   10. Contact Form Submit Handlers
   ------------------------------------------ */
function handleContactFormSubmit() {
  const name = document.getElementById('form-name').value;
  const phone = document.getElementById('form-phone').value;
  const service = document.getElementById('form-service').value;
  const message = document.getElementById('form-message').value;

  const msg = `Hello Pascal Global Solutions Ltd, corporate website inquiry:\n\n` +
              `🏢 Company/Client: ${name}\n` +
              `📞 Contact: ${phone}\n` +
              `📌 Division Needed: ${service}\n` +
              `💬 Inquiry Details: ${message}`;

  showToast('Submitting inquiry to WhatsApp...');
  window.open(`https://wa.me/254799210988?text=${encodeURIComponent(msg)}`, '_blank');
}

function handleContactFormEmail() {
  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();
  const service = document.getElementById('form-service').value;
  const message = document.getElementById('form-message').value.trim();

  if (!name || !phone) {
    showToast('Please provide your name/company and phone number.');
    return;
  }

  const subject = `Corporate Inquiry: ${service} - ${name}`;
  const body = `Dear Pascal Global Solutions Ltd Commercial Team,\n\n` +
               `I would like to request assistance regarding your ${service} services.\n\n` +
               `Company / Client Name: ${name}\n` +
               `Phone Number: ${phone}\n` +
               `Service Division: ${service}\n\n` +
               `Project / Cargo / Tax Inquiry Details:\n${message || 'N/A'}\n\n` +
               `Kindly revert with rate estimates and procedural requirements.\n\n` +
               `Best regards,\n${name}`;

  const mailtoUrl = `mailto:sales@pgsolutions.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('Opening email to sales@pgsolutions.co.ke...');
  window.location.href = mailtoUrl;
}

