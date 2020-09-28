import { Track } from "../race/track";
import { Point, Line } from "../../core/types";
import { ICarState } from "../race/car";

export type ISensorCalculationResult = {
  sensorLine: Line,
  intersectionPoints: Point[],
  sensorTarget: Point,
  nearestLength: number,
  // nearest collision detected mapped between 1 and 0 (1 not found 0 crashed)
  nearestMapped: number,
};

export class Sensors {
  public readonly pointsRelative: readonly Point[];

  public calculateSensorDetection(track: Track, car: ICarState) {
    return this.pointsRelative.map((sensorRelative) => {
      const sensorTarget: Point = sensorRelative.rotateRad(car.heading.angleRad).plus(car.pos);

      const sensorLine: Line = new Line({ p1: car.pos, p2: sensorTarget });

      const intersectionPoints = track.road.lines
        .map((x) => x.Intersection(sensorLine))
        .filter((x) => x !== undefined
        ) as Point[];

      const nearestLength = Math.min(...intersectionPoints
        .concat(sensorTarget)
        .map((x) => x.distance(car.pos))
      );

      const nearestMapped = nearestLength / sensorRelative.magnitude;

      return { sensorLine, intersectionPoints, sensorTarget, nearestLength, nearestMapped } as ISensorCalculationResult;
    });
  }

  public constructor(pointsRelative: Point[]) {
    this.pointsRelative = pointsRelative;
  }
}