const calcPrecisionComparisonLine = 8;

export type IFReal = (x: number) => number;


export type IPoint = { readonly x: number, readonly y: number };
export class Point {
  public readonly x: number;
  public readonly y: number;

  public plus(other: Point) {
    const { x, y } = this;
    const { x: ox, y: oy } = other;
    return new Point({ x: x + ox, y: y + oy });
  }

  public minus(other: Point) {
    const { x, y } = this;
    const { x: ox, y: oy } = other;
    return new Point({ x: x - ox, y: y - oy });
  }

  public multiply(multiplier: number) {
    const { x, y } = this;
    return new Point({ x: x * multiplier, y: y * multiplier });
  }

  public rotateRad(radians: number): Point {
    const { x, y } = this;
    const [cosTheta, sinTheta] = [Math.cos(radians), Math.sin(radians)];

    return new Point({
      x: cosTheta * x - sinTheta * y,
      y: cosTheta * y + sinTheta * x,
    });
  }

  public get magnitude(): number {
    const { x, y } = this;
    return Math.sqrt(x * x + y * y);
  }

  public distance(other: Point): number {
    const { x, y } = other.minus(this);
    return Math.sqrt(x * x + y * y);
  }

  public get angleDeg() {
    const angle = Math.atan2(this.y, this.x);   // radians
    // you need to devide by PI, and MULTIPLY by 180:
    const degrees = 180 * angle / Math.PI;  // degrees
    return (360 + Math.round(degrees)) % 360; // round number, avoid decimal fragments
  }

  public get angleRad() {
    const angle = Math.atan2(this.y, this.x);   // radians
    return angle;
  }

  constructor({ x, y }: IPoint) {
    this.x = x;
    this.y = y;
  }
}

export type ILine = { readonly p1: (IPoint | Point), readonly p2: (IPoint | Point) };
export class Line {
  public readonly p1: Point;
  public readonly p2: Point;

  public distanceFromPoint(p: Point) {
    const { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } } = this;
    const { x, y } = p;

    const a = x - x1;
    const b = y - y1;
    const c = x2 - x1;
    const d = y2 - y1;

    const dot = a * c + b * d;
    const lenSq = c * c + d * d;

    const param = (lenSq !== 0) ? dot / lenSq : -1;

    const { xx, yy } = (() => {
      if (param < 0) {
        return {
          xx: x1,
          yy: y1,
        };
      }
      else if (param > 1) {
        return {
          xx: x2,
          yy: y2,
        };
      }
      else {
        return {
          xx: x1 + param * c,
          yy: y1 + param * d,
        };
      }
    })();

    return Math.sqrt(((x - xx) ** 2) + ((y - yy) ** 2));
  }

  public Intersection(other: Line): Point | undefined {
    const { p1, p2 } = this;
    const { p1: p1o, p2: p2o } = other;

    const a1 = p2.y - p1.y;
    const b1 = p1.x - p2.x;
    const c1 = a1 * (p1.x) + b1 * (p1.y);

    const a2 = p2o.y - p1o.y;
    const b2 = p1o.x - p2o.x;
    const c2 = a2 * (p1o.x) + b2 * (p1o.y);

    const determinant = a1 * b2 - a2 * b1;

    if (determinant !== 0) {
      const x = (b2 * c1 - b1 * c2) / determinant;
      const y = (a1 * c2 - a2 * c1) / determinant;

      // intersection point
      const i = new Point({ x, y });


      if (
        ((p1.distance(i) + p2.distance(i)).toPrecision(calcPrecisionComparisonLine)
          === (p1.distance(p2)).toPrecision(calcPrecisionComparisonLine)) &&
        ((p1o.distance(i) + p2o.distance(i)).toPrecision(calcPrecisionComparisonLine)
          === (p1o.distance(p2o)).toPrecision(calcPrecisionComparisonLine))
      ) {
        return i;
      }
    }
  }

  constructor({ p1, p2 }: ILine) {
    this.p1 = p1 instanceof Point ? p1 : new Point(p1);
    this.p2 = p2 instanceof Point ? p2 : new Point(p2);

    const {Intersection,distanceFromPoint} = this;
    [Intersection,distanceFromPoint].forEach(__=>__.bind(this));
  }
}

export type IPoly = { points: readonly (Point | IPoint)[] };
export class Poly {
  public readonly points: readonly Point[];

  public get lines() {
    const { points } = this;
    const len = points.length;
    return points.map((p1, p1i) => new Line({ p1, p2: points[(p1i + 1) % len] }));
  }

  constructor({ points }: IPoly) {
    this.points = points.map((p) => p instanceof Point ? p : new Point(p));
  }
}

