import React, { useState } from "react";
import { IASelectionFunctionType } from "../logic/ai/ga/gaProcesGenerationFunction";
import { Track } from "../logic/race/track";
import { ETracks, getTrack } from "../logic/race/tracks/tracks";

type IProps = {
  onStart: (e: IMenuStartEvent) => void,
};

export type IMenuStartEvent = {
  maxGen: number,
  popSize: number,
  mutation: number,
  selectionType: IASelectionFunctionType,
  selectionValue: number,
  hiddenLayers: number[],
  track: Track,
};

export const RaceMenu: React.FC<IProps> = ({ onStart }) => {
  const [maxGen, setMaxGen] = useState(20);
  const [population, setPopulation] = useState(100);
  const [mutation, setMutation] = useState(0.1);
  const [selectionType, setSelectionType] = useState(IASelectionFunctionType.weighted);
  const [selectionValue, setSelectionValue] = useState(10);
  const [hiddenLayers, setHiddenLayers] = useState([5, 10, 5, 3].join(", "));
  const [track, setTrack] = useState(ETracks.Track01);

  // breedingParents

  const onStartClicked = () => {
    const hiddenLayersNum = hiddenLayers.split(",").map(x => +x).filter(x => !isNaN(x));

    onStart({
      popSize: population,
      mutation,
      track: getTrack(track),
      selectionType,
      selectionValue,
      hiddenLayers: hiddenLayersNum,
      maxGen,
    });
  };

  return <>
    {/* <Paper style={{ padding: 20, height: "100%" }} square>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Maximum generations"
            type="number"
            margin="dense"
            variant="outlined"
            defaultValue={50}
            fullWidth

            value={maxGen}
            onChange={(e) => { setMaxGen(+e.target.value); }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Population size"
            type="number"
            margin="dense"
            variant="outlined"
            defaultValue={50}
            fullWidth

            value={population}
            onChange={(e) => { setPopulation(+e.target.value); }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>
            Mutation rate
          </Typography>
          <Slider
            step={.01}
            min={0}
            max={1}
            valueLabelDisplay="auto"

            value={mutation}
            onChange={(e, v) => { setMutation(v as number); }}

          />
        </Grid>
        <Grid item xs={12} >
          <Select
            value={selectionType}
            onChange={(e) => setSelectionType(e.target.value as any)}
            variant="outlined"
            margin="dense"
            fullWidth
          >
            <MenuItem value={IASelectionFunctionType.weighted}>Weighted</MenuItem>
            <MenuItem value={IASelectionFunctionType.percent}>Percent</MenuItem>
            {/*
            <MenuItem value={IASelectionFunctionType.fixed}>Fixed</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} >
          {selectionType !== IASelectionFunctionType.weighted &&
            (selectionType === IASelectionFunctionType.fixed
              ? <TextField
                type="number"
                margin="dense"
                variant="outlined"
                fullWidth
              />
              : <Slider
                step={1}
                min={0}
                max={100}
                valueLabelDisplay="auto"

                value={selectionValue}
                onChange={(e, v) => { setSelectionValue(v as any); }}
              />)
          }

          <Grid item xs={12}>
            <TextField
              label="Hidden layers"
              margin="dense"
              variant="outlined"
              fullWidth

              value={hiddenLayers}
              onChange={(e) => {
                setHiddenLayers(e.target.value);
              }}
            />
          </Grid>

          <Grid item xs={12} >
            <Select
              value={track}
              onChange={(e) => setTrack(e.target.value as any)}
              variant="outlined"
              margin="dense"
              fullWidth
            >
              <MenuItem value={ETracks.Track01}>track 1</MenuItem>
              <MenuItem value={ETracks.Track02}>track 2</MenuItem>
              <MenuItem value={ETracks.Track03}>track 3</MenuItem>
            </Select>
          </Grid>



        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary"
            onClick={onStartClicked}
            fullWidth>
            Start
          </Button>
        </Grid>
      </Grid>
    </Paper>
  */}
  </>;
};

