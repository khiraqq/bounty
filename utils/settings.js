// utils/settings.js
// All original account-settings.html inline script logic preserved.
// Only change: fetch() URLs point to /api/* instead of Xano.
// No JSX in this file — pure JS only.

import { STORAGE_KEYS } from './auth';

const SK = {
  token: STORAGE_KEYS.token,
  username: STORAGE_KEYS.authenticatedUser,
  email: STORAGE_KEYS.email,
  method: STORAGE_KEYS.authMethod,
};

export function initSettings() {
  if (window.lucide) window.lucide.createIcons();
  const t = localStorage.getItem('theme');
  if (t === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');

  populateFields();

  const ta = document.getElementById('settings-description');
  if (ta) {
    const counter = document.getElementById('desc-count');
    if (counter) counter.textContent = ta.value.length;
    ta.addEventListener('input', function () {
      if (counter) counter.textContent = ta.value.length;
    });
  }

  const pwNew = document.getElementById('pw-new');
  if (pwNew) {
    pwNew.addEventListener('input', function (e) { validatePassword(e.target.value); });
  }

  window.addEventListener('scroll', scrollSpy, { passive: true });
}

// ── POPULATE FIELDS ──────────────────────────────────────────────────────────

export function populateFields() {
  const username = localStorage.getItem(SK.username) || '';
  const email = localStorage.getItem(SK.email) || '';
  const method = localStorage.getItem(SK.method) || 'password';
  const isGoogle = method === 'google';
  const isDiscord = method === 'discord';
  const hasEmail = !!email;

  const usernameField = document.getElementById('field-username');
  if (usernameField) usernameField.value = username;

  const emailRow = document.getElementById('email-row');
  const emailInput = document.getElementById('field-email');
  const emailBadge = document.getElementById('email-method-badge');
  const emailNote = document.getElementById('email-google-note');
  const btnEmail = document.getElementById('btn-email');

  if (hasEmail || isGoogle || isDiscord) {
    if (emailRow) emailRow.classList.remove('hidden-field');
    if (emailInput) emailInput.value = email;
    if (isGoogle) {
      if (emailBadge) {
        emailBadge.classList.remove('hidden');
        emailBadge.textContent = 'via Google';
        emailBadge.style.background = 'rgba(234,67,53,.12)';
        emailBadge.style.color = '#EA4335';
      }
      if (emailNote) emailNote.classList.remove('hidden');
      if (btnEmail) btnEmail.style.display = 'none';
    } else if (isDiscord) {
      if (emailBadge) {
        emailBadge.classList.remove('hidden');
        emailBadge.textContent = 'via Discord';
        emailBadge.style.background = 'rgba(88,101,242,.12)';
        emailBadge.style.color = '#5865F2';
      }
      if (emailNote) {
        emailNote.textContent = 'Email is managed by Discord and cannot be changed here.';
        emailNote.classList.remove('hidden');
      }
      if (btnEmail) btnEmail.style.display = 'none';
    }
  } else {
    if (emailRow) emailRow.classList.add('hidden-field');
  }
}

// ── TOAST ────────────────────────────────────────────────────────────────────

export function showToast(msg, type) {
  type = type || 'success';
  const t = document.getElementById('toast');
  if (!t) return;
  const checkSvg =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="20 6 9 17 4 12"/></svg>';
  const xSvg =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  t.className = 'show ' + type;
  t.innerHTML = (type === 'success' ? checkSvg : xSvg) + msg;
  clearTimeout(t._t);
  t._t = setTimeout(function () { t.className = ''; }, 3000);
}

// ── AVATAR ───────────────────────────────────────────────────────────────────

export function handleAvatarUpload(e) {
  const file = e.target.files[0];
  const errEl = document.getElementById('avatar-error');
  if (errEl) errEl.classList.add('hidden');
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/heic', 'image/gif'].includes(file.type)) {
    if (errEl) { errEl.textContent = 'Invalid type — use JPEG, PNG, HEIC or GIF.'; errEl.classList.remove('hidden'); }
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    if (errEl) { errEl.textContent = 'Exceeds 10 MB.'; errEl.classList.remove('hidden'); }
    return;
  }
  const r = new FileReader();
  r.onload = function (ev) {
    const preview = document.getElementById('avatar-preview');
    if (preview) {
      preview.innerHTML =
        '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" alt="Avatar">';
    }
    localStorage.setItem('profile_avatar_data_url', ev.target.result);
  };
  r.readAsDataURL(file);
  showToast('Profile picture updated!');
}

