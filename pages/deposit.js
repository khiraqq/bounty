import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { initApp, exposeToWindow } from '../utils/auth';

// â”€â”€ SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function IcoSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IcoMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" /><path d="M20 3v4" /><path d="M22 5h-4" />
    </svg>
  );
}

function IcoClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IcoCard() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function BtcIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path fill="#fff" d="M22.189 14.02c.3-2.006-1.228-3.084-3.318-3.803l.678-2.718-1.655-.412-.66 2.646c-.436-.109-.883-.21-1.328-.312l.664-2.662-1.653-.412-.678 2.717c-.36-.082-.714-.163-1.057-.248l.002-.008-2.283-.57-.44 1.766s1.228.281 1.202.299c.67.167.791.61.771.961l-.772 3.097c.046.012.106.029.171.055l-.174-.043-1.082 4.334c-.082.203-.289.508-.756.392.017.024-1.204-.3-1.204-.3l-.822 1.895 2.155.537c.4.1.793.205 1.18.304l-.685 2.748 1.651.412.678-2.72c.452.122.892.235 1.322.342l-.676 2.707 1.655.412.685-2.742c2.826.535 4.951.319 5.843-2.237.72-2.055-.036-3.24-1.521-4.013 1.082-.25 1.896-1.24 2.113-2.717zm-3.781 5.301c-.512 2.054-3.972.944-5.094.665l.909-3.643c1.122.28 4.72.834 4.185 2.978zm.512-5.33c-.466 1.872-3.349.92-4.285.687l.824-3.304c.936.233 3.95.668 3.461 2.617z" />
    </svg>
  );
}

function LtcIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#BFBBBB" />
      <path fill="#fff" d="M10.457 19.927l-.8 2.988H22.4l.553-2.05H13.97l2.338-8.786-2.11.655-.524 1.957-2.038.634-.524 1.96 2.037-.629z" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// â”€â”€ crypto config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CRYPTOS = {
  btc: { name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin Network', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf2R', priceUSD: 67000 },
  ltc: { name: 'Litecoin', symbol: 'LTC', network: 'Litecoin Network', address: 'LZ9teh9PJPnxMvFxS5pMJxs35aaXZpVGBD', priceUSD: 85 },
};
const PRESETS = [10, 25, 50, 100, 250, 500];

