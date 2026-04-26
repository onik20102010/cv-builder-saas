/**
 * CV Builder PK - Dashboard Controller
 * Manages authentication, credit system, and CV builder functionality
 */

const password = localStorage.getItem('cv_password');
if (!password) window.location.href = 'index.html';

// ========== LOCAL STORAGE HELPERS ==========
function getUserData() {
  const data = localStorage.getItem(`cv_${password}_user`);
  return data ? JSON.parse(data) : { free_cv_used: false };
}

function setUserData(data) {
  localStorage.setItem(`cv_${password}_user`, JSON.stringify(data));
}

function getCredits() {
  const data = localStorage.getItem(`cv_${password}_credits`);
  return data ? JSON.parse(data) : [];
}

function setCredits(arr) {
  localStorage.setItem(`cv_${password}_credits`, JSON.stringify(arr));
}

let creditInfo = { freeAvailable: false, paidCvs: 0 };

// ========== CREDIT DISPLAY ==========
function updateCreditDisplay() {
  const user = getUserData();
  const credits = getCredits();
  creditInfo.freeAvailable = !user.free_cv_used;
  creditInfo.paidCvs = credits.length;
  const total = (creditInfo.freeAvailable ? 1 : 0) + creditInfo.paidCvs;

  const creditDisplay = document.getElementById('creditDisplay');
  if (creditDisplay) {
    creditDisplay.textContent = `${total} CV${total !== 1 ? 's' : ''} Available`;
  }

  const msg = document.getElementById('creditMessage');
  const payOptions = document.getElementById('paymentOptions');

  if (!msg || !payOptions) return;

  if (creditInfo.freeAvailable) {
    msg.textContent = 'You have 1 FREE CV available!';
    payOptions.style.display = 'none';
  } else if (creditInfo.paidCvs > 0) {
    msg.textContent = `You have ${creditInfo.paidCvs} paid CV${creditInfo.paidCvs !== 1 ? 's' : ''} available.`;
    payOptions.style.display = 'none';
  } else {
    msg.textContent = 'Purchase additional CVs for 30 PKR each.';
    payOptions.style.display = 'flex';
  }
}

// ========== SIMULATE PAYMENT ==========
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('payment-btn')) {
    const method = e.target.dataset.method;
    const credits = getCredits();
    credits.push({
      id: Date.now(),
      amount: 30,
      method: method,
      transaction: 'SIM_' + Math.random().toString(36).slice(2, 10)
    });
    setCredits(credits);

    const statusEl = document.getElementById('paymentStatus');
    if (statusEl) statusEl.textContent = 'Payment successful! 1 paid CV added.';
    updateCreditDisplay();
  }
});

// ========== USE CV CREDIT ==========
function useCV() {
  if (creditInfo.freeAvailable) {
    const user = getUserData();
    user.free_cv_used = true;
    setUserData(user);
    updateCreditDisplay();
    return true;
  } else if (creditInfo.paidCvs > 0) {
    const credits = getCredits();
    credits.shift(); // remove oldest
    setCredits(credits);
    updateCreditDisplay();
    return true;
  } else {
    alert('No CV credits! Purchase one first.');
    return false;
  }
}

// ========== LOGOUT ==========
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('cv_password');
    window.location.href = 'index.html';
  });
}

// ========== CV BUILDER LOGIC ==========
let currentTemplate = 'classic';
let cvPreview = null;
let profileImageSrc = '';

