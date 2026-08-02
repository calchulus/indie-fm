import { describe, it, expect } from 'vitest';
import { generateStaffCandidates, getTrainingQualityBonus, generateBoardExpectations, checkExpectationsMet, generateSponsorshipOffer, negotiateSponsorship, getDefaultTicketPricing, calculateMatchdayRevenue, proposeStadiumExpansion, isInternationalBreak, isWinterWindow, canLoanPlayer, generateLoanOffer, generatePreSeasonFixtures } from '../../simulation/systems-2';
import { generateTeam, generatePlayer } from '../../data/generators';
import { Team } from '../../types';

describe('Systems-2: Staff', () => {
  describe('generateStaffCandidates', () => {
    it('generates the requested number of candidates', () => {
      const candidates = generateStaffCandidates('Coach', 5);
      expect(candidates).toHaveLength(5);
    });

    it('assigns the correct role to all candidates', () => {
      const candidates = generateStaffCandidates('Scout', 3);
      candidates.forEach((c) => expect(c.role).toBe('Scout'));
    });

    it('generates ratings in 50-90 range', () => {
      const candidates = generateStaffCandidates('Physio', 20);
      candidates.forEach((c) => {
        expect(c.rating).toBeGreaterThanOrEqual(50);
        expect(c.rating).toBeLessThanOrEqual(90);
      });
    });

    it('generates positive wages proportional to rating', () => {
      const candidates = generateStaffCandidates('Coach', 5);
      candidates.forEach((c) => {
        expect(c.wage).toBe(c.rating * 100);
      });
    });

    it('assigns specialties', () => {
      const candidates = generateStaffCandidates('Coach', 5);
      candidates.forEach((c) => expect(c.specialty.length).toBeGreaterThan(0));
    });
  });

  describe('getTrainingQualityBonus', () => {
    it('returns positive bonus for high-rated staff', () => {
      expect(getTrainingQualityBonus(80)).toBeGreaterThan(0);
    });

    it('returns lower bonus for low-rated staff', () => {
      expect(getTrainingQualityBonus(50)).toBeLessThan(getTrainingQualityBonus(90));
    });
  });
});

describe('Systems-2: Board Expectations', () => {
  it('generates expectations', () => {
    const expectations = generateBoardExpectations(60);
    expect(expectations.length).toBeGreaterThan(0);
  });

  it('checks expectations met with good position', () => {
    const expectations = generateBoardExpectations(60);
    const results = checkExpectationsMet(expectations, 1, 20);
    expect(results.length).toBe(expectations.length);
  });
});

describe('Systems-2: Sponsorship', () => {
  it('generates a sponsorship offer', () => {
    const offer = generateSponsorshipOffer(60);
    expect(offer.sponsorName.length).toBeGreaterThan(0);
    expect(offer.annualRevenue).toBeGreaterThan(0);
    expect(offer.yearsRemaining).toBeGreaterThan(0);
  });

  it('negotiates a better deal for high reputation', () => {
    const offer = generateSponsorshipOffer(60);
    const negotiated = negotiateSponsorship(offer, 80);
    expect(negotiated.annualRevenue).toBeGreaterThanOrEqual(offer.annualRevenue);
  });
});

describe('Systems-2: Ticket Pricing', () => {
  it('generates default pricing', () => {
    const pricing = getDefaultTicketPricing(60);
    expect(pricing.standard).toBeGreaterThan(0);
    expect(pricing.premium).toBeGreaterThan(pricing.standard);
  });

  it('calculates matchday revenue', () => {
    const pricing = getDefaultTicketPricing(60);
    const revenue = calculateMatchdayRevenue(pricing, 30000, 40000);
    expect(revenue).toBeGreaterThan(0);
  });
});

describe('Systems-2: Stadium', () => {
  it('proposes expansion', () => {
    const expansion = proposeStadiumExpansion(30000);
    expect(expansion.proposedCapacity).toBeGreaterThan(30000);
    expect(expansion.cost).toBeGreaterThan(0);
  });
});

describe('Systems-2: Calendar', () => {
  it('detects international breaks', () => {
    expect(isInternationalBreak(8)).toBe(true);
    expect(isInternationalBreak(16)).toBe(true);
    expect(isInternationalBreak(24)).toBe(true);
    expect(isInternationalBreak(32)).toBe(true);
    expect(isInternationalBreak(5)).toBe(false);
  });

  it('detects winter window', () => {
    expect(isWinterWindow(19, 38)).toBe(true);
    expect(isWinterWindow(5, 38)).toBe(false);
  });
});

describe('Systems-2: Loans', () => {
  const team = generateTeam(0, 65);

  it('allows loan for bench player on large squad', () => {
    const bigTeam: Team = { ...team, players: [...team.players, generatePlayer(99, 'CM', 22)] };
    const benchPlayer = bigTeam.players[bigTeam.players.length - 1];
    expect(canLoanPlayer(bigTeam, benchPlayer)).toBe(true);
  });

  it('blocks loan for small squad', () => {
    const smallTeam: Team = { ...team, players: team.players.slice(0, 10) };
    expect(canLoanPlayer(smallTeam, smallTeam.players[0])).toBe(false);
  });

  it('generates a valid loan offer', () => {
    const player = team.players[0];
    const destClub = generateTeam(1, 60);
    const offer = generateLoanOffer(player, team, destClub);
    expect(offer.playerId).toBe(player.id);
    expect(offer.fromClubId).toBe(team.id);
    expect(offer.toClubId).toBe(destClub.id);
    expect(offer.duration).toBeGreaterThanOrEqual(5);
    expect(offer.duration).toBeLessThanOrEqual(30);
  });
});

describe('Systems-2: Pre-Season', () => {
  it('generates pre-season fixtures', () => {
    const team = generateTeam(0, 65);
    const opponents = [generateTeam(1, 60), generateTeam(2, 55), generateTeam(3, 70)];
    const fixtures = generatePreSeasonFixtures(team, opponents);
    expect(fixtures.length).toBeGreaterThan(0);
    fixtures.forEach((f) => {
      expect(f.opponentName.length).toBeGreaterThan(0);
      expect(f.round).toBeGreaterThan(0);
    });
  });
});
