import { Point, Poly } from "../types";

export type ITrack = {
  checkpoints: Point[],
  road: Poly,
};

export class Track {
  public readonly road: Poly;
  public readonly checkpoints: Point[];

  constructor({ road, checkpoints }: ITrack) {
    this.road = road;
    this.checkpoints = checkpoints;
  }
};
