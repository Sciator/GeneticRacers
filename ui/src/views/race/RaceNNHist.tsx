import React from "react";
import RRace from "./Race";
import { Race } from "../../logic/race/race";
import { defaultDT } from "../../logic/race/car";

type IProps = {
  history: Race[],
};


export const RRaceNNHist: React.FC<IProps> = ({ history }) => {
  const [timeStart] = React.useState(Date.now());

  const [race, setRace] = React.useState(history[0]);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const previousTimeRef = React.useRef<number>();
  const requestRef = React.useRef<number>();

  const animate = () => {
    const time = Date.now();

    const timeFromStart = time - timeStart;

    const histIndex = Math.round(timeFromStart / (defaultDT * 1000)*4);

    if (histIndex < history.length) {
      setRace(history[histIndex]);
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
  // todo: find better solution
  /* eslint-disable */
  }, []);
  /* eslint-enable */

  return (<>
    <div style={{ height: 300, width: 300 }}>
      <RRace>{race}</RRace>
    </div>
  </>);
};

