// ==================== APP STATE ====================
let currentUserKey = null;
let userData = {
    personalInfo: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', summary: '', photo: '' },
    education: [],
    experience: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    awards: [],
    publications: [],
    settings: { template: 'classic', accentColor: '#6c5ce7', fontStyle: 'inter', borderRadius: '2px', fontSize: '16px' },
    credits: 1
};

// ==================== AUTH ====================
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
            // Merge with defaults to ensure all properties exist
            userData = {
                personalInfo: Object.assign({ fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', summary: '', photo: '' }, parsed.personalInfo),
                education: parsed.education || [],
                experience: parsed.experience || [],
                skills: parsed.skills || [],
                languages: parsed.languages || [],
                certifications: parsed.certifications || [],
                projects: parsed.projects || [],
                awards: parsed.awards || [],
                publications: parsed.publications || [],
                settings: Object.assign({ template: 'classic', accentColor: '#6c5ce7', fontStyle: 'inter', borderRadius: '2px', fontSize: '16px' }, parsed.settings),
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
        userData.credits = 1;
        saveToStorage();
        showToast('New account created! 1 free export credit.', 'success');
    } else {
        showToast('Welcome back! Data loaded.', 'success');
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
    if (confirm('Logout? Your data is saved locally.')) {
        saveToStorage();
        location.reload(); // simplest reset
    }
}

// ==================== INIT ====================
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
    document.getElementById('fontSizePicker').value = userData.settings.fontSize || '16px';
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
    rebuildEntries('projectsEntries', userData.projects, createProjectHTML, 'projects');
    rebuildEntries('awardsEntries', userData.awards, createAwardHTML, 'awards');
    rebuildEntries('publicationsEntries', userData.publications, createPublicationHTML, 'publications');
}

function rebuildEntries(containerId, dataArray, htmlFn, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    dataArray.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'dynamic-entry';
        div.innerHTML = htmlFn(entry, index);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-entry';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
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
        education: userData.education,
        experience: userData.experience,
        skills: userData.skills,
        languages: userData.languages,
        certifications: userData.certifications,
        projects: userData.projects,
        awards: userData.awards,
        publications: userData.publications
    };
    if (arrayMap[type] && arrayMap[type][index]) {
        Object.assign(arrayMap[type][index], data);
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Entry HTML creators ---
function createEducationHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Degree</label><input type="text" data-field="degree" value="${escapeHTML(entry.degree || '')}" placeholder="BSc Computer Science"></div>
      <div class="form-group"><label>Institution</label><input type="text" data-field="institution" value="${escapeHTML(entry.institution || '')}" placeholder="LUMS"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2020 - 2024"></div>
      <div class="form-group"><label>Grade / CGPA</label><input type="text" data-field="grade" value="${escapeHTML(entry.grade || '')}" placeholder="3.8 / 4.0"></div>
    </div>`;
}
function createExperienceHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Job Title</label><input type="text" data-field="jobTitle" value="${escapeHTML(entry.jobTitle || '')}" placeholder="Senior Developer"></div>
      <div class="form-group"><label>Company</label><input type="text" data-field="company" value="${escapeHTML(entry.company || '')}" placeholder="Systems Limited"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label><input type="text" data-field="startDate" value="${escapeHTML(entry.startDate || '')}" placeholder="Jan 2022"></div>
      <div class="form-group"><label>End Date</label><input type="text" data-field="endDate" value="${escapeHTML(entry.endDate || '')}" placeholder="Present"></div>
    </div>
    <div class="form-group"><label>Description</label><textarea data-field="description" rows="2" placeholder="Responsibilities...">${escapeHTML(entry.description || '')}</textarea></div>`;
}
function createSkillHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Skill</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="React.js"></div>
      <div class="form-group"><label>Level</label><select data-field="level">
        <option value="Beginner" ${entry.level==='Beginner'?'selected':''}>Beginner</option>
        <option value="Intermediate" ${entry.level==='Intermediate'?'selected':''}>Intermediate</option>
        <option value="Advanced" ${entry.level==='Advanced'?'selected':''}>Advanced</option>
        <option value="Expert" ${entry.level==='Expert'?'selected':''}>Expert</option>
      </select></div>
    </div>`;
}
function createLanguageHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Language</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="Urdu"></div>
      <div class="form-group"><label>Proficiency</label><select data-field="proficiency">
        <option value="Native" ${entry.proficiency==='Native'?'selected':''}>Native</option>
        <option value="Fluent" ${entry.proficiency==='Fluent'?'selected':''}>Fluent</option>
        <option value="Intermediate" ${entry.proficiency==='Intermediate'?'selected':''}>Intermediate</option>
        <option value="Basic" ${entry.proficiency==='Basic'?'selected':''}>Basic</option>
      </select></div>
    </div>`;
}
function createCertificationHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Certification</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="AWS Solutions Architect"></div>
      <div class="form-group"><label>Issuer</label><input type="text" data-field="issuer" value="${escapeHTML(entry.issuer || '')}" placeholder="Amazon"></div>
    </div>
    <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2023"></div>`;
}
function createProjectHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Project Name</label><input type="text" data-field="name" value="${escapeHTML(entry.name || '')}" placeholder="E‑Commerce Website"></div>
      <div class="form-group"><label>Role / Tech</label><input type="text" data-field="role" value="${escapeHTML(entry.role || '')}" placeholder="Lead Developer (React, Node)"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2024"></div>
      <div class="form-group"><label>Link</label><input type="text" data-field="link" value="${escapeHTML(entry.link || '')}" placeholder="https://github.com/..."></div>
    </div>
    <div class="form-group"><label>Description</label><textarea data-field="description" rows="2" placeholder="Brief overview...">${escapeHTML(entry.description || '')}</textarea></div>`;
}
function createAwardHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Award Title</label><input type="text" data-field="title" value="${escapeHTML(entry.title || '')}" placeholder="Employee of the Year"></div>
      <div class="form-group"><label>Issuer</label><input type="text" data-field="issuer" value="${escapeHTML(entry.issuer || '')}" placeholder="Systems Limited"></div>
    </div>
    <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2025"></div>`;
}
function createPublicationHTML(entry) {
    return `<div class="form-row">
      <div class="form-group"><label>Title</label><input type="text" data-field="title" value="${escapeHTML(entry.title || '')}" placeholder="Advanced Algorithms in Python"></div>
      <div class="form-group"><label>Publisher / Journal</label><input type="text" data-field="publisher" value="${escapeHTML(entry.publisher || '')}" placeholder="IEEE"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Year</label><input type="text" data-field="year" value="${escapeHTML(entry.year || '')}" placeholder="2025"></div>
      <div class="form-group"><label>Link</label><input type="text" data-field="link" value="${escapeHTML(entry.link || '')}" placeholder="https://doi.org/..."></div>
    </div>`;
}

