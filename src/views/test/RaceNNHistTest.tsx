import React from "react";
import track01 from "../../core/race/testingTracks/track01";
import { Point } from "../../core/types";
import { createRaceNN, evalRaceNN } from "../../core/raceAI/raceNN";
import { RRaceNNHist } from "../race/RaceNNHist";

const track = track01;

const sensors = [
  new Point({ x: 100, y: 0, }),
  new Point({ x: 80, y: -30, }),
  new Point({ x: 80, y: 30, }),
];

const nn = createRaceNN({ nnInit: { hiddenLayers: [10, 20,], }, numSensors: sensors.length, });

const raceNNHist = evalRaceNN({
  nn,
  sensors,
  track,
  maxTime: 10,
});

export const RRaceNNHistTest = () => {
  return <RRaceNNHist history={raceNNHist} />;
};
