import { AnimatePresence, motion } from 'framer-motion';
import {
  AUTH_FORM_BUTTON_CLASS,
  CAPTCHA_INPUT_CLASS,
  CTA_BUTTON_STYLE,
  INPUT_FIELD_CLASS,
} from './authStyles';

const CAPTCHA_WIDTH = 150;
const CAPTCHA_HEIGHT = 50;
const CAPTCHA_BUTTON_CLASS =
  'relative rounded-md border border-input bg-muted/50 overflow-hidden flex-shrink-0 text-foreground cursor-pointer hover:border-muted-foreground/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const seededValue = (code) =>
  code
    .split('')
    .reduce((acc, ch, idx) => acc + (ch.charCodeAt(0) + idx * 11), 0);

const randomBetween = (min, max, value) => min + (max - min) * value;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function CaptchaBox({ code, onRefresh, onChange, value }) {
  const seed = seededValue(code);
  const jitter = (offset) => {
    const result = Math.sin((seed + offset) * 0.37);
    return (result + 1) / 2;
  };

  const horizontalGrid = Array.from({ length: 3 }, (_, idx) => {
    const y = randomBetween(8, CAPTCHA_HEIGHT - 8, jitter(10 + idx));
    return { x1: 6, x2: CAPTCHA_WIDTH - 6, y1: y, y2: y };
  });
  const verticalGrid = Array.from({ length: 3 }, (_, idx) => {
    const x = randomBetween(8, CAPTCHA_WIDTH - 8, jitter(20 + idx));
    return { x1: x, x2: x, y1: 6, y2: CAPTCHA_HEIGHT - 6 };
  });
  const noiseDots = Array.from({ length: 15 }, (_, idx) => ({
    cx: randomBetween(6, CAPTCHA_WIDTH - 6, jitter(30 + idx)),
    cy: randomBetween(6, CAPTCHA_HEIGHT - 6, jitter(40 + idx)),
    r: randomBetween(0.6, 1.4, jitter(50 + idx)),
    opacity: randomBetween(0.08, 0.18, jitter(60 + idx)),
  }));

  const charTransforms = code.split('').map((char, idx) => {
    const xBase = 28 + idx * 30;
    const rotation = randomBetween(-14, 14, jitter(70 + idx));
    const x = xBase + randomBetween(-5, 5, jitter(80 + idx)) - idx * 2;
    const y = 32 + randomBetween(-4, 4, jitter(90 + idx));
    return { char, rotation, x, y };
  });

  return (
    <div className="flex flex-nowrap gap-3">
      <button
        type="button"
        className={CAPTCHA_BUTTON_CLASS}
        style={{ width: CAPTCHA_WIDTH, height: CAPTCHA_HEIGHT }}
        onClick={onRefresh}
        title="Click to refresh captcha"
      >
        <svg width={CAPTCHA_WIDTH} height={CAPTCHA_HEIGHT} viewBox={`0 0 ${CAPTCHA_WIDTH} ${CAPTCHA_HEIGHT}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0.5"
            y="0.5"
            width={CAPTCHA_WIDTH - 1}
            height={CAPTCHA_HEIGHT - 1}
            rx="10"
            fill="#101010"
            stroke="rgba(255,255,255,0.08)"
          />
          {horizontalGrid.map((line, idx) => (
            <line
              key={`hgrid-${idx}`}
              {...line}
              stroke="#ffffff"
              strokeWidth="0.35"
              strokeOpacity="0.12"
            />
          ))}
          {verticalGrid.map((line, idx) => (
            <line
              key={`vgrid-${idx}`}
              {...line}
              stroke="#ffffff"
              strokeWidth="0.35"
              strokeOpacity="0.12"
            />
          ))}
          {noiseDots.map((dot, idx) => (
            <circle key={`dot-${idx}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#ffffff" opacity={dot.opacity} />
          ))}
          {charTransforms.map(({ char, rotation, x, y }, idx) => (
            <text
              key={`char-${idx}`}
              x={x}
              y={y}
              fill="#f5f5f5"
              fontSize="24"
              fontFamily="'Doto', 'Inter', sans-serif"
              transform={`rotate(${rotation} ${x} ${y})`}
              style={{ letterSpacing: '-0.05em', fontWeight: 700 }}
            >
              {char}
            </text>
          ))}
        </svg>
        <div className="absolute bottom-0.5 right-0.5 p-1 rounded opacity-60 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 text-foreground"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </div>
      </button>
      <input
        id="auth-captcha"
        type="text"
        placeholder="Enter code"
        maxLength={4}
        value={value}
        onChange={onChange}
        className={INPUT_FIELD_CLASS}
        style={{ height: 50 }}
      />
    </div>
  );
}

export default function AuthModal({
  open,
  mode,
  onClose,
  onSwitch,
  captchaCode,
  captchaInput,
  onCaptchaChange,
  refreshCaptcha,
  isCaptchaValid,
}) {
  const isSignup = mode === 'signup';
  const heading = isSignup ? 'Create an account' : 'Welcome back';
  const subtitle = isSignup
    ? 'Enter your details to create a new account'
    : 'Enter your username and password to access your account';
  const switchLabel = isSignup ? 'Have an account?' : 'No account?';
  const switchAction = isSignup ? 'Log in' : 'Sign up';
  const usernameId = isSignup ? 'signup-username' : 'login-username';
  const passwordId = isSignup ? 'signup-password' : 'login-password';
  const formId = `${mode}-form`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-7 text-white shadow-[0_0_45px_rgba(255,255,255,0.08)]"
            initial={{ scale: 0.98, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
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
            <h2 className="text-3xl font-black text-center" style={{ fontFamily: "'Doto', sans-serif", fontWeight: 900 }}>
              {heading}
            </h2>
            <p className="text-center text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>{subtitle}</p>
            <p id="login-error" className={`hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2${isSignup ? ' hidden' : ''}`} />
            <p id="signup-error" className={`hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2${isSignup ? '' : ' hidden'}`} />
            <form id={formId} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">Username</label>
                <input
                  id={usernameId}
                  type="text"
                  placeholder="Your username"
                  autoComplete="username"
                  className={INPUT_FIELD_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">Password</label>
                <input
                  id={passwordId}
                  type="password"
                  placeholder="Your password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className={INPUT_FIELD_CLASS}
                />
              </div>
              {isSignup && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">Confirm password</label>
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
            <div className="mt-4 text-center text-xs flex items-center justify-center gap-1">
              <span className="text-muted-foreground">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => onSwitch(isSignup ? 'login' : 'signup')}
                className="text-white font-bold underline underline-offset-4"
              >
                {isSignup ? 'Login' : 'Sign up'}
              </button>
            </div>
            <div className="auth-divider mt-5">
              <div className="line" />
              <span>or continue with</span>
              <div className="line" />
            </div>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

