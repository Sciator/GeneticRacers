import React, { useState } from "react";
import { RaceMenu, IMenuStartEvent } from "./RaceMenu";
import { RaceList } from "./RaceList";
import { RRaceNNHist } from "./RaceNNHist";
import { RaceGANN } from "../../logic/raceAI/raceGANN";
import { Sensors } from "../../logic/raceAI/sensor";
import { Point } from "../../core/types";
import { range } from "../../core/common";
import { Race } from "../../logic/race/race";
import { defaultDT } from "../../logic/race/car";
import { LineChart, Line } from "recharts";

type IProps = {

};

export type RaceHist = {
  gann: RaceGANN
};

export const GUI: React.FC<IProps> = () => {
  const [hist, setHist] = useState([] as RaceHist[]);


  const onStart = (e: IMenuStartEvent) => {
    const racegann = RaceGANN.create({
      gaInit: {
        popSize: e.popSize,
        proccessFunction: {
          breedingParents: 1,
          mutationRate: e.mutation,
          selection: {
            type: e.selectionType,
            value: e.selectionValue,
          },
        },
      },
      nnInit: { hiddenLayers: e.hiddenLayers },
      raceParams: {
        carTemplate: {
          sensors:
            new Sensors([
              new Point({ x: 100, y: 0, }),

              new Point({ x: 80, y: -30, }),
              new Point({ x: 80, y: 30, }),

              new Point({ x: 80, y: -50, }),
              new Point({ x: 80, y: 50, }),
            ]),
          physics: {
            handling: 3,
            friction: .5,
          },
        },
        track: e.track,
      },
      simParams: {
        dt: defaultDT,
        maxTime: 50,
      },
    });

    setHist([{ gann: racegann }]);

    let current = racegann;
    const localHist = [{ gann: racegann }];


    range(e.maxGen).forEach(() => {
      if (Math.max(...current.scores) !== 1) {
        current = current.update();
        localHist.push({ gann: current });
        setHist(localHist);
      }
    });
  };

  const [histDisplay, setHistDisplay] = useState(null as Race[] | null);

  return <>
    <div>
      <div style={{ float: "left", width: 300 }}>
        <RaceMenu onStart={onStart} />
        {
          hist &&
          <LineChart width={300} height={100}
            data={hist.map((x, i) =>
              ({ name: i, value: Math.max(...x.gann.scores), }))}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        }
      </div>
      <div style={{ float: "left" }}>
        <RaceList
          list={hist}
          onSelect={(h) => {
            setHistDisplay(null);
            setTimeout(
              () => setHistDisplay(h.gann.racenn.evalHistory())
            );
          }} />
      </div>
      <div style={{ float: "left" }}>

        {histDisplay &&
          <RRaceNNHist history={histDisplay}></RRaceNNHist>
        }
      </div>

      <div style={{ clear: "both" }}></div>
    </div>
  </>;
};
