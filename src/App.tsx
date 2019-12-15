import React, { useState } from 'react';

import Grid from '@material-ui/core/Grid';
import { GeneticAlgorithm } from './views/GeneticAlgorithm';
import { UserRace } from './views/race/UserRace';
import { RRaceNNHistTest } from './views/test/RaceNNHistTest';

const App: React.FC = () => {
  
  return (
    <div className="Main" style={{ height: "100%" }}>
      <RRaceNNHistTest />
      {/*
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
