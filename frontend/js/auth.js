document.addEventListener('DOMContentLoaded', () => {
  const newBtn = document.getElementById('newBtn');
  const existingBtn = document.getElementById('existingBtn');
  const passwordBox = document.getElementById('passwordBox');
  const choiceBox = document.getElementById('choiceBox');
  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitPassword');
  const errorMsg = document.getElementById('errorMsg');

  let mode = null;

  newBtn.onclick = () => {
    mode = 'new';
    choiceBox.style.display = 'none';
    passwordBox.style.display = 'block';
    passwordInput.focus();
  };

  existingBtn.onclick = () => {
    mode = 'existing';
    choiceBox.style.display = 'none';
    passwordBox.style.display = 'block';
    passwordInput.focus();
  };

  submitBtn.onclick = () => {
    const password = passwordInput.value.trim();
    if (password.length < 6 || password.length > 8) {
      errorMsg.textContent = "Password must be 6-8 characters";
      return;
    }

    if (mode === 'new') {
      localStorage.setItem('cv_password', password);
      localStorage.setItem(`cv_${password}_user`, JSON.stringify({ free_cv_used: false }));
      localStorage.setItem(`cv_${password}_credits`, JSON.stringify([]));
      window.location.href = 'dashboard.html';
    }

    if (mode === 'existing') {
      const saved = localStorage.getItem('cv_password');
      if (!saved) {
        errorMsg.textContent = "No account found. Click NEW first.";
        return;
      }
      if (saved !== password) {
        errorMsg.textContent = "Wrong password";
        return;
      }
      window.location.href = 'dashboard.html';
    }
  };

  if (localStorage.getItem('cv_password')) {
    window.location.href = 'dashboard.html';
  }
});
