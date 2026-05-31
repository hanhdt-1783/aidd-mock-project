import { describe, expect, it } from 'vitest';
import { MAX_TAG_LEN, sanitizeTag } from './sanitize-tag';

describe('sanitizeTag', () => {
  it('strips a single leading "#"', () => {
    expect(sanitizeTag('#teamwork')).toBe('teamwork');
  });

  it('strips multiple leading "#" characters', () => {
    expect(sanitizeTag('###teamwork')).toBe('teamwork');
  });

  it('does not strip "#" that is not leading', () => {
    expect(sanitizeTag('team#work')).toBe('team#work');
  });

  it('removes Vietnamese diacritics (combining marks)', () => {
    expect(sanitizeTag('cảmơn')).toBe('camon');
    expect(sanitizeTag('hành trình')).toBe('hanhtrinh');
  });

  it('maps đ/Đ which have no NFD decomposition', () => {
    expect(sanitizeTag('độichơi')).toBe('doichoi');
    expect(sanitizeTag('Đoàn')).toBe('Doan');
  });

  it('removes all internal whitespace (viết liền)', () => {
    expect(sanitizeTag('viet  lien   nhe')).toBe('vietliennhe');
    expect(sanitizeTag('tab\tand\nnewline')).toBe('tabandnewline');
  });

  it('trims surrounding whitespace before processing', () => {
    expect(sanitizeTag('   #hello   ')).toBe('hello');
  });

  it('caps the result at MAX_TAG_LEN characters', () => {
    const long = 'a'.repeat(MAX_TAG_LEN + 50);
    expect(sanitizeTag(long)).toHaveLength(MAX_TAG_LEN);
  });

  it('counts the cap after stripping, not before', () => {
    // 70 "a" with a leading "#" and spaces still yields exactly MAX_TAG_LEN.
    const raw = '# ' + 'a'.repeat(70);
    expect(sanitizeTag(raw)).toBe('a'.repeat(MAX_TAG_LEN));
  });

  it('returns empty string for empty / whitespace-only / hash-only input', () => {
    expect(sanitizeTag('')).toBe('');
    expect(sanitizeTag('     ')).toBe('');
    expect(sanitizeTag('####')).toBe('');
  });

  it('combines all rules together', () => {
    expect(sanitizeTag('  #Đội Phát Triển  ')).toBe('DoiPhatTrien');
  });

  it('exposes MAX_TAG_LEN as 64', () => {
    expect(MAX_TAG_LEN).toBe(64);
  });
});
