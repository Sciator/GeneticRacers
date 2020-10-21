import * as express from "express";
import { existsSync } from "fs";
import * as open from "open";
import * as path from "path";

const dirUiBuild = path.join(__dirname, "../ui/");
// todo: better dev mode detection (cross-env value ?)
const isDev = !existsSync(dirUiBuild);

// todo: 404 not found(and other errors?) - replace html message with json
export const startExpressServer = async () => {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // log request URLs
  app.use((req, _resp, next) => {
    process.stdout.write(`${req.method} ${req.path}\n`);
    next();
  });

  app.listen(port, () => {
    // tslint:disable-next-line: no-console
    console.info(`listening on: http://localhost:${port}`);
  });

  // in dev mode we have no build of ui
  if (!isDev) {
    app.use("/", express.static(dirUiBuild));

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../ui/index.html"));
    });

    open("http://localhost:3000/");
  } else {
    app.get("/", (req, res) => {
      res.redirect("http://localhost:3001/");
    });
  }
};
