// ==================== APP STATE ====================
let currentUserKey = null;
let userData = {
    personalInfo: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', summary: '', photo: '' },
    education: [],
    experience: [],
    skills: [],
    languages: [],
    certifications: [],
    settings: { template: 'classic', accentColor: '#6c5ce7', fontStyle: 'inter', borderRadius: '2px', industry: '' },
    credits: 1
};

// ==================== AUTH SYSTEM ====================
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'cv_user_' + Math.abs(hash).toString(36);
}

function saveToStorage() {
    if (!currentUserKey) return;
    localStorage.setItem(currentUserKey, JSON.stringify(userData));
}

function loadFromStorage(key) {
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            userData = {
                personalInfo: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '',
                    summary: '', photo: '', ...(parsed.personalInfo || {}) },
                education: parsed.education || [],
                experience: parsed.experience || [],
                skills: parsed.skills || [],
                languages: parsed.languages || [],
                certifications: parsed.certifications || [],
                settings: { template: 'classic', accentColor: '#6c5ce7', fontStyle: 'inter',
                    borderRadius: '2px', industry: '', ...(parsed.settings || {}) },
                credits: parsed.credits ?? 1
            };
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

document.getElementById('authSubmit').addEventListener('click', () => {
    const password = document.getElementById('authPassword').value.trim();
    if (password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }
    currentUserKey = simpleHash(password);
    const exists = loadFromStorage(currentUserKey);
    if (!exists) {
        // New user
        userData.credits = 1;
        saveToStorage();
        showToast('🎉 New account created! You have 1 free export credit.', 'success');
    } else {
        showToast('✅ Welcome back! Your data has been loaded.', 'success');
    }
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.add('active');
    document.getElementById('authPassword').value = '';
    initApp();
});

document.getElementById('authPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('authSubmit').click();
});

function logout() {
    if (confirm('Logout? Your data is saved locally and will be available when you return with the same password.')) {
        saveToStorage();
        currentUserKey = null;
        userData = {
            personalInfo: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '',
                summary: '', photo: '' },
            education: [],
            experience: [],
            skills: [],
            languages: [],
            certifications: [],
            settings: { template: 'classic', accentColor: '#6c5ce7', fontStyle: 'inter', borderRadius: '2px',
                industry: '' },
            credits: 1
        };
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('authOverlay').classList.remove('hidden');
        document.getElementById('authPassword').value = '';
    }
}

// ==================== INIT APP ====================
function initApp() {
    document.getElementById('fullName').value = userData.personalInfo.fullName || '';
    document.getElementById('jobTitle').value = userData.personalInfo.jobTitle || '';
    document.getElementById('email').value = userData.personalInfo.email || '';
    document.getElementById('phone').value = userData.personalInfo.phone || '';
    document.getElementById('location').value = userData.personalInfo.location || '';
    document.getElementById('website').value = userData.personalInfo.website || '';
    document.getElementById('summary').value = userData.personalInfo.summary || '';
    if (userData.personalInfo.photo) {
        document.getElementById('photoPreview').src = userData.personalInfo.photo;
    }
    document.getElementById('creditCount').textContent = userData.credits;
    setTemplate(userData.settings.template || 'classic', true);
    document.getElementById('accentColorPicker').value = userData.settings.accentColor || '#6c5ce7';
    document.getElementById('fontStylePicker').value = userData.settings.fontStyle || 'inter';
    document.getElementById('borderRadiusPicker').value = userData.settings.borderRadius || '2px';
    document.getElementById('industryPreset').value = userData.settings.industry || '';
    applyCustomizations(true);
    rebuildAllDynamicEntries();
    updatePreview();
    setupSectionNav();
}

function setupSectionNav() {
    const buttons = document.querySelectorAll('#sectionNav button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sectionId = btn.dataset.section;
            document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-' + sectionId).classList.add('active');
        });
    });
}

