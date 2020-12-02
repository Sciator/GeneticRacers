import { Point, Poly } from "../../../types";
import { ITrack, Track } from "../track";

const track01: ITrack = {
  checkpoints: [
    new Point({ x: 25, y: 170 }),
    new Point({ x: 20, y: 80 }),
    new Point({ x: 45, y: 20 }),
    new Point({ x: 120, y: 20 }),
    new Point({ x: 115, y: 170 }),
  ],
  road: new Poly({
    points: [
      {
        x: 2,
        y: 187,
      },
      {
        x: 6,
        y: 50,
      },
      {
        x: 38,
        y: 6,
      },
      {
        x: 142,
        y: 6,
      },
      {
        x: 142,
        y: 119,
      },
      {
        x: 134,
        y: 187,
      },
      {
        x: 90,
        y: 187,
      },
      {
        x: 105,
        y: 134,
      },
      {
        x: 105,
        y: 34,
      },
      {
        x: 55,
        y: 36,
      },
      {
        x: 35,
        y: 56,
      },
      {
        x: 49,
        y: 186,
      },
      {
        x: 2,
        y: 187,
      },
    ],
  }),
};

export default new Track(track01);
