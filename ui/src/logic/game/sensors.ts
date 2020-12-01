import { Engine, Vector, Composite, Bodies, Body } from "matter-js";
import { throwReturn } from "../../core/common";
import { raycast } from "../../core/raycast";
import { Game } from "./game";

export type SensorExecutor = ReturnType<typeof createSensorExecutor>;

export const createSensorExecutor = (game: Game) => {
  const {
    engine: { world: { bodies } },
    settings: {
      map: { size },
      ai: {
        sensorMaxRange, sensorSidesArrayAngle,
      } },
  } = game;

  const sensorRalativeAngles = [0]
    .concat(sensorSidesArrayAngle)
    .concat(sensorSidesArrayAngle.map(x => -x))
    ;

  const rayRange = Math.min(size * Math.pow(2, 1 / 2), sensorMaxRange);

  return (body: Body) => {
    const { angle, position: { x, y } } = body;

    const sensorAngles = sensorRalativeAngles
      .map(x => angle + x)
      ;

    const playerVector = Vector.create(x, y);

    return sensorAngles.map(x => {
      const ray = raycast(
        bodies.filter(({ id }) => id !== body.id),
        playerVector,
        Vector.rotate(Vector.create(1, 0), x),
        rayRange
      );
      if (!ray?.point)
        return Vector.add(playerVector, Vector.mult(Vector.normalise(Vector.rotate(Vector.create(1, 0), x)), rayRange));
      else
        return ray.point;
    });
  };
};
