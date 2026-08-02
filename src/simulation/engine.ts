import {
  MatchState, MatchEvent, PlayerPosition, Team, Player,
  PITCH_LENGTH, PITCH_WIDTH, TICKS_PER_MINUTE,
} from '../types';
import { getFormationSlots, getMentalityModifier, getPressingModifier, getTempoModifier } from './tactics';
import { getCommentary } from './commentary';
import { rollMatchDayInjury, rollPenalty, rollVARReview } from './matchday';
import { computeTraitBonus } from './traits';
import { applyShotTraits, applyPassTraits, applyTackleTraits, applyDribbleTraits, computeTraitMultipliers } from './trait-effects';
import { WeatherCondition, applyWeatherToPass, applyWeatherToShot, applyWeatherToDribble, getWeatherEffects } from './weather-effects';
import { MomentumState, getMomentumMultiplier } from './momentum';
import { getFatigueMultiplier } from './fatigue';
import { computePassDifficulty, computeGKDecision } from './decision-ai';
import { rollInjury } from './setpieces';

let eventId = 0;

function createEvent(
  tick: number,
  type: MatchEvent['type'],
  teamId: string,
  description: string,
  x: number,
  y: number,
  outcome: MatchEvent['outcome'],
  playerId?: string,
): MatchEvent {
  return {
    id: `evt_${++eventId}`,
    tick,
    minute: Math.floor(tick / TICKS_PER_MINUTE) + 1,
    type,
    teamId,
    playerId,
    description,
    x,
    y,
    outcome,
  };
}

