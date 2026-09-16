import { aggregatePulseEntries } from '@/lib/metricsAggregation';

describe('aggregatePulseEntries', () => {
  it('returns all-zero metrics for an empty window', () => {
    expect(aggregatePulseEntries([])).toEqual({
      officeUtilization: 0,
      avgFocusHours: 0,
      engagementScore: 0,
      equityGapScore: 0,
    });
  });

  it('computes officeUtilization as the percent in_office', () => {
    const result = aggregatePulseEntries([
      { presence: 'in_office', focusHours: 5, collaborationScore: 80, moodScore: 80 },
      { presence: 'in_office', focusHours: 5, collaborationScore: 80, moodScore: 80 },
      { presence: 'remote', focusHours: 5, collaborationScore: 80, moodScore: 80 },
      { presence: 'remote', focusHours: 5, collaborationScore: 80, moodScore: 80 },
    ]);
    expect(result.officeUtilization).toBe(50);
  });

  it('averages focusHours across entries', () => {
    const result = aggregatePulseEntries([
      { presence: 'remote', focusHours: 4, collaborationScore: 70, moodScore: 70 },
      { presence: 'remote', focusHours: 8, collaborationScore: 70, moodScore: 70 },
    ]);
    expect(result.avgFocusHours).toBe(6);
  });

  it('computes engagementScore as the mean of collaboration and mood', () => {
    const result = aggregatePulseEntries([
      { presence: 'in_office', focusHours: 6, collaborationScore: 60, moodScore: 80 },
    ]);
    expect(result.engagementScore).toBe(70);
  });

  it('reports zero equityGapScore when everyone reports the same collaboration level', () => {
    const result = aggregatePulseEntries([
      { presence: 'in_office', focusHours: 6, collaborationScore: 75, moodScore: 75 },
      { presence: 'remote', focusHours: 6, collaborationScore: 75, moodScore: 75 },
      { presence: 'in_office', focusHours: 6, collaborationScore: 75, moodScore: 75 },
    ]);
    expect(result.equityGapScore).toBe(0);
  });

  it('reports a higher equityGapScore when collaboration scores are spread out', () => {
    const result = aggregatePulseEntries([
      { presence: 'in_office', focusHours: 6, collaborationScore: 10, moodScore: 50 },
      { presence: 'remote', focusHours: 6, collaborationScore: 90, moodScore: 50 },
    ]);
    expect(result.equityGapScore).toBeGreaterThan(0);
  });

  it('rounds every field to one decimal place', () => {
    const result = aggregatePulseEntries([
      { presence: 'in_office', focusHours: 5, collaborationScore: 67, moodScore: 71 },
      { presence: 'remote', focusHours: 3, collaborationScore: 40, moodScore: 55 },
      { presence: 'remote', focusHours: 6, collaborationScore: 88, moodScore: 90 },
    ]);
    for (const value of Object.values(result)) {
      expect(Number.isInteger(value * 10)).toBe(true);
    }
  });
});
