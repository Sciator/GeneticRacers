import { ITrack, Track } from "../track";
import { Poly, Point } from "../../../core/types";

const track03: ITrack = {
  checkpoints: [
    new Point({ x: 20, y: 200 }),
    new Point({ x: 20, y: 80 }),
    new Point({ x: 55, y: 45 }),

    new Point({ x: 90, y: 80 }),
    new Point({ x: 90, y: 150 }),

    new Point({ x: 125, y: 185 }),

    new Point({ x: 160, y: 150 }),
    new Point({ x: 160, y: 80 }),
    new Point({ x: 195, y: 45 }),

    new Point({ x: 230, y: 80 }),

    new Point({ x: 230, y: 200 }),
  ],
  road: new Poly({
    points:
      [
        [6.5, 290.49999],
        [6.5, 140.5],
        [36.498979, 100.5],
        [75.25, 100.25],
        [106.49898, 140.5],
        [106.49898, 240.5],
        [145, 240.5],
        [145, 140.5],
        [175, 100.5],
        [215, 100.5],
        [245, 140.5],
        [245, 290.5],
        [215, 290.5],
        [215, 140.5],
        [175, 140.5],
        [175, 240.5],
        [145, 280.5],
        [105, 280.5],
        [76.5, 240.5],
        [76.5, 140.5],
        [36.5, 140.5],
        [36.5, 290.5],
        [6.5, 290.5],
      ].map(p => ({ x: p[0], y: p[1] - 75 })),
  }),
};

export default new Track(track03);

