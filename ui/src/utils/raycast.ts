import { Vector, Query } from "matter-js";

// source: https://github.com/liabru/matter-js/issues/181#issuecomment-164615987
export const raycast = (bodies: Matter.Body[], start: Vector, rotation: Vector, dist: number) => {
  const normRay = Vector.normalise(rotation);
  for (let i = 0; i < dist; i++) {
    const ray = Vector.add(start, Vector.mult(normRay, i));
    const body = Query.point(bodies, ray)[0];
    if (body) {
      return { point: ray, body };
    }
  }
  return;
};
