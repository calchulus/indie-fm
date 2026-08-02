import * as THREE from 'three';

export type AnimationState = 'idle' | 'run' | 'sprint' | 'kick' | 'tackle' | 'celebrate' | 'save' | 'header';

export interface PlayerAnimation {
  state: AnimationState;
  startTime: number;
  duration: number;
}

const ANIMATION_DURATIONS: Record<AnimationState, number> = {
  idle: Infinity,
  run: 0.6,
  sprint: 0.4,
  kick: 0.5,
  tackle: 0.7,
  celebrate: 2.0,
  save: 0.8,
  header: 0.6,
};

// Procedural animation system — animates capsule players without skeletal meshes
export class PlayerAnimator {
  private animations: Map<string, PlayerAnimation> = new Map();
  private clock: THREE.Clock;

  constructor() {
    this.clock = new THREE.Clock();
  }

  triggerAnimation(playerId: string, state: AnimationState): void {
    this.animations.set(playerId, {
      state,
      startTime: this.clock.getElapsedTime(),
      duration: ANIMATION_DURATIONS[state],
    });
  }

  update(mesh: THREE.Object3D, playerId: string, velocity: number): void {
    const time = this.clock.getElapsedTime();
    const anim = this.animations.get(playerId);

    // Default: bob based on velocity (running animation)
    if (!anim || time - anim.startTime > anim.duration) {
      this.animations.delete(playerId);
      if (velocity > 0.5) {
        // Running bob
        const bobSpeed = velocity > 2 ? 12 : 8;
        const bobAmount = velocity > 2 ? 0.15 : 0.08;
        mesh.position.y = 1.5 + Math.sin(time * bobSpeed) * bobAmount;
        // Slight lean forward when running
        mesh.rotation.x = velocity > 2 ? 0.1 : 0.05;
        mesh.rotation.z = 0;
      } else {
        // Idle breathing
        mesh.position.y = 1.5 + Math.sin(time * 2) * 0.02;
        mesh.rotation.x = 0;
        mesh.rotation.z = 0;
      }
      return;
    }

    const elapsed = time - anim.startTime;
    const progress = Math.min(1, elapsed / anim.duration);

    switch (anim.state) {
      case 'kick': {
        // Wind up then strike
        const windUp = Math.sin(progress * Math.PI);
        mesh.rotation.x = -windUp * 0.4;
        mesh.position.y = 1.5 + windUp * 0.1;
        break;
      }
      case 'tackle': {
        // Lunge forward and down
        const lunge = Math.sin(progress * Math.PI);
        mesh.rotation.x = lunge * 0.6;
        mesh.position.y = 1.5 - lunge * 0.5;
        break;
      }
      case 'celebrate': {
        // Jump and spin
        const jump = Math.abs(Math.sin(progress * Math.PI * 3));
        mesh.position.y = 1.5 + jump * 0.8;
        mesh.rotation.y = progress * Math.PI * 4;
        break;
      }
      case 'save': {
        // Dive to the side
        const dive = Math.sin(progress * Math.PI);
        mesh.rotation.z = dive * 1.2;
        mesh.position.y = 1.5 - dive * 0.6;
        break;
      }
      case 'header': {
        // Jump and lean forward
        const jump = Math.sin(progress * Math.PI);
        mesh.position.y = 1.5 + jump * 0.5;
        mesh.rotation.x = jump * 0.5;
        break;
      }
      case 'sprint': {
        const bob = Math.sin(time * 14) * 0.12;
        mesh.position.y = 1.5 + bob;
        mesh.rotation.x = 0.15;
        break;
      }
      default:
        mesh.position.y = 1.5;
        mesh.rotation.set(0, 0, 0);
    }
  }

  // Determine animation from match events
  triggerFromEvent(playerId: string, eventType: string): void {
    switch (eventType) {
      case 'goal': this.triggerAnimation(playerId, 'celebrate'); break;
      case 'shot': this.triggerAnimation(playerId, 'kick'); break;
      case 'save': this.triggerAnimation(playerId, 'save'); break;
      case 'tackle': this.triggerAnimation(playerId, 'tackle'); break;
      case 'pass': this.triggerAnimation(playerId, 'kick'); break;
    }
  }
}
