<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
  <title>Dashboard – Pro CV Builder</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <h1><i class="fas fa-file-alt"></i> CV Builder PK</h1>
      <div class="user-info">
        <span class="credits-badge" id="creditDisplay">0 CV</span>
        <button class="logout-btn" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Exit</button>
      </div>
    </div>

    <!-- Credit / Payment Section -->
    <div class="payment-section">
      <h3><i class="fas fa-coins"></i> CV Credits</h3>
      <p id="creditMessage">You have 1 free CV.</p>
      <div class="payment-options" id="paymentOptions" style="display:none;">
        <button class="payment-btn" data-method="jazzcash"><i class="fas fa-mobile-alt"></i> JazzCash (30 PKR)</button>
        <button class="payment-btn" data-method="easypaisa"><i class="fas fa-wallet"></i> EasyPaisa (30 PKR)</button>
      </div>
      <p id="paymentStatus" style="margin-top:15px;"></p>
    </div>

    <!-- CV Builder Section -->
    <div id="cvBuilderSection">
      <h1 style="margin-top: 0;">
        <i class="fas fa-file-alt"></i> 
        Pro CV Builder 
        <span class="pak-flag"><i class="fas fa-bolt"></i> Powered by AI</span>
      </h1>

      <div class="app-container">
        <!-- LEFT FORM PANEL -->
        <div class="form-panel">
          <h2><i class="fas fa-sparkles"></i> Build Your CV</h2>

          <div class="template-switch">
            <button class="template-btn active" data-template="classic">Classic Pro</button>
            <button class="template-btn" data-template="modern">Modern</button>
            <button class="template-btn" data-template="bold">Bold</button>
          </div>

          <div class="industry-selector">
            <label><i class="fas fa-building"></i> Target Employer</label>
            <select id="industrySelect">
              <option value="default">✨ Select to customize CV</option>
              <optgroup label="🏭 FMCG & Multinationals">
                <option value="unilever">Unilever Pakistan</option>
                <option value="nestle">Nestlé Pakistan</option>
                <option value="pepsi">PepsiCo Pakistan</option>
                <option value="p&g">P&G Pakistan</option>
                <option value="reckitt">Reckitt Benckiser</option>
              </optgroup>
              <optgroup label="🏦 Banking & Finance">
                <option value="meezan">Meezan Bank (Islamic)</option>
                <option value="hbl">HBL</option>
                <option value="ubl">UBL</option>
                <option value="standard">Standard Chartered</option>
                <option value="mcb">MCB Bank</option>
              </optgroup>
              <optgroup label="💻 IT & Software Houses">
                <option value="systems">Systems Limited</option>
                <option value="netsol">Netsol Technologies</option>
                <option value="arbisoft">Arbisoft</option>
                <option value="devsinc">Devsinc</option>
                <option value="10pearls">10Pearls</option>
              </optgroup>
              <optgroup label="⚡ Energy & Oil/Gas">
                <option value="ogdcl">OGDCL</option>
                <option value="psopak">PSO</option>
                <option value="engro">Engro Fertilizers</option>
                <option value="kelectric">K-Electric</option>
              </optgroup>
              <optgroup label="🏗️ Manufacturing & Textile">
                <option value="luckycement">Lucky Cement</option>
                <option value="interloop">Interloop Textile</option>
                <option value="nishat">Nishat Mills</option>
                <option value="atlashonda">Atlas Honda</option>
              </optgroup>
              <optgroup label="📱 Telecom & Logistics">
                <option value="jazz">Jazz (Mobilink)</option>
                <option value="telenor">Telenor Pakistan</option>
                <option value="ptcl">PTCL</option>
                <option value="dhl">DHL Pakistan</option>
              </optgroup>
              <optgroup label="🏥 Healthcare & Pharma">
                <option value="shifa">Shifa International</option>
                <option value="agakhan">Aga Khan University Hospital</option>
                <option value="gsk">GSK Pakistan</option>
                <option value="searle">Searle Pakistan</option>
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label><i class="fas fa-image"></i> Profile Photo</label>
            <div class="image-upload-area">
              <img id="profilePreviewSmall" class="image-preview-small" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2360a5fa'/%3E%3Ctext x='50' y='67' font-size='50' text-anchor='middle' fill='%23fff' font-family='Arial'%3E👤%3C/text%3E%3C/svg%3E" alt="preview">
              <label for="profileImageInput" class="upload-btn"><i class="fas fa-upload"></i> Upload Photo</label>
              <input type="file" id="profileImageInput" accept="image/*">
            </div>
          </div>

          <div class="form-group"><label><i class="fas fa-user"></i> Full Name</label><input type="text" id="fullName" value="Muhammad Ali"></div>
          <div class="form-group"><label><i class="fas fa-briefcase"></i> Title</label><input type="text" id="title" value="Software Engineer"></div>
          <div class="form-group"><label><i class="fas fa-quote-left"></i> Summary</label><textarea id="profileText">Software engineer with 5+ years in full-stack development...</textarea></div>

          <div class="inline-fields">
            <div class="form-group"><label><i class="fas fa-phone-alt"></i> Phone</label><input type="text" id="phone" value="+92 300 1234567"></div>
            <div class="form-group"><label><i class="fas fa-envelope"></i> Email</label><input type="email" id="email" value="ali.ahmed@example.com"></div>
          </div>
          <div class="form-group"><label><i class="fas fa-map-marker-alt"></i> Location</label><input type="text" id="address" value="DHA Phase 6, Lahore, Pakistan"></div>

          <div class="form-group"><label><i class="fas fa-code"></i> Skills (comma)</label><input type="text" id="skillsInput" value="SQL, Linux, Python, C++, Java, React"></div>
          <div class="form-group"><label><i class="fas fa-language"></i> Languages</label><input type="text" id="languagesInput" value="English (Proficient), Urdu (Native), Punjabi (Conversational)"></div>
          <div class="form-group"><label><i class="fas fa-heart"></i> Hobbies</label><input type="text" id="hobbiesInput" value="Writing, Cricket, Music, Travel"></div>

          <div class="form-group">
            <label>💼 Senior Role</label>
            <input type="text" id="jobTitle1" value="Senior Software Developer">
            <div style="display:flex; gap:8px; margin-top:10px;">
              <input type="text" id="jobCompany1" value="Systems Limited" style="flex:2">
              <input type="text" id="jobPeriod1" value="Jan 2022 – Dec 2023" style="flex:2">
            </div>
            <textarea id="jobDesc1" style="margin-top:10px;">• Developed and maintained software using Java, Python, C++</textarea>
          </div>
          <div class="form-group">
            <label>📍 Previous Role</label>
            <input type="text" id="jobTitle2" value="Web Developer">
            <div style="display:flex; gap:8px; margin-top:10px;">
              <input type="text" id="jobCompany2" value="Techlogix" style="flex:2">
              <input type="text" id="jobPeriod2" value="Jan 2021 – Dec 2021" style="flex:2">
            </div>
            <textarea id="jobDesc2" style="margin-top:10px;">• Developed web applications using HTML, CSS, JS, PHP</textarea>
          </div>

          <div class="form-group">
            <label><i class="fas fa-graduation-cap"></i> Masters</label>
            <input type="text" id="eduDegree1" value="Masters in Software Engineering">
            <div style="display:flex; gap:8px; margin-top:10px;">
              <input type="text" id="eduSchool1" value="NUST, Islamabad" style="flex:2">
              <input type="text" id="eduYear1" value="2019 – 2020" style="flex:1">
            </div>
          </div>
          <div class="form-group">
            <label>Bachelor</label>
            <input type="text" id="eduDegree2" value="BSc Computer Science">
            <div style="display:flex; gap:8px; margin-top:10px;">
              <input type="text" id="eduSchool2" value="Punjab University, Lahore" style="flex:2">
              <input type="text" id="eduYear2" value="2015 – 2019" style="flex:1">
            </div>
          </div>

          <div class="form-group" style="margin-top:20px;">
            <label><i class="fas fa-sliders-h"></i> Customize UI</label>
            <div class="customizer-group"><label>Accent</label><input type="color" id="accentColor" value="#60a5fa"></div>
            <div class="customizer-group"><label>Font</label><select id="fontFamilySelect"><option value="'Inter', sans-serif">Inter</option><option value="'Poppins', sans-serif">Poppins</option><option value="'Georgia', serif">Georgia</option></select></div>
            <div class="customizer-group"><label>Radius</label><select id="borderRadiusSelect"><option value="16px">Soft</option><option value="28px" selected>Rounded</option><option value="8px">Sharp</option></select></div>
          </div>

          <div class="btn-group">
            <button class="btn btn-primary" id="applyCustomBtn"><i class="fas fa-magic"></i> Apply</button>
            <button class="btn btn-outline" id="downloadPDFBtn"><i class="fas fa-file-pdf"></i> Export PDF</button>
          </div>
        </div>

        <!-- RIGHT PREVIEW -->
        <div class="preview-panel">
          <div class="cv-card" id="cvPreview"></div>
        </div>
      </div>
      <p style="margin-top:30px; color:#cbd5e0; text-align:center;">Select template · Customize colors & fonts · Real-time preview</p>
    </div>
  </div>

  <script src="js/dashboard.js"></script>
</body>
</html>