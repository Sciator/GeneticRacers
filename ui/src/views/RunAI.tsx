import React, { useState } from "react";
import { Card, Row, Progress, Button, Col } from "antd";
import { randInt, range } from "../core/common";
import { GeneticAlgorithmNeuralNet } from "../logic/ai/gann/gann";
import { ColumnHeightOutlined } from "@ant-design/icons";

type Bot = {
  health: number,
  bonus: number,
  games: number,
  lastGame: number,
}

type TRunProps = {

};

// todo: every progress show different target

export const RunAI: React.FC<TRunProps> = ({ }) => {
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true)
  };

  const bots: Bot[] = range(20).map(() => ({
    health: Math.random(),
    bonus: Math.random(),
    games: randInt(10000),
    lastGame: randInt(10000),
  }));


  return <>
    <Card title="Run AI" extra={<Button type="primary" onClick={start} disabled={running} loading={running}>Start</Button>}>
      <Row gutter={[0, 12]}>
        {
          bots.map(({ bonus, games, health, lastGame }) =>
          <Col sm={24}>
            <Card>
              <Row>
                <Col sm={18}>
                  <Row>
                    <Progress percent={bonus * 100} status={"active"} strokeColor={"#f4f711"} format={() => ""}></Progress>
                  </Row>
                  <Row>
                    <Progress percent={health * 100} strokeColor={"red"} format={() => ""}></Progress>
                  </Row>
                </Col>
                <Col sm={6}>
                  <Row>
                    {games.toLocaleString().padStart(5, " ")} : Games
                </Row>
                  <Row>
                    {lastGame.toLocaleString().padStart(5, " ")} : last
                </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          )
        }
      </Row>
    </Card>
  </>;
};
