import track01 from "./track01";
import track02 from "./track02";
import track03 from "./track03";
import { Track } from "../track";

export enum ETracks { Track01, Track02, Track03 }

export const getTrack = (e: ETracks): Track => {
  switch (e) {
    case ETracks.Track01:
      return track01;
    case ETracks.Track02:
      return track02;
    case ETracks.Track03:
      return track03;
  }
};


