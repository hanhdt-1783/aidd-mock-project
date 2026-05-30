'use client';

import Image from 'next/image';
import KudosEntryInput from './kudos-entry-input';
import KudosSearchInput from './kudos-search-input';
import { useKudoCompose } from './kudo-compose-provider';
import { t, type Language } from '@/lib/i18n/dictionary';

type KudosHeroBannerProps = {
  lang: Language;
};

export default function KudosHeroBanner({ lang }: KudosHeroBannerProps) {
  const { openCompose } = useKudoCompose();

  return (
    <>
      {/* Full-bleed hero: keyvisual bg + diagonal cover + overlaid content.
          Mirrors Figma "Bìa" → Frame 532: the title block and the button row
          both sit ON TOP of the keyvisual (design y≈184–480 within the 512px
          hero), not below it. */}
      <section
        aria-label={t(lang, 'kudos.hero.title')}
        className="px-page"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 512,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Image
          src="/kudos/keyvisual-bg.png"
          alt=""
          aria-hidden="true"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        {/* Cover (Figma node I2940:13432;1210:12612): diagonal fade so the
            keyvisual blends into the solid #00101A page background — dark at
            the bottom-left, transparent at the top-right. Percentage stops, so
            the fade scales with the box at every screen size. Tune for more/less. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(25deg, #00101A 20%, rgba(0, 19, 32, 0.00) 60%)',
          }}
        />

        {/* Content over the keyvisual — title block (A_KV Kudos) + button row
            (Button chuc nang). 64px gap matches Frame 532 spacing. */}
        <div
          className="kudos-hero-content"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 64,
            // Clears the fixed 80px header and lands the eyebrow at the
            // design offset (≈184px from the top of the keyvisual at 1440).
            paddingTop: 'clamp(112px, 16vw, 184px)',
            paddingBottom: 32,
          }}
        >
          {/* A_KV Kudos: eyebrow + Kudos logo (10px gap, Figma node 2940:13437) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p
              className="kudos-hero-eyebrow"
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 36,
                fontWeight: 700,
                lineHeight: '44px',
                color: '#FFEA9E',
              }}
            >
              {t(lang, 'kudos.hero.title')}
            </p>

            <div
              className="kudos-hero-logo-wrap"
              style={{ height: 104, display: 'flex', alignItems: 'center' }}
            >
              <Image
                src="/kudos/MM_MEDIA_Kudos logo.svg"
                alt="Sun* Kudos"
                width={593}
                height={104}
                priority
                style={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  objectPosition: 'left',
                }}
              />
            </div>
          </div>

          {/* Button chuc nang: entry pill (738) + search pill (381), 32px gap.
              Single row (no wrap) per design — both pills shrink to fit when
              the content area is narrower than 738+32+381. On mobile: stack. */}
          <div
            className="kudos-hero-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
          >
            <KudosEntryInput lang={lang} onAction={() => openCompose()} />
            <KudosSearchInput lang={lang} />
          </div>
        </div>
      </section>
    </>
  );
}
