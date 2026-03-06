import { motion } from "framer-motion";

function ShieldLightningIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4L10 8C10 8 10 20 10 28C10 36 17 43 24 44C31 43 38 36 38 28C38 20 38 8 38 8L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.05)"
      />
      <path
        d="M21 14L25 24H18L26 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 7H33L24 18L15 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 41H33L24 30L15 41Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12H29L24 22L19 12Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M19 36H29L24 26L19 36Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M24 18V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoneybagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 14C16 12 18 10 20 10H28C30 10 32 12 32 14C32 16 30 18 28 18H20C18 18 16 16 16 14Z"
        fill="rgba(255,255,255,0.1)"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 18H34L30 40H18L14 18Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 24H28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="26" cy="26" r="1.5" fill="currentColor" />
      <circle cx="22" cy="26" r="1.5" fill="currentColor" />
      <path
        d="M24 28V34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="26" y="32" width="6" height="6" rx="2" fill="rgba(255,255,255,0.1)" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="16"
        width="28"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="rgba(255,255,255,0.05)"
      />
      <path d="M10 24H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 32H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="32" y="22" width="6" height="8" rx="2" fill="currentColor" />
      <path d="M28 20L32 16L38 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const WHY_CARDS = [
  {
    bg: "#1F1232",
    icon: <ShieldLightningIcon />,
    title: "Fast & secure verification",
    desc: "Get verified quickly and safely so you can start selling with confidence.",
  },
  {
    bg: "#3A2948",
    icon: <HourglassIcon />,
    title: "List your offers in minutes",
    desc: "Once verified, it takes just a few clicks to create your listings.",
  },
  {
    bg: "#261E3A",
    icon: <MoneybagIcon />,
    title: "100% payment protection",
    desc: "TradeShield guarantees no chargebacks or payment fraud.",
  },
  {
    bg: "#1E2F2D",
    icon: <WalletIcon />,
    title: "Fast payouts",
    desc: "Withdraw earnings to crypto, bank, PayPal, and more.",
  },
];

const TOOLS = [
  {
    bg: "#3B82F6",
    icon: "⚙️",
    title: "Seller API",
    desc: "Automate listings, pricing, and delivery with zero manual work.",
  },
  {
    bg: "#22C55E",
    icon: "⬆️",
    title: "Bulk Uploads",
    desc: "Upload hundreds of offers in seconds—import, edit, publish fast.",
  },
  {
    bg: "#14B8A6",
    icon: "🚀",
    title: "Delivery Flexibility",
    desc: "Deliver instantly or via chat with secure, real-time handovers.",
  },
  {
    bg: "#F59E0B",
    icon: "⭐",
    title: "Seller Growth Tools",
    desc: "Boost visibility and attract more buyers with featured listings.",
  },
];

function WhyCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: card.bg,
          boxShadow: "0 8px 20px rgba(15,15,15,0.35)",
        }}
      >
        <div className="text-2xl text-white">{card.icon}</div>
      </div>
      <h3 className="font-bold text-foreground text-base mb-2">{card.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{card.desc}</p>
      <button className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
        Learn how →
      </button>
    </motion.div>
  );
}

function ToolCard({ tool, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="flex flex-col items-center text-center p-8"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-md"
        style={{ background: tool.bg }}
      >
        {tool.icon}
      </div>
      <h4 className="font-bold text-foreground text-base mb-2">{tool.title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">{tool.desc}</p>
    </motion.div>
  );
}

export default function SellerFeatures() {
  return (
    <div className="bg-[hsl(var(--background))]">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-black text-center text-foreground mb-12"
        >
          Why Bounty?
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHY_CARDS.map((card, i) => (
            <WhyCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-black text-center text-foreground mb-2"
        >
          Tools to power your next sale
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground text-center mb-12"
        >
          Everything you need to run a professional store on Bounty.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-2xl divide-x divide-y divide-border overflow-hidden bg-card">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.title} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
