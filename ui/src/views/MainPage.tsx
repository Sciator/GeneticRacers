import { Card, Row, Col } from "antd";
import React from "react";
import { Analyze } from "./Analyze";
import { PlayPage } from "./Play";
import { Settings } from "./Settings";
import { History } from "./History";

type TMainPageProps = {

};

export const MainPage: React.FC<TMainPageProps> = () => {

  return <>
    <Card>
      <Row gutter={[8, 0]}>
        <Col xxl={8}>
          <Settings />
        </Col>
        <Col xxl={8}>
          <PlayPage />
        </Col>
        <Col xxl={8}>
          <Row gutter={[0, 8]} >
            <Col xxl={24}>
              <Analyze />
            </Col>
            <Col xxl={24}>
              <History />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  </>;
};
