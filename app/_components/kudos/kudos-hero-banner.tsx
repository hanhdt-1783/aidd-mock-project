'use client';

import Image from 'next/image';
import KudosEntryInput from './kudos-entry-input';
import { useKudosToast, KudosToast } from './kudos-toast';

export default function KudosHeroBanner() {
  const { toast, showToast, dismissToast } = useKudosToast();

  return (
    <>
      {/* Full-bleed hero with background image */}
      <section
        aria-label="Kudos hero banner"
        style={{
          position: 'relative',
          width: '100%',
          height: 512,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Background image */}
        <Image
          src="/kudos/hero-bg.png"
          alt=""
          aria-hidden="true"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        {/* Dark overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,16,26,0.3) 0%, rgba(0,16,26,0.7) 100%)',
          }}
        />
      </section>

      {/* Section A — KV Kudos title + entry input */}
      <div
        style={{
          width: '100%',
          padding: '0 144px',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          marginTop: -80, // overlap the hero slightly
          position: 'relative',
          zIndex: 2,
        }}
        className="kudos-hero-content"
      >
        {/* Kudos logo / title group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* "Sun* Annual Awards 2025" label */}
          <p
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Sun* Annual Awards 2025
          </p>

          {/* Kudos logo image (SVG asset) — falls back to text if 404 */}
          <div style={{ height: 104, display: 'flex', alignItems: 'center' }}>
            <Image
              src="/kudos-live-board/MM_MEDIA_Kudos logo.svg"
              alt="Sun* Kudos"
              width={593}
              height={104}
              style={{ objectFit: 'contain', objectPosition: 'left' }}
              onError={() => {/* silently fall back */}}
            />
          </div>
        </div>

        {/* Entry input (A.1) */}
        <KudosEntryInput onAction={() => showToast('Coming soon')} />
      </div>

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
