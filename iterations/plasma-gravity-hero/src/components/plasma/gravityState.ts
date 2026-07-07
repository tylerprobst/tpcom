import { Raycaster, Vector2, Vector3, type Camera } from "three";
import {
  ALIGN_THRESHOLD,
  GRAVITY_DEPTH,
  MAX_MISALIGN,
  type GravityPointer,
  smoothstep,
} from "./plasmaConstants";

const ndc = new Vector2();
const raycaster = new Raycaster();
const gravityVec = new Vector3();
const orbCenter = new Vector3();
const orbCenterNdc = new Vector3();

export function updateGravityState(
  pointer: GravityPointer,
  camera: Camera,
  orbY = 0,
): void {
  ndc.set(pointer.x, pointer.y);
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.at(GRAVITY_DEPTH, gravityVec);

  pointer.gravity[0] = gravityVec.x;
  pointer.gravity[1] = gravityVec.y;
  pointer.gravity[2] = gravityVec.z;

  orbCenter.set(0, orbY, 0);
  orbCenterNdc.copy(orbCenter).project(camera);
  const dx = pointer.x - orbCenterNdc.x;
  const dy = pointer.y - orbCenterNdc.y;
  pointer.misalignment = Math.sqrt(dx * dx + dy * dy);
  pointer.pullStrength = pointer.active
    ? smoothstep(ALIGN_THRESHOLD, MAX_MISALIGN, pointer.misalignment)
    : 0;
}