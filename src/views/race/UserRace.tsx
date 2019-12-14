import React from 'react';
import { keyState } from '../../core/Keys';
import { Race } from '../../core/race/race';
import track01 from '../../core/race/testingTracks/track01';
import { Point } from '../../core/types';
import { Track } from '../../core/race/track';
import RRace from './Race';
import { setCarInputs } from '../../core/race/car';
import { calculateSenzorDetection } from '../../core/race/sensor';

type IProps = {

}
const track = new Track(track01);

const race: Race = new Race(track,
  [{ engineOn: false, heading: new Point({ x: 0, y: -1 }), pos: track01.checkpoints[0], turnDirection: 0, velocity: new Point({ x: 0, y: 0 }) }],
  { acceleration: 300 });

race.cars[0].sensors = {points:
  [
    new Point({x:100,y:0}),
    new Point({x:80,y:-30}),
    new Point({x:80,y:30}),
  ]}

export const UserRace: React.FC<IProps> = () => {
  const [delta, setDelta] = React.useState(0)

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      setDelta(deltaTime);

      race.update(0.05);

      let car = race.cars[0].carState;
      car = setCarInputs(car, keyState.up, (keyState.left && "left") || (keyState.right && "right") || "");
      race.cars[0].carState = car;
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
  }, []);

  return (<>
    <div style={{ height: 300, width: 300 }}>

      <RRace>{race}</RRace>
    </div>
    <div style={{whiteSpace:"revert"}}>
      {delta}
      <br/>
      {JSON.stringify(keyState)}
      <br/>
      {JSON.stringify(race.cars[0].carState.pos)}
      <br/>
      {JSON.stringify(race.cars[0].raceState)}
      <br/>
      {JSON.stringify(race.cars[0].currentCheckpointDist)}
      {JSON.stringify(race.cars[0].currentCheckpoint)}
      <br/>
      {JSON.stringify(race.cars[0].sensors && race.cars[0].sensors.calcResults && race.cars[0].sensors.calcResults[0].minLength)}
    </div>
  </>);
}

