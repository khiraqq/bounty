import { motion } from 'framer-motion';

const WHY_CARDS = [
  {
    emoji: '⚡',
    bg: '#3B2FCC',
    title: 'Fast & secure verification',
    desc: 'Get verified quickly and safely so you can start selling with confidence.',
  },
  {
    emoji: '⏳',
    bg: '#9B7240',
    title: 'List your offers in minutes',
    desc: 'Once verified, it takes just a few clicks to create your listings.',
  },
  {
    emoji: '🛡️',
    bg: '#7C3AED',
    title: '100% payment protection',
    desc: 'TradeShield guarantees no chargebacks or payment fraud.',
  },
  {
    emoji: '💸',
    bg: '#2B7A40',
    title: 'Fast payouts',
    desc: 'Withdraw earnings to crypto, bank, PayPal, and more.',
  },
];

const TOOLS = [
  {
    bg: '#3B82F6',
    icon: '⚙️',
    title: 'Seller API',
    desc: 'Automate listings, pricing, and delivery with zero manual work.',
  },
  {
    bg: '#22C55E',
    icon: '⬆️',
    title: 'Bulk Uploads',
    desc: 'Upload hundreds of offers in seconds—import, edit, publish fast.',
  },
  {
    bg: '#14B8A6',
    icon: '🚀',
    title: 'Delivery Flexibility',
    desc: 'Deliver instantly or via chat with secure, real-time handovers.',
  },
  {
    bg: '#F59E0B',
    icon: '⭐',
    title: 'Seller Growth Tools',
    desc: 'Boost visibility and attract more buyers with featured listings.',
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
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg"
        style={{ background: card.bg }}
      >
        {card.emoji}
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
    <div className="bg-background">
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
