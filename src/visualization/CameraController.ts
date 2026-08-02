import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private spherical: THREE.Spherical;
  private isDragging = false;
  private lastMouse = { x: 0, y: 0 };
  private container: HTMLElement;
  private followBall = true;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;
    this.target = new THREE.Vector3(52.5, 0, 34);
    this.spherical = new THREE.Spherical(90, Math.PI / 3.5, 0);

    this.updateCameraPosition();

    container.addEventListener('mousedown', this.onMouseDown);
    container.addEventListener('mousemove', this.onMouseMove);
    container.addEventListener('mouseup', this.onMouseUp);
    container.addEventListener('wheel', this.onWheel, { passive: false });
    container.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private updateCameraPosition(): void {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
  }

  setFollowBall(follow: boolean): void {
    this.followBall = follow;
  }

  update(ballX: number, ballZ: number): void {
    if (this.followBall && !this.isDragging) {
      this.target.x += (ballX - this.target.x) * 0.03;
      this.target.z += (ballZ - this.target.z) * 0.03;
      this.updateCameraPosition();
    }
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0 || e.button === 2) {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.lastMouse = { x: e.clientX, y: e.clientY };

    if (e.buttons === 1) {
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2.2, this.spherical.phi - dy * 0.005));
    } else if (e.buttons === 2) {
      const panSpeed = 0.1;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      right.crossVectors(this.camera.getWorldDirection(new THREE.Vector3()), up).normalize();
      this.target.addScaledVector(right, -dx * panSpeed);
      this.target.z += dy * panSpeed;
    }
    this.updateCameraPosition();
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.spherical.radius = Math.max(30, Math.min(200, this.spherical.radius + e.deltaY * 0.05));
    this.updateCameraPosition();
  };

  resetView(): void {
    this.spherical.set(90, Math.PI / 3.5, 0);
    this.target.set(52.5, 0, 34);
    this.followBall = true;
    this.updateCameraPosition();
  }

  dispose(): void {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('wheel', this.onWheel);
  }
}
