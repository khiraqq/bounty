import { useRouter } from 'next/router';
import { AUTH_FORM_BUTTON_CLASS, CTA_BUTTON_STYLE } from '../authStyles';

export default function SellerHero() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/seller/onboarding');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-black">Start selling on Bounty</h1>
          <p className="mt-3 text-muted-foreground max-w-lg">Reach millions of verified gamers. Quick verification and secure payouts.</p>
          <div className="mt-6">
            <button onClick={handleStart} className={`${AUTH_FORM_BUTTON_CLASS} inline-flex items-center gap-2`} style={CTA_BUTTON_STYLE}>
              Start Selling
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-72 h-56 rounded-2xl bg-card border border-border flex items-center justify-center">
          <div className="text-6xl">🎮</div>
        </div>
      </div>
    </section>
  );
}
