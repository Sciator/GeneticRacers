import React from "react";
import { RSvgContainer } from "../../components/svg/RSvgContainer";
import RTrack from "./Track";
import RCar from "./Car";
import { Race } from "../../logic/race/race";
import { RaceCar } from "../../logic/race/raceCar";

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
