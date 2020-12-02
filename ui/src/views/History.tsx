import { Card, Progress, Row } from "antd";
import React from "react";

type THistoryProps = {

};

export const History: React.FC<THistoryProps> = () => {

  return <>
    <Card title="History">
      <Row>
        <Progress ></Progress>
      </Row>

    </Card>
  </>;
};
