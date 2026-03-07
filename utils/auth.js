// utils/auth.js
// All original script.js logic preserved.
// Only change: fetch() URLs now point to /api/* instead of Xano.
// No JSX in this file — pure JS only — so formatters can never break it.

export const STORAGE_KEYS = {
  theme: 'theme',
  authenticatedUser: 'authenticated_username',
  email: 'authenticated_email',
  authMethod: 'auth_method',
  token: 'bounty_token',
  profileAvatar: 'profile_avatar_data_url',
};

export function initApp() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  document.documentElement.classList.toggle('dark', savedTheme !== 'light');
  if (window.lucide) window.lucide.createIcons();
  setupEventListeners();
  restoreAuthState();
  updateThemeIcon();
  applyStoredAvatar();
}

// ── THEME ────────────────────────────────────────────────────────────────────

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
  updateThemeIcon();
  updateAvatarTheme();
}

export function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>';
  } else {
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' +
      '<path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/>' +
      '<path d="M2 12h2"/><path d="M20 12h2"/>' +
      '<path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>';
  }
}

export function updateAvatarTheme() { applyStoredAvatar(); }

// ── LOCALE ───────────────────────────────────────────────────────────────────

export function toggleLocaleDropdown() {
  document.getElementById('locale-panel')?.classList.toggle('hidden');
}

export function saveLocaleSettings() {
  const langSel = document.getElementById('language-select');
  const curSel = document.getElementById('currency-select');
  const langTxt = document.getElementById('current-language');
  const curTxt = document.getElementById('current-currency');
  if (langSel && langTxt) langTxt.textContent = langSel.options[langSel.selectedIndex]?.text.split(' ')[0] || 'English';
  if (curSel && curTxt) curTxt.textContent = curSel.options[curSel.selectedIndex]?.text || 'USD - $';
  document.getElementById('locale-panel')?.classList.add('hidden');
}

// ── MODALS ───────────────────────────────────────────────────────────────────

export function openModal(view) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  switchView(view || 'login');
}

export function closeModal() {
  document.getElementById('modal-overlay')?.classList.add('hidden');
  clearAuthErrors();
}

export function handleOverlayClick(event) {
  const overlay = document.getElementById('modal-overlay');
  const backdrop = document.getElementById('modal-backdrop');
  if (event && (event.target === overlay || event.target === backdrop)) closeModal();
}

export function switchView(view) {
  const loginView = document.getElementById('login-modal');
  const signupView = document.getElementById('signup-modal');
  if (!loginView || !signupView) return;
  if (view === 'signup') {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
  } else {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
  }
  clearAuthErrors();
  clearAuthForms();
}

// ── AUTH: LOGIN ───────────────────────────────────────────────────────────────

export async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('login-username')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  if (!username || !password) { showAuthError('login', 'Please fill in all fields.'); return; }
  setAuthBtnLoading('login-submit-btn', true);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError('login', data.message || 'Invalid username or password.'); return; }
    persistSession(data, 'password');
    closeModal();
    window.location.reload();
  } catch (_) {
    persistSessionLocal(username, '', 'password');
    closeModal();
  } finally {
    setAuthBtnLoading('login-submit-btn', false);
  }
}

// ── AUTH: SIGNUP ──────────────────────────────────────────────────────────────

export async function handleSignupSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('signup-username')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirmPassword = document.getElementById('signup-confirm-password')?.value;
  if (!username || !password || !confirmPassword) {
    showAuthError('signup', 'Please fill in all fields.'); return;
  }
  if (username.length < 3) { showAuthError('signup', 'Username must be at least 3 characters.'); return; }
  if (password !== confirmPassword) { showAuthError('signup', 'Passwords do not match.'); return; }
  setAuthBtnLoading('signup-submit-btn', true);
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError('signup', data.message || 'Could not create account.'); return; }
    persistSession(data, 'password');
    closeModal();
    window.location.reload();
  } catch (_) {
    persistSessionLocal(username, '', 'password');
    closeModal();
  } finally {
    setAuthBtnLoading('signup-submit-btn', false);
  }
}

export function handleGoogleOAuth() { window.location.href = '/api/auth/google'; }
export function handleDiscordOAuth() { window.location.href = '/api/auth/discord'; }

// ── SESSION ───────────────────────────────────────────────────────────────────

export function persistSession(data, method) {
  const { token, user } = data;
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  if (user && user.username) localStorage.setItem(STORAGE_KEYS.authenticatedUser, user.username);
  if (user && user.email) localStorage.setItem(STORAGE_KEYS.email, user.email);
  localStorage.setItem(STORAGE_KEYS.authMethod, method);
  syncAuthUI(true, (user && user.username) || '');
}

export function persistSessionLocal(username, email, method) {
  localStorage.setItem(STORAGE_KEYS.authenticatedUser, username);
  if (email) localStorage.setItem(STORAGE_KEYS.email, email);
  localStorage.setItem(STORAGE_KEYS.authMethod, method);
  syncAuthUI(true, username);
}

export function setAuthenticatedUser(username, email, method) {
  persistSessionLocal(username, email, method || 'password');
}

export function restoreAuthState() {
  const username = localStorage.getItem(STORAGE_KEYS.authenticatedUser) || '';
  if (!username) { syncAuthUI(false); return; }
  syncAuthUI(true, username);
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.authenticatedUser);
  localStorage.removeItem(STORAGE_KEYS.email);
  localStorage.removeItem(STORAGE_KEYS.authMethod);
  fetch('/api/auth/logout', { method: 'POST' }).catch(function () {});
  syncAuthUI(false);
  window.location.href = '/';
}

// ── AVATAR ───────────────────────────────────────────────────────────────────

