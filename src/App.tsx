import React, { useState } from 'react';

import Grid from '@material-ui/core/Grid';
import { GeneticAlgorithm } from './views/GeneticAlgorithm';
import { SvgTest } from './components/svg/tests/svgTest';
import { RSvgContainer } from './components/svg/RSvgContainer';
import { RPolygon } from './components/svg/RPolygon';
import { IPoly } from './core/types';
import { UserRace } from './views/race/UserRace';

let c=0;

const App: React.FC = () => {
  return (
    <div className="Main" style={{ height: "100%" }}>
      <UserRace />
      {/*
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
