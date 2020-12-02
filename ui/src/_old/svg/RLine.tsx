import React from "react";
import { ILine } from "../types";

type IProps = {
  children: ILine
};

export const RLine: React.FC<IProps> = ({ children: line, }) => {


  return (<>
    <line x1={line.p1.x} y1={line.p1.y} x2={line.p2.x} y2={line.p2.y}
      style={{ fill: "none", stroke: "black", strokeWidth: 3, }}
    ></line>
  </>);
};