function teamStrength(team: Team, phase: 'attack' | 'defend'): number {
  const starters = team.players.slice(0, 11);
  if (phase === 'attack') {
    const attackers = starters.filter((p) => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
    const mids = starters.filter((p) => ['CM', 'CDM'].includes(p.position));

    // Attack strength from individual attributes
    const atkAvg = attackers.length > 0
      ? attackers.reduce((s, p) => s + (
          p.attributes.finishing * 3 + p.attributes.longShots * 1.5 + p.attributes.offTheBall * 2 +
          p.attributes.composure * 2 + p.attributes.pace * 1.5 + p.attributes.acceleration * 1.5 +
          p.attributes.dribbling * 1.5 + p.attributes.technique * 1 + p.attributes.flair * 0.5 +
          p.attributes.agility * 1 + p.attributes.crossing * 0.5 + p.attributes.vision * 1
        ) / 17, 0) / attackers.length
      : 8;

    // Midfield control from individual attributes
    const midAvg = mids.length > 0
      ? mids.reduce((s, p) => s + (
          p.attributes.passing * 3 + p.attributes.vision * 2.5 + p.attributes.technique * 2 +
          p.attributes.firstTouch * 1.5 + p.attributes.decisions * 2 + p.attributes.composure * 1.5 +
          p.attributes.stamina * 1 + p.attributes.workRate * 1 + p.attributes.longShots * 0.5
        ) / 15, 0) / mids.length
      : 8;

    return atkAvg * 0.6 + midAvg * 0.4;
  } else {
    const defenders = starters.filter((p) => ['CB', 'LB', 'RB'].includes(p.position));
    const gk = starters.find((p) => p.position === 'GK');
    const dm = starters.filter((p) => p.position === 'CDM');

    // Defensive strength from individual attributes
    const defAvg = defenders.length > 0
      ? defenders.reduce((s, p) => s + (
          p.attributes.marking * 3 + p.attributes.tackling * 3 + p.attributes.positioning * 2.5 +
          p.attributes.concentration * 2 + p.attributes.strength * 1.5 + p.attributes.heading * 1.5 +
          p.attributes.aggression * 1 + p.attributes.bravery * 1 + p.attributes.pace * 1 +
          p.attributes.acceleration * 0.5 + p.attributes.anticipation * 1.5 + p.attributes.jumpingReach * 0.5
        ) / 19, 0) / defenders.length
      : 8;

    // GK contribution from individual attributes
    const gkStrength = gk ? (
      gk.attributes.reflexes * 3 + gk.attributes.handling * 2.5 + gk.attributes.oneOnOnes * 2 +
      gk.attributes.aerialReach * 1.5 + gk.attributes.commandOfArea * 1.5 + gk.attributes.positioning * 2 +
      gk.attributes.concentration * 1.5 + gk.attributes.communication * 0.5 + gk.attributes.rushingOut * 1
    ) / 15.5 : 8;

    // DM shield from individual attributes
    const dmAvg = dm.length > 0
      ? dm.reduce((s, p) => s + (
          p.attributes.tackling * 2.5 + p.attributes.positioning * 2.5 + p.attributes.marking * 2 +
          p.attributes.strength * 1.5 + p.attributes.aggression * 1 + p.attributes.anticipation * 1.5 +
          p.attributes.stamina * 1 + p.attributes.concentration * 1
        ) / 13, 0) / dm.length
      : 8;

    return defAvg * 0.5 + gkStrength * 0.3 + dmAvg * 0.2;
  }
}

function pickBallCarrier(team: Team, zone: 'defense' | 'midfield' | 'attack'): Player {
  const starters = team.players.slice(0, 11);
  let candidates: Player[];
  if (zone === 'defense') {
    candidates = starters.filter((p) => ['CB', 'LB', 'RB', 'GK', 'CDM'].includes(p.position));
  } else if (zone === 'midfield') {
    candidates = starters.filter((p) => ['CM', 'CDM', 'CAM', 'LW', 'RW'].includes(p.position));
  } else {
    candidates = starters.filter((p) => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
  }
  if (candidates.length === 0) candidates = starters;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Estimate player fitness based on minute elapsed and stamina attribute.
// Non-linear: players perform fine until ~65', then sharp dropoff.
// High-stamina players resist fatigue longer.
function estimateFitness(player: Player, minute: number, weatherDrainMod: number): number {
  const staminaFactor = player.attributes.stamina / 20; // 0-1
  const effectiveMinute = minute * weatherDrainMod * (1.3 - staminaFactor * 0.5);
  if (effectiveMinute <= 50) return 100;
  if (effectiveMinute <= 65) return 100 - (effectiveMinute - 50) * 1.2;
  if (effectiveMinute <= 80) return 82 - (effectiveMinute - 65) * 2.0;
  return Math.max(15, 52 - (effectiveMinute - 80) * 2.5);
}

export function initMatchState(home: Team, away: Team): MatchState {
  const homeSlots = getFormationSlots(home.tactics.formation);
  const awaySlots = getFormationSlots(away.tactics.formation);

  const playerPositions: PlayerPosition[] = [];

  home.players.slice(0, 11).forEach((player, i) => {
    const slot = homeSlots[i];
    playerPositions.push({
      playerId: player.id,
      teamId: home.id,
      x: slot.baseX,
      y: slot.baseY,
      targetX: slot.baseX,
      targetY: slot.baseY,
      hasBall: false,
    });
  });

  away.players.slice(0, 11).forEach((player, i) => {
    const slot = awaySlots[i];
    playerPositions.push({
      playerId: player.id,
      teamId: away.id,
      x: PITCH_LENGTH - slot.baseX,
      y: PITCH_WIDTH - slot.baseY,
      targetX: PITCH_LENGTH - slot.baseX,
      targetY: PITCH_WIDTH - slot.baseY,
      hasBall: false,
    });
  });

  return {
    id: `match_${home.id}_${away.id}`,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    tick: 0,
    half: 1,
    status: 'pre_match',
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
    sentOff: [],
    injuryTime: { firstHalf: 0, secondHalf: 0 },
    stoppages: 0,
    isKnockout: false,
    events: [],
    playerPositions,
    ballPosition: { x: PITCH_LENGTH / 2, y: PITCH_WIDTH / 2 },
  };
}

export function simulateTick(state: MatchState, home: Team, away: Team, weather: WeatherCondition = 'clear', momentum?: MomentumState): MatchState {
  if (state.status === 'full_time') return state;

  const newState = { ...state, tick: state.tick + 1 };
  newState.minute = Math.min(90, Math.floor(newState.tick / TICKS_PER_MINUTE) + 1);

  if (newState.status === 'pre_match') {
    newState.status = 'first_half';
    newState.events = [...newState.events, createEvent(newState.tick, 'kickoff', home.id, 'Kick off!', PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
    return newState;
  }

  // Half time with injury time
  if (newState.minute >= 45 && newState.half === 1 && newState.status === 'first_half') {
    const addedTime = Math.min(5, Math.ceil(newState.stoppages * 0.5));
    newState.injuryTime = { ...newState.injuryTime, firstHalf: addedTime };
    newState.status = 'half_time';
    newState.half = 2;
    newState.events = [...newState.events, createEvent(newState.tick, 'half_time', home.id, `Half time: ${newState.homeScore} - ${newState.awayScore} (+${addedTime}' added)`, PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
    return newState;
  }

  if (newState.status === 'half_time') {
    newState.status = 'second_half';
    newState.events = [...newState.events, createEvent(newState.tick, 'kickoff', away.id, 'Second half kick off', PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
    return newState;
  }

  // Full time with injury time + extra time / penalties for knockout
  if (newState.minute >= 90 && newState.status === 'second_half') {
    const addedTime = Math.min(7, Math.ceil(newState.stoppages * 0.5));
    newState.injuryTime = { ...newState.injuryTime, secondHalf: addedTime };

    if (newState.isKnockout && newState.homeScore === newState.awayScore) {
      // Extra time
      newState.status = 'extra_time';
      newState.events = [...newState.events, createEvent(newState.tick, 'full_time', home.id, `Full time: ${newState.homeScore} - ${newState.awayScore}. Going to extra time!`, PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
      return newState;
    }

    newState.status = 'full_time';
    newState.events = [...newState.events, createEvent(newState.tick, 'full_time', home.id, `Full time: ${newState.homeScore} - ${newState.awayScore} (+${addedTime}' added)`, PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
    return newState;
  }

  // Extra time → penalties if still level
  if (newState.status === 'extra_time' && newState.tick > 90 * TICKS_PER_MINUTE + 30 * TICKS_PER_MINUTE) {
    if (newState.homeScore === newState.awayScore) {
      newState.status = 'penalties';
      // Proper penalty shootout: 5 kicks each, sudden death if tied
      const homeTakers = home.players.slice(0, 11).sort((a, b) => b.attributes.penaltyTaking - a.attributes.penaltyTaking);
      const awayTakers = away.players.slice(0, 11).sort((a, b) => b.attributes.penaltyTaking - a.attributes.penaltyTaking);
      const homeGK = home.players.find((p) => p.position === 'GK');
      const awayGK = away.players.find((p) => p.position === 'GK');

      let homePens = 0;
      let awayPens = 0;
      const maxKicks = 8; // 5 regular + 3 sudden death max
      for (let i = 0; i < maxKicks; i++) {
        // Home kick
        const homeTaker = homeTakers[i % homeTakers.length];
        const homeScoreChance = 0.65 + (homeTaker.attributes.penaltyTaking / 20) * 0.2 + (homeTaker.attributes.composure / 20) * 0.1;
        const awaySaveChance = awayGK ? (awayGK.attributes.reflexes / 20) * 0.25 : 0.1;
        if (Math.random() < homeScoreChance - awaySaveChance) homePens++;

        // Away kick
        const awayTaker = awayTakers[i % awayTakers.length];
        const awayScoreChance = 0.65 + (awayTaker.attributes.penaltyTaking / 20) * 0.2 + (awayTaker.attributes.composure / 20) * 0.1;
        const homeSaveChance = homeGK ? (homeGK.attributes.reflexes / 20) * 0.25 : 0.1;
        if (Math.random() < awayScoreChance - homeSaveChance) awayPens++;

        // Check if decided after 5 kicks or in sudden death
        if (i >= 4 && homePens !== awayPens) break;
      }

      const homeWins = homePens > awayPens;
      newState.events = [...newState.events, createEvent(newState.tick, 'full_time', homeWins ? home.id : away.id, `Penalties: ${homePens}-${awayPens}. ${homeWins ? home.name : away.name} win!`, PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
      newState.status = 'full_time';
    } else {
      newState.status = 'full_time';
      newState.events = [...newState.events, createEvent(newState.tick, 'full_time', newState.homeScore > newState.awayScore ? home.id : away.id, `After extra time: ${newState.homeScore} - ${newState.awayScore}`, PITCH_LENGTH / 2, PITCH_WIDTH / 2, 'neutral')];
    }
    return newState;
  }

  // Red card effect: reduce team strength when a player is sent off
  const homeRedMod = newState.redCards.home > 0 ? 0.75 : 1.0;
  const awayRedMod = newState.redCards.away > 0 ? 0.75 : 1.0;

  const homeAtk = teamStrength(home, 'attack') * getMentalityModifier(home.tactics).attack * homeRedMod;
  const awayAtk = teamStrength(away, 'attack') * getMentalityModifier(away.tactics).attack * awayRedMod;
  const homeDef = teamStrength(home, 'defend') * getMentalityModifier(home.tactics).defend * homeRedMod;
  const awayDef = teamStrength(away, 'defend') * getMentalityModifier(away.tactics).defend * awayRedMod;

  const totalAtk = homeAtk + awayAtk;
  const possessionRoll = Math.random() * totalAtk;
  const isHomePossession = possessionRoll < homeAtk;

  const attackingTeam = isHomePossession ? home : away;
  const defendingTeam = isHomePossession ? away : home;
  const atkStrength = isHomePossession ? homeAtk : awayAtk;
  const defStrength = isHomePossession ? awayDef : homeDef;

  newState.possession = {
    home: Math.round((state.possession.home * state.tick + (isHomePossession ? 1 : 0)) / (state.tick + 1) * 100) / 100,
    away: 0,
  };
  newState.possession.away = Math.round((100 - newState.possession.home) * 100) / 100;

  const tempoMod = getTempoModifier(attackingTeam.tactics);
  const actionChance = 0.03 * tempoMod;
  const weatherDrainMod = getWeatherEffects(weather).staminaDrainMod;

  // Ball follows possession every tick — lerp toward attacking team's forward zone
  const ballTargetX = isHomePossession
    ? 50 + Math.random() * 40
    : 15 + Math.random() * 40;
  const ballTargetY = 10 + Math.random() * 48;
  const ballLerp = 0.08;
  newState.ballPosition = {
    x: state.ballPosition.x + (ballTargetX - state.ballPosition.x) * ballLerp,
    y: state.ballPosition.y + (ballTargetY - state.ballPosition.y) * ballLerp,
  };

  if (Math.random() > actionChance) {
    movePlayersTowardFormation(newState, home, away, isHomePossession);
    return newState;
  }

  const pressingMod = getPressingModifier(defendingTeam.tactics);
  const eventRoll = Math.random();

  if (eventRoll < 0.30) {
    // Pass event — distance + pressure + traits + weather + fatigue + momentum
    const carrier = pickBallCarrier(attackingTeam, 'midfield');
    const carrierFitness = estimateFitness(carrier, newState.minute, weatherDrainMod);
    const fatigueMod = getFatigueMultiplier(carrierFitness);
    const momentumMod = momentum ? getMomentumMultiplier(momentum, attackingTeam.id, home.id) : 1.0;
    const passDistance = 15 + Math.random() * 45;
    const { successMod: distMod } = computePassDifficulty(carrier, passDistance, pressingMod);
    const basePassSuccess = atkStrength / (atkStrength + defStrength * pressingMod);
    const traitPassSuccess = applyPassTraits(basePassSuccess, carrier);
    const passSuccess = applyWeatherToPass(traitPassSuccess, weather) * fatigueMod * distMod * (0.95 + (momentumMod - 0.9) * 0.3);
    const success = Math.random() < passSuccess;
    const x = isHomePossession ? 40 + Math.random() * 30 : 35 + Math.random() * 30;
    const y = 10 + Math.random() * 48;
    const traits = computeTraitMultipliers(carrier);
    const traitNote = traits.passCreativity > 1.1 ? ' (vision)' : traits.passAccuracy > 1.1 ? ' (technique)' : '';
    const weatherNote = weather !== 'clear' && weather !== 'cloudy' && !success ? ` (${weather} affects the pass)` : '';
    newState.events = [...newState.events, createEvent(
      newState.tick, 'pass', attackingTeam.id,
      success
        ? `${carrier.name} completes the pass${traitNote}`
        : `${carrier.name}'s pass goes astray${weatherNote}`,
      x, y, success ? 'success' : 'failure', carrier.id,
    )];
    newState.ballPosition = { x: isHomePossession ? x : PITCH_LENGTH - x, y };
  } else if (eventRoll < 0.42) {
    // Dribble event — traits + weather + fatigue + momentum influence success
    const dribbler = pickBallCarrier(attackingTeam, 'attack');
    const dribblerFitness = estimateFitness(dribbler, newState.minute, weatherDrainMod);
    const fatigueMod = getFatigueMultiplier(dribblerFitness);
    const momentumMod = momentum ? getMomentumMultiplier(momentum, attackingTeam.id, home.id) : 1.0;
    const baseDribbleSuccess = 0.55 * (atkStrength / (atkStrength + defStrength * 0.5));
    const traitDribbleSuccess = applyDribbleTraits(baseDribbleSuccess, dribbler);
    const dribbleSuccess = applyWeatherToDribble(traitDribbleSuccess, weather) * fatigueMod * (0.95 + (momentumMod - 0.9) * 0.25);
    const success = Math.random() < dribbleSuccess;
    const x = isHomePossession ? 55 + Math.random() * 30 : 20 + Math.random() * 30;
    const y = 10 + Math.random() * 48;
    const traits = computeTraitMultipliers(dribbler);
    const traitNote = traits.dribbleSuccess > 1.15 ? ' (skill move)' : '';
    newState.events = [...newState.events, createEvent(
      newState.tick, 'dribble', attackingTeam.id,
      success
        ? `${dribbler.name} beats the defender${traitNote}`
        : `${dribbler.name} loses the ball while dribbling`,
      x, y, success ? 'success' : 'failure', dribbler.id,
    )];
    if (success) {
      newState.ballPosition = { x: isHomePossession ? x + 5 : PITCH_LENGTH - x - 5, y };
    }
  } else if (eventRoll < 0.58) {
    const shooter = pickBallCarrier(attackingTeam, 'attack');
    const shotX = isHomePossession ? 85 + Math.random() * 15 : 5 + Math.random() * 10;
    const shotY = 30 + Math.random() * 8;
    const traitShotBonus = computeTraitBonus(shooter, 'shot');
    // Momentum + fatigue: consecutive attacks boost goal chance, tired players finish worse
    const momentumMod = momentum ? getMomentumMultiplier(momentum, attackingTeam.id, home.id) : 1.0;
    const shooterFitness = estimateFitness(shooter, newState.minute, weatherDrainMod);
    const fatigueMod = getFatigueMultiplier(shooterFitness);
    const baseGoalChance = ((shooter.attributes.finishing / 20) + traitShotBonus) * (atkStrength / (atkStrength + defStrength)) * 0.35 * momentumMod * fatigueMod;
    const { goalChance: traitGoalChance, onTarget: traitOnTarget } = applyShotTraits(baseGoalChance, 0.45, shooter);
    // Weather affects shot accuracy
    const onTargetChance = applyWeatherToShot(traitOnTarget, weather);
    const onTarget = Math.random() < onTargetChance;
    const isGoal = onTarget && Math.random() < traitGoalChance;

    newState.shots = { ...newState.shots };
    if (isHomePossession) newState.shots.home++;
    else newState.shots.away++;

    if (onTarget) {
      newState.shotsOnTarget = { ...newState.shotsOnTarget };
      if (isHomePossession) newState.shotsOnTarget.home++;
      else newState.shotsOnTarget.away++;
    }

    if (isGoal) {
      // VAR review — small chance goal is disallowed
      const varReview = rollVARReview(newState, 'goal');
      if (varReview && varReview.description.includes('OVERTURNED')) {
        newState.events = [...newState.events, createEvent(
          newState.tick, 'shot', attackingTeam.id,
          varReview.description,
          shotX, shotY, 'failure', shooter.id,
        )];
      } else {
        if (isHomePossession) newState.homeScore++;
        else newState.awayScore++;
        newState.events = [...newState.events, createEvent(
          newState.tick, 'goal', attackingTeam.id,
          getCommentary('goal', shooter.name),
          shotX, shotY, 'success', shooter.id,
        )];
        if (varReview) {
          newState.events = [...newState.events, createEvent(
            newState.tick, 'goal', attackingTeam.id,
            varReview.description,
            shotX, shotY, 'neutral', shooter.id,
          )];
        }
      }
    } else if (onTarget) {
      // GK decision AI: enhanced save logic with punch/catch/parry + rebounds
      const gk = defendingTeam.players.find((p) => p.position === 'GK');
      if (gk) {
        const shotPower = shooter.attributes.finishing / 20;
        const shotPlacement = Math.random() * (shooter.attributes.composure / 20);
        const isOneOnOne = Math.random() < 0.15;
        const gkDecision = computeGKDecision(gk, shotPower, shotPlacement, isOneOnOne);
        const saved = Math.random() < gkDecision.saveChance;
        if (saved) {
          const actionDesc = gkDecision.action === 'catch' ? 'catches' : gkDecision.action === 'punch' ? 'punches clear' : gkDecision.action === 'dive' ? 'dives to save' : 'parries';
          newState.events = [...newState.events, createEvent(
            newState.tick, 'save', defendingTeam.id,
            `${gk.name} ${actionDesc} from ${shooter.name}!`,
            shotX, shotY, 'success', gk.id,
          )];
          // Rebound chance based on GK handling quality
          if (Math.random() < gkDecision.reboundChance) {
            const rebounder = pickBallCarrier(attackingTeam, 'attack');
            if (Math.random() < 0.30) {
              if (isHomePossession) newState.homeScore++;
              else newState.awayScore++;
              newState.events = [...newState.events, createEvent(
                newState.tick, 'goal', attackingTeam.id,
                `${rebounder.name} pounces on the rebound!`,
                shotX, shotY, 'success', rebounder.id,
              )];
            }
          }
        } else {
          if (isHomePossession) newState.homeScore++;
          else newState.awayScore++;
          newState.events = [...newState.events, createEvent(
            newState.tick, 'goal', attackingTeam.id,
            `${shooter.name} scores! ${gk.name} couldn't hold it!`,
            shotX, shotY, 'success', shooter.id,
          )];
        }
      } else {
        if (isHomePossession) newState.homeScore++;
        else newState.awayScore++;
        newState.events = [...newState.events, createEvent(
          newState.tick, 'goal', attackingTeam.id,
          `${shooter.name} scores into the empty net!`,
          shotX, shotY, 'success', shooter.id,
        )];
      }
    } else {
      newState.events = [...newState.events, createEvent(
        newState.tick, 'shot', attackingTeam.id,
        getCommentary('shot', shooter.name),
        shotX, shotY, 'failure', shooter.id,
      )];
    }
    newState.ballPosition = { x: shotX, y: shotY };
  } else if (eventRoll < 0.70) {
    const tackler = pickBallCarrier(defendingTeam, 'defense');
    const baseTackleSuccess = defStrength * pressingMod / (defStrength + atkStrength);
    const { success: traitTackleSuccess, foulChance } = applyTackleTraits(baseTackleSuccess, tackler);
    const success = Math.random() < traitTackleSuccess;
    const x = isHomePossession ? 50 + Math.random() * 30 : 20 + Math.random() * 30;
    const y = 10 + Math.random() * 48;

    if (!success && Math.random() < foulChance) {
      newState.fouls = { ...newState.fouls };
      if (isHomePossession) newState.fouls.away++;
      else newState.fouls.home++;
      newState.events = [...newState.events, createEvent(
        newState.tick, 'foul', defendingTeam.id,
        getCommentary('foul', tackler.name),
        x, y, 'failure', tackler.id,
      )];
      if (Math.random() < 0.15) {
        newState.events = [...newState.events, createEvent(
          newState.tick, 'yellow_card', defendingTeam.id,
          getCommentary('yellow_card', tackler.name),
          x, y, 'neutral', tackler.id,
        )];
        newState.stoppages++;
      }
      // Red card chance (rare)
      if (Math.random() < 0.03) {
        newState.redCards = { ...newState.redCards };
        if (defendingTeam.id === home.id) newState.redCards.home++;
        else newState.redCards.away++;
        newState.sentOff = [...newState.sentOff, tackler.id];
        newState.events = [...newState.events, createEvent(
          newState.tick, 'red_card', defendingTeam.id,
          `🟥 RED CARD! ${tackler.name} is sent off!`,
          x, y, 'neutral', tackler.id,
        )];
        newState.stoppages += 2;
      }
      // Free kick event after foul
      newState.events = [...newState.events, createEvent(
        newState.tick, 'free_kick', attackingTeam.id,
        `Free kick for ${attackingTeam.name}`,
        x, y, 'neutral',
      )];
      // Injury check: fouled player may be injured
      const fouledPlayer = pickBallCarrier(attackingTeam, 'midfield');
      const injury = rollInjury(fouledPlayer, newState.minute, true);
      if (injury) {
        newState.events = [...newState.events, createEvent(
          newState.tick, 'foul', attackingTeam.id,
          `⚕️ ${injury.playerName} is injured (${injury.type}, ~${injury.roundsOut} rounds out)`,
          x, y, 'failure', injury.playerId,
        )];
        newState.stoppages += 2;
      }
    } else {
      newState.events = [...newState.events, createEvent(
        newState.tick, 'tackle', defendingTeam.id,
        getCommentary('tackle', tackler.name),
        x, y, success ? 'success' : 'failure', tackler.id,
      )];
    }
  } else if (eventRoll < 0.80) {
    const x = isHomePossession ? 90 + Math.random() * 10 : 5 + Math.random() * 5;
    const y = Math.random() * 68;
    newState.corners = { ...newState.corners };
    if (isHomePossession) newState.corners.home++;
    else newState.corners.away++;
    newState.events = [...newState.events, createEvent(
      newState.tick, 'corner', attackingTeam.id,
      `Corner kick for ${attackingTeam.name}`,
      x, y, 'neutral',
    )];
    // Set piece routine: corner has a chance to produce a shot
    if (Math.random() < 0.25) {
      const header = pickBallCarrier(attackingTeam, 'attack');
      const headerChance = (header.attributes.heading / 20) * 0.3;
      if (Math.random() < headerChance) {
        if (isHomePossession) newState.homeScore++;
        else newState.awayScore++;
        newState.events = [...newState.events, createEvent(
          newState.tick, 'goal', attackingTeam.id,
          `${header.name} heads in from the corner!`,
          isHomePossession ? 95 : 10, 34, 'success', header.id,
        )];
      }
    }
  } else if (eventRoll < 0.87) {
    // Offside event
    const runner = pickBallCarrier(attackingTeam, 'attack');
    const x = isHomePossession ? 80 + Math.random() * 20 : 5 + Math.random() * 15;
    const y = 10 + Math.random() * 48;
    newState.events = [...newState.events, createEvent(
      newState.tick, 'offside', attackingTeam.id,
      `${runner.name} is caught offside`,
      x, y, 'failure', runner.id,
    )];
  } else if (eventRoll < 0.93) {
    // Throw-in event
    const x = isHomePossession ? 60 + Math.random() * 30 : 10 + Math.random() * 30;
    const y = Math.random() < 0.5 ? 1 : 67;
    newState.events = [...newState.events, createEvent(
      newState.tick, 'throw_in', attackingTeam.id,
      `Throw-in for ${attackingTeam.name}`,
      x, y, 'neutral',
    )];
  } else {
    movePlayersTowardFormation(newState, home, away, isHomePossession);
  }

  movePlayersTowardFormation(newState, home, away, isHomePossession);

  // Stamina drain per tick — players tire as minutes progress
  // Trait `staminaDrain` multiplier + weather drain mod affect how fast players tire
  if (newState.tick % 30 === 0) { // Every 30 ticks (~0.5 min)
    const minuteFactor = newState.minute / 90; // 0→1 as match progresses
    newState.playerPositions = newState.playerPositions.map((pp) => {
      const team = pp.teamId === home.id ? home : away;
      const player = team.players.find((p) => p.id === pp.playerId);
      if (!player) return pp;
      const traits = computeTraitMultipliers(player);
      const drain = 0.3 * minuteFactor * traits.staminaDrain * weatherDrainMod;
      // Tired players drift from formation position
      return { ...pp, targetX: pp.targetX + (Math.random() - 0.5) * drain * 2, targetY: pp.targetY + (Math.random() - 0.5) * drain * 2 };
    });
  }

  // Derby effects — same-city matches have heightened aggression and card chance
  const isDerby = home.city === away.city;
  if (isDerby && newState.tick % 60 === 0 && Math.random() < 0.15) {
    const aggressor = Math.random() < 0.5 ? home : away;
    const aggressorPlayer = aggressor.players[Math.floor(Math.random() * 11)];
    newState.fouls = { ...newState.fouls };
    if (aggressor.id === home.id) newState.fouls.home++;
    else newState.fouls.away++;
    newState.events = [...newState.events, createEvent(
      newState.tick, 'foul', aggressor.id,
      `🔥 Derby intensity! ${aggressorPlayer.name} commits a fiery challenge`,
      newState.ballPosition.x, newState.ballPosition.y, 'failure', aggressorPlayer.id,
    )];
    // Higher card chance in derbies
    if (Math.random() < 0.25) {
      newState.events = [...newState.events, createEvent(
        newState.tick, 'yellow_card', aggressor.id,
        `🟨 ${aggressorPlayer.name} booked for a reckless derby tackle`,
        newState.ballPosition.x, newState.ballPosition.y, 'neutral', aggressorPlayer.id,
      )];
    }
  }

  // Match-day events: injuries, VAR, penalties (rare random rolls)
  const injury = rollMatchDayInjury(newState, attackingTeam);
  if (injury) {
    newState.events = [...newState.events, createEvent(
      newState.tick, 'foul', injury.teamId ?? attackingTeam.id,
      injury.description, newState.ballPosition.x, newState.ballPosition.y, 'neutral', injury.playerId,
    )];
  }

  const penalty = rollPenalty(newState, attackingTeam);
  if (penalty) {
    newState.events = [...newState.events, createEvent(
      newState.tick, penalty.type === 'penalty_awarded' ? 'goal' : 'shot',
      penalty.teamId ?? attackingTeam.id,
      penalty.description, isHomePossession ? 97 : 8, 34,
      penalty.type === 'penalty_awarded' ? 'success' : 'failure', penalty.playerId,
    )];
    if (penalty.type === 'penalty_awarded') {
      if (isHomePossession) newState.homeScore++;
      else newState.awayScore++;
    }
  }

  return newState;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function movePlayersTowardFormation(state: MatchState, home: Team, away: Team, homeHasBall: boolean): void {
  const homeSlots = getFormationSlots(home.tactics.formation);
  const awaySlots = getFormationSlots(away.tactics.formation);

  // Shift formation toward ball side: attacking team pushes up, defending team drops back
  const homeShift = homeHasBall ? 8 : -5;
  const awayShift = homeHasBall ? -5 : 8;

  state.playerPositions = state.playerPositions.map((pp) => {
    const isHome = pp.teamId === home.id;
    const team = isHome ? home : away;
    const slots = isHome ? homeSlots : awaySlots;
    const playerIdx = team.players.findIndex((p) => p.id === pp.playerId);
    if (playerIdx < 0 || playerIdx >= slots.length) return pp;

    const player = team.players[playerIdx];
    const slot = slots[playerIdx];
    const hasPossession = isHome ? homeHasBall : !homeHasBall;
    const shift = isHome ? homeShift : awayShift;

    let targetX = isHome ? slot.baseX + shift : PITCH_LENGTH - slot.baseX - shift;
    let targetY = isHome ? slot.baseY : PITCH_WIDTH - slot.baseY;

    // Off-ball movement: contextual runs based on position and possession
    if (hasPossession) {
      // Attackers make forward runs toward the box
      if (['ST', 'CAM'].includes(player.position)) {
        targetX += isHome ? 6 : -6;
        // Strikers drift toward center for crosses
        targetY += (PITCH_WIDTH / 2 - targetY) * 0.2;
      }
      // Wingers stay wide and push up to stretch defense
      if (['LW', 'RW'].includes(player.position)) {
        targetX += isHome ? 4 : -4;
        const wideBias = player.position === 'LW' ? -4 : 4;
        targetY += wideBias;
      }
      // Fullbacks overlap when team is attacking
      if (['LB', 'RB'].includes(player.position) && Math.random() < 0.3) {
        targetX += isHome ? 8 : -8;
      }
    } else {
      // Defending: track back, compress space
      if (['ST', 'LW', 'RW', 'CAM'].includes(player.position)) {
        // Forwards drop back to press
        targetX += isHome ? -3 : 3;
      }
      if (['LB', 'RB'].includes(player.position)) {
        // Fullbacks tuck in when defending
        targetY += (PITCH_WIDTH / 2 - targetY) * 0.15;
      }
    }

    const drift = 2;
    const newTargetX = clamp(targetX + (Math.random() - 0.5) * drift, 2, PITCH_LENGTH - 2);
    const newTargetY = clamp(targetY + (Math.random() - 0.5) * drift, 2, PITCH_WIDTH - 2);

    const lerp = 0.06;
    return {
      ...pp,
      x: clamp(pp.x + (newTargetX - pp.x) * lerp, 1, PITCH_LENGTH - 1),
      y: clamp(pp.y + (newTargetY - pp.y) * lerp, 1, PITCH_WIDTH - 1),
      targetX: newTargetX,
      targetY: newTargetY,
    };
  });
}

export function simulateMinutes(state: MatchState, home: Team, away: Team, minutes: number, weather: WeatherCondition = 'clear'): MatchState {
  let current = state;
  const ticksToSim = minutes * TICKS_PER_MINUTE;
  for (let i = 0; i < ticksToSim && current.status !== 'full_time'; i++) {
    current = simulateTick(current, home, away, weather);
    // Cap events array to prevent unbounded memory growth
    if (current.events.length > 200) {
      current = { ...current, events: current.events.slice(-150) };
    }
  }
  return current;
}
