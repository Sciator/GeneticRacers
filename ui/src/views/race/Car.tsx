import React from "react";
import { Car } from "../../logic/race/car";
import { ISensorCalculationResult } from "../../logic/raceAI/sensor";
import { RPoint } from "../../components/svg/RPoint";

type Props = {
  children: Car;
  sensors?: ISensorCalculationResult[]
};

const RCar: React.FC<Props> = ({ children: car, sensors }) => {
  const { heading, pos: { x, y }, } = car.state;

  const width = 20;
  const height = 10;

  return <>
    <g transform={`translate(${x}, ${y}) rotate(${heading.angleDeg + 0}) scale(1)`}>
      <rect
        width={width}
        height={height}
        color="black"
        x={-width / 2}
        y={-height / 2}
      />
    </g>
    {sensors && sensors.map(x => x.intersectionPoints.map(y=>(<RPoint>{y}</RPoint>)))}
    {/*
    {sensors && sensors.map(x => (<RLine>{x.sensorLine}</RLine>))}
    {sensors && sensors.map(x => (<RPoint>{x.sensorTarget}</RPoint>))}
     */}
  </>;
};

export default RCar;
