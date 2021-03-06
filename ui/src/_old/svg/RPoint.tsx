import React from "react";
import { IPoint } from "../types";

type IProps = {
  children: IPoint,
};

export const RPoint: React.FC<IProps> = (props) => {
  const { children: point, } = { ...props, };

  return (<>
    <circle cx={point.x} cy={point.y} r={5} fill={"black"} ></circle>
  </>);
};