// ── EDIT TOGGLE ──────────────────────────────────────────────────────────────

const _editState = {};

export function toggleEdit(field) {
  const input = document.getElementById('field-' + field);
  const btn = document.getElementById('btn-' + field);
  if (!input || !btn) return;
  _editState[field] = !_editState[field];
  if (_editState[field]) {
    input.removeAttribute('readonly');
    input.classList.add('editable');
    input.focus();
    input.select();
    btn.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="20 6 9 17 4 12"/></svg> Done';
    btn.classList.add('active-edit');
  } else {
    input.setAttribute('readonly', '');
    input.classList.remove('editable');
    btn.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
      '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit';
    btn.classList.remove('active-edit');
  }
}

// ── SAVE PROFILE ─────────────────────────────────────────────────────────────

export async function saveProfile() {
  const usernameField = document.getElementById('field-username');
  const username = usernameField ? usernameField.value.trim() : '';
  const errEl = document.getElementById('username-error');
  if (errEl) errEl.classList.add('hidden');
  if (username.length < 3) { if (errEl) errEl.classList.remove('hidden'); return; }
  if (_editState.username) toggleEdit('username');

  const btn = document.getElementById('profile-save-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving\u2026';

  try {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (localStorage.getItem(SK.token) || ''),
      },
      body: JSON.stringify({ username }),
    });
    if (res.ok) {
      localStorage.setItem(SK.username, username);
      showToast('Profile saved!', 'success');
    } else {
      const d = await res.json().catch(function () { return {}; });
      showToast(d.message || 'Failed to save.', 'error');
    }
  } catch (_) {
    localStorage.setItem(SK.username, username);
    showToast('Profile saved!', 'success');
  }

  btn.disabled = false;
  btn.innerHTML = 'Save profile';
}

// ── SAVE ACCOUNT ─────────────────────────────────────────────────────────────

export async function saveAccount() {
  const emailField = document.getElementById('field-email');
  const email = emailField ? emailField.value.trim() : '';
  if (_editState.email) toggleEdit('email');

  const btn = document.getElementById('account-save-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving\u2026';

  try {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (localStorage.getItem(SK.token) || ''),
      },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      localStorage.setItem(SK.email, email);
      showToast('Account updated!', 'success');
    } else {
      const d = await res.json().catch(function () { return {}; });
      showToast(d.message || 'Failed.', 'error');
    }
  } catch (_) {
    localStorage.setItem(SK.email, email);
    showToast('Account updated!', 'success');
  }

  btn.disabled = false;
  btn.innerHTML = 'Save account';
}

// ── PASSWORD PANEL ───────────────────────────────────────────────────────────

let _pwOpen = false;

export function togglePasswordPanel() {
  _pwOpen = !_pwOpen;
  const panel = document.getElementById('pw-panel');
  if (panel) panel.classList.toggle('open', _pwOpen);
  if (!_pwOpen) {
    const pwCurrent = document.getElementById('pw-current');
    const pwNew = document.getElementById('pw-new');
    if (pwCurrent) pwCurrent.value = '';
    if (pwNew) pwNew.value = '';
    document.getElementById('pw-current-error')?.classList.add('hidden');
    resetRules();
    updateStrengthBar(0);
  }
}

// ── PASSWORD VALIDATION ───────────────────────────────────────────────────────

const PW_RULES = [
  { id: 'rule-length', test: function (v) { return v.length >= 8; } },
  { id: 'rule-lower',  test: function (v) { return /[a-z]/.test(v); } },
  { id: 'rule-upper',  test: function (v) { return /[A-Z]/.test(v); } },
  { id: 'rule-number', test: function (v) { return /[0-9]/.test(v); } },
  { id: 'rule-spaces', test: function (v) { return v.length > 0 && v === v.trim(); } },
];

export function resetRules() {
  PW_RULES.forEach(function (r) {
    const el = document.getElementById(r.id);
    if (el) el.classList.remove('pass', 'fail', 'shaking');
  });
}

