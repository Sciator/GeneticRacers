import React from 'react';
import { RSvgContainer } from '../../components/svg/RSvgContainer';
import { MRace, IMCarRaceState } from '../../core/race/raceMutable';
import RTrack from './Track';
import RCar from './Car';
import { ICarState } from '../../core/race/car';

type IProps = {
  children: MRace
};

const RRace: React.FC<IProps> = ({ children: race }) => {
  const { cars, track } = race;
  return <>
    <RSvgContainer>
      <RTrack>{track}</RTrack>
      {cars.map((car: IMCarRaceState) => (<RCar sensors={car.sensors && car.sensors.calcResults}>{car.carState}</RCar>))}
    </RSvgContainer>
  </>
}

export default RRace;