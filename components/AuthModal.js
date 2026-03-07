import {
  AUTH_FORM_BUTTON_CLASS,
  CAPTCHA_INPUT_CLASS,
  CTA_BUTTON_STYLE,
  INPUT_FIELD_CLASS,
} from './authStyles';

function CaptchaBox({ code, onRefresh, onChange, value }) {
  const seed = code.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const horizontalLines = Array.from({ length: 6 }, (_, idx) => ({
    x1: 6,
    y1: 6 + idx * 8,
    x2: 122,
    y2: 6 + idx * 8,
  }));
  const verticalLines = Array.from({ length: 6 }, (_, idx) => ({
    x1: 6 + idx * 18,
    y1: 6,
    x2: 6 + idx * 18,
    y2: 44,
  }));
  const dots = Array.from({ length: 18 }, (_, idx) => {
    const rand = Math.abs(Math.sin((seed + idx * 13) * 0.73));
    return {
      cx: 128 * rand,
      cy: 52 * Math.abs(Math.cos((seed + idx * 22) * 0.19)),
      r: 1 + rand * 1.2,
      opacity: 0.04 + rand * 0.08,
    };
  });
  const charTransforms = code.split('').map((char, idx) => {
    const rotation = ((seed + idx * 17) % 31) - 15;
    const x = 18 + idx * 30 + (((seed + idx * 11) % 10) - 5);
    const y = 32 + (((seed + idx * 13) % 7) - 3);
    return { char, rotation, x, y };
  });

  return (
    <div className="flex flex-nowrap gap-3">
      <div
        className="relative flex h-[50px] w-32 items-center justify-center rounded-xl border border-white/10 bg-[#131313]"
        style={{ backgroundSize: '120% 120%', backgroundPosition: 'center' }}
      >
        <svg width="128" height="52" viewBox="0 0 128 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="127" height="51" rx="12" fill="#101010" stroke="rgba(255,255,255,0.05)" />
          {horizontalLines.map((line, idx) => (
            <line key={`h-${idx}`} {...line} stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.08" />
          ))}
          {verticalLines.map((line, idx) => (
            <line key={`v-${idx}`} {...line} stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.08" />
          ))}
          {dots.map((dot, idx) => (
            <circle key={`dot-${idx}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#ffffff" opacity={dot.opacity} />
          ))}
          {charTransforms.map(({ char, rotation, x, y }, idx) => (
            <text
              key={`char-${idx}`}
              x={x}
              y={y}
              fill="#ffffff"
              fontSize="22"
              fontFamily="'Doto', monospace"
              transform={`rotate(${rotation} ${x} ${y})`}
              style={{ letterSpacing: '0.2em' }}
            >
              {char}
            </text>
          ))}
        </svg>
        <button
          type="button"
          className="absolute bottom-1 right-1 rounded-full bg-white/10 p-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-white/20"
          onClick={onRefresh}
          aria-label="Refresh captcha"
          style={{ height: '32px', width: '32px' }}
        >
          ↻
        </button>
      </div>
      <input
        id="auth-captcha"
        type="text"
        placeholder="Enter code"
        maxLength={3}
        value={value}
        onChange={onChange}
        className={CAPTCHA_INPUT_CLASS}
        style={{ height: 50 }}
      />
    </div>
  );
}

export default function AuthModal({
  open,
  mode,
  onClose,
  onSubmit,
  onSwitch,
  captchaCode,
  captchaInput,
  onCaptchaChange,
  refreshCaptcha,
  isCaptchaValid,
}) {
  const isSignup = mode === 'signup';
  const heading = isSignup ? 'Create an account' : 'Log In';
  const subtitle = isSignup
    ? 'Enter your details to create a new account'
    : 'Sign in to your Bounty account';
  const switchLabel = isSignup ? 'Have an account?' : 'No account?';
  const switchAction = isSignup ? 'Log in' : 'Sign up';

  const usernameId = isSignup ? 'signup-username' : 'login-username';
  const passwordId = isSignup ? 'signup-password' : 'login-password';
  const formId = `${mode}-form`;

  const showLoginError = mode === 'login';
  const showSignupError = mode === 'signup';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-7 text-white shadow-[0_0_45px_rgba(255,255,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2
          className="text-3xl font-black text-center"
          style={{ fontFamily: "'Doto', sans-serif", fontWeight: 900 }}
        >
          {heading}
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">{subtitle}</p>
        <p id="login-error" className={`hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2${showLoginError ? '' : ' hidden'}`} />
        <p id="signup-error" className={`hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2${showSignupError ? '' : ' hidden'}`} />
        <form id={formId} className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">
              Username
            </label>
            <input
              id={usernameId}
              type="text"
              placeholder="Your username"
              autoComplete="username"
              className={INPUT_FIELD_CLASS}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              className={INPUT_FIELD_CLASS}
            />
          </div>
          {isSignup && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                className={INPUT_FIELD_CLASS}
              />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verify you're human</p>
            <CaptchaBox
              code={captchaCode}
              value={captchaInput}
              onChange={onCaptchaChange}
              onRefresh={refreshCaptcha}
            />
          </div>
          <button
            id={`${mode}-submit-btn`}
            type="submit"
            data-slot="button"
            className={AUTH_FORM_BUTTON_CLASS}
            style={CTA_BUTTON_STYLE}
            disabled={!isCaptchaValid}
          >
            {heading === 'Log In' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {switchLabel}{' '}
          <button
            type="button"
            onClick={() => onSwitch(isSignup ? 'login' : 'signup')}
            className="text-foreground underline font-medium hover:opacity-70"
          >
            {switchAction}
          </button>
        </div>
        <div className="auth-divider mt-5"><div className="line" /><span>or continue with</span><div className="line" /></div>
        <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>
        <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
          <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
          </svg>
          Continue with Discord
        </button>
      </div>
    </div>
  );
}
