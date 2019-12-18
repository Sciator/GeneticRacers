import React from "react";
import { RRaceNNHist } from "./RaceNNHist";
import { initRaceGANN, raceGANNGetHist, evalRaceGANN } from "../../core/raceAI/raceGANN";
import { IRaceNNArg } from "../../core/raceAI/raceNN";
import { IANNData } from "../../core/AI/nn/nn";
import { Point } from "../../core/types";
import track01 from "../../core/race/testingTracks/track01";
import { range } from "../../core/common";

const raceSettings: IRaceNNArg = {
  nn: {} as IANNData,
  sensors: [
    new Point({ x: 100, y: 0 }),
    new Point({ x: 80, y: -30 }),
    new Point({ x: 80, y: 30 }),
  ],
  track: track01,
}

const racegenInitParams = {
  nnInit: {
    hiddenLayers: [5, 5],
  },
  popSize: 30,
  raceNN: raceSettings,
};


type IProps = {

};


export const RAutoRaceGANN: React.FC<IProps> = ({ }) => {
  // const [racegen, setRacegen] = React.useState(initRaceGANN(racegenInitParams));
  // const [timeStart, setTimeStart] = React.useState(Date.now());

  // const onHistDone = ()=>{
  //   setRacegen(evalRaceGANN(racegen));
  //   setTimeStart(Date.now());
  // };

  let racegen = initRaceGANN(racegenInitParams);

  range(50).forEach(()=>{
    racegen = evalRaceGANN(racegen);
  });

  return (<>
    {JSON.stringify(racegen.pop.map(x=>x.fitness).map(Math.round))}
    <RRaceNNHist history={raceGANNGetHist(racegen)[0]} />
  </>);
};
