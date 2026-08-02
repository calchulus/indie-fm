import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH } from '../types';

export interface StadiumConfig {
  name: string;
  capacity: number;
  tiers: number;
  roofed: boolean;
  cornerStands: boolean;
}

export function createStadium(scene: THREE.Scene, config: StadiumConfig): THREE.Group {
  const stadium = new THREE.Group();

  const standHeight = config.tiers * 12;
  const standDepth = 20;
  const standColor = 0x3a3a4a;
  const seatColor = 0x555577;

  const sides: Array<{ x: number; z: number; rotY: number; length: number }> = [
    { x: PITCH_LENGTH / 2, z: -standDepth / 2 - 2, rotY: 0, length: PITCH_LENGTH + 10 },
    { x: PITCH_LENGTH / 2, z: PITCH_WIDTH + standDepth / 2 + 2, rotY: 0, length: PITCH_LENGTH + 10 },
    { x: -standDepth / 2 - 2, z: PITCH_WIDTH / 2, rotY: Math.PI / 2, length: PITCH_WIDTH + 10 },
    { x: PITCH_LENGTH + standDepth / 2 + 2, z: PITCH_WIDTH / 2, rotY: Math.PI / 2, length: PITCH_WIDTH + 10 },
  ];

  for (const side of sides) {
    // Tiered stands (each tier is a separate box, stepped back and up)
    for (let tier = 0; tier < config.tiers; tier++) {
      const tierHeight = 12;
      const tierDepth = standDepth / config.tiers;
      const tierY = tier * tierHeight + tierHeight / 2 - 2;
      const tierZOffset = tier * (tierDepth + 1);

      const standGeo = new THREE.BoxGeometry(side.length, tierHeight, tierDepth);
      const standMat = new THREE.MeshLambertMaterial({ color: standColor });
      const stand = new THREE.Mesh(standGeo, standMat);

      if (side.rotY === 0) {
        const zDir = side.z < PITCH_WIDTH / 2 ? -1 : 1;
        stand.position.set(side.x, tierY, side.z + zDir * tierZOffset);
      } else {
        const xDir = side.x < PITCH_LENGTH / 2 ? -1 : 1;
        stand.position.set(side.x + xDir * tierZOffset, tierY, side.z);
        stand.rotation.y = side.rotY;
      }
      stadium.add(stand);
    }

    // Seat face (visible colored surface)
    const seatGeo = new THREE.BoxGeometry(side.length - 2, standHeight - 2, 2);
    const seatMat = new THREE.MeshLambertMaterial({ color: seatColor });
    const seats = new THREE.Mesh(seatGeo, seatMat);
    const seatOffset = standDepth / 2 - 1;
    if (side.rotY === 0) {
      seats.position.set(side.x, standHeight / 2, side.z + (side.z < PITCH_WIDTH / 2 ? seatOffset : -seatOffset));
    } else {
      seats.position.set(side.x + (side.x < PITCH_LENGTH / 2 ? seatOffset : -seatOffset), standHeight / 2, side.z);
      seats.rotation.y = side.rotY;
    }
    stadium.add(seats);
  }

  // --- CROWD: InstancedMesh of tiny colored boxes in the stands ---
  const crowdCount = Math.min(config.capacity / 5, 4000); // Cap at 4000 for performance
  const crowdGeo = new THREE.BoxGeometry(0.6, 0.9, 0.4);
  const crowdMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const crowd = new THREE.InstancedMesh(crowdGeo, crowdMat, crowdCount);
  const dummy = new THREE.Object3D();
  const crowdColors = [
    new THREE.Color(0xe63946), new THREE.Color(0x457b9d), new THREE.Color(0xf4a261),
    new THREE.Color(0x2a9d8f), new THREE.Color(0xe9c46a), new THREE.Color(0x264653),
    new THREE.Color(0xffffff), new THREE.Color(0xaaaaaa), new THREE.Color(0x6a4c93),
  ];

  let crowdIdx = 0;
  for (const side of sides) {
    const fansPerSide = Math.floor(crowdCount / 4);
    for (let i = 0; i < fansPerSide && crowdIdx < crowdCount; i++) {
      const along = (Math.random() - 0.5) * (side.length - 4);
      const tier = Math.floor(Math.random() * config.tiers);
      const height = tier * 12 + 2 + Math.random() * 8;
      const depth = (Math.random() - 0.5) * (standDepth - 4);

      if (side.rotY === 0) {
        dummy.position.set(side.x + along, height, side.z + depth);
      } else {
        dummy.position.set(side.x + depth, height, side.z + along);
      }
      dummy.rotation.y = side.rotY + (Math.random() - 0.5) * 0.3;
      dummy.updateMatrix();
      crowd.setMatrixAt(crowdIdx, dummy.matrix);
      crowd.setColorAt(crowdIdx, crowdColors[Math.floor(Math.random() * crowdColors.length)]);
      crowdIdx++;
    }
  }
  crowd.instanceMatrix.needsUpdate = true;
  if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
  stadium.add(crowd);

  if (config.cornerStands) {
    const corners = [
      { x: -5, z: -5 },
      { x: PITCH_LENGTH + 5, z: -5 },
      { x: -5, z: PITCH_WIDTH + 5 },
      { x: PITCH_LENGTH + 5, z: PITCH_WIDTH + 5 },
    ];
    for (const corner of corners) {
      const geo = new THREE.CylinderGeometry(8, 10, standHeight * 0.7, 8);
      const mat = new THREE.MeshLambertMaterial({ color: standColor });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(corner.x, standHeight * 0.35 - 2, corner.z);
      stadium.add(mesh);
    }
  }

  if (config.roofed) {
    const roofGeo = new THREE.BoxGeometry(PITCH_LENGTH + 50, 1, PITCH_WIDTH + 50);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a, transparent: true, opacity: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(PITCH_LENGTH / 2, standHeight + 5, PITCH_WIDTH / 2);
    stadium.add(roof);
  }

  addFloodlights(stadium, standHeight);

  scene.add(stadium);
  return stadium;
}

