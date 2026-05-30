'use client';

import Image from 'next/image';
import { useId, useState } from 'react';

// Campaign copy — from Figma "Hover campain" frame (screenId gI07KYVJWE).
const CAMPAIGN_TITLE = 'Ngày x2 tim – lan tỏa gấp đôi yêu thương!';
const CAMPAIGN_BODY =
  'Từ XX:XX ngày XX/12 đến XX:XX ngày XX/12, tất cả tim bạn nhận được đều được nhân đôi.';

// Authentic flame + "x2" raster cropped from the Figma design (Group 435).
const FLAME_SRC = '/kudos/double-hearts-flame.png';
const FLAME_INTRINSIC = { w: 53, h: 67 };

// Flame badge scaled to `height` px, preserving the design aspect ratio.
function BadgeArt({ height }: { height: number }) {
  const width = Math.round((height * FLAME_INTRINSIC.w) / FLAME_INTRINSIC.h);
  return (
    <Image
      src={FLAME_SRC}
      alt="x2 tim"
      width={width}
      height={height}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}

// Hover/focus popover describing the double-hearts campaign (Figma "Hover campain").
function CampaignTooltip({ id }: { id: string }) {
  return (
    <div
      id={id}
      role="tooltip"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        right: 0,
        width: 'min(340px, 78vw)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: 16,
        borderRadius: 16,
        border: '1px solid #2E3940',
        background: '#00070C',
        boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
        zIndex: 20,
        cursor: 'default',
      }}
    >
      <BadgeArt height={66} />
      <p
        style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: '20px',
          letterSpacing: '0.1px',
        }}
      >
        <span style={{ display: 'block', marginBottom: 4, color: '#FFFFFF' }}>
          {CAMPAIGN_TITLE}
        </span>
        <span style={{ color: '#999999' }}>{CAMPAIGN_BODY}</span>
      </p>
    </div>
  );
}

// The 🔥 x2 badge shown on the "Số tim bạn nhận được:" row, with a campaign
// tooltip on hover/focus (Figma Group 435 + Hover campain frame).
export default function KudosDoubleHeartsBadge() {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      tabIndex={0}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <BadgeArt height={40} />
      {open && <CampaignTooltip id={tooltipId} />}
    </span>
  );
}
