import React, { useEffect, useRef, useState } from "react";
import { Card, Row, Progress, Button, Col } from "antd";
import { randInt, range } from "../core/common";
import { Bot, GameAiLiveTrain } from "../logic/gameAi/GameAiLiveTrain";
import { GameAiEval } from "../logic/gameAi/GameAiEval";
import { Game } from "../logic/game/game";
import { NeuralNet } from "../logic/ai/nn/nn";

type TRunProps = {
  onSnapshot?: (evaler: NeuralNet[]) => void,
};

// todo: every progress show different target

const maxSteps = 100;
const fps = 1;
const targetDeltaTime = 1_000 / fps;

type BotSnapshot = { bots: Bot[], popsize: number };
const createBotSnapshot = (bots: Bot[], samples: number): BotSnapshot => {
  return { bots: bots.slice(0, samples).map(x => ({ ...x })), popsize: bots.length };
}


const BotData = ({ popsize, bots, calculations }: BotSnapshot & { calculations: number }) => <>
  <Row>
    <Col sm={24}>
      Bots: {popsize} Calculations done: {calculations}
    </Col>
  </Row>
  <Row gutter={[0, 12]}>
    {
      bots.map(({ bonus, games, health, lastGame, wins }) => {
        return <Col sm={24}>
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
                  {wins.toLocaleString().padStart(5, " ")} : Wins
            </Row>
                <Row>
                  {lastGame.toLocaleString().padStart(5, " ")} : last
            </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      }
      )
    }
  </Row>
</>;

const fakeSnapshot: BotSnapshot = {
  bots: range(10).map(() => ({
    bonus: Math.random(),
    health: Math.random(),
    wins: randInt(1000),
    games: randInt(1000),
    lastGame: randInt(1000),
    nn: undefined as any,
  })), popsize: 100
};

export const RunAI: React.FC<TRunProps> = ({ onSnapshot }) => {
  const [running, setRunning] = useState(false);
  const aiLiveRef = useRef(new GameAiLiveTrain({ hiddens: [10, 5] }, {}));
  const botSnapshotRef = useRef<BotSnapshot>(fakeSnapshot);
  const calculationsDoneRef = useRef(0);

  const stepsTime = useRef(1_000);

  const start = () => {
    setRunning(true);
    console.log("start clicked");
  };

  const [lastUpdate, setLastUpdate] = useState(Date.now());
  useEffect(() => {
    if (!running) return;

    const steps = Math.max(1, Math.min(maxSteps,
      Math.floor(targetDeltaTime * 1.5 / stepsTime.current)));

    const t1 = Date.now();
    for (let i = steps; i--;) {
      aiLiveRef.current.next();
    }
    calculationsDoneRef.current += steps;
    const delta = Date.now() - t1;
    stepsTime.current = delta / steps;

    // console.log(`steps ${steps} current ${delta} target ${targetDeltaTime.toFixed(0)}`);

    if (lastUpdate + targetDeltaTime < Date.now()) {
      const snapshot = botSnapshotRef.current = createBotSnapshot(aiLiveRef.current.bots, 20);
      onSnapshot?.(snapshot.bots.slice(0, 2).map(x => x.nn));
    };

    setTimeout(() => {
      setLastUpdate(Date.now());
    })
  }, [lastUpdate, setLastUpdate, running])


  const button = running
    ? <Button type="ghost" onClick={() => setRunning(false)}>Stop</Button>
    : <Button type="primary" onClick={start}>Start</Button>
    ;

  return <>
    <Card title="Run AI" extra={button}>
      <BotData {...botSnapshotRef.current} calculations={calculationsDoneRef.current} />
    </Card>
  </>;
};
