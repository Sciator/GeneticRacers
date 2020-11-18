import { Layout } from "antd";
import { Header, Content } from "antd/lib/layout/layout";
import React from "react";
import { MainPage } from "./views/MainPage";

const headerHeight = 64;
const contentPadding = 24;

const App: React.FC = () => {


  return (
    <Layout style={{ width: "100vw", height: "100vh" }}>
      <Header style={{ position: "fixed", zIndex: 1, width: "100%", height: headerHeight, color: "white" }}>
        Genetic Racers
      </Header>
      <Content style={{ padding: contentPadding, paddingTop: headerHeight + contentPadding, }}>
        <MainPage />
      </Content>
    </Layout>
  );
};

export default App;
