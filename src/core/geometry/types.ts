
export interface IPoint {
  x: number,
  y: number
}

//? https://math.stackexchange.com/questions/352828/increase-length-of-line

export class Point {
  public x: number;
  public y: number;


  constructor();
  constructor(x: number, y: number); 
  constructor(x?: number, y?: number){
    this.x = x || 0;
    this.y = y || 0;
  }
}

export class Position {
  public point: Point;
  /** směr kam míří v stupních */
  public heading: number;

  constructor(point: Point = new Point(0,0), heading:number = 0){
    this.point = point;
    this.heading = heading;
  }
}

