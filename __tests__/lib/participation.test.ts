import { deriveParticipationStatus } from '@/lib/pulse';

const TODAY = '2026-07-15';

describe('deriveParticipationStatus', () => {
  it('flags critical when the employee has never checked in', () => {
    const status = deriveParticipationStatus({ lastEntryDate: null, latestRisk: null, today: TODAY });
    expect(status).toEqual({
      severity: 'critical',
      reason: "Hasn't submitted a single check-in yet.",
      icon: 'event_busy',
      daysSinceCheckIn: null,
    });
  });

  it('flags critical when the last check-in was 14+ days ago', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-07-01', latestRisk: 'low', today: TODAY });
    expect(status?.severity).toBe('critical');
    expect(status?.daysSinceCheckIn).toBe(14);
    expect(status?.reason).toMatch(/14 days/);
  });

  it('does not flag a stale check-in just under the threshold', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-07-02', latestRisk: 'low', today: TODAY });
    expect(status).toBeNull();
  });

  it('flags critical for a recent high isolation risk entry', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-07-14', latestRisk: 'high', today: TODAY });
    expect(status?.severity).toBe('critical');
    expect(status?.icon).toBe('location_on');
  });

  it('flags moderate for a recent medium isolation risk entry', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-07-14', latestRisk: 'medium', today: TODAY });
    expect(status?.severity).toBe('moderate');
    expect(status?.icon).toBe('group_off');
  });

  it('returns null (healthy, not flagged) for a recent low-risk entry', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-07-14', latestRisk: 'low', today: TODAY });
    expect(status).toBeNull();
  });

  it('prioritizes staleness over a stale-but-technically-low-risk record', () => {
    const status = deriveParticipationStatus({ lastEntryDate: '2026-06-01', latestRisk: 'low', today: TODAY });
    expect(status?.severity).toBe('critical');
    expect(status?.reason).toMatch(/days/);
  });
});