// â”€â”€ all deposit logic (runs client-side only inside useEffect) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initDeposit() {
  var selectedCrypto = null;
  var depositAmount = 0;
  var countdownTimer = null;

  function setStep(n) {
    for (var i = 1; i <= 3; i++) {
      var dot = document.getElementById('s' + i);
      var line = document.getElementById('l' + i);
      if (!dot) continue;
      dot.classList.remove('pending', 'active', 'done');
      if (i < n) {
        dot.classList.add('done');
        dot.innerHTML = '\u2713';
        if (line) line.classList.add('done');
      } else if (i === n) {
        dot.classList.add('active');
        dot.textContent = i;
        if (line) line.classList.remove('done');
      } else {
        dot.classList.add('pending');
        dot.textContent = i;
        if (line) line.classList.remove('done');
      }
    }
  }
  setStep(1);

  window.selectCrypto = function (key) {
    selectedCrypto = key;
    document.querySelectorAll('.crypto-card').forEach(function (c) { c.classList.remove('selected'); });
    var card = document.getElementById('card-' + key);
    if (card) card.classList.add('selected');
    var err = document.getElementById('crypto-error');
    if (err) err.classList.add('hidden');
    setStep(2);
    if (window.onAmountChange) window.onAmountChange();
  };

  window.setPreset = function (val) {
    var input = document.getElementById('amount-input');
    if (input) input.value = val;
    document.querySelectorAll('.preset-btn').forEach(function (b, i) {
      b.classList.toggle('active', PRESETS[i] === val);
    });
    if (window.onAmountChange) window.onAmountChange();
  };

  window.onAmountChange = function () {
    var raw = parseFloat(document.getElementById('amount-input') && document.getElementById('amount-input').value);
    depositAmount = isNaN(raw) ? 0 : raw;
    document.querySelectorAll('.preset-btn').forEach(function (b, i) {
      b.classList.toggle('active', depositAmount === PRESETS[i]);
    });
    var err = document.getElementById('amount-error');
    if (err) err.classList.add('hidden');
    var equivDiv = document.getElementById('crypto-equiv');
    var equivText = document.getElementById('equiv-text');
    if (equivDiv && equivText) {
      if (selectedCrypto && depositAmount > 0) {
        var c = CRYPTOS[selectedCrypto];
        equivText.textContent = '\u2248 ' + (depositAmount / c.priceUSD).toFixed(8) + ' ' + c.symbol;
        equivDiv.classList.remove('hidden');
      } else {
        equivDiv.classList.add('hidden');
      }
    }
  };

  window.generateAddress = async function () {
    var valid = true;
    if (!selectedCrypto) {
      var cerr = document.getElementById('crypto-error');
      if (cerr) cerr.classList.remove('hidden');
      valid = false;
    }
    if (!depositAmount || depositAmount < 1) {
      var aerr = document.getElementById('amount-error');
      if (aerr) aerr.classList.remove('hidden');
      valid = false;
    }
    if (!valid) return;

    var c = CRYPTOS[selectedCrypto];
    var cryptoAmt = (depositAmount / c.priceUSD).toFixed(8);
    var now = new Date();
    var expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    var tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Unknown';
    var parts = tz.split('/');
    var loc = parts.length > 1 ? parts[parts.length - 1].replace(/_/g, ' ') + ', ' + parts[0] : parts[0];

    function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
    setText('wallet-address', c.address);
    setText('sum-usd', '$' + depositAmount.toFixed(2));
    setText('sum-crypto', cryptoAmt + ' ' + c.symbol);
    setText('sum-network', c.network);
    setText('sum-time', now.toLocaleTimeString());
    setText('sum-location', loc);
    setText('send-amount-label', cryptoAmt + ' ' + c.symbol);
    setText('warn-coin', c.symbol);

    var panel = document.getElementById('address-panel');
    if (panel) panel.classList.add('open');
    setStep(3);
    startCountdown(30 * 60);

    try {
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crypto: c.symbol, amountUSD: depositAmount, amountCrypto: cryptoAmt, address: c.address, location: loc, expiresAt: expiresAt.toISOString() }),
      });
      loadHistory();
    } catch (_) {}
  };

  function startCountdown(seconds) {
    if (countdownTimer) clearInterval(countdownTimer);
    var rem = seconds;
    var el = document.getElementById('countdown');
    var tick = function () {
      var m = String(Math.floor(rem / 60)).padStart(2, '0');
      var s = String(rem % 60).padStart(2, '0');
      if (el) el.textContent = m + ':' + s;
      if (rem <= 0) { clearInterval(countdownTimer); if (el) el.textContent = 'EXPIRED'; if (window.cancelDeposit) window.cancelDeposit(); }
      rem--;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  window.copyAddress = function () {
    var addr = document.getElementById('wallet-address') && document.getElementById('wallet-address').textContent.trim();
    if (!addr || addr === '\u2014') return;
    var label = document.getElementById('copy-label');
    var done = function () {
      if (label) label.textContent = 'Copied!';
      setTimeout(function () { if (label) label.textContent = 'Copy address'; }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(addr).then(done).catch(done); }
    else done();
  };

  window.cancelDeposit = function () {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    var panel = document.getElementById('address-panel');
    if (panel) panel.classList.remove('open');
    setStep(selectedCrypto ? 2 : 1);
  };

  loadHistory();
}

async function loadHistory() {
  try {
    var res = await fetch('/api/deposits');
    if (!res.ok) { renderHistory([]); return; }
    var data = await res.json();
    renderHistory(data.deposits || []);
  } catch (_) { renderHistory([]); }
}

function renderHistory(list) {
  var container = document.getElementById('history-list');
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<p style="text-align:center;padding:1.5rem 0;font-size:.875rem;opacity:.6">No deposit history yet.</p>';
    return;
  }
  var now = new Date();
  container.innerHTML = list.map(function (entry, idx) {
    var created = new Date(entry.createdAt);
    var expires = new Date(entry.expiresAt);
    var expired = expires < now;
    var border = idx < list.length - 1 ? 'border-bottom:1px solid hsl(var(--border));' : '';
    var bg = expired ? 'rgba(239,68,68,.1)' : 'rgba(22,163,74,.1)';
    var col = expired ? '#ef4444' : '#16a34a';
    var txt = expired ? 'Expired' : 'Active';
    return '<div style="padding:1rem 0;' + border + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">' +
      '<span style="font-size:.875rem;font-weight:700">' + entry.crypto + ' &middot; $' + Number(entry.amountUSD).toFixed(2) + '</span>' +
      '<span style="font-size:.75rem;font-weight:600;padding:.125rem .5rem;border-radius:9999px;background:' + bg + ';color:' + col + '">' + txt + '</span>' +
      '</div>' +
      '<p style="font-size:.75rem;opacity:.6">\uD83D\uDCCD ' + (entry.location || '\u2014') + ' &middot; ' + created.toLocaleString() + '</p>' +
      '<p style="font-size:.75rem;font-family:monospace;margin-top:.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" title="Click to copy" onclick="navigator.clipboard&&navigator.clipboard.writeText(\'' + entry.address + '\')">' + entry.address + '</p>' +
      '</div>';
  }).join('');
}

const PAGE_STYLES = `
  :root{--brand:#111111;--brand-hover:#2f2f2f}
  .crypto-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:1.5rem 1rem;border-radius:.875rem;border:1.5px solid hsl(var(--border));background:hsl(var(--card));cursor:pointer;transition:border-color .2s,box-shadow .25s,transform .15s;user-select:none}
  .crypto-card:hover{border-color:hsl(var(--ring)/.5);transform:translateY(-2px)}
  .crypto-card.selected{border-color:hsl(var(--foreground));box-shadow:0 0 18px rgba(255,255,255,.15)}
  .check-badge{position:absolute;top:.55rem;right:.55rem;width:22px;height:22px;border-radius:9999px;background:hsl(var(--foreground));color:hsl(var(--background));display:none;align-items:center;justify-content:center}
  .crypto-card.selected .check-badge{display:flex}
  .step-dot{width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0;transition:background .2s,color .2s}
  .step-dot.pending{background:hsl(var(--muted));color:hsl(var(--muted-foreground))}
  .step-dot.active{background:hsl(var(--foreground));color:hsl(var(--background))}
  .step-dot.done{background:#16a34a;color:#fff}
  .step-line{flex:1;height:2px;background:hsl(var(--border));transition:background .2s}
  .step-line.done{background:#16a34a}
  .preset-btn{padding:.375rem .875rem;border-radius:.375rem;border:1px solid hsl(var(--border));background:transparent;color:hsl(var(--foreground));font-size:.875rem;font-weight:500;cursor:pointer;transition:background .15s}
  .preset-btn:hover{background:hsl(var(--accent))}
  .preset-btn.active{background:hsl(var(--foreground));color:hsl(var(--background));border-color:hsl(var(--foreground))}
  .gen-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;width:100%;height:2.5rem;border-radius:.375rem;font-size:.875rem;font-weight:600;color:#fff;background:linear-gradient(to bottom,#52525b,#3f3f46);border:none;cursor:pointer;transition:opacity .15s}
  .gen-btn:hover{opacity:.9}
  .cancel-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;height:2.5rem;border-radius:.375rem;font-size:.875rem;font-weight:600;color:hsl(var(--foreground));background:transparent;border:1px solid hsl(var(--border));cursor:pointer;transition:background .15s}
  .cancel-btn:hover{background:hsl(var(--accent))}
  .address-panel{overflow:hidden;max-height:0;opacity:0;transition:max-height .5s cubic-bezier(.4,0,.2,1),opacity .3s}
  .address-panel.open{max-height:1000px;opacity:1}
`;

export default function DepositPage() {
  useEffect(function () {
    exposeToWindow();
    initApp();
    initDeposit();
  }, []);

  return (
    <>
      <Head>
        <title>Deposit - Bounty</title>
        <link rel="stylesheet" href="/css/styles.css" />
        <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      </Head>


      <div className="mx-auto max-w-lg px-4 py-8">

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          <div id="s1" className="step-dot active">1</div>
          <div id="l1" className="step-line" />
          <div id="s2" className="step-dot pending">2</div>
          <div id="l2" className="step-line" />
          <div id="s3" className="step-dot pending">3</div>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Doto',monospace" }}>Deposit Funds</h1>
        <p className="text-sm text-muted-foreground mb-8">Add balance to your Bounty wallet using cryptocurrency.</p>

        {/* Step 1 - select crypto */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3">1. Select cryptocurrency</p>
          <div className="grid grid-cols-2 gap-3">
            <div id="card-btc" className="crypto-card" onClick={function () { window.selectCrypto && window.selectCrypto('btc'); }}>
              <div className="check-badge"><CheckBadge /></div>
              <BtcIcon />
              <div className="text-center">
                <p className="text-sm font-bold">Bitcoin</p>
                <p className="text-xs text-muted-foreground">BTC Â· ~10 min</p>
              </div>
            </div>
            <div id="card-ltc" className="crypto-card" onClick={function () { window.selectCrypto && window.selectCrypto('ltc'); }}>
              <div className="check-badge"><CheckBadge /></div>
              <LtcIcon />
              <div className="text-center">
                <p className="text-sm font-bold">Litecoin</p>
                <p className="text-xs text-muted-foreground">LTC Â· ~5 min</p>
              </div>
            </div>
          </div>
          <p id="crypto-error" className="hidden text-xs text-red-500 mt-2">Please select a cryptocurrency.</p>
        </div>

        {/* Step 2 - amount */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3">2. Enter amount (USD)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(function (v) {
              return (
                <button key={v} className="preset-btn" onClick={function () { window.setPreset && window.setPreset(v); }}>
                  ${v}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input id="amount-input" type="number" min="1" placeholder="0.00" className="w-full h-10 pl-7 pr-3 rounded-md bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" onChange={function () { window.onAmountChange && window.onAmountChange(); }} />
          </div>
          <p id="amount-error" className="hidden text-xs text-red-500 mt-1.5">Minimum deposit is $1.00</p>
          <div id="crypto-equiv" className="hidden mt-2">
            <span id="equiv-text" className="text-xs text-muted-foreground font-mono" />
          </div>
        </div>

        {/* Generate button */}
        <button className="gen-btn mb-6" onClick={function () { window.generateAddress && window.generateAddress(); }}>
          <IcoCard /> Generate Deposit Address
        </button>

        {/* Address panel */}
        <div id="address-panel" className="address-panel mb-8">
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Deposit Address</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IcoClock />
                Expires in <span id="countdown" className="font-mono font-bold text-foreground ml-1">30:00</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">QR Code</div>
            </div>

            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p id="wallet-address" className="font-mono text-xs break-all text-foreground">â€”</p>
            </div>

            <button id="copy-btn" className="gen-btn" onClick={function () { window.copyAddress && window.copyAddress(); }}>
              <span id="copy-label">Copy address</span>
            </button>

            <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
              {[['Amount', 'sum-usd'], ['You send', 'send-amount-label'], ['Crypto', 'sum-crypto'], ['Network', 'sum-network'], ['Time', 'sum-time'], ['Location', 'sum-location']].map(function (row) {
                return (
                  <div key={row[0]} className="flex justify-between">
                    <span>{row[0]}</span>
                    <span id={row[1]} className="font-semibold text-foreground">â€”</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg p-3">
              âš ï¸ Only send <span id="warn-coin" className="font-semibold" /> to this address. Sending any other asset will result in permanent loss of funds.
            </p>

            <button className="cancel-btn" onClick={function () { window.cancelDeposit && window.cancelDeposit(); }}>Cancel</button>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-bold mb-4">Deposit History</h2>
          <div id="history-list" className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          </div>
        </div>
      </div>
    </>
  );
}

