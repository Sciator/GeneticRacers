import { Vector, Query } from "matter-js";

// source: https://github.com/liabru/matter-js/issues/181#issuecomment-164615987
export const raycast = (bodies: Matter.Body[], start: Vector, rotation: Vector, dist: number) => {
  const normRay = Vector.normalise(rotation);
  const current = start;
  for (let i = 0; i < dist; i++) {
    Vector.add(start, normRay, current);
    const body = Query.point(bodies, current)[0];
    if (body) {
      return { point: current, body };
    }
  }
  return;
};
