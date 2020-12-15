import { Card, Row, Col } from "antd";
import React, { useState } from "react";
import { Analyze } from "./Analyze";
import { PlayPage } from "./Play";
import { Settings, TSettingState } from "./Settings";
import { History } from "./History";
import { RunAI } from "./RunAI";
import { GameAI } from "../logic/gameAi/GameAi";

const {defaultInitParams} = GameAI;

type TMainPageProps = {

};

export const MainPage: React.FC<TMainPageProps> = () => {
  const [aiSettings, setAiSettings] = useState<TSettingState>(defaultInitParams as any);

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
              <RunAI />
            </Col>
            <Col sm={16}>
              <PlayPage />
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
