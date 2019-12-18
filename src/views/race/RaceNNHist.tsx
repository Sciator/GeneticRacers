import React from "react";
import RRace from "./Race";
import { IRaceNNHist } from "../../core/raceAI/raceNN";
import { raceGetCurrentScore } from "../../core/race/race";

type IProps = {
  history: IRaceNNHist,
  onHistDone?: () => void,
}

export const RRaceNNHist: React.FC<IProps> = ({ history: { dt, history }, onHistDone }) => {
  const [delta, setDelta] = React.useState(0);
  const [timeStart, setTimeStart] = React.useState(Date.now());

  const [race, setRace] = React.useState(history[0]);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const previousTimeRef = React.useRef<number>();
  const requestRef = React.useRef<number>();

  const animate = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
    }

    const timeFromStart = time - timeStart;

    const histIndex = Math.round(timeFromStart / (dt * 1000));

    if (histIndex < history.length) {
      setRace(history[histIndex]);
    }else{
      setTimeout(()=>{
        onHistDone && onHistDone();
      })
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
  }, []);


  const time = Date.now();

  const timeFromStart = time - timeStart;

  const histIndex = Math.round(timeFromStart / dt);

  return (<>
    <div style={{ height: 300, width: 300 }}>
      <RRace>{race}</RRace>
    </div>
    <div style={{ whiteSpace: "revert" }}>
      {JSON.stringify(timeFromStart)}
      <br />
      {JSON.stringify(race.car.carState.engineOn)}
      {JSON.stringify(race.car.carState.turnDirection)}
      <br />
      {JSON.stringify(raceGetCurrentScore(race))}
      <br />
      {JSON.stringify(race.car.carState.pos)}
      <br />
      {JSON.stringify(race.car.raceState)}
      <br />
      {JSON.stringify(race.car.currentCheckpoint)}
    </div>
  </>);
}