// Add functions
function addEducation(){ userData.education.push({degree:'',institution:'',year:'',grade:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addExperience(){ userData.experience.push({jobTitle:'',company:'',startDate:'',endDate:'',description:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addSkill(){ userData.skills.push({name:'',level:'Intermediate'}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addLanguage(){ userData.languages.push({name:'',proficiency:'Fluent'}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addCertification(){ userData.certifications.push({name:'',issuer:'',year:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addProject(){ userData.projects.push({name:'',role:'',year:'',link:'',description:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addAward(){ userData.awards.push({title:'',issuer:'',year:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }
function addPublication(){ userData.publications.push({title:'',publisher:'',year:'',link:''}); rebuildAllDynamicEntries(); updatePreview(); saveToStorage(); }

// ==================== PHOTO ====================
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Photo must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        userData.personalInfo.photo = e.target.result;
        document.getElementById('photoPreview').src = e.target.result;
        updatePreview();
        saveToStorage();
        showToast('Photo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
}
function removePhoto() {
    userData.personalInfo.photo = '';
    document.getElementById('photoPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ccc'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%23888' font-size='40'%3E%3C/text%3E%3C/svg%3E";
    updatePreview();
    saveToStorage();
    showToast('Photo removed', 'success');
}

// ==================== UPDATE PREVIEW ====================
function updatePreview() {
    // Sync inputs
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

    let html = `
    <div class="cv-sidebar">
      <div class="cv-photo-section">
        ${pi.photo ? `<img src="${pi.photo}" alt="Profile" class="cv-photo">` : ''}
        <h1 class="cv-name">${escapeHTML(pi.fullName || 'Your Name')}</h1>
        <div class="cv-title-role">${escapeHTML(pi.jobTitle || 'Job Title')}</div>
      </div>
      <div class="cv-contact-details">
        ${pi.email ? `<div class="cv-contact-item"><i class="fas fa-envelope cv-icon"></i>${escapeHTML(pi.email)}</div>` : ''}
        ${pi.phone ? `<div class="cv-contact-item"><i class="fas fa-phone cv-icon"></i>${escapeHTML(pi.phone)}</div>` : ''}
        ${pi.location ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt cv-icon"></i>${escapeHTML(pi.location)}</div>` : ''}
        ${pi.website ? `<div class="cv-contact-item"><i class="fas fa-link cv-icon"></i>${escapeHTML(pi.website)}</div>` : ''}
      </div>
      <div class="cv-sidebar-section">
        <h3 class="cv-sidebar-heading">Skills</h3>
        ${userData.skills.length === 0 ? '<p class="cv-empty">Add skills in the form</p>' :
          userData.skills.map(s => `
            <div class="cv-skill-item">
              <div class="cv-skill-name">${escapeHTML(s.name || 'Skill')}</div>
              <div class="cv-skill-bar">
                <div class="cv-skill-fill" style="width:${s.level==='Expert'?'95':s.level==='Advanced'?'75':s.level==='Intermediate'?'50':'25'}%; background:${accent};"></div>
              </div>
            </div>
          `).join('')
        }
      </div>
      <div class="cv-sidebar-section">
        <h3 class="cv-sidebar-heading">Languages</h3>
        ${userData.languages.length === 0 ? '<p class="cv-empty">Add languages</p>' :
          userData.languages.map(l => `
            <div class="cv-language-item"><strong>${escapeHTML(l.name || 'Language')}</strong> – ${escapeHTML(l.proficiency || 'Proficiency')}</div>
          `).join('')
        }
      </div>
    </div>
    <div class="cv-main">
      ${pi.summary ? `<div class="cv-section"><h2 class="cv-section-heading">Professional Summary</h2><p class="cv-summary">${escapeHTML(pi.summary)}</p></div>` : ''}
      ${userData.education.length ? `<div class="cv-section"><h2 class="cv-section-heading">Education</h2>${userData.education.map(e => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(e.degree || 'Degree')}${e.grade ? ' – ' + escapeHTML(e.grade) : ''}</div><div class="cv-entry-sub">${escapeHTML(e.institution || 'Institution')} | ${escapeHTML(e.year || 'Year')}</div></div>`).join('')}</div>` : ''}
      ${userData.experience.length ? `<div class="cv-section"><h2 class="cv-section-heading">Experience</h2>${userData.experience.map(e => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(e.jobTitle || 'Job Title')} — ${escapeHTML(e.company || 'Company')}</div><div class="cv-entry-sub">${escapeHTML(e.startDate || 'Start')} – ${escapeHTML(e.endDate || 'End')}</div>${e.description ? `<p class="cv-entry-desc">${escapeHTML(e.description)}</p>` : ''}</div>`).join('')}</div>` : ''}
      ${userData.certifications.length ? `<div class="cv-section"><h2 class="cv-section-heading">Certifications</h2>${userData.certifications.map(c => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(c.name || 'Certification')} ${c.year ? '(' + escapeHTML(c.year) + ')' : ''}</div><div class="cv-entry-sub">${escapeHTML(c.issuer || 'Issuer')}</div></div>`).join('')}</div>` : ''}
      ${userData.projects.length ? `<div class="cv-section"><h2 class="cv-section-heading">Projects</h2>${userData.projects.map(p => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(p.name || 'Project')} ${p.role ? '— ' + escapeHTML(p.role) : ''}</div><div class="cv-entry-sub">${escapeHTML(p.year || 'Year')}${p.link ? ' · <a href="'+escapeHTML(p.link)+'" target="_blank" style=\"color:'+accent+';\">Link</a>' : ''}</div>${p.description ? `<p class="cv-entry-desc">${escapeHTML(p.description)}</p>` : ''}</div>`).join('')}</div>` : ''}
      ${userData.awards.length ? `<div class="cv-section"><h2 class="cv-section-heading">Awards & Honors</h2>${userData.awards.map(a => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(a.title || 'Award')}</div><div class="cv-entry-sub">${escapeHTML(a.issuer || 'Issuer')} · ${escapeHTML(a.year || 'Year')}</div></div>`).join('')}</div>` : ''}
      ${userData.publications.length ? `<div class="cv-section"><h2 class="cv-section-heading">Publications</h2>${userData.publications.map(pub => `<div class="cv-entry"><div class="cv-entry-title">${escapeHTML(pub.title || 'Publication')}</div><div class="cv-entry-sub">${escapeHTML(pub.publisher || 'Publisher')} · ${escapeHTML(pub.year || 'Year')}${pub.link ? ' · <a href="'+escapeHTML(pub.link)+'" target="_blank" style=\"color:'+accent+';\">View</a>' : ''}</div></div>`).join('')}</div>` : ''}
    </div>`;

    cvInner.innerHTML = html;

    const cvPage = document.getElementById('cvPage');
    const fontMap = { inter: 'Inter, sans-serif', playfair: 'Playfair Display, serif', poppins: 'Poppins, sans-serif', jetbrains: 'JetBrains Mono, monospace' };
    cvPage.style.fontFamily = fontMap[settings.fontStyle] || 'Inter, sans-serif';
    cvPage.style.fontSize = settings.fontSize || '16px';
    cvPage.style.setProperty('--cv-accent', accent);
}

// ==================== TEMPLATES ====================
function setTemplate(name, silent = false) {
    userData.settings.template = name;
    const cvPage = document.getElementById('cvPage');
    cvPage.classList.remove('classic', 'modern', 'creative');
    cvPage.classList.add(name);
    document.querySelectorAll('[data-template]').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-template="${name}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updatePreview();
    saveToStorage();
    if (!silent) showToast(`Template set to ${name.charAt(0).toUpperCase() + name.slice(1)}`, 'success');
}

// ==================== INDUSTRY PRESETS ====================
function applyIndustryPreset(industry) {
    if (!industry) return;
    const presets = {
        banking: { accent: '#1a3c6e', summary: 'Dedicated financial professional with expertise in banking operations, risk management, and customer relationship management within Pakistan\'s leading financial institutions.' },
        it: { accent: '#0d7377', summary: 'Innovative technology professional skilled in software development, cloud infrastructure, and digital transformation for Pakistan\'s growing IT sector.' },
        telecom: { accent: '#2d8a4e', summary: 'Experienced telecommunications specialist with a passion for connectivity and network solutions in Pakistan\'s dynamic telecom industry.' },
        textile: { accent: '#8b5e3c', summary: 'Skilled professional in textile manufacturing and supply chain management, contributing to Pakistan\'s premier textile export industry.' },
        education: { accent: '#4a3f6b', summary: 'Passionate educator committed to academic excellence and student development within Pakistan\'s educational institutions.' },
        healthcare: { accent: '#2e7d6f', summary: 'Compassionate healthcare professional dedicated to improving patient outcomes in Pakistan\'s medical facilities.' }
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
        showToast(`Applied ${industry.replace('_', ' ')} preset`, 'success');
    }
    document.getElementById('industryPreset').value = '';
}

// ==================== CUSTOMIZATION ====================
function applyCustomizations(silent = false) {
    userData.settings.accentColor = document.getElementById('accentColorPicker').value;
    userData.settings.fontStyle = document.getElementById('fontStylePicker').value;
    userData.settings.borderRadius = document.getElementById('borderRadiusPicker').value;
    userData.settings.fontSize = document.getElementById('fontSizePicker').value;
    const cvPage = document.getElementById('cvPage');
    cvPage.style.setProperty('--cv-accent', userData.settings.accentColor);
    const fontMap = { inter: 'Inter, sans-serif', playfair: 'Playfair Display, serif', poppins: 'Poppins, sans-serif', jetbrains: 'JetBrains Mono, monospace' };
    cvPage.style.fontFamily = fontMap[userData.settings.fontStyle] || 'Inter, sans-serif';
    cvPage.style.fontSize = userData.settings.fontSize;
    cvPage.style.borderRadius = userData.settings.borderRadius;
    updatePreview();
    saveToStorage();
    if (!silent) showToast('Customizations applied!', 'success');
}
function openCustomization() { document.getElementById('customizationModal').classList.add('active'); }
function closeCustomization() { document.getElementById('customizationModal').classList.remove('active'); }

// ==================== CREDITS ====================
function updateCreditDisplay() {
    document.getElementById('creditCount').textContent = userData.credits;
}
function openPaymentModal() { document.getElementById('paymentModal').classList.add('active'); }
function closePaymentModal() { document.getElementById('paymentModal').classList.remove('active'); }
function simulatePayment(method) {
    userData.credits += 3;
    updateCreditDisplay();
    saveToStorage();
    closePaymentModal();
    showToast(`Simulated ${method} payment! +3 credits.`, 'success');
}

// ==================== EXPORT PDF ====================
function exportPDF() {
    if (userData.credits <= 0) {
        showToast('No credits left! Buy more to export.', 'error');
        openPaymentModal();
        return;
    }
    if (!confirm(`Export uses 1 credit. Continue?`)) return;
    userData.credits--;
    updateCreditDisplay();
    saveToStorage();
    updatePreview();
    setTimeout(() => {
        window.print();
        showToast('Print dialog opened. Choose "Save as PDF".', 'success');
    }, 300);
}

// ==================== TOAST ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    toast.addEventListener('animationend', (e) => {
        if (e.animationName === 'toastOut') toast.remove();
    });
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

// ==================== MODAL CLOSE ====================
document.getElementById('paymentModal').addEventListener('click', function(e) { if (e.target === this) closePaymentModal(); });
document.getElementById('customizationModal').addEventListener('click', function(e) { if (e.target === this) closeCustomization(); });

// Keyboard shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'e') { e.preventDefault(); exportPDF(); }
});

// ==================== READY ====================
console.log('CV Builder Pro ready');