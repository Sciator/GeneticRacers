// tslint:disable: no-console
import {} from "jest";
import { RaceGANN } from "./raceGANN";
import { IASelectionFunctionType } from "../ai/ga/gaProcesGenerationFunction";
import { Sensors } from "./sensor";
import { Point } from "../../_old/types";
import track01 from "../race/tracks/track01";
import { range } from "../../core/common";


test("raceGANN", () => {
  let racegann = RaceGANN.create({
    gaInit: {
      popSize: 100,
      proccessFunction: {
        breedingParents: 1,
        mutationRate: .3,
        selection: {
          type: IASelectionFunctionType.percent,
          value: 10,
        },
      },
    },
    nnInit: { hiddenLayers: [5, 5] },
    raceParams: {
      carTemplate: {
        sensors:
          new Sensors([
            new Point({ x: 100, y: 0, }),
            new Point({ x: 80, y: -30, }),
            new Point({ x: 80, y: 30, }),
          ]),
      },
      track: track01,
    },
    simParams: {
    },
  });

  range(2).forEach(()=>{
    console.log(racegann.scores);
    racegann = racegann.update();
  });
  console.log(racegann.scores);
});