function initCVBuilder() {
  // Grab all DOM elements
  const profilePicInput = document.getElementById('profileImageInput');
  const profilePreviewSmall = document.getElementById('profilePreviewSmall');
  cvPreview = document.getElementById('cvPreview');
  const industrySelect = document.getElementById('industrySelect');
  const fullName = document.getElementById('fullName');
  const title = document.getElementById('title');
  const profileText = document.getElementById('profileText');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const address = document.getElementById('address');
  const skillsInput = document.getElementById('skillsInput');
  const languagesInput = document.getElementById('languagesInput');
  const hobbiesInput = document.getElementById('hobbiesInput');
  const jobTitle1 = document.getElementById('jobTitle1');
  const jobCompany1 = document.getElementById('jobCompany1');
  const jobPeriod1 = document.getElementById('jobPeriod1');
  const jobDesc1 = document.getElementById('jobDesc1');
  const jobTitle2 = document.getElementById('jobTitle2');
  const jobCompany2 = document.getElementById('jobCompany2');
  const jobPeriod2 = document.getElementById('jobPeriod2');
  const jobDesc2 = document.getElementById('jobDesc2');
  const eduDegree1 = document.getElementById('eduDegree1');
  const eduSchool1 = document.getElementById('eduSchool1');
  const eduYear1 = document.getElementById('eduYear1');
  const eduDegree2 = document.getElementById('eduDegree2');
  const eduSchool2 = document.getElementById('eduSchool2');
  const eduYear2 = document.getElementById('eduYear2');
  const accentColor = document.getElementById('accentColor');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const borderRadiusSelect = document.getElementById('borderRadiusSelect');
  const applyCustomBtn = document.getElementById('applyCustomBtn');

  // Check critical elements exist
  if (!cvPreview || !fullName || !title) {
    console.error('Required CV elements not found');
    return;
  }

  profileImageSrc = profilePreviewSmall ? profilePreviewSmall.src : '';

  // Photo upload handler
  if (profilePicInput && profilePreviewSmall) {
    profilePicInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          profileImageSrc = ev.target.result;
          profilePreviewSmall.src = profileImageSrc;
          renderCV();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ========== INDUSTRY PRESETS ==========
  const industryPresets = {
    default: { accent: '#60a5fa', summary: 'Experienced professional with a proven track record of delivering excellence.', titleSuffix: '' },
    unilever: { accent: '#1f4a8a', summary: 'Consumer-focused FMCG specialist with expertise in brand management and supply chain excellence.', titleSuffix: ' | FMCG' },
    nestle: { accent: '#0d7377', summary: 'Dedicated to nutrition, health, and wellness with a proven track record in food safety and production.', titleSuffix: ' | Nutrition' },
    pepsi: { accent: '#1e3a5f', summary: 'Dynamic leader in the beverage industry with expertise in sales, distribution, and market expansion.', titleSuffix: ' | Beverages' },
    'p&g': { accent: '#0f7938', summary: 'Innovation-driven manager with proven success in brand building and consumer insights.', titleSuffix: ' | P&G' },
    reckitt: { accent: '#8b2e2e', summary: 'Hygiene and health expert with a strong background in product development and quality assurance.', titleSuffix: ' | Health' },
    meezan: { accent: '#0e5d3f', summary: 'Islamic banking professional with expertise in Shariah-compliant products and relationship excellence.', titleSuffix: ' | Islamic Banking' },
    hbl: { accent: '#003b5c', summary: 'Banking executive with proven skills in risk management, corporate finance, and customer service.', titleSuffix: ' | HBL' },
    ubl: { accent: '#c41e3a', summary: 'Experienced in retail banking, customer acquisition, and digital transformation initiatives.', titleSuffix: ' | UBL' },
    standard: { accent: '#0033a0', summary: 'Global banking perspective with strong compliance and wealth management expertise.', titleSuffix: ' | Standard Chartered' },
    mcb: { accent: '#003057', summary: 'Relationship manager with focus on SME and corporate banking solutions.', titleSuffix: ' | MCB' },
    systems: { accent: '#2d5a8c', summary: 'Full-stack developer with expertise in enterprise solutions, cloud migration, and scalability.', titleSuffix: ' | Systems' },
    netsol: { accent: '#0052a3', summary: 'Fintech specialist with strong experience in asset finance and leasing software solutions.', titleSuffix: ' | Netsol' },
    arbisoft: { accent: '#1a3a52', summary: 'Python/Django expert delivering scalable web applications and innovative solutions.', titleSuffix: ' | Arbisoft' },
    devsinc: { accent: '#d76d0d', summary: 'Agile software engineer with expertise in React, Node.js, and modern web ecosystems.', titleSuffix: ' | Devsinc' },
    '10pearls': { accent: '#693a82', summary: 'Innovative developer skilled in mobile applications, web development, and product excellence.', titleSuffix: ' | 10Pearls' },
    ogdcl: { accent: '#1b4d3e', summary: 'Petroleum engineer with expertise in exploration, production, and operational optimization.', titleSuffix: ' | OGDCL' },
    psopak: { accent: '#2c5aa0', summary: 'Supply chain and logistics specialist with proven expertise in oil marketing and distribution.', titleSuffix: ' | PSO' },
    engro: { accent: '#8b5a3c', summary: 'Fertilizer and energy sector professional with strong project management background.', titleSuffix: ' | Engro' },
    kelectric: { accent: '#d6001c', summary: 'Power sector engineer focused on distribution management and renewable energy integration.', titleSuffix: ' | K-Electric' },
    luckycement: { accent: '#b81c1c', summary: 'Cement industry professional with expertise in operations, quality, and supply chain.', titleSuffix: ' | Lucky' },
    interloop: { accent: '#1b5e20', summary: 'Textile manufacturing specialist with proven expertise in lean production and quality.', titleSuffix: ' | Interloop' },
    nishat: { accent: '#004d40', summary: 'Textile and power sector professional with strong operational and management background.', titleSuffix: ' | Nishat' },
    atlashonda: { accent: '#c41e3a', summary: 'Automotive engineer with expertise in production management and supply chain excellence.', titleSuffix: ' | Atlas' },
    jazz: { accent: '#e31c23', summary: 'Telecom expert with focus on digital services, network optimization, and customer experience.', titleSuffix: ' | Jazz' },
    telenor: { accent: '#0066cc', summary: 'Telecom professional with expertise in customer experience, IoT solutions, and innovation.', titleSuffix: ' | Telenor' },
    ptcl: { accent: '#003f7f', summary: 'ICT specialist with experience in fiber networks, enterprise solutions, and infrastructure.', titleSuffix: ' | PTCL' },
    dhl: { accent: '#ffb81c', summary: 'Logistics and supply chain manager with global freight expertise and operational excellence.', titleSuffix: ' | DHL' },
    shifa: { accent: '#0d7377', summary: 'Healthcare administrator with strong focus on patient care, operations, and hospital management.', titleSuffix: ' | Shifa' },
    agakhan: { accent: '#2d5a8c', summary: 'Medical professional committed to quality healthcare and community health improvement.', titleSuffix: ' | AKUH' },
    gsk: { accent: '#f36633', summary: 'Pharmaceutical sales and marketing expert with strong scientific background and market knowledge.', titleSuffix: ' | GSK' },
    searle: { accent: '#1b5e20', summary: 'Pharma production specialist with expertise in GMP compliance and quality assurance.', titleSuffix: ' | Searle' }
  };

  function applyIndustryPreset(key) {
    const preset = industryPresets[key] || industryPresets.default;
    if (!preset) return;

    cvPreview.style.setProperty('--accent', preset.accent);
    if (accentColor) accentColor.value = preset.accent;

    if (profileText && (profileText.value.includes('Software engineer') || profileText.value.length < 30)) {
      profileText.value = preset.summary;
    }

    if (title) {
      const base = title.value.replace(/\s\|.*$/, '');
      title.value = base + (preset.titleSuffix || '');
    }

    renderCV();
  }

  if (industrySelect) {
    industrySelect.addEventListener('change', (e) => applyIndustryPreset(e.target.value));
  }

  // ========== TEMPLATE SWITCHING ==========
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTemplate = btn.dataset.template;
      renderCV();
    });
  });

  // ========== CUSTOMIZER ==========
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', () => {
      if (accentColor) cvPreview.style.setProperty('--accent', accentColor.value);
      if (fontFamilySelect) cvPreview.style.setProperty('--font-family', fontFamilySelect.value);
      if (borderRadiusSelect) cvPreview.style.setProperty('--border-radius', borderRadiusSelect.value);
      renderCV();
    });
  }

  function parseList(str) {
    return str.split(',').map(s => s.trim()).filter(s => s);
  }

  // ========== RENDER FUNCTIONS ==========
  function renderClassic() {
    const skills = parseList(skillsInput ? skillsInput.value : '');
    const languages = parseList(languagesInput ? languagesInput.value : '');
    const hobbies = parseList(hobbiesInput ? hobbiesInput.value : '');

    const desc1 = jobDesc1 ? jobDesc1.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';
    const desc2 = jobDesc2 ? jobDesc2.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';

    return `
      <div class="cv-header">
        <div class="cv-name-title">
          <h1>${fullName ? fullName.value : ''}</h1>
          <div class="title">${title ? title.value : ''}</div>
        </div>
        <img class="cv-profile-pic" src="${profileImageSrc || ''}" alt="Profile Photo">
      </div>
      <div class="profile-summary">${profileText ? profileText.value : ''}</div>
      <div class="contact-row">
        <span class="contact-item"><i class="fas fa-phone-alt"></i> ${phone ? phone.value : ''}</span>
        <span class="contact-item"><i class="fas fa-envelope"></i> ${email ? email.value : ''}</span>
        <span class="contact-item"><i class="fas fa-map-marker-alt"></i> ${address ? address.value : ''}</span>
      </div>
      <div class="cv-columns">
        <div class="cv-left">
          <div class="section-title">SKILLS</div>
          <ul class="skill-list">${skills.map(s => `<li><i class="fas fa-circle" style="font-size:0.5rem; margin-right:10px;"></i>${s}</li>`).join('')}</ul>
          <div class="section-title">LANGUAGES</div>
          <ul class="language-list">${languages.map(l => `<li><i class="fas fa-globe"></i> ${l}</li>`).join('')}</ul>
          <div class="section-title">HOBBIES</div>
          <ul class="hobby-list">${hobbies.map(h => `<li><i class="fas fa-heart" style="color:#f87171;"></i> ${h}</li>`).join('')}</ul>
        </div>
        <div class="cv-right">
          <div class="section-title">WORK EXPERIENCE</div>
          <div class="job">
            <div class="job-header"><span>${jobTitle1 ? jobTitle1.value : ''}</span><span>${jobPeriod1 ? jobPeriod1.value : ''}</span></div>
            <div class="job-company">${jobCompany1 ? jobCompany1.value : ''}</div>
            <ul class="job-desc">${desc1}</ul>
          </div>
          <div class="job">
            <div class="job-header"><span>${jobTitle2 ? jobTitle2.value : ''}</span><span>${jobPeriod2 ? jobPeriod2.value : ''}</span></div>
            <div class="job-company">${jobCompany2 ? jobCompany2.value : ''}</div>
            <ul class="job-desc">${desc2}</ul>
          </div>
          <div class="section-title">EDUCATION</div>
          <div class="edu-item">
            <div class="edu-header"><span>${eduDegree1 ? eduDegree1.value : ''}</span><span>${eduYear1 ? eduYear1.value : ''}</span></div>
            <div class="edu-detail">${eduSchool1 ? eduSchool1.value : ''}</div>
          </div>
          <div class="edu-item">
            <div class="edu-header"><span>${eduDegree2 ? eduDegree2.value : ''}</span><span>${eduYear2 ? eduYear2.value : ''}</span></div>
            <div class="edu-detail">${eduSchool2 ? eduSchool2.value : ''}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderModern() {
    const skills = parseList(skillsInput ? skillsInput.value : '');

    const desc1 = jobDesc1 ? jobDesc1.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';
    const desc2 = jobDesc2 ? jobDesc2.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';

    return `
      <div style="display:flex; flex-direction:column;">
        <div style="background:var(--accent); padding:30px 30px 20px; border-radius:24px 24px 0 0; color:white; display:flex; gap:30px;">
          <img src="${profileImageSrc || ''}" alt="Profile Photo" style="width:110px; height:110px; border-radius:20px; border:3px solid white;">
          <div>
            <h1 style="color:white;">${fullName ? fullName.value : ''}</h1>
            <p style="color:white;">${title ? title.value : ''}</p>
          </div>
        </div>
        <div style="display:flex; padding:24px;">
          <div style="flex:2;">${profileText ? profileText.value : ''}</div>
          <div style="flex:1; text-align:right;">${phone ? phone.value : ''}<br>${email ? email.value : ''}<br>${address ? address.value : ''}</div>
        </div>
        <div style="display:flex; gap:30px; padding:0 24px 24px;">
          <div style="flex:1">
            <h3>Experience</h3>
            ${jobTitle1 ? jobTitle1.value : ''} @ ${jobCompany1 ? jobCompany1.value : ''}<br>${desc1}<br>
            ${jobTitle2 ? jobTitle2.value : ''} @ ${jobCompany2 ? jobCompany2.value : ''}<br>${desc2}
          </div>
          <div style="flex:1">
            <h3>Skills</h3>${skills.join(' · ')}<br>
            <h3>Education</h3>
            ${eduDegree1 ? eduDegree1.value : ''}, ${eduSchool1 ? eduSchool1.value : ''}<br>
            ${eduDegree2 ? eduDegree2.value : ''}, ${eduSchool2 ? eduSchool2.value : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderBold() {
    const skills = parseList(skillsInput ? skillsInput.value : '');
    const languages = parseList(languagesInput ? languagesInput.value : '');

    const desc1 = jobDesc1 ? jobDesc1.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';
    const desc2 = jobDesc2 ? jobDesc2.value.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('') : '';

    return `
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:20px;">
        <div style="background:var(--accent); color:white; padding:24px; border-radius:24px;">
          <img src="${profileImageSrc || ''}" alt="Profile Photo" style="width:100%; border-radius:20px; margin-bottom:20px;">
          <h2 style="color:white;">${fullName ? fullName.value : ''}</h2>
          <p style="color:white;">${phone ? phone.value : ''}<br>${email ? email.value : ''}</p>
          <h3 style="color:white;">Skills</h3>
          <ul style="color:white;">${skills.map(s => `<li style="color:white;">${s}</li>`).join('')}</ul>
          <h3 style="color:white;">Languages</h3>
          <p style="color:white;">${languages.join(', ')}</p>
        </div>
        <div>
          <h1 style="color:var(--accent);">${title ? title.value : ''}</h1>
          <p>${profileText ? profileText.value : ''}</p>
          <h3>Experience</h3>
          <p><strong>${jobTitle1 ? jobTitle1.value : ''}</strong> @ ${jobCompany1 ? jobCompany1.value : ''} (${jobPeriod1 ? jobPeriod1.value : ''})<br>${desc1}</p>
          <p><strong>${jobTitle2 ? jobTitle2.value : ''}</strong> @ ${jobCompany2 ? jobCompany2.value : ''} (${jobPeriod2 ? jobPeriod2.value : ''})<br>${desc2}</p>
          <h3>Education</h3>
          <p>${eduDegree1 ? eduDegree1.value : ''}, ${eduSchool1 ? eduSchool1.value : ''} (${eduYear1 ? eduYear1.value : ''})<br>
             ${eduDegree2 ? eduDegree2.value : ''}, ${eduSchool2 ? eduSchool2.value : ''} (${eduYear2 ? eduYear2.value : ''})</p>
        </div>
      </div>
    `;
  }

  function renderCV() {
    if (!cvPreview) return;

    if (currentTemplate === 'classic') cvPreview.innerHTML = renderClassic();
    else if (currentTemplate === 'modern') cvPreview.innerHTML = renderModern();
    else cvPreview.innerHTML = renderBold();
  }

  // ========== LIVE UPDATE ==========
  const allInputs = document.querySelectorAll('input, textarea, select');
  allInputs.forEach(el => {
    el.addEventListener('input', renderCV);
    el.addEventListener('change', renderCV);
  });

  // ========== PDF EXPORT WITH CREDIT CHECK ==========
  const downloadPDFBtn = document.getElementById('downloadPDFBtn');
  if (downloadPDFBtn) {
    downloadPDFBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ok = useCV();
      if (ok) {
        window.print();
      }
    });
  }

  // Initial render
  cvPreview.style.setProperty('--accent', '#60a5fa');
  renderCV();
}

// Initialize application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCVBuilder();
    updateCreditDisplay();
  });
} else {
  initCVBuilder();
  updateCreditDisplay();
}
