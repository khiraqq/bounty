import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AUTH_FORM_BUTTON_CLASS, CTA_BUTTON_STYLE } from '../../components/authStyles';

export default function SellerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState({});
  const [experience, setExperience] = useState('new');
  const [links, setLinks] = useState('');

  const toggleCategory = (key) => {
    setCategories((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <>
      <Head>
        <title>Seller Onboarding — Bounty</title>
      </Head>
      <div className="mx-auto max-w-2xl p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Before you start selling</h1>
            <p className="text-sm text-muted-foreground">Please review the checklist below before starting verification.</p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>Have a working delivery method for your product.</li>
              <li>Be prepared to verify your identity.</li>
              <li>Understand Bounty's rules and payouts.</li>
            </ul>
            <div className="flex items-center justify-between">
              <button onClick={() => router.push('/')} className="px-4 py-2 rounded-md text-sm text-muted-foreground border border-border">Back</button>
              <button onClick={() => setStep(2)} className={AUTH_FORM_BUTTON_CLASS} style={CTA_BUTTON_STYLE}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Seller Verification</h1>
            <p className="text-sm text-muted-foreground">Select the categories you'll be selling in:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Currency', 'Accounts', 'Items', 'Top Ups', 'Boosting', 'Giftcards'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`text-sm rounded-lg px-3 py-2 border ${categories[c] ? 'border-foreground bg-foreground/5' : 'border-border bg-transparent'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-md text-sm text-muted-foreground border border-border">Back</button>
              <button onClick={() => setStep(3)} className={AUTH_FORM_BUTTON_CLASS} style={CTA_BUTTON_STYLE}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Selling Experience</h1>
            <p className="text-sm text-muted-foreground">Choose the option that best describes you.</p>
            <div className="flex gap-3">
              <label className={`flex-1 p-3 rounded-lg border ${experience === 'new' ? 'border-foreground bg-foreground/5' : 'border-border'}`}>
                <input type="radio" name="experience" checked={experience === 'new'} onChange={() => setExperience('new')} className="mr-2" />
                <span className="font-semibold">New Seller</span>
                <div className="text-sm text-muted-foreground">No prior selling experience on other platforms.</div>
              </label>
              <label className={`flex-1 p-3 rounded-lg border ${experience === 'exp' ? 'border-foreground bg-foreground/5' : 'border-border'}`}>
                <input type="radio" name="experience" checked={experience === 'exp'} onChange={() => setExperience('exp')} className="mr-2" />
                <span className="font-semibold">Experienced Seller</span>
                <div className="text-sm text-muted-foreground">Have sold on other platforms before.</div>
              </label>
            </div>
            {experience === 'exp' && (
              <div>
                <label className="text-sm font-semibold">Previous Platform Links</label>
                <textarea value={links} onChange={(e) => setLinks(e.target.value)} className="mt-2 w-full rounded-md border border-border p-2 text-sm" rows={4} placeholder="Links to your previous seller profiles or listings" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-md text-sm text-muted-foreground border border-border">Back</button>
              <button onClick={() => router.push('/seller/verification')} className={AUTH_FORM_BUTTON_CLASS} style={CTA_BUTTON_STYLE}>Finish</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
