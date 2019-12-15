import React from 'react';
import { RSvgContainer } from '../../components/svg/RSvgContainer';
import { MRace, IMCarRaceState } from '../../core/race/raceMutable';
import RTrack from './Track';
import RCar from './Car';
import { ICarState } from '../../core/race/car';
import { IRaceState, IRaceCarState } from '../../core/race/race';

type IProps = {
  children: IRaceState
};

const RRace: React.FC<IProps> = ({ children: race }) => {
  const { car, track } = race;
  return <>
    <RSvgContainer>
      <RTrack>{track}</RTrack>
      {((car: IRaceCarState) => (<RCar>{car.carState}</RCar>))(car)}
    </RSvgContainer>
  </>
}

export default RRace;