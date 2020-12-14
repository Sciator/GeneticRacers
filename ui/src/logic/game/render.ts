import { Render, Events } from "matter-js";
import { keyCaptureStart, capturedKeys } from "../../core/keycapture";
import { renderPoint, renderLine } from "../../utils/rendererUtils";
import { Game, GameInput } from "./game";

export type GameRenderProps = {
  game: Game,
  element: HTMLElement,
  width: number,
  height: number,
  debug?: boolean,
  input: (delta: number) => GameInput,
};

export const gameRender = async (props: GameRenderProps) => {
  const { game, element, height, width, debug = false, input } = props;

  const engine = game.engine;

  // create renderer
  const render = Render.create({
    element,
    engine,
    options: {
      width,
      height,

      background: "#ffffff",
      wireframeBackground: "#0f0f13",
      wireframes: false,

      ...(debug
        ? {
          wireframes: true,
          showVelocity: true,
          showCollisions: true,
          showSeparations: true,
          showAngleIndicator: true,
        } : {}),
    } as any,
  });

  Render.run(render);

  // fit the render viewport to the scene
  (Render as any).lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: game.settings.map.size, y: game.settings.map.size },
  });

  Events.on(render, "afterRender", () => {
    game.gameState.players.forEach((_p, pi) => {
      const res = game.sensor(pi);
      const playerPos = game.gameState.players[pi].body.position;

      res.forEach(res => {
        renderPoint(render, res.point);
        renderLine(render, playerPos, res.point);
      });
    });
  });


  let last = Date.now();
  const step = () => {
    const now = Date.now();
    const delta = now - last;
    last = now;

    const inputRes = input(delta);

    game.next(inputRes, delta);
  };

  const rafLoop = () => {
    step();
    if (!game.isGameOver) {
      requestAnimationFrame(rafLoop);
    } else {
      // todo: print winner on canvas
      console.log(`winner is ${game.gameState.winner}`);
    }
  };
  requestAnimationFrame(rafLoop);
};
