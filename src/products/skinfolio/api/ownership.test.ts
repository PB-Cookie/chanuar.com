import { describe, expect, it } from 'vitest';
import { ownershipFromExport } from './ownership';

describe('Skinfolio ownership normalization', () => {
  it('returns one camelCase domain model for collector exports', () => {
    const ownership = ownershipFromExport({
      summoner: { gameName: 'Chanuar', tagLine: 'EUW', level: 100, profileIconId: 42 },
      wallet: { RP: 250, lol_blue_essence: 12345 },
      skins: [],
      mastery: [],
      matches: [{ gameId: 'game-1', playedAt: '2026-08-11T12:00:00Z', queueId: 420, durationS: 1800, championId: 103, win: true, kills: 5, deaths: 2, assists: 8 }],
    });

    expect(ownership.profile).toEqual({ gameName: 'Chanuar', tagLine: 'EUW', level: 100, profileIconId: 42 });
    expect(ownership.wallet).toEqual({ RP: 250, blueEssence: 12345 });
    expect(ownership.matches[0]).toMatchObject({ gameId: 'game-1', queueId: 420, championId: 103, win: true });
  });
});
