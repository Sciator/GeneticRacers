import { Track } from "./track";
import { Point, Line } from "../types";
import { ICarState } from "./car";

export type ISensorCalculationResult = {
  sensorLine: Line,
  intersectionPoints: Point[],
  sensorTarget: Point,
  minLength: number,
}

export const calculateSenzorDetection = (track: Track) => {
  return (sensorsRelativePoints: Point[]) => {
    return (car: ICarState) => {
      return sensorsRelativePoints.map(sensorRelative => {
        const sensorTarget: Point = sensorRelative.rotateRad(car.heading.angleRad).plus(car.pos);

        const sensorLine: Line = new Line({ p1: car.pos, p2: sensorTarget });

        const intersectionPoints = track.road.lines
          .map(x => x.Intersection(sensorLine))
          .filter(x => x != undefined
          ) as Point[];

        const minLength = Math.min(...intersectionPoints
          .concat(sensorTarget)
          .map(x => x.distance(car.pos))
        );

        return { sensorLine, intersectionPoints, sensorTarget, minLength } as ISensorCalculationResult;
      });
    };
  };
};


