import React, { Dispatch, FC, SetStateAction } from "react";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { IGeneticAlgorithmNeuralNetInit } from "../logic/ai/gann/gann";
import { produce } from "immer";
import { GameAI, GameAIInitParams } from "../logic/gameAi/GameAi";
import { IASelectionFunctionType } from "../logic/ai/ga/gaProcesGenerationFunction";

export type TSettingState = GameAIInitParams;

type TSettingsProps = {
  aiSettings: TSettingState,
  setAiSettings: Dispatch<SetStateAction<TSettingState>>,
};

export const Settings: FC<TSettingsProps> = (props) => {
  const { aiSettings, setAiSettings } = props;
  const {
    gaInit: { popSize },
    nnInit: { },
  } = aiSettings;

  return <>
    <Card title="Settings" style={{ overflowY: "auto", height: "100%" }}>
      <Form colon={false} labelCol={{ xxl: 6, style: { userSelect: "none" } }} wrapperCol={{ xxl: 18 }}>
        <Form.Item label={<div />} style={{ userSelect: "none" }}>
          Genetic algorithm:
        </Form.Item>
        <Form.Item label="Max generations">
          <Input
          ></Input>
        </Form.Item>
        <Form.Item label="Population size">
          <Input
            value={popSize}
            onChange={e => setAiSettings(produce(aiSettings, x => { x.gaInit.popSize = +e.target.value; }))}
          ></Input>
        </Form.Item>
        <Form.Item label="Parents">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Mutation rate">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Selection type">
          <Select>

          </Select>
        </Form.Item>
        <Form.Item label="Selection param">
          <Input></Input>
        </Form.Item>

        <Form.Item label={<div />} style={{ userSelect: "none" }}>
          Neural net
        </Form.Item>
        <Form.Item label="Layers">
          <Row gutter={[0, 8]}>
            <Col xxl={24}>
              <Input value="5" disabled={true} type="number" addonAfter="Input"></Input>
            </Col>
            <Col xxl={24}>
              <Input.Group compact>
                <Input value="10" style={{ width: "calc(100% - 50px)" }}></Input>
                <Button type="dashed" style={{ width: "50px" }}><CloseOutlined translate /></Button>
              </Input.Group>
            </Col>
            <Col xxl={24}>
              <Button
                type="dashed"
                // onClick={() => add()}
                icon={<PlusOutlined translate="" />}
              >Add layer</Button>
            </Col>
            <Col xxl={24}>
              <Input value="3 <placeholder>" readOnly={true} tabIndex={-1} addonAfter="Output"></Input>
            </Col>
          </Row>

        </Form.Item>

        <Form.Item label={<div />} style={{ userSelect: "none" }}>
          Race
        </Form.Item>
        <Form.Item label="Sensors">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Handling">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Friction">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Track">
          <Input></Input>
        </Form.Item>

        <Form.Item label={<div />} style={{ userSelect: "none" }}>
          Simulation
        </Form.Item>
        <Form.Item label="Delta time">
          <Input></Input>
        </Form.Item>
        <Form.Item label="Max time">
          <Input></Input>
        </Form.Item>
      </Form>
    </Card>
  </>;
};

/*
{
      gaInit: {
        popSize: e.popSize,
        proccessFunction: {
          breedingParents: 1,
          mutationRate: e.mutation,
          selection: {
            type: e.selectionType,
            value: e.selectionValue,
          },
        },
      },
      nnInit: { hiddenLayers: e.hiddenLayers },
      raceParams: {
        carTemplate: {
          sensors:
            new Sensors([
              new Point({ x: 100, y: 0, }),

              new Point({ x: 80, y: -30, }),
              new Point({ x: 80, y: 30, }),

              new Point({ x: 80, y: -50, }),
              new Point({ x: 80, y: 50, }),
            ]),
          physics: {
            handling: 3,
            friction: .5,
          },
        },
        track: e.track,
      },
      simParams: {
        dt: defaultDT,
        maxTime: 50,
      },
    }
*/
