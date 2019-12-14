import React from 'react';
import { IPoly, Poly, IPoint } from '../../core/types';

type IProps = {
  children: IPoly | Poly
}

export const RPolygon: React.FC<IProps> = ({ children: poly }) => {

  return (<>
    <polyline
      points={(poly.points as []).map((x: IPoint) => `${x.x},${x.y}`).reduce((a, b) => a + " " + b, "")}
      style={{ fill: "none", stroke: "black", strokeWidth: 3 }}
    />
  </>);
}

