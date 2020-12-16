import { Card, Row, Col } from "antd";
import React, { useState } from "react";
import { PlayPage } from "./Play";
import { RunAI } from "./RunAI";
import { NeuralNet } from "../logic/ai/nn/nn";
// import { GameAI } from "../logic/gameAi/GameAi";
// import { Analyze } from "./Analyze";
// import { Settings, TSettingState } from "./Settings";
// import { History } from "./History";
// import { GameAiEval } from "../logic/gameAi/GameAiEval";

// const { defaultInitParams } = GameAI;

type TMainPageProps = {

};

export const MainPage: React.FC<TMainPageProps> = () => {
  // const [aiSettings, setAiSettings] = useState<TSettingState>(defaultInitParams as any);
  const [snapshot, setSnapshot] = useState<NeuralNet[] | undefined>(undefined);

  return <>
    <Card>
      <Row gutter={[8, 0]}>
        {/* <Col xxl={8}>
          <Settings {...{aiSettings, setAiSettings}} />
        </Col> */}
        {/* <Col xxl={8}> */}
        {/* <Col sm={8}> */}
        <Row gutter={[8, 8]}>
          <Col sm={8}>
            <RunAI onSnapshot={(e) => setSnapshot(e)} />
          </Col>
          <Col sm={16}>
            <PlayPage snapshot={snapshot} />
          </Col>
        </Row>
        {/* </Col> */}
        {/* </Col> */}
        {/* <Col xxl={8}>
          <Row gutter={[0, 8]} >
            <Col xxl={24}>
              <Analyze />
            </Col>
            <Col xxl={24}>
              <History />
            </Col>
          </Row>
        </Col> */}
      </Row>
    </Card>
  </>;
};
