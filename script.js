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
  calculateDuty(); // initial calculator run & bar render
  updateReadinessScore(); // initial checklist run
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
   6. Duty & Landed Cost Calculator Logic (Phase 2 Visual Bar)
   ------------------------------------------ */
let currentCurrency = 'KES';
const USD_RATE = 130; // KES per USD reference rate

function setCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('curr-kes').classList.toggle('active', curr === 'KES');
  document.getElementById('curr-usd').classList.toggle('active', curr === 'USD');
  document.getElementById('currency-symbol').textContent = curr;
  calculateDuty();
}

function calculateDuty() {
  const cifInput = parseFloat(document.getElementById('cif-amount').value) || 0;
  const categoryVal = document.getElementById('goods-category').value;
  const haulageVal = parseFloat(document.getElementById('transport-destination').value) || 0;

  let cifKES = currentCurrency === 'USD' ? cifInput * USD_RATE : cifInput;

  let dutyRate = 0.25;
  let isMotorVehicle = false;

  if (categoryVal === '0.25_excise') {
    dutyRate = 0.25;
    isMotorVehicle = true;
  } else {
    dutyRate = parseFloat(categoryVal);
  }

  // EAC Tariff Formula
  const importDuty = cifKES * dutyRate;
  const exciseDuty = isMotorVehicle ? (cifKES + importDuty) * 0.20 : 0;
  const idfRdl = cifKES * 0.045; // 2.5% IDF + 2.0% RDL
  const vatBase = cifKES + importDuty + exciseDuty + idfRdl;
  const vatAmount = vatBase * 0.16;

  const totalPayable = importDuty + exciseDuty + idfRdl + vatAmount + haulageVal;

  const exciseRow = document.getElementById('row-excise');
  if (exciseRow) exciseRow.style.display = isMotorVehicle ? 'flex' : 'none';

  const fmt = (num) => {
    let val = currentCurrency === 'USD' ? num / USD_RATE : num;
    return `${currentCurrency} ${val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  document.getElementById('res-cif').textContent = fmt(cifKES);
  document.getElementById('res-duty').textContent = fmt(importDuty);
  document.getElementById('res-excise').textContent = fmt(exciseDuty);
  document.getElementById('res-idf-rdl').textContent = fmt(idfRdl);
  document.getElementById('res-vat').textContent = fmt(vatAmount);
  document.getElementById('res-haulage').textContent = fmt(haulageVal);
  document.getElementById('res-total').textContent = fmt(totalPayable);

  // Phase 2: Visual Landed Cost Bar Calculation
  const grandTotal = cifKES + totalPayable;
  if (grandTotal > 0) {
    const cifPct = ((cifKES / grandTotal) * 100).toFixed(1);
    const dutyPct = (((importDuty + exciseDuty) / grandTotal) * 100).toFixed(1);
    const vatPct = ((vatAmount / grandTotal) * 100).toFixed(1);
    const otherPct = (((idfRdl + haulageVal) / grandTotal) * 100).toFixed(1);

    document.getElementById('bar-cif').style.width = cifPct + '%';
    document.getElementById('bar-duty').style.width = dutyPct + '%';
    document.getElementById('bar-vat').style.width = vatPct + '%';
    document.getElementById('bar-other').style.width = otherPct + '%';
  }
}

function sendCalcToWhatsApp() {
  const cif = document.getElementById('cif-amount').value || 0;
  const total = document.getElementById('res-total').textContent;
  const categoryText = document.getElementById('goods-category').options[document.getElementById('goods-category').selectedIndex].text;
  const routeText = document.getElementById('transport-destination').options[document.getElementById('transport-destination').selectedIndex].text;

  const msg = `Hello Pascal Global Solutions Ltd, I generated a landed cost estimate on your website:\n\n` +
              `📦 Category: ${categoryText}\n` +
              `🛣️ Route: ${routeText}\n` +
              `💰 CIF Value: ${currentCurrency} ${cif}\n` +
              `📊 Estimated Landed Total: ${total}\n\n` +
              `Please assist me with formal cargo clearance and transportation booking.`;

  showToast('Opening WhatsApp Desk...');
  window.open(`https://wa.me/254799210988?text=${encodeURIComponent(msg)}`, '_blank');
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
   9. Quote Modal Handlers
   ------------------------------------------ */
function openQuoteModal(divisionName = 'Transport, Customs & Tax Package') {
  const modal = document.getElementById('quote-modal');
  const topicInput = document.getElementById('modal-topic');
  if (topicInput) topicInput.value = divisionName;
  if (modal) modal.classList.add('active');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
}

function handleModalSubmit() {
  const name = document.getElementById('modal-name').value;
  const phone = document.getElementById('modal-phone').value;
  const topic = document.getElementById('modal-topic').value;
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
  const topic = document.getElementById('modal-topic').value;
  const notes = document.getElementById('modal-notes').value.trim();

  if (!name || !phone) {
    showToast('Please provide your name/company and phone number.');
    return;
  }

  const subject = `Proposal Request: ${topic} - ${name}`;
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

