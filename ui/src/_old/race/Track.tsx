import React from "react";
import { RPolygon } from "../svg/RPolygon";
import { RPoint } from "../svg/RPoint";
import { Point } from "../types";
import { ITrack } from "../logic/race/track";

type Props = {
  children: ITrack
};

const RTrack: React.FC<Props> = ({ children: track }) => {
  return <>
    <RPolygon>
      {track.road}
    </RPolygon>
    {track.checkpoints.map((x: Point) => (<RPoint>{x}</RPoint>))}
  </>;
};

export default RTrack;
