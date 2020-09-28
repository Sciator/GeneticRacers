import React from "react";
import { RaceHist } from "./GUI";
import { ListItem, List, ListItemText, Paper } from "@material-ui/core";

type IProps = {
  list: RaceHist[],
  onSelect: (h: RaceHist) => void,
};


export const RaceList: React.FC<IProps> = ({ list, onSelect }) => {
  return <>
    <Paper style={{ height:"100vh", width: 200, overflowY: "scroll" }}>
      <List>
        {list.map(x =>
          <ListItem button onClick={() => { onSelect(x); }}>
            <ListItemText primary={"max score: " + Math.round(Math.max(...x.gann.scores) * 100)} />
          </ListItem>
        )}
      </List>
    </Paper>
  </>;
};