export function applyAvatarToNode(node, imageData) {
  if (!node) return;
  const isDark = document.documentElement.classList.contains('dark');
  const svgs = node.querySelectorAll('svg');
  if (imageData) {
    node.style.backgroundImage = 'url(' + imageData + ')';
    node.style.backgroundSize = 'cover';
    node.style.backgroundPosition = 'center';
    node.style.backgroundRepeat = 'no-repeat';
    node.style.backgroundColor = 'transparent';
    node.style.color = 'transparent';
    node.style.border = isDark ? '1px solid #27272a' : '1px solid #d1d5db';
    svgs.forEach(function (svg) { svg.style.display = 'none'; });
    return;
  }
  node.style.backgroundImage = '';
  node.style.backgroundSize = '';
  node.style.backgroundPosition = '';
  node.style.backgroundRepeat = '';
  node.style.backgroundColor = isDark ? '#0a0a0a' : '#e5e7eb';
  node.style.color = isDark ? '#ffffff' : '#1f2937';
  node.style.border = isDark ? '1px solid #27272a' : '1px solid #d1d5db';
  svgs.forEach(function (svg) { svg.style.display = ''; });
}

export function applyStoredAvatar() {
  const imageData = localStorage.getItem(STORAGE_KEYS.profileAvatar) || '';
  applyAvatarToNode(document.getElementById('profile-avatar'), imageData);
  applyAvatarToNode(document.getElementById('dropdown-avatar'), imageData);
}

// ── PROFILE DROPDOWN ─────────────────────────────────────────────────────────

export function toggleProfileDropdown() {
  document.getElementById('profile-dropdown')?.classList.toggle('hidden');
}

export function closeProfileDropdown() {
  document.getElementById('profile-dropdown')?.classList.add('hidden');
}

export function updateDropdownUser(username) {
  const el = document.getElementById('dropdown-username');
  if (el) el.textContent = username;
  applyStoredAvatar();
}

// ── SYNC AUTH UI ──────────────────────────────────────────────────────────────

export function syncAuthUI(isAuthenticated, username) {
  username = username || '';
  const loginButton = document.getElementById('login-button');
  const profileArea = document.getElementById('profile-area');
  const profileButton = document.getElementById('profile-button');
  if (!loginButton || !profileArea) return;
  if (isAuthenticated) {
    loginButton.classList.add('hidden');
    profileArea.classList.remove('hidden');
    profileArea.classList.add('flex');
    if (profileButton) {
      profileButton.setAttribute('title', username);
      profileButton.setAttribute('aria-label', 'Open profile for ' + username);
    }
    updateAvatarTheme();
    updateDropdownUser(username);
    return;
  }
  loginButton.classList.remove('hidden');
  profileArea.classList.add('hidden');
  profileArea.classList.remove('flex');
  if (profileButton) {
    profileButton.removeAttribute('title');
    profileButton.setAttribute('aria-label', 'Open profile');
  }
}

// ── NOTIFICATION BADGE ───────────────────────────────────────────────────────

export function setNotificationCount(count) {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ── UI HELPERS ───────────────────────────────────────────────────────────────

export function setAuthBtnLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="auth-spinner"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

export function clearAuthForms() {
  document.getElementById('login-form')?.reset();
  document.getElementById('signup-form')?.reset();
}

export function clearAuthErrors() {
  ['login-error', 'signup-error'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}

export function showAuthError(view, message) {
  clearAuthErrors();
  const id = view === 'signup' ? 'signup-error' : 'login-error';
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

export function setupEventListeners() {
  const lf = document.getElementById('login-form');
  const sf = document.getElementById('signup-form');
  if (lf && !lf.dataset.bound) {
    lf.addEventListener('submit', handleLoginSubmit);
    lf.dataset.bound = 'true';
  }
  if (sf && !sf.dataset.bound) {
    sf.addEventListener('submit', handleSignupSubmit);
    sf.dataset.bound = 'true';
  }
  document.addEventListener('click', function (e) {
    const localeDropdown = document.getElementById('locale-dropdown');
    const localePanel = document.getElementById('locale-panel');
    if (localeDropdown && localePanel && !localeDropdown.contains(e.target)) {
      localePanel.classList.add('hidden');
    }
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileButton = document.getElementById('profile-button');
    if (
      profileDropdown &&
      profileButton &&
      !profileDropdown.contains(e.target) &&
      !profileButton.contains(e.target)
    ) {
      profileDropdown.classList.add('hidden');
    }
  });
}

// ── EXPOSE TO WINDOW (so onclick= attrs work) ────────────────────────────────

export function exposeToWindow() {
  if (typeof window === 'undefined') return;
  window.toggleTheme = toggleTheme;
  window.updateThemeIcon = updateThemeIcon;
  window.updateAvatarTheme = updateAvatarTheme;
  window.toggleLocaleDropdown = toggleLocaleDropdown;
  window.saveLocaleSettings = saveLocaleSettings;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.handleOverlayClick = handleOverlayClick;
  window.switchView = switchView;
  window.handleLoginSubmit = handleLoginSubmit;
  window.handleSignupSubmit = handleSignupSubmit;
  window.handleDiscordOAuth = handleDiscordOAuth;
  window.handleGoogleOAuth = handleGoogleOAuth;
  window.setAuthenticatedUser = setAuthenticatedUser;
  window.restoreAuthState = restoreAuthState;
  window.logout = logout;
  window.applyStoredAvatar = applyStoredAvatar;
  window.setNotificationCount = setNotificationCount;
  window.syncAuthUI = syncAuthUI;
  window.toggleProfileDropdown = toggleProfileDropdown;
  window.closeProfileDropdown = closeProfileDropdown;
}