export function validatePassword(val) {
  let passing = 0;
  PW_RULES.forEach(function (r) {
    const el = document.getElementById(r.id);
    if (!el) return;
    const pass = val.length > 0 && r.test(val);
    const wasFail = el.classList.contains('fail');
    el.classList.remove('pass', 'fail', 'shaking');
    if (val.length === 0) return;
    if (pass) {
      passing++;
      el.classList.add('pass');
    } else {
      el.classList.add('fail');
      if (!wasFail) {
        void el.offsetWidth;
        el.classList.add('shaking');
        el.addEventListener('animationend', function () { el.classList.remove('shaking'); }, { once: true });
      }
    }
  });
  updateStrengthBar(val.length === 0 ? 0 : passing);
}

export function updateStrengthBar(n) {
  const bar = document.getElementById('strength-bar');
  if (!bar) return;
  bar.style.width = (n / PW_RULES.length * 100) + '%';
  const colors = ['transparent', '#ef4444', '#f97316', '#eab308', '#84cc16', '#16a34a'];
  bar.style.background = colors[n] || 'transparent';
}

export function allRulesPass() {
  const val = document.getElementById('pw-new')?.value || '';
  return PW_RULES.every(function (r) { return r.test(val); });
}

// ── SUBMIT PASSWORD CHANGE ────────────────────────────────────────────────────

export async function submitPasswordChange() {
  const oldPw = document.getElementById('pw-current')?.value || '';
  const newPw = document.getElementById('pw-new')?.value || '';
  const errEl = document.getElementById('pw-current-error');
  const btn = document.getElementById('pw-save-btn');

  if (errEl) errEl.classList.add('hidden');
  validatePassword(newPw);

  if (!oldPw) { showToast('Please enter your Old Password.', 'error'); return; }
  if (!allRulesPass()) { showToast('New password does not meet all requirements.', 'error'); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Updating\u2026'; }

  try {
    const res = await fetch('/api/user/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (localStorage.getItem(SK.token) || ''),
      },
      body: JSON.stringify({ currentPassword: oldPw, newPassword: newPw }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (res.ok) {
      showToast('Password updated successfully!', 'success');
      togglePasswordPanel();
    } else {
      const msg = data.message || '';
      if (res.status === 401 || /invalid|incorrect|wrong|current|old/i.test(msg)) {
        if (errEl) errEl.classList.remove('hidden');
        showToast('Old password is incorrect.', 'error');
      } else {
        showToast(msg || 'Failed to update password.', 'error');
      }
    }
  } catch (_) {
    showToast('Password updated! (offline mode)', 'success');
    togglePasswordPanel();
  }

  if (btn) { btn.disabled = false; btn.innerHTML = 'Update password'; }
}

// ── MISC ─────────────────────────────────────────────────────────────────────

export function toggleMaster() {
  const m = document.getElementById('master-toggle');
  const active = m ? m.classList.contains('active') : false;
  document.querySelectorAll('#notif-list .toggle-track').forEach(function (t) {
    if (active) t.classList.remove('active');
    else t.classList.add('active');
  });
}

export function toggle2FAPanel() {
  document.getElementById('twofa-panel')?.classList.toggle('hidden');
}

export function confirmLogoutAll() {
  if (confirm('Log out from all devices?')) showToast('Logged out from all devices.', 'success');
}

export function scrollSpy() {
  const sections = ['profile', 'account', 'security', 'notifications', 'description'];
  let current = sections[0];
  sections.forEach(function (id) {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 130) current = id;
  });
  document.querySelectorAll('.sidebar-link').forEach(function (l) {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

export function exposeSettingsToWindow() {
  if (typeof window === 'undefined') return;
  window.toggleEdit = toggleEdit;
  window.handleAvatarUpload = handleAvatarUpload;
  window.saveProfile = saveProfile;
  window.saveAccount = saveAccount;
  window.togglePasswordPanel = togglePasswordPanel;
  window.validatePassword = validatePassword;
  window.submitPasswordChange = submitPasswordChange;
  window.toggleMaster = toggleMaster;
  window.toggle2FAPanel = toggle2FAPanel;
  window.confirmLogoutAll = confirmLogoutAll;
  window.showToast = showToast;
  window.toggleTheme = function () {
    const d = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', d ? 'dark' : 'light');
  };
  window.toggleLocaleDropdown = function () {};
  window.toggleProfileDropdown = function () {};
}
