import React, { useState } from 'react';
import { Paper, Input, TextField, Grid, Button, Slider, Typography, Switch, Select, MenuItem } from '@material-ui/core';
import { IASelectionFunctionType } from '../core/ga/gaProcesGenerationFunction';


export const GeneticAlgorithm: React.FC = () => {
  const [selectType, setSelectType] = useState(IASelectionFunctionType.fixed);

  return <>
    <Paper style={{ padding: 20 }} square>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Population size"
            type="number"
            margin="dense"
            variant="outlined"
            defaultValue={100}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>
            Mutation rate
          </Typography>
          <Slider
            defaultValue={.1}
            step={.01}
            min={0}
            max={1}
            valueLabelDisplay="auto"

          />
        </Grid>

        <Grid item xs={12} >
          <Select
            value={selectType}
            onChange={(e) => setSelectType(e.target.value as any)}
            variant="outlined"
            margin="dense"
            fullWidth
          >
            <MenuItem value={IASelectionFunctionType.percent}>Percent</MenuItem>
            <MenuItem value={IASelectionFunctionType.fixed}>Fixed</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} >
          {selectType === IASelectionFunctionType.fixed
            ? <TextField
              type="number"
              margin="dense"
              variant="outlined"
              fullWidth
            />
            : <Slider
              defaultValue={.1}
              step={.01}
              min={0}
              max={1}
              valueLabelDisplay="auto"
              
            />
          }

        </Grid>



        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth>
            Start
          </Button>
        </Grid>
      </Grid>
    </Paper>
  </>;
}



