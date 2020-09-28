import React, { useState } from "react";

import { GUI } from "./views/race/GUI";

const App: React.FC = () => {

  return (
    <div className="Main" style={{ height: "100vh" }}>
      <GUI></GUI>
    </div>
  );
};

export default App;
