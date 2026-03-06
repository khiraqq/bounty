import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SellerHero from '../components/seller/SellerHero';
import SellerFeatures from '../components/seller/SellerFeatures';
import SellerIntroModal from '../components/seller/SellerIntroModal';

export default function BecomeASeller() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);

  const handleStartSelling = () => setShowIntro(true);
  const handleBack = () => setShowIntro(false);
  const handleContinue = () => router.push('/dashboard');

  return (
    <>
      <Head>
        <title>Become a Seller — Bounty</title>
        <meta name="description" content="Start selling gaming goods on Bounty and reach millions of verified gamers worldwide." />
      </Head>

      <SellerHero onStartSelling={handleStartSelling} />
      <SellerFeatures />
      <SellerIntroModal show={showIntro} onBack={handleBack} onContinue={handleContinue} />
    </>
  );
}
