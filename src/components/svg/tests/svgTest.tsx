import React from 'react';
import { RSvgContainer } from '../RSvgContainer';
import { RPolygon } from '../RPolygon';
import { Poly, Line } from '../../../core/types';
import { RPoint } from '../RPoint';
import { RLine } from '../RLine';


export const SvgTest = () => {
  const poly: Poly = new Poly({
    points: [
      { x: 20, y: 20 },
      { x: 40, y: 25 },
      { x: 60, y: 40 },
      { x: 80, y: 120 },
      { x: 120, y: 140 },
      { x: 200, y: 180 },
    ]
  });

  return (<>
    <RSvgContainer>
      <RPolygon>{poly}</RPolygon>
      <RLine>{new Line({ p1: { x: 10, y: 20 }, p2: { x: 20, y: 30 } })}</RLine>
      <RPoint>{{ x: 10, y: 20 }}</RPoint>
    </RSvgContainer>
  </>)
}