// ==================== DYNAMIC ENTRIES ====================
function rebuildAllDynamicEntries() {
    rebuildEntries('educationEntries', userData.education, createEducationHTML, 'education');
    rebuildEntries('experienceEntries', userData.experience, createExperienceHTML, 'experience');
    rebuildEntries('skillsEntries', userData.skills, createSkillHTML, 'skills');
    rebuildEntries('languagesEntries', userData.languages, createLanguageHTML, 'languages');
    rebuildEntries('certificationsEntries', userData.certifications, createCertificationHTML, 'certifications');
}

function rebuildEntries(containerId, dataArray, htmlFn, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    dataArray.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'dynamic-entry';
        div.innerHTML = htmlFn(entry, index);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-entry';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove';
        removeBtn.onclick = () => {
            dataArray.splice(index, 1);
            rebuildAllDynamicEntries();
            updatePreview();
            saveToStorage();
        };
        div.appendChild(removeBtn);
        div.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                updateEntryFromDOM(type, index, div);
                updatePreview();
                saveToStorage();
            });
        });
        container.appendChild(div);
    });
}

function updateEntryFromDOM(type, index, div) {
    const inputs = div.querySelectorAll('input, textarea, select');
    const data = {};
    inputs.forEach(inp => {
        if (inp.dataset.field) data[inp.dataset.field] = inp.value;
    });
    const arrayMap = {
        'education': userData.education,
        'experience': userData.experience,
        'skills': userData.skills,
        'languages': userData.languages,
        'certifications': userData.certifications
    };
    if (arrayMap[type] && arrayMap[type][index]) {
        Object.assign(arrayMap[type][index], data);
    }
}

function createEducationHTML(entry, index) {
    return `
    <div class="form-row">
      <div class="form-group"><label>Degree</label><input type="text" data-field="degree" value="${escapeHTML(entry.degree || '')}" placeholder="BSc Computer Science"></div>
      <div class="form-group"><label>Institution</label><input type="text" data-field="institution" value="${escapeHTML(entry.institution || '')}" placeholder="LUMS"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2020 - 2024"></div>
      <div class="form-group"><label>Grade / CGPA</label><input type="text" data-field="grade" value="${escapeHTML(entry.grade || '')}" placeholder="3.8 / 4.0"></div>
    </div>`;
}

function createExperienceHTML(entry, index) {
    return `
    <div class="form-row">
      <div class="form-group"><label>Job Title</label><input type="text" data-field="jobTitle" value="${escapeHTML(entry.jobTitle || '')}" placeholder="Senior Developer"></div>
      <div class="form-group"><label>Company</label><input type="text" data-field="company" value="${escapeHTML(entry.company || '')}" placeholder="Systems Limited"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label><input type="text" data-field="startDate" value="${escapeHTML(entry.startDate || '')}" placeholder="Jan 2022"></div>
      <div class="form-group"><label>End Date</label><input type="text" data-field="endDate" value="${escapeHTML(entry.endDate || '')}" placeholder="Present"></div>
    </div>
    <div class="form-group"><label>Description</label><textarea data-field="description" rows="2" placeholder="Key responsibilities and achievements...">${escapeHTML(entry.description || '')}</textarea></div>`;
}

function createSkillHTML(entry, index) {
    return `
    <div class="form-row">
      <div class="form-group"><label>Skill Name</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="React.js"></div>
      <div class="form-group"><label>Proficiency</label><select data-field="level">
        <option value="Beginner" ${entry.level==='Beginner'?'selected':''}>Beginner</option>
        <option value="Intermediate" ${entry.level==='Intermediate'?'selected':''}>Intermediate</option>
        <option value="Advanced" ${entry.level==='Advanced'?'selected':''}>Advanced</option>
        <option value="Expert" ${entry.level==='Expert'?'selected':''}>Expert</option>
      </select></div>
    </div>`;
}

function createLanguageHTML(entry, index) {
    return `
    <div class="form-row">
      <div class="form-group"><label>Language</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="Urdu"></div>
      <div class="form-group"><label>Proficiency</label><select data-field="proficiency">
        <option value="Native" ${entry.proficiency==='Native'?'selected':''}>Native</option>
        <option value="Fluent" ${entry.proficiency==='Fluent'?'selected':''}>Fluent</option>
        <option value="Intermediate" ${entry.proficiency==='Intermediate'?'selected':''}>Intermediate</option>
        <option value="Basic" ${entry.proficiency==='Basic'?'selected':''}>Basic</option>
      </select></div>
    </div>`;
}

