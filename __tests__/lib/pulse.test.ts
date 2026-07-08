import { deriveIsolationRisk, slugify } from '@/lib/pulse';

describe('deriveIsolationRisk', () => {
  it('flags high risk for remote + low collaboration', () => {
    expect(deriveIsolationRisk({ presence: 'remote', collaborationScore: 30 })).toBe('high');
  });

  it('flags medium risk for low collaboration regardless of presence', () => {
    expect(deriveIsolationRisk({ presence: 'in_office', collaborationScore: 45 })).toBe('medium');
  });

  it('flags low risk for healthy collaboration', () => {
    expect(deriveIsolationRisk({ presence: 'remote', collaborationScore: 80 })).toBe('low');
  });

  it('does not flag high risk for in-office employees even with low collaboration', () => {
    expect(deriveIsolationRisk({ presence: 'in_office', collaborationScore: 20 })).toBe('medium');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Acme Inc.')).toBe('acme-inc');
  });

  it('trims stray leading/trailing hyphens', () => {
    expect(slugify('  --Weird Name--  ')).toBe('weird-name');
  });

  it('falls back to a timestamp-based slug for empty input', () => {
    expect(slugify('   ')).toMatch(/^org-\d+$/);
  });
});
