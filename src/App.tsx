import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import { GeneticAlgorithm } from "./views/GeneticAlgorithm";
import { UserRace } from "./views/race/UserRace";
import { RRaceNNHistTest } from "./views/test/RaceNNHistTest";
import { RAutoRaceGANN } from "./views/race/AutoRaceGANN";

const App: React.FC = () => {
  
  return (
    <div className="Main" style={{ height: "100%" }}>
      <RAutoRaceGANN />
      {/*
      <RRaceNNHistTest />
      <UserRace></UserRace>
      <Grid container justify="center">
        <Grid item >
          <GeneticAlgorithm />
        </Grid>
      </Grid>
      */}
    </div>
  );
}

export default App;
