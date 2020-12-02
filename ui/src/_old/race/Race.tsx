import React from "react";
import { Race } from "../logic/race/race";
import { RaceCar } from "../logic/race/raceCar";
import { RSvgContainer } from "../svg/RSvgContainer";
import RCar from "./Car";
import RTrack from "./Track";

type IProps = {
  children: Race
};

const RRace: React.FC<IProps> = ({ children: race }) => {
  const { cars, track } = race;
  return <>
    <RSvgContainer>
      <RTrack>{track}</RTrack>
      {cars.map((car: RaceCar) => (<RCar>{car.carState}</RCar>))}
    </RSvgContainer>
  </>;
};

export default RRace;