function addFloodlights(stadium: THREE.Group, height: number): void {
  const positions = [
    { x: -8, z: -8 },
    { x: PITCH_LENGTH + 8, z: -8 },
    { x: -8, z: PITCH_WIDTH + 8 },
    { x: PITCH_LENGTH + 8, z: PITCH_WIDTH + 8 },
  ];

  for (const pos of positions) {
    const poleGeo = new THREE.CylinderGeometry(0.5, 0.8, height + 15, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(pos.x, (height + 15) / 2, pos.z);
    stadium.add(pole);

    const lightGeo = new THREE.BoxGeometry(6, 3, 1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const lightPanel = new THREE.Mesh(lightGeo, lightMat);
    lightPanel.position.set(pos.x, height + 14, pos.z);
    lightPanel.lookAt(PITCH_LENGTH / 2, 0, PITCH_WIDTH / 2);
    stadium.add(lightPanel);

    const spotLight = new THREE.SpotLight(0xffffff, 0.4, 200, Math.PI / 4, 0.5);
    spotLight.position.set(pos.x, height + 14, pos.z);
    spotLight.target.position.set(PITCH_LENGTH / 2, 0, PITCH_WIDTH / 2);
    stadium.add(spotLight);
    stadium.add(spotLight.target);
  }
}

export interface AnimationClip {
  name: string;
  eventTypes: string[];
  duration: number;
}

export const ANIMATION_LIBRARY: AnimationClip[] = [
  { name: 'idle', eventTypes: ['possession'], duration: 2.0 },
  { name: 'run', eventTypes: ['pass'], duration: 0.8 },
  { name: 'sprint', eventTypes: ['possession'], duration: 0.5 },
  { name: 'kick', eventTypes: ['shot', 'pass'], duration: 0.6 },
  { name: 'header', eventTypes: ['shot', 'pass'], duration: 0.5 },
  { name: 'tackle', eventTypes: ['tackle'], duration: 0.7 },
  { name: 'save', eventTypes: ['save'], duration: 0.8 },
  { name: 'celebrate', eventTypes: ['goal'], duration: 3.0 },
  { name: 'foul_reaction', eventTypes: ['foul'], duration: 1.0 },
  { name: 'card_reaction', eventTypes: ['yellow_card', 'red_card'], duration: 1.5 },
];

export function getAnimationForEvent(eventType: string): AnimationClip {
  return ANIMATION_LIBRARY.find((clip) => clip.eventTypes.includes(eventType)) ?? ANIMATION_LIBRARY[0];
}

export interface BroadcastCameraPreset {
  name: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

export const BROADCAST_CAMERAS: BroadcastCameraPreset[] = [
  { name: 'Main Broadcast', position: [52.5, 45, 95], lookAt: [52.5, 0, 34], fov: 50 },
  { name: 'Tactical (Top)', position: [52.5, 100, 34], lookAt: [52.5, 0, 34], fov: 40 },
  { name: 'Behind Goal (Left)', position: [-15, 12, 34], lookAt: [52.5, 2, 34], fov: 60 },
  { name: 'Behind Goal (Right)', position: [120, 12, 34], lookAt: [52.5, 2, 34], fov: 60 },
  { name: 'Corner Cam', position: [-5, 20, -5], lookAt: [70, 0, 34], fov: 55 },
  { name: 'Close Follow', position: [52.5, 15, 55], lookAt: [52.5, 0, 34], fov: 65 },
];