function createCertificationHTML(entry, index) {
    return `
    <div class="form-row">
      <div class="form-group"><label>Certification Name</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="AWS Solutions Architect"></div>
      <div class="form-group"><label>Issuer</label><input type="text" data-field="issuer" value="${escapeHTML(entry.issuer || '')}" placeholder="Amazon"></div>
    </div>
    <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2023"></div>`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function addEducation() { userData.education.push({ degree: '', institution: '', year: '', grade: '' }); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addExperience() { userData.experience.push({ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addSkill() { userData.skills.push({ name: '', level: 'Intermediate' }); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addLanguage() { userData.languages.push({ name: '', proficiency: 'Fluent' }); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addCertification() { userData.certifications.push({ name: '', issuer: '', year: '' }); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }

// ==================== PHOTO UPLOAD ====================
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('Photo must be under 5MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        userData.personalInfo.photo = e.target.result;
        document.getElementById('photoPreview').src = e.target.result;
        updatePreview();
        saveToStorage();
        showToast('📷 Photo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    userData.personalInfo.photo = '';
    document.getElementById('photoPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Crect fill='%23ddd' width='70' height='70'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='24'%3E👤%3C/text%3E%3C/svg%3E";
    updatePreview();
    saveToStorage();
    showToast('Photo removed', 'success');
}

// ==================== UPDATE PREVIEW ====================
function updatePreview() {
    userData.personalInfo.fullName = document.getElementById('fullName').value;
    userData.personalInfo.jobTitle = document.getElementById('jobTitle').value;
    userData.personalInfo.email = document.getElementById('email').value;
    userData.personalInfo.phone = document.getElementById('phone').value;
    userData.personalInfo.location = document.getElementById('location').value;
    userData.personalInfo.website = document.getElementById('website').value;
    userData.personalInfo.summary = document.getElementById('summary').value;
    saveToStorage();

    const cvInner = document.getElementById('cvInner');
    const pi = userData.personalInfo;
    const settings = userData.settings;
    const accent = settings.accentColor || '#6c5ce7';

    let html = '';

    html += '<div class="cv-header">';
    if (pi.photo) {
        html += `<img src="${pi.photo}" alt="Profile Photo" style="border-color:${accent};">`;
    }
    html += '<div class="cv-header-info">';
    html += `<h1 style="color:#1a1a2e;">${escapeHTML(pi.fullName || 'Your Name')}</h1>`;
    html += `<div class="cv-title" style="color:${accent};font-weight:600;">${escapeHTML(pi.jobTitle || 'Job Title')}</div>`;
    html += '<div class="cv-contact-row">';
    if (pi.email) html += `<span>📧 ${escapeHTML(pi.email)}</span>`;
    if (pi.phone) html += `<span>📱 ${escapeHTML(pi.phone)}</span>`;
    if (pi.location) html += `<span>📍 ${escapeHTML(pi.location)}</span>`;
    if (pi.website) html += `<span>🔗 ${escapeHTML(pi.website)}</span>`;
    html += '</div></div></div>';

    if (pi.summary) {
        html += `<div class="cv-summary" style="border-left:3px solid ${accent};padding-left:1rem;">${escapeHTML(pi.summary)}</div>`;
    }

    if (userData.education.length > 0) {
        html += '<div class="cv-section"><h2>Education</h2>';
        userData.education.forEach(e => {
            html += '<div class="item">';
            html += `<h3>${escapeHTML(e.degree || 'Degree')} ${e.grade ? '— ' + escapeHTML(e.grade) : ''}</h3>`;
            html += `<div class="sub">${escapeHTML(e.institution || 'Institution')} | ${escapeHTML(e.year || 'Year')}</div>`;
            html += '</div>';
        });
        html += '</div>';
    }

    if (userData.experience.length > 0) {
        html += '<div class="cv-section"><h2>Experience</h2>';
        userData.experience.forEach(e => {
            html += '<div class="item">';
            html += `<h3>${escapeHTML(e.jobTitle || 'Job Title')} — ${escapeHTML(e.company || 'Company')}</h3>`;
            html += `<div class="sub">${escapeHTML(e.startDate || 'Start')} — ${escapeHTML(e.endDate || 'End')}</div>`;
            if (e.description) html += `<p>${escapeHTML(e.description)}</p>`;
            html += '</div>';
        });
        html += '</div>';
    }

    if (userData.skills.length > 0) {
        html += '<div class="cv-section"><h2>Skills</h2><div class="cv-skills-bar">';
        userData.skills.forEach(s => {
            const bgOpacity = s.level === 'Expert' ? '0.25' : s.level === 'Advanced' ? '0.18' : '0.1';
            html += `<span class="cv-skill-tag" style="background:${accent}${Math.round(parseFloat(bgOpacity)*255).toString(16).padStart(2,'0')};color:#1a1a2e;border:1px solid ${accent}40;">${escapeHTML(s.name || 'Skill')} (${escapeHTML(s.level || 'Level')})</span>`;
        });
        html += '</div></div>';
    }

    if (userData.languages.length > 0) {
        html += '<div class="cv-section"><h2>Languages</h2>';
        userData.languages.forEach(l => {
            html += `<div class="item"><strong>${escapeHTML(l.name || 'Language')}</strong> — ${escapeHTML(l.proficiency || 'Proficiency')}</div>`;
        });
        html += '</div>';
    }

    if (userData.certifications.length > 0) {
        html += '<div class="cv-section"><h2>Certifications</h2>';
        userData.certifications.forEach(c => {
            html += '<div class="item">';
            html += `<h3>${escapeHTML(c.name || 'Certification')} ${c.year ? '(' + escapeHTML(c.year) + ')' : ''}</h3>`;
            html += `<div class="sub">${escapeHTML(c.issuer || 'Issuer')}</div>`;
            html += '</div>';
        });
        html += '</div>';
    }

    cvInner.innerHTML = html;

    const cvPage = document.getElementById('cvPage');
    const fontMap = {
        'inter': "'Inter', 'Helvetica Neue', sans-serif",
        'playfair': "'Playfair Display', 'Georgia', serif",
        'poppins': "'Poppins', 'Segoe UI', sans-serif",
        'jetbrains': "'JetBrains Mono', 'Consolas', monospace"
    };
    cvPage.style.fontFamily = fontMap[settings.fontStyle] || fontMap['inter'];
    cvPage.style.setProperty('--cv-accent', accent);
}

// ==================== TEMPLATE SWITCHING ====================
function setTemplate(templateName, silent = false) {
    userData.settings.template = templateName;
    const cvPage = document.getElementById('cvPage');
    cvPage.classList.remove('classic', 'modern', 'creative');
    cvPage.classList.add(templateName);
    document.querySelectorAll('[data-template]').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-template="${templateName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updatePreview();
    saveToStorage();
    if (!silent) showToast(`📄 Template: ${templateName.charAt(0).toUpperCase() + templateName.slice(1)}`, 'success');
}

// ==================== INDUSTRY PRESETS ====================
function applyIndustryPreset(industry) {
    if (!industry) return;
    userData.settings.industry = industry;
    const presets = {
        'banking': { accent: '#1a3c6e', summary: 'Dedicated financial professional with expertise in banking operations, risk management, and customer relationship management within Pakistan\'s leading financial institutions.' },
        'it': { accent: '#0d7377', summary: 'Innovative technology professional skilled in software development, cloud infrastructure, and digital transformation for Pakistan\'s growing IT sector.' },
        'telecom': { accent: '#2d8a4e', summary: 'Experienced telecommunications specialist with a passion for connectivity and network solutions in Pakistan\'s dynamic telecom industry.' },
        'textile': { accent: '#8b5e3c', summary: 'Skilled professional in textile manufacturing and supply chain management, contributing to Pakistan\'s premier textile export industry.' },
        'education': { accent: '#4a3f6b', summary: 'Passionate educator committed to academic excellence and student development within Pakistan\'s educational institutions.' },
        'healthcare': { accent: '#2e7d6f', summary: 'Compassionate healthcare professional dedicated to improving patient outcomes in Pakistan\'s medical facilities.' }
    };
    const preset = presets[industry];
    if (preset) {
        userData.settings.accentColor = preset.accent;
        document.getElementById('accentColorPicker').value = preset.accent;
        document.getElementById('summary').value = preset.summary;
        userData.personalInfo.summary = preset.summary;
        applyCustomizations(true);
        updatePreview();
        saveToStorage();
        showToast(`🏭 Applied ${industry.replace('_',' ')} preset!`, 'success');
    }
    document.getElementById('industryPreset').value = '';
}

// ==================== CUSTOMIZATION ====================
function applyCustomizations(silent = false) {
    userData.settings.accentColor = document.getElementById('accentColorPicker').value;
    userData.settings.fontStyle = document.getElementById('fontStylePicker').value;
    userData.settings.borderRadius = document.getElementById('borderRadiusPicker').value;
    const cvPage = document.getElementById('cvPage');
    cvPage.style.setProperty('--cv-accent', userData.settings.accentColor);
    const fontMap = {
        'inter': "'Inter', 'Helvetica Neue', sans-serif",
        'playfair': "'Playfair Display', 'Georgia', serif",
        'poppins': "'Poppins', 'Segoe UI', sans-serif",
        'jetbrains': "'JetBrains Mono', 'Consolas', monospace"
    };
    cvPage.style.fontFamily = fontMap[userData.settings.fontStyle] || fontMap['inter'];
    cvPage.style.borderRadius = userData.settings.borderRadius;
    updatePreview();
    saveToStorage();
    if (!silent) showToast('🎨 Customization applied!', 'success');
}

function openCustomization() {
    document.getElementById('customizationModal').classList.add('active');
}
function closeCustomization() {
    document.getElementById('customizationModal').classList.remove('active');
}

// ==================== CREDITS & PAYMENT ====================
function updateCreditDisplay() {
    document.getElementById('creditCount').textContent = userData.credits;
    document.getElementById('modalCreditCount').textContent = userData.credits;
}

function openPaymentModal() {
    updateCreditDisplay();
    document.getElementById('paymentModal').classList.add('active');
}
function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function simulatePayment(method) {
    userData.credits += 3;
    updateCreditDisplay();
    saveToStorage();
    closePaymentModal();
    showToast(`✅ Simulated ${method} payment successful! +3 credits added.`, 'success');
}

// ==================== EXPORT PDF ====================
function exportPDF() {
    if (userData.credits <= 0) {
        showToast('⚠️ No credits remaining! Please buy more to export.', 'error');
        openPaymentModal();
        return;
    }
    if (!confirm(`You have ${userData.credits} credit(s). Exporting will use 1 credit.\n\nThe CV will open in the print dialog. Choose "Save as PDF" as the destination.\n\nContinue?`)) return;
    userData.credits--;
    updateCreditDisplay();
    saveToStorage();
    updatePreview();
    setTimeout(() => {
        window.print();
        showToast('📥 Print dialog opened. Select "Save as PDF" to export.', 'success');
    }, 300);
}

// ==================== TOAST SYSTEM ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    toast.addEventListener('animationend', (e) => {
        if (e.animationName === 'toastOut') {
            toast.remove();
        }
    });
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ==================== MODAL CLOSE ON OVERLAY CLICK ====================
document.getElementById('paymentModal').addEventListener('click', function(e) {
    if (e.target === this) closePaymentModal();
});
document.getElementById('customizationModal').addEventListener('click', function(e) {
    if (e.target === this) closeCustomization();
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportPDF();
    }
});

// ==================== INITIAL STATE ====================
updateCreditDisplay();
console.log('🚀 CV Builder Pro ready. Enter a password to begin.');
console.log('📋 Features: Split-screen builder | 3 Templates | Industry Presets | Photo Upload | Credit System | PDF Export');
console.log('💡 Tip: Use Ctrl+E to quickly export your CV!');
