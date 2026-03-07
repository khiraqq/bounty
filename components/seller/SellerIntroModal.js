import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTH_FORM_BUTTON_CLASS, CTA_BUTTON_STYLE } from '../authStyles';

const EXPECTATIONS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Professional conduct',
    desc: 'Be clear, polite and honest in listings and chats.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: 'Reliable delivery',
    desc: 'Deliver on time. Mark the order as complete only after successful delivery.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: 'Platform integrity',
    desc: 'Keep all communication and payments on Bounty for safety.',
  },
];

const REMINDERS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
    title: 'Refunds',
    desc: 'Buyers can get refunds for false, incomplete or late deliveries.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    title: 'Account suspension',
    desc: 'Repeated or serious violations can lead to temporary or permanent suspension.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: 'Payout holds',
    desc: 'Funds may be held during confirmed fraud or security investigations.',
  },
];

function InfoRow({ icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
      className="flex items-start gap-3 bg-secondary/60 border border-border rounded-xl px-4 py-3"
    >
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function SellerIntroModal({ show, onBack, onContinue }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleBack}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-7 pointer-events-auto overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="flex items-center gap-3 mb-1">
                <span className="text-2xl">ðŸ›¡ï¸</span>
                <h2 className="text-xl font-black text-foreground">Before you start selling</h2>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Here's what we expect from every seller and what to know before starting verification, which only takes a few minutes.
              </motion.p>

              <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className="text-sm font-bold text-foreground mb-3">
                What we expect from sellers
              </motion.h3>
              <div className="space-y-2 mb-5">
                {EXPECTATIONS.map((item, i) => (
                  <InfoRow key={item.title} {...item} index={i} />
                ))}
              </div>

              <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-bold text-foreground mb-3">
                What to keep in mind
              </motion.h3>
              <div className="space-y-2 mb-8">
                {REMINDERS.map((item, i) => (
                  <InfoRow key={item.title} {...item} index={i + 3} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between gap-3"
              >
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={onContinue}
                  className={`${AUTH_FORM_BUTTON_CLASS} flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold w-auto`}
                  style={CTA_BUTTON_STYLE}
                >
                  Continue to verification
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

