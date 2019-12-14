import { range } from "./common";

const calcPrecisionComparisonLine = 8;

export type IFunctionReal = (x: number) => number;


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
    })
  };

  public get magnitude(): number {
    const { x, y } = this;
    return Math.sqrt(x * x + y * y);
  }

  public distance(other: Point): number {
    const { x, y } = other.minus(this);
    return Math.sqrt(x * x + y * y);
  }

  public get angleDeg() {
    var angle = Math.atan2(this.y, this.x);   //radians
    // you need to devide by PI, and MULTIPLY by 180:
    var degrees = 180 * angle / Math.PI;  //degrees
    return (360 + Math.round(degrees)) % 360; //round number, avoid decimal fragments
  }

  public get angleRad() {
    var angle = Math.atan2(this.y, this.x);   //radians
    return angle;
  }

  constructor({ x, y }: IPoint) {
    this.x = x;
    this.y = y;
  }
}

export type ILine = { readonly p1: (IPoint | Point), readonly p2: (IPoint | Point) }
export class Line {
  public readonly p1: Point;
  public readonly p2: Point;

  public Intersection(other: Line): Point | undefined {
    const { p1, p2 } = this;
    const { p1: p1o, p2: p2o } = other;

    let a1 = p2.y - p1.y;
    let b1 = p1.x - p2.x;
    let c1 = a1 * (p1.x) + b1 * (p1.y);

    let a2 = p2o.y - p1o.y;
    let b2 = p1o.x - p2o.x;
    let c2 = a2 * (p1o.x) + b2 * (p1o.y);

    const determinant = a1 * b2 - a2 * b1;

    if (determinant !== 0) {
      const x = (b2 * c1 - b1 * c2) / determinant;
      const y = (a1 * c2 - a2 * c1) / determinant;

      // intersection point
      const i = new Point({ x, y });;


      if (
        (p1.distance(i) + p2.distance(i)).toPrecision(calcPrecisionComparisonLine) === (p1.distance(p2)).toPrecision(calcPrecisionComparisonLine) &&
        (p1o.distance(i) + p2o.distance(i)).toPrecision(calcPrecisionComparisonLine) === (p1o.distance(p2o)).toPrecision(calcPrecisionComparisonLine)
      ) {
        return i;
      }
    }
  }

  constructor({ p1, p2 }: ILine) {
    this.p1 = p1 instanceof Point ? p1 : new Point(p1);
    this.p2 = p2 instanceof Point ? p2 : new Point(p2);
  }
}

export type IPoly = { points: readonly (Point | IPoint)[] }
export class Poly {
  public readonly points: readonly Point[];

  public get lines() {
    const { points } = this;
    const len = points.length;
    return points.map((p1, p1i) => new Line({ p1, p2: points[(p1i + 1) % len] }))
  }

  constructor({ points }: IPoly) {
    this.points = points.map(p => p instanceof Point ? p : new Point(p));
  }
}

