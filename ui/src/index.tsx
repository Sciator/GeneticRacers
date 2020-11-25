import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "antd/dist/antd.css";

ReactDOM.render(<>
  <style>
    {`
      @font-face {
        font-family: 'Rubik';
        src: local('Rubik'), url(fonts/Rubik.woff) format('woff');
      }

      body {
        margin: 0;
        font-family: Rubik, source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
          monospace;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
`}
  </style>
  <App />
</>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
