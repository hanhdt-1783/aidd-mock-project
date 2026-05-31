import { describe, expect, it } from 'vitest';
import { HERO_BADGE } from './kudos-hero-badge';

describe('HERO_BADGE', () => {
  it('maps each known rank title to its badge asset', () => {
    expect(HERO_BADGE).toEqual({
      'New Hero': '/kudos/badge-new-hero.png',
      'Rising Hero': '/kudos/badge-rising-hero.png',
      'Legend Hero': '/kudos/badge-legend-hero.png',
      'Super Hero': '/kudos/badge-super-hero.png',
    });
  });

  it('points every badge at a .png under /kudos/', () => {
    for (const path of Object.values(HERO_BADGE)) {
      expect(path).toMatch(/^\/kudos\/badge-.+\.png$/);
    }
  });

  it('returns undefined for an unknown rank', () => {
    expect(HERO_BADGE['Unknown Rank']).toBeUndefined();
  });
});
