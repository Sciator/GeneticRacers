import { Card, Row, Progress, Button } from "antd";
import React, { useState } from "react";
import { GeneticAlgorithmNeuralNet } from "../logic/ai/gann/gann";

type TRunProps = {

};

// todo: every progress show different target

export const RunAI: React.FC<TRunProps> = ({ }) => {
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true)
  };



  return <>
    <Card title="Run AI" extra={<Button type="primary" onClick={start} disabled={running} loading={running}>Start</Button>}>
      <Row>
        <Progress status={running ? "active" : "normal"}></Progress>
      </Row>
    </Card>
  </>;
};
