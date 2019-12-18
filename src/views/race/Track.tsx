import React from "react";
import { colors, CardHeader } from "@material-ui/core";
import RCar from "./Car";
import { ITrack } from "../../core/race/track";
import { RPolygon } from "../../components/svg/RPolygon";
import { RPoint } from "../../components/svg/RPoint";
import { Point } from "../../core/types";

type Props = {
  children: ITrack
};

const RTrack: React.FC<Props> = ({ children:track }) => {
  return <>
    <RPolygon>
      {track.road}
    </RPolygon>
    {track.checkpoints.map((x:Point)=>(<RPoint>{x}</RPoint>))}
  </>
}

export default RTrack;