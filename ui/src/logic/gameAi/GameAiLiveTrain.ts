import * as math from "mathjs";
import { range } from "../../core/common";
import { NeuralNet } from "../ai/nn/nn";
import { Game } from "../game/game";
import { GameAiEval } from "./GameAiEval";


export type GameAiLiveTrainConst = {
  hiddens: number[],
};

export type Bot = {
  health: number,
  bonus: number,
  games: number,
  wins: number,
  lastGame: number,
  nn: NeuralNet,
};



export class GameAiLiveTrain {
  public params = {
    maxPop: 1_000,
    /** for how many games has bot healths */
    healthMultiplier: 4,
    /** how many hp will player get after game when survives */
    healthGrowAfterGame: .2,
    sensors: [Math.PI * 1 / 4, Math.PI * 1 / 8, Math.PI * 1 / 32],
  };

  public bots: Bot[];

  public selectBots() {
    const bots = this.bots;

    const selectedIndex: number[] = math.pickRandom(
      range(bots.length), 2, bots.map(x => Math.max(1, (x.lastGame - 1000) ** 3 - x.games + x.bonus + x.wins ** 2))
    ) as any;

    const selected = selectedIndex.map(x => bots[x]);
    return selected;
  }

  /** calculate next ai steps. increment last of all bots -> select two bots and play with them -> create new bots from maxed up bots */
  public next() {
    const { healthGrowAfterGame, healthMultiplier, maxPop } = this.params;
    const { bots } = this;
    bots.sort((a, b) => - a.games + b.games + (- a.wins + b.wins) * 1_000);

    /** how much is missing to max pop */
    const populationToMaxFrac = (maxPop - bots.length) / maxPop;

    bots.forEach(x => x.lastGame++);

    const selected = this.selectBots();

    const evaler = new GameAiEval(selected.map(x => x.nn), Game.SETTINGS_DEFAULT);

    const startingHealths = selected.map(x => {
      x.health -= 1 / healthMultiplier;
      if (x.health >= 0)
        return 1;

      const minus = x.health * healthMultiplier;
      x.health = 0;
      return 1 + minus;
    });

    evaler.game.gameState.players.map((x, i) => x.health = startingHealths[i]);

    evaler.run();

    const resHealth = evaler.game.gameState.players.map(x => x.health);
    resHealth.forEach((x, i) => {
      const bot = selected[i];
      bot.health += x / healthMultiplier;
      if (x > 0) bot.health += healthGrowAfterGame/healthMultiplier;

      const exceedingHealth = (bot.health - healthMultiplier)*healthMultiplier;
      if (exceedingHealth > 0) {
        bot.health = this.params.healthMultiplier;
        const bonusMultiplier =
          ((populationToMaxFrac > 0) && (populationToMaxFrac < .2)) ? 1
            : (populationToMaxFrac < -0.5) ? .01
              : (populationToMaxFrac < 0) ? .1
                : (populationToMaxFrac > .2) ? 2
                  : (populationToMaxFrac > .5) ? 10
                    : (populationToMaxFrac > .8) ? 20
                      : (populationToMaxFrac > .9) ? 1000
                        : 1
          ;

        bot.bonus += exceedingHealth * bonusMultiplier;
      }
    });

    if (resHealth.some(x => x <= 0))
      resHealth.forEach((x, i) => { if (x > 0) selected[i].wins++; });

    selected.forEach(x => { x.lastGame = 0; x.games++; });

    if (populationToMaxFrac > .9) {
      bots.map(x => x.bonus += .05);
    }

    if (bots.length < 10)
      for (let i = bots.length; i--;) {
        const bot = bots[i];
        bot.health = Math.max(bot.health, 1);
      }


    for (let i = bots.length; i--;) {
      const bot = bots[i];
      if (bot.health <= 0.001) {
        bots.splice(i, 1);
        // console.log("bot died");
      }
    }

    for (let i = bots.length; i--;) {
      const bot = bots[i];
      if (bot.bonus < 1) continue;

      console.log("new bot created");
      bot.bonus--;
      bots.push({ bonus: 0, games: 0, wins: 0, health: this.params.healthMultiplier, lastGame: 0, nn: bot.nn.mutate(.01) });
    }
  }


  constructor(constructorParams: GameAiLiveTrainConst, paramsOveride: Partial<GameAiLiveTrain["params"]>) {
    const params = this.params = { ...this.params, ...paramsOveride };
    const { hiddens } = constructorParams;
    const { sensors } = params;

    this.bots = range(params.maxPop).map(() => ({
      bonus: 0,
      health: params.healthMultiplier,
      games: 0,
      wins: 0,
      lastGame: 0,
      nn: GameAiEval.initializeRandomBot({ hiddens, sensors }),
    }));
  }
}


