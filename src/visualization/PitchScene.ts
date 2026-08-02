import * as THREE from 'three';
import { MatchState, PITCH_LENGTH, PITCH_WIDTH } from '../types';
import { CameraController } from './CameraController';
import { PlayerAnimator } from './PlayerAnimator';
import { createStadium, StadiumConfig } from './stadium';

const MAX_PLAYERS = 22;

export class PitchScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private instancedMesh: THREE.InstancedMesh;
  private ballMesh: THREE.Mesh;
  private animationId: number | null = null;
  private container: HTMLElement;
  private cameraController: CameraController;
  private animator: PlayerAnimator;
  private lastRenderTime = 0;
  private readonly RENDER_INTERVAL = 1000 / 30;
  private dummy = new THREE.Object3D();
  private homeColor: THREE.Color = new THREE.Color(0xe63946);
  private awayColor: THREE.Color = new THREE.Color(0x457b9d);

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a472a);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    this.camera.position.set(PITCH_LENGTH / 2, 80, PITCH_WIDTH + 30);
    this.camera.lookAt(PITCH_LENGTH / 2, 0, PITCH_WIDTH / 2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.animator = new PlayerAnimator();

    this.setupLights();
    this.setupPitch();

    // Stadium geometry — stands around the pitch
    const stadiumConfig: StadiumConfig = { name: 'Home Ground', capacity: 40000, tiers: 2, roofed: false, cornerStands: true };
    createStadium(this.scene, stadiumConfig);

    // Instanced mesh for all 22 players — single draw call
    const playerGeo = new THREE.CapsuleGeometry(0.8, 2, 4, 8);
    const playerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.instancedMesh = new THREE.InstancedMesh(playerGeo, playerMat, MAX_PLAYERS);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.count = 0;
    this.scene.add(this.instancedMesh);

    // Ball — low-poly sphere
    const ballGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const ballMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.ballMesh.position.set(PITCH_LENGTH / 2, 0.5, PITCH_WIDTH / 2);
    this.scene.add(this.ballMesh);

    window.addEventListener('resize', this.onResize);
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(50, 100, 30);
    this.scene.add(dir);
  }

  private setupPitch(): void {
    const pitchGeo = new THREE.PlaneGeometry(PITCH_LENGTH + 10, PITCH_WIDTH + 10);
    const pitchMat = new THREE.MeshBasicMaterial({ color: 0x2d8a4e });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(PITCH_LENGTH / 2, -0.1, PITCH_WIDTH / 2);
    this.scene.add(pitch);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });

    const boundary = this.createLineLoop([
      [0, 0], [PITCH_LENGTH, 0], [PITCH_LENGTH, PITCH_WIDTH], [0, PITCH_WIDTH],
    ], lineMat);
    this.scene.add(boundary);

    const halfway = this.createLine([[PITCH_LENGTH / 2, 0], [PITCH_LENGTH / 2, PITCH_WIDTH]], lineMat);
    this.scene.add(halfway);

    const centerCircle = this.createCircle(PITCH_LENGTH / 2, PITCH_WIDTH / 2, 9.15, lineMat);
    this.scene.add(centerCircle);

    const boxWidth = 16.5;
    const boxHeight = 40.32;
    const boxY = (PITCH_WIDTH - boxHeight) / 2;

    this.scene.add(this.createLineLoop([[0, boxY], [boxWidth, boxY], [boxWidth, boxY + boxHeight], [0, boxY + boxHeight]], lineMat));
    this.scene.add(this.createLineLoop([[PITCH_LENGTH, boxY], [PITCH_LENGTH - boxWidth, boxY], [PITCH_LENGTH - boxWidth, boxY + boxHeight], [PITCH_LENGTH, boxY + boxHeight]], lineMat));

    const goalWidth = 7.32;
    const goalY = (PITCH_WIDTH - goalWidth) / 2;
    this.scene.add(this.createLineLoop([[0, goalY], [-2, goalY], [-2, goalY + goalWidth], [0, goalY + goalWidth]], lineMat));
    this.scene.add(this.createLineLoop([[PITCH_LENGTH, goalY], [PITCH_LENGTH + 2, goalY], [PITCH_LENGTH + 2, goalY + goalWidth], [PITCH_LENGTH, goalY + goalWidth]], lineMat));
  }

  private createLineLoop(points: number[][], mat: THREE.LineBasicMaterial): THREE.LineLoop {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array(points.map(([x, y]) => [x, 0.05, y]).flat());
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return new THREE.LineLoop(geo, mat);
  }

  private createLine(points: number[][], mat: THREE.LineBasicMaterial): THREE.Line {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array(points.map(([x, y]) => [x, 0.05, y]).flat());
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return new THREE.Line(geo, mat);
  }

  private createCircle(cx: number, cy: number, radius: number, mat: THREE.LineBasicMaterial): THREE.Line {
    const segments = 32;
    const points: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(cx + Math.cos(angle) * radius, 0.05, cy + Math.sin(angle) * radius);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
    return new THREE.Line(geo, mat);
  }

  update(state: MatchState, homeColor: string, awayColor: string): void {
    this.homeColor.set(homeColor);
    this.awayColor.set(awayColor);

    // Trigger animations from recent events
    const recentEvents = state.events.slice(-3);
    for (const evt of recentEvents) {
      if (evt.playerId) {
        this.animator.triggerFromEvent(evt.playerId, evt.type);
      }
    }

    const count = Math.min(state.playerPositions.length, MAX_PLAYERS);
    this.instancedMesh.count = count;

    for (let i = 0; i < count; i++) {
      const pp = state.playerPositions[i];
      const velocity = Math.sqrt(
        Math.pow(pp.targetX - pp.x, 2) + Math.pow(pp.targetY - pp.y, 2)
      );
      this.dummy.position.set(pp.x, 1.5, pp.y);
      this.animator.update(this.dummy, pp.playerId, velocity);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, pp.teamId === state.homeTeamId ? this.homeColor : this.awayColor);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;

    this.ballMesh.position.x = state.ballPosition.x;
    this.ballMesh.position.z = state.ballPosition.y;

    this.cameraController.update(state.ballPosition.x, state.ballPosition.y);
  }

  start(): void {
    const animate = (time: number) => {
      this.animationId = requestAnimationFrame(animate);
      if (time - this.lastRenderTime < this.RENDER_INTERVAL) return;
      this.lastRenderTime = time;
      this.renderer.render(this.scene, this.camera);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private onResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.cameraController.dispose();
    this.instancedMesh.geometry.dispose();
    (this.instancedMesh.material as THREE.Material).dispose();
    this.ballMesh.geometry.dispose();
    (this.ballMesh.material as THREE.Material).dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
