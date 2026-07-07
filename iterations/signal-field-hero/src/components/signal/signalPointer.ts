import { Raycaster, Vector2, Vector3, type Camera } from "three";
import { type SignalPointer } from "./signalConstants";

const ndc = new Vector2();
const raycaster = new Raycaster();
const hit = new Vector3();
const planeNormal = new Vector3(0, 0, 1);
const planePoint = new Vector3(0, 0, 0);
const originToPlane = new Vector3();

export function updateSignalPointer(
  pointer: SignalPointer,
  camera: Camera,
  dt: number,
): void {
  ndc.set(pointer.x, pointer.y);
  raycaster.setFromCamera(ndc, camera);

  const denom = planeNormal.dot(raycaster.ray.direction);
  if (Math.abs(denom) > 1e-5) {
    const t =
      originToPlane.copy(planePoint).sub(raycaster.ray.origin).dot(planeNormal) /
      denom;
    hit.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, t);
    pointer.worldX = hit.x;
    pointer.worldY = hit.y;
  }

  const targetStrength = pointer.active;
  pointer.strength += (targetStrength - pointer.strength) * Math.min(1, dt * 8);
}