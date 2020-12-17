[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/releases)
[![GitHub Workflow Status build](https://img.shields.io/github/workflow/status/sciator/GeneticRacers/Release?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/releases)
[![GitHub Workflow Status test](https://img.shields.io/github/workflow/status/sciator/GeneticRacers/Tests?label=tests&style=for-the-badge)](https://github.com/sciator/GeneticRacers/actions?query=workflow%3ATests)
[![GitHub last commit](https://img.shields.io/github/last-commit/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/commits/master)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/graphs/commit-activity)
[![Lines of code](https://img.shields.io/tokei/lines/github/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/pulse)
[![GitHub issues](https://img.shields.io/github/issues/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/issues)
[![GitHub](https://img.shields.io/github/license/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/blob/master/license.md)
[![GitHub top language](https://img.shields.io/github/languages/top/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers)

[![Node js](https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Typescript](https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![express](https://img.shields.io/badge/express.js%20-%23404d59.svg?&style=for-the-badge)](https://expressjs.com/)
[![react](https://img.shields.io/badge/react%20-%2320232a.svg?&style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![HTML5](https://img.shields.io/badge/html5%20-%23E34F26.svg?&style=for-the-badge&logo=html5&logoColor=white)](https://www.w3schools.com/html/)

[![git](https://img.shields.io/badge/git%20-%23F05033.svg?&style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![github](https://img.shields.io/badge/github%20-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![github actions](https://img.shields.io/badge/GH%20Actions-%23161616.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/actions)
[![webpack](https://img.shields.io/badge/webpack%20-%238DD6F9.svg?&style=for-the-badge&logo=webpack&logoColor=black)](https://webpack.js.org/)
[![pkg](https://img.shields.io/badge/-%20%20%F0%9F%93%A6PKG-%23777777?&style=for-the-badge&logoColor=white)](https://github.com/vercel/pkg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?&style=for-the-badge&logoColor=white)](https://github.com/semantic-release/semantic-release)


# Usage
 1) Donwload and run executable (for your OS) in Releases.
 1) Application is hosted at `localhost:3000`.
 1) Click start
 1) Wait until some training is done (Calculations done is recommended to be at least 20,000)
 1) Click stop
 1) Click play to see results (game is played between two best bots)
 1) Training can be resumed by clicking Start again

# compiling
## requirements
   - [node](https://nodejs.org/) installed
   - [yarn](https://yarnpkg.com/) installed

## Building executable
 - Run `yarn dist`
 - Executable is located inside dist folder

### dev
 - ```yarn ci``` or ```yarn install``` (if not called already)
 - ```yarn dev```


## Application

This project was changed from racing game into duel game of two bots. (See old). 

### UI

Left side contains list of cards with best bots. Left side contains name of bot, blue bar with bonus and red bar with health. Right sides contains number of games bot played, number of bots wins, number of childrens (mutated compies of this bot) and steps from it's last game.
Right side contains player which replays duel of best two bots.


### Evolutionary algorithm 

First version of this project used game for one player. Newer version introduces duel game, which cause problems with evolving bots. Instead of incrementaly improving bots fitness and approximating some theoretical fitness boundary, bots was oscilating in low and high values. It was probably caused by switching between two (or possibly more) strategies, instead of improving existing ones.

Problem with oscilating was so unexpected for me and I didn't manage to find online solution for this kind of problem using neural nets and evolutinary algorithms. So I have used method which does not use generation but is pruning and creating new bot's in one same population (method probably called _live learning_ or similar). 

Despite the fact of using method of learning that better suits this particular game problem, training works best with used super parameters inside source of this project and even minor tweak in value of some of super parameters can make learning process fail. Suggested next step to improve learning process would be using some other machine learning method as meta learning to find best super parameters for this project.

Bot has _sensor*2 + 2_ neural net input values. Each sensor has type of detected object and range of that detection. Last two inputs are bots health and cooldown for shooting weapon.

#### Algorithm

Every bot has it's own health and bonus score. Bot's health is increased proportionally to health at end of each game. If bots health exceedes max-health, exceeding healths is added into bonus score instead. score is also increased when population is low (and lowered when population is high), so population can be kept in comfort range for training.

Algorithm step
 1) Select two random bots ramdomly. Using weighted random -> weight is increased by: steps from last game, wins and other bot properties.
 1) Play game with selected bots
 1) Increase/Lower their health base on game result.
 1) Transfer exceeding health into bonus.
 1) Remove bots with no health.
 1) Reset bonus metter and create mutated copy of bot for bots with maxed bonus

### Game

Each player is in his corner facing into center of map at start of each game. Bots has sensor attached asi inputs to their neural nets. Players health decreases each game step (motivation for bots to play aggressive -> faster the game is, lower the damage bot gets from game itself). Player can walk straight, rotate and shoot. Bullets can bounce and their damage is proportional to their speed. Motionless bullets are destroyed.


## old (racing) version documentation

Code documented in this section is already deleted. This documetation is only for comparisson with newer version of bot.

Learning steering car inside 2D using genetic algorithm

Every cas has:
 - neural net. 
 - 3 inputs: Left, Right, Forward.
 - 5 sensors measuring distance from nearest obstacle

Every neural net has it's score based on checkpoints reached.
Car that manages reach goal has score 100.



controls:
 - Maximum generation: max generation if no winner found
 - Population size: car count
 - Mutation rate: chance of change inside neural net
 - Weighted/Percent: type of selecting adepts to pass genes to next generation 
   - weighted: 
   - Percent: 
 - Hidden layers: every number represents number of neurons inside layer

Pressing Start will start algorithmic calculations (can take some time). Plot wiht maximal fitnesses is shown when algorithm is done running.

